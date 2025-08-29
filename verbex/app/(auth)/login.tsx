import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { api, setAuthToken } from '../../lib/api';
import { saveToken } from '../../lib/auth';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function onLogin() {
		try {
			setLoading(true);
			const { data } = await api.post('/auth/login', { email, password });
			const token = data?.data?.token;
			if (!token) throw new Error('No token');
			await saveToken(token);
			setAuthToken(token);
			Alert.alert('Logged in');
		} catch (e: any) {
			Alert.alert('Login failed', e?.message || 'Error');
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
			<TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
			<Button title={loading ? '...' : 'Login'} onPress={onLogin} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: '#0b0b0c' },
	title: { color: '#fff', fontSize: 22, marginBottom: 16 },
	input: { backgroundColor: '#111827', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }
});