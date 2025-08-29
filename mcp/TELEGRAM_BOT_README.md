# 🤖 Verbex Telegram Bot

A powerful Telegram bot that allows users to perform DeFi operations through natural language conversations, powered by the 0xGasless Agent Kit and Groq AI.

## 🚀 Features

### **DeFi Operations**
- 💰 **Wallet Management**: Check balances, view token details
- 🔄 **Token Swaps**: Execute swaps across multiple protocols
- 📤 **Asset Transfers**: Send native tokens and ERC-20 tokens
- 🎨 **NFT Operations**: Mint and transfer NFTs
- 📊 **Smart Contracts**: Read contract data and check allowances
- ⚡ **Gasless Transactions**: All operations are completely gasless

### **AI-Powered Interface**
- 🧠 **Natural Language Processing**: Understand user intent through conversation
- 🤖 **Groq AI Integration**: Advanced language understanding and parameter extraction
- 💬 **Human-like Conversations**: Friendly, helpful, and safety-conscious responses
- 🔒 **Smart Confirmations**: Always confirm operations before execution

### **User Experience**
- 📱 **Telegram Integration**: Works seamlessly within Telegram
- 🔐 **Secure Wallet Connection**: Email-based wallet setup
- ⚙️ **Customizable Preferences**: Auto-confirm, spending limits, network selection
- 📊 **Real-time Status**: Transaction confirmations and status updates

## 🛠️ Setup Instructions

### 1. **Install Dependencies**
```bash
cd mcp
npm install
```

### 2. **Environment Variables**
Add these to your `.env` file:
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Existing variables (should already be set)
GROQ_API_KEY=your_groq_api_key
ZEROXGASLESS_API_KEY=your_0xgasless_api_key
RPC_URL=your_rpc_url
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

### 3. **Create Telegram Bot**
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name (e.g., "Verbex DeFi Assistant")
4. Choose a username (e.g., "verbex_defi_bot")
5. Copy the bot token and add it to your `.env` file

### 4. **Start the Bot**
```bash
# Production
npm run bot

# Development (with auto-restart)
npm run bot:dev
```

## 📱 How to Use

### **Getting Started**
1. **Start the bot**: Send `/start` to initialize
2. **Connect wallet**: Send your email address to link your wallet
3. **Start trading**: Chat naturally with the bot!

### **Available Commands**
- `/start` - Initialize the bot
- `/help` - Show comprehensive help
- `/balance` - Check wallet balance
- `/status` - Show account status

### **Natural Language Examples**

#### **Check Balances**
```
User: "Hey Verbex, what's in my wallet?"
Bot: 🔍 Checking your wallet balance...
     💰 Wallet Balance
     Smart Account: 0x123...
     All Token Balances:
     AVAX: 0.500000
     USDC: 150.000000
```

#### **Token Swaps**
```
User: "I want to swap 100 USDC to ETH"
Bot: 🔐 Confirm Operation
     📋 Action: Execute Token Swap
     💬 Request: "I want to swap 100 USDC to ETH"
     ⚠️ Please confirm this operation is correct.
     
     Reply "yes" to proceed or "no" to cancel.
```

#### **Asset Transfers**
```
User: "Send 50 USDC to 0xabc123..."
Bot: 🔐 Confirm Operation
     📋 Action: Transfer Assets
     💬 Request: "Send 50 USDC to 0xabc123..."
     ⚠️ Please confirm this operation is correct.
```

#### **NFT Operations**
```
User: "Mint an NFT from contract 0xdef456..."
Bot: 🔐 Confirm Operation
     📋 Action: Mint NFT
     💬 Request: "Mint an NFT from contract 0xdef456..."
     ⚠️ Please confirm this operation is correct.
```

## 🔧 Technical Architecture

### **Core Components**
1. **TelegramBot Service** (`src/services/telegramBot.ts`)
   - Handles Telegram API interactions
   - Manages user sessions and preferences
   - Routes user requests to appropriate tools

2. **AI Integration** (`src/services/verbexAI.ts`)
   - Groq AI for natural language understanding
   - Intent recognition and parameter extraction
   - Safety checks and confirmations

3. **DeFi Tools** (`src/services/tools.ts`)
   - 0xGasless Agent Kit integration
   - All blockchain operations (swaps, transfers, etc.)
   - Gasless transaction execution

4. **Smart Account Management** (`src/services/smartAccount.ts`)
   - ERC-4337 smart account creation
   - Private key management
   - Multi-chain support

### **Data Flow**
```
User Message → Telegram Bot → Groq AI → Intent Recognition → Tool Selection → Parameter Extraction → DeFi Execution → Result → User Response
```

### **Security Features**
- 🔐 **Email-based authentication**
- 💼 **Smart account isolation**
- ⚠️ **Operation confirmations**
- 💸 **Spending limits**
- 🔒 **Private key security**

## 🌐 Supported Networks

- **Avalanche** (Primary)
- **Polygon Amoy** (Testnet)
- **Ethereum** (Coming soon)
- **Arbitrum** (Coming soon)

## 🚨 Safety Features

### **Before Execution**
- ✅ **Intent confirmation**: Bot explains what it's about to do
- ✅ **Parameter validation**: All inputs are validated
- ✅ **Risk warnings**: Explains potential risks
- ✅ **User confirmation**: Requires explicit approval

### **During Execution**
- 🔍 **Transaction monitoring**: Real-time status updates
- ⚡ **Gasless execution**: No gas fees for users
- 📊 **Success confirmation**: Clear feedback on completion

### **Error Handling**
- ❌ **Graceful failures**: Clear error messages
- 🔄 **Retry mechanisms**: Automatic retry on failures
- 📝 **Detailed logging**: Comprehensive error tracking

## 📊 Monitoring & Analytics

### **Bot Metrics**
- User interactions per day
- Successful operations count
- Error rates and types
- Popular DeFi operations

### **DeFi Metrics**
- Total volume processed
- Gas savings for users
- Network usage statistics
- Token swap analytics

## 🔮 Future Enhancements

### **Planned Features**
- 🎯 **Advanced Trading**: Limit orders, DCA strategies
- 🔗 **Cross-chain Operations**: Seamless multi-chain interactions
- 📱 **Mobile App Integration**: Native mobile experience
- 🎨 **Custom Themes**: Personalized bot appearance
- 🌍 **Multi-language Support**: Global accessibility

### **Integration Opportunities**
- 📊 **Portfolio Tracking**: Real-time portfolio monitoring
- 📈 **Price Alerts**: Custom price notifications
- 🤝 **Social Trading**: Copy successful traders
- 🎯 **Yield Farming**: Automated yield optimization

## 🆘 Troubleshooting

### **Common Issues**

#### **Bot Not Responding**
```bash
# Check if bot is running
npm run bot

# Check logs for errors
# Verify TELEGRAM_BOT_TOKEN is correct
```

#### **Wallet Connection Failed**
```bash
# Check database connection
# Verify email format
# Check smart account creation logs
```

#### **DeFi Operations Failing**
```bash
# Check 0xGasless API key
# Verify RPC URL
# Check network connectivity
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run bot:dev
```

## 📞 Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Community**: Telegram Group (coming soon)
- **Email**: support@verbex.ai

## 📄 License

MIT License - see LICENSE file for details

---

**🚀 Ready to bring DeFi to the masses through Telegram!** 