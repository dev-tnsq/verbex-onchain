SignMessage
The SignMessage action allows you to cryptographically sign arbitrary messages with your smart account's private key. This is essential for proving ownership of your address, authenticating with decentralized applications, and participating in off-chain protocols.

Overview
Message signing is a fundamental blockchain operation that enables users to verify their identity without executing an on-chain transaction. Unlike transactions that modify blockchain state and require gas, signing messages is:

Completely free (no gas fees)
Performed entirely off-chain
Instantly verifiable by third parties
In Web3 applications, message signing is frequently used for authentication, approvals, and verifying data integrity.

Key Features
Ownership Proof: Prove you control a particular address
Authentication: Sign in to dApps without passwords
Data Integrity: Verify the authenticity of messages or data
Gasless Operation: No blockchain transaction or gas fees required
Standard Compatibility: Creates signatures compatible with EIP-191 and EIP-712 verification
Input Parameters
Parameter	Type	Description	Required
message	string	The text message to sign	Yes
Basic Usage Example
Here's how to sign a simple message:

// Sign a basic message
const result = await agent.runAction("sign_message", {
  message: "I am verifying my account ownership on ExampleDApp"
});

console.log(result);
// Output: 
// Signature: 0x1234abcd...

Common Applications
Authentication with dApps
Many decentralized applications use message signing as a passwordless login mechanism:

// Sign an authentication message
const authMessage = `Sign this message to log in to ExampleDApp\nNonce: ${Date.now()}`;
const authResult = await agent.runAction("sign_message", {
  message: authMessage
});

const signature = authResult.replace("Signature: ", "");
console.log("Authentication signature:", signature);

// This signature would then be sent to the dApp's backend for verification

Signing Orders on DEXs
Decentralized exchanges often use signatures for gasless order creation:

// Create an order message (simplified example)
const orderMessage = JSON.stringify({
  maker: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  sellToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  buyToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  sellAmount: "100000000", // 100 USDC (6 decimals)
  buyAmount: "50000000000000000", // 0.05 WETH (18 decimals)
  expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  nonce: Date.now()
});

// Sign the order
const signResult = await agent.runAction("sign_message", {
  message: orderMessage
});

const orderSignature = signResult.replace("Signature: ", "");
console.log("Order signature:", orderSignature);

Voting in DAOs
DAOs often use off-chain signatures for gasless voting:

// Create a vote message
const voteMessage = JSON.stringify({
  proposal: "PID-123",
  choice: "approve",
  voter: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  timestamp: Date.now()
});

// Sign the vote
const voteResult = await agent.runAction("sign_message", {
  message: voteMessage
});

const voteSignature = voteResult.replace("Signature: ", "");
console.log("Vote signature:", voteSignature);

Advanced Example: Structured Data Signing (EIP-712)
For more complex applications, you might need to sign structured data following the EIP-712 standard. While the basic sign_message action works with string messages, you can format your message as a stringified EIP-712 object:

// Create an EIP-712 formatted message (as a string)
const domainData = {
  name: "Example Protocol",
  version: "1",
  chainId: 1,
  verifyingContract: "0x1234567890123456789012345678901234567890"
};

const types = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

const value = {
  owner: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  spender: "0x1234567890123456789012345678901234567890",
  value: "1000000000000000000",
  nonce: 1,
  deadline: Math.floor(Date.now() / 1000) + 3600
};

// Convert to string format expected by sign_message
const eip712Message = JSON.stringify({
  domain: domainData,
  types: types,
  primaryType: "Permit",
  message: value
});

// Sign the structured data
const signResult = await agent.runAction("sign_message", {
  message: eip712Message
});

const signature = signResult.replace("Signature: ", "");
console.log("EIP-712 signature:", signature);

Error Handling
The SignMessage action provides clear error messages for various failure scenarios:

// Example error handling
try {
  const result = await agent.runAction("sign_message", {
    message: "Test message"
  });
  
  if (result.includes("Error:")) {
    console.error("Signing failed:", result);
    // Handle the error appropriately
  } else {
    const signature = result.replace("Signature: ", "");
    console.log("Successfully signed with signature:", signature);
    // Proceed with the application logic
  }
} catch (error) {
  console.error("Unexpected error during signing:", error);
}

How It Works
Under the hood, the SignMessage action:

Takes your message string
Prepends the Ethereum-specific prefix (\x19Ethereum Signed Message:\n followed by the message length)
Hashes the resulting string with keccak256
Signs the hash with the smart account's private key
Returns the signature in hexadecimal format
This follows the EIP-191 standard for message signing, ensuring compatibility with standard verification methods.

Security Considerations
When using message signing:

Only sign messages from trusted sources - malicious messages could trick you into authorizing unwanted actions
Verify the content before signing - especially for structured data that might be hard to read
Include timestamps or nonces to prevent replay attacks
Be cautious with permissions - signing can sometimes grant extensive permissions in protocols
Related Actions
ReadContract: Often used to get nonces or other data needed for message construction
GetBalance: May be needed to verify available tokens before signing trade/transfer orders
SendTransaction: For cases where message signing isn't sufficient and an on-chain transaction is needed
Previous
SendTransaction
