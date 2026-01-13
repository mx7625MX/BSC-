const Web3Provider = require('./Web3Provider');
const WalletMonitor = require('./WalletMonitor');
const LiquidityMonitor = require('./LiquidityMonitor');
const TransactionManager = require('./TransactionManager');
const ConfigManager = require('../config/ConfigManager');
const logger = require('../utils/logger');
const EventEmitter = require('events');

class BotController extends EventEmitter {
  constructor() {
    super();
    this.web3Provider = new Web3Provider();
    this.walletMonitor = null;
    this.liquidityMonitor = null;
    this.transactionManager = null;
    this.configManager = new ConfigManager();
    this.isRunning = false;
    this.transactions = [];
    this.status = {
      running: false,
      connected: false,
      walletAddress: null,
      balance: '0',
      monitoredTokens: 0,
      totalTransactions: 0,
      lastUpdate: null
    };
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Bot is already running');
      return;
    }

    try {
      const config = this.configManager.getConfig();
      
      // Validate configuration
      if (!config.walletAddress || !config.privateKey) {
        throw new Error('Wallet address and private key are required');
      }

      // Connect to blockchain
      const rpcUrl = config.network === 'testnet' 
        ? config.bscTestnetRpcUrl 
        : config.bscRpcUrl;
      
      await this.web3Provider.connect(rpcUrl, config.privateKey);

      // Initialize components
      this.walletMonitor = new WalletMonitor(this.web3Provider, config);
      this.liquidityMonitor = new LiquidityMonitor(this.web3Provider, config);
      this.transactionManager = new TransactionManager(this.web3Provider, config);

      // Set up event listeners
      this.setupEventListeners();

      // Start monitoring
      await this.walletMonitor.start();
      await this.liquidityMonitor.start();

      this.isRunning = true;
      this.updateStatus();

      logger.info('Bot started successfully');
      this.emit('bot-started');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      logger.warn('Bot is not running');
      return;
    }

    try {
      if (this.walletMonitor) {
        await this.walletMonitor.stop();
      }
      if (this.liquidityMonitor) {
        await this.liquidityMonitor.stop();
      }

      this.web3Provider.disconnect();
      this.isRunning = false;
      this.updateStatus();

      logger.info('Bot stopped successfully');
      this.emit('bot-stopped');
    } catch (error) {
      logger.error('Failed to stop bot:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.walletMonitor.on('token-detected', async (tokenData) => {
      logger.info(`New token detected: ${tokenData.address}`);
      this.emit('token-detected', tokenData);
      
      // Add to liquidity monitor
      await this.liquidityMonitor.addToken(tokenData.address);
      this.updateStatus();
    });

    this.liquidityMonitor.on('large-buy-detected', async (buyData) => {
      logger.warn(`Large buy detected: ${JSON.stringify(buyData)}`);
      this.emit('large-buy-detected', buyData);

      // Check if token is whitelisted or buyer is blacklisted
      const config = this.configManager.getConfig();
      if (config.whitelist.includes(buyData.tokenAddress)) {
        logger.info('Token is whitelisted, skipping sell');
        return;
      }
      if (config.blacklist.includes(buyData.buyer)) {
        logger.info('Buyer is blacklisted, executing defensive sell');
        await this.executePrioritySell(buyData);
      } else if (buyData.percentOfLiquidity >= config.buyThresholdPercent) {
        logger.info('Buy threshold exceeded, executing defensive sell');
        await this.executePrioritySell(buyData);
      }
    });

    this.transactionManager.on('transaction-completed', (txData) => {
      this.transactions.push(txData);
      this.updateStatus();
      this.emit('transaction-completed', txData);
    });
  }

  async executePrioritySell(buyData) {
    try {
      const result = await this.transactionManager.executeSell(
        buyData.tokenAddress,
        buyData.amount,
        true // priority
      );
      logger.info(`Priority sell executed: ${result.txHash}`);
    } catch (error) {
      logger.error('Priority sell failed:', error);
    }
  }

  updateStatus() {
    this.status = {
      running: this.isRunning,
      connected: this.web3Provider.isConnected(),
      walletAddress: this.configManager.getConfig().walletAddress,
      balance: '0', // Will be updated async
      monitoredTokens: this.liquidityMonitor ? this.liquidityMonitor.getMonitoredTokenCount() : 0,
      totalTransactions: this.transactions.length,
      lastUpdate: new Date().toISOString()
    };

    // Update balance asynchronously
    if (this.web3Provider.isConnected() && this.status.walletAddress) {
      this.web3Provider.getBalance(this.status.walletAddress)
        .then(balance => {
          this.status.balance = balance;
          this.emit('status-updated', this.status);
        })
        .catch(err => logger.error('Failed to get balance:', err));
    }
  }

  getStatus() {
    return this.status;
  }

  getConfig() {
    return this.configManager.getConfig();
  }

  async updateConfig(newConfig) {
    this.configManager.updateConfig(newConfig);
    logger.info('Configuration updated');
    
    // Restart bot if running
    if (this.isRunning) {
      await this.stop();
      await this.start();
    }
  }

  getTransactions() {
    return this.transactions;
  }

  getLogs(limit = 100) {
    return logger.getRecentLogs(limit);
  }

  async addToWhitelist(address) {
    const config = this.configManager.getConfig();
    if (!config.whitelist.includes(address)) {
      config.whitelist.push(address);
      this.configManager.updateConfig(config);
      logger.info(`Added ${address} to whitelist`);
    }
  }

  async addToBlacklist(address) {
    const config = this.configManager.getConfig();
    if (!config.blacklist.includes(address)) {
      config.blacklist.push(address);
      this.configManager.updateConfig(config);
      logger.info(`Added ${address} to blacklist`);
    }
  }

  async removeFromWhitelist(address) {
    const config = this.configManager.getConfig();
    config.whitelist = config.whitelist.filter(a => a !== address);
    this.configManager.updateConfig(config);
    logger.info(`Removed ${address} from whitelist`);
  }

  async removeFromBlacklist(address) {
    const config = this.configManager.getConfig();
    config.blacklist = config.blacklist.filter(a => a !== address);
    this.configManager.updateConfig(config);
    logger.info(`Removed ${address} from blacklist`);
  }
}

module.exports = BotController;
