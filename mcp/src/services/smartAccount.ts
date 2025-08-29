import { createSmartAccountClient } from '@0xgasless/smart-account';
import { 
	Hex,
	createWalletClient,
	encodeFunctionData,
	http,
	parseAbi,
	WalletClient
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, avalanche, Chain } from 'viem/chains';
import crypto from 'crypto';
import { pool, upsertSmartAccount } from './db';

interface SmartAccountResult {
	signer: WalletClient;
	smartAccount: any;
	smartAccountAddress: string;
}

function pickChain(): Chain {
	const chainId = Number(process.env.CHAIN_ID) || 43114;
	if (chainId === 8453) return base;
	return avalanche; // default avalanche c-chain
}

function randomPrivateKey(): `0x${string}` {
	return ('0x' + crypto.randomBytes(32).toString('hex')) as `0x${string}`;
}

async function getUserEOAKey(userId: string): Promise<`0x${string}`> {
	if (!pool) return randomPrivateKey();
	await pool.query(`CREATE TABLE IF NOT EXISTS user_keys (user_id TEXT PRIMARY KEY, eoa_private_key TEXT)`);
	const { rows } = await pool.query(`SELECT eoa_private_key FROM user_keys WHERE user_id=$1`, [userId]);
	if (rows[0]?.eoa_private_key) return rows[0].eoa_private_key as `0x${string}`;
	const pk = randomPrivateKey();
	await pool.query(`INSERT INTO user_keys (user_id, eoa_private_key) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`, [userId, pk]);
	return pk;
}

export async function getOrCreateSmartAccount(userId: string): Promise<SmartAccountResult> {
	const chain = pickChain();
	const bundlerUrl = (process.env.BUNDLER_URL || 'https://bundler.0xgasless.com/{chainId}').replace('{chainId}', String(chain.id));
	const eoaPk = await getUserEOAKey(userId);
	const account = privateKeyToAccount(eoaPk);
	const signer = createWalletClient({ account, chain, transport: http() });
	const smartAccount = await createSmartAccountClient({ signer, bundlerUrl });
	const smartAccountAddress = await smartAccount.getAccountAddress();
	try { await upsertSmartAccount(userId, chain.id, smartAccountAddress); } catch {}
	return { signer, smartAccount, smartAccountAddress };
}

export async function mintNftToSelf(userId: string, nftAddress: string): Promise<{ transactionHash: string; success: boolean; receipt: any; }> {
	const { smartAccount, smartAccountAddress } = await getOrCreateSmartAccount(userId);
	const abi = parseAbi([ 'function safeMint(address _to)' ]);
	const data = encodeFunctionData({ abi, functionName: 'safeMint', args: [smartAccountAddress as Hex] });
	const userOpResponse = await smartAccount.sendTransaction({ to: nftAddress as Hex, data });
	const { transactionHash } = await userOpResponse.waitForTxHash();
	const receipt = await userOpResponse.wait();
	return { transactionHash, success: receipt.success === 'true', receipt };
}