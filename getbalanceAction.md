GetBalanceAction
The GetBalanceAction allows you to check token balances for the current user's smart account. This action supports both native tokens (like ETH, BNB, AVAX) and ERC-20 tokens across multiple blockchain networks.

Overview
Checking balances is a fundamental operation for any blockchain application. The GetBalanceAction makes this process simple by:

Providing multiple ways to query tokens (by symbol or address)
Supporting batch balance checks for multiple tokens
Automatically detecting the current network
Formatting balances with proper decimals
Filtering out zero balances for cleaner responses
Code Implementation
The core implementation queries token balances and formats the results:

export async function getBalance(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof GetBalanceInput>,
): Promise<string> {
  try {
    let tokenAddresses: `0x${string}`[] = [];
    const smartAccount = await wallet.getAddress();
    const chainId = wallet.rpcProvider.chain?.id;

    // If no specific tokens requested, get all tokens from tokenMappings for the current chain
    if (
      (!args.tokenAddresses || args.tokenAddresses.length === 0) &&
      (!args.tokenSymbols || args.tokenSymbols.length === 0)
    ) {
      if (chainId && tokenMappings[chainId]) {
        tokenAddresses = [...tokenAddresses, ...Object.values(tokenMappings[chainId])];
      }
    } else {
      // Process token addresses if provided
      if (args.tokenAddresses && args.tokenAddresses.length > 0) {
        tokenAddresses = args.tokenAddresses.map(addr => addr as `0x${string}`);
      }

      // Process token symbols if provided
      if (args.tokenSymbols && args.tokenSymbols.length > 0) {
        const symbolAddresses = await resolveTokenSymbols(wallet, args.tokenSymbols);
        tokenAddresses = [...tokenAddresses, ...symbolAddresses];
      }
    }

    // Remove duplicates
    tokenAddresses = [...new Set(tokenAddresses)];

    const balances = await getWalletBalance(
      wallet,
      tokenAddresses.length > 0 ? tokenAddresses : undefined,
    );
    
    // Format balances for display
    const balanceStrings = balances
      .filter(balance => {
        // Filter logic for zero balances
      })
      .map(balance => {
        // Formatting logic for token names and amounts
        return `${displayName}: ${balance.formattedAmount}`;
      });

    return `Smart Account: ${smartAccount}\n${responseTitle}\n${balanceStrings.join("\n")}`;
  } catch (error) {
    console.error("Balance fetch error:", error);
    return `Error getting balance: ${error instanceof Error ? error.message : String(error)}`;
  }
}


Input Parameters
Parameter	Type	Description	Required	Default
tokenAddresses	string[]	Array of token contract addresses	No	[]
tokenSymbols	string[]	Array of token symbols (e.g., "ETH", "USDC")	No	[]
If neither parameter is provided, the action will return balances for all known tokens on the current network.

Response Format
The action returns a formatted string with the smart account address and token balances:

Smart Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
All Token Balances:
ETH: 0.25
USDC: 100.5
USDT: 50.0

Basic Usage Examples
Check All Token Balances
// Check all available token balances on the current network
const result = await agent.runAction("get_balance", {});

console.log(result);
// Output example:
// Smart Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
// All Token Balances:
// ETH: 0.05
// USDC: 125.75
// WETH: 0.01

Check Specific Tokens by Symbol
// Check balances for specific tokens using symbols
const result = await agent.runAction("get_balance", {
  tokenSymbols: ["ETH", "USDC", "USDT"]
});

console.log(result);
// Output example:
// Smart Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
// Balances:
// ETH: 0.05
// USDC: 125.75
// USDT: 0

Check Tokens by Contract Address
// Check balances using token contract addresses
const result = await agent.runAction("get_balance", {
  tokenAddresses: [
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native token (ETH, BNB, etc.)
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"  // USDC on Ethereum
  ]
});

console.log(result);
// Output example:
// Smart Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
// Balances:
// ETH: 0.05
// USDC: 125.75

Combining Symbols and Addresses
// Check balances using both symbols and addresses
const result = await agent.runAction("get_balance", {
  tokenSymbols: ["ETH", "USDC"],
  tokenAddresses: ["0xdAC17F958D2ee523a2206206994597C13D831ec7"] // USDT
});

console.log(result);
// Output example:
// Smart Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
// Balances:
// ETH: 0.05
// USDC: 125.75
// USDT: 50.0

How Token Resolution Works
The action includes a special function to resolve token symbols to addresses based on the current chain:

async function resolveTokenSymbols(
  wallet: ZeroXgaslessSmartAccount,
  symbols: string[],
): Promise<`0x${string}`[]> {
  const chainId = wallet.rpcProvider.chain?.id;
  if (!chainId || !tokenMappings[chainId]) {
    console.warn(`Chain ID ${chainId} not found in token mappings`);
    return [];
  }

  const chainTokens = tokenMappings[chainId];
  const resolvedAddresses: `0x${string}`[] = [];

  for (const symbol of symbols) {
    const normalizedSymbol = symbol.toUpperCase();
    if (chainTokens[normalizedSymbol]) {
      resolvedAddresses.push(chainTokens[normalizedSymbol]);
    } else {
      console.warn(`Token symbol ${normalizedSymbol} not found for chain ID ${chainId}`);
    }
  }

  return resolvedAddresses;
}


This function uses a predefined mapping of token symbols to addresses for each supported chain, allowing users to interact with tokens using familiar symbols rather than remembering contract addresses.

Native Token Handling
The action has special handling for native tokens (ETH, BNB, AVAX, etc.) across different chains:

// Special case for native token (ETH, BNB, etc.)
if (balance.address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
  // Use chain-specific native token name if available
  if (chainId === 56) {
    displayName = "BNB";
  } else if (chainId === 43114) {
    displayName = "AVAX";
  } else if (chainId === 146) {
    displayName = "S";
  } else if (chainId === 8453) {
    displayName = "ETH";
  } else if (chainId === 1284) {
    displayName = "GLMR";
  } else {
    displayName = "ETH";
  }
}

This ensures that native tokens are displayed with their correct symbol based on the chain being used.

Supported Networks and Tokens
The action supports the following networks with their respective native tokens:

Network	Chain ID	Native Token
Base	8453	ETH
BNB Chain	56	BNB
Avalanche	43114	AVAX
Sonic	146	S
Moonbeam	1284	GLMR
Additionally, it supports common ERC-20 tokens on each network through the token mappings system.

Error Handling
The action includes comprehensive error handling:

try {
  // Balance fetching logic
} catch (error) {
  console.error("Balance fetch error:", error);
  return `Error getting balance: ${error instanceof Error ? error.message : String(error)}`;
}


Common error scenarios include:

Network connectivity issues
Invalid token addresses or symbols
RPC provider limitations
Smart account configuration problems
Best Practices
For optimal results with the GetBalanceAction:

Check specific tokens when possible to improve performance
Use token symbols instead of addresses for better code readability
Handle zero balances appropriately in your application logic
Cache balance results when appropriate to reduce API calls
Verify network context to ensure you're checking balances on the expected chain
Related Actions
GetAddressAction: Retrieve the smart account address
SmartTransferAction: Transfer tokens based on balance information
SmartSwapAction: Swap tokens after checking balances
GetTokenDetailsAction: Get detailed information about specific tokens
Previous
GetAddressAction
