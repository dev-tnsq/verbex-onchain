GetAddressAction
The GetAddressAction retrieves the smart account address for the current user. This fundamental action helps identify the user's account on the blockchain without requiring any additional setup or configuration.

Overview
Every user in the 0xGasless ecosystem has a unique smart account address. This action provides a simple way to access that address, which is needed for many other operations like checking balances, tracking transactions, or setting up transfers.

Code Implementation
The core implementation is straightforward, simply retrieving the address from the smart account:

export async function getAddress(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof GetAddressInput>,
): Promise<string> {
  try {
    const smartAccount = await wallet.getAddress(args);

    return `Smart Account: ${smartAccount}`;
  } catch (error) {
    console.error("Error getting address:", error);
    return `Error getting address: ${error instanceof Error ? error.message : String(error)}`;
  }
}


Input Parameters
This action doesn't require any input parameters. It works with the smart account that's already initialized within the application.

Response Format
Response Field	Description
Smart Account	The hexadecimal address (0x...) of the user's smart account
Basic Usage Example
// Get the user's smart account address
const result = await agent.runAction("get_address", {});

console.log(result);
// Output: "Smart Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"

// Extract just the address part if needed
const address = result.replace("Smart Account: ", "");

Practical Applications
Displaying Account Information
// Get and display the user's address
const addressResult = await agent.runAction("get_address", {});
console.log(`Your wallet: ${addressResult.replace("Smart Account: ", "")}`);

Preparing for Other Actions
// Get address before checking balances
const addressResult = await agent.runAction("get_address", {});
const userAddress = addressResult.replace("Smart Account: ", "");

// Now use the address to check balances
console.log(`Checking balances for ${userAddress}...`);
const balances = await agent.runAction("get_balance", {
  address: userAddress,
  tokenSymbols: ["ETH", "USDC", "USDT"]
});

How It Works
Under the hood, GetAddressAction calls the getAddress() method on the 0xGasless smart account instance that's connected to the agent. Since this is a read-only operation, it doesn't require any gas or transaction confirmation.

The smart account address is counterfactually generated based on the user's credentials and the smart account implementation. This means it's deterministic and will remain consistent for the same user across sessions.

Error Handling
The action has robust error handling for scenarios where the smart account might not be properly initialized:

try {
  const addressResult = await agent.runAction("get_address", {});
  if (addressResult.includes("Error")) {
    console.error("Failed to get address:", addressResult);
    // Handle error case
  } else {
    // Process the address
    const address = addressResult.replace("Smart Account: ", "");
    console.log("Success! Address:", address);
  }
} catch (error) {
  console.error("Unexpected error:", error);
}

Cross-Chain Compatibility
The same smart account address can be used across all supported networks:

BSC (ChainID: 56)
Avalanche (ChainID: 43114)
Base (ChainID: 8453)
Sonic (ChainID: 146)
Moonbeam (ChainID: 1284)
However, funds and token balances are specific to each network. A user might have ETH on Base, but not on Avalanche, even though the address is the same.

Best Practices
Cache the address when appropriate to avoid unnecessary calls
Always handle errors when retrieving the address
Use the address as read-only information - never modify it or pass it as a mutable parameter
Validate addresses returned by this action before using them in critical operations
Provide clear context to users about which network their address is currently operating on
Related Actions
GetBalanceAction: Check token balances for the retrieved address
SmartTransferAction: Transfer tokens from this address to others
CheckTransactionAction: Check transactions involving this address
Previous
CheckTransactionAction
