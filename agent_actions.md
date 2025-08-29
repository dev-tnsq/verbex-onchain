Agent Actions
Overview
Agent Actions are specialized tools that enable AI agents to interact with the blockchain in a seamless and secure manner. These actions handle complex blockchain operations while providing a simple interface for AI agents to use.

The 0xGasless SDK provides a comprehensive set of actions that cover common blockchain interactions including:

Token swaps and trading
Asset transfers
Balance checking
Transaction verification
Smart account management
Available Actions
Smart Account Management
GetAddressAction - Retrieve the smart account address for the current user
CheckTransactionAction - Verify transaction status and details
Asset Management
GetBalanceAction - Check token balances for the smart account
GetTokenDetailsAction - Retrieve information about specific tokens
Trading & Transfers
SmartSwapAction - Execute token swaps with optimized routing
SmartTransferAction - Transfer tokens to other addresses
Core Features
All agent actions in the 0xGasless SDK share some important characteristics:

Gasless Execution - Users don't need to pay gas fees for transactions
Type Safety - Input validation using Zod schemas prevents errors
Comprehensive Error Handling - Clear error messages for debugging
Standardized Responses - Consistent return formats for easy integration
Cross-chain Compatibility - Support for multiple EVM-compatible networks
Usage Pattern
Agent actions follow a consistent pattern:

// General pattern for using any action
const result = await agent.runAction("action_name", {
  // Action-specific parameters
  param1: "value1",
  param2: "value2"
});

// Example: Getting the user's smart account address
const addressResult = await agent.runAction("get_address", {});
console.log(addressResult);
// Output: "Smart Account Address: 0x123..."

Combining Actions
Actions can be combined to create complex workflows:

// Example workflow: Check balance and swap tokens
// Step 1: Check if user has enough USDC
const balanceResult = await agent.runAction("get_balance", {
  tokenSymbols: ["USDC"]
});

// Step 2: Execute a swap if balance is sufficient
if (balanceResult.includes("USDC: ") && parseFloat(balanceResult.split("USDC: ")[1]) >= 10) {
  const swapResult = await agent.runAction("smart_swap", {
    fromToken: "USDC",
    toToken: "ETH",
    amount: "10",
    slippagePercentage: "1"
  });
  
  console.log(swapResult);
}


Action Categories
The actions are organized into the following categories:

SmartSwapAction
Enables token swapping with optimal routing and slippage protection.

CheckTransactionAction
Verifies transaction status and retrieves transaction details.

SmartTransferAction
Facilitates token transfers between addresses with robust error handling.

GetAddressAction
Retrieves the current smart account address for the user.

GetBalanceAction
Checks token balances for the user's smart account.

GetTokenDetailsAction
Retrieves metadata and information about specific tokens.

Next Steps
Explore each action in detail by clicking on its link in the sidebar. Each action's documentation includes:

Detailed explanation of its purpose
Input parameter specifications
Example usage code
Common error scenarios and handling
Advanced usage patterns
