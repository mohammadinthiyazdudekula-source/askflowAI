import { Request, Response } from 'express';
import { getAuthenticatedSupabaseClient, isSupabaseConfigured } from '../services/supabaseService';
import { createConversationSchema } from '../utils/validation';

// In-memory store for fallback/demo mode when Supabase DB is not yet set up
interface MemoryConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MemoryMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const memoryConversations: MemoryConversation[] = [
  {
    id: 'f8c3a1e2-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
    user_id: 'demo-user-id-123',
    title: 'Welcome to AskFlow AI',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const memoryMessages: MemoryMessage[] = [
  {
    id: 'msg-1',
    conversation_id: 'f8c3a1e2-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
    user_id: 'demo-user-id-123',
    role: 'assistant',
    content: 'Hello! I am **AskFlow AI**, powered by Google Gemini. How can I help you today?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function getConversations(req: Request, res: Response) {
  const userId = req.user?.id;
  const token = req.token;

  if (!isSupabaseConfigured() || !token) {
    const userConvs = memoryConversations.filter((c) => c.user_id === userId || userId === 'demo-user-id-123');
    return res.json({ conversations: userConvs });
  }

  try {
    const supabase = getAuthenticatedSupabaseClient(token);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Supabase DB fetch fallback (check migrations):', error.message);
      const userConvs = memoryConversations.filter((c) => c.user_id === userId || userId === 'demo-user-id-123');
      return res.json({ conversations: userConvs });
    }

    return res.json({ conversations: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
}

export async function getConversationStats(req: Request, res: Response) {
  const userId = req.user?.id;
  const token = req.token;

  if (!isSupabaseConfigured() || !token) {
    const totalCount = memoryConversations.filter((c) => c.user_id === userId || userId === 'demo-user-id-123').length;
    return res.json({ totalConversations: totalCount });
  }

  try {
    const supabase = getAuthenticatedSupabaseClient(token);
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      const totalCount = memoryConversations.filter((c) => c.user_id === userId || userId === 'demo-user-id-123').length;
      return res.json({ totalConversations: totalCount });
    }

    return res.json({ totalConversations: count || 0 });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch conversation statistics' });
  }
}

export async function createConversation(req: Request, res: Response) {
  const userId = req.user?.id || 'demo-user-id-123';
  const token = req.token;

  const parseResult = createConversationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data', details: parseResult.error.flatten() });
  }

  const title = parseResult.data.title || 'New Conversation';

  if (!isSupabaseConfigured() || !token) {
    const newConv: MemoryConversation = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryConversations.unshift(newConv);
    return res.status(201).json({ conversation: newConv });
  }

  try {
    const supabase = getAuthenticatedSupabaseClient(token);
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, title: title }])
      .select()
      .single();

    if (error) {
      console.warn('Supabase DB insert fallback:', error.message);
      const newConv: MemoryConversation = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryConversations.unshift(newConv);
      return res.status(201).json({ conversation: newConv });
    }

    return res.status(201).json({ conversation: data });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
}

export async function getMessages(req: Request, res: Response) {
  const { id: conversationId } = req.params;
  const token = req.token;

  if (!isSupabaseConfigured() || !token) {
    const msgs = memoryMessages.filter((m) => m.conversation_id === conversationId);
    return res.json({ messages: msgs });
  }

  try {
    const supabase = getAuthenticatedSupabaseClient(token);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      const msgs = memoryMessages.filter((m) => m.conversation_id === conversationId);
      return res.json({ messages: msgs });
    }

    return res.json({ messages: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve messages' });
  }
}

export async function deleteConversation(req: Request, res: Response) {
  const { id: conversationId } = req.params;
  const token = req.token;

  if (!isSupabaseConfigured() || !token) {
    const idx = memoryConversations.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      memoryConversations.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Conversation deleted' });
  }

  try {
    const supabase = getAuthenticatedSupabaseClient(token);
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, message: 'Conversation deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
}
