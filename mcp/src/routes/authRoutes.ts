import { Router } from 'express';
import { signToken, requireAuth, AuthedRequest } from '../middleware/auth';
import { createUser, getUserByEmail } from '../services/db';
import { getOrCreateUserAccount } from '../services/userAccounts';

const router = Router();

router.post('/signup', async (req, res) => {
	try {
		const { email, password, preferences } = req.body || {};
		if (!email || !password) {
			return res.status(400).json({ success: false, error: 'email and password required' });
		}
		const existing = await getUserByEmail(email);
		if (existing) {
			return res.status(409).json({ success: false, error: 'user already exists' });
		}
		const id = `${Date.now()}`;
		await createUser(id, email, password, preferences);
		
		// Create smart wallet for new user
		const { address: smartAccountAddress } = await getOrCreateUserAccount(id);
		
		const token = signToken({ id, email, preferences });
		return res.json({ 
			success: true, 
			data: { 
				token, 
				user: { id, email, preferences },
				smartAccountAddress 
			} 
		});
	} catch (e: any) {
		return res.status(500).json({ success: false, error: e?.message || 'signup failed' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) {
			return res.status(400).json({ success: false, error: 'invalid credentials' });
		}
		const user = await getUserByEmail(email);
		if (!user || user.password !== password) {
			return res.status(401).json({ success: false, error: 'invalid credentials' });
		}
		
		// Get user's smart account if exists
		let smartAccountAddress = null;
		try {
			const { address } = await getOrCreateUserAccount(user.id);
			smartAccountAddress = address;
		} catch (e) {
			// Smart account creation failed, continue without it
		}
		
		const token = signToken({ id: user.id, email: user.email, preferences: user.preferences });
		return res.json({ 
			success: true, 
			data: { 
				token, 
				user: { id: user.id, email: user.email, preferences: user.preferences },
				smartAccountAddress 
			} 
		});
	} catch (e: any) {
		return res.status(500).json({ success: false, error: e?.message || 'login failed' });
	}
});

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
	return res.json({ success: true, data: { user: req.user } });
});

export default router;