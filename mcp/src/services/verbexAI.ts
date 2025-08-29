import { Agentkit, AgentkitToolkit } from '@0xgasless/agentkit';
import { Groq } from 'groq-sdk';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { avalanche, polygonAmoy } from 'viem/chains';
import { ChatRequest, ChatResponse, IntentAnalysis, BlockchainAction, UserPreferences } from '../types';
import { logMessage, logAction } from '../services/db';

class VerbexAIService {
	private groq!: Groq;
	private groqModel: string = 'openai/gpt-oss-20b';
	private isInitialized: boolean = false;

	constructor() {
		const apiKey = process.env.GROQ_API_KEY || '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';
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
		// Configure Agentkit with user's private key
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
				intent: {
					requiresBlockchain: false,
					confidence: 0,
					category: 'conversation'
				}
			};
		}

		try {
			// Get user preferences and smart account context
			const userPreferences = request.context?.userPreferences || {};
			const userPrivateKey = (request.context as any)?.userPrivateKey as `0x${string}`;
			const userSmartAccountAddress = (request.context as any)?.smartAccountAddress || '';
			const userChainId = (userPreferences as any)?.blockchainNetwork === 'avalanche' ? 43114 : 80001;

			if (!userPrivateKey || !userSmartAccountAddress) {
				throw new Error('Missing user wallet context');
			}

			// Create and initialize agent for this user
			const { agentkit, toolkit } = await this.createAndInitializeAgent(
				userPrivateKey,
				userChainId,
				userSmartAccountAddress,
				userPreferences
			);

			// Create system prompt with user context and available tools
			const systemPrompt = `You are Verbex, an AI assistant that helps users interact with blockchain through natural language.

User's Smart Account: ${userSmartAccountAddress}
Network: ${(userPreferences as any)?.blockchainNetwork || 'Avalanche C-Chain'}
Auto-confirm transactions: ${(userPreferences as any)?.autoConfirmTransactions ? 'Yes' : 'No'}
Spending limit: ${(userPreferences as any)?.spendingLimit || 'Unlimited'}

You have access to blockchain tools through the 0xGasless Agent Kit. When users ask to:
- Transfer tokens: Use the transfer tool
- Swap tokens: Use the swap tool  
- Query balances: Use the query tool
- Approve tokens: Use the approve tool
- Deploy contracts: Use the deploy tool

Always explain what you're doing before executing actions. Be helpful, clear, and prioritize user safety.

Available tools: ${toolkit.getTools().map((t: any) => t.name).join(', ')}`;

			// Call Groq API
			const chatCompletion = await this.groq.chat.completions.create({
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: request.message }
				],
				model: this.groqModel,
				temperature: 0.1,
				max_tokens: 8192,
				stream: false
			});

			const agentResponse = chatCompletion.choices[0]?.message?.content || '';

			// Log the interaction (using sessionId as userId for now)
			await logMessage(`${Date.now()}`, request.sessionId, 'user', request.message);
			await logMessage(`${Date.now() + 1}`, request.sessionId, 'assistant', agentResponse);

			return {
				response: agentResponse,
				intent: {
					requiresBlockchain: true,
					action: 'blockchain_action',
					confidence: 0.9,
					category: 'blockchain',
					parameters: {}
				}
			};

		} catch (error: any) {
			console.error('Error processing chat request:', error);
			return {
				response: 'Error processing request',
				intent: {
					requiresBlockchain: false,
					confidence: 0,
					category: 'conversation'
				}
			};
		}
	}

	async processVoiceRequest(audioData: Buffer, sessionId: string, userId: string): Promise<ChatResponse> {
		// For voice requests, we'll need to implement STT first
		// For now, return a placeholder response
		return {
			response: "Voice processing not yet implemented. Please use text chat for now.",
			intent: {
				requiresBlockchain: false,
				confidence: 0.5,
				category: 'conversation'
			}
		};
	}

	async getAvailableTools(): Promise<string[]> {
		// Return available tools for introspection
		return ['transfer', 'swap', 'query', 'approve', 'deploy'];
	}

	async getAddress(): Promise<string> {
		// Return a placeholder address for now
		return '0x0000000000000000000000000000000000000000';
	}

	async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
		return {
			status: this.isInitialized ? 'healthy' : 'unhealthy',
			services: {
				groq: this.isInitialized ? 'connected' : 'disconnected',
				agentkit: 'available'
			}
		};
	}
}

export default new VerbexAIService(); 