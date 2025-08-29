# Verbex AI Assistant 🤖💬

> **Bringing Your Granny Onchain** - A Revolutionary AI Assistant with Voice Chat & Blockchain Integration

[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![0xGasless](https://img.shields.io/badge/0xGasless-AgentKit-green.svg)](https://0xgasless.com/)
[![Grok AI](https://img.shields.io/badge/Grok%20AI-Integration-orange.svg)](https://x.ai/)
[![Voice Chat](https://img.shields.io/badge/Voice%20Chat-Enabled-red.svg)](https://expo.dev/)

## 🌟 Overview

Verbex is a cutting-edge AI assistant built for React Native that combines the power of Grok AI with blockchain capabilities through the 0xGasless Agent Kit. This app enables users to have natural voice conversations with an AI that can perform complex blockchain operations, deploy smart contracts, and execute DeFi strategies - all without requiring gas fees or technical knowledge.

### 🎯 Key Features

- **🎤 Voice Chat Interface**: ChatGPT-like voice interaction with real-time speech recognition
- **🤖 Grok AI Integration**: Advanced AI reasoning and conversation capabilities
- **⚡ Gasless Blockchain Operations**: Execute transactions without paying gas fees
- **📱 Cross-Platform**: Works on iOS and Android with native performance
- **🔐 Smart Contract Deployment**: AI can write and deploy contracts on-demand
- **💱 DeFi Integration**: Token swaps, transfers, and portfolio management
- **🎨 Modern UI/UX**: Beautiful, intuitive interface with dark/light themes
- **🔒 Secure**: Built-in security with programmable constraints

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Backend API   │    │   Blockchain    │
│     Frontend    │◄──►│   (Node.js)     │◄──►│   (0xGasless)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voice Chat    │    │   Grok AI API   │    │   Smart Wallets │
│   (Speech-to-   │    │   Integration   │    │   (ERC-4337)    │
│    Text/Text-   │    │                 │    │                 │
│    to-Speech)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- React Native CLI or Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- 0xGasless API Key
- Grok AI API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/verbex-ai-assistant.git
cd verbex-ai-assistant
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install iOS dependencies (iOS only)**
```bash
cd ios && pod install && cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# 0xGasless Configuration
ZEROXGASLESS_API_KEY=your_0xgasless_api_key
ZEROXGASLESS_PRIVATE_KEY=your_private_key
RPC_URL=https://mainnet.infura.io/v3/your_project_id
CHAIN_ID=1

# Grok AI Configuration
GROK_API_KEY=your_grok_api_key
GROK_API_URL=https://api.x.ai/v1

# Voice Chat Configuration
SPEECH_TO_TEXT_API_KEY=your_speech_to_text_key
TEXT_TO_SPEECH_API_KEY=your_text_to_speech_key

# Backend Configuration
BACKEND_URL=http://localhost:3001
```

5. **Start the development server**
```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📱 App Structure

```
src/
├── components/           # Reusable UI components
│   ├── VoiceChat/       # Voice chat interface
│   ├── ChatInterface/   # Chat UI components
│   ├── Blockchain/      # Blockchain operation UI
│   └── common/          # Common UI elements
├── screens/             # App screens
│   ├── HomeScreen.tsx   # Main chat interface
│   ├── SettingsScreen.tsx
│   └── WalletScreen.tsx
├── services/            # API and external services
│   ├── grokAI.ts       # Grok AI integration
│   ├── voiceChat.ts    # Voice chat services
│   ├── blockchain.ts   # 0xGasless integration
│   └── backend.ts      # Backend API calls
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── constants/          # App constants
```

## 🎤 Voice Chat Implementation

### Speech Recognition
```typescript
import Voice from '@react-native-voice/voice';

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      setTranscript(event.value?.[0] || '');
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return { isListening, transcript, startListening, stopListening };
};
```

### Text-to-Speech
```typescript
import Tts from 'react-native-tts';

const useTextToSpeech = () => {
  const speak = async (text: string) => {
    try {
      await Tts.speak(text, {
        rate: 0.5,
        pitch: 1.0,
        quality: Tts.VOICE_QUALITY_HIGH,
      });
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  return { speak };
};
```

## 🤖 Grok AI Integration

### AI Service Configuration
```typescript
// services/grokAI.ts
import { GrokAI } from '@x-ai/sdk';

class GrokAIService {
  private grok: GrokAI;

  constructor() {
    this.grok = new GrokAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: process.env.GROK_API_URL,
    });
  }

  async chat(message: string, context?: string) {
    try {
      const response = await this.grok.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `You are Verbex, an AI assistant that can perform blockchain operations. 
                     You have access to 0xGasless Agent Kit for gasless transactions.
                     ${context || ''}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Grok AI error:', error);
      throw error;
    }
  }

  async analyzeIntent(message: string) {
    // Analyze user intent to determine if blockchain action is needed
    const response = await this.chat(
      `Analyze this message and determine if it requires blockchain action: "${message}"
       Respond with JSON: {"requiresBlockchain": boolean, "action": string, "parameters": object}`
    );
    
    return JSON.parse(response);
  }
}

export default new GrokAIService();
```

## ⚡ 0xGasless Agent Kit Integration

### Blockchain Service
```typescript
// services/blockchain.ts
import { Agentkit, AgentkitToolkit } from '@0xgasless/agentkit';

class BlockchainService {
  private agentkit: Agentkit;
  private toolkit: AgentkitToolkit;

  async initialize() {
    this.agentkit = await Agentkit.configureWithWallet({
      privateKey: process.env.ZEROXGASLESS_PRIVATE_KEY,
      rpcUrl: process.env.RPC_URL,
      apiKey: process.env.ZEROXGASLESS_API_KEY,
      chainID: Number(process.env.CHAIN_ID),
    });

    this.toolkit = new AgentkitToolkit(this.agentkit);
  }

  async executeAction(action: string, parameters: any) {
    try {
      const tools = this.toolkit.getTools();
      const result = await this.agentkit.runAction(action, parameters);
      return result;
    } catch (error) {
      console.error('Blockchain action error:', error);
      throw error;
    }
  }

  async deployContract(contractCode: string, constructorArgs: any[]) {
    // AI-generated contract deployment
    const deploymentResult = await this.executeAction('deploy_contract', {
      contractCode,
      constructorArgs,
    });
    return deploymentResult;
  }

  async swapTokens(fromToken: string, toToken: string, amount: string) {
    return await this.executeAction('smart_swap', {
      tokenInSymbol: fromToken,
      tokenOutSymbol: toToken,
      amount,
      wait: true,
    });
  }

  async transferTokens(token: string, recipient: string, amount: string) {
    return await this.executeAction('smart_transfer', {
      tokenSymbol: token,
      recipient,
      amount,
    });
  }

  async getBalance(tokenSymbols: string[]) {
    return await this.executeAction('get_balance', {
      tokenSymbols,
    });
  }
}

export default new BlockchainService();
```

## 🎨 Main Chat Interface

### HomeScreen Component
```typescript
// screens/HomeScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import VoiceChat from '../components/VoiceChat/VoiceChat';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import grokAI from '../services/grokAI';
import blockchainService from '../services/blockchain';

const HomeScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleUserMessage = async (message: string) => {
    setIsProcessing(true);
    
    try {
      // Add user message to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Analyze intent with Grok AI
      const intent = await grokAI.analyzeIntent(message);
      
      let aiResponse = '';

      if (intent.requiresBlockchain) {
        // Execute blockchain action
        const blockchainResult = await blockchainService.executeAction(
          intent.action,
          intent.parameters
        );
        
        // Generate AI response about the blockchain action
        aiResponse = await grokAI.chat(
          `The user requested: "${message}". 
           I executed the blockchain action and got this result: ${blockchainResult}.
           Please provide a natural, conversational response explaining what happened.`
        );
      } else {
        // Regular conversation
        aiResponse = await grokAI.chat(message);
      }

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ChatInterface
          messages={messages}
          isProcessing={isProcessing}
          onSendMessage={handleUserMessage}
        />
        <VoiceChat
          isListening={isListening}
          onVoiceInput={handleUserMessage}
          onListeningChange={setIsListening}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default HomeScreen;
```

## 🔧 Backend API

### Express.js Backend
```typescript
// backend/server.ts
import express from 'express';
import cors from 'cors';
import { Agentkit } from '@0xgasless/agentkit';
import { GrokAI } from '@x-ai/sdk';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize services
const agentkit = await Agentkit.configureWithWallet({
  privateKey: process.env.ZEROXGASLESS_PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
  apiKey: process.env.ZEROXGASLESS_API_KEY,
  chainID: Number(process.env.CHAIN_ID),
});

const grok = new GrokAI({
  apiKey: process.env.GROK_API_KEY,
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Analyze intent
    const intent = await grok.chat.completions.create({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'Analyze if this message requires blockchain action'
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    let response = '';
    
    if (intent.requiresBlockchain) {
      // Execute blockchain action
      const result = await agentkit.runAction(intent.action, intent.parameters);
      response = await grok.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'Provide a natural response about the blockchain action'
          },
          {
            role: 'user',
            content: `Action result: ${result}. Respond naturally.`
          }
        ]
      });
    } else {
      // Regular conversation
      response = await grok.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });
    }

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 📦 Package.json Dependencies

```json
{
  "name": "verbex-ai-assistant",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint .",
    "backend": "node backend/server.js"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-native-voice/voice": "^3.2.4",
    "react-native-tts": "^4.1.0",
    "@0xgasless/agentkit": "^0.0.4",
    "@x-ai/sdk": "^1.0.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "react-native-gesture-handler": "^2.13.4",
    "react-native-reanimated": "^3.5.4",
    "react-native-safe-area-context": "^4.7.4",
    "react-native-screens": "^3.25.0",
    "react-native-vector-icons": "^10.0.2",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-sound": "^0.11.2",
    "react-native-permissions": "^3.10.1",
    "react-native-config": "^1.5.1",
    "axios": "^1.6.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.72.2",
    "@react-native/metro-config": "^0.72.11",
    "@tsconfig/react-native": "^3.0.0",
    "@types/react": "^18.0.24",
    "@types/react-test-renderer": "^18.0.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.76.8",
    "prettier": "^2.4.1",
    "react-test-renderer": "18.2.0",
    "typescript": "4.8.4"
  }
}
```

## 🎯 Key Features Explained

### 1. Voice Chat Interface
- **Speech Recognition**: Real-time voice-to-text using React Native Voice
- **Text-to-Speech**: Natural AI voice responses using React Native TTS
- **Noise Cancellation**: Advanced audio processing for clear voice input
- **Multi-language Support**: Support for multiple languages and accents

### 2. Grok AI Integration
- **Natural Language Processing**: Advanced conversation capabilities
- **Intent Recognition**: Automatically detects when blockchain actions are needed
- **Context Awareness**: Maintains conversation context across sessions
- **Multi-modal Support**: Can handle text, voice, and future image inputs

### 3. 0xGasless Agent Kit
- **Gasless Transactions**: Execute blockchain operations without gas fees
- **Smart Contract Deployment**: AI can write and deploy contracts on-demand
- **DeFi Operations**: Token swaps, transfers, and portfolio management
- **Multi-chain Support**: Works across multiple EVM-compatible networks

### 4. Dynamic Function Creation
When a user requests a task that doesn't have a pre-built function:

1. **AI Analysis**: Grok AI analyzes the request and determines required actions
2. **Code Generation**: AI generates the necessary smart contract code
3. **Contract Deployment**: Uses 0xGasless to deploy the contract gaslessly
4. **Function Execution**: Executes the newly created function
5. **Result Reporting**: Provides natural language feedback about the operation

## 🔒 Security Features

- **Programmable Constraints**: Set spending limits and operation boundaries
- **Multi-signature Support**: Require multiple approvals for large transactions
- **Time-locked Operations**: Schedule transactions with time-based restrictions
- **Whitelist Management**: Restrict operations to approved contracts
- **Emergency Stop**: Ability to pause all operations immediately

## 🚀 Deployment

### iOS App Store
```bash
# Build for production
cd ios
xcodebuild -workspace VerbexAI.xcworkspace -scheme VerbexAI -configuration Release -destination generic/platform=iOS -archivePath VerbexAI.xcarchive archive
xcodebuild -exportArchive -archivePath VerbexAI.xcarchive -exportPath ./build -exportOptionsPlist exportOptions.plist
```

### Google Play Store
```bash
# Build APK
cd android
./gradlew assembleRelease
```

### Backend Deployment
```bash
# Deploy to Heroku
heroku create verbex-ai-backend
git push heroku main

# Deploy to AWS
aws ec2 run-instances --image-id ami-12345678 --instance-type t2.micro
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [0xGasless](https://0xgasless.com/) for the revolutionary gasless agent kit
- [Grok AI](https://x.ai/) for advanced AI capabilities
- [React Native](https://reactnative.dev/) for the mobile framework
- [Expo](https://expo.dev/) for development tools

## 📞 Support

- **Documentation**: [docs.verbex.ai](https://docs.verbex.ai)
- **Discord**: [discord.gg/verbex](https://discord.gg/verbex)
- **Twitter**: [@verbex_ai](https://twitter.com/verbex_ai)
- **Email**: support@verbex.ai

---

**Verbex AI Assistant** - Bringing the future of AI and blockchain to your pocket! 🚀 