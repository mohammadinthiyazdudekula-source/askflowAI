import { Request, Response } from 'express';
import { chatRequestSchema } from '../utils/validation';
import { generateGeminiResponse } from '../services/geminiService';
import { getAuthenticatedSupabaseClient, isSupabaseConfigured } from '../services/supabaseService';
import { memoryConversations, memoryMessages } from './conversationController';

export async function handleChatMessage(req: Request, res: Response) {
  const userId = req.user?.id || 'demo-user-id-123';
  const token = req.token;

  // Validate request body using Zod
  const parseResult = chatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid message payload',
      details: parseResult.error.flatten(),
    });
  }

  const { message, conversationId: reqConversationId } = parseResult.data;
  let activeConversationId: string = reqConversationId || '';

  try {
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Ensure conversation exists or create one
    if (!activeConversationId) {
      const generatedTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;

      if (!isSupabaseConfigured() || !token) {
        activeConversationId = crypto.randomUUID();
        memoryConversations.unshift({
          id: activeConversationId,
          user_id: userId,
          title: generatedTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        const supabase = getAuthenticatedSupabaseClient(token);
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .insert([{ user_id: userId, title: generatedTitle }])
          .select()
          .single();

        if (convError || !convData) {
          activeConversationId = crypto.randomUUID();
          memoryConversations.unshift({
            id: activeConversationId,
            user_id: userId,
            title: generatedTitle,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          activeConversationId = convData.id;
        }
      }
    } else {
      // Fetch history for existing conversation
      if (!isSupabaseConfigured() || !token) {
        history = memoryMessages
          .filter((m) => m.conversation_id === activeConversationId)
          .map((m) => ({ role: m.role, content: m.content }));
      } else {
        const supabase = getAuthenticatedSupabaseClient(token);
        const { data: msgData } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true })
          .limit(20);

        if (msgData) {
          history = msgData.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
        }
      }
    }

    // Call Gemini API via @google/genai SDK
    const aiText = await generateGeminiResponse(message, history);

    // Save messages
    const now = new Date().toISOString();
    const userMsgId = crypto.randomUUID();
    const aiMsgId = crypto.randomUUID();

    if (!isSupabaseConfigured() || !token) {
      memoryMessages.push({
        id: userMsgId,
        conversation_id: activeConversationId,
        user_id: userId,
        role: 'user',
        content: message,
        created_at: now,
      });
      memoryMessages.push({
        id: aiMsgId,
        conversation_id: activeConversationId,
        user_id: userId,
        role: 'assistant',
        content: aiText,
        created_at: new Date().toISOString(),
      });
    } else {
      const supabase = getAuthenticatedSupabaseClient(token);
      await supabase.from('messages').insert([
        {
          conversation_id: activeConversationId,
          user_id: userId,
          role: 'user',
          content: message,
        },
        {
          conversation_id: activeConversationId,
          user_id: userId,
          role: 'assistant',
          content: aiText,
        },
      ]);

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversationId);
    }

    return res.json({
      conversationId: activeConversationId,
      userMessage: {
        id: userMsgId,
        role: 'user',
        content: message,
        created_at: now,
      },
      aiResponse: {
        id: aiMsgId,
        role: 'assistant',
        content: aiText,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Chat controller error:', error);
    return res.status(500).json({
      error: 'An error occurred while communicating with AskFlow AI',
      message: error?.message || 'Server error',
    });
  }
}
