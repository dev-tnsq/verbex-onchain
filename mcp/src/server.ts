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
import { initDb } from './services/db';

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
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// WebSocket handlers
io.on('connection', (socket) => {
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