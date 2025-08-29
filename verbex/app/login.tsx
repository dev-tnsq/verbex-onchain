import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Container from '../components/Container';
import { useAuth } from '../context/AuthProvider';
import { auth } from '../lib/api';
import { router } from 'expo-router';

export default function LoginScreen() {
	const { saveToken } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const onLogin = async () => {
		if (!email || !password) return;
		setLoading(true);
		try {
			const res = await auth.login(email, password);
			await saveToken(res.data.data.token);
			router.replace('/');
		} catch (e: any) {
			Alert.alert('Login failed', e?.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	const onSignup = async () => {
		if (!email || !password) return;
		setLoading(true);
		try {
			const res = await auth.signup(email, password);
			await saveToken(res.data.data.token);
			router.replace('/');
		} catch (e: any) {
			Alert.alert('Signup failed', e?.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
			<Container>
				<View style={styles.card}>
					<Text style={styles.title}>Welcome to Verbex</Text>
					<Text style={styles.subtitle}>Sign in to continue</Text>
					<TextInput
						style={styles.input}
						placeholder="Email"
						placeholderTextColor="#9ca3af"
						keyboardType="email-address"
						autoCapitalize="none"
						value={email}
						onChangeText={setEmail}
					/>
					<TextInput
						style={styles.input}
						placeholder="Password"
						placeholderTextColor="#9ca3af"
						secureTextEntry
						value={password}
						onChangeText={setPassword}
					/>
					<TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={onLogin} disabled={loading}>
						<Text style={styles.buttonText}>Login</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.buttonAlt, loading && { opacity: 0.7 }]} onPress={onSignup} disabled={loading}>
						<Text style={styles.buttonAltText}>Create account</Text>
					</TouchableOpacity>
				</View>
			</Container>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 500,
		alignSelf: 'center',
		backgroundColor: '#111827',
		borderRadius: 16,
		padding: 20,
		marginVertical: 40,
		borderWidth: 1,
		borderColor: '#1f2937',
	},
	title: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		color: '#9ca3af',
		textAlign: 'center',
		marginBottom: 16,
	},
	input: {
		backgroundColor: '#0b0b0c',
		borderWidth: 1,
		borderColor: '#1f2937',
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#fff',
		marginBottom: 12,
	},
	button: {
		backgroundColor: '#2563eb',
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
		marginTop: 4,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '700',
	},
	buttonAlt: {
		backgroundColor: '#0b0b0c',
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
		marginTop: 10,
		borderWidth: 1,
		borderColor: '#1f2937',
	},
	buttonAltText: {
		color: '#9ca3af',
		fontWeight: '600',
	},
});