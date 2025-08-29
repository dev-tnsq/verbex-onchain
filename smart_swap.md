SmartSwapAction
The SmartSwapAction enables seamless, gasless token swaps across multiple blockchain networks. This powerful action lets users exchange tokens without needing to hold native tokens for gas fees, powered by deBridge's Decentralized Liquidity Network (DLN).

Overview
Token swapping is one of the most common operations in DeFi. The SmartSwapAction simplifies this process by:

Finding optimal trading routes automatically via deBridge DLN
Handling token approvals when needed
Supporting multiple input methods (addresses or symbols)
Providing automatic slippage protection
Offering transaction status monitoring
All swaps are executed using the 0xGasless infrastructure, which means users don't need to pay gas fees - making DeFi accessible to everyone.

Supported Networks
BSC (ChainID: 56)
Avalanche (ChainID: 43114)
Base (ChainID: 8453)
Moonbeam (ChainID: 1284)
Sonic (ChainID: 146)
Input Parameters
Parameter	Type	Description	Required	Default
tokenIn	string	Address of the token to swap from	No*	-
tokenOut	string	Address of the token to swap to	No*	-
tokenInSymbol	string	Symbol of the token to swap from (e.g., "USDC")	No*	-
tokenOutSymbol	string	Symbol of the token to swap to (e.g., "ETH")	No*	-
amount	string	Amount of input token to swap	Yes	-
slippage	string	Slippage tolerance in percentage or "auto"	No	"auto"
wait	boolean	Whether to wait for confirmation	No	true
approveMax	boolean	Approve maximum token allowance	No	false
*Either token addresses or symbols must be provided

Code Implementation
The core implementation uses deBridge's DLN API to find optimal swap routes and execute trades:

// Core steps in the smartSwap function
export async function smartSwap(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof SmartSwapInput>,
): Promise<string> {
  try {
    // 1. Resolve token addresses from symbols if needed
    let tokenInAddress = args.tokenIn;
    let tokenOutAddress = args.tokenOut;
    
    if (args.tokenInSymbol && !tokenInAddress) {
      tokenInAddress = await resolveTokenSymbol(wallet, args.tokenInSymbol);
    }
    if (args.tokenOutSymbol && !tokenOutAddress) {
      tokenOutAddress = await resolveTokenSymbol(wallet, args.tokenOutSymbol);
    }
    
    // 2. Format the token amount with proper decimals
    const formattedAmount = await formatTokenAmount(
      wallet,
      tokenInAddress as `0x${string}`,
      args.amount,
    );
    
    // 3. Call deBridge DLN API to get swap transaction data
    const baseUrl = "https://dln.debridge.finance/v1.0/chain/transaction";
    const queryParams = new URLSearchParams({
      chainId: chainId.toString(),
      tokenIn: tokenInAddress,
      tokenInAmount: formattedAmount,
      tokenOut: tokenOutAddress,
      tokenOutRecipient: await wallet.getAddress(),
      slippage: args.slippage || "auto",
      affiliateFeePercent: "0",
    });
    
    // 4. Check if approval is needed for ERC20 tokens
    if (tokenInAddress !== "0x0000000000000000000000000000000000000000") {
      const approvalResult = await checkAndApproveTokenAllowance(
        wallet,
        tokenInAddress as `0x${string}`,
        spenderAddress,
        BigInt(formattedAmount),
        args.approveMax,
      );
    }
    
    // 5. Execute the swap transaction
    const txResponse = await sendTransaction(wallet, transactionData.tx as Transaction);
    
    // 6. Wait for confirmation if requested
    if (args.wait) {
      const status = await waitForTransaction(wallet, txResponse.userOpHash);
      // Return confirmation details
    }
    
    // 7. Return transaction details
    return `Swap order submitted successfully!...`;
  } catch (error) {
    console.error("Swap error:", error);
    return `Error creating swap order: ${error instanceof Error ? error.message : String(error)}`;
  }
}


Basic Usage Examples
Swap Using Token Symbols
// Swap 10 USDC to USDT
const result = await agent.runAction("smart_swap", {
  tokenInSymbol: "USDC",
  tokenOutSymbol: "USDT",
  amount: "10"
});

console.log(result);
// Output example:
// Swap completed and confirmed in block 12345678!
// Input: 10 USDC
// Expected Output: 10 USDT
// Transaction Hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Swap Using Token Addresses
// Swap 0.1 WETH to USDC using addresses
const result = await agent.runAction("smart_swap", {
  tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  amount: "0.1"
});

console.log(result);

Swap Without Waiting for Confirmation
// Swap without waiting for confirmation
const result = await agent.runAction("smart_swap", {
  tokenInSymbol: "USDT",
  tokenOutSymbol: "WETH",
  amount: "50",
  wait: false
});

console.log(result);
// Output includes userOpHash to check status later

Swap With Custom Slippage
// Swap with 1% slippage tolerance
const result = await agent.runAction("smart_swap", {
  tokenInSymbol: "AVAX",
  tokenOutSymbol: "USDC",
  amount: "5",
  slippage: "1"
});

console.log(result);

Swap With Max Approval
// Swap with maximum token approval (useful for repeated swaps)
const result = await agent.runAction("smart_swap", {
  tokenInSymbol: "USDT",
  tokenOutSymbol: "ETH",
  amount: "25",
  approveMax: true
});

console.log(result);

Advanced Examples
Complete DeFi Workflow
This example demonstrates a complete workflow of checking balances, performing a swap, and verifying the transaction:

// Step 1: Check current balances
const balanceResult = await agent.runAction("get_balance", {
  tokenSymbols: ["USDC", "ETH"]
});
console.log("Current balances:");
console.log(balanceResult);

// Step 2: Execute the swap
const swapResult = await agent.runAction("smart_swap", {
  tokenInSymbol: "USDC",
  tokenOutSymbol: "ETH",
  amount: "10",
  wait: true,
  approveMax: true
});
console.log("Swap result:");
console.log(swapResult);

// Step 3: Extract transaction hash and check details
const txHash = swapResult.match(/Transaction Hash: (0x[a-fA-F0-9]{64})/)[1];
const txDetails = await agent.runAction("check_transaction", {
  transactionHash: txHash
});
console.log("Transaction details:");
console.log(txDetails);

// Step 4: Check updated balances
const updatedBalances = await agent.runAction("get_balance", {
  tokenSymbols: ["USDC", "ETH"]
});
console.log("Updated balances:");
console.log(updatedBalances);

How deBridge Integration Works
The SmartSwapAction uses deBridge's Decentralized Liquidity Network (DLN) API to execute swaps. Here's how the integration works:

API Endpoint: The action calls the deBridge DLN API at https://dln.debridge.finance/v1.0/chain/transaction

Price Estimation: Before executing a swap, it first checks for a price estimation:

const estimationUrl = formedDebridgeApiUrl.replace("/transaction", "/estimation");
const estimationResponse = await fetch(estimationUrl);
let parsedEstimation = await estimationResponse.json();

Transaction Data: The API returns the complete transaction data needed to execute the swap:

const debridgeResponse = await fetch(formedDebridgeApiUrl);
const transactionData = await debridgeResponse.json();

Approval Flow: For ERC-20 tokens, the action automatically handles approvals:

const approvalResult = await checkAndApproveTokenAllowance(
  wallet,
  tokenInAddress as `0x${string}`,
  spenderAddress,
  BigInt(formattedAmount),
  args.approveMax,
);

Transaction Execution: Finally, it sends the transaction through the smart account:

const txResponse = await sendTransaction(wallet, transactionData.tx as Transaction);


Response Formats
Successful Swap (With Waiting)
When the swap completes successfully and you've set wait: true:

Swap completed and confirmed in block 12345678!
Input: 10 USDC
Expected Output: 10 USDT
Transaction Hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Successful Swap Submission (Without Waiting)
When the swap is submitted but you've set wait: false:

Swap order submitted successfully!
Input: 10 USDC
Expected Output: 10 USDT
User Operation Hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

You can either:
1. Check the status by asking: "What's the status of transaction 0x1234...?"
2. Or next time, add "wait: true" to wait for confirmation, like: "Swap 100 USDC to USDT and wait for confirmation"
3. If you encounter allowance errors, add "approveMax: true" to approve maximum token spending


Swap Estimation (No Transaction)
When only getting a price estimate:

Swap estimation:
Input: 10 USDC
Expected Output: 10 USDT
Min Output: 9.95 USDT
Recommended Slippage: 0.5%

Error Handling
The implementation handles several specific error scenarios:

Insufficient Liquidity
if (
  parsedEstimation.errorMessage?.includes("insufficient liquidity") ||
  parsedEstimation.errorMessage?.includes("no route found")
) {
  return `Swap not available: Insufficient liquidity or no route found between these tokens.`;
}


Amount Too Small
if (parsedEstimation.errorMessage?.includes("amount too small")) {
  return `Swap not available: The amount is too small. Please try a larger amount.`;
}

Token Allowance Errors
if (
  transactionData.errorMessage?.includes("transfer amount exceeds allowance") ||
  transactionData.errorMessage?.includes("BEP20: transfer amount exceeds allowance")
) {
  return `Swap failed: Token allowance error. You need to approve the swap contract to spend your tokens.
  
Please try again with "approveMax: true" parameter to automatically approve token spending.
Example: "Swap 0.01 USDT to WETH with approveMax: true"`;
}


Chain-Specific Issues (BNB Chain Example)
if (transactionData.errorMessage?.includes("Bad Request")) {
  return `Swap failed: Invalid request parameters. Please check your token addresses and amount.
  
For BNB Chain (56), make sure:
1. The token amount is not too small (try at least 0.01 USDT)
2. There is sufficient liquidity for this pair
3. You have enough balance of the input token`;
}


Token Resolution
The action can resolve token symbols to addresses using the resolveTokenSymbol helper:

// If token symbol is provided, resolve it to an address
if (args.tokenInSymbol && !tokenInAddress) {
  const resolved = await resolveTokenSymbol(wallet, args.tokenInSymbol);
  if (!resolved) {
    return `Error: Could not resolve token symbol "${args.tokenInSymbol}" to an address on chain ${chainId}`;
  }
  tokenInAddress = resolved;
}


Token Approval Flow
For ERC-20 tokens, the swap process includes an approval step:

// For non-native tokens, we need to check and approve allowance if needed
if (tokenInAddress !== "0x0000000000000000000000000000000000000000") {
  const spenderAddress = transactionData.tx.to as `0x${string}`;

  // Check and approve token allowance
  const approvalResult = await checkAndApproveTokenAllowance(
    wallet,
    tokenInAddress as `0x${string}`,
    spenderAddress,
    BigInt(formattedAmount),
    args.approveMax,
  );

  if (!approvalResult.success) {
    return `Failed to approve token spending: ${approvalResult.error}`;
  }

  // Wait for approval confirmation if needed
  if (approvalResult.userOpHash && args.wait) {
    const approvalStatus = await waitForTransaction(wallet, approvalResult.userOpHash);
    // Check approval status
  }
}

Best Practices
For optimal results with the SmartSwapAction:

Use Token Symbols: Token symbols are easier to work with than addresses
Enable Max Approval: Set approveMax: true for tokens you swap frequently
Handle Chain-specific Issues: Be aware that certain chains (like BSC) may have specific requirements
Start with Small Amounts: Test with small amounts when using new token pairs
Wait for Confirmation: Keep the default wait: true to ensure transactions complete
Related Actions
GetBalanceAction: Check token balances before and after swaps
CheckTransactionAction: Verify swap transaction status
GetTokenDetailsAction: Get token information before swapping
SmartTransferAction: Transfer tokens after swapping
Previous
Agent Actions
