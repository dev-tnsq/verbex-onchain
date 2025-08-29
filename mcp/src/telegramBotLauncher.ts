import VerbexTelegramBot from './services/telegramBot';
import { initDb } from './services/db';
import { verbexAI } from './services/verbexAI';

async function startTelegramBot() {
  try {
    console.log('🚀 Starting Verbex Telegram Bot...');
    
    // Initialize database
    console.log('📊 Initializing database...');
    await initDb();
    console.log('✅ Database initialized');
    
    // Initialize Verbex AI
    console.log('🤖 Initializing Verbex AI...');
    await verbexAI.initialize();
    console.log('✅ Verbex AI initialized');
    
    // Start Telegram bot
    console.log('📱 Starting Telegram bot...');
    const bot = new VerbexTelegramBot();
    await bot.start();
    
    console.log('🎉 Verbex Telegram Bot is now running!');
    console.log('📋 Available commands:');
    console.log('   /start - Initialize the bot');
    console.log('   /help - Show help message');
    console.log('   /balance - Check wallet balance');
    console.log('   /status - Show account status');
    console.log('');
    console.log('💬 Users can now chat naturally with the bot to perform DeFi operations!');
    
  } catch (error) {
    console.error('❌ Error starting Telegram bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the bot
startTelegramBot(); 