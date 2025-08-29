Quickstart
Step 1: Obtain Required API Keys
0xGasless API Key
Go to 0xGasless Portal.
Generate an API key and save both the key name and private key.
OpenAI API Key
Go to OpenAI Platform. (AgentKit is model-agnostic, but we'll use OpenAI for this guide.)
If you're using the NodeJS template, we use xAI by default since they offer free credits.
Sign up or log in to your account.
Navigate to the API keys section.
Create a new API key.
Fund your account with at least $1-2 for testing.
Caution: Never commit API keys to version control or share them publicly. Use environment variables or secure secret management.

Starting from Scratch with LangChain
For developers who want more control over their agent implementation, you can start from scratch using LangChain integration.

Prerequisites
Node.js 18+
bun
0xGasless API Key
API keys to the LLM of your choice (we recommend OpenAI)
A fresh directory.
node --version
bun --version

Installation
Start the chatbot by executing the following commands:

cd 0xGasless-langchain/examples/chatbot
bun init 
bun install

To use the 0xGasless AgentKit Toolkit with LangChain, first install the package:

bun add @0xgasless/agentkit  #(0.0.4)new version avaiable 
bun add @langchain/core
bun add @langchain/langgraph
bun add @langchain/openai

Environment Setup
Set the required environment variables:

PRIVATE_KEY=Your_private_key
API_KEY="Your_api_key"
OPENAI_API_KEY="Your_openai_api_key"	
OPENROUTER_API_KEY="Your_openrouter_api_key"	
RPC_URL="Your_rpc_url"
CHAIN_ID=Your_chain_id

Creating Your First Agent
Create a new file my_agent.ts, which will contain your agent logic:

import { Agentkit, AgentkitToolkit, } from "@0xgasless/agentkit";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];

  const requiredVars = ["OPENROUTER_API_KEY", "PRIVATE_KEY", "RPC_URL", "API_KEY", "CHAIN_ID"];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  if (!process.env.CHAIN_ID) {
    console.warn("Warning: CHAIN_ID not set, defaulting to base-sepolia");
  }
}

validateEnvironment();

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
    });
    

    // Initialize 0xGasless AgentKit
    const agentkit = await Agentkit.configureWithWallet({
      privateKey: "0x10e376a4fd289f943fea2ff4f73b6e1474886606f17b7ad79b66ba06ecb255f6" ,  //  Correct type assertion
      rpcUrl: process.env.RPC_URL as string,
      apiKey: process.env.API_KEY as string,
      chainID: Number(process.env.CHAIN_ID) || 43114, // Base Sepolia
    });
    

    // Initialize AgentKit Toolkit and get tools
    const agentkitToolkit = new AgentkitToolkit(agentkit);
    const tools = agentkitToolkit.getTools();

    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "0xGasless AgentKit Chatbot Example!" } };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact with EVM chains using 0xGasless smart accounts. You can perform 
        gasless transactions using the account abstraction wallet. You can check balances of ETH and any ERC20 token 
        by providing their contract address. If someone asks you to do something you can't do with your currently 
        available tools, you must say so. Be concise and helpful with your responses.
      `,
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

// For runAutonomousMode, runChatMode, chooseMode and main functions, reference:

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */

//biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}



Adding Agent Functionality
Extend your agent with chat capabilities. To add more functionality, see the Add Agent Capabilities guide.



/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
//biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Choose whether to run in autonomous or chat mode based on user input
 *
 * @returns Selected mode
 */
async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    if (choice === "1" || choice === "chat") {
      rl.close();
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      rl.close();
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
  }
}

/**
 * Start the chatbot agent
 */
async function main() {
  try {
    const { agent, config } = await initializeAgent();
    // const mode = await chooseMode();

    await runChatMode(agent, config);
    // if (mode === "chat") {
    // } else {
    //   await runAutonomousMode(agent, config);
    // }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  console.log("Starting Agent...");
  main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}


Testing Your Agent
Try these example interactions:

You: What is your wallet address?
You: Deploy an NFT collection called 'Cool Cats' with symbol 'COOL'
You: Register a basename for yourself that represents your identity

To check balance
Prompt:
Input

 get my balances

Output

-------------------
Smart Account Balances:
0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE: 0
-------------------
Your ETH balance in the smart account is 0. If you want to check balances of specific ERC20 tokens, please provide their contract addresses.
-------------------


To check balance and token balance
Prompt:
Input

get my balances and the token balance for 0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf 

Output

-------------------
Smart Account Balances:
0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE: 0
-------------------
Your balances are as follows:

- ETH: 0
- Token (Contract Address: 0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf): 0.009989

If you have any other questions or need further assistance, feel free to ask!

To transfer token
Prompt:
Input

nice now can you transfer 0.0001 tokens using the same token contract as above to recipient = "0x9Fce300Ca5bC64ab0837fbFaB2a06C5041B00825


Output

-------------------
Successfully transferred 0.0001 tokens from contract 0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf to 0x9Fce300Ca5bC64ab0837fbFaB2a06C5041B00825.
Transaction hash: 0x905e1876dca5ce163c9d34145f54a6850885a2c57ee203fc6222afd0984ef7cd
-------------------
The transfer of 0.0001 tokens from the contract address 0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf to the recipient address 0x9Fce300Ca5bC64ab0837fbFaB2a06C5041B00825 was successful.

Here is the transaction hash for your reference: 0x905e1876dca5ce163c9d34145f54a6850885a2c57ee203fc6222afd0984ef7cd.

If you need anything else, let me know!
-------------------