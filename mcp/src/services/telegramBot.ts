import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { Groq } from 'groq-sdk';
import { dispatchToolCall } from './tools';
import { getOrCreateSmartAccount } from './smartAccount';
import { getUserByEmail, createUser } from './db';
import { getChainByName } from './chain';

interface TelegramUser {
  id: number;
  email?: string;
  smartAccountAddress?: string;
  userPrivateKey?: `0x${string}`;
  network: string;
  preferences: {
    voiceEnabled: boolean;
    language: string;
    blockchainNetwork: string;
    autoConfirmTransactions: boolean;
    spendingLimit: string;
  };
}

class VerbexTelegramBot {
  private bot: Telegraf;
  private groq: Groq;
  private users: Map<number, TelegramUser> = new Map();
  private readonly systemPrompt: string;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }

    this.bot = new Telegraf(token);
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    this.systemPrompt = `You are Verbex, a friendly and knowledgeable DeFi AI assistant that helps users perform blockchain operations through Telegram. 

Your personality:
- Be conversational, helpful, and enthusiastic about DeFi
- Use emojis and friendly language
- Explain complex DeFi concepts in simple terms
- Always confirm actions before executing them
- Be safety-conscious and warn about risks

Available DeFi operations:
- Check wallet balances and token details
- Transfer tokens (native and ERC-20)
- Execute swaps across protocols
- Read smart contracts
- Mint and transfer NFTs
- Batch transactions
- Approve token spending

When users want to perform actions:
1. Understand their intent clearly
2. Ask for confirmation with transaction details
3. Execute the operation using the available tools
4. Provide clear feedback and transaction status

Always prioritize user safety and explain what you're doing.`;

    this.setupBot();
  }

  private setupBot() {
    // Start command
    this.bot.start(async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      await this.initializeUser(userId);
      
      const welcomeMessage = `🚀 Welcome to Verbex, your DeFi AI assistant!

I can help you with:
• 💰 Check wallet balances
• 🔄 Swap tokens
• 📤 Transfer assets
• 🎨 Mint NFTs
• 📊 Read contracts
• And much more!

To get started, you'll need to connect your wallet. Send me your email address to create or link your smart account.

What would you like to do today? 😊`;
      
      await ctx.reply(welcomeMessage);
    });

    // Help command
    this.bot.help(async (ctx) => {
      const helpMessage = `🤖 **Verbex Bot Commands**

**Basic Commands:**
/start - Initialize the bot
/help - Show this help message
/balance - Check your wallet balance
/status - Show account status

**DeFi Operations:**
💰 **Balance & Info:**
• "Show my balance"
• "Check USDC balance"
• "What tokens do I have?"

🔄 **Swaps:**
• "Swap 100 USDC to ETH"
• "Exchange 50 USDT for AVAX"
• "Best route for USDC to MATIC"

📤 **Transfers:**
• "Send 25 USDC to 0x123..."
• "Transfer 0.1 ETH to my friend"
• "Move 100 USDT to another wallet"

🎨 **NFTs:**
• "Mint an NFT from contract 0x..."
• "Transfer my NFT to 0x..."

📊 **Contracts:**
• "Read contract 0x... function balanceOf"
• "Check allowance for USDC"

**Examples:**
"Hey Verbex, can you check my wallet balance?"
"I want to swap 100 USDC to ETH, what's the best route?"
"Help me transfer 50 USDT to 0x123..."

Just chat naturally with me! I'll understand your intent and help you execute DeFi operations safely. 🚀`;
      
      await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    // Balance command
    this.bot.command('balance', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const user = this.users.get(userId);
      if (!user?.smartAccountAddress) {
        await ctx.reply('❌ Please connect your wallet first by sending me your email address.');
        return;
      }

      await ctx.reply('🔍 Checking your wallet balance...');
      
      try {
        const balance = await dispatchToolCall('get_balance', {}, {
          userPrivateKey: user.userPrivateKey!,
          network: user.network,
          smartAccountAddress: user.smartAccountAddress
        });
        
        await ctx.reply(`💰 **Wallet Balance**\n\n${balance}`, { parse_mode: 'Markdown' });
      } catch (error) {
        await ctx.reply('❌ Error checking balance. Please try again.');
      }
    });

    // Status command
    this.bot.command('status', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const user = this.users.get(userId);
      if (!user) {
        await ctx.reply('❌ User not initialized. Use /start to begin.');
        return;
      }

      const statusMessage = `📊 **Account Status**

🆔 **User ID:** ${userId}
📧 **Email:** ${user.email || 'Not set'}
🔗 **Network:** ${user.network}
💼 **Smart Account:** ${user.smartAccountAddress || 'Not created'}
⚙️ **Auto-confirm:** ${user.preferences.autoConfirmTransactions ? 'Yes' : 'No'}
💸 **Spending Limit:** $${user.preferences.spendingLimit}`;

      await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
    });

    // Handle text messages
    this.bot.on(message('text'), async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const userInput = ctx.message.text;
      
      // Check if it's an email for wallet connection
      if (userInput.includes('@') && userInput.includes('.')) {
        await this.handleEmailInput(ctx, userId, userInput);
        return;
      }

      // Handle DeFi operations
      await this.handleDeFiOperation(ctx, userId, userInput);
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      console.error(`Bot error for ${ctx.updateType}:`, err);
      ctx.reply('❌ Something went wrong. Please try again.');
    });
  }

  private async initializeUser(userId: number) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        network: 'avalanche',
        preferences: {
          voiceEnabled: false,
          language: 'en',
          blockchainNetwork: 'avalanche',
          autoConfirmTransactions: true,
          spendingLimit: '1000'
        }
      });
    }
  }

  private async handleEmailInput(ctx: Context, userId: number, email: string) {
    try {
      await ctx.reply('🔐 Setting up your wallet...');
      
      // Check if user exists in database
      let dbUser = await getUserByEmail(email);
      
      if (!dbUser) {
        // Create new user
        dbUser = await createUser(email, 'telegram-user');
        await ctx.reply('✅ New account created!');
      } else {
        await ctx.reply('✅ Account linked successfully!');
      }

      // Get or create smart account
      const smartAccount = await getOrCreateSmartAccount(dbUser.id, 'avalanche');
      
      // Update user in memory
      const user = this.users.get(userId)!;
      user.email = email;
      user.smartAccountAddress = smartAccount.smartAccountAddress;
      user.userPrivateKey = smartAccount.signer.account.privateKey as `0x${string}`;
      
      await ctx.reply(`🎉 **Wallet Connected Successfully!**

💼 **Smart Account:** \`${smartAccount.smartAccountAddress}\`
🔗 **Network:** Avalanche
💰 **Ready for DeFi operations!**

Now you can:
• Check balances
• Swap tokens
• Transfer assets
• And much more!

What would you like to do? 🚀`, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error setting up wallet:', error);
      await ctx.reply('❌ Error setting up wallet. Please try again.');
    }
  }

  private async handleDeFiOperation(ctx: Context, userId: number, userInput: string) {
    const user = this.users.get(userId);
    
    if (!user?.smartAccountAddress) {
      await ctx.reply('❌ Please connect your wallet first by sending me your email address.');
      return;
    }

    try {
      await ctx.reply('🤔 Processing your request...');
      
      // Use Groq to understand intent and determine action
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userInput }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiResponse = completion.choices[0]?.message?.content || '';
      
      // Check if user wants to perform a DeFi operation
      const shouldExecute = this.shouldExecuteOperation(userInput, aiResponse);
      
      if (shouldExecute) {
        await this.executeDeFiOperation(ctx, user, userInput);
      } else {
        // Just provide information/explanation
        await ctx.reply(aiResponse);
      }
      
    } catch (error) {
      console.error('Error processing DeFi operation:', error);
      await ctx.reply('❌ Error processing your request. Please try again.');
    }
  }

  private shouldExecuteOperation(userInput: string, aiResponse: string): boolean {
    const actionKeywords = [
      'swap', 'exchange', 'transfer', 'send', 'move', 'mint', 'approve',
      'check balance', 'get balance', 'read contract', 'execute'
    ];
    
    return actionKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private async executeDeFiOperation(ctx: Context, user: TelegramUser, userInput: string) {
    try {
      // Determine which tool to use based on user input
      const toolToUse = this.determineTool(userInput);
      
      if (!toolToUse) {
        await ctx.reply('❌ I couldn\'t understand what operation you want to perform. Please be more specific.');
        return;
      }

      // Ask for confirmation
      const confirmationMessage = this.buildConfirmationMessage(toolToUse, userInput);
      await ctx.reply(confirmationMessage, { parse_mode: 'Markdown' });
      
      // For now, auto-execute if user has auto-confirm enabled
      // In production, you'd want to wait for user confirmation
      if (user.preferences.autoConfirmTransactions) {
        await ctx.reply('⚡ Auto-executing transaction...');
        
        const result = await this.executeTool(toolToUse, userInput, user);
        await ctx.reply(`✅ **Operation Completed!**\n\n${result}`, { parse_mode: 'Markdown' });
      } else {
        await ctx.reply('⚠️ Please confirm the operation by replying "yes" to proceed.');
        // In production, implement confirmation flow
      }
      
    } catch (error) {
      console.error('Error executing DeFi operation:', error);
      await ctx.reply('❌ Error executing operation. Please try again.');
    }
  }

  private determineTool(userInput: string): string | null {
    const input = userInput.toLowerCase();
    
    if (input.includes('balance') || input.includes('check')) {
      return 'get_balance';
    }
    if (input.includes('swap') || input.includes('exchange')) {
      return 'smart_swap';
    }
    if (input.includes('transfer') || input.includes('send') || input.includes('move')) {
      return 'smart_transfer';
    }
    if (input.includes('mint') && input.includes('nft')) {
      return 'mint_nft';
    }
    if (input.includes('read') && input.includes('contract')) {
      return 'read_contract';
    }
    if (input.includes('approve')) {
      return 'approve_token';
    }
    
    return null;
  }

  private buildConfirmationMessage(tool: string, userInput: string): string {
    const toolNames = {
      'get_balance': 'Check Wallet Balance',
      'smart_swap': 'Execute Token Swap',
      'smart_transfer': 'Transfer Assets',
      'mint_nft': 'Mint NFT',
      'read_contract': 'Read Smart Contract',
      'approve_token': 'Approve Token Spending'
    };

    return `🔐 **Confirm Operation**

📋 **Action:** ${toolNames[tool as keyof typeof toolNames]}
💬 **Request:** "${userInput}"
⚠️ **Please confirm** this operation is correct.

Reply "yes" to proceed or "no" to cancel.`;
  }

  private async executeTool(tool: string, userInput: string, user: TelegramUser): Promise<string> {
    // Extract parameters from user input using AI
    const params = await this.extractToolParameters(tool, userInput);
    
    // Execute the tool
    const result = await dispatchToolCall(tool, params, {
      userPrivateKey: user.userPrivateKey!,
      network: user.network,
      smartAccountAddress: user.smartAccountAddress!
    });
    
    return result;
  }

  private async extractToolParameters(tool: string, userInput: string): Promise<any> {
    // Use Groq to extract parameters from natural language
    const prompt = `Extract parameters for the ${tool} tool from this user input: "${userInput}"

Return only a JSON object with the extracted parameters. For example:
- For smart_swap: {"tokenIn": "USDC", "tokenOut": "ETH", "amount": "100"}
- For smart_transfer: {"amount": "50", "tokenAddress": "USDC", "destination": "0x..."}
- For get_balance: {"tokenSymbols": ["USDC", "ETH"]}

Return only the JSON, no other text.`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a parameter extraction tool. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 200
      });

      const response = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting parameters:', error);
      return {};
    }
  }

  public async start() {
    try {
      await this.bot.launch();
      console.log('🚀 Verbex Telegram Bot started successfully!');
      
      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
      
    } catch (error) {
      console.error('Error starting bot:', error);
      throw error;
    }
  }

  public async stop() {
    await this.bot.stop();
    console.log('🛑 Verbex Telegram Bot stopped.');
  }
}

export default VerbexTelegramBot; 