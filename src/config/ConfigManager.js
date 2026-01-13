const Store = require('electron-store');
const path = require('path');

class ConfigManager {
  constructor() {
    this.store = new Store({
      name: 'bot-config',
      defaults: this.getDefaultConfig()
    });
  }

  getDefaultConfig() {
    return {
      // Network
      network: process.env.NETWORK || 'mainnet',
      bscRpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
      bscTestnetRpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',

      // Wallet
      walletAddress: process.env.WALLET_ADDRESS || '',
      privateKey: process.env.PRIVATE_KEY || '',

      // Trading parameters
      buyThresholdPercent: parseFloat(process.env.BUY_THRESHOLD_PERCENT) || 10,
      sellPriorityGasMultiplier: parseFloat(process.env.SELL_PRIORITY_GAS_MULTIPLIER) || 1.5,
      maxGasPrice: parseFloat(process.env.MAX_GAS_PRICE) || 50,
      slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE) || 5,

      // Contract addresses
      routerAddress: process.env.ROUTER_ADDRESS || '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      factoryAddress: process.env.FACTORY_ADDRESS || '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      wbnbAddress: process.env.WBNB_ADDRESS || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',

      // Monitoring
      pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS) || 5000,
      minLiquidityUsd: parseFloat(process.env.MIN_LIQUIDITY_USD) || 1000,

      // Lists
      whitelist: [],
      blacklist: [],

      // Logging
      logLevel: process.env.LOG_LEVEL || 'info',
      logFilePath: process.env.LOG_FILE_PATH || 'logs/bot.log'
    };
  }

  getConfig() {
    return this.store.store;
  }

  updateConfig(updates) {
    Object.keys(updates).forEach(key => {
      this.store.set(key, updates[key]);
    });
  }

  resetConfig() {
    this.store.clear();
    this.store.store = this.getDefaultConfig();
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }
}

module.exports = ConfigManager;
