import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// v0 dev tokens
const TOKENS = {
  brandPlum: '#2D1B1A',
  neonLime: '#C7F25B',
  cream: '#F7F3EA',
  ink: '#0E0D0C',
  electricBlue: '#2B59FF',
  radius: 24,
};

export default function LandingPage() {
  const router = useRouter();

  // Animation values
  const pulseValue = useSharedValue(1);
  const bounceValue = useSharedValue(1);
  const arrowValue = useSharedValue(1);

  React.useEffect(() => {
    // Pulse animation for background floaters
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1800 }),
        withTiming(1.0, { duration: 1800 })
      ),
      -1,
      true
    );

    // Bounce animation for floating tag
    bounceValue.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1000 }),
        withTiming(0.96, { duration: 1000 })
      ),
      -1,
      true
    );

    // Arrow pulse animation (used for small accent) 
    arrowValue.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1500 }),
        withTiming(0.86, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseValue.value, [1, 1.12], [0.10, 0.18], Extrapolate.CLAMP),
    transform: [{ scale: pulseValue.value }],
  }));

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceValue.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(arrowValue.value, [0.86, 1], [0.6, 1], Extrapolate.CLAMP),
    transform: [{ scale: arrowValue.value }],
  }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: TOKENS.cream }}>
      {/* background floaters (static) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        <View style={{ position: 'absolute', left: -80, top: 40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(199, 242, 91, 0.33)' }} />
        <View style={{ position: 'absolute', right: -60, top: 96, width: 208, height: 208, borderRadius: 104, backgroundColor: 'rgba(43, 89, 255, 0.25)' }} />
      </View>

      {/* Content container */}
      <View style={{ width: '100%', alignItems: 'center', paddingTop: 48, paddingBottom: 64 }}>
        <View style={{ width: '100%', maxWidth: 1200, paddingHorizontal: 16, alignItems: 'center' }}>
          {/* Banner */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: TOKENS.neonLime,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                transform: [{ rotate: '-3deg' }],
                shadowColor: TOKENS.ink,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 30,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: TOKENS.ink }}>Your Gateway to Modern De‑Fi</Text>
            </View>
            <View
              style={{
                backgroundColor: TOKENS.brandPlum,
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 4,
                transform: [{ rotate: '1deg' }],
                shadowColor: TOKENS.ink,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: TOKENS.cream }}>Gasless Agentic Kit</Text>
            </View>
          </View>

          {/* Main Heading */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ position: 'relative' }}>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: '800',
                  textAlign: 'center',
                  lineHeight: 56,
                  color: TOKENS.ink,
                  fontFamily: 'BebasNeue_400Regular',
                }}
              >
                VERBEX{' '}
                <Text style={{ 
                  fontSize: 36, 
                  fontWeight: '800',
                  backgroundColor: TOKENS.neonLime,
                  color: TOKENS.ink,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 10,
                  transform: [{ rotate: '-1.5deg' }]
                }}>
                  the future of DeFi
                </Text>
              </Text>

              {/* Floating tag */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: -32,
                    right: width > 480 ? 0 : -8,
                    transform: [{ rotate: '-3deg' }],
                  },
                  bounceStyle,
                ]}
              >
                <View
                  style={{
                    backgroundColor: TOKENS.cream,
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    shadowColor: TOKENS.ink,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 24,
                    elevation: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: TOKENS.ink }}>Bring your granny onchain</Text>
                </View>
              </Animated.View>


            </View>
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: 18,
              lineHeight: 28,
              textAlign: 'center',
              maxWidth: 640,
              color: '#424242',
              marginBottom: 28,
            }}
          >
            Chat your intent—Verbex plans routes, simulates risk, and executes across protocols gaslessly. One tap, done.
          </Text>

          {/* CTAs */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              style={{
                backgroundColor: TOKENS.brandPlum,
                borderRadius: 12,
                paddingHorizontal: 20,
                paddingVertical: 12,
                shadowColor: TOKENS.ink,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 18,
                elevation: 8,
              }}
            >
              <Text style={{ color: TOKENS.cream, fontSize: 16, fontWeight: '700' }}>Make it work right now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(voice)')}
              style={{
                backgroundColor: TOKENS.neonLime,
                borderRadius: 12,
                paddingHorizontal: 20,
                paddingVertical: 12,
                shadowColor: TOKENS.neonLime,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 18,
                elevation: 8,
              }}
            >
              <Text style={{ color: TOKENS.brandPlum, fontSize: 16, fontWeight: '700' }}>Try Voice Mode</Text>
            </TouchableOpacity>
          </View>

          {/* Chain badges */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, color: TOKENS.ink, opacity: 0.7 }}>Runs on</Text>
            {[
              { label: 'Avalanche', rot: -1 },
              { label: 'Stellar', rot: 1 },
              { label: 'Sonic', rot: -1 },
            ].map((c, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: TOKENS.cream,
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  transform: [{ rotate: `${c.rot}deg` }],
                  shadowColor: TOKENS.ink,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.06,
                  shadowRadius: 18,
                  elevation: 3,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: TOKENS.ink }}>{c.label}</Text>
              </View>
            ))}
          </View>

          {/* Feature cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 40, justifyContent: 'center' }}>
            {[
              { title: 'AI + NLP', desc: 'Natural, multi‑modal conversations' },
              { title: 'Cross‑protocol', desc: 'Route + execute across chains' },
              { title: 'Optimization', desc: 'Compare yields & gasless routing' },
              { title: 'Secure', desc: 'Bundled transactions with checks' },
            ].map((feature, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: TOKENS.cream,
                  borderRadius: TOKENS.radius,
                  padding: 16,
                  minWidth: 200,
                  alignItems: 'center',
                  shadowColor: TOKENS.ink,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.1,
                  shadowRadius: 30,
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    marginBottom: 8,
                    transform: [{ rotate: index % 2 === 0 ? '-1deg' : '1deg' }],
                    color: TOKENS.ink,
                  }}
                >
                  {feature.title}
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, textAlign: 'center', color: '#424242' }}>{feature.desc}</Text>
              </View>
            ))}
          </View>

          {/* 2×2 Feature Image Grid with captions */}
          <View
            style={{
              width: '100%',
              maxWidth: 1000,
              borderRadius: TOKENS.radius,
              backgroundColor: TOKENS.cream,
              padding: 12,
              marginBottom: 24,
              shadowColor: TOKENS.ink,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 30,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {[
                { title: 'Plan', uri: 'https://images.unsplash.com/photo-1551281044-8b53a1e2f2f4?w=800&q=80' },
                { title: 'Route', uri: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=80' },
                { title: 'Execute', uri: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80' },
                { title: 'Track', uri: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=80' },
              ].map((item, i) => (
                <View key={i} style={{ width: width > 720 ? (1000 - 12 * 3) / 2 : '100%' }}>
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: '100%', height: 160, borderRadius: 16, backgroundColor: '#EAEAEA' }}
                      resizeMode="cover"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: TOKENS.neonLime,
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        transform: [{ rotate: '-3deg' }],
                        shadowColor: TOKENS.ink,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.12,
                        shadowRadius: 18,
                        elevation: 4,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: TOKENS.ink }}>{item.title}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* CTA band */}
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              paddingVertical: 40,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: 'rgba(0,0,0,0.05)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <View style={{ width: '100%', maxWidth: 1200, paddingHorizontal: 16, alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 40, color: TOKENS.ink }}>
                DeFi, without the busywork — intent in, execution out.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 22,
                  textAlign: 'center',
                  maxWidth: 640,
                  color: '#424242',
                }}
              >
                Verbex removes clicks and context‑switching. Detect intent, parse tokens, optimize routes, and execute — all from a
                single message or voice command.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                style={{
                  backgroundColor: TOKENS.brandPlum,
                  borderRadius: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginTop: 8,
                  shadowColor: TOKENS.ink,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 18,
                  elevation: 8,
                }}
              >
                <Text style={{ color: TOKENS.cream, fontSize: 16, fontWeight: '700' }}>Start a Conversation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}