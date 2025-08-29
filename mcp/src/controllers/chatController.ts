import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import verbexAI from '../services/verbexAI';
import voiceChatService from '../services/voiceChat';
import { getOrCreateUserAccount } from '../services/userAccounts';
import { logMessage } from '../services/db';

export async function processChatMessage(req: AuthedRequest, res: Response) {
	try {
		const { message, sessionId, context } = req.body;
		const userId = req.user?.id || sessionId;

		if (!message || !sessionId) {
			return res.status(400).json({ success: false, error: 'Missing message or sessionId' });
		}

		// Get or create user's smart account
		const { address: smartAccountAddress, privateKey } = await getOrCreateUserAccount(userId);

		// Process chat request with AI
		const response = await verbexAI.processChatRequest({
			message,
			sessionId,
			context: {
				...context,
				userPrivateKey: privateKey,
				smartAccountAddress,
				previousMessages: [],
				userPreferences: {
					voiceEnabled: true,
					language: 'en',
					blockchainNetwork: 'avalanche',
					autoConfirmTransactions: false,
					spendingLimit: '1000'
				}
			}
		});

		// Log the interaction
		await logMessage(`${Date.now()}`, userId, 'user', message);
		await logMessage(`${Date.now() + 1}`, userId, 'assistant', response.response);

		return res.json({ success: true, data: response });
	} catch (error: any) {
		console.error('Chat error:', error);
		return res.status(500).json({ success: false, error: error.message });
	}
}

export async function processVoiceMessage(req: AuthedRequest, res: Response) {
	try {
		const { audioData, sessionId, language = 'en' } = req.body;
		const userId = req.user?.id || sessionId;

		if (!audioData || !sessionId) {
			return res.status(400).json({ success: false, error: 'Missing audioData or sessionId' });
		}

		// Convert base64 to Buffer
		const audioBuffer = Buffer.from(audioData, 'base64');

		// Step 1: Speech to Text using Groq
		const transcribedText = await voiceChatService.speechToText(audioBuffer, language);

		// Step 2: Process with AI
		const { address: smartAccountAddress, privateKey } = await getOrCreateUserAccount(userId);
		const aiResponse = await verbexAI.processChatRequest({
			message: transcribedText,
			sessionId,
			context: {
				userPrivateKey: privateKey,
				smartAccountAddress,
				previousMessages: [],
				userPreferences: {
					voiceEnabled: true,
					language: language,
					blockchainNetwork: 'avalanche',
					autoConfirmTransactions: false,
					spendingLimit: '1000'
				}
			}
		});

		// Step 3: Text to Speech using Groq
		const audioBufferResponse = await voiceChatService.textToSpeech(aiResponse.response);

		// Convert audio buffer to base64 for response
		const audioBase64 = audioBufferResponse.toString('base64');

		// Log the voice interaction
		await logMessage(`${Date.now()}`, userId, 'user', `[VOICE] ${transcribedText}`);
		await logMessage(`${Date.now() + 1}`, userId, 'assistant', aiResponse.response);

		return res.json({
			success: true,
			data: {
				originalText: transcribedText,
				response: aiResponse.response,
				audioData: audioBase64,
				audioFormat: 'wav'
			}
		});
	} catch (error: any) {
		console.error('Voice processing error:', error);
		return res.status(500).json({ success: false, error: error.message });
	}
}

export async function getAvailableTools(req: AuthedRequest, res: Response) {
	try {
		const tools = await verbexAI.getAvailableTools();
		return res.json({ success: true, data: { tools } });
	} catch (error: any) {
		return res.status(500).json({ success: false, error: error.message });
	}
}

export async function getAddress(req: AuthedRequest, res: Response) {
	try {
		const address = await verbexAI.getAddress();
		return res.json({ success: true, data: { address } });
	} catch (error: any) {
		return res.status(500).json({ success: false, error: error.message });
	}
}

export async function healthCheck(req: AuthedRequest, res: Response) {
	try {
		const health = await verbexAI.healthCheck();
		return res.json({
			success: true,
			data: {
				status: health.status,
				services: health.services
			}
		});
	} catch (error: any) {
		return res.status(500).json({ success: false, error: error.message });
	}
} 