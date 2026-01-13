const EventEmitter = require('events');
const logger = require('../utils/logger');

// ERC20 Token ABI (minimal)
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

// PancakeSwap Router ABI (minimal)
const ROUTER_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "address[]", "name": "path", "type": "address[]"}
    ],
    "name": "getAmountsOut",
    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class TransactionManager extends EventEmitter {
  constructor(web3Provider, config) {
    super();
    this.web3Provider = web3Provider;
    this.config = config;
    this.pendingTransactions = new Map();
  }

  async executeSell(tokenAddress, amount, priority = false) {
    try {
      logger.info(`Executing sell for token ${tokenAddress}, priority: ${priority}`);

      // Get token contract
      const tokenContract = this.web3Provider.getContract(ERC20_ABI, tokenAddress);

      // Get token balance
      const balance = await tokenContract.methods.balanceOf(
        this.config.walletAddress
      ).call();

      if (BigInt(balance) === 0n) {
        throw new Error('No token balance to sell');
      }

      // Use balance or specified amount
      const sellAmount = amount ? BigInt(amount) : BigInt(balance);

      // Approve router to spend tokens
      const routerContract = this.web3Provider.getContract(
        ROUTER_ABI,
        this.config.routerAddress
      );

      logger.info('Approving router to spend tokens...');
      const approveTx = {
        to: tokenAddress,
        data: tokenContract.methods.approve(
          this.config.routerAddress,
          sellAmount
        ).encodeABI()
      };

      if (priority) {
        await this.web3Provider.sendPriorityTransaction(
          approveTx,
          this.config.sellPriorityGasMultiplier
        );
      } else {
        await this.web3Provider.sendTransaction(approveTx);
      }

      // Get expected output with slippage
      const path = [tokenAddress, this.config.wbnbAddress];
      const amounts = await routerContract.methods.getAmountsOut(
        sellAmount.toString(),
        path
      ).call();

      const expectedOutput = BigInt(amounts[1]);
      const slippageMultiplier = 100 - this.config.slippageTolerance;
      const minOutput = (expectedOutput * BigInt(slippageMultiplier)) / 100n;

      // Execute swap
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      logger.info('Executing swap...');
      const swapTx = {
        to: this.config.routerAddress,
        data: routerContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
          sellAmount.toString(),
          minOutput.toString(),
          path,
          this.config.walletAddress,
          deadline
        ).encodeABI()
      };

      let receipt;
      if (priority) {
        receipt = await this.web3Provider.sendPriorityTransaction(
          swapTx,
          this.config.sellPriorityGasMultiplier
        );
      } else {
        receipt = await this.web3Provider.sendTransaction(swapTx);
      }

      const txData = {
        type: 'sell',
        tokenAddress,
        amount: sellAmount.toString(),
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        priority,
        timestamp: Date.now(),
        status: 'completed'
      };

      logger.info(`Sell transaction completed: ${receipt.transactionHash}`);
      this.emit('transaction-completed', txData);

      return txData;
    } catch (error) {
      logger.error('Sell transaction failed:', error);
      
      const txData = {
        type: 'sell',
        tokenAddress,
        error: error.message,
        priority,
        timestamp: Date.now(),
        status: 'failed'
      };
      
      this.emit('transaction-failed', txData);
      throw error;
    }
  }

  async estimateGas(tx) {
    try {
      return await this.web3Provider.web3.eth.estimateGas(tx);
    } catch (error) {
      logger.error('Gas estimation failed:', error);
      throw error;
    }
  }

  async getCurrentGasPrice() {
    return await this.web3Provider.getGasPrice();
  }

  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }
}

module.exports = TransactionManager;
