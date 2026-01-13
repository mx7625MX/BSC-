export interface BotConfig {
  // 区块链配置
  bscRpcUrl: string;
  privateKey: string;
  
  // PancakeSwap配置
  pancakeswapRouter: string;
  pancakeswapFactory: string;
  wbnbAddress: string;
  
  // 交易配置
  minLiquidityBnb: number;
  maxBuyAmount: number;
  gasPriceMultiplier: number;
  gasLimit: number;
  slippageTolerance: number;
  
  // 监控配置
  monitorInterval: number;
  autoTradeEnabled: boolean;
  
  // 安全配置
  tokenBlacklist: string[];
  tokenWhitelist: string[];
  minTokenHolderPercent: number;
  
  // 止盈配置
  takeProfitEnabled: boolean;
  takeProfitPercent: number;
  stopLossPercent: number;
  checkProfitInterval: number;
  
  // 卖出触发配置
  sellOnBuyVolumeEnabled: boolean;
  sellOnBuyVolumeThreshold: number;
  
  // 钱包跟单配置
  copyTradeEnabled: boolean;
  monitoredWallets: string[];
  copyTradeAmount: number;
  copyTradeMultiplier: number;
  
  // 日志配置
  logLevel: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface LiquidityInfo {
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  pairAddress: string;
}

export interface TradeResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
  amountOut?: string;
}

export interface HoldingInfo {
  tokenAddress: string;
  amount: string;
  buyPrice: string;
  buyTransactionHash: string;
  buyTimestamp: number;
}
