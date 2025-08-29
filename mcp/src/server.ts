import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import chatRoutes from './routes/chatRoutes';
import authRoutes from './routes/authRoutes';
import verbexAI from './services/verbexAI';
import { initDb, logMessage } from './services/db';
import voiceChatService from './services/voiceChat';
import { getOrCreateUserAccount } from './services/userAccounts';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
		methods: ['GET', 'POST']
	}
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// WebSocket handlers
io.on('connection', (socket) => {
	socket.on('voice:audio', async (payload: { sessionId: string; audioData: string; language?: string; userId?: string }) => {
		try {
			const { sessionId, audioData, language = 'en' } = payload || {};
			if (!audioData || !sessionId) return;
			const userId = payload.userId || sessionId;
			// STT
			const audioBuffer = Buffer.from(audioData, 'base64');
			const text = await voiceChatService.speechToText(audioBuffer, language);
			io.to(socket.id).emit('voice:transcribed', { sessionId, text });
			if (!text || !text.trim()) return;
			// AI + tools
			const { address: smartAccountAddress, privateKey } = await getOrCreateUserAccount(userId);
			const aiResponse = await verbexAI.processChatRequest({
				message: text,
				sessionId,
				context: {
					userPrivateKey: privateKey,
					smartAccountAddress,
					previousMessages: [],
					userPreferences: { voiceEnabled: true, language, blockchainNetwork: 'avalanche', autoConfirmTransactions: false, spendingLimit: '1000' }
				}
			});
			// TTS
			const audioOut = await voiceChatService.textToSpeech(aiResponse.response);
			const audioBase64 = audioOut.toString('base64');
			io.to(socket.id).emit('voice:reply', { sessionId, text: aiResponse.response, audioData: audioBase64, audioFormat: 'wav' });
			// Logs
			await logMessage(`${Date.now()}`, userId, 'user', `[VOICE] ${text}`);
			await logMessage(`${Date.now() + 1}`, userId, 'assistant', aiResponse.response);
		} catch (err: any) {
			io.to(socket.id).emit('voice:error', { message: err?.message || 'Voice processing failed' });
		}
	});

	socket.on('disconnect', () => {});
});

// Initialize Verbex AI service
async function initializeServices() {
	try {
		await initDb();
		await verbexAI.initialize();
		console.log('✅ Services initialized (DB, Agent)');
	} catch (error) {
		console.error('❌ Failed to initialize services:', error);
	}
}

const PORT = Number(process.env.PORT) || 3001;

// Start server
server.listen(PORT, async () => {
	console.log(`🚀 Verbex AI Assistant Backend running on port ${PORT}`);
	console.log(`📱 WebSocket server ready for real-time communication`);
	console.log(`🔗 API available at http://localhost:${PORT}/api`);
	console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
	await initializeServices();
});

export { app, io }; 