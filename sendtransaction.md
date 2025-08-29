SendTransaction
The SendTransaction action is the core function for executing blockchain transactions with the Agentkit SDK. It allows you to send native tokens, interact with smart contracts, and perform any on-chain operations without users needing to pay gas fees.

Overview
In blockchain applications, sending transactions is the primary way to modify state on the chain. The SendTransaction action handles all the complexity of:

Creating and formatting transaction objects
Calculating gas costs
Leveraging the gasless transaction infrastructure via paymasters
Submitting user operations to bundlers
This action is designed to work with the 0xGasless Smart Account system, which implements ERC-4337 to enable completely gasless transactions for end users.

Key Features
Gasless Transactions: All transactions are sponsored, meaning users don't need to hold native tokens to pay for gas
Contract Interactions: Call any smart contract function on the blockchain
Native Token Transfers: Send ETH, BNB, AVAX, or other native tokens
Smart Error Handling: Clear error messages when issues occur
Transaction Tracking: Returns a user operation hash for status monitoring
Input Parameters
Parameter	Type	Description	Required
to	string	Destination address (contract or EOA)	Yes
data	string	Encoded function data for contract interactions	No
value	string	Amount of native token to send (in wei)	No
Basic Usage Examples
Sending Native Tokens
To send native tokens (ETH, BNB, etc.) to another address:

// Send 0.01 ETH to an address
const result = await agent.runAction("send_transaction", {
  to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  value: "10000000000000000" // 0.01 ETH in wei (10^16)
});

console.log(result);
// Output: 
// Transaction submitted successfully! User Operation Hash: 0x123...
// Use 'get_transaction_status' to check confirmation.

Calling a Contract Function
To interact with a smart contract, you need to provide the encoded function data:

// First, encode the function data (example: ERC-20 transfer)
const encodedData = await agent.runAction("encode_function_data", {
  abiString: '[{"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]',
  functionName: "transfer",
  argsString: '["0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "1000000"]' // For a token with 6 decimals like USDC
});

// Extract the hex data
const data = encodedData.replace("Encoded Data: ", "");

// Then, send the transaction to the token contract
const result = await agent.runAction("send_transaction", {
  to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
  data: data,
  value: "0" // No ETH being sent
});

console.log(result);
// Output: 
// Transaction submitted successfully! User Operation Hash: 0x123...
// Use 'get_transaction_status' to check confirmation.


Transaction Monitoring
After submitting a transaction, you'll want to check if it was confirmed:

// Step 1: Send a transaction
const sendResult = await agent.runAction("send_transaction", {
  to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  value: "10000000000000000" // 0.01 ETH
});

// Step 2: Extract the userOpHash from the response
const userOpHash = sendResult.split("User Operation Hash: ")[1].split("\n")[0];

// Step 3: Check the transaction status
const statusResult = await agent.runAction("get_transaction_status", {
  userOpHash: userOpHash
});

console.log(statusResult);
// Possible outputs:
// "Transaction confirmed! TxHash: 0x456..., Block: 12345. UserOpHash: 0x123..."
// "Transaction is still pending after 60 seconds. UserOpHash: 0x123..."
// "Transaction failed. UserOpHash: 0x123... Reason: Execution reverted."

Real-world Applications
Token Swap on a DEX
Here's how to perform a token swap on a decentralized exchange:

// Example: Swap tokens on Uniswap
const swapData = await agent.runAction("encode_function_data", {
  abiString: '[{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}]',
  functionName: "swapExactTokensForTokens",
  argsString: `[
    "1000000", 
    "950000",
    ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xdAC17F958D2ee523a2206206994597C13D831ec7"],
    "${await wallet.getAddress()}",
    "${Math.floor(Date.now() / 1000) + 3600}"
  ]`
});

const data = swapData.replace("Encoded Data: ", "");

// Send the transaction to the router
const swapResult = await agent.runAction("send_transaction", {
  to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap Router
  data: data,
  value: "0"
});

// Get the status
const userOpHash = swapResult.split("User Operation Hash: ")[1].split("\n")[0];
const statusResult = await agent.runAction("get_transaction_status", {
  userOpHash: userOpHash
});


NFT Minting
Mint an NFT from a collection:

// Encode mint function data
const mintData = await agent.runAction("encode_function_data", {
  abiString: '[{"inputs":[],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
  functionName: "mint"
});

const data = mintData.replace("Encoded Data: ", "");

// Submit mint transaction
const mintResult = await agent.runAction("send_transaction", {
  to: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // NFT contract
  data: data,
  value: "80000000000000000" // 0.08 ETH mint price
});


How Gasless Transactions Work
Under the hood, SendTransaction does the following:

Creates a User Operation (UserOp) that represents your transaction
Sets the paymaster mode to SPONSORED to make it gasless
Sends the UserOp to the bundler service
The bundler:
Verifies the operation is valid
Asks the paymaster to sponsor the gas
Bundles it with other operations
Submits it to the blockchain
The key part is the paymasterServiceData configuration that's handled automatically:

const request = await wallet.sendTransaction(tx, {
  paymasterServiceData: {
    mode: PaymasterMode.SPONSORED, // Use sponsored mode for gasless
  },
});

Error Handling
The SendTransaction action provides detailed error messages for various scenarios:

// Invalid address
const result = await agent.runAction("send_transaction", {
  to: "0x123", // Invalid address
  value: "1000000000000000000"
});
// Output: "Error: Failed to send transaction: Invalid 'to' address format."

// Invalid data format
const result2 = await agent.runAction("send_transaction", {
  to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  data: "notHexData"
});
// Output: "Error: Failed to send transaction: Invalid 'data' hex format."

// Contract execution errors
// These will be returned when checking status, not at send time
const statusResult = await agent.runAction("get_transaction_status", {
  userOpHash: "0x123..."
});
// Possible output: "Transaction failed. UserOpHash: 0x123... Reason: Execution reverted."


Limitations and Considerations
Gasless Limits: There might be limits on transaction values or gas usage in sponsored mode
Network Support: Check which networks are supported for gasless transactions
Confirmation Time: Transactions may take longer to confirm than regular transactions
Reversion Handling: If a transaction reverts, you'll only know when checking status
Related Actions
EncodeFunctionData: Used to prepare the data parameter for contract interactions
GetStatusFromUserop: Used to check transaction confirmation status
GetBalance: Useful before sending transactions to check available balances
ReadContract: For reading contract data before transacting