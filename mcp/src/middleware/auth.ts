import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'verbex-secret-key';

export interface AuthedRequest extends Request {
	user?: {
		id: string;
		email: string;
		preferences?: any;
	};
}

export function signToken(payload: any): string {
	const expiresIn = '24h';
	const opts: SignOptions = { expiresIn };
	return jwt.sign(payload, JWT_SECRET, opts);
}

export function authenticateToken(req: AuthedRequest, res: Response, next: NextFunction): void {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		res.status(401).json({ success: false, error: 'Access token required' });
		return;
	}

	jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
		if (err) {
			res.status(403).json({ success: false, error: 'Invalid or expired token' });
			return;
		}
		req.user = user;
		next();
	});
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
	authenticateToken(req, res, next);
}