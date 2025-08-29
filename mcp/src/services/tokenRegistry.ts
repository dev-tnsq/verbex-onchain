export type TokenMap = Record<string, `0x${string}`>;

// Chain IDs
export const CHAIN_BASE = 8453;
export const CHAIN_AVALANCHE = 43114;

// Minimal registry; extend as needed
export const tokenMappings: Record<number, TokenMap> = {
	[CHAIN_AVALANCHE]: {
		AVAX: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
		USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC.e on Avalanche C
		WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH.e
		USDT: '0x9702230A8Ea53601f5cd2dc00fDBc13d4dF4A8c7',
	},
	[CHAIN_BASE]: {
		ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
		USDC: '0x833589fCD6EDB6E08f4c7C32D4f71b54bdA02913',
		WETH: '0x4200000000000000000000000000000000000006',
		USDT: '0xfF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
	},
};

export function resolveTokenSymbols(chainId: number, symbols: string[] = []): `0x${string}`[] {
	const map = tokenMappings[chainId] || {};
	const resolved: `0x${string}`[] = [];
	symbols.forEach((sym) => {
		const addr = map[sym.toUpperCase()];
		if (addr) resolved.push(addr);
	});
	return resolved;
}