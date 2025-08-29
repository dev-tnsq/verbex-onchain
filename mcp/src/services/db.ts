import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.warn('[db] DATABASE_URL not set. Database features will be disabled.');
}

export const pool = connectionString
	? new Pool({ connectionString, ssl: { rejectUnauthorized: false } as any })
	: (null as unknown as Pool);

export async function initDb() {
	if (!pool) return;
	await pool.query(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE,
			password TEXT,
			preferences JSONB
		);
		CREATE TABLE IF NOT EXISTS smart_accounts (
			user_id TEXT PRIMARY KEY,
			chain_id INTEGER NOT NULL,
			address TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			role TEXT,
			content TEXT,
			created_at TIMESTAMP DEFAULT NOW()
		);
		CREATE TABLE IF NOT EXISTS actions (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			action TEXT,
			params JSONB,
			result JSONB,
			tx_hash TEXT,
			created_at TIMESTAMP DEFAULT NOW()
		);
	`);
}

export async function createUser(id: string, email: string, password: string, preferences?: any) {
	if (!pool) return;
	await pool.query(
		`INSERT INTO users (id, email, password, preferences) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
		[id, email, password, preferences || null]
	);
}

export async function getUserByEmail(email: string) {
	if (!pool) return null;
	const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1 LIMIT 1`, [email]);
	return rows[0] || null;
}

export async function getUserById(id: string) {
	if (!pool) return null;
	const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1 LIMIT 1`, [id]);
	return rows[0] || null;
}

export async function upsertSmartAccount(userId: string, chainId: number, address: string) {
	if (!pool) return;
	await pool.query(
		`INSERT INTO smart_accounts (user_id, chain_id, address) VALUES ($1, $2, $3)
		 ON CONFLICT (user_id) DO UPDATE SET chain_id=EXCLUDED.chain_id, address=EXCLUDED.address`,
		[userId, chainId, address]
	);
}

export async function logMessage(id: string, userId: string, role: 'user'|'assistant', content: string) {
	if (!pool) return;
	await pool.query(
		`INSERT INTO messages (id, user_id, role, content) VALUES ($1, $2, $3, $4)`,
		[id, userId, role, content]
	);
}

export async function logAction(id: string, userId: string, action: string, params: any, result: any, txHash?: string) {
	if (!pool) return;
	await pool.query(
		`INSERT INTO actions (id, user_id, action, params, result, tx_hash) VALUES ($1, $2, $3, $4, $5, $6)`,
		[id, userId, action, params ?? null, result ?? null, txHash ?? null]
	);
}