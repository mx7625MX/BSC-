const EventEmitter = require('events');
const logger = require('../utils/logger');

class WalletMonitor extends EventEmitter {
  constructor(web3Provider, config) {
    super();
    this.web3Provider = web3Provider;
    this.config = config;
    this.isMonitoring = false;
    this.pollInterval = null;
    this.lastBlock = 0;
    this.monitoredTokens = new Set();
  }

  async start() {
    if (this.isMonitoring) {
      logger.warn('Wallet monitoring already started');
      return;
    }

    try {
      this.lastBlock = await this.web3Provider.getCurrentBlock();
      this.isMonitoring = true;

      // Start polling for new blocks
      this.pollInterval = setInterval(async () => {
        try {
          await this.checkNewBlocks();
        } catch (error) {
          logger.error('Error checking new blocks:', error);
        }
      }, this.config.pollIntervalMs || 5000);

      logger.info('Wallet monitoring started');
    } catch (error) {
      logger.error('Failed to start wallet monitoring:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isMonitoring) {
      return;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isMonitoring = false;
    logger.info('Wallet monitoring stopped');
  }

  async checkNewBlocks() {
    const currentBlock = await this.web3Provider.getCurrentBlock();

    if (currentBlock > this.lastBlock) {
      // Check blocks from lastBlock + 1 to currentBlock
      for (let blockNum = this.lastBlock + 1; blockNum <= currentBlock; blockNum++) {
        await this.scanBlock(blockNum);
      }
      this.lastBlock = currentBlock;
    }
  }

  async scanBlock(blockNumber) {
    try {
      const block = await this.web3Provider.web3.eth.getBlock(blockNumber, true);
      
      if (!block || !block.transactions) {
        return;
      }

      for (const tx of block.transactions) {
        // Check if transaction involves our wallet
        if (tx.from && tx.from.toLowerCase() === this.config.walletAddress.toLowerCase()) {
          await this.analyzeTx(tx);
        }
        if (tx.to && tx.to.toLowerCase() === this.config.walletAddress.toLowerCase()) {
          await this.analyzeTx(tx);
        }
      }
    } catch (error) {
      logger.error(`Error scanning block ${blockNumber}:`, error);
    }
  }

  async analyzeTx(tx) {
    try {
      // Check if this is a token creation or interaction
      if (tx.to === null) {
        // Contract creation
        const receipt = await this.web3Provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.contractAddress) {
          const tokenData = {
            address: receipt.contractAddress,
            creator: tx.from,
            txHash: tx.hash,
            blockNumber: tx.blockNumber,
            timestamp: Date.now()
          };

          if (!this.monitoredTokens.has(tokenData.address)) {
            this.monitoredTokens.add(tokenData.address);
            logger.info(`New token created: ${tokenData.address}`);
            this.emit('token-detected', tokenData);
          }
        }
      } else if (tx.input && tx.input.length > 10) {
        // Check for token transfer or liquidity addition
        const methodId = tx.input.substring(0, 10);
        
        // Common method IDs
        // 0xa9059cbb - transfer
        // 0x23b872dd - transferFrom
        // 0xe8e33700 - addLiquidity
        // 0xf305d719 - addLiquidityETH
        
        if (methodId === '0xe8e33700' || methodId === '0xf305d719') {
          // Liquidity addition detected
          logger.info(`Liquidity addition detected in tx: ${tx.hash}`);
          await this.handleLiquidityAddition(tx);
        }
      }
    } catch (error) {
      logger.error('Error analyzing transaction:', error);
    }
  }

  async handleLiquidityAddition(tx) {
    try {
      const receipt = await this.web3Provider.getTransactionReceipt(tx.hash);
      
      // Parse logs to find token addresses
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          // PancakeSwap pair created event
          if (log.topics[0] === '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9') {
            const pairAddress = '0x' + log.topics[1].substring(26);
            
            const tokenData = {
              address: pairAddress,
              creator: tx.from,
              txHash: tx.hash,
              blockNumber: tx.blockNumber,
              timestamp: Date.now(),
              type: 'liquidity'
            };

            if (!this.monitoredTokens.has(tokenData.address)) {
              this.monitoredTokens.add(tokenData.address);
              logger.info(`New liquidity pool detected: ${tokenData.address}`);
              this.emit('token-detected', tokenData);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error handling liquidity addition:', error);
    }
  }

  getMonitoredTokens() {
    return Array.from(this.monitoredTokens);
  }
}

module.exports = WalletMonitor;
