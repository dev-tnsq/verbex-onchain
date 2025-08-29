EncodeFunctionData
The EncodeFunctionData action is a core utility that converts smart contract function calls into calldata (hexadecimal data) that can be used in blockchain transactions. This is a crucial step when preparing to interact with any smart contract on EVM-compatible blockchains.

Purpose
When interacting with smart contracts, you need to encode your function calls into a specific format that the Ethereum Virtual Machine (EVM) can interpret. The EncodeFunctionData action handles this encoding process, converting a function name and its arguments into the hexadecimal calldata required for blockchain transactions.

When to Use It
Use this action when you need to:

Prepare data for smart contract interactions
Create the data payload for a transaction
Manually build complex transaction sequences
Generate calldata to estimate gas costs before executing a transaction
Input Parameters
Parameter	Type	Description	Required
abiString	string	The contract ABI as a JSON string	Yes
functionName	string	The name of the function to encode	Yes
argsString	string	The function arguments as a JSON string array	No
Code Example
Here's a practical example showing how to encode an ERC-20 token transfer:

// Example: Encoding an ERC-20 token transfer
const result = await agent.runAction("encode_function_data", {
  // ERC-20 Transfer function ABI
  abiString: '[{"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]',
  
  // Function name to call
  functionName: "transfer",
  
  // Arguments: recipient address and amount (1 token with 18 decimals)
  argsString: '["0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "1000000000000000000"]'
});

console.log(result);
// Output: "Encoded Data: 0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e0000000000000000000000000000000000000000000000000de0b6b3a7640000"


Real-world Application
Using with SendTransaction
The encoded data is typically used as input for the send_transaction action:

// Step 1: Encode the function data
const encodedData = await agent.runAction("encode_function_data", {
  abiString: '[{"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]',
  functionName: "transfer",
  argsString: '["0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "1000000000000000000"]'
});

// Extract just the hex data part (removing the "Encoded Data: " prefix)
const hexData = encodedData.replace("Encoded Data: ", "");

// Step 2: Use the encoded data in a transaction
const txResult = await agent.runAction("send_transaction", {
  to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract address
  data: hexData,
  value: "0" // No ETH being sent
});


Interacting with Complex DeFi Protocols
For more complex DeFi interactions (like Uniswap swaps), you would encode the appropriate function with its parameters:

const swapData = await agent.runAction("encode_function_data", {
  abiString: '[{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}]',
  functionName: "swapExactTokensForTokens",
  argsString: '[
    "1000000000000000000", 
    "950000000000000000",
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "1714559999"
  ]'
});


Error Handling
The action provides helpful error messages for common issues:

Function not found:

Error: Failed to encode function data: Function 'transferr' not found on ABI. Check spelling and ABI correctness.


Invalid argument types:

Error: Failed to encode function data: Expected a value of type 'address' but received '123' (type: string).


Invalid JSON format:

Error: Failed to encode function data: Unexpected token in JSON at position 5.

Under the Hood
The EncodeFunctionData action uses the viem library's encodeFunctionData function to perform the encoding. It validates inputs using Zod for type safety and comprehensive error handling.

Tips for Success
Ensure Correct ABI: The ABI must exactly match the contract you're interacting with
Check Parameter Types: Arguments must match the expected types in the function signature
Format JSON Correctly: Both abiString and argsString must be valid JSON strings
Handle Big Numbers Properly: For uint256 values (like token amounts), use string representation to avoid precision issues
Related Actions
ReadContract: For reading data from contracts
SendTransaction: For executing transactions with the encoded data
GetBalance: Often used before transactions to check available funds
Previous
BaseActions
