import { Router } from 'express';
import {
  getConversations,
  getConversationStats,
  createConversation,
  getMessages,
  deleteConversation,
} from '../controllers/conversationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply Auth Middleware to all conversation routes
router.use(authMiddleware);

router.get('/', getConversations);
router.get('/stats', getConversationStats);
router.post('/', createConversation);
router.get('/:id/messages', getMessages);
router.delete('/:id', deleteConversation);

export default router;
