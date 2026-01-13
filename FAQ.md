# 常见问题解答 (FAQ)

## 基础问题

### Q: 这个机器人是做什么的？
A: 这是一个BSC链上的MEME币阻击机器人，可以自动监控PancakeSwap上的新代币上线，并在第一时间执行购买操作。

### Q: 使用这个机器人安全吗？
A: 加密货币交易本身存在极高风险。本机器人仅提供自动化交易工具，无法保证盈利。请：
- 只投入您能承受损失的资金
- 先在测试网测试
- 了解智能合约和DeFi风险
- 谨慎设置交易参数

### Q: 需要什么技术水平？
A: 建议具备以下基础知识：
- 基本的命令行操作
- 了解Node.js和npm
- 理解区块链和智能合约基础
- 熟悉BSC和PancakeSwap

### Q: 需要多少初始资金？
A: 建议至少准备：
- 0.5-1 BNB用于Gas费
- 额外的BNB用于购买代币（根据您的策略）
- 总计建议2-5 BNB起步（仅供参考）

## 安装和配置

### Q: 如何获取私钥？
A: 
1. 在MetaMask或其他钱包中
2. 点击账户详情
3. 导出私钥
4. ⚠️ 永远不要分享您的私钥！

### Q: .env文件如何配置？
A:
```bash
# 1. 复制模板
cp .env.example .env

# 2. 编辑文件
nano .env

# 3. 填入必需参数
PRIVATE_KEY=your_key_without_0x_prefix
AUTO_TRADE_ENABLED=false  # 测试时设为false

# 4. 保存并退出
```

### Q: 如何选择RPC节点？
A: 
**免费公共节点**（速度较慢）:
- https://bsc-dataseed1.binance.org/
- https://bsc-dataseed2.binance.org/

**付费私有节点**（推荐，速度快）:
- QuickNode
- Alchemy
- Infura
- Moralis

### Q: 构建失败怎么办？
A:
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 运行和使用

### Q: 如何测试机器人？
A:
```bash
# 1. 设置为监控模式
# 在 .env 中设置
AUTO_TRADE_ENABLED=false

# 2. 运行机器人
npm run dev

# 3. 观察日志输出
# 机器人会检测新代币但不会交易
```

### Q: 如何在后台运行？
A:
```bash
# 使用 PM2
npm install -g pm2
npm run build
pm2 start dist/index.js --name bsc-sniper

# 查看日志
pm2 logs bsc-sniper

# 停止
pm2 stop bsc-sniper
```

### Q: 如何查看日志？
A:
```bash
# 实时查看
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log

# 搜索特定内容
grep "交易成功" logs/combined.log
```

### Q: 机器人没有检测到新代币？
A: 可能的原因：
1. **区块链同步**: 等待几分钟让机器人同步
2. **RPC节点问题**: 更换更快的节点
3. **没有新代币上线**: 正常情况，耐心等待
4. **网络问题**: 检查网络连接

### Q: 如何停止机器人？
A:
```bash
# 如果在前台运行
Ctrl + C

# 如果使用 PM2
pm2 stop bsc-sniper

# 强制停止
pkill -f "node.*index.js"
```

## 交易相关

### Q: 为什么交易失败？
A: 常见原因：
1. **Gas价格太低**: 提高 `GAS_PRICE_MULTIPLIER`
2. **滑点太小**: 增加 `SLIPPAGE_TOLERANCE`
3. **余额不足**: 检查BNB余额
4. **代币限制**: 某些代币有购买限制
5. **被抢跑**: 其他机器人/矿工抢先交易

### Q: 如何提高成功率？
A:
1. **使用更快的RPC**: 付费私有节点
2. **提高Gas价格**: `GAS_PRICE_MULTIPLIER=2.5-5.0`
3. **增加滑点**: `SLIPPAGE_TOLERANCE=15-25`
4. **减少监控间隔**: `MONITOR_INTERVAL=500`
5. **优化网络**: 使用低延迟服务器

### Q: Gas费用太高怎么办？
A:
1. 降低 `GAS_PRICE_MULTIPLIER`
2. 选择网络不拥堵时段
3. 减少交易频率
4. 考虑成本效益比

### Q: 什么是滑点？如何设置？
A: 滑点是预期价格和实际成交价格的差异。
```env
# 保守: 5-10%
SLIPPAGE_TOLERANCE=10

# 激进: 15-25%
SLIPPAGE_TOLERANCE=20

# 注意: 高滑点可能损失更多
```

### Q: 如何设置购买金额？
A:
```env
# 保守策略
MAX_BUY_AMOUNT=0.01-0.05

# 中等策略
MAX_BUY_AMOUNT=0.1-0.5

# 激进策略
MAX_BUY_AMOUNT=1.0-5.0

# ⚠️ 根据您的风险承受能力设置
```

## 安全和风险

### Q: 如何识别蜜罐代币？
A: 蜜罐特征：
- 只能买入不能卖出
- 高税收（>50%）
- 持币地址极少
- 合约未开源
- 没有审计报告

使用工具检查：
- https://honeypot.is/
- https://tokensniffer.com/
- https://bscheck.eu/

### Q: 如何保护私钥？
A:
1. **永远不要分享**
2. **使用专用钱包**
3. **定期转出利润**
4. **限制钱包余额**
5. **文件权限**: `chmod 600 .env`

### Q: 白名单和黑名单如何使用？
A:
```env
# 黑名单 - 永不交易这些代币
TOKEN_BLACKLIST=0xscam1,0xscam2,0xscam3

# 白名单 - 只交易这些代币（更安全）
TOKEN_WHITELIST=0xsafe1,0xsafe2

# 注意：如果设置了白名单，只会交易白名单中的代币
```

### Q: 如何避免损失？
A:
1. **小额测试**: 先用小额测试
2. **设置限额**: 合理的 `MAX_BUY_AMOUNT`
3. **流动性检查**: 提高 `MIN_LIQUIDITY_BNB`
4. **使用白名单**: 只交易已验证代币
5. **及时止损**: 亏损时及时退出
6. **定期转出**: 不要把所有资金放在交易钱包

## 性能优化

### Q: 如何优化速度？
A:
1. **快速RPC节点**: 使用私有节点
2. **优化网络**: 
   - 使用靠近BSC节点的服务器
   - 优化网络配置
3. **减少监控间隔**: `MONITOR_INTERVAL=500`
4. **提高Gas价格**: 更快成交

### Q: 机器人占用资源太高？
A:
```bash
# 监控资源使用
top -p $(pgrep -f node)

# 如果内存不足，考虑：
# 1. 增加服务器内存
# 2. 优化代码
# 3. 限制日志大小
```

### Q: 如何同时监控多个代币对？
A: 当前版本自动监控所有新创建的交易对。如需自定义：
1. 使用白名单功能
2. 或修改代码添加过滤逻辑

## 盈利策略

### Q: 什么时候卖出？
A: 机器人目前只负责买入，卖出需要手动或另外编写逻辑：
```typescript
// 可以添加自动卖出功能
// 1. 定时检查持仓
// 2. 达到目标利润时卖出
// 3. 或设置止损点
```

### Q: 如何评估收益？
A:
1. 记录每笔交易
2. 计算总投入
3. 计算当前价值
4. 减去Gas成本
5. 计算ROI

### Q: 成功率低怎么办？
A: 分析原因：
1. 检查日志找出失败原因
2. 是否Gas太低？
3. 是否被抢跑？
4. 是否代币有问题？
5. 调整参数后重试

## 高级问题

### Q: 如何添加自定义过滤条件？
A: 编辑 `src/bot.ts`，在 `analyzePair` 函数中添加：
```typescript
// 例如：检查代币名称
if (tokenInfo.name.includes('SCAM')) {
  this.logger.info('可疑代币，跳过');
  return;
}

// 例如：检查总供应量
const supply = new BigNumber(tokenInfo.totalSupply);
if (supply.isGreaterThan(1e15)) {
  this.logger.info('供应量过大，跳过');
  return;
}
```

### Q: 如何实现自动卖出？
A: 需要添加新功能：
1. 监控持仓
2. 检查价格涨幅
3. 达到目标时执行卖出
4. 使用 `swapExactTokensForETH` 方法

### Q: 如何与Telegram集成？
A: 
```bash
# 安装 Telegram Bot API
npm install node-telegram-bot-api

# 在代码中添加通知功能
// 发现新代币时通知
// 交易成功/失败时通知
```

### Q: 如何部署到服务器？
A:
```bash
# 1. 连接到服务器
ssh user@your-server

# 2. 克隆代码
git clone https://github.com/mx7625MX/BSC-.git
cd BSC-

# 3. 配置环境
cp .env.example .env
nano .env

# 4. 安装和运行
npm install
npm run build
pm2 start dist/index.js --name bsc-sniper
pm2 save
pm2 startup
```

### Q: 如何监控多个钱包？
A: 运行多个实例：
```bash
# 使用不同的 .env 文件
pm2 start dist/index.js --name wallet1 --env .env.wallet1
pm2 start dist/index.js --name wallet2 --env .env.wallet2
```

## 故障排除

### Q: 报错 "PRIVATE_KEY is required"
A:
```bash
# 检查 .env 文件是否存在
ls -la .env

# 检查内容
cat .env | grep PRIVATE_KEY

# 确保私钥不含 0x 前缀
```

### Q: 报错 "insufficient funds"
A:
```bash
# 检查钱包余额
# 在 BSCScan 上查看：
# https://bscscan.com/address/YOUR_ADDRESS

# 确保有足够的 BNB
```

### Q: 连接RPC节点失败
A:
```bash
# 测试RPC连接
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://bsc-dataseed1.binance.org/

# 尝试其他节点
```

### Q: 如何重置状态？
A:
```bash
# 清理日志
rm -rf logs/*

# 重新构建
rm -rf dist/
npm run build

# 重启机器人
pm2 restart bsc-sniper
```

## 法律和合规

### Q: 使用机器人合法吗？
A: 取决于您所在的司法管辖区。请：
- 了解当地法律法规
- 遵守税务规定
- 不要用于非法活动

### Q: 需要交税吗？
A: 在大多数国家，加密货币交易收益需要纳税。请：
- 记录所有交易
- 咨询税务专业人士
- 按时申报纳税

---

## 获取帮助

如果您的问题未在此列出：

1. **查看文档**: 
   - README.md
   - SECURITY.md
   - EXAMPLES.md

2. **检查日志**:
   ```bash
   tail -f logs/combined.log
   ```

3. **提交Issue**: 
   - https://github.com/mx7625MX/BSC-/issues

4. **社区讨论**: 
   - 查找相关Telegram/Discord群组

---

**记住：加密货币交易有风险，投资需谨慎！**