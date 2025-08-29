CheckTransactionAction
The CheckTransactionAction allows you to verify the status and retrieve details about transactions initiated through the 0xGasless SDK. This action is essential for monitoring the confirmation status of gasless transactions that have been submitted to the blockchain.

Overview
In the world of Account Abstraction (ERC-4337), tracking transactions requires monitoring User Operation hashes rather than traditional transaction hashes. This action provides a convenient way to check if a User Operation has been confirmed, is still pending, or has failed.

Input Parameters
Parameter	Type	Description	Required	Default
userOpHash	string	The User Operation Hash to check	Yes	-
confirmations	number	Number of block confirmations to wait for	No	1
maxDuration	number	Maximum time to wait in milliseconds	No	30000 (30s)
interval	number	How often to check status in milliseconds	No	5000 (5s)
Code Implementation
The core implementation monitors transaction status by polling at regular intervals:

export async function checkTransactionStatus(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof CheckTransactionInput>,
): Promise<string> {
  try {
    const status = await waitForTransaction(wallet, args.userOpHash, {
      confirmations: args.confirmations,
      maxDuration: args.maxDuration,
      interval: args.interval,
    });

    switch (status.status) {
      case "confirmed":
        return `
Transaction confirmed!
Block Number: ${status.blockNumber}
Block Confirmations: ${status.blockConfirmations}
Receipt: ${JSON.stringify(status.receipt, null, 2)}
        `;

      case "pending":
        return `
Transaction is still pending.
${status.error ? `Note: ${status.error}` : ""}
You can try checking again with a longer maxDuration.
        `;

      case "failed":
        return `
Transaction failed!
Error: ${status.error}
        `;

      default:
        return `Unknown transaction status`;
    }
  } catch (error) {
    return `Error checking transaction status: ${error}`;
  }
}

Basic Usage Examples
Check Transaction Status with Default Parameters
// Check a transaction with default parameters
const result = await agent.runAction("check_transaction_status", {
  userOpHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
});

console.log(result);
// Example output for a confirmed transaction:
// Transaction confirmed!
// Block Number: 12345678
// Block Confirmations: 1
// Receipt: {
//   "to": "0x1234...",
//   "from": "0xabcd...",
//   ...other receipt details...
// }

Check with Longer Wait Time
// Check a transaction with a longer wait time (60 seconds)
const result = await agent.runAction("check_transaction_status", {
  userOpHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  maxDuration: 60000 // 60 seconds
});

console.log(result);

Check with More Confirmations
// Wait for 3 block confirmations
const result = await agent.runAction("check_transaction_status", {
  userOpHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  confirmations: 3
});

console.log(result);

Check with Custom Polling Interval
// Check every 2 seconds instead of the default 5
const result = await agent.runAction("check_transaction_status", {
  userOpHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  interval: 2000 // 2 seconds
});

console.log(result);

Advanced Examples
Monitoring Until Confirmation
This example demonstrates a function that continues checking until the transaction is confirmed or definitely failed:

// Function to poll transaction status until it's no longer pending
async function monitorUntilConfirmed(userOpHash, maxAttempts = 10) {
  let attempts = 0;
  let status = "pending";
  
  while (status === "pending" && attempts < maxAttempts) {
    attempts++;
    console.log(`Checking transaction status (attempt ${attempts}/${maxAttempts})...`);
    
    const result = await agent.runAction("check_transaction_status", {
      userOpHash: userOpHash,
      maxDuration: 30000 // 30 seconds
    });
    
    if (result.includes("Transaction confirmed!")) {
      status = "confirmed";
      console.log("✅ Transaction confirmed!");
      console.log(result);
      return { status: "confirmed", details: result };
    } else if (result.includes("Transaction failed!")) {
      status = "failed";
      console.log("❌ Transaction failed!");
      console.log(result);
      return { status: "failed", details: result };
    } else {
      // Still pending, wait before retrying
      console.log("⏳ Transaction still pending, waiting...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
  }
  
  if (status === "pending") {
    console.log("⚠️ Transaction is still pending after all attempts.");
    return { status: "pending", details: "Maximum attempts reached" };
  }
}

// Usage:
const txResult = await agent.runAction("smart_transfer", {
  amount: "0.01",
  tokenAddress: "eth",
  destination: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  wait: false // Don't wait in the initial action
});

// Extract userOpHash from the response
const userOpHash = txResult.match(/User Operation Hash: (0x[a-fA-F0-9]{64})/)[1];

// Monitor the transaction
const finalStatus = await monitorUntilConfirmed(userOpHash);
console.log("Final transaction status:", finalStatus.status);

Response Formats
The action returns different responses based on the transaction status:

Confirmed Transaction
Transaction confirmed!
Block Number: 12345678
Block Confirmations: 1
Receipt: {
  "to": "0x1234...",
  "from": "0xabcd...",
  "transactionHash": "0x9876...",
  "blockNumber": 12345678,
  ...other receipt details...
}

Pending Transaction
Transaction is still pending.
You can try checking again with a longer maxDuration.

Failed Transaction
Transaction failed!
Error: User operation reverted during execution

How It Works
The CheckTransactionAction uses the waitForTransaction helper function which:

Polls the blockchain at regular intervals (specified by interval)
Checks if the User Operation has been included in a block
Verifies if it has reached the requested number of confirmations
Times out after the specified maximum duration
Returns detailed status information including receipts for confirmed transactions
Error Handling
The action includes comprehensive error handling to deal with various failure scenarios:

try {
  const status = await waitForTransaction(wallet, args.userOpHash, {
    confirmations: args.confirmations,
    maxDuration: args.maxDuration,
    interval: args.interval,
  });
  
  // Status handling
} catch (error) {
  return `Error checking transaction status: ${error}`;
}

Common errors include:

Invalid User Operation hash format
Network connectivity issues
RPC provider limitations
Smart account configuration problems
Best Practices
For optimal results with the CheckTransactionAction:

Store User Operation hashes when submitting transactions
Use appropriate wait times based on network conditions (congested networks may need longer)
Implement retry logic for pending transactions
Handle all status types in your application logic
Consider UX impacts of transaction monitoring and provide appropriate feedback
Related Actions
SmartSwapAction: Initiates transactions that can be checked
SmartTransferAction: Initiates transactions that can be checked
GetAddressAction: Retrieves the address to filter transactions by