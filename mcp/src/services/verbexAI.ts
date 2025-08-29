import { Agentkit, AgentkitToolkit } from '@0xgasless/agentkit';
import { Groq } from 'groq-sdk';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { avalanche, polygonAmoy } from 'viem/chains';
import { ChatRequest, ChatResponse } from '../types';
import { logMessage } from '../services/db';
import { toolsSchema, dispatchToolCall } from './tools';
import voiceChatService from './voiceChat';

class VerbexAIService {
	private groq!: Groq;
	private groqModel: string = 'openai/gpt-oss-20b';
	private isInitialized: boolean = false;

	constructor() {
		const apiKey = process.env.GROQ_API_KEY || '';
		if (!apiKey) {
			console.warn('⚠️ GROQ_API_KEY not set. Groq AI features will be disabled.');
			return;
		}
		this.groq = new Groq({ apiKey });
		this.isInitialized = true;
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) {
			console.log('✅ Verbex AI LLM initialized with Groq');
		}
	}

	private async createAndInitializeAgent(userPrivateKey: `0x${string}`, userChainId: number, userSmartAccountAddress: string, userPreferences: any): Promise<any> {
		const account = privateKeyToAccount(userPrivateKey);
		const client = createWalletClient({
			account,
			chain: userChainId === 43114 ? avalanche : polygonAmoy,
			transport: http()
		});

		const agentkit = await Agentkit.configureWithWallet({
			privateKey: userPrivateKey,
			rpcUrl: process.env.RPC_URL as string,
			apiKey: process.env.ZEROXGASLESS_API_KEY as string,
			chainID: userChainId
		});

		const toolkit = new AgentkitToolkit(agentkit);
		return { agentkit, toolkit };
	}

	async processChatRequest(request: ChatRequest): Promise<ChatResponse> {
		if (!this.isInitialized) {
			return {
				response: 'Voice and AI are temporarily unavailable. Please set GROQ_API_KEY on the server and retry.',
				intent: { requiresBlockchain: false, confidence: 0, category: 'conversation' }
			};
		}

		try {
			const userPreferences = request.context?.userPreferences || {};
			// Defaults: voice enabled by default, avalanche network, no auto-confirm
			(userPreferences as any).voiceEnabled = (userPreferences as any).voiceEnabled ?? true;
			(userPreferences as any).blockchainNetwork = (userPreferences as any).blockchainNetwork ?? 'avalanche';
			(userPreferences as any).autoConfirmTransactions = (userPreferences as any).autoConfirmTransactions ?? false;
			(userPreferences as any).spendingLimit = (userPreferences as any).spendingLimit ?? '1000';

			const userPrivateKey = (request.context as any)?.userPrivateKey as `0x${string}`;
			const userSmartAccountAddress = (request.context as any)?.smartAccountAddress || '';
			const userChainId = (userPreferences as any)?.blockchainNetwork === 'avalanche' ? 43114 : 80001;
			const preferredLanguage = (userPreferences as any)?.language || null;

			if (!userPrivateKey || !userSmartAccountAddress) {
				throw new Error('Missing user wallet context');
			}

			const { agentkit, toolkit } = await this.createAndInitializeAgent(
				userPrivateKey,
				userChainId,
				userSmartAccountAddress,
				userPreferences
			);

			const systemPrompt = `You are Verbex, an AI assistant that can interact onchain using 0xGasless AgentKit tools.
- STRICT: Always reply in the same language as the latest user message. Auto-detect their language from input and mirror it exactly. Do not switch languages unless asked.
- If a preferred UI language is provided (${preferredLanguage ?? 'none'}), use it only if it matches the user's message language.
- When a user asks for balances, call get_balance. To show their wallet, call get_address. Explain actions before executing risky operations.
- Keep tool outputs, numbers, and on-chain data accurate; translate only the surrounding explanation to the user's language.`;

			const toolsForGroq = toolsSchema.map(t => ({
				type: 'function' as const,
				function: {
					name: t.name,
					description: t.description,
					parameters: t.parameters,
				},
			}));

			const chatCompletion = await this.groq.chat.completions.create({
				messages: [
					{ role: 'system', content: systemPrompt },
					preferredLanguage ? { role: 'system', content: `If it does not conflict with user input, prefer responding in ${preferredLanguage}.` } as any : undefined,
					{ role: 'user', content: request.message }
				].filter(Boolean) as any,
				model: this.groqModel,
				temperature: 0.2,
				max_tokens: 2048,
				stream: false,
				tools: toolsForGroq as any,
				tool_choice: 'auto' as any,
			});

			const choice = chatCompletion.choices[0];
			const message: any = choice?.message || {};
			if (message.tool_calls && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
				const call = message.tool_calls[0];
				const name = call.function?.name;
				const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
				const toolResult = await dispatchToolCall(name, args, {
					userPrivateKey,
					network: (userPreferences as any)?.blockchainNetwork || 'avalanche',
					smartAccountAddress: userSmartAccountAddress,
				});

				// Localize tool output to user's language based on their last message
				let localized = '';
				try {
					const explain = await this.groq.chat.completions.create({
						messages: [
							{ role: 'system', content: 'You are a helpful assistant. Read the tool output and explain it concisely in the SAME LANGUAGE as the following user message. Keep numbers, addresses, and hashes exactly unchanged.' },
							{ role: 'user', content: `User message: ${request.message}` },
							{ role: 'user', content: `Tool output: ${typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)}` },
						],
						model: this.groqModel,
						temperature: 0.2,
						max_tokens: 600,
					});
					localized = explain.choices?.[0]?.message?.content || '';
				} catch {}

				const finalResponseText = localized || (typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult));

				// Optional TTS generation (match user language implicitly via text)
				let audioBase64: string | undefined;
				try {
					if ((userPreferences as any).voiceEnabled) {
						const audioBuf = await voiceChatService.textToSpeech(finalResponseText);
						audioBase64 = audioBuf.toString('base64');
					}
				} catch {}

				await logMessage(`${Date.now()}`, request.sessionId, 'user', request.message);
				await logMessage(`${Date.now() + 1}`, request.sessionId, 'assistant', finalResponseText);
				return ({
					response: finalResponseText,
					audioData: audioBase64,
					audioFormat: audioBase64 ? 'wav' : undefined,
					intent: { requiresBlockchain: true, action: name, confidence: 0.9, category: 'blockchain', parameters: args }
				} as unknown) as ChatResponse;
			}

			const agentResponse = message?.content || 'I could not determine an action.';

			// Optional TTS for plain responses
			let audioBase64: string | undefined;
			try {
				if ((userPreferences as any).voiceEnabled) {
					const audioBuf = await voiceChatService.textToSpeech(agentResponse);
					audioBase64 = audioBuf.toString('base64');
				}
			} catch {}

			await logMessage(`${Date.now()}`, request.sessionId, 'user', request.message);
			await logMessage(`${Date.now() + 1}`, request.sessionId, 'assistant', agentResponse);
			return ({
				response: agentResponse,
				audioData: audioBase64,
				audioFormat: audioBase64 ? 'wav' : undefined,
				intent: { requiresBlockchain: false, confidence: 0.3, category: 'conversation' }
			} as unknown) as ChatResponse;

		} catch (error: any) {
			console.error('Error processing chat request:', error);
			return {
				response: `Error: ${error?.message || 'failed to process'}`,
				intent: { requiresBlockchain: false, confidence: 0, category: 'conversation' }
			};
		}
	}

	async getAvailableTools(): Promise<string[]> {
		return toolsSchema.map(t => t.name);
	}

	async getAddress(): Promise<string> {
		return '0x0000000000000000000000000000000000000000';
	}

	async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
		return { status: this.isInitialized ? 'healthy' : 'unhealthy', services: { groq: this.isInitialized ? 'connected' : 'disconnected', agentkit: 'available' } };
	}
}

export default new VerbexAIService(); 