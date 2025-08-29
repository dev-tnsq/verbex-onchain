import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, saveToken as storageSaveToken, clearToken as storageClearToken } from '../lib/auth';

interface AuthContextValue {
	token: string | null;
	isAuthenticated: boolean;
	saveToken: (token: string) => Promise<void>;
	clearToken: () => Promise<void>;
	loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const t = await getToken();
			setToken(t);
			setLoading(false);
		})();
	}, []);

	const saveToken = async (t: string) => {
		await storageSaveToken(t);
		setToken(t);
	};

	const clearToken = async () => {
		await storageClearToken();
		setToken(null);
	};

	const value = useMemo(() => ({ token, isAuthenticated: !!token, saveToken, clearToken, loading }), [token, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}