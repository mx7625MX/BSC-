#!/usr/bin/env node

/**
 * Test script to validate the BSC Bot implementation
 * Checks that all modules load correctly without errors
 */

console.log('🧪 Testing BSC Defensive Bot modules...\n');

let errors = 0;

// Test 1: Load Web3Provider
try {
  const Web3Provider = require('./src/core/Web3Provider');
  const provider = new Web3Provider();
  console.log('✅ Web3Provider loads successfully');
} catch (error) {
  console.error('❌ Web3Provider failed:', error.message);
  errors++;
}

// Test 2: Load ConfigManager
try {
  const ConfigManager = require('./src/config/ConfigManager');
  const configManager = new ConfigManager();
  const config = configManager.getConfig();
  console.log('✅ ConfigManager loads successfully');
  console.log(`   Network: ${config.network}`);
} catch (error) {
  console.error('❌ ConfigManager failed:', error.message);
  errors++;
}

// Test 3: Load logger
try {
  const logger = require('./src/utils/logger');
  logger.info('Test log message');
  console.log('✅ Logger loads successfully');
} catch (error) {
  console.error('❌ Logger failed:', error.message);
  errors++;
}

// Test 4: Verify module dependencies
try {
  require('web3');
  console.log('✅ Web3 library available');
} catch (error) {
  console.error('❌ Web3 library not found:', error.message);
  errors++;
}

try {
  require('dotenv');
  console.log('✅ dotenv library available');
} catch (error) {
  console.error('❌ dotenv library not found:', error.message);
  errors++;
}

try {
  require('winston');
  console.log('✅ winston library available');
} catch (error) {
  console.error('❌ winston library not found:', error.message);
  errors++;
}

try {
  require('electron-store');
  console.log('✅ electron-store library available');
} catch (error) {
  console.error('❌ electron-store library not found:', error.message);
  errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0) {
  console.log('✅ All tests passed! The bot is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Configure your .env file with wallet details');
  console.log('2. Run: npm run dev (to start with DevTools)');
  console.log('3. Or run: npm start (to start normally)');
  process.exit(0);
} else {
  console.error(`❌ ${errors} test(s) failed. Please check the errors above.`);
  process.exit(1);
}
