import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { BotConfig, TokenInfo, LiquidityInfo, TradeResult, HoldingInfo } from './types';
import { Logger } from './logger';
import {
  PANCAKESWAP_ROUTER_ABI,
  PANCAKESWAP_FACTORY_ABI,
  ERC20_ABI,
  PAIR_ABI
} from './abis';

interface ReservesData {
  _reserve0?: string | bigint;
  _reserve1?: string | bigint;
  [key: number]: string | bigint;
}

export class SniperBot {
  private web3: Web3;
  private config: BotConfig;
  private logger: Logger;
  private account: { address: string; privateKey: string };
  private routerContract: Contract<any>;
  private factoryContract: Contract<any>;
  private processedPairs: Set<string>;
  private holdings: Map<string, HoldingInfo>;
  private processedTransactions: Set<string>;
  private isRunning: boolean;
  private readonly MAX_PROCESSED_PAIRS = 10000; // 限制缓存大小避免内存泄漏
  private readonly MAX_PROCESSED_TX = 5000;
  private readonly MAX_RETRY_ATTEMPTS = 3; // 最大重试次数
  private connectionHealthy: boolean;
  private gasPriceCache: { price: string; timestamp: number } | null = null;
  private readonly GAS_CACHE_TTL = 5000; // Gas价格缓存5秒
  private approvedTokens: Set<string> = new Set(); // 已授权的代币

  constructor(config: BotConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.web3 = new Web3(config.bscRpcUrl);
    this.processedPairs = new Set();
    this.holdings = new Map();
    this.processedTransactions = new Set();
    this.isRunning = false;
    this.connectionHealthy = true;

    // 设置账户
    const walletAccount = this.web3.eth.accounts.privateKeyToAccount(config.privateKey);
    this.account = walletAccount;
    this.web3.eth.accounts.wallet.add(walletAccount);
    this.web3.eth.defaultAccount = walletAccount.address;

    // 初始化合约
    this.routerContract = new this.web3.eth.Contract(
      PANCAKESWAP_ROUTER_ABI,
      config.pancakeswapRouter
    );
    this.factoryContract = new this.web3.eth.Contract(
      PANCAKESWAP_FACTORY_ABI,
      config.pancakeswapFactory
    );

    this.logger.info('SniperBot 初始化完成', {
      address: this.account.address,
      router: config.pancakeswapRouter,
      factory: config.pancakeswapFactory
    });
  }

  /**
   * 启动机器人
   */
  async start(): Promise<void> {
    this.logger.info('启动 BSC MEME币阻击机器人...');
    this.isRunning = true;

    // 启动健康检查
    this.startHealthCheck();

    // 检查账户余额
    await this.checkBalance();

    // 启动止盈止损监控
    if (this.config.takeProfitEnabled) {
      this.logger.info('启动止盈止损监控...');
      this.startProfitMonitoring();
    }

    // 启动买入量监控（触发卖出）
    if (this.config.sellOnBuyVolumeEnabled) {
      this.logger.info('启动买入量监控...', {
        threshold: this.config.sellOnBuyVolumeThreshold + ' BNB'
      });
      this.startBuyVolumeMonitoring();
    }

    // 启动钱包跟单监控
    if (this.config.copyTradeEnabled) {
      this.logger.info('启动钱包跟单监控...', {
        wallets: this.config.monitoredWallets
      });
      this.startCopyTrading();
    }

    // 监听新交易对创建事件
    await this.monitorNewPairs();
  }

  /**
   * 停止机器人
   */
  stop(): void {
    this.logger.info('停止机器人...');
    this.isRunning = false;
  }

  /**
   * 健康检查 - 定期检查连接状态
   */
  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        const blockNumber = await this.web3.eth.getBlockNumber();
        if (!this.connectionHealthy) {
          this.logger.info('连接恢复正常', { blockNumber });
        }
        this.connectionHealthy = true;
      } catch (error: any) {
        this.logger.error('连接异常', { error: error.message });
        this.connectionHealthy = false;
      }
    }, 30000); // 每30秒检查一次
  }

  /**
   * 清理旧的处理记录避免内存泄漏
   */
  private cleanupOldRecords(): void {
    // 清理processedPairs
    if (this.processedPairs.size > this.MAX_PROCESSED_PAIRS) {
      const toDelete = this.processedPairs.size - this.MAX_PROCESSED_PAIRS;
      const iterator = this.processedPairs.values();
      for (let i = 0; i < toDelete; i++) {
        const value = iterator.next().value;
        if (value) this.processedPairs.delete(value);
      }
      this.logger.info('清理旧的交易对记录', { deleted: toDelete });
    }

    // 清理processedTransactions
    if (this.processedTransactions.size > this.MAX_PROCESSED_TX) {
      const toDelete = this.processedTransactions.size - this.MAX_PROCESSED_TX;
      const iterator = this.processedTransactions.values();
      for (let i = 0; i < toDelete; i++) {
        const value = iterator.next().value;
        if (value) this.processedTransactions.delete(value);
      }
      this.logger.info('清理旧的交易记录', { deleted: toDelete });
    }
  }

  /**
   * 检查账户余额
   */
  private async checkBalance(): Promise<void> {
    const balance = await this.web3.eth.getBalance(this.account.address);
    const balanceBNB = this.web3.utils.fromWei(balance, 'ether');
    this.logger.info(`钱包余额: ${balanceBNB} BNB`);

    if (parseFloat(balanceBNB) < this.config.maxBuyAmount) {
      this.logger.warn('余额不足，可能无法执行交易');
    }
  }

  /**
   * 监控新交易对
   */
  private async monitorNewPairs(): Promise<void> {
    this.logger.info('开始监控新交易对...');

    // 获取最新区块
    let lastBlock = await this.web3.eth.getBlockNumber();
    this.logger.info(`当前区块高度: ${lastBlock}`);

    while (this.isRunning) {
      try {
        // 检查连接健康状况
        if (!this.connectionHealthy) {
          this.logger.warn('连接不健康，等待恢复...');
          await this.sleep(10000);
          continue;
        }

        const currentBlock = await this.web3.eth.getBlockNumber();

        if (currentBlock > lastBlock) {
          // 检查新区块中的交易对创建事件
          await this.checkNewPairsInBlock(lastBlock + 1n, currentBlock);
          lastBlock = currentBlock;

          // 定期清理旧记录
          this.cleanupOldRecords();
        }

        // 等待一段时间后继续
        await this.sleep(this.config.monitorInterval);
      } catch (error) {
        this.logger.error('监控过程中出错', { error });
        this.connectionHealthy = false;
        await this.sleep(5000); // 出错后等待5秒再继续
      }
    }
  }

  /**
   * 检查指定区块范围内的新交易对
   */
  private async checkNewPairsInBlock(fromBlock: bigint, toBlock: bigint): Promise<void> {
    try {
      // 获取PairCreated事件
      const events = await this.factoryContract.getPastEvents('PairCreated', {
        fromBlock: Number(fromBlock),
        toBlock: Number(toBlock)
      });

      for (const event of events) {
        if (typeof event === 'string') continue;
        const { token0, token1, pair } = event.returnValues;
        
        // 检查是否已处理过此交易对
        if (this.processedPairs.has(pair as string)) {
          continue;
        }

        this.processedPairs.add(pair as string);
        this.logger.info('发现新交易对', { token0, token1, pair });

        // 分析并可能执行交易
        await this.analyzePair(token0 as string, token1 as string, pair as string);
      }
    } catch (error) {
      this.logger.error('检查新交易对时出错', { error });
    }
  }

  /**
   * 分析交易对
   */
  private async analyzePair(token0: string, token1: string, pairAddress: string): Promise<void> {
    try {
      // 确定哪个是WBNB，哪个是新代币
      const isToken0WBNB = token0.toLowerCase() === this.config.wbnbAddress.toLowerCase();
      const tokenAddress = isToken0WBNB ? token1 : token0;

      // 检查黑名单
      if (this.isBlacklisted(tokenAddress)) {
        this.logger.info('代币在黑名单中，跳过', { token: tokenAddress });
        return;
      }

      // 检查白名单（如果启用）
      if (this.config.tokenWhitelist.length > 0 && !this.isWhitelisted(tokenAddress)) {
        this.logger.info('代币不在白名单中，跳过', { token: tokenAddress });
        return;
      }

      // 获取代币信息
      const tokenInfo = await this.getTokenInfo(tokenAddress);
      this.logger.info('代币信息', tokenInfo);

      // 获取流动性信息
      const liquidityInfo = await this.getLiquidityInfo(pairAddress);
      this.logger.info('流动性信息', liquidityInfo);

      // 检查流动性
      const liquidityBNB = this.calculateLiquidityBNB(liquidityInfo, isToken0WBNB);
      if (liquidityBNB < this.config.minLiquidityBnb) {
        this.logger.info('流动性不足，跳过', { liquidityBNB, required: this.config.minLiquidityBnb });
        return;
      }

      // 如果启用自动交易，执行购买
      if (this.config.autoTradeEnabled) {
        await this.executeBuy(tokenAddress, tokenInfo);
      } else {
        this.logger.info('自动交易未启用，仅记录机会', {
          token: tokenAddress,
          symbol: tokenInfo.symbol,
          liquidity: liquidityBNB
        });
      }
    } catch (error) {
      this.logger.error('分析交易对时出错', { error });
    }
  }

  /**
   * 获取代币信息
   */
  private async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const tokenContract = new this.web3.eth.Contract(ERC20_ABI, tokenAddress);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.methods.name().call(),
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call(),
      tokenContract.methods.totalSupply().call()
    ]);

    return {
      address: tokenAddress,
      name: String(name),
      symbol: String(symbol),
      decimals: Number(decimals),
      totalSupply: String(totalSupply)
    };
  }

  /**
   * 获取流动性信息
   */
  private async getLiquidityInfo(pairAddress: string): Promise<LiquidityInfo> {
    const pairContract = new this.web3.eth.Contract(PAIR_ABI, pairAddress);

    const [reserves, token0, token1] = await Promise.all([
      pairContract.methods.getReserves().call(),
      pairContract.methods.token0().call(),
      pairContract.methods.token1().call()
    ]);

    const reservesData = reserves as ReservesData;

    return {
      token0: String(token0),
      token1: String(token1),
      reserve0: String(reservesData._reserve0 || reservesData[0] || '0'),
      reserve1: String(reservesData._reserve1 || reservesData[1] || '0'),
      pairAddress
    };
  }

  /**
   * 计算BNB流动性
   */
  private calculateLiquidityBNB(liquidityInfo: LiquidityInfo, isToken0WBNB: boolean): number {
    const bnbReserve = isToken0WBNB ? liquidityInfo.reserve0 : liquidityInfo.reserve1;
    return parseFloat(this.web3.utils.fromWei(bnbReserve, 'ether'));
  }

  /**
   * 执行购买（带重试机制）
   */
  private async executeBuy(tokenAddress: string, tokenInfo: TokenInfo): Promise<TradeResult> {
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        this.logger.info('准备购买代币', {
          token: tokenAddress,
          symbol: tokenInfo.symbol,
          amount: this.config.maxBuyAmount,
          attempt
        });

        // 计算最小输出（考虑滑点）
        const amountIn = this.web3.utils.toWei(this.config.maxBuyAmount.toString(), 'ether');
        const path = [this.config.wbnbAddress, tokenAddress];

        // 获取预期输出
        const amounts = await this.routerContract.methods.getAmountsOut(amountIn, path).call();
        const amountsArray = Array.isArray(amounts) ? amounts : [amounts];
        const amountOut = amountsArray.length > 1 ? String(amountsArray[1]) : '0';
        
        // 应用滑点容忍度
        const minAmountOut = new BigNumber(amountOut.toString())
          .multipliedBy(100 - this.config.slippageTolerance)
          .dividedBy(100)
          .toFixed(0);

        // 动态获取Gas价格（优化）
        const gasPrice = await this.getOptimizedGasPrice();

        // 设置交易截止时间（5分钟后）
        const deadline = Math.floor(Date.now() / 1000) + 300;

        // 执行交易
        this.logger.info('发送交易...');
        const tx = await this.routerContract.methods
          .swapExactETHForTokens(
            minAmountOut,
            path,
            this.account.address,
            deadline
          )
          .send({
            from: this.account.address,
            value: amountIn,
            gas: String(this.config.gasLimit),
            gasPrice: gasPrice
          });

        this.logger.info('交易成功', {
          hash: tx.transactionHash,
          gasUsed: tx.gasUsed,
          attempt
        });

        // 记录持仓信息（用于止盈止损或快速卖出）
        if (this.config.takeProfitEnabled || this.config.quickSellEnabled) {
          this.holdings.set(tokenAddress, {
            tokenAddress,
            amount: amountOut.toString(),
            buyPrice: new BigNumber(amountIn).dividedBy(amountOut.toString()).toString(),
            buyTransactionHash: tx.transactionHash as string,
            buyTimestamp: Date.now()
          });
          this.logger.info('已记录持仓信息', { token: tokenAddress });
        }

        // 如果启用快速卖出，设置定时卖出
        if (this.config.quickSellEnabled) {
          this.scheduleQuickSell(tokenAddress, amountOut.toString());
        }

        return {
          success: true,
          transactionHash: tx.transactionHash,
          gasUsed: Number(tx.gasUsed),
          amountOut: amountOut.toString()
        };
      } catch (error: any) {
        this.logger.error(`购买失败 (尝试 ${attempt}/${this.MAX_RETRY_ATTEMPTS})`, { 
          error: error.message,
          token: tokenAddress
        });
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          const waitTime = attempt * 2000; // 指数退避：2s, 4s, 6s
          this.logger.info(`等待 ${waitTime}ms 后重试...`);
          await this.sleep(waitTime);
        }
      }
    }

    // 所有尝试都失败
    return {
      success: false,
      error: '交易失败，已达到最大重试次数'
    };
  }

  /**
   * 获取优化的Gas价格（动态调整）
   */
  private async getOptimizedGasPrice(): Promise<string> {
    try {
      // 检查缓存
      const now = Date.now();
      if (this.gasPriceCache && (now - this.gasPriceCache.timestamp) < this.GAS_CACHE_TTL) {
        return this.gasPriceCache.price;
      }

      const gasPrice = await this.web3.eth.getGasPrice();
      
      // 根据配置的倍数调整
      const multiplier = this.config.priorityMode ? 
        this.config.priorityGasMultiplier : 
        this.config.gasPriceMultiplier;
      
      const adjustedGasPrice = new BigNumber(gasPrice.toString())
        .multipliedBy(multiplier)
        .toFixed(0);

      // 确保不低于基础Gas价格
      const minGasPrice = this.web3.utils.toWei('5', 'gwei');
      const finalGasPrice = new BigNumber(adjustedGasPrice).isLessThan(minGasPrice) 
        ? minGasPrice 
        : adjustedGasPrice;

      // 更新缓存
      this.gasPriceCache = {
        price: finalGasPrice,
        timestamp: now
      };

      return finalGasPrice;
    } catch (error: any) {
      this.logger.warn('获取Gas价格失败，使用默认值', { error: error.message });
      return this.web3.utils.toWei('5', 'gwei');
    }
  }

  /**
   * 检查代币是否在黑名单中
   */
  private isBlacklisted(tokenAddress: string): boolean {
    return this.config.tokenBlacklist.some(
      addr => addr.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  /**
   * 检查代币是否在白名单中
   */
  private isWhitelisted(tokenAddress: string): boolean {
    return this.config.tokenWhitelist.some(
      addr => addr.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  /**
   * 休眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 启动止盈止损监控
   */
  private startProfitMonitoring(): void {
    setInterval(async () => {
      if (!this.isRunning) return;

      for (const [tokenAddress, holding] of this.holdings.entries()) {
        try {
          await this.checkAndExecuteProfitTaking(tokenAddress, holding);
        } catch (error: any) {
          this.logger.error('检查止盈止损时出错', { error: error.message, token: tokenAddress });
        }
      }
    }, this.config.checkProfitInterval);
  }

  /**
   * 检查并执行止盈止损
   */
  private async checkAndExecuteProfitTaking(tokenAddress: string, holding: HoldingInfo): Promise<void> {
    // 获取当前价格
    const path = [tokenAddress, this.config.wbnbAddress];
    
    try {
      const amounts = await this.routerContract.methods.getAmountsOut(holding.amount, path).call();
      const amountsArray = Array.isArray(amounts) ? amounts : [amounts];
      const currentValueBNB = amountsArray.length > 1 ? String(amountsArray[1]) : '0';

      // 计算投入的BNB
      const investedBNB = new BigNumber(holding.amount).multipliedBy(holding.buyPrice);
      const currentValue = new BigNumber(currentValueBNB);

      // 计算盈亏百分比
      const profitPercent = currentValue.minus(investedBNB).dividedBy(investedBNB).multipliedBy(100);

      this.logger.debug('持仓检查', {
        token: tokenAddress,
        profitPercent: profitPercent.toFixed(2) + '%',
        invested: investedBNB.toString(),
        current: currentValue.toString()
      });

      // 检查是否触发止盈
      if (profitPercent.isGreaterThanOrEqualTo(this.config.takeProfitPercent)) {
        this.logger.info('触发止盈！', {
          token: tokenAddress,
          profitPercent: profitPercent.toFixed(2) + '%'
        });
        await this.executeSell(tokenAddress, holding.amount);
        this.holdings.delete(tokenAddress);
      }
      // 检查是否触发止损
      else if (profitPercent.isLessThanOrEqualTo(-this.config.stopLossPercent)) {
        this.logger.info('触发止损！', {
          token: tokenAddress,
          lossPercent: profitPercent.toFixed(2) + '%'
        });
        await this.executeSell(tokenAddress, holding.amount);
        this.holdings.delete(tokenAddress);
      }
    } catch (error: any) {
      this.logger.error('获取代币价格失败', { error: error.message, token: tokenAddress });
    }
  }

  /**
   * 执行卖出（带重试机制）
   */
  private async executeSell(tokenAddress: string, amount: string): Promise<TradeResult> {
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        this.logger.info('准备卖出代币', { token: tokenAddress, amount, attempt });

        const path = [tokenAddress, this.config.wbnbAddress];
        const tokenContract = new this.web3.eth.Contract(ERC20_ABI, tokenAddress);
        
        // 并行执行授权检查和价格查询以节省时间
        const [allowanceResult, amountsResult, gasPriceResult] = await Promise.all([
          // 检查授权
          tokenContract.methods.allowance(this.account.address, this.config.pancakeswapRouter).call(),
          // 获取预期输出
          this.routerContract.methods.getAmountsOut(amount, path).call(),
          // 获取优化的Gas价格
          this.getOptimizedGasPrice()
        ]);

        const allowance = allowanceResult;
        const needsApproval = new BigNumber(String(allowance)).isLessThan(amount);
        
        // 如果需要授权
        if (needsApproval && !this.approvedTokens.has(tokenAddress.toLowerCase())) {
          this.logger.info('授权代币...', { 
            mode: this.config.preApproveMax ? '最大额度' : '当前额度' 
          });
          
          // 根据配置决定授权额度
          const approvalAmount = this.config.preApproveMax 
            ? '115792089237316195423570985008687907853269984665640564039457584007913129639935' // uint256 max
            : amount;
          
          await tokenContract.methods.approve(this.config.pancakeswapRouter, approvalAmount).send({
            from: this.account.address,
            gas: '100000',
            gasPrice: gasPriceResult
          });
          
          // 标记为已授权（如果是最大额度授权）
          if (this.config.preApproveMax) {
            this.approvedTokens.add(tokenAddress.toLowerCase());
          }
        }

        // 应用滑点
        const amounts = Array.isArray(amountsResult) ? amountsResult : [amountsResult];
        const amountOut = amounts.length > 1 ? String(amounts[1]) : '0';
        const minAmountOut = new BigNumber(amountOut)
          .multipliedBy(100 - this.config.slippageTolerance)
          .dividedBy(100)
          .toFixed(0);

        // 设置截止时间（优先级模式使用更短时间）
        const deadlineSeconds = this.config.priorityMode ? 60 : 300;
        const deadline = Math.floor(Date.now() / 1000) + deadlineSeconds;

        // 执行卖出交易
        this.logger.info('发送卖出交易...', {
          priorityMode: this.config.priorityMode,
          gasMultiplier: this.config.priorityMode ? this.config.priorityGasMultiplier : this.config.gasPriceMultiplier
        });
        
        const tx = await this.routerContract.methods
          .swapExactTokensForETH(
            amount,
            minAmountOut,
            path,
            this.account.address,
            deadline
          )
          .send({
            from: this.account.address,
            gas: String(this.config.gasLimit),
            gasPrice: gasPriceResult
          });

        this.logger.info('卖出成功', {
          hash: tx.transactionHash,
          gasUsed: tx.gasUsed,
          receivedBNB: this.web3.utils.fromWei(amountOut, 'ether'),
          attempt
        });

        return {
          success: true,
          transactionHash: tx.transactionHash,
          gasUsed: Number(tx.gasUsed),
          amountOut: amountOut
        };
      } catch (error: any) {
        this.logger.error(`卖出失败 (尝试 ${attempt}/${this.MAX_RETRY_ATTEMPTS})`, { 
          error: error.message,
          token: tokenAddress
        });
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          const waitTime = attempt * 2000;
          this.logger.info(`等待 ${waitTime}ms 后重试...`);
          await this.sleep(waitTime);
        }
      }
    }

    // 所有尝试都失败
    return {
      success: false,
      error: '卖出失败，已达到最大重试次数'
    };
  }

  /**
   * 启动钱包跟单监控
   */
  private startCopyTrading(): void {
    this.logger.info('开始监控目标钱包交易...');
    
    setInterval(async () => {
      if (!this.isRunning) return;

      for (const wallet of this.config.monitoredWallets) {
        try {
          await this.monitorWalletTransactions(wallet);
        } catch (error: any) {
          this.logger.error('监控钱包交易时出错', { error: error.message, wallet });
        }
      }
    }, this.config.monitorInterval);
  }

  /**
   * 监控钱包交易
   */
  private async monitorWalletTransactions(walletAddress: string): Promise<void> {
    try {
      // 获取最新区块
      const currentBlock = await this.web3.eth.getBlockNumber();
      const block = await this.web3.eth.getBlock(currentBlock, true);

      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {
        if (typeof tx === 'string') continue;

        // 检查是否是目标钱包的交易
        if (tx.from.toLowerCase() !== walletAddress) continue;

        // 检查是否已处理过此交易
        if (this.processedTransactions.has(tx.hash)) continue;

        // 检查是否是PancakeSwap Router交易
        if (tx.to?.toLowerCase() !== this.config.pancakeswapRouter.toLowerCase()) continue;

        this.processedTransactions.add(tx.hash);

        // 解析交易以获取购买的代币
        await this.analyzeCopyTrade(tx);
      }
    } catch (error: any) {
      this.logger.debug('监控钱包交易时出错', { error: error.message });
    }
  }

  /**
   * 分析并复制交易
   */
  private async analyzeCopyTrade(tx: any): Promise<void> {
    try {
      // 解析交易输入数据
      const inputData = tx.input;
      
      // 检查是否是swap交易（简化版本，实际需要更复杂的ABI解析）
      if (inputData.includes('7ff36ab5') || inputData.includes('18cbafe5')) {
        this.logger.info('检测到目标钱包购买交易', {
          from: tx.from,
          hash: tx.hash,
          value: this.web3.utils.fromWei(tx.value.toString(), 'ether') + ' BNB'
        });

        // 获取购买金额
        const buyAmountBNB = parseFloat(this.web3.utils.fromWei(tx.value.toString(), 'ether'));

        // 计算跟单金额
        let copyAmount = this.config.copyTradeAmount;
        if (copyAmount === 0) {
          // 如果没有设置固定金额，使用倍数
          copyAmount = buyAmountBNB * this.config.copyTradeMultiplier;
        }

        // 限制最大跟单金额
        copyAmount = Math.min(copyAmount, this.config.maxBuyAmount);

        this.logger.info('准备跟单', {
          originalAmount: buyAmountBNB,
          copyAmount,
          multiplier: this.config.copyTradeMultiplier
        });

        // 这里需要从交易中解析出代币地址
        // 由于需要复杂的ABI解析，这里仅作示例
        // 实际使用时需要完整的交易解析逻辑
        
        this.logger.warn('跟单功能需要完整的交易解析，当前为示例代码');
      }
    } catch (error: any) {
      this.logger.error('分析跟单交易时出错', { error: error.message });
    }
  }

  /**
   * 启动买入量监控（触发卖出）
   */
  private startBuyVolumeMonitoring(): void {
    this.logger.info('开始监控买入量触发卖出...');
    
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        // 获取最新区块
        const currentBlock = await this.web3.eth.getBlockNumber();
        const block = await this.web3.eth.getBlock(currentBlock, true);

        if (!block || !block.transactions) return;

        for (const tx of block.transactions) {
          if (typeof tx === 'string') continue;

          // 跳过自己的交易
          if (tx.from.toLowerCase() === this.account.address.toLowerCase()) continue;

          // 检查是否是PancakeSwap Router交易
          if (tx.to?.toLowerCase() !== this.config.pancakeswapRouter.toLowerCase()) continue;

          // 检查是否已处理过此交易
          if (this.processedTransactions.has(tx.hash)) continue;

          // 分析买入量并触发卖出
          await this.checkBuyVolumeAndSell(tx);
        }
      } catch (error: any) {
        this.logger.debug('监控买入量时出错', { error: error.message });
      }
    }, this.config.monitorInterval);
  }

  /**
   * 检查买入量并触发卖出
   */
  private async checkBuyVolumeAndSell(tx: any): Promise<void> {
    try {
      // 解析交易输入数据
      const inputData = tx.input;
      
      // 检查是否是买入交易（swapExactETHForTokens）
      if (!inputData.includes('7ff36ab5') && !inputData.includes('18cbafe5')) {
        return;
      }

      this.processedTransactions.add(tx.hash);

      // 获取购买金额
      const buyAmountWei = tx.value;
      const buyAmountBNB = parseFloat(this.web3.utils.fromWei(buyAmountWei.toString(), 'ether'));

      // 检查是否超过阈值
      if (buyAmountBNB < this.config.sellOnBuyVolumeThreshold) {
        return;
      }

      this.logger.info('检测到大额买入，超过阈值！', {
        from: tx.from,
        amount: buyAmountBNB + ' BNB',
        threshold: this.config.sellOnBuyVolumeThreshold + ' BNB',
        hash: tx.hash
      });

      // 尝试从交易中解析代币地址
      // 这是简化版本，实际应该完整解析ABI
      const tokenAddress = await this.parseTokenFromTx(tx);
      
      if (!tokenAddress) {
        this.logger.warn('无法解析代币地址，跳过卖出');
        return;
      }

      // 检查是否持有该代币
      const holding = this.holdings.get(tokenAddress.toLowerCase());
      
      if (!holding) {
        this.logger.debug('未持有该代币，无需卖出', { token: tokenAddress });
        return;
      }

      this.logger.info('触发自动卖出！', {
        token: tokenAddress,
        reason: `检测到${buyAmountBNB} BNB大额买入`,
        holdingAmount: holding.amount
      });

      // 执行卖出
      const result = await this.executeSell(tokenAddress, holding.amount);
      
      if (result.success) {
        this.holdings.delete(tokenAddress.toLowerCase());
        this.logger.info('大额买入触发卖出成功', {
          token: tokenAddress,
          hash: result.transactionHash
        });
      }
    } catch (error: any) {
      this.logger.error('检查买入量触发卖出时出错', { error: error.message });
    }
  }

  /**
   * 从交易中解析代币地址（简化版本）
   */
  private async parseTokenFromTx(tx: any): Promise<string | null> {
    try {
      // 这是一个简化的实现
      // 实际应该使用完整的ABI解析
      // 这里我们尝试从交易事件中获取代币地址
      
      const receipt = await this.web3.eth.getTransactionReceipt(tx.hash);
      
      if (!receipt || !receipt.logs || receipt.logs.length === 0) {
        return null;
      }

      // 查找Transfer事件（通常是最后一个）
      // Transfer事件的signature是: Transfer(address,address,uint256)
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      
      for (const log of receipt.logs) {
        if (log.topics && log.topics[0] === transferTopic) {
          // log.address 就是代币地址
          return log.address || null;
        }
      }

      return null;
    } catch (error: any) {
      this.logger.error('解析代币地址时出错', { error: error.message });
      return null;
    }
  }

  /**
   * 设置快速卖出定时器
   */
  private scheduleQuickSell(tokenAddress: string, amount: string): void {
    // 计算随机延迟时间（在最小和最大延迟之间）
    const delayRange = this.config.quickSellDelayMax - this.config.quickSellDelayMin;
    const randomDelay = this.config.quickSellDelayMin + Math.floor(Math.random() * delayRange);
    
    this.logger.info('已设置快速卖出', {
      token: tokenAddress,
      delay: randomDelay + 'ms',
      minDelay: this.config.quickSellDelayMin + 'ms',
      maxDelay: this.config.quickSellDelayMax + 'ms'
    });

    // 设置定时器
    setTimeout(async () => {
      try {
        // 检查是否还持有该代币（可能已被其他功能卖出）
        const holding = this.holdings.get(tokenAddress.toLowerCase());
        
        if (!holding) {
          this.logger.info('快速卖出取消：代币已被卖出', { token: tokenAddress });
          return;
        }

        this.logger.info('执行快速卖出', {
          token: tokenAddress,
          amount: holding.amount,
          actualDelay: randomDelay + 'ms'
        });

        // 执行卖出
        const result = await this.executeSell(tokenAddress, holding.amount);
        
        if (result.success) {
          this.holdings.delete(tokenAddress.toLowerCase());
          this.logger.info('快速卖出成功', {
            token: tokenAddress,
            hash: result.transactionHash,
            delay: randomDelay + 'ms'
          });
        } else {
          this.logger.error('快速卖出失败', {
            token: tokenAddress,
            error: result.error
          });
        }
      } catch (error: any) {
        this.logger.error('快速卖出过程出错', { error: error.message, token: tokenAddress });
      }
    }, randomDelay);
  }

  /**
   * 获取机器人状态（用于Web界面）
   */
  getStatus() {
    const holdings = Array.from(this.holdings.entries()).map(([tokenAddress, holding]) => ({
      tokenAddress,
      amount: holding.amount,
      buyPrice: holding.buyPrice,
      currentProfit: '0', // 需要实时计算
      buyTimestamp: holding.buyTimestamp
    }));

    return {
      isRunning: this.isRunning,
      accountAddress: this.account.address,
      accountBalance: '0', // 需要异步获取
      processedPairs: this.processedPairs.size,
      holdings,
      config: {
        autoTradeEnabled: this.config.autoTradeEnabled,
        takeProfitEnabled: this.config.takeProfitEnabled,
        quickSellEnabled: this.config.quickSellEnabled,
        copyTradeEnabled: this.config.copyTradeEnabled,
        sellOnBuyVolumeEnabled: this.config.sellOnBuyVolumeEnabled,
        maxBuyAmount: this.config.maxBuyAmount,
        minLiquidityBnb: this.config.minLiquidityBnb,
      }
    };
  }
}
