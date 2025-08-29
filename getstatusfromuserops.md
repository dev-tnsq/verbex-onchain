GetStatusFromUserop
The GetStatusFromUserop action allows you to check the confirmation status of a previously submitted User Operation (UserOp) in Account Abstraction transactions. This is crucial for verifying that your transaction has been successfully included in a block or for troubleshooting failed transactions.

Overview
In traditional transactions, you can track status using transaction hashes. In Account Abstraction (ERC-4337), we use User Operation hashes instead. The GetStatusFromUserop action queries the bundler service to check if a UserOp has been included in a block and whether it was successful.

This action is particularly important because, unlike regular transactions, UserOps might take longer to be included in a block, especially when bundlers are busy or gas prices are volatile.

When to Use It
Use this action when:

You've submitted a transaction using send_transaction and want to check its status
You need to verify that a transaction completed successfully
You want to know if a transaction failed and why
You need to get the transaction hash of a submitted UserOp for further tracking
Input Parameters
Parameter	Type	Description	Required
userOpHash	string	The User Operation hash (0x...) obtained after submitting a transaction	Yes
Usage Example
Here's a typical flow for submitting a transaction and checking its status:

// Step 1: Send a transaction
const sendResult = await agent.runAction("send_transaction", {
  to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  value: "10000000000000000", // 0.01 ETH
  data: "0x"
});

// Extract the userOpHash from the response (assumes response is formatted as "Transaction submitted! UserOpHash: 0x...")
const userOpHash = sendResult.split("UserOpHash: ")[1].trim();

// Step 2: Check the transaction status
const statusResult = await agent.runAction("get_transaction_status", {
  userOpHash: userOpHash
});

console.log(statusResult);
// Possible outputs:
// "Transaction confirmed! TxHash: 0x123..., Block: 123456. UserOpHash: 0x789..."
// "Transaction is still pending after 60 seconds. UserOpHash: 0x789..."
// "Transaction failed. UserOpHash: 0x789... Reason: Execution reverted."


Response Types
The action will return one of the following responses:

Successful Confirmation
When a UserOp is successfully confirmed:

Transaction confirmed! TxHash: 0x123..., Block: 123456. UserOpHash: 0x789...

This provides:

The regular transaction hash (useful for exploring on block explorers)
The block number where the transaction was included
The original UserOp hash for reference
Still Pending
If the transaction is still pending after the maximum wait time (default: 60 seconds):

Transaction is still pending after 60 seconds. UserOpHash: 0x789...

This indicates the UserOp is still in the bundler's mempool and might be included in a future block.

Failed Transaction
If the transaction was included in a block but failed:

Transaction failed. UserOpHash: 0x789... Reason: Execution reverted.

This provides the reason for failure if available.

Error Cases
If there's an error while checking the status:

Error polling transaction status for 0x789...: [error message]

Advanced Example: Transaction Monitoring
Here's a more complete example of submitting a transaction and monitoring its status until completion:

// Submit a transaction to transfer tokens
const abi = '[{"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]';
const recipient = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const amount = "1000000"; // For a token with 6 decimals like USDC

// Encode the function data
const encodedData = await agent.runAction("encode_function_data", {
  abiString: abi,
  functionName: "transfer",
  argsString: `["${recipient}", "${amount}"]`
});
const data = encodedData.replace("Encoded Data: ", "");

// Submit the transaction
const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const sendResult = await agent.runAction("send_transaction", {
  to: tokenAddress,
  value: "0",
  data: data
});

// Extract the userOpHash
const userOpHash = sendResult.split("UserOpHash: ")[1].trim();

// Monitor the transaction with a retry mechanism
let status = "pending";
let attempts = 0;
const maxAttempts = 5;

while (status === "pending" && attempts < maxAttempts) {
  attempts++;
  console.log(`Checking transaction status (attempt ${attempts}/${maxAttempts})...`);
  
  const statusResult = await agent.runAction("get_transaction_status", {
    userOpHash: userOpHash
  });
  
  if (statusResult.includes("Transaction confirmed!")) {
    status = "confirmed";
    console.log("✅ Transaction confirmed!");
    console.log(statusResult);
  } else if (statusResult.includes("Transaction failed")) {
    status = "failed";
    console.log("❌ Transaction failed!");
    console.log(statusResult);
  } else {
    // Still pending, wait before retrying
    console.log("⏳ Transaction still pending, waiting...");
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
  }
}

if (status === "pending") {
  console.log("⚠️ Transaction is still pending after all attempts. Please check later with the UserOpHash.");
}


How It Works
Under the hood, GetStatusFromUserop does the following:

It polls the bundler service at regular intervals (every 5 seconds by default)
It checks if the UserOp has been included in a block by calling getUserOpReceipt
It returns appropriate status messages based on the receipt
It times out after a certain duration (60 seconds by default) if the UserOp is still pending
Notes and Limitations
The action uses polling with a maximum duration of 60 seconds. For transactions that take longer, you may need to call the action multiple times.
The bundler must be properly configured in the smart account for this action to work.
Different networks may have different confirmation times. Base is typically fast, while other L2s might vary.
If a transaction is still pending, it doesn't necessarily mean it will fail - it could still be included in a future block.
Related Actions
SendTransaction: Used to submit transactions that generate UserOp hashes
EncodeFunctionData: Often used to prepare data for transactions
ReadContract: Can be used to verify transaction results after confirmation
Previous
GetBalance
