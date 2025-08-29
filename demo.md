# Verbex AI - Demo Guide

## 🎯 Demo Overview

This guide will walk you through testing the complete Verbex AI system, from backend to frontend, demonstrating the voice-first blockchain assistant capabilities.

## 🚀 Quick Demo Setup

### 1. Start Backend
```bash
cd mcp
yarn dev
```
✅ Backend should show: "🚀 Verbex AI Assistant Backend running on port 3001"

### 2. Start Frontend
```bash
cd verbex
yarn start
```
✅ Expo should open with QR code for mobile testing

### 3. Test Backend API
```bash
curl http://localhost:3001/api/health
```
✅ Should return: `{"success":true,"data":{"status":"healthy","services":{"groq":"disconnected","agentkit":"available"}}}`

## 📱 Frontend Testing

### Voice Interface
1. **Open Voice Tab**: Tap the microphone icon in bottom navigation
2. **Animated Orb**: See the pulsing orb (gray = idle, blue = listening, yellow = thinking, green = speaking)
3. **Voice Recording**: Tap and hold the mic button, speak naturally, release to send
4. **AI Response**: Listen to the TTS response from the AI

### Chat Interface
1. **Open Chat Tab**: Tap the chat icon in bottom navigation
2. **Login**: Use the demo login button (creates test account)
3. **Send Message**: Type blockchain-related questions
4. **AI Response**: See text responses from the AI

### Settings
1. **Open Settings Tab**: Tap the gear icon
2. **Voice Toggle**: Enable/disable voice features
3. **Network Selection**: Switch between blockchain networks
4. **Logout**: Test authentication flow

## 🔧 Backend Testing

### Authentication Flow
```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@verbex.com",
    "password": "password123",
    "preferences": {
      "voiceEnabled": true,
      "language": "en",
      "blockchainNetwork": "avalanche",
      "autoConfirmTransactions": false,
      "spendingLimit": "1000"
    }
  }'

# Response should include:
# - JWT token
# - Smart account address
# - User preferences
```

### Chat Testing
```bash
# Get token from signup response
TOKEN="your_jwt_token_here"

# Send chat message
curl -X POST http://localhost:3001/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my token balances",
    "sessionId": "demo_session_123"
  }'
```

### Voice Testing
```bash
# Convert text to speech
curl -X POST http://localhost:3001/api/voice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audioData": "base64_encoded_audio_here",
    "sessionId": "demo_session_123",
    "language": "en"
  }'
```

## 🎤 Voice Demo Scenarios

### Scenario 1: Balance Check
1. **Say**: "What's my AVAX balance?"
2. **Expected**: AI responds with balance information
3. **Result**: Voice response explaining current holdings

### Scenario 2: Token Transfer
1. **Say**: "Transfer 10 USDC to 0x1234..."
2. **Expected**: AI confirms transfer details
3. **Result**: Transaction preparation and confirmation

### Scenario 3: Smart Contract
1. **Say**: "Deploy a simple NFT contract"
2. **Expected**: AI explains deployment process
3. **Result**: Contract creation and deployment

## 🔍 Troubleshooting

### Backend Issues
- **Port 3001 in use**: Kill existing process or change port
- **Missing dependencies**: Run `yarn install` in `/mcp`
- **TypeScript errors**: Check for syntax issues in source files

### Frontend Issues
- **Expo not starting**: Check Node.js version (18+ required)
- **Metro bundler errors**: Clear cache with `expo start -c`
- **Audio permissions**: Grant microphone access on device

### API Issues
- **CORS errors**: Backend CORS is configured for localhost
- **Authentication fails**: Check JWT token format and expiration
- **Voice processing fails**: Ensure Groq API key is set

## 📊 Demo Metrics

### Performance Targets
- **Voice Response**: < 2 seconds
- **Text Response**: < 1 second
- **Audio Quality**: 16kHz, clear speech
- **Animation Smoothness**: 60fps

### Success Criteria
- ✅ Voice recording works
- ✅ AI responds intelligently
- ✅ TTS playback is clear
- ✅ Blockchain context is maintained
- ✅ User authentication flows
- ✅ Settings persistence

## 🎉 Demo Completion

### What You've Demonstrated
1. **Voice-First Interface**: ChatGPT-like voice experience
2. **AI Integration**: Groq AI for natural language understanding
3. **Blockchain Ready**: 0xGasless Agent Kit integration
4. **Mobile App**: React Native with Expo
5. **Production Architecture**: Scalable backend design

### Next Steps
1. **Add API Keys**: Set GROQ_API_KEY and ZEROXGASLESS_API_KEY
2. **Database Setup**: Configure PostgreSQL for production
3. **Deploy**: Use deployment scripts for production
4. **Monitor**: Set up logging and monitoring
5. **Scale**: Add load balancing and caching

---

**Ready to bring your granny onchain? 🚀** 