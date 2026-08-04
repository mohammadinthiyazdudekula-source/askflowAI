import { supabase } from './supabaseClient';
import { Conversation, Message, ChatResponse } from '../types/chat';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function getHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || '';

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/conversations`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }
    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('API Error (fetchConversations):', error);
    return [];
  }
}

export async function fetchConversationStats(): Promise<{ totalConversations: number }> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/conversations/stats`, { headers });
    if (!response.ok) {
      return { totalConversations: 0 };
    }
    const data = await response.json();
    return { totalConversations: data.totalConversations || 0 };
  } catch (error) {
    console.error('API Error (fetchConversationStats):', error);
    return { totalConversations: 0 };
  }
}

export async function createConversation(title?: string): Promise<Conversation> {
  const headers = await getHeaders();
  const response = await fetch(`${BACKEND_URL}/api/conversations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: title || 'New Conversation' }),
  });

  if (!response.ok) {
    throw new Error('Failed to create new conversation');
  }

  const data = await response.json();
  return data.conversation;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/messages`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('API Error (fetchMessages):', error);
    return [];
  }
}

export async function sendChatMessage(message: string, conversationId?: string): Promise<ChatResponse> {
  const headers = await getHeaders();
  const response = await fetch(`${BACKEND_URL}/api/chat/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to send chat message');
  }

  return await response.json();
}

export async function deleteConversationApi(conversationId: string): Promise<boolean> {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    console.error('API Error (deleteConversation):', error);
    return false;
  }
}
