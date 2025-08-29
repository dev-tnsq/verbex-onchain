// Core types for Verbex AI Assistant

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isError?: boolean;
  metadata?: {
    voiceUrl?: string;
    blockchainAction?: BlockchainAction;
    intent?: IntentAnalysis;
  };
}

export interface IntentAnalysis {
  requiresBlockchain: boolean;
  action?: string;
  parameters?: Record<string, any>;
  confidence: number;
  category: 'conversation' | 'blockchain' | 'deployment' | 'transfer' | 'swap' | 'query';
}

export interface BlockchainAction {
  type: 'deploy' | 'swap' | 'transfer' | 'query' | 'approve';
  contractAddress?: string;
  functionName?: string;
  parameters?: Record<string, any>;
  gasEstimate?: string;
  status: 'pending' | 'success' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
}

export interface GrokAIResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: string;
}

export interface VoiceChatRequest {
  audioData: string; // base64 encoded audio
  sessionId: string;
  language?: string;
}

export interface VoiceChatResponse {
  text: string;
  audioUrl?: string; // URL to generated speech audio
  confidence: number;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  context?: {
    previousMessages: Message[];
    userPreferences: UserPreferences;
    userPrivateKey?: `0x${string}`;
    smartAccountAddress?: string;
  };
}

export interface ChatResponse {
  response: string;
  intent: IntentAnalysis;
  blockchainAction?: BlockchainAction;
  audioUrl?: string;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  language: string;
  blockchainNetwork: string;
  autoConfirmTransactions: boolean;
  spendingLimit: string;
}

export interface Session {
  id: string;
  userId?: string;
  messages: Message[];
  preferences: UserPreferences;
  createdAt: Date;
  lastActivity: Date;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: Date;
}

export interface SmartContract {
  address: string;
  name: string;
  abi: any[];
  bytecode: string;
  deployedBy: string;
  deployedAt: Date;
  network: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  totalSupply: string;
  price?: string;
}

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
  recipient: string;
}

export interface TransferRequest {
  token: string;
  recipient: string;
  amount: string;
  gasless: boolean;
}

export interface DeployRequest {
  contractName: string;
  constructorArgs: any[];
  gasless: boolean;
  verifyOnEtherscan?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// WebSocket event types
export interface WebSocketEvents {
  'chat:message': (data: ChatRequest) => void;
  'chat:response': (data: ChatResponse) => void;
  'voice:start': (data: { sessionId: string }) => void;
  'voice:stop': (data: { sessionId: string }) => void;
  'voice:transcript': (data: VoiceChatResponse) => void;
  'blockchain:transaction': (data: BlockchainTransaction) => void;
  'blockchain:deployment': (data: SmartContract) => void;
} 