import { Agentkit, AgentkitToolkit } from '@0xgasless/agentkit';
import crypto from 'crypto';

export interface UserAccountContext {
	userId: string;
	agentkit: Agentkit;
	toolkit: AgentkitToolkit;
	address: string;
	privateKey: `0x${string}`;
}

// In-memory cache (replace with DB/Redis in production)
const userIdToAccount = new Map<string, Promise<UserAccountContext>>();

function deriveDevPrivateKey(userId: string): `0x${string}` {
	// DEV-ONLY key derivation; replace with secure KMS or user-provided keys
	const base = process.env.ZEROXGASLESS_PRIVATE_KEY || '0x10e376a4fd289f943fea2ff4f73b6e1474886606f17b7ad79b66ba06ecb255f6';
	const hash = crypto.createHash('sha256').update(`${base}:${userId}`).digest('hex');
	return (`0x${hash}` as `0x${string}`);
}

export async function getOrCreateUserAccount(userId: string): Promise<UserAccountContext> {
	if (!userId) throw new Error('Missing userId');
	const existing = userIdToAccount.get(userId);
	if (existing) return existing;

	const created = (async () => {
		const rpcUrl = process.env.RPC_URL as string;
		const apiKey = process.env.ZEROXGASLESS_API_KEY as string;
		const chainID = Number(process.env.CHAIN_ID) || 1;
		const privateKey = deriveDevPrivateKey(userId);

		const agentkit = await Agentkit.configureWithWallet({ privateKey, rpcUrl, apiKey, chainID });
		const toolkit = new AgentkitToolkit(agentkit);
		const address = await agentkit.getAddress();

		return { userId, agentkit, toolkit, address, privateKey };
	})();

	userIdToAccount.set(userId, created);
	return created;
}