Wallet-Management
Wallet Management
AgentKit uses the 0xGasless SDK to manage wallets and perform onchain operations. The 0xGasless SDK supports a wide variety of actions, including:

Creating MPC wallets
Signing transactions
Deploying and interacting with tokens
Invoking smart contracts and querying chain state
There are two options for giving an agent access to a wallet:

Provide a mnemonic phrase in the .env file.
export MNEMONIC_PHRASE="your_mnemonic_phrase" # Optional

Let the agent create a new wallet. If a mnemonic phrase is not provided, the agent will create a new 1-of-1 developer wallet.
By default, AgentKit supports the following tools:
get_balance - Get balance for specific assets
trade - Trade assets (mainnets only)
transfer - Transfer assets between addresses
Any action not supported by default by AgentKit can be added by adding agent capabilities.

Supported Networks
AgentKit supports every network that the 0xGasless SDK supports.

To switch networks, you can update the NETWORK_ID environment variable in the .env file, or by executing the following command:

export NETWORK_ID=<NETWORK_ID> # e.g. "base-sepolia", "ethereum-mainnet", "arbitrum-mainnet", etc.


