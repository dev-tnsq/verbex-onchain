import { Agentkit, AgentkitToolkit } from '@0xgasless/agentkit';
import { createWalletClient, createPublicClient, http, formatEther, parseAbi, encodeFunctionData, parseUnits, formatUnits, toHex, fromHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getChainByName } from './chain';
import { resolveTokenSymbols } from './tokenRegistry';
import { createSmartAccountClient } from '@0xgasless/smart-account';

export type ToolHandler = (args: any, ctx: { userPrivateKey: `0x${string}`; network: string; smartAccountAddress: string; }) => Promise<string>;

async function configureToolkit(userPrivateKey: `0x${string}`, network: string) {
	const chain = getChainByName(network);
	const account = privateKeyToAccount(userPrivateKey);
	const walletClient = createWalletClient({ account, chain, transport: http() });
	const publicClient = createPublicClient({ chain, transport: http() });
	const agentkit = await Agentkit.configureWithWallet({
		privateKey: userPrivateKey,
		rpcUrl: process.env.RPC_URL as string,
		apiKey: process.env.ZEROXGASLESS_API_KEY as string,
		chainID: chain.id
	});
	const toolkit = new AgentkitToolkit(agentkit);
	return { agentkit, toolkit, chain, walletClient, publicClient };
}

async function getSmartAccount(userPrivateKey: `0x${string}`, chainId: number, walletClient: any) {
	const bundlerUrl = (process.env.BUNDLER_URL || 'https://bundler.0xgasless.com/{chainId}').replace('{chainId}', String(chainId));
	return createSmartAccountClient({ signer: walletClient, bundlerUrl });
}

// Core Account Functions
export const getAddressHandler: ToolHandler = async (_args, ctx) => {
	return `Smart Account: ${ctx.smartAccountAddress}\nNetwork: ${ctx.network}`;
};

export const getBalanceHandler: ToolHandler = async (args, ctx) => {
	const { chain, publicClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
	const walletAddress = ctx.smartAccountAddress as `0x${string}`;
	const chainId = chain.id;

	let tokenAddresses: `0x${string}`[] = [];
	if (Array.isArray(args?.tokenAddresses) && args.tokenAddresses.length > 0) {
		tokenAddresses.push(...(args.tokenAddresses as `0x${string}`[]));
	}
	if (Array.isArray(args?.tokenSymbols) && args.tokenSymbols.length > 0) {
		tokenAddresses.push(...resolveTokenSymbols(chainId, args.tokenSymbols));
	}

	let lines: string[] = [];
	try {
		const nativeBal = await publicClient.getBalance({ address: walletAddress });
		const nativeSymbol = chain.nativeCurrency?.symbol || (chainId === 43114 ? 'AVAX' : 'ETH');
		lines.push(`${nativeSymbol}: ${Number(formatEther(nativeBal)).toFixed(6)}`);
	} catch (e) {
		console.error('Error getting native balance:', e);
	}

	for (const addr of tokenAddresses) {
		if (addr.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') continue;
		try {
			const decimals = await publicClient.readContract({ address: addr, abi: parseAbi(['function decimals() view returns (uint8)']), functionName: 'decimals' });
			const symbol = await publicClient.readContract({ address: addr, abi: parseAbi(['function symbol() view returns (string)']), functionName: 'symbol' });
			const bal = await publicClient.readContract({ address: addr, abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [walletAddress] });
			const factor = BigInt(10) ** BigInt(decimals as number);
			const integer = (bal as bigint);
			const value = Number(integer) / Number(factor);
			if (value > 0) lines.push(`${String(symbol)}: ${value.toFixed(6)}`);
		} catch (e) {
			console.error(`Error getting balance for ${addr}:`, e);
		}
	}

	if (lines.length === 0) {
		return `Smart Account: ${walletAddress}\nNo balances found for the requested tokens`;
	}
	const header = tokenAddresses.length > 0 ? 'Balances:' : 'All Token Balances:';
	return `Smart Account: ${walletAddress}\n${header}\n${lines.join('\n')}`;
};

// Token Functions
export const getTokenDetailsHandler: ToolHandler = async (args, ctx) => {
	const { chain, publicClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
	const addr = args?.tokenAddress as `0x${string}`;
	if (!addr) return 'Error getting token details: tokenAddress is required';
	try {
		const [name, symbol, decimals, totalSupply] = await Promise.all([
			publicClient.readContract({ address: addr, abi: parseAbi(['function name() view returns (string)']), functionName: 'name' }),
			publicClient.readContract({ address: addr, abi: parseAbi(['function symbol() view returns (string)']), functionName: 'symbol' }),
			publicClient.readContract({ address: addr, abi: parseAbi(['function decimals() view returns (uint8)']), functionName: 'decimals' }),
			publicClient.readContract({ address: addr, abi: parseAbi(['function totalSupply() view returns (uint256)']), functionName: 'totalSupply' }),
		]);
		const formattedSupply = formatUnits(totalSupply as bigint, decimals as number);
		return `Token Details:\nName: ${name}\nSymbol: ${symbol}\nDecimals: ${decimals}\nTotal Supply: ${formattedSupply}\nAddress: ${addr}\nChain ID: ${chain.id}`;
	} catch (e: any) {
		return `Error getting token details: ${e?.message || 'unknown error'}`;
	}
};

export const approveTokenHandler: ToolHandler = async (args, ctx) => {
	try {
		const { chain, walletClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		const tokenAddress = args?.tokenAddress as `0x${string}`;
		const spender = args?.spender as `0x${string}`;
		const amount = args?.amount as string;
		const approveMax = Boolean(args?.approveMax ?? false);
		
		if (!tokenAddress || !spender || !amount) {
			return 'Error: tokenAddress, spender, and amount are required';
		}

		const approveAbi = parseAbi(['function approve(address spender, uint256 amount) returns (bool)']);
		const approveAmount = approveMax ? (2n ** 256n - 1n) : parseUnits(amount, 18);
		const approveData = encodeFunctionData({ abi: approveAbi, functionName: 'approve', args: [spender, approveAmount] });
		
		const userOpResponse = await smartAccount.sendTransaction({ 
			to: tokenAddress, 
			data: approveData, 
			value: 0n 
		});
		const { transactionHash } = await userOpResponse.waitForTxHash();
		
		return `Token approval submitted successfully!\nToken: ${tokenAddress}\nSpender: ${spender}\nAmount: ${approveMax ? 'MAX' : amount}\nTransaction Hash: ${transactionHash || 'pending'}`;
	} catch (e: any) {
		return `Error approving token: ${e?.message || 'failed'}`;
	}
};

// Contract Functions
export const readContractHandler: ToolHandler = async (args, ctx) => {
	const { publicClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
	try {
		const contractAddress = args?.contractAddress as `0x${string}`;
		const abiString = args?.abiString as string;
		const functionName = args?.functionName as string;
		const parsedAbi = parseAbi(JSON.parse(abiString));
		const argsArray = args?.argsString ? JSON.parse(args.argsString) : [];
		const result = await publicClient.readContract({ address: contractAddress, abi: parsedAbi, functionName, args: argsArray });
		return `Result: ${typeof result === 'string' ? result : JSON.stringify(result)}`;
	} catch (e: any) {
		return `Error in read_contract: ${e?.message || 'failed'}`;
	}
};

export const encodeFunctionDataHandler: ToolHandler = async (args) => {
	try {
		const abiString = args?.abiString as string;
		const functionName = args?.functionName as string;
		const parsedAbi = parseAbi(JSON.parse(abiString));
		const fnArgs = args?.argsString ? JSON.parse(args.argsString) : [];
		const data = encodeFunctionData({ abi: parsedAbi, functionName, args: fnArgs });
		return `Encoded Data: ${data}`;
	} catch (e: any) {
		return `Error: Failed to encode function data: ${e?.message || 'failed'}`;
	}
};

// Transaction Functions
export const sendTransactionHandler: ToolHandler = async (args, ctx) => {
	try {
		const { chain, walletClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		const to = args?.to as `0x${string}`;
		const data = (args?.data as string) || '0x';
		const value = args?.value ? BigInt(args.value) : 0n;
		
		if (!to) return 'Error: "to" address is required';
		
		const userOpResponse = await smartAccount.sendTransaction({ to, data, value });
		const { transactionHash } = await userOpResponse.waitForTxHash();
		
		return `Transaction submitted successfully!\nTo: ${to}\nValue: ${formatEther(value)} ${chain.nativeCurrency?.symbol}\nTransaction Hash: ${transactionHash || 'pending'}\nUse 'get_transaction_status' to check confirmation.`;
	} catch (e: any) {
		return `Error: Failed to send transaction: ${e?.message || 'failed'}`;
	}
};

export const batchTransactionsHandler: ToolHandler = async (args, ctx) => {
	try {
		const { chain, walletClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		const transactions = args?.transactions as Array<{to: string, data?: string, value?: string}>;
		
		if (!Array.isArray(transactions) || transactions.length === 0) {
			return 'Error: transactions array is required';
		}

		const userOpResponse = await smartAccount.sendTransaction(
			transactions.map(tx => ({
				to: tx.to as `0x${string}`,
				data: (tx.data as `0x${string}`) || '0x',
				value: tx.value ? BigInt(tx.value) : 0n
			}))
		);
		const { transactionHash } = await userOpResponse.waitForTxHash();
		
		return `Batch transaction submitted successfully!\nNumber of transactions: ${transactions.length}\nTransaction Hash: ${transactionHash || 'pending'}`;
	} catch (e: any) {
		return `Error: Failed to send batch transactions: ${e?.message || 'failed'}`;
	}
};

// Transfer Functions
export const smartTransferHandler: ToolHandler = async (args, ctx) => {
	try {
		const { chain, walletClient, publicClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		const destination = args?.destination as `0x${string}`;
		const tokenAddress = (args?.tokenAddress as string) || 'eth';
		const amount = args?.amount as string;
		
		if (!destination || !amount) return 'Error transferring the asset: destination and amount are required';
		
		if (tokenAddress.toLowerCase() === 'eth') {
			const value = parseUnits(amount, 18);
			const userOpResponse = await smartAccount.sendTransaction({ to: destination, data: '0x', value });
			const { transactionHash } = await userOpResponse.waitForTxHash();
			return `Successfully transferred ${amount} ${chain.nativeCurrency?.symbol}.\nTransaction submitted! Transaction Hash: ${transactionHash || 'pending'}`;
		}
		
		const decimalsAbi = parseAbi(['function decimals() view returns (uint8)']);
		const tokenAbi = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);
		const decimals = (await publicClient.readContract({ address: tokenAddress as `0x${string}`, abi: decimalsAbi, functionName: 'decimals' })) as number;
		const value = parseUnits(amount, decimals || 18);
		const data = encodeFunctionData({ abi: tokenAbi, functionName: 'transfer', args: [destination, value] });
		const userOpResponse = await smartAccount.sendTransaction({ to: tokenAddress as `0x${string}`, data, value: 0n });
		const { transactionHash } = await userOpResponse.waitForTxHash();
		return `Successfully transferred ${amount} tokens from contract ${tokenAddress} to ${destination}.\nTransaction submitted! Transaction Hash: ${transactionHash || 'pending'}`;
	} catch (e: any) {
		return `Error transferring the asset: ${e?.message || 'failed'}`;
	}
};

// Status Functions
export const getTransactionStatusHandler: ToolHandler = async (args, ctx) => {
	try {
		const { publicClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const txHash = args?.transactionHash as `0x${string}` | undefined;
		if (!txHash) return 'Transaction status: transactionHash is required';
		
		const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
		if (!receipt) return 'Transaction is still pending.';
		
		if (receipt.status === 'success') {
			return `Transaction confirmed!\nBlock Number: ${receipt.blockNumber}\nGas Used: ${receipt.gasUsed}\nTransaction Hash: ${txHash}`;
		}
		return `Transaction failed!\nTransaction Hash: ${txHash}`;
	} catch (e: any) {
		return `Error checking transaction status: ${e?.message || 'failed'}`;
	}
};

// Swap Functions
export const smartSwapHandler: ToolHandler = async (args, ctx) => {
	try {
		const network = ctx.network || 'avalanche';
		const { chain, walletClient, publicClient } = await configureToolkit(ctx.userPrivateKey, network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		let tokenIn = args?.tokenIn as string | undefined;
		let tokenOut = args?.tokenOut as string | undefined;
		const chainId = chain.id;
		
		if (args?.tokenInSymbol && !tokenIn) tokenIn = resolveTokenSymbols(chainId, [String(args.tokenInSymbol)])[0];
		if (args?.tokenOutSymbol && !tokenOut) tokenOut = resolveTokenSymbols(chainId, [String(args.tokenOutSymbol)])[0];
		const amount = String(args?.amount || '0');
		const wait = Boolean(args?.wait ?? true);
		const approveMax = Boolean(args?.approveMax ?? false);
		
		if (!tokenIn || !tokenOut || !amount) return 'Error creating swap: tokenIn, tokenOut and amount are required';

		const baseUrl = 'https://dln.debridge.finance/v1.0/chain/transaction';
		const params = new URLSearchParams({
			chainId: String(chainId),
			tokenIn,
			tokenOut,
			tokenInAmount: amount,
			tokenOutRecipient: ctx.smartAccountAddress,
			slippage: String(args?.slippage || 'auto'),
			affiliateFeePercent: '0',
		});
		const url = `${baseUrl}?${params.toString()}`;
		const res = await fetch(url);
		const txData: any = await res.json();
		
		if (!res.ok || (txData && (txData as any).errorMessage)) {
			return `Swap failed: ${(txData as any)?.errorMessage || 'Bad request'}`;
		}

		// Handle approval if needed
		if (tokenIn.toLowerCase() !== '0x0000000000000000000000000000000000000000' && tokenIn.toLowerCase() !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
			const spender = (txData as any)?.tx?.to as `0x${string}`;
			if (!spender) return 'Swap failed: Missing spender address';
			
			const decimals = await publicClient.readContract({ address: tokenIn as `0x${string}`, abi: parseAbi(['function decimals() view returns (uint8)']), functionName: 'decimals' });
			const need = parseUnits(amount, (decimals as number) || 18);
			const allowance = await publicClient.readContract({ address: tokenIn as `0x${string}`, abi: parseAbi(['function allowance(address owner, address spender) view returns (uint256)']), functionName: 'allowance', args: [ctx.smartAccountAddress as `0x${string}`, spender] });
			
			if ((allowance as bigint) < need) {
				const approveAbi = parseAbi(['function approve(address spender, uint256 amount) returns (bool)']);
				const approveAmount = approveMax ? (2n ** 256n - 1n) : need;
				const approveData = encodeFunctionData({ abi: approveAbi, functionName: 'approve', args: [spender, approveAmount] });
				const approvalOp = await smartAccount.sendTransaction({ to: tokenIn as `0x${string}`, data: approveData, value: 0n });
				const { transactionHash: approvalHash } = await approvalOp.waitForTxHash();
				
				if (wait && approvalHash) {
					await publicClient.getTransactionReceipt({ hash: approvalHash as `0x${string}` });
				}
			}
		}

		const to = (txData as any)?.tx?.to as `0x${string}`;
		const data = (txData as any)?.tx?.data as `0x${string}`;
		const value = (txData as any)?.tx?.value ? BigInt((txData as any).tx.value) : 0n;
		
		if (!to || !data) return 'Swap failed: Missing transaction data';
		
		const swapOp = await smartAccount.sendTransaction({ to, data, value });
		const { transactionHash } = await swapOp.waitForTxHash();
		
		let tail = '';
		if (wait && transactionHash) {
			const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash as `0x${string}` });
			tail = receipt?.status === 'success' ? `\nSwap completed and confirmed!` : `\nSwap submitted.`;
		} else {
			tail = `\nSwap submitted.`;
		}
		
		return `Swap order submitted successfully!\nInput: ${amount}\nTransaction Hash: ${transactionHash || 'pending'}${tail}`;
	} catch (e: any) {
		return `Error creating swap order: ${e?.message || 'failed'}`;
	}
};

// NFT Functions
export const mintNFTHandler: ToolHandler = async (args, ctx) => {
	try {
		const { chain, walletClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		const contractAddress = args?.contractAddress as `0x${string}`;
		const to = args?.to || ctx.smartAccountAddress;
		const tokenId = args?.tokenId;
		
		if (!contractAddress) return 'Error: contractAddress is required';
		
		// Standard ERC721 mint function
		const mintAbi = parseAbi(['function mint(address to, uint256 tokenId)']);
		const mintData = encodeFunctionData({ 
			abi: mintAbi, 
			functionName: 'mint', 
			args: [to as `0x${string}`, BigInt(tokenId || 1)] 
		});
		
		const userOpResponse = await smartAccount.sendTransaction({ 
			to: contractAddress, 
			data: mintData, 
			value: 0n 
		});
		const { transactionHash } = await userOpResponse.waitForTxHash();
		
		return `NFT minted successfully!\nContract: ${contractAddress}\nTo: ${to}\nToken ID: ${tokenId || 1}\nTransaction Hash: ${transactionHash || 'pending'}`;
	} catch (e: any) {
		return `Error minting NFT: ${e?.message || 'failed'}`;
	}
};

export const transferNFTHandler: ToolHandler = async (args, ctx) => {
	try {
		const { chain, walletClient } = await configureToolkit(ctx.userPrivateKey, ctx.network);
		const smartAccount = await getSmartAccount(ctx.userPrivateKey, chain.id, walletClient);
		const contractAddress = args?.contractAddress as `0x${string}`;
		const from = args?.from || ctx.smartAccountAddress;
		const to = args?.to as `0x${string}`;
		const tokenId = args?.tokenId;
		
		if (!contractAddress || !to || !tokenId) {
			return 'Error: contractAddress, to, and tokenId are required';
		}
		
		const transferAbi = parseAbi(['function transferFrom(address from, address to, uint256 tokenId)']);
		const transferData = encodeFunctionData({ 
			abi: transferAbi, 
			functionName: 'transferFrom', 
			args: [from as `0x${string}`, to, BigInt(tokenId)] 
		});
		
		const userOpResponse = await smartAccount.sendTransaction({ 
			to: contractAddress, 
			data: transferData, 
			value: 0n 
		});
		const { transactionHash } = await userOpResponse.waitForTxHash();
		
		return `NFT transferred successfully!\nContract: ${contractAddress}\nFrom: ${from}\nTo: ${to}\nToken ID: ${tokenId}\nTransaction Hash: ${transactionHash || 'pending'}`;
	} catch (e: any) {
		return `Error transferring NFT: ${e?.message || 'failed'}`;
	}
};

// Utility Functions
export const formatUnitsHandler: ToolHandler = async (args) => {
	try {
		const value = BigInt(args?.value);
		const decimals = Number(args?.decimals || 18);
		const formatted = formatUnits(value, decimals);
		return `Formatted Value: ${formatted}`;
	} catch {
		return 'Error in format_units: Cannot convert value to a BigInt';
	}
};

export const parseUnitsHandler: ToolHandler = async (args) => {
	try {
		const val = String(args?.value);
		const decimals = Number(args?.decimals || 18);
		const parsed = parseUnits(val, decimals);
		return `Parsed Value (Wei): ${parsed.toString()}`;
	} catch {
		return 'Error in parse_units: Invalid decimal format';
	}
};

export const toHexHandler: ToolHandler = async (args) => {
	try {
		const v = args?.value;
		const hexValue = toHex(v);
		return `Hex: ${hexValue}`;
	} catch { 
		return 'Error in to_hex: Unable to convert value to hex'; 
	}
};

export const fromHexHandler: ToolHandler = async (args) => {
	try {
		const hex = args?.hex as string;
		const to = String(args?.to || 'string');
		const decoded = fromHex(hex as `0x${string}`, to as any);
		return `Decoded Value: ${decoded}`;
	} catch { 
		return 'Error in from_hex: Unable to decode'; 
	}
};

// Enhanced Tool Schema
export const toolsSchema = [
	// Account Functions
	{ name: 'get_address', description: 'Retrieve the user\'s smart account address', parameters: { type: 'object', properties: {}, required: [] }, handler: getAddressHandler },
	{ name: 'get_balance', description: 'Check token balances for the smart account. Supports tokenSymbols and tokenAddresses.', parameters: { type: 'object', properties: { tokenSymbols: { type: 'array', items: { type: 'string' } }, tokenAddresses: { type: 'array', items: { type: 'string' } } }, required: [] }, handler: getBalanceHandler },
	
	// Token Functions
	{ name: 'get_token_details', description: 'Retrieve name, symbol, decimals, and total supply for an ERC-20 token', parameters: { type: 'object', properties: { tokenAddress: { type: 'string' } }, required: ['tokenAddress'] }, handler: getTokenDetailsHandler },
	{ name: 'approve_token', description: 'Approve a spender to spend tokens on behalf of the smart account', parameters: { type: 'object', properties: { tokenAddress: { type: 'string' }, spender: { type: 'string' }, amount: { type: 'string' }, approveMax: { type: 'boolean' } }, required: ['tokenAddress', 'spender', 'amount'] }, handler: approveTokenHandler },
	
	// Contract Functions
	{ name: 'read_contract', description: 'Read a view/pure function from a contract', parameters: { type: 'object', properties: { contractAddress: { type: 'string' }, abiString: { type: 'string' }, functionName: { type: 'string' }, argsString: { type: 'string' } }, required: ['contractAddress', 'abiString', 'functionName'] }, handler: readContractHandler },
	{ name: 'encode_function_data', description: 'Encode ABI function call into hex data', parameters: { type: 'object', properties: { abiString: { type: 'string' }, functionName: { type: 'string' }, argsString: { type: 'string' } }, required: ['abiString', 'functionName'] }, handler: encodeFunctionDataHandler },
	
	// Transaction Functions
	{ name: 'send_transaction', description: 'Send a gasless transaction via smart account', parameters: { type: 'object', properties: { to: { type: 'string' }, data: { type: 'string' }, value: { type: 'string' } }, required: ['to'] }, handler: sendTransactionHandler },
	{ name: 'batch_transactions', description: 'Send multiple gasless transactions in a single batch', parameters: { type: 'object', properties: { transactions: { type: 'array', items: { type: 'object', properties: { to: { type: 'string' }, data: { type: 'string' }, value: { type: 'string' } } } } }, required: ['transactions'] }, handler: batchTransactionsHandler },
	
	// Transfer Functions
	{ name: 'smart_transfer', description: 'Transfer native or ERC-20 tokens (gasless)', parameters: { type: 'object', properties: { amount: { type: 'string' }, tokenAddress: { type: 'string' }, destination: { type: 'string' }, wait: { type: 'boolean' } }, required: ['amount', 'tokenAddress', 'destination'] }, handler: smartTransferHandler },
	
	// Status Functions
	{ name: 'get_transaction_status', description: 'Check transaction status by transaction hash', parameters: { type: 'object', properties: { transactionHash: { type: 'string' } }, required: ['transactionHash'] }, handler: getTransactionStatusHandler },
	
	// Swap Functions
	{ name: 'smart_swap', description: 'Execute a swap via deBridge DLN with optional approval', parameters: { type: 'object', properties: { tokenIn: { type: 'string' }, tokenOut: { type: 'string' }, tokenInSymbol: { type: 'string' }, tokenOutSymbol: { type: 'string' }, amount: { type: 'string' }, slippage: { type: 'string' }, wait: { type: 'boolean' }, approveMax: { type: 'boolean' } }, required: ['amount'] }, handler: smartSwapHandler },
	
	// NFT Functions
	{ name: 'mint_nft', description: 'Mint an NFT using the smart account', parameters: { type: 'object', properties: { contractAddress: { type: 'string' }, to: { type: 'string' }, tokenId: { type: 'string' } }, required: ['contractAddress'] }, handler: mintNFTHandler },
	{ name: 'transfer_nft', description: 'Transfer an NFT using the smart account', parameters: { type: 'object', properties: { contractAddress: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' }, tokenId: { type: 'string' } }, required: ['contractAddress', 'to', 'tokenId'] }, handler: transferNFTHandler },
	
	// Utility Functions
	{ name: 'format_units', description: 'Convert wei to human-readable given decimals', parameters: { type: 'object', properties: { value: { type: 'string' }, decimals: { type: 'number' } }, required: ['value', 'decimals'] }, handler: formatUnitsHandler },
	{ name: 'parse_units', description: 'Convert human-readable to wei given decimals', parameters: { type: 'object', properties: { value: { type: 'string' }, decimals: { type: 'number' } }, required: ['value', 'decimals'] }, handler: parseUnitsHandler },
	{ name: 'to_hex', description: 'Convert value to hex', parameters: { type: 'object', properties: { value: {} }, required: ['value'] }, handler: toHexHandler },
	{ name: 'from_hex', description: 'Decode hex to number/string/boolean', parameters: { type: 'object', properties: { hex: { type: 'string' }, to: { type: 'string' } }, required: ['hex', 'to'] }, handler: fromHexHandler },
];

export async function dispatchToolCall(name: string, args: any, ctx: { userPrivateKey: `0x${string}`; network: string; smartAccountAddress: string; }): Promise<string> {
	const tool = toolsSchema.find(t => t.name === name);
	if (!tool) return `Error: Unknown tool ${name}`;
	return tool.handler(args || {}, ctx);
}