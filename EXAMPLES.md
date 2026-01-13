# 使用示例

## 场景1: 监控模式（推荐新手）

### 目的
仅监控新代币，不执行交易，用于学习和测试。

### 配置
```env
# .env
PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
AUTO_TRADE_ENABLED=false  # 关键：不启用自动交易
MIN_LIQUIDITY_BNB=5
```

### 运行
```bash
npm run dev
```

### 预期输出
```
========================================
   BSC MEME币阻击机器人
   BSC MEME Coin Sniper Bot
========================================

正在加载配置...
[2024-01-13 10:00:00] [info]: === 配置信息 ===
[2024-01-13 10:00:00] [info]: 自动交易: 未启用
[2024-01-13 10:00:00] [warn]: ⚠️  自动交易未启用，机器人将仅监控和记录机会
[2024-01-13 10:00:00] [info]: SniperBot 初始化完成
[2024-01-13 10:00:00] [info]: 钱包余额: 1.5 BNB
[2024-01-13 10:00:00] [info]: 开始监控新交易对...
[2024-01-13 10:00:00] [info]: 当前区块高度: 35234567

# 发现新代币时
[2024-01-13 10:05:23] [info]: 发现新交易对 { token0: '0x...', token1: '0x...', pair: '0x...' }
[2024-01-13 10:05:24] [info]: 代币信息 { address: '0x...', name: 'Test Token', symbol: 'TEST', ... }
[2024-01-13 10:05:25] [info]: 流动性信息 { ... }
[2024-01-13 10:05:26] [info]: 自动交易未启用，仅记录机会
```

---

## 场景2: 白名单模式

### 目的
只交易经过验证的、在白名单中的代币。

### 配置
```env
# .env
PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
AUTO_TRADE_ENABLED=true
MAX_BUY_AMOUNT=0.05
MIN_LIQUIDITY_BNB=10

# 仅交易这些代币（示例地址）
TOKEN_WHITELIST=0x1234567890123456789012345678901234567890,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd

# Gas优化
GAS_PRICE_MULTIPLIER=2.0
SLIPPAGE_TOLERANCE=15
```

### 特点
- ✅ 高安全性：只交易已知代币
- ✅ 低风险：避免蜜罐和骗局
- ❌ 机会较少：限于白名单代币

---

## 场景3: 激进模式（高风险）

### 目的
快速抢购新代币，追求高收益（高风险）。

### 配置
```env
# .env
PRIVATE_KEY=your_private_key_here

# 使用快速RPC节点（推荐付费节点）
BSC_RPC_URL=https://your-private-rpc-node.com

AUTO_TRADE_ENABLED=true
MAX_BUY_AMOUNT=0.2  # 较大金额
MIN_LIQUIDITY_BNB=3  # 较低要求，抢早期

# 激进Gas设置
GAS_PRICE_MULTIPLIER=3.0  # 高Gas确保成交
GAS_LIMIT=800000
SLIPPAGE_TOLERANCE=20  # 高滑点

# 快速监控
MONITOR_INTERVAL=500

# 黑名单已知骗局代币
TOKEN_BLACKLIST=0xscam1...,0xscam2...
```

### 特点
- ⚡ 快速响应
- 💰 高投入
- ⚠️ 极高风险
- 💸 高Gas成本

### 风险控制
```javascript
// 建议添加自定义逻辑
- 设置每日最大交易次数
- 设置最大总投入金额
- 实现自动止损
- 定期转出利润
```

---

## 场景4: 保守模式

### 目的
稳健操作，降低风险，适合长期运行。

### 配置
```env
# .env
PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
AUTO_TRADE_ENABLED=true

# 保守设置
MAX_BUY_AMOUNT=0.02  # 小额投入
MIN_LIQUIDITY_BNB=20  # 高流动性要求

# 标准Gas
GAS_PRICE_MULTIPLIER=1.2
SLIPPAGE_TOLERANCE=8

# 较长监控间隔
MONITOR_INTERVAL=2000

# 严格筛选
MIN_TOKEN_HOLDER_PERCENT=1.0
```

### 特点
- 🛡️ 低风险
- 💰 小额投入
- ⏱️ 不追求极致速度
- 📊 重视项目质量

---

## 场景5: 测试网测试

### 目的
在BSC测试网上测试机器人，不花费真实资金。

### 步骤

1. **获取测试网BNB**
   - 访问 BSC测试网水龙头
   - 获取免费测试BNB

2. **配置测试网**
```env
# .env
PRIVATE_KEY=your_testnet_private_key

# BSC测试网RPC
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# 测试网合约地址（需要查找测试网PancakeSwap地址）
PANCAKESWAP_ROUTER=0x... # 测试网Router地址
PANCAKESWAP_FACTORY=0x... # 测试网Factory地址
WBNB_ADDRESS=0x... # 测试网WBNB地址

AUTO_TRADE_ENABLED=true
MAX_BUY_AMOUNT=0.1
```

3. **运行测试**
```bash
npm run dev
```

---

## 场景6: 多钱包策略

### 目的
使用多个钱包分散风险。

### 方法1: 多实例运行
```bash
# 终端1
cp .env .env.wallet1
# 编辑 .env.wallet1，设置第一个钱包
npm run dev

# 终端2
cp .env .env.wallet2
# 编辑 .env.wallet2，设置第二个钱包
npm run dev
```

### 方法2: 脚本自动化
```bash
# start-multi.sh
#!/bin/bash

# 钱包1 - 激进策略
PRIVATE_KEY=$WALLET1_KEY AUTO_TRADE_ENABLED=true MAX_BUY_AMOUNT=0.1 npm start &

# 钱包2 - 保守策略  
PRIVATE_KEY=$WALLET2_KEY AUTO_TRADE_ENABLED=true MAX_BUY_AMOUNT=0.02 npm start &

# 钱包3 - 仅监控
PRIVATE_KEY=$WALLET3_KEY AUTO_TRADE_ENABLED=false npm start &
```

---

## 实用技巧

### 1. 日志分析
```bash
# 查看实时日志
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log

# 搜索特定代币
grep "0x1234..." logs/combined.log

# 统计交易成功率
grep "交易成功" logs/combined.log | wc -l
```

### 2. 性能监控
```bash
# 监控进程资源
top -p $(pgrep -f "node.*index.js")

# 监控网络连接
netstat -an | grep ESTABLISHED | grep 8545
```

### 3. 自动重启
```bash
# 使用 PM2
npm install -g pm2
pm2 start dist/index.js --name "bsc-sniper"
pm2 logs bsc-sniper
pm2 restart bsc-sniper
```

### 4. 定时任务
```bash
# crontab -e
# 每天凌晨4点重启机器人
0 4 * * * cd /path/to/BSC- && pm2 restart bsc-sniper

# 每小时备份日志
0 * * * * cp /path/to/BSC-/logs/combined.log /backup/logs/combined-$(date +\%Y\%m\%d\%H).log
```

---

## 常见操作

### 启动机器人
```bash
# 开发模式（显示实时日志）
npm run dev

# 生产模式（后台运行）
npm start

# 使用 PM2（推荐生产环境）
pm2 start dist/index.js --name bsc-sniper
```

### 停止机器人
```bash
# 如果在前台运行
Ctrl + C

# 如果使用 PM2
pm2 stop bsc-sniper
```

### 查看状态
```bash
# 查看进程
ps aux | grep node

# 查看最新日志
tail -n 50 logs/combined.log

# 使用 PM2
pm2 status
pm2 logs bsc-sniper --lines 100
```

### 更新配置
```bash
# 1. 编辑 .env 文件
nano .env

# 2. 重启机器人
pm2 restart bsc-sniper
```

---

## 调试技巧

### 详细日志
```env
# .env
LOG_LEVEL=debug
```

### 单步测试
```typescript
// 修改 src/bot.ts，添加断点或日志
this.logger.debug('检查点1: 获取代币信息', { tokenAddress });
```

### 模拟交易
```typescript
// 在 executeBuy 函数中添加
if (process.env.DRY_RUN === 'true') {
  this.logger.info('模拟交易（未实际执行）', { tokenAddress, amount });
  return { success: true };
}
```

---

**选择适合您风险承受能力的场景，谨慎操作！**