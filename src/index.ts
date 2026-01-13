import { loadConfig } from './config';
import { Logger } from './logger';
import { SniperBot } from './bot';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('========================================');
  console.log('   BSC MEME币阻击机器人');
  console.log('   BSC MEME Coin Sniper Bot');
  console.log('========================================\n');

  // 确保logs目录存在
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  try {
    // 加载配置
    console.log('正在加载配置...');
    const config = loadConfig();
    
    // 初始化日志
    const logger = new Logger(config.logLevel);
    
    logger.info('=== 配置信息 ===');
    logger.info(`RPC节点: ${config.bscRpcUrl}`);
    logger.info(`PancakeSwap路由: ${config.pancakeswapRouter}`);
    logger.info(`最大购买金额: ${config.maxBuyAmount} BNB`);
    logger.info(`最小流动性: ${config.minLiquidityBnb} BNB`);
    logger.info(`Gas价格倍数: ${config.gasPriceMultiplier}x`);
    logger.info(`滑点容忍度: ${config.slippageTolerance}%`);
    logger.info(`自动交易: ${config.autoTradeEnabled ? '已启用' : '未启用'}`);
    
    if (config.takeProfitEnabled) {
      logger.info(`止盈止损: 已启用`);
      logger.info(`  - 止盈: ${config.takeProfitPercent}%`);
      logger.info(`  - 止损: ${config.stopLossPercent}%`);
    }
    
    if (config.copyTradeEnabled) {
      logger.info(`钱包跟单: 已启用`);
      logger.info(`  - 监控钱包: ${config.monitoredWallets.length} 个`);
      logger.info(`  - 跟单金额: ${config.copyTradeAmount > 0 ? config.copyTradeAmount + ' BNB' : '按倍数 ' + config.copyTradeMultiplier + 'x'}`);
    }
    
    if (config.tokenWhitelist.length > 0) {
      logger.info(`白名单模式: ${config.tokenWhitelist.length} 个代币`);
    }
    
    if (config.tokenBlacklist.length > 0) {
      logger.info(`黑名单: ${config.tokenBlacklist.length} 个代币`);
    }
    
    logger.info('=================\n');

    // 安全警告
    if (!config.autoTradeEnabled) {
      logger.warn('⚠️  自动交易未启用，机器人将仅监控和记录机会');
      logger.warn('⚠️  要启用自动交易，请在.env文件中设置 AUTO_TRADE_ENABLED=true');
    } else {
      logger.warn('⚠️  自动交易已启用！机器人将自动执行购买操作');
      logger.warn('⚠️  请确保您已充分了解风险');
      logger.warn('⚠️  建议先在测试网络上测试');
    }

    // 创建并启动机器人
    const bot = new SniperBot(config, logger);
    
    // 处理退出信号
    process.on('SIGINT', () => {
      logger.info('\n收到退出信号，正在停止机器人...');
      bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('\n收到终止信号，正在停止机器人...');
      bot.stop();
      process.exit(0);
    });

    // 启动机器人
    await bot.start();
    
  } catch (error: any) {
    console.error('启动失败:', error.message);
    
    if (error.message.includes('PRIVATE_KEY')) {
      console.error('\n请检查:');
      console.error('1. 是否已创建 .env 文件');
      console.error('2. .env 文件中是否设置了 PRIVATE_KEY');
      console.error('3. 可以从 .env.example 复制模板');
    }
    
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
