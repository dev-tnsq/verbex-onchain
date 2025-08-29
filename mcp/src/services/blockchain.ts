import { Agentkit, AgentkitToolkit } from '@0xgasless/agentkit';
import { 
  BlockchainAction, 
  SwapRequest, 
  TransferRequest, 
  DeployRequest, 
  TokenInfo,
  BlockchainTransaction,
  SmartContract 
} from '../types';

class BlockchainService {
  private agentkit: Agentkit | null = null;
  private toolkit: AgentkitToolkit | null = null;
  private apiKey: string;
  private privateKey: string;
  private rpcUrl: string;
  private chainId: number;

  constructor() {
    this.apiKey = process.env.ZEROXGASLESS_API_KEY || '';
    this.privateKey = process.env.ZEROXGASLESS_PRIVATE_KEY || '';
    this.rpcUrl = process.env.RPC_URL || '';
    this.chainId = Number(process.env.CHAIN_ID) || 1;

    if (!this.apiKey || !this.privateKey || !this.rpcUrl) {
      throw new Error('0xGasless configuration is incomplete');
    }
  }

  /**
   * Initialize the 0xGasless Agent Kit
   */
  async initialize(): Promise<void> {
    try {
      this.agentkit = await Agentkit.configureWithWallet({
        privateKey: this.privateKey as `0x${string}`,
        rpcUrl: this.rpcUrl,
        apiKey: this.apiKey,
        chainID: this.chainId,
      });

      this.toolkit = new AgentkitToolkit(this.agentkit);
      console.log('0xGasless Agent Kit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize 0xGasless Agent Kit:', error);
      throw error;
    }
  }

  /**
   * Execute a blockchain action using 0xGasless Agent Kit
   */
  async executeAction(action: string, parameters: any): Promise<any> {
    try {
      if (!this.agentkit) {
        await this.initialize();
      }

      // Use the actual 0xGasless Agent Kit tools
      const tools = this.toolkit!.getTools();
      
      // Find the appropriate tool and execute it
      const tool = tools.find(t => t.name === action);
      if (!tool) {
        throw new Error(`Action '${action}' not found in available tools`);
      }

      const result = await tool.invoke(parameters);
      return result;
    } catch (error) {
      console.error('Blockchain action error:', error);
      throw error;
    }
  }

  /**
   * Get smart account address
   */
  async getAddress(): Promise<string> {
    try {
      if (!this.agentkit) {
        await this.initialize();
      }
      
      const address = await this.agentkit!.getAddress();
      return address;
    } catch (error) {
      console.error('Error getting address:', error);
      throw error;
    }
  }

  /**
   * Get available actions from 0xGasless Agent Kit
   */
  async getAvailableActions(): Promise<string[]> {
    try {
      if (!this.toolkit) {
        await this.initialize();
      }

      const tools = this.toolkit!.getTools();
      return tools.map(tool => tool.name);
    } catch (error) {
      console.error('Error getting available actions:', error);
      throw error;
    }
  }

  /**
   * Execute smart swap using 0xGasless Agent Kit
   */
  async executeSmartSwap(params: SwapRequest): Promise<any> {
    return await this.executeAction('smart_swap', {
      tokenInSymbol: params.fromToken,
      tokenOutSymbol: params.toToken,
      amount: params.amount,
      slippage: params.slippage.toString(),
      wait: true
    });
  }

  /**
   * Execute smart transfer using 0xGasless Agent Kit
   */
  async executeSmartTransfer(params: TransferRequest): Promise<any> {
    return await this.executeAction('smart_transfer', {
      tokenSymbol: params.token,
      recipient: params.recipient,
      amount: params.amount
    });
  }

  /**
   * Get balance using 0xGasless Agent Kit
   */
  async getBalance(tokenSymbols: string[]): Promise<any> {
    return await this.executeAction('get_balance', {
      tokenSymbols: tokenSymbols
    });
  }

  /**
   * Check transaction status using 0xGasless Agent Kit
   */
  async checkTransaction(txHash: string): Promise<any> {
    return await this.executeAction('check_transaction', {
      transactionHash: txHash
    });
  }

  /**
   * Get token details using 0xGasless Agent Kit
   */
  async getTokenDetails(tokenAddress: string): Promise<any> {
    return await this.executeAction('get_token_details', {
      tokenAddress: tokenAddress
    });
  }
}

export default new BlockchainService(); 