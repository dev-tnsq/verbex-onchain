# Verbex AI - Production README

## 🚀 Overview

Verbex AI is a production-grade AI assistant that brings blockchain interactions to the masses through natural language and voice commands. Built with React Native (Expo), Node.js backend, and integrated with 0xGasless Agent Kit and Groq AI, it provides a ChatGPT-like voice experience for blockchain operations.

## ✨ Features

### 🎤 Voice-First Interface
- **Real-time Voice Chat**: ChatGPT-like voice interface with animated orb
- **Speech-to-Text**: Powered by Groq AI Whisper models
- **Text-to-Speech**: High-quality TTS with multiple voice options
- **Voice Activity Detection**: Automatic recording start/stop
- **Barge-in Support**: Interrupt AI responses with voice commands

### 🤖 AI-Powered Blockchain Operations
- **Natural Language Processing**: Groq AI for intent recognition
- **Autonomous Tool Selection**: AI decides which blockchain functions to call
- **Smart Contract Deployment**: AI can deploy contracts when needed
- **Gasless Transactions**: 0xGasless Agent Kit integration
- **Multi-chain Support**: Avalanche C-Chain, Polygon, Ethereum

### 🔐 Security & Authentication
- **Per-User Smart Accounts**: Each user gets their own ERC-4337 smart account
- **JWT Authentication**: Secure session management
- **Private Key Management**: User-specific wallet creation
- **Transaction Signing**: Secure blockchain operations

### 📱 Mobile-First Design
- **React Native (Expo)**: Cross-platform mobile app
- **Modern UI/UX**: Dark theme with smooth animations
- **Responsive Design**: Optimized for all screen sizes
- **Offline Support**: Graceful degradation when offline

## 🏗️ Architecture

### Backend (`/mcp`)
```
src/
├── controllers/          # API endpoint handlers
├── middleware/          # Authentication & validation
├── routes/             # Express.js route definitions
├── services/           # Business logic & external integrations
│   ├── verbexAI.ts    # Main AI service (Groq + Agent Kit)
│   ├── voiceChat.ts   # STT/TTS service (Groq)
│   ├── userAccounts.ts # Smart account management
│   └── db.ts          # Database operations
├── types/              # TypeScript type definitions
└── server.ts           # Express.js server entry point
```

### Frontend (`/verbex`)
```
app/
├── (tabs)/             # Main tab navigation
│   ├── index.tsx       # Chat interface
│   ├── voice.tsx       # Voice tab redirect
│   └── two.tsx         # Settings
├── (voice)/            # Voice interface
│   └── index.tsx       # Main voice screen
└── lib/                # Shared utilities
    ├── api.ts          # HTTP client & API calls
    └── auth.ts         # Authentication utilities
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Provider**: Groq AI (LLM, STT, TTS)
- **Blockchain**: 0xGasless Agent Kit + Viem
- **Database**: PostgreSQL (with SQLite fallback)
- **Authentication**: JWT
- **Real-time**: Socket.IO

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Animations**: React Native Reanimated
- **Audio**: Expo AV
- **Storage**: AsyncStorage
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Expo CLI (`npm install -g @expo/cli`)
- PostgreSQL (optional, SQLite fallback available)
- Groq AI API key
- 0xGasless API key

### 1. Clone & Setup
```bash
git clone <repository-url>
cd verbexAI-onchain
```

### 2. Backend Setup
```bash
cd mcp
yarn install
cp .env.example .env
# Edit .env with your API keys
yarn dev
```

### 3. Frontend Setup
```bash
cd ../verbex
yarn install
# .env already created with backend URL
yarn start
```

### 4. Environment Variables
```bash
# Backend (.env)
GROQ_API_KEY=your_groq_api_key
ZEROXGASLESS_API_KEY=your_0xgasless_key
RPC_URL=your_rpc_endpoint
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/verbex

# Frontend (.env) - Auto-created
API_BASE_URL=http://localhost:3001/api
```

## 🔧 Configuration

### Groq AI Models
- **LLM**: `openai/gpt-oss-20b` (fast, cost-effective)
- **STT**: `whisper-large-v3-turbo` (multilingual, fast)
- **TTS**: `playai-tts` (high-quality, 19 English voices)

### Blockchain Networks
- **Primary**: Avalanche C-Chain (CHAIN_ID: 43114)
- **Secondary**: Polygon Amoy (testnet)
- **Fallback**: Ethereum mainnet

### Smart Account Features
- **Standard**: ERC-4337 Account Abstraction
- **Gas Sponsorship**: 0xGasless paymaster
- **Bundling**: 0xGasless bundler
- **Recovery**: Social recovery mechanisms

## 📱 Usage

### Voice Commands
1. **Tap & Hold** the microphone button
2. **Speak naturally** about what you want to do
3. **Release** to send your command
4. **Listen** to AI response and confirmation

### Example Commands
- "Transfer 100 USDC to 0x1234..."
- "Swap 50 AVAX for USDC"
- "Show my token balances"
- "Deploy a simple NFT contract"
- "Approve USDC spending for Uniswap"

### Text Chat
- Use the **Chat tab** for text-based interactions
- Same AI capabilities as voice
- Better for complex queries and documentation

## 🔒 Security Features

### Authentication
- JWT tokens with configurable expiration
- Automatic token refresh
- Secure token storage in AsyncStorage

### Blockchain Security
- Per-user private key derivation
- No shared server keys
- Transaction signing on user device
- Gas limit enforcement
- Slippage protection

### Data Protection
- Encrypted database connections
- Secure API endpoints
- Input validation and sanitization
- Rate limiting and abuse prevention

## 🧪 Testing

### Backend Tests
```bash
cd mcp
yarn test
```

### Frontend Tests
```bash
cd verbex
yarn test
```

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Authentication
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@verbex.com","password":"password123"}'

# Chat
curl -X POST http://localhost:3001/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Show my balances","sessionId":"test123"}'
```

## 📊 Monitoring & Observability

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance metrics

### Health Checks
- Service health endpoints
- Database connectivity
- External API status
- Blockchain network status

### Metrics
- Request volume and latency
- Voice processing times
- Blockchain transaction success rates
- User engagement metrics

## 🚀 Deployment

### Backend Deployment
```bash
cd mcp
yarn build
yarn start:prod
```

### Frontend Deployment
```bash
cd verbex
expo build:android  # Android APK
expo build:ios      # iOS IPA
expo publish        # Expo Go app
```

### Environment Setup
- Production database (PostgreSQL)
- Redis for caching
- Load balancer configuration
- SSL/TLS certificates
- Domain and DNS setup

## 🔄 Updates & Maintenance

### Regular Updates
- Weekly dependency updates
- Monthly security patches
- Quarterly feature releases

### Backup Strategy
- Daily database backups
- User wallet backup recommendations
- Configuration version control

### Monitoring
- 24/7 uptime monitoring
- Error rate tracking
- Performance optimization
- User feedback collection

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits
- Comprehensive testing

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

### Documentation
- API reference
- User guides
- Troubleshooting
- FAQ

### Community
- Discord server
- GitHub discussions
- Stack Overflow tags
- Developer meetups

### Enterprise Support
- Dedicated support team
- SLA guarantees
- Custom integrations
- Training and consulting

---

**Built with ❤️ by the Verbex Team**

*Bringing your granny onchain, one voice command at a time.* 