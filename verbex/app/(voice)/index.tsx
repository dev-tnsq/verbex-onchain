import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	Alert,
	Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withRepeat,
	withSequence,
	withTiming,
	interpolate,
} from 'react-native-reanimated';
import { chat } from '../../lib/api';
import { getToken } from '../../lib/auth';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VoiceScreen() {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [sessionId] = useState(`session_${Date.now()}`);
	
	// Animation values
	const pulseScale = useSharedValue(1);
	const orbOpacity = useSharedValue(0.8);
	const orbGlow = useSharedValue(0);
	const rippleScale = useSharedValue(0);
	const rippleOpacity = useSharedValue(0);
	
	// Audio playback
	const soundRef = useRef<Audio.Sound | null>(null);

	useEffect(() => {
		checkAuth();
		setupAudio();
		return () => {
			if (soundRef.current) {
				soundRef.current.unloadAsync();
			}
		};
	}, []);

	const checkAuth = async () => {
		try {
			const token = await getToken();
			if (token) {
				setIsAuthenticated(true);
			}
		} catch (error) {
			console.log('No auth token found');
		}
	};

	const setupAudio = async () => {
		try {
			await Audio.requestPermissionsAsync();
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
				staysActiveInBackground: true,
				shouldDuckAndroid: true,
			});
		} catch (error) {
			console.error('Audio setup failed:', error);
		}
	};

	const startRecording = async () => {
		if (!isAuthenticated) {
			Alert.alert('Please login first', 'You need to be authenticated to use voice features');
			return;
		}

		try {
			setStatus('listening');
			
			// Start orb animations
			pulseScale.value = withRepeat(
				withSequence(
					withTiming(1.3, { duration: 1000 }),
					withTiming(1, { duration: 1000 })
				),
				-1,
				true
			);
			
			orbGlow.value = withRepeat(
				withSequence(
					withTiming(1, { duration: 800 }),
					withTiming(0.3, { duration: 800 })
				),
				-1,
				true
			);

			// Start ripple effect
			rippleScale.value = withRepeat(
				withSequence(
					withTiming(1.5, { duration: 1500 }),
					withTiming(0, { duration: 0 })
				),
				-1,
				false
			);
			
			rippleOpacity.value = withRepeat(
				withSequence(
					withTiming(0.6, { duration: 1500 }),
					withTiming(0, { duration: 0 })
				),
				-1,
				false
			);

			const { recording: newRecording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY
			);
			
			setRecording(newRecording);
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		} catch (error) {
			console.error('Failed to start recording:', error);
			setStatus('idle');
		}
	};

	const stopRecording = async () => {
		if (!recording) return;

		try {
			setStatus('thinking');
			
			// Stop animations
			pulseScale.value = withSpring(1);
			orbGlow.value = withSpring(0.5);

			await recording.stopAndUnloadAsync();
			const uri = recording.getURI();
			setRecording(null);

			if (!uri) {
				setStatus('idle');
				return;
			}

			// Convert audio to base64
			const response = await fetch(uri);
			const blob = await response.blob();
			const arrayBuffer = await blob.arrayBuffer();
			const base64 = Buffer.from(arrayBuffer).toString('base64');

			// Send to backend
			await processVoiceMessage(base64);
		} catch (error) {
			console.error('Failed to stop recording:', error);
			setStatus('idle');
		}
	};

	const processVoiceMessage = async (audioData: string) => {
		try {
			const response = await chat.sendVoice(audioData, sessionId, 'en');
			const { audioData: responseAudio } = response.data.data;

			// Play TTS response
			if (responseAudio) {
				await playTTS(responseAudio);
			}
		} catch (error) {
			console.error('Voice processing failed:', error);
			Alert.alert('Error', 'Failed to process voice message');
			setStatus('idle');
		}
	};

	const playTTS = async (audioBase64: string) => {
		try {
			setStatus('speaking');
			
			// Speaking animation
			pulseScale.value = withRepeat(
				withSequence(
					withTiming(1.1, { duration: 600 }),
					withTiming(1, { duration: 600 })
				),
				-1,
				true
			);

			// Convert base64 to audio buffer
			const audioUri = `data:audio/wav;base64,${audioBase64}`;

			// Unload previous sound if exists
			if (soundRef.current) {
				await soundRef.current.unloadAsync();
			}

			// Create and play new sound
			const { sound } = await Audio.Sound.createAsync(
				{ uri: audioUri },
				{ shouldPlay: true }
			);
			
			soundRef.current = sound;

			// Listen for playback status
			sound.setOnPlaybackStatusUpdate((status) => {
				if (status.isLoaded && status.didJustFinish) {
					setStatus('idle');
					pulseScale.value = withSpring(1);
				}
			});

			await sound.playAsync();
		} catch (error) {
			console.error('TTS playback failed:', error);
			setStatus('idle');
		}
	};

	// Animated styles
	const orbStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulseScale.value }],
		opacity: orbOpacity.value,
	}));

	const orbGlowStyle = useAnimatedStyle(() => ({
		shadowOpacity: orbGlow.value,
		shadowRadius: interpolate(orbGlow.value, [0, 1], [10, 30]),
	}));

	const rippleStyle = useAnimatedStyle(() => ({
		transform: [{ scale: rippleScale.value }],
		opacity: rippleOpacity.value,
	}));

	const getOrbColor = () => {
		switch (status) {
			case 'listening': return '#2563eb';
			case 'thinking': return '#f59e0b';
			case 'speaking': return '#10b981';
			default: return '#6b7280';
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Main Voice Interface */}
			<View style={styles.voiceInterface}>
				{/* Animated Orb */}
				<View style={styles.orbContainer}>
					{/* Ripple effect */}
					<Animated.View style={[styles.ripple, rippleStyle]} />
					
					{/* Main orb */}
					<Animated.View 
						style={[
							styles.orb, 
							orbStyle, 
							orbGlowStyle,
							{ backgroundColor: getOrbColor() }
						]} 
					/>
				</View>

				{/* Mic Button */}
				<TouchableOpacity
					style={styles.micButton}
					onPressIn={startRecording}
					onPressOut={stopRecording}
					activeOpacity={0.8}
				>
					<View style={styles.micIcon} />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0b0b0c',
	},
	voiceInterface: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	orbContainer: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 80,
	},
	orb: {
		width: 220,
		height: 220,
		borderRadius: 110,
		shadowColor: '#ffffff',
		shadowOffset: { width: 0, height: 0 },
		elevation: 20,
	},
	ripple: {
		position: 'absolute',
		width: 220,
		height: 220,
		borderRadius: 110,
		borderWidth: 2,
		borderColor: '#2563eb',
	},
	micButton: {
		position: 'absolute',
		bottom: 100,
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#111827',
		borderWidth: 3,
		borderColor: '#374151',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	micIcon: {
		width: 24,
		height: 24,
		backgroundColor: '#ffffff',
		borderRadius: 12,
	},
});