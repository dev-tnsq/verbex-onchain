import { avalanche, base, Chain } from 'viem/chains';

export type SupportedNetwork = 'avalanche' | 'base';

export function getChainByName(name: string | undefined): Chain {
	const n = (name || 'avalanche').toLowerCase();
	if (n === 'base') return base;
	return avalanche;
}

export function getRpcUrlFor(name: string | undefined): string {
	// Prefer explicit RPC_URL, otherwise fallback to public RPCs if available
	if (process.env.RPC_URL) return process.env.RPC_URL;
	const n = (name || 'avalanche').toLowerCase();
	if (n === 'base') return 'https://mainnet.base.org';
	return 'https://api.avax.network/ext/bc/C/rpc';
}