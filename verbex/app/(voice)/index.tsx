import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthProvider';
import { getSocket } from '../../lib/socket';

const { width, height } = Dimensions.get('window');

interface VoiceData {
  text: string;
  audioData?: string;
}

export default function VoicePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Tap to talk. Verbex executes on-chain.');
  const [transcribedText, setTranscribedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const socket = useRef(getSocket());

  // Animation values
  const orbScale = useSharedValue(1);
  const orbOpacity = useSharedValue(1);
  const ripple1Scale = useSharedValue(0.8);
  const ripple2Scale = useSharedValue(0.8);
  const ripple3Scale = useSharedValue(0.8);
  const equalizerBars = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const floatValue = useSharedValue(0);
  const idleFloatValue = useSharedValue(0);

  useEffect(() => {
    // Background blobs animation
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1800 }), // motion.durationsMs.pulse
        withTiming(1, { duration: 1800 })
      ),
      -1,
      true
    );

    // Idle float animation for orb
    idleFloatValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }), // VoiceOrb.idleFloat.durationMs
        withTiming(0.95, { duration: 3000 })
      ),
      -1,
      true
    );

    // Socket event listeners
    socket.current.on('voice:transcribed', (data: VoiceData) => {
      console.log('[Verbex][WS:STT]', data.text);
      setTranscribedText(data.text);
    });

    socket.current.on('voice:reply', (data: VoiceData) => {
      console.log('[Verbex][WS:AI]', data.text);
      setAiResponse(data.text);
      setIsProcessing(false);
      if (data.audioData) {
        playAudioResponse(data.audioData);
      }
    });

    return () => {
      socket.current.off('voice:transcribed');
      socket.current.off('voice:reply');
    };
  }, []);

  const playAudioResponse = async (base64Audio: string) => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      sound.current = newSound;
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      setIsListening(true);
      setStatus('Listening...');
      
      // Start animations
      orbScale.value = withSpring(1.15); // VoiceOrb.audioReactive.scaleMax
      orbOpacity.value = withSpring(0.8);
      ripple1Scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      );
      ripple2Scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1200 }),
          withTiming(0.8, { duration: 1200 })
        ),
        -1,
        true
      );
      ripple3Scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1400 }),
          withTiming(0.8, { duration: 1400 })
        ),
        -1,
        true
      );
      equalizerBars.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.3, { duration: 200 })
        ),
        -1,
        true
      );
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording.current) return;
      
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      
      setIsListening(false);
      setIsProcessing(true);
      setStatus('Processing...');
      
      // Stop animations
      orbScale.value = withSpring(1);
      orbOpacity.value = withSpring(1);
      ripple1Scale.value = withTiming(0.8);
      ripple2Scale.value = withTiming(0.8);
      ripple3Scale.value = withTiming(0.8);
      equalizerBars.value = withTiming(0);
      
      if (uri) {
        // Convert to base64 and send via WebSocket
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          socket.current.emit('voice:audio', { audioData: base64 });
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsListening(false);
      setIsProcessing(false);
      setStatus('Error stopping recording');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseValue.value, [1, 1.2], [0.08, 0.12], Extrapolate.CLAMP),
    transform: [{ scale: pulseValue.value }]
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0.95, 1], [0, -8], Extrapolate.CLAMP) }] // VoiceOrb.idleFloat.amplitudePx
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value
  }));

  const idleFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(idleFloatValue.value, [0.95, 1], [0, -8], Extrapolate.CLAMP) }] // VoiceOrb.idleFloat.amplitudePx
  }));

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1Scale.value }],
    opacity: interpolate(ripple1Scale.value, [0.8, 1.3], [0, 0.3], Extrapolate.CLAMP) // VoiceOrb.ring.baseOpacity
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2Scale.value }],
    opacity: interpolate(ripple2Scale.value, [0.8, 1.2], [0, 0.2], Extrapolate.CLAMP) // VoiceOrb.ring.baseOpacity
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple3Scale.value }],
    opacity: interpolate(ripple3Scale.value, [0.8, 1.1], [0, 0.1], Extrapolate.CLAMP) // VoiceOrb.ring.baseOpacity
  }));

  const equalizerStyle = useAnimatedStyle(() => ({
    opacity: equalizerBars.value,
    transform: [{ scale: equalizerBars.value }]
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F3EA' }}> {/* cream from design spec */}
      {/* Background blobs */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        <Animated.View 
          style={[
            {
              position: 'absolute',
              right: -180, // top-right position
              top: -180,
              width: 360, // sizePx from design spec
              height: 360,
              borderRadius: 180,
              backgroundColor: '#2B59FF', // electricBlue from design spec
            },
            pulseStyle
          ]}
        />
        <Animated.View 
          style={[
            {
              position: 'absolute',
              left: -210, // bottom-left position
              bottom: -210,
              width: 420, // sizePx from design spec
              height: 420,
              borderRadius: 210,
              backgroundColor: '#2D1B1A', // brandPlum from design spec
            },
            pulseStyle
          ]}
        />
      </View>

      <View style={{ 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16, // container.paddingX.mobilePx
        paddingVertical: 40 // spacingPx.xl
      }}>
        {/* Header */}
        <Animated.View 
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8, // spacingPx.xs
              marginBottom: 24, // spacingPx.lg
            },
            floatStyle
          ]}
        >
          <View style={{
            backgroundColor: '#C7F25B', // neonLime from design spec
            paddingHorizontal: 6, // spacingPx.xs
            paddingVertical: 2, // spacingPx.xxs
            borderRadius: 8, // spacingPx.xs
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.10, // shadows.card opacity
            shadowRadius: 18,
            elevation: 4,
            transform: [{ rotate: '1deg' }]
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#0E0D0C' }}>Voice Mode</Text>
          </View>
          <View style={{
            backgroundColor: '#2D1B1A', // brandPlum from design spec
            paddingHorizontal: 4, // spacingPx.xxs
            paddingVertical: 1, // spacingPx.xxs
            borderRadius: 10, // spacingPx.sm
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15, // shadows.card opacity
            shadowRadius: 24,
            elevation: 6,
            transform: [{ rotate: '-1deg' }]
          }}>
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#F7F3EA' }}>Hands‑free</Text>
          </View>
        </Animated.View>

        {/* Voice Orb Container */}
        <View style={{
          backgroundColor: '#F7F3EA', // Card.bg (cream)
          borderRadius: 24, // Card.radiusPx
          padding: 40, // spacingPx.xxl
          marginBottom: 24, // spacingPx.lg
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.10, // shadows.card opacity
          shadowRadius: 30,
          elevation: 8
        }}>
          {/* Ripple effects */}
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 190,
                height: 190,
                borderRadius: 95,
                backgroundColor: 'rgba(200, 255, 69, 0.2)', // neonLime with opacity
                marginTop: -95,
                marginLeft: -95,
              },
              ripple1Style
            ]}
          />
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 176,
                height: 176,
                borderRadius: 88,
                backgroundColor: 'rgba(200, 255, 69, 0.15)', // neonLime with opacity
                marginTop: -88,
                marginLeft: -88,
              },
              ripple2Style
            ]}
          />
          <Animated.View 
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(200, 255, 69, 0.1)', // neonLime with opacity
                marginTop: -80,
                marginLeft: -80,
              },
              ripple3Style
            ]}
          />

          {/* Main Orb */}
          <TouchableOpacity
            onPress={toggleListening}
            activeOpacity={0.8}
            style={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View 
              style={[
                {
                  width: 220, // VoiceOrb.diameterPx.mobile
                  height: 220,
                  borderRadius: 110,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#2B59FF', // electricBlue from design spec
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.35, // shadows.softGlowBlue opacity
                  shadowRadius: 40, // shadows.softGlowBlue blur
                  elevation: 8
                },
                orbStyle,
                idleFloatStyle
              ]}
            >
              <LinearGradient
                colors={isListening ? 
                  ['#C7F25B', '#9DD62A', '#3D6212'] : // neonLime when listening
                  ['#2B59FF', '#2D1B1A'] // VoiceOrb.gradient.stops (electricBlue → brandPlum)
                }
                start={{ x: 0.3, y: 0.3 }} // VoiceOrb.gradient.angleDeg (130°)
                end={{ x: 0.7, y: 0.7 }}
                style={{
                  width: 220, // VoiceOrb.diameterPx.mobile
                  height: 220,
                  borderRadius: 110,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {isListening ? (
                  <Animated.View style={equalizerStyle}>
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'flex-end', 
                      gap: 5, // spacingPx.xxs
                      height: 36 // wave-bars height
                    }}>
                      {Array.from({ length: 12 }).map((_, index) => (
                        <Animated.View
                          key={index}
                          style={{
                            width: 6, // wave-bars span width
                            height: 6 + (index % 5 + 1) * 5, // dynamic height
                            backgroundColor: '#C7F25B', // neonLime when listening
                            borderRadius: 6 // wave-bars span border-radius
                          }}
                        />
                      ))}
                    </View>
                  </Animated.View>
                ) : (
                  <MaterialIcons 
                    name={isProcessing ? "mic-off" : "mic"} 
                    size={56} // VoiceOrb.micButton.sizePx
                    color="#F7F3EA" // cream from design spec
                  />
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Status Text */}
        <Text style={{ 
          fontSize: 12, // typography.scalesPx.small
          opacity: 0.7, 
          textAlign: 'center',
          marginBottom: 24, // spacingPx.lg
          color: '#0E0D0C' // ink from design spec
        }}>
          {status}
        </Text>

        {/* Transcribed Text */}
        {transcribedText && (
          <View style={{
            backgroundColor: '#F7F3EA', // Card.bg (cream)
            borderRadius: 24, // Card.radiusPx
            padding: 12, // spacingPx.sm
            marginBottom: 16, // spacingPx.md
            maxWidth: 300,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.10, // shadows.card opacity
            shadowRadius: 30,
            elevation: 8
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4, color: '#0E0D0C' }}>You said:</Text>
            <Text style={{ fontSize: 14, color: '#0E0D0C' }}>{transcribedText}</Text>
          </View>
        )}

        {/* AI Response */}
        {aiResponse && (
          <View style={{
            backgroundColor: '#F7F3EA', // Card.bg (cream)
            borderRadius: 24, // Card.radiusPx
            padding: 12, // spacingPx.sm
            marginBottom: 16, // spacingPx.md
            maxWidth: 300,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.10, // shadows.card opacity
            shadowRadius: 30,
            elevation: 8
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 4, color: '#0E0D0C' }}>Verbex:</Text>
            <Text style={{ fontSize: 14, color: '#0E0D0C' }}>{aiResponse}</Text>
          </View>
        )}

        {/* Back to Chat Button */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={{
            backgroundColor: '#2D1B1A', // Buttons.primary.bg (brandPlum)
            borderRadius: 28, // Buttons.primary.size.radiusPx
            paddingHorizontal: 22, // Buttons.primary.size.pxPx
            paddingVertical: 12, // Buttons.primary.size.heightPx / 2
            minHeight: 48, // Buttons.primary.size.heightPx
          }}
        >
          <Text style={{ 
            fontSize: 12, // typography.scalesPx.small
            color: '#F7F3EA', // Buttons.primary.text (cream)
            fontWeight: '500' 
          }}>
            Back to Chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
