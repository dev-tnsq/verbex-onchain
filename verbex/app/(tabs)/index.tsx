import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthProvider';
import { api } from '../../lib/api';

const { width } = Dimensions.get('window');

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Verbex. Tell me your DeFi intent: "Swap 100 USDC to ETH with best route, then lend 50% to Aave."',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || !token) return;

    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: content,
        context: {
          userPreferences: {
            voiceEnabled: false,
            language: 'en',
            blockchainNetwork: 'avalanche',
            autoConfirmTransactions: true,
            spendingLimit: '1000'
          }
        }
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const ChatBubble = ({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) => (
    <View style={{
      alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '85%', // ChatBubble max width
      marginBottom: 12, // ChatBubble.gapPx
    }}>
      <View style={{
        backgroundColor: role === 'user' ? '#2D1B1A' : '#F7F3EA', // ChatBubble.user.bg (brandPlum) : ChatBubble.assistant.bg (cream)
        borderWidth: role === 'user' ? 0 : 1,
        borderColor: role === 'user' ? 'transparent' : 'rgba(0,0,0,0.08)', // ChatBubble.assistant.border
        borderRadius: 16, // ChatBubble.radiusPx
        paddingHorizontal: 16, // spacingPx.md
        paddingVertical: 12, // spacingPx.sm
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.10, // shadows.card opacity
        shadowRadius: 30,
        elevation: 8
      }}>
        <Text style={{
          fontSize: 16, // typography.scalesPx.body
          lineHeight: 1.5, // typography.lineHeights.normal
          color: role === 'user' ? '#F7F3EA' : '#0E0D0C' // ChatBubble.user.text (cream) : ChatBubble.assistant.text (ink)
        }}>
          {children}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F3EA' }}> {/* cream from design spec */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ 
          flexDirection: 'row', 
          flex: 1,
          maxWidth: 900, // chat.layout.maxWidthPx
          marginHorizontal: 'auto',
          gap: 16 // chat.layout.stackGapPx
        }}>
          {/* Sidebar - Hidden on mobile */}
          <View style={{
            width: 280,
            backgroundColor: '#F7F3EA', // Card.bg (cream)
            borderRadius: 24, // Card.radiusPx
            padding: 20, // Card.paddingPx
            margin: 16, // spacingPx.md
            display: width > 768 ? 'flex' : 'none',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.10, // shadows.card opacity
            shadowRadius: 30,
            elevation: 8
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                backgroundColor: '#C7F25B', // neonLime from design spec
                paddingHorizontal: 12, // StickyNote.paddingPx.x
                paddingVertical: 8, // StickyNote.paddingPx.y
                borderRadius: 12, // StickyNote.radiusPx
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.10, // shadows.card opacity
                shadowRadius: 30,
                elevation: 8,
                transform: [{ rotate: '-4deg' }] // StickyNote.tiltDegrees
              }}>
                <Text style={{ 
                  fontSize: 14, // typography.scalesPx.small
                  fontWeight: '600', 
                  color: '#0E0D0C' // ink from design spec
                }}>
                  Sessions
                </Text>
              </View>
              <TouchableOpacity style={{
                borderRadius: 8, // spacingPx.xs
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.10)', // border-black/10
                backgroundColor: '#F7F3EA', // Card.bg (cream)
                paddingHorizontal: 8, // spacingPx.xs
                paddingVertical: 4 // spacingPx.xxs
              }}>
                <Text style={{ fontSize: 12, color: '#0E0D0C' }}>New</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, color: '#0E0D0C' }}>
              Demo stores messages in memory.
            </Text>
            
            <View style={{ gap: 8 }}>
              <View style={{
                backgroundColor: 'rgba(0,0,0,0.05)', // bg-black/5
                borderRadius: 8, // spacingPx.xs
                paddingHorizontal: 8, // spacingPx.xs
                paddingVertical: 4 // spacingPx.xxs
              }}>
                <Text style={{ fontSize: 14, color: '#0E0D0C' }}>Quick Start</Text>
              </View>
              <View style={{
                borderRadius: 8, // spacingPx.xs
                paddingHorizontal: 8, // spacingPx.xs
                paddingVertical: 4 // spacingPx.xxs
              }}>
                <Text style={{ fontSize: 14, color: '#0E0D0C' }}>Yield Scan</Text>
              </View>
              <View style={{
                borderRadius: 8, // spacingPx.xs
                paddingHorizontal: 8, // spacingPx.xs
                paddingVertical: 4 // spacingPx.xxs
              }}>
                <Text style={{ fontSize: 14, color: '#0E0D0C' }}>Lend & Hedge</Text>
              </View>
            </View>
          </View>

          {/* Chat Section */}
          <View style={{
            flex: 1,
            backgroundColor: '#F7F3EA', // Card.bg (cream)
            borderRadius: 24, // Card.radiusPx
            margin: 16, // spacingPx.md
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.10, // shadows.card opacity
            shadowRadius: 30,
            elevation: 8
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.10)', // card shadow opacity
              paddingHorizontal: 16, // spacingPx.md
              paddingVertical: 12 // spacingPx.sm
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  backgroundColor: '#2D1B1A', // brandPlum from design spec
                  paddingHorizontal: 6, // spacingPx.xs
                  paddingVertical: 2, // spacingPx.xxs
                  borderRadius: 10, // spacingPx.sm
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15, // shadows.card opacity
                  shadowRadius: 24,
                  elevation: 6
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#F7F3EA' }}>Verbex Assistant</Text>
                </View>
                <View style={{
                  backgroundColor: '#C7F25B', // neonLime from design spec
                  paddingHorizontal: 4, // spacingPx.xxs
                  paddingVertical: 1, // spacingPx.xxs
                  borderRadius: 8, // spacingPx.xs
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.10, // shadows.card opacity
                  shadowRadius: 18,
                  elevation: 4,
                  transform: [{ rotate: '1deg' }]
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#0E0D0C' }}>Gasless</Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8, display: width > 768 ? 'flex' : 'none' }}>
                <TouchableOpacity
                  onPress={() => router.push('/(voice)')}
                  style={{
                    backgroundColor: '#C7F25B', // Buttons.secondary.bg (neonLime)
                    borderRadius: 24, // Buttons.secondary.size.radiusPx
                    paddingHorizontal: 18, // Buttons.secondary.size.pxPx
                    paddingVertical: 10, // Buttons.secondary.size.heightPx / 2
                    minHeight: 44, // Buttons.secondary.size.heightPx
                  }}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#0E0D0C', // Buttons.secondary.text (ink)
                    fontWeight: '500' 
                  }}>
                    Voice Mode
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                  borderRadius: 8, // spacingPx.xs
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.10)', // border-black/10
                  backgroundColor: '#F7F3EA', // Card.bg (cream)
                  paddingHorizontal: 12, // spacingPx.sm
                  paddingVertical: 4 // spacingPx.xxs
                }}>
                  <Text style={{ fontSize: 12, color: '#0E0D0C' }}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }} // spacingPx.md
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message, index) => (
                <ChatBubble key={index} role={message.role as 'user' | 'assistant'}>
                  {message.content}
                </ChatBubble>
              ))}
              {isLoading && (
                <ChatBubble role="assistant">
                  <Text style={{ fontStyle: 'italic' }}>Thinking...</Text>
                </ChatBubble>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(0,0,0,0.10)', // card shadow opacity
              paddingHorizontal: 12, // spacingPx.sm
              paddingVertical: 12 // spacingPx.sm
            }}>
              {/* Input bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8 // spacingPx.xs
              }}>
                <View style={{
                  flex: 1,
                  backgroundColor: '#F7F3EA', // Card.bg (cream)
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.08)', // border color
                  borderRadius: 12, // spacingPx.sm
                  paddingHorizontal: 12, // spacingPx.sm
                  paddingVertical: 8, // spacingPx.xs
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.10, // shadows.card opacity
                  shadowRadius: 30,
                  elevation: 4
                }}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={() => sendMessage()}
                    placeholder='e.g., Swap 100 AVAX to USDC, then stake the rest'
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    style={{
                      fontSize: 16, // typography.scalesPx.body
                      color: '#0E0D0C', // ink from design spec
                      backgroundColor: 'transparent'
                    }}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  onPress={() => sendMessage()}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#2D1B1A', // Buttons.primary.bg (brandPlum)
                    borderRadius: 28, // Buttons.primary.size.radiusPx
                    paddingHorizontal: 22, // Buttons.primary.size.pxPx
                    paddingVertical: 12, // Buttons.primary.size.heightPx / 2
                    minHeight: 48, // Buttons.primary.size.heightPx
                  }}
                >
                  <Text style={{ 
                    fontSize: 16, // typography.scalesPx.body
                    color: '#F7F3EA', // Buttons.primary.text (cream)
                    fontWeight: '500' 
                  }}>
                    Send
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Mobile Voice shortcut */}
              <View style={{ 
                alignItems: 'center', 
                marginTop: 8, // spacingPx.xs
                display: width <= 768 ? 'flex' : 'none'
              }}>
                <TouchableOpacity
                  onPress={() => router.push('/(voice)')}
                  style={{
                    backgroundColor: '#C7F25B', // Buttons.secondary.bg (neonLime)
                    borderRadius: 24, // Buttons.secondary.size.radiusPx
                    paddingHorizontal: 18, // Buttons.secondary.size.pxPx
                    paddingVertical: 10, // Buttons.secondary.size.heightPx / 2
                    minHeight: 44, // Buttons.secondary.size.heightPx
                  }}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#0E0D0C', // Buttons.secondary.text (ink)
                    fontWeight: '500' 
                  }}>
                    Voice Mode
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
