import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/message', handleChatMessage);

export default router;
