import { z } from 'zod';

export const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(8000, 'Message is too long'),
});

export const createConversationSchema = z.object({
  title: z.string().max(100).optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(100),
});
