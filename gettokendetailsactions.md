GetTokenDetailsAction
The GetTokenDetailsAction retrieves detailed information about ERC-20 tokens on the blockchain. This action provides essential metadata about tokens, including their name, symbol, decimal precision, and contract specifics.

Overview
When working with ERC-20 tokens, it's crucial to have accurate information about their implementation details. The GetTokenDetailsAction makes this process simple by:

Fetching the token's official name and symbol
Determining the token's decimal precision
Verifying the token exists on the current chain
Providing the normalized contract address
This information is essential for properly displaying token amounts, creating accurate transactions, and ensuring you're interacting with the correct token contract.

Code Implementation
The core implementation queries the token contract and formats the results:

export async function getTokenDetails(
  wallet: ZeroXgaslessSmartAccount,
  args: z.infer<typeof GetTokenDetailsInput>,
): Promise<string> {
  try {
    const details = await fetchTokenDetails(wallet, args.tokenAddress);
    if (!details) {
      return "Error getting token details";
    }
    return `
    Token Details:
            Name: ${details.name}
            Symbol: ${details.symbol}
            Decimals: ${details.decimals}
            Address: ${details.address}
            Chain ID: ${details.chainId}
    `;
  } catch (error) {
    return `Error getting token details: ${error}`;
  }
}

Input Parameters
Parameter	Type	Description	Required	Default
tokenAddress	string	The ERC-20 token contract address	Yes	-
Response Format
The action returns a formatted string with the token's metadata:

Token Details:
        Name: USD Coin
        Symbol: USDC
        Decimals: 6
        Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
        Chain ID: 1

Basic Usage Example
// Get details about the USDC token on Ethereum
const result = await agent.runAction("get_token_details", {
  tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
});

console.log(result);
// Output example:
// Token Details:
//         Name: USD Coin
//         Symbol: USDC
//         Decimals: 6
//         Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
//         Chain ID: 1

Practical Applications
Token Validation Before Transactions
// Validate a token before transferring it
async function validateAndTransfer(tokenAddress, amount, destination) {
  // First, get token details to confirm it's a valid token
  const detailsResult = await agent.runAction("get_token_details", {
    tokenAddress
  });
  
  // Check if the details were successfully retrieved
  if (detailsResult.includes("Error")) {
    console.error("Invalid token address or token not found");
    return { success: false, error: "Invalid token" };
  }
  
  // Parse the token details
  const decimals = parseInt(detailsResult.match(/Decimals: (\d+)/)[1]);
  const symbol = detailsResult.match(/Symbol: (\w+)/)[1];
  
  console.log(`Preparing to transfer ${amount} ${symbol}...`);
  
  // Execute the transfer with the validated token
  const transferResult = await agent.runAction("smart_transfer", {
    amount,
    tokenAddress,
    destination
  });
  
  return { success: true, result: transferResult };
}

// Usage
const result = await validateAndTransfer(
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "10",
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
);

Amount Formatting Helper
// Create a helper function to format token amounts with proper decimals
async function formatTokenAmount(tokenAddress, amount) {
  // Get token details to determine decimals
  const detailsResult = await agent.runAction("get_token_details", {
    tokenAddress
  });
  
  // Extract token information
  const name = detailsResult.match(/Name: (.+)/)[1].trim();
  const symbol = detailsResult.match(/Symbol: (.+)/)[1].trim();
  const decimals = parseInt(detailsResult.match(/Decimals: (\d+)/)[1]);
  
  // Format the amount based on decimals
  const formattedAmount = parseFloat(amount).toFixed(decimals);
  
  return {
    name,
    symbol,
    decimals,
    rawAmount: amount,
    formattedAmount,
    display: `${formattedAmount} ${symbol}`
  };
}

// Usage
const amountInfo = await formatTokenAmount(
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "10.5"
);

console.log(`You're sending ${amountInfo.display}`);
// Output: "You're sending 10.500000 USDC"

Cross-Chain Token Verification
// Verify if the same token exists on multiple chains
async function checkTokenAcrossChains(tokenSymbol, chainIds) {
  const results = {};
  
  for (const chainId of chainIds) {
    // This would require switching chains in a real implementation
    console.log(`Checking for ${tokenSymbol} on chain ${chainId}...`);
    
    // First get the token address for this chain
    // (In a real app, you'd need a token registry or API)
    const tokenAddress = getTokenAddressBySymbol(tokenSymbol, chainId);
    
    if (!tokenAddress) {
      results[chainId] = { exists: false, message: "Token not found on this chain" };
      continue;
    }
    
    // Check token details
    const detailsResult = await agent.runAction("get_token_details", {
      tokenAddress
    });
    
    if (detailsResult.includes("Error")) {
      results[chainId] = { exists: false, message: "Failed to fetch token details" };
    } else {
      results[chainId] = {
        exists: true,
        details: parseTokenDetails(detailsResult)
      };
    }
  }
  
  return results;
}

// Helper function to parse token details from the response
function parseTokenDetails(detailsResult) {
  return {
    name: detailsResult.match(/Name: (.+)/)[1].trim(),
    symbol: detailsResult.match(/Symbol: (.+)/)[1].trim(),
    decimals: parseInt(detailsResult.match(/Decimals: (\d+)/)[1]),
    address: detailsResult.match(/Address: (0x[a-fA-F0-9]+)/)[1],
    chainId: parseInt(detailsResult.match(/Chain ID: (\d+)/)[1])
  };
}

// Usage
const tokenInfo = await checkTokenAcrossChains("USDC", [1, 56, 137, 43114]);
console.log("USDC across chains:", tokenInfo);

How It Works
The GetTokenDetailsAction works by:

Taking a token contract address as input
Using the fetchTokenDetails helper function which:
Queries the token's ERC-20 interface for name, symbol, and decimals
Verifies the contract exists and responds to standard ERC-20 calls
Returns structured token metadata including the chain ID
Formatting the results into a human-readable response
Under the hood, this relies on the standard ERC-20 interface that all compliant tokens implement, which includes functions for name(), symbol(), and decimals().

Error Handling
The action includes error handling for cases where:

The provided address is not a valid token contract
The token does not implement the required ERC-20 functions
The contract exists but is not an ERC-20 token
Network issues prevent successful contract interaction
try {
  const details = await fetchTokenDetails(wallet, args.tokenAddress);
  if (!details) {
    return "Error getting token details";
  }
  // Format and return results
} catch (error) {
  return `Error getting token details: ${error}`;
}

Common Token Information
Here's information about some common tokens you might query:

Token	Symbol	Decimals	Example Address (Ethereum)
USD Coin	USDC	6	0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Tether	USDT	6	0xdAC17F958D2ee523a2206206994597C13D831ec7
Wrapped Ether	WETH	18	0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
Dai	DAI	18	0x6B175474E89094C44Da98b954EedeAC495271d0F
Best Practices
For optimal results with the GetTokenDetailsAction:

Validate token addresses before performing transactions
Cache token details for frequently used tokens to reduce API calls
Handle token decimals properly when formatting amounts
Verify tokens across chains when building cross-chain applications
Check for non-standard tokens that might not fully implement ERC-20
Related Actions
GetBalanceAction: Check token balances using the verified address
SmartTransferAction: Transfer tokens after verifying their details
SmartSwapAction: Swap tokens using verified decimals for proper amount formatting