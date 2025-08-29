import { Router } from 'express';
import { 
	processChatMessage, 
	processVoiceMessage, 
	getAvailableTools, 
	getAddress, 
	healthCheck 
} from '../controllers/chatController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Chat endpoints
router.post('/chat', requireAuth, processChatMessage);
router.post('/voice', requireAuth, processVoiceMessage);

// Utility endpoints
router.get('/tools', requireAuth, getAvailableTools);
router.get('/address', requireAuth, getAddress);
router.get('/health', healthCheck);

export default router; 