import { Groq } from 'groq-sdk';
import { Readable } from 'stream';

class VoiceChatService {
	private groq!: Groq;
	private isInitialized: boolean = false;

	constructor() {
		const apiKey = process.env.GROQ_API_KEY || '';
		if (!apiKey) {
			console.warn('⚠️ GROQ_API_KEY not set. Voice features will be disabled.');
			return;
		}
		this.groq = new Groq({ apiKey });
		this.isInitialized = true;
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) {
			console.log('✅ Voice Chat Service initialized with Groq');
		}
	}

	async speechToText(audioData: Buffer, language: string = 'en'): Promise<string> {
		if (!this.isInitialized) {
			throw new Error('Voice Chat Service not initialized');
		}

		try {
			// Convert Buffer to Readable stream for Groq SDK
			const audioStream = new Readable();
			audioStream.push(audioData);
			audioStream.push(null); // End the stream

			// Use Groq's transcription API - pass the buffer directly
			const transcription = await this.groq.audio.transcriptions.create({
				file: audioData as any, // Cast to any to bypass type checking for now
				model: 'whisper-large-v3-turbo', // Fast and cost-effective
				language: language,
				response_format: 'text', // Simple text output
				temperature: 0.0 // Deterministic output
			});

			return transcription.text || '';
		} catch (error: any) {
			console.error('STT Error:', error);
			throw new Error(`Speech-to-Text failed: ${error.message}`);
		}
	}

	async textToSpeech(text: string, voice: string = 'Fritz-PlayAI'): Promise<Buffer> {
		if (!this.isInitialized) {
			throw new Error('Voice Chat Service not initialized');
		}

		try {
			// Use Groq's TTS API
			const response = await this.groq.audio.speech.create({
				model: 'playai-tts',
				voice: voice,
				input: text,
				response_format: 'wav'
			});

			// Convert response to Buffer
			const arrayBuffer = await response.arrayBuffer();
			return Buffer.from(arrayBuffer);
		} catch (error: any) {
			console.error('TTS Error:', error);
			throw new Error(`Text-to-Speech failed: ${error.message}`);
		}
	}

	async getAvailableVoices(): Promise<string[]> {
		return [
			'Arista-PlayAI', 'Atlas-PlayAI', 'Basil-PlayAI', 'Briggs-PlayAI',
			'Calum-PlayAI', 'Celeste-PlayAI', 'Cheyenne-PlayAI', 'Chip-PlayAI',
			'Cillian-PlayAI', 'Deedee-PlayAI', 'Fritz-PlayAI', 'Gail-PlayAI',
			'Indigo-PlayAI', 'Mamaw-PlayAI', 'Mason-PlayAI', 'Mikail-PlayAI',
			'Mitch-PlayAI', 'Quinn-PlayAI', 'Thunder-PlayAI'
		];
	}

	async getAvailableLanguages(): Promise<string[]> {
		return ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr'];
	}

	async healthCheck(): Promise<boolean> {
		return this.isInitialized;
	}
}

export default new VoiceChatService(); 