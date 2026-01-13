import dotenv from 'dotenv';
import { BotConfig } from './types';

dotenv.config();

export function loadConfig(): BotConfig {
  const config: BotConfig = {
    // 区块链配置
    bscRpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
    privateKey: process.env.PRIVATE_KEY || '',
    
    // PancakeSwap配置
    pancakeswapRouter: process.env.PANCAKESWAP_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    pancakeswapFactory: process.env.PANCAKESWAP_FACTORY || '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    wbnbAddress: process.env.WBNB_ADDRESS || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    
    // 交易配置
    minLiquidityBnb: parseFloat(process.env.MIN_LIQUIDITY_BNB || '5'),
    maxBuyAmount: parseFloat(process.env.MAX_BUY_AMOUNT || '0.1'),
    gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.5'),
    gasLimit: parseInt(process.env.GAS_LIMIT || '500000'),
    slippageTolerance: parseInt(process.env.SLIPPAGE_TOLERANCE || '10'),
    
    // 监控配置
    monitorInterval: parseInt(process.env.MONITOR_INTERVAL || '1000'),
    autoTradeEnabled: process.env.AUTO_TRADE_ENABLED === 'true',
    
    // 安全配置
    tokenBlacklist: process.env.TOKEN_BLACKLIST ? process.env.TOKEN_BLACKLIST.split(',').map(addr => addr.trim()) : [],
    tokenWhitelist: process.env.TOKEN_WHITELIST ? process.env.TOKEN_WHITELIST.split(',').map(addr => addr.trim()) : [],
    minTokenHolderPercent: parseFloat(process.env.MIN_TOKEN_HOLDER_PERCENT || '0.1'),
    
    // 止盈配置
    takeProfitEnabled: process.env.TAKE_PROFIT_ENABLED === 'true',
    takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT || '50'),
    stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '30'),
    checkProfitInterval: parseInt(process.env.CHECK_PROFIT_INTERVAL || '60000'),
    
    // 卖出触发配置
    sellOnBuyVolumeEnabled: process.env.SELL_ON_BUY_VOLUME_ENABLED === 'true',
    sellOnBuyVolumeThreshold: parseFloat(process.env.SELL_ON_BUY_VOLUME_THRESHOLD || '1.0'),
    
    // 快速卖出配置
    quickSellEnabled: process.env.QUICK_SELL_ENABLED === 'true',
    quickSellDelayMin: parseInt(process.env.QUICK_SELL_DELAY_MIN || '1000'),
    quickSellDelayMax: parseInt(process.env.QUICK_SELL_DELAY_MAX || '5000'),
    
    // 钱包跟单配置
    copyTradeEnabled: process.env.COPY_TRADE_ENABLED === 'true',
    monitoredWallets: process.env.MONITORED_WALLETS ? process.env.MONITORED_WALLETS.split(',').map(addr => addr.trim().toLowerCase()) : [],
    copyTradeAmount: parseFloat(process.env.COPY_TRADE_AMOUNT || '0.05'),
    copyTradeMultiplier: parseFloat(process.env.COPY_TRADE_MULTIPLIER || '1.0'),
    
    // 优先级模式配置（更快的卖出）
    priorityMode: process.env.PRIORITY_MODE === 'true',
    priorityGasMultiplier: parseFloat(process.env.PRIORITY_GAS_MULTIPLIER || '3.0'),
    preApproveMax: process.env.PRE_APPROVE_MAX !== 'false', // 默认true
    
    // 日志配置
    logLevel: process.env.LOG_LEVEL || 'info',
  };
  
  // 验证必需配置
  if (!config.privateKey) {
    throw new Error('PRIVATE_KEY is required in .env file');
  }
  
  return config;
}
