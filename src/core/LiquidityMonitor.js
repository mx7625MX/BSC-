const EventEmitter = require('events');
const logger = require('../utils/logger');

// PancakeSwap Router ABI (minimal)
const ROUTER_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}],
    "name": "getAmountsOut",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Pair ABI (minimal)
const PAIR_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {"internalType": "uint112", "name": "_reserve0", "type": "uint112"},
      {"internalType": "uint112", "name": "_reserve1", "type": "uint112"},
      {"internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32"}
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token0",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token1",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "Swap",
    "type": "event"
  }
];

class LiquidityMonitor extends EventEmitter {
  constructor(web3Provider, config) {
    super();
    this.web3Provider = web3Provider;
    this.config = config;
    this.isMonitoring = false;
    this.monitoredPairs = new Map(); // tokenAddress -> pairData
    this.pollInterval = null;
    this.lastBlock = 0;
  }

  async start() {
    if (this.isMonitoring) {
      logger.warn('Liquidity monitoring already started');
      return;
    }

    try {
      this.lastBlock = await this.web3Provider.getCurrentBlock();
      this.isMonitoring = true;

      // Start polling for swap events
      this.pollInterval = setInterval(async () => {
        try {
          await this.checkSwapEvents();
        } catch (error) {
          logger.error('Error checking swap events:', error);
        }
      }, this.config.pollIntervalMs || 5000);

      logger.info('Liquidity monitoring started');
    } catch (error) {
      logger.error('Failed to start liquidity monitoring:', error);
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
    logger.info('Liquidity monitoring stopped');
  }

  async addToken(tokenAddress) {
    try {
      // Get pair address from factory
      const pairAddress = await this.getPairAddress(tokenAddress);
      
      if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
        logger.warn(`No liquidity pair found for token: ${tokenAddress}`);
        return;
      }

      const pairContract = this.web3Provider.getContract(PAIR_ABI, pairAddress);
      const reserves = await pairContract.methods.getReserves().call();
      const token0 = await pairContract.methods.token0().call();
      const token1 = await pairContract.methods.token1().call();

      const pairData = {
        pairAddress,
        tokenAddress,
        token0,
        token1,
        reserve0: reserves._reserve0,
        reserve1: reserves._reserve1,
        lastUpdate: Date.now()
      };

      this.monitoredPairs.set(tokenAddress, pairData);
      logger.info(`Added token to liquidity monitoring: ${tokenAddress}`);
    } catch (error) {
      logger.error(`Failed to add token to monitoring: ${tokenAddress}`, error);
    }
  }

  async getPairAddress(tokenAddress) {
    try {
      // Use PancakeSwap Factory to get pair address
      const FACTORY_ABI = [
        {
          "constant": true,
          "inputs": [
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "address", "name": "", "type": "address"}
          ],
          "name": "getPair",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ];

      const factoryContract = this.web3Provider.getContract(
        FACTORY_ABI,
        this.config.factoryAddress
      );

      const pairAddress = await factoryContract.methods.getPair(
        tokenAddress,
        this.config.wbnbAddress
      ).call();

      return pairAddress;
    } catch (error) {
      logger.error('Error getting pair address:', error);
      return null;
    }
  }

  async checkSwapEvents() {
    const currentBlock = await this.web3Provider.getCurrentBlock();

    if (currentBlock > this.lastBlock) {
      for (const [tokenAddress, pairData] of this.monitoredPairs) {
        await this.checkPairSwaps(pairData, this.lastBlock + 1, currentBlock);
      }
      this.lastBlock = currentBlock;
    }
  }

  async checkPairSwaps(pairData, fromBlock, toBlock) {
    try {
      const pairContract = this.web3Provider.getContract(PAIR_ABI, pairData.pairAddress);
      
      // Get swap events
      const events = await pairContract.getPastEvents('Swap', {
        fromBlock,
        toBlock
      });

      for (const event of events) {
        await this.analyzeSwap(pairData, event);
      }

      // Update reserves
      const reserves = await pairContract.methods.getReserves().call();
      pairData.reserve0 = reserves._reserve0;
      pairData.reserve1 = reserves._reserve1;
      pairData.lastUpdate = Date.now();
    } catch (error) {
      logger.error(`Error checking swaps for pair ${pairData.pairAddress}:`, error);
    }
  }

  async analyzeSwap(pairData, event) {
    try {
      const { sender, amount0In, amount1In, amount0Out, amount1Out, to } = event.returnValues;

      // Determine if this is a buy or sell
      const isBuy = (amount0In > 0 && amount1Out > 0) || (amount1In > 0 && amount0Out > 0);
      
      if (!isBuy) {
        return; // We only care about buys for defensive action
      }

      // Calculate buy amount
      let buyAmount = 0;
      if (pairData.token0.toLowerCase() === this.config.wbnbAddress.toLowerCase()) {
        buyAmount = Number(amount0In);
      } else {
        buyAmount = Number(amount1In);
      }

      // Calculate percentage of liquidity
      const totalLiquidity = pairData.token0.toLowerCase() === this.config.wbnbAddress.toLowerCase()
        ? Number(pairData.reserve0)
        : Number(pairData.reserve1);

      const percentOfLiquidity = (buyAmount / totalLiquidity) * 100;

      logger.info(`Buy detected: ${percentOfLiquidity.toFixed(2)}% of liquidity`);

      // Check if it exceeds threshold
      if (percentOfLiquidity >= this.config.buyThresholdPercent) {
        const buyData = {
          tokenAddress: pairData.tokenAddress,
          pairAddress: pairData.pairAddress,
          buyer: sender,
          amount: buyAmount,
          percentOfLiquidity,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: Date.now()
        };

        logger.warn(`Large buy detected: ${JSON.stringify(buyData)}`);
        this.emit('large-buy-detected', buyData);
      }
    } catch (error) {
      logger.error('Error analyzing swap:', error);
    }
  }

  getMonitoredTokenCount() {
    return this.monitoredPairs.size;
  }

  getMonitoredPairs() {
    return Array.from(this.monitoredPairs.values());
  }
}

module.exports = LiquidityMonitor;
