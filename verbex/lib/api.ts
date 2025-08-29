import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
	try {
		const token = await AsyncStorage.getItem('verbex.jwt');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	} catch (error) {
		console.error('Error getting auth token:', error);
	}
	return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Token expired or invalid, clear it
			await AsyncStorage.removeItem('verbex.jwt');
		}
		return Promise.reject(error);
	}
);

// Auth endpoints
export const auth = {
	signup: (email: string, password: string) =>
		api.post('/auth/signup', { email, password }),
	login: (email: string, password: string) =>
		api.post('/auth/login', { email, password }),
	me: () => api.get('/auth/me'),
};

// Chat endpoints
export const chat = {
	sendMessage: (message: string, sessionId: string, context?: any) =>
		api.post('/chat', { message, sessionId, context }),
	sendVoice: (audioData: string, sessionId: string, language?: string) =>
		api.post('/voice', { audioData, sessionId, language }),
	getTools: () => api.get('/tools'),
	getAddress: () => api.get('/address'),
};

// Health check
export const health = {
	check: () => api.get('/health'),
};

export { api };
export default api;