const { Web3 } = require('web3');
const logger = require('../utils/logger');

class Web3Provider {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.connected = false;
  }

  async connect(rpcUrl, privateKey) {
    try {
      this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      
      if (privateKey) {
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.web3.eth.accounts.wallet.add(this.account);
        this.web3.eth.defaultAccount = this.account.address;
      }

      // Test connection
      const blockNumber = await this.web3.eth.getBlockNumber();
      logger.info(`Connected to BSC network. Current block: ${blockNumber}`);
      
      this.connected = true;
      return true;
    } catch (error) {
      logger.error('Failed to connect to Web3 provider:', error);
      this.connected = false;
      throw error;
    }
  }

  async getBalance(address) {
    if (!this.connected) throw new Error('Web3 not connected');
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async getGasPrice() {
    if (!this.connected) throw new Error('Web3 not connected');
    return await this.web3.eth.getGasPrice();
  }

  async getCurrentBlock() {
    if (!this.connected) throw new Error('Web3 not connected');
    return await this.web3.eth.getBlockNumber();
  }

  async getTransaction(txHash) {
    if (!this.connected) throw new Error('Web3 not connected');
    return await this.web3.eth.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash) {
    if (!this.connected) throw new Error('Web3 not connected');
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  getContract(abi, address) {
    if (!this.connected) throw new Error('Web3 not connected');
    return new this.web3.eth.Contract(abi, address);
  }

  async sendTransaction(tx) {
    if (!this.connected) throw new Error('Web3 not connected');
    if (!this.account) throw new Error('No account configured');

    try {
      const gas = await this.web3.eth.estimateGas(tx);
      const gasPrice = await this.getGasPrice();
      
      const transaction = {
        ...tx,
        from: this.account.address,
        gas: gas,
        gasPrice: gasPrice
      };

      const signedTx = await this.account.signTransaction(transaction);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      logger.info(`Transaction sent: ${receipt.transactionHash}`);
      return receipt;
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  async sendPriorityTransaction(tx, gasPriceMultiplier = 1.5) {
    if (!this.connected) throw new Error('Web3 not connected');
    if (!this.account) throw new Error('No account configured');

    try {
      const gas = await this.web3.eth.estimateGas(tx);
      const baseGasPrice = await this.getGasPrice();
      const priorityGasPrice = BigInt(Math.floor(Number(baseGasPrice) * gasPriceMultiplier));

      const transaction = {
        ...tx,
        from: this.account.address,
        gas: gas,
        gasPrice: priorityGasPrice
      };

      const signedTx = await this.account.signTransaction(transaction);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      logger.info(`Priority transaction sent: ${receipt.transactionHash}`);
      return receipt;
    } catch (error) {
      logger.error('Priority transaction failed:', error);
      throw error;
    }
  }

  disconnect() {
    this.web3 = null;
    this.account = null;
    this.connected = false;
    logger.info('Disconnected from Web3 provider');
  }

  isConnected() {
    return this.connected;
  }
}

module.exports = Web3Provider;
