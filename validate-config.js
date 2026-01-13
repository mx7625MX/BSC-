#!/usr/bin/env node

/**
 * Configuration validation script
 * Helps users verify their .env configuration is correct
 */

require('dotenv').config();
const { Web3 } = require('web3');

console.log('🔍 Validating BSC Bot Configuration...\n');

let warnings = 0;
let errors = 0;

// Check required environment variables
console.log('📋 Checking environment variables:');

if (process.env.WALLET_ADDRESS) {
  if (process.env.WALLET_ADDRESS.startsWith('0x') && process.env.WALLET_ADDRESS.length === 42) {
    console.log('✅ WALLET_ADDRESS is set and looks valid');
  } else {
    console.error('❌ WALLET_ADDRESS is set but format looks invalid');
    console.error('   Expected: 0x followed by 40 hex characters');
    errors++;
  }
} else {
  console.error('❌ WALLET_ADDRESS is not set');
  errors++;
}

if (process.env.PRIVATE_KEY) {
  if (process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.error('❌ PRIVATE_KEY still has default value');
    errors++;
  } else {
    console.log('✅ PRIVATE_KEY is set');
  }
} else {
  console.error('❌ PRIVATE_KEY is not set');
  errors++;
}

if (process.env.NETWORK) {
  if (process.env.NETWORK === 'mainnet' || process.env.NETWORK === 'testnet') {
    console.log(`✅ NETWORK is set to: ${process.env.NETWORK}`);
  } else {
    console.warn('⚠️  NETWORK has unexpected value:', process.env.NETWORK);
    console.warn('   Expected: mainnet or testnet');
    warnings++;
  }
} else {
  console.warn('⚠️  NETWORK is not set (will default to mainnet)');
  warnings++;
}

console.log('\n📊 Checking trading parameters:');

const buyThreshold = parseFloat(process.env.BUY_THRESHOLD_PERCENT || '10');
if (buyThreshold > 0 && buyThreshold <= 100) {
  console.log(`✅ BUY_THRESHOLD_PERCENT: ${buyThreshold}%`);
} else {
  console.warn('⚠️  BUY_THRESHOLD_PERCENT is out of valid range (1-100)');
  warnings++;
}

const gasMultiplier = parseFloat(process.env.SELL_PRIORITY_GAS_MULTIPLIER || '1.5');
if (gasMultiplier >= 1 && gasMultiplier <= 5) {
  console.log(`✅ SELL_PRIORITY_GAS_MULTIPLIER: ${gasMultiplier}x`);
} else {
  console.warn('⚠️  SELL_PRIORITY_GAS_MULTIPLIER is out of reasonable range (1-5)');
  warnings++;
}

const slippage = parseFloat(process.env.SLIPPAGE_TOLERANCE || '5');
if (slippage > 0 && slippage <= 50) {
  console.log(`✅ SLIPPAGE_TOLERANCE: ${slippage}%`);
} else {
  console.warn('⚠️  SLIPPAGE_TOLERANCE is out of valid range (1-50)');
  warnings++;
}

// Test network connection
console.log('\n🌐 Testing network connection:');
async function testConnection() {
  try {
    const rpcUrl = process.env.NETWORK === 'testnet' 
      ? (process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/')
      : (process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/');
    
    console.log(`   Connecting to: ${rpcUrl}`);
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`✅ Connection successful! Current block: ${blockNumber}`);
    
    // Test wallet address if provided
    if (process.env.WALLET_ADDRESS && process.env.WALLET_ADDRESS.startsWith('0x')) {
      try {
        const balance = await web3.eth.getBalance(process.env.WALLET_ADDRESS);
        const balanceInBNB = web3.utils.fromWei(balance, 'ether');
        console.log(`✅ Wallet balance: ${balanceInBNB} BNB`);
        
        if (parseFloat(balanceInBNB) < 0.01) {
          console.warn('⚠️  Wallet balance is very low. You may not have enough for gas fees.');
          warnings++;
        }
      } catch (error) {
        console.error('❌ Failed to get wallet balance:', error.message);
        errors++;
      }
    }
  } catch (error) {
    console.error('❌ Network connection failed:', error.message);
    errors++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (errors === 0 && warnings === 0) {
    console.log('✅ Configuration is valid! Bot is ready to run.');
    console.log('\n🚀 To start the bot:');
    console.log('   npm run dev  (development mode with DevTools)');
    console.log('   npm start    (production mode)');
  } else {
    if (errors > 0) {
      console.error(`\n❌ Found ${errors} error(s) that must be fixed.`);
    }
    if (warnings > 0) {
      console.warn(`\n⚠️  Found ${warnings} warning(s) you should review.`);
    }
    console.log('\n📖 Please check the configuration and try again.');
  }
  
  process.exit(errors > 0 ? 1 : 0);
}

testConnection();
