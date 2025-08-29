GetBalance
The GetBalance action provides a way to retrieve token balances for a smart account across supported networks. It can check balances for native tokens (ETH, BNB, AVAX etc.) and ERC-20 tokens with minimal configuration.

Overview
Checking account balances is one of the most common operations in blockchain applications. The GetBalance action simplifies this process by:

Automatically detecting the current network and available tokens
Supporting multiple query methods (by symbol or contract address)
Formatting results in a human-readable way with proper token symbols
Filtering zero balances for cleaner results
This action requires a configured smart account and works across all supported networks including Base, Fantom, Moonbeam, Metis, Avalanche, and BSC.

Key Features
Multi-token Support: Check balances for multiple tokens in a single call
Symbol Resolution: Query tokens by their familiar ticker symbols (USDC, WETH, etc.)
Smart Display: Shows human-readable token names instead of contract addresses
Zero Balance Filtering: Only shows tokens with non-zero balances by default
Chain-aware: Automatically resolves the correct tokens for the current network
Input Parameters
Parameter	Type	Description	Required
tokenSymbols	string[]	Array of token symbols to check (e.g., "USDC", "WETH")	No
tokenAddresses	string[]	Array of token contract addresses to check	No
If both parameters are omitted, the action returns balances for all known tokens on the current network.

Usage Examples
Checking All Token Balances
To get balances for all tokens with non-zero amounts:

// Get all token balances
const result = await agent.runAction("get_balance", {});

console.log(result);
// Output:
// Smart Account: 0x123...abc
// All Token Balances:
// ETH: 0.05
// USDC: 100.0
// WETH: 0.01

Checking Specific Tokens by Symbol
To check balances for specific tokens using their symbols:

// Check balances for USDC and WETH
const result = await agent.runAction("get_balance", {
  tokenSymbols: ["USDC", "WETH"]
});

console.log(result);
// Output:
// Smart Account: 0x123...abc
// Balances:
// USDC: 100.0
// WETH: 0.01

Checking Tokens by Contract Address
To check balances for specific tokens using their contract addresses:

// Check balances for specific contract addresses
const result = await agent.runAction("get_balance", {
  tokenAddresses: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"  // WETH
  ]
});

console.log(result);
// Output:
// Smart Account: 0x123...abc
// Balances:
// USDC: 100.0
// WETH: 0.01

Combining Symbol and Address Queries
You can combine both query methods in a single call:

// Check both by symbol and address
const result = await agent.runAction("get_balance", {
  tokenSymbols: ["USDC"],
  tokenAddresses: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"] // WETH
});

console.log(result);
// Output:
// Smart Account: 0x123...abc
// Balances:
// USDC: 100.0
// WETH: 0.01

Real-world Applications
Pre-transaction Balance Check
Check if a user has enough tokens before attempting a swap:

// Check if user has enough USDC before swapping
const balanceResult = await agent.runAction("get_balance", {
  tokenSymbols: ["USDC"]
});

// Extract balance amount from the response
const usdcLine = balanceResult.split("\n").find(line => line.includes("USDC:"));
const usdcBalance = usdcLine ? parseFloat(usdcLine.split(": ")[1]) : 0;

// Check if balance is sufficient
if (usdcBalance >= 10) {
  // Proceed with swap transaction
  console.log("Sufficient balance to proceed with swap");
} else {
  console.log("Insufficient USDC balance for this operation");
}

Portfolio Overview
Provide a complete overview of a user's token holdings:

// Get all token balances for portfolio display
const portfolioResult = await agent.runAction("get_balance", {});

// Format the result for display
const lines = portfolioResult.split("\n");
const accountAddress = lines[0].replace("Smart Account: ", "");
const balances = lines.slice(2); // Skip the header lines

console.log(`Portfolio for ${accountAddress}:`);
balances.forEach(balance => {
  const [token, amount] = balance.split(": ");
  console.log(`- ${token}: ${amount}`);
});

Multi-network Balance Aggregation
This example shows how to check balances across multiple networks (though you would need to switch networks between calls):

// Check balances across multiple networks
async function checkCrossChainBalances() {
  // First check balances on Base
  await agent.runAction("switch_network", { chainId: 8453 }); // Base
  const baseBalances = await agent.runAction("get_balance", {});
  
  // Then check balances on Avalanche
  await agent.runAction("switch_network", { chainId: 43114 }); // Avalanche
  const avaxBalances = await agent.runAction("get_balance", {});
  
  console.log("=== Base Network ===");
  console.log(baseBalances);
  
  console.log("=== Avalanche Network ===");
  console.log(avaxBalances);
}

Supported Networks
The GetBalance action works on the following networks:

Network	Chain ID	Native Token
Base	8453	ETH
Avalanche	43114	AVAX
BSC	56	BNB
Sonic	146	S
Moonbeam	1284	GLMR
Response Format
The action returns a formatted string with the following structure:

Smart Account: 0x123...abc
All Token Balances:  // or "Balances:" for specific token queries
TOKEN1: 100.0
TOKEN2: 0.5
...

The first line shows the smart account address
The second line is a header that indicates whether this is showing all tokens or specific ones
Each subsequent line shows a token symbol and its formatted balance
Error Handling
The action handles various error cases:

If the network is not supported, appropriate warnings are logged
If no balances are found, it will indicate "No balances found for the requested tokens"
If a token symbol cannot be resolved on the current network, a warning is logged
Any other errors during balance fetching are caught and returned with descriptive messages
Related Actions
FormatHelpers: Used for converting between token units
SendTransaction: Often used after checking balances to execute transactions
ReadContract: For more specific token data queries