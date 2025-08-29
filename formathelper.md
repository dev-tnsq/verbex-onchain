FormatHelpers
The FormatHelpers module provides essential data formatting and conversion utilities for blockchain applications. These functions help developers handle the various data formats used in Ethereum and other EVM-compatible blockchains.

Overview
Working with blockchain data requires frequent conversions between human-readable values and blockchain-native formats. The FormatHelpers module offers a comprehensive set of utility functions to handle these conversions with ease, including:

Converting between token amounts and their human-readable representations
Encoding and decoding hexadecimal values
Working with byte arrays and string conversions
All helpers are available as independent actions that can be used by AI agents to perform specific formatting tasks without requiring a connected wallet.

Available Helper Functions
Token Amount Formatting
Action	Description
format_units	Converts large integer values (wei) to human-readable decimal strings
parse_units	Converts human-readable decimal strings to large integer values (wei)
format_ether	Shorthand for format_units with 18 decimals (Ether-specific)
parse_ether	Shorthand for parse_units with 18 decimals (Ether-specific)
Data Type Conversion
Action	Description
to_hex	Converts values to hexadecimal string format
from_hex	Converts hexadecimal strings to specified data types
to_bytes	Converts values to byte array representation
from_bytes	Converts byte arrays to specified data types
Usage Examples
Token Amount Formatting
format_units
Converts a large integer (wei) to a human-readable decimal string based on the specified number of decimals.

// Example: Convert 1000000000000000000 wei to Ether (18 decimals)
const result = await agent.runAction("format_units", {
  value: "1000000000000000000",
  decimals: 18
});

console.log(result);
// Output: "Formatted Value: 1.0"

// Example: Convert 1000000 to USDC (6 decimals)
const usdcResult = await agent.runAction("format_units", {
  value: "1000000",
  decimals: 6
});

console.log(usdcResult);
// Output: "Formatted Value: 1.0"

parse_units
Converts a human-readable decimal string to its corresponding large integer value based on the specified number of decimals.

// Example: Convert 1.5 Ether to wei
const result = await agent.runAction("parse_units", {
  value: "1.5",
  decimals: 18
});

console.log(result);
// Output: "Parsed Value (Wei): 1500000000000000000"

// Example: Convert 10.5 USDC to its smallest unit
const usdcResult = await agent.runAction("parse_units", {
  value: "10.5",
  decimals: 6
});

console.log(usdcResult);
// Output: "Parsed Value (Wei): 10500000"

format_ether and parse_ether
Shorthand functions for Ether-specific conversions (18 decimals).

// format_ether: Convert wei to Ether
const formatResult = await agent.runAction("format_ether", {
  value: "1234567890123456789"
});

console.log(formatResult);
// Output: "Formatted Ether: 1.234567890123456789"

// parse_ether: Convert Ether to wei
const parseResult = await agent.runAction("parse_ether", {
  value: "0.05"
});

console.log(parseResult);
// Output: "Parsed Wei: 50000000000000000"

Data Type Conversion
to_hex
Converts various data types to hexadecimal string representation.

// Example: Convert a number to hex
const numResult = await agent.runAction("to_hex", {
  value: 42
});

console.log(numResult);
// Output: "Hex: 0x2a"

// Example: Convert a string to hex
const stringResult = await agent.runAction("to_hex", {
  value: "Hello"
});

console.log(stringResult);
// Output: "Hex: 0x48656c6c6f"

// Example: Convert a boolean to hex
const boolResult = await agent.runAction("to_hex", {
  value: true
});

console.log(boolResult);
// Output: "Hex: 0x01"

from_hex
Converts hexadecimal strings to specified data types.

// Example: Convert hex to a number
const numResult = await agent.runAction("from_hex", {
  hex: "0x2a",
  to: "number"
});

console.log(numResult);
// Output: "Decoded Value: 42"

// Example: Convert hex to a string
const stringResult = await agent.runAction("from_hex", {
  hex: "0x48656c6c6f",
  to: "string"
});

console.log(stringResult);
// Output: "Decoded Value: Hello"

// Example: Convert hex to a boolean
const boolResult = await agent.runAction("from_hex", {
  hex: "0x01",
  to: "boolean"
});

console.log(boolResult);
// Output: "Decoded Value: true"

to_bytes and from_bytes
Convert between different data types and byte arrays.

// Example: Convert a string to bytes
const toBytesResult = await agent.runAction("to_bytes", {
  value: "Hello"
});

console.log(toBytesResult);
// Output: "Value converted to byte array (Uint8Array) with length: 5"

// Example: Convert bytes (represented as hex) to a string
const fromBytesResult = await agent.runAction("from_bytes", {
  hexBytes: "0x48656c6c6f", // "Hello" in hex
  to: "string"
});

console.log(fromBytesResult);
// Output: "Decoded Value: Hello"

Real-world Applications
Token Balance Display
Format token balances for user-friendly display:

// Step 1: Get the raw balance (in wei or smallest unit)
const balanceResult = await agent.runAction("get_balance", {
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // USDC
});

// Extract the balance value (assuming it returns "Balance: 1000000")
const rawBalance = balanceResult.replace("Balance: ", "");

// Step 2: Format it to human-readable form with correct decimals
const formattedBalance = await agent.runAction("format_units", {
  value: rawBalance,
  decimals: 6 // USDC uses 6 decimals
});

console.log(formattedBalance);
// Output: "Formatted Value: 1.0"

Preparing Token Transfer Amounts
Prepare amounts for token transfers:

// Convert user-input amount to wei for a transaction
const weiAmount = await agent.runAction("parse_units", {
  value: "2.5", 
  decimals: 18
});

// Extract just the numerical part from the response
const amountForTx = weiAmount.replace("Parsed Value (Wei): ", "");

// Use in a token transfer
const txData = await agent.runAction("encode_function_data", {
  abiString: '[{"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]',
  functionName: "transfer",
  argsString: `["0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "${amountForTx}"]`
});


Working with Contract Data
Decode hex data from contract calls:

// Assume we received a hex string from a contract call
const hexData = "0x000000000000000000000000000000000000000000000000000000000000007b";

// Decode it to a number
const decodedNumber = await agent.runAction("from_hex", {
  hex: hexData,
  to: "number"
});

console.log(decodedNumber);
// Output: "Decoded Value: 123"

Error Handling
All FormatHelpers actions have built-in error handling and provide descriptive error messages:

For format_units with invalid input:

Error in format_units: Cannot convert [value] to a BigInt

For parse_units with invalid decimal format:

Error in parse_units: Invalid decimal format

For to_hex with unsupported input type:

Error in to_hex: Unable to convert value to hex

Under the Hood
The FormatHelpers module is built on top of the viem library, which provides robust and efficient implementations of Ethereum data utilities. Each helper is implemented as an AgentkitAction with proper validation using Zod schemas, ensuring type safety and comprehensive error messages.

Related Actions
EncodeFunctionData: Often used with formatted values for transactions
ReadContract: Returns data that may need formatting
SendTransaction: Requires properly formatted values