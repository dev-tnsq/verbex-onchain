ReadContract
The ReadContract action allows you to query data from any smart contract without sending a transaction or paying gas fees. This is essential for retrieving on-chain information such as token balances, contract states, or configuration parameters.

Overview
Smart contracts store valuable data on the blockchain that can be accessed through their "view" or "pure" functions. The ReadContract action makes it easy to call these functions and retrieve their results in a formatted way.

Since read operations don't modify the blockchain state, they don't require gas fees or transaction signing, making them perfect for data retrieval operations.

Key Features
Zero Gas Cost: Read operations don't require gas or transactions
Type Conversion: Automatically handles complex return types (arrays, structs, BigInts)
Flexible Arguments: Support for functions with any number and type of arguments
Error Handling: Clear error messages for debugging
When to Use It
Use this action when you need to:

Get token balances or metadata (name, symbol, decimals)
Check ownership status of NFTs
Retrieve protocol parameters from DeFi contracts
Get prices from price oracles or DEXs
Check contract states, access controls, or configurations
Input Parameters
Parameter	Type	Description	Required
contractAddress	string	Address of the smart contract to query	Yes
abiString	string	Contract ABI as a JSON string	Yes
functionName	string	Name of the view/pure function to call	Yes
argsString	string	Arguments for the function as a JSON array string	No
Basic Usage Example
Here's how to use ReadContract to get the symbol of an ERC-20 token:

// Get the token symbol for USDC
const result = await agent.runAction("read_contract", {
  contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
  abiString: '[{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
  functionName: "symbol"
  // No args needed for this function
});

console.log(result);
// Output: "Result: USDC"


Function With Arguments Example
Here's how to check the balance of an ERC-20 token for a specific address:

// Check USDC balance for an address
const result = await agent.runAction("read_contract", {
  contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
  abiString: '[{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]',
  functionName: "balanceOf",
  argsString: '["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"]' // Address to check
});

console.log(result);
// Output: "Result: 1000000" (representing 1 USDC with 6 decimals)


Complex Return Types
The action handles complex return types by converting them to string representations:

// Get multiple return values from a function
const result = await agent.runAction("read_contract", {
  contractAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap Router
  abiString: '[{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}]',
  functionName: "getAmountsOut",
  argsString: '[
    "1000000000000000000", 
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
  ]'
});

console.log(result);
// Output: "Result: ["1000000000000000000","1234567890"]"
// This is an array of token amounts representing the input and output amounts


Real-world Applications
Checking Token Allowances
// Check if a contract has approval to spend tokens
const result = await agent.runAction("read_contract", {
  contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  abiString: '[{"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]',
  functionName: "allowance",
  argsString: '[
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", 
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  ]'
});

// Format the result with the appropriate decimals
const allowanceAmount = result.replace("Result: ", "");
const formattedAllowance = await agent.runAction("format_units", {
  value: allowanceAmount,
  decimals: 6 // USDC has 6 decimals
});

console.log(`USDC allowance: ${formattedAllowance.replace("Formatted Value: ", "")}`);


Retrieving NFT Metadata
// Get the token URI for an NFT
const result = await agent.runAction("read_contract", {
  contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // BAYC
  abiString: '[{"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
  functionName: "tokenURI",
  argsString: '[42]' // Token ID
});

console.log(result);
// Output: "Result: ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/42"


Checking Protocol States
// Get current price from a price oracle
const result = await agent.runAction("read_contract", {
  contractAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD Price Feed
  abiString: '[{"inputs":[],"name":"latestRoundData","outputs":[{"name":"roundId","type":"uint80"},{"name":"answer","type":"int256"},{"name":"startedAt","type":"uint256"},{"name":"updatedAt","type":"uint256"},{"name":"answeredInRound","type":"uint80"}],"stateMutability":"view","type":"function"}]',
  functionName: "latestRoundData"
});

// Parse the complex result (it's a JSON string of the returned tuple)
const dataString = result.replace("Result: ", "");
const data = JSON.parse(dataString);

// The price is the second element (index 1), in 8 decimals
const priceInWei = data[1];
const ethUsdPrice = parseInt(priceInWei) / 10**8;

console.log(`Current ETH/USD price: $${ethUsdPrice.toFixed(2)}`);


Error Handling
The action provides clear error messages for common issues:

// Invalid contract address
const result = await agent.runAction("read_contract", {
  contractAddress: "0x123", // Invalid address
  abiString: '[{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
  functionName: "symbol"
});
// Output: "Error in read_contract: Invalid contract address"

// Function not in ABI
const result2 = await agent.runAction("read_contract", {
  contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  abiString: '[{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
  functionName: "nonExistentFunction"
});
// Output: "Error in read_contract: Function 'nonExistentFunction' not found in ABI."

// Contract doesn't exist
const result3 = await agent.runAction("read_contract", {
  contractAddress: "0x0000000000000000000000000000000000000000",
  abiString: '[{"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
  functionName: "symbol"
});
// Output: "Error in read_contract: Contract at address 0x0000000000000000000000000000000000000000 doesn't exist"


Advanced Techniques
Combining with Other Actions
ReadContract works well with other actions like FormatHelpers to process data:

// Get token decimals
const decimalsResult = await agent.runAction("read_contract", {
  contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  abiString: '[{"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]',
  functionName: "decimals"
});
const decimals = parseInt(decimalsResult.replace("Result: ", ""));

// Get token balance
const balanceResult = await agent.runAction("read_contract", {
  contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  abiString: '[{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]',
  functionName: "balanceOf",
  argsString: '["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"]'
});
const balanceInWei = balanceResult.replace("Result: ", "");

// Format the balance
const formattedBalance = await agent.runAction("format_units", {
  value: balanceInWei,
  decimals: decimals
});

console.log(`USDC Balance: ${formattedBalance.replace("Formatted Value: ", "")}`);


Implementation Details
Under the hood, ReadContract uses the readContract method from the wallet's RPC provider to execute the call. It handles various data types and provides helpful error messages.

The action supports all view and pure functions on any EVM-compatible blockchain, making it a versatile tool for data access.

Related Actions
FormatHelpers: For formatting returned values (especially token amounts)
EncodeFunctionData: For preparing data for write operations
SendTransaction: For executing state-changing contract calls
GetBalance: For a simplified way to check token balances