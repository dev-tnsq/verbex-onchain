SmartTransferAction
The SmartTransferAction enables completely gasless token transfers across multiple blockchain networks. This action allows users to send both native tokens (like ETH) and ERC-20 tokens to any address without requiring gas fees.

Overview
Token transfers are the most fundamental blockchain operation. The SmartTransferAction makes transfers accessible to everyone by:

Removing the need for users to own native tokens for gas
Handling both native token and ERC-20 token transfers
Automatically determining token decimals
Providing transaction status monitoring
Supporting multiple EVM-compatible chains
All transfers are executed using the 0xGasless infrastructure, enabling users to transact without the complexity of managing gas.

Supported Networks
Avalanche C-Chain
BNB Chain
Sonic
Base
Moonbeam
Input Parameters
Parameter	Type	Description	Required	Default
amount	string	Amount of tokens to transfer	Yes	-
tokenAddress	string	Contract address or 'eth' for native transfers	Yes	-
destination	string	Recipient address	Yes	-
wait	boolean	Whether to wait for transaction confirmation	No	true
Code Implementation
The core implementation handles both native token and ERC-20 token transfers:

export async function smartTransfer(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof SmartTransferInput>,
): Promise<string> {
  try {
    const isEth = args.tokenAddress.toLowerCase() === "eth";
    let tx: Transaction;

    if (isEth) {
      // Native ETH transfer
      tx = {
        to: args.destination as `0x${string}`,
        data: "0x",
        value: parseEther(args.amount),
      };
    } else {
      // ERC20 token transfer
      const decimals = await wallet.rpcProvider.readContract({
        abi: TokenABI,
        address: args.tokenAddress as `0x${string}`,
        functionName: "decimals",
      });
      const data = encodeFunctionData({
        abi: TokenABI,
        functionName: "transfer",
        args: [
          args.destination as `0x${string}`,
          parseUnits(args.amount, (decimals as number) || 18),
        ],
      });

      tx = {
        to: args.tokenAddress as `0x${string}`,
        data,
        value: 0n,
      };
    }

    const response = await sendTransaction(wallet, tx);
    if (!response || !response.success) {
      return `Transaction failed: ${response?.error || "Unknown error"}`;
    }

    if (args.wait) {
      const status = await waitForTransaction(wallet, response.userOpHash);
      // Return confirmation details
    }
    
    // Return submission details
  } catch (error) {
    return `Error transferring the asset: ${error}`;
  }
}

Basic Usage Examples
Transfer ERC-20 Token (USDC, USDT, etc.)
// Transfer 10 USDC to an address
const result = await agent.runAction("smart_transfer", {
  amount: "10",
  tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract address
  destination: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
});

console.log(result);
// Output example:
// Successfully transferred 10 tokens from contract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e.
// Transaction confirmed in block 12345678!


Transfer Without Waiting for Confirmation
// Transfer tokens without waiting for confirmation
const result = await agent.runAction("smart_transfer", {
  amount: "5",
  tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT contract address
  destination: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  wait: false
});

console.log(result);
// Output includes userOpHash to check status later

Advanced Examples
Complete Transfer Workflow
This example demonstrates a complete workflow of checking balances, performing a transfer, and verifying the transaction:

// Step 1: Check current balance
const balanceResult = await agent.runAction("get_balance", {
  tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // USDC
});
console.log("Current balance:");
console.log(balanceResult);

// Step 2: Execute the transfer
const transferResult = await agent.runAction("smart_transfer", {
  amount: "10",
  tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  destination: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  wait: true
});
console.log("Transfer result:");
console.log(transferResult);

// Step 3: Extract transaction hash and check details
const txHash = transferResult.match(/Transaction confirmed in block (\d+)!/)[0];
const txDetails = await agent.runAction("check_transaction", {
  transactionHash: txHash
});
console.log("Transaction details:");
console.log(txDetails);

// Step 4: Check updated balance
const updatedBalance = await agent.runAction("get_balance", {
  tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // USDC
});
console.log("Updated balance:");
console.log(updatedBalance);

How It Works
The SmartTransferAction works differently depending on the type of token being transferred:

ERC-20 Token Transfers
For ERC-20 tokens, the action:

First queries the token contract to determine its decimals
Encodes the transfer function call with the proper amount
Creates a transaction to the token contract
// ERC20 token transfer
const decimals = await wallet.rpcProvider.readContract({
  abi: TokenABI,
  address: args.tokenAddress as `0x${string}`,
  functionName: "decimals",
});

const data = encodeFunctionData({
  abi: TokenABI,
  functionName: "transfer",
  args: [
    args.destination as `0x${string}`,
    parseUnits(args.amount, (decimals as number) || 18),
  ],
});

tx = {
  to: args.tokenAddress as `0x${string}`,  // The token contract
  data,  // Encoded transfer function call
  value: 0n,  // No ETH value sent with an ERC-20 transfer
};

Transaction Processing
After constructing the transaction, it's processed through the 0xGasless infrastructure:

const response = await sendTransaction(wallet, tx);

// If waiting for confirmation was requested
if (args.wait) {
  const status = await waitForTransaction(wallet, response.userOpHash);
  // Check status and return result
}

Response Formats
Successful Transfer (With Waiting)
When the transfer completes successfully and you've set wait: true:

For ERC-20 tokens:

Successfully transferred 10 tokens from contract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e.
Transaction confirmed in block 12345678!


Successful Transfer Submission (Without Waiting)
When the transfer is submitted but you've set wait: false:

Successfully transferred 10 tokens from contract 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e.
Transaction submitted successfully!

You can either:
1. Check the status by asking: 
    - "What's the status of transaction 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef?"
    - "check for the status of transaction hash above"
2. Or next time, instruct the agent to wait for confirmation, like: "Transfer 10 Tokens to 0x... and wait for confirmation"


Error Responses
The action handles various error scenarios:

Transaction failed: Insufficient balance for transfer

Error transferring the asset: Error: [transaction error details]

How to Handle Decimal Precision
The action automatically handles decimal precision for different tokens:

For ERC-20 tokens, it queries the contract for decimals and uses that value
This ensures that user-friendly amounts (like "10.5") are correctly converted to the token's raw units.

Best Practices
For optimal results with the SmartTransferAction:

Double-check recipient addresses before submitting transfers
Verify token contract addresses when transferring ERC-20 tokens
Use wait: true (the default) to ensure transfers complete successfully
Check balances before transferring to ensure sufficient funds
Handle errors gracefully in your application logic
Related Actions
GetBalanceAction: Check token balances before and after transfers
CheckTransactionAction: Verify transfer transaction status
GetAddressAction: Get the user's address for transfer operations
SmartSwapAction: Swap tokens before transferring them
Previous
SmartSwapAction
