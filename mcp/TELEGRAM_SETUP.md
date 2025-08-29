# 🚀 Telegram Bot Setup Guide

## 📋 Prerequisites

Before setting up the Telegram bot, ensure you have:

1. ✅ **Node.js** (v18 or higher)
2. ✅ **PostgreSQL** database running
3. ✅ **Groq API key** from [groq.com](https://groq.com)
4. ✅ **0xGasless API key** from [0xgasless.com](https://0xgasless.com)
5. ✅ **Telegram Bot Token** (instructions below)

## 🔧 Step-by-Step Setup

### 1. **Install Dependencies**
```bash
cd mcp
npm install
```

### 2. **Create Telegram Bot**

#### **Option A: Through @BotFather**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name: `Verbex DeFi Assistant`
4. Choose a username: `verbex_defi_bot` (must end with 'bot')
5. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### **Option B: Through BotFather Web**
1. Visit [@BotFather](https://t.me/botfather) in your browser
2. Follow the same steps as above

### 3. **Environment Configuration**

Create a `.env` file in the `mcp` folder:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/verbex_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-8b-8192

# 0xGasless Configuration
ZEROXGASLESS_API_KEY=your_0xgasless_api_key_here
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
BUNDLER_URL=https://bundler.0xgasless.com/{chainId}

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. **Database Setup**

Ensure your PostgreSQL database is running and accessible:

```bash
# Check if PostgreSQL is running
psql -U username -d verbex_db -c "SELECT version();"

# If database doesn't exist, create it:
createdb -U username verbex_db
```

### 5. **Test the Bot**

#### **Start the Bot**
```bash
# Development mode (with auto-restart)
npm run bot:dev

# Production mode
npm run bot
```

#### **Expected Output**
```
🚀 Starting Verbex Telegram Bot...
📊 Initializing database...
✅ Database initialized
🤖 Initializing Verbex AI...
✅ Verbex AI initialized
📱 Starting Telegram bot...
🎉 Verbex Telegram Bot is now running!
📋 Available commands:
   /start - Initialize the bot
   /help - Show help message
   /balance - Check wallet balance
   /status - Show account status

💬 Users can now chat naturally with the bot to perform DeFi operations!
```

### 6. **Test Bot Commands**

1. **Open Telegram** and search for your bot username
2. **Send `/start`** to initialize
3. **Send your email** to connect wallet
4. **Try commands** like `/help`, `/balance`, `/status`

## 🧪 Testing Examples

### **Basic Interaction**
```
User: /start
Bot: 🚀 Welcome to Verbex, your DeFi AI assistant!
     I can help you with:
     • 💰 Check wallet balances
     • 🔄 Swap tokens
     • 📤 Transfer assets
     • 🎨 Mint NFTs
     • 📊 Read contracts
     • And much more!
     
     To get started, you'll need to connect your wallet. 
     Send me your email address to create or link your smart account.
     
     What would you like to do today? 😊
```

### **Wallet Connection**
```
User: user@example.com
Bot: 🔐 Setting up your wallet...
     ✅ New account created!
     🎉 Wallet Connected Successfully!
     
     💼 Smart Account: 0x123...
     🔗 Network: Avalanche
     💰 Ready for DeFi operations!
     
     Now you can:
     • Check balances
     • Swap tokens
     • Transfer assets
     • And much more!
     
     What would you like to do? 🚀
```

### **DeFi Operations**
```
User: Check my wallet balance
Bot: 🔍 Checking your wallet balance...
     💰 Wallet Balance
     
     Smart Account: 0x123...
     All Token Balances:
     AVAX: 0.500000
     USDC: 150.000000
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Bot Not Starting**
```bash
# Check environment variables
echo $TELEGRAM_BOT_TOKEN

# Check database connection
psql -U username -d verbex_db -c "SELECT 1;"

# Check logs for specific errors
npm run bot:dev
```

#### **2. Database Connection Failed**
```bash
# Verify DATABASE_URL format
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
psql "postgresql://username:password@localhost:5432/verbex_db"
```

#### **3. Telegram API Errors**
```bash
# Verify bot token is correct
# Check bot hasn't been deleted
# Ensure bot is not blocked
```

#### **4. Groq AI Errors**
```bash
# Verify GROQ_API_KEY is correct
# Check API quota/limits
# Test API key manually
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.groq.com/openai/v1/models
```

#### **5. 0xGasless Errors**
```bash
# Verify ZEROXGASLESS_API_KEY
# Check RPC_URL accessibility
# Test network connectivity
```

### **Debug Mode**
```bash
# Enable verbose logging
DEBUG=* npm run bot:dev

# Check specific components
DEBUG=telegram:* npm run bot:dev
DEBUG=groq:* npm run bot:dev
DEBUG=gasless:* npm run bot:dev
```

## 🔒 Security Considerations

### **Environment Variables**
- ✅ **Never commit** `.env` files to git
- ✅ **Use strong** JWT secrets
- ✅ **Rotate** API keys regularly
- ✅ **Limit** bot access to trusted users

### **Bot Security**
- ✅ **Enable** privacy mode in BotFather
- ✅ **Set** appropriate commands
- ✅ **Monitor** user interactions
- ✅ **Implement** rate limiting

### **Database Security**
- ✅ **Use** strong passwords
- ✅ **Limit** database access
- ✅ **Enable** SSL connections
- ✅ **Regular** backups

## 📊 Monitoring

### **Bot Health Checks**
```bash
# Check bot status
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Check webhook info
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

### **Log Monitoring**
```bash
# Follow bot logs
tail -f logs/telegram-bot.log

# Check error rates
grep "ERROR" logs/telegram-bot.log | wc -l
```

## 🚀 Production Deployment

### **PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start src/telegramBotLauncher.ts --name "verbex-bot"

# Monitor processes
pm2 status
pm2 logs verbex-bot

# Auto-restart on failure
pm2 startup
pm2 save
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "bot"]
```

## 📞 Support

- **Documentation**: This guide and `TELEGRAM_BOT_README.md`
- **Issues**: GitHub Issues
- **Community**: Telegram Group (coming soon)
- **Email**: support@verbex.ai

---

**🎉 Your Telegram bot is now ready to bring DeFi to the masses!** 