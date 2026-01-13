import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { BotConfig, TokenInfo, LiquidityInfo, TradeResult } from './types';
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
  private isRunning: boolean;

  constructor(config: BotConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.web3 = new Web3(config.bscRpcUrl);
    this.processedPairs = new Set();
    this.isRunning = false;

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

    // 检查账户余额
    await this.checkBalance();

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
        const currentBlock = await this.web3.eth.getBlockNumber();

        if (currentBlock > lastBlock) {
          // 检查新区块中的交易对创建事件
          await this.checkNewPairsInBlock(lastBlock + 1n, currentBlock);
          lastBlock = currentBlock;
        }

        // 等待一段时间后继续
        await this.sleep(this.config.monitorInterval);
      } catch (error) {
        this.logger.error('监控过程中出错', { error });
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
   * 执行购买
   */
  private async executeBuy(tokenAddress: string, tokenInfo: TokenInfo): Promise<TradeResult> {
    try {
      this.logger.info('准备购买代币', {
        token: tokenAddress,
        symbol: tokenInfo.symbol,
        amount: this.config.maxBuyAmount
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

      // 获取当前Gas价格
      const gasPrice = await this.web3.eth.getGasPrice();
      const adjustedGasPrice = new BigNumber(gasPrice.toString())
        .multipliedBy(this.config.gasPriceMultiplier)
        .toFixed(0);

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
          gasPrice: adjustedGasPrice
        });

      this.logger.info('交易成功', {
        hash: tx.transactionHash,
        gasUsed: tx.gasUsed
      });

      return {
        success: true,
        transactionHash: tx.transactionHash,
        gasUsed: Number(tx.gasUsed),
        amountOut: amountOut.toString()
      };
    } catch (error: any) {
      this.logger.error('购买失败', { error: error.message });
      return {
        success: false,
        error: error.message
      };
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
}
