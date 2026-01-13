# 快速参考 / Quick Reference

## 一键命令 / Quick Commands

### 安装和启动 / Installation & Start
```bash
# 完整安装流程
git clone https://github.com/mx7625MX/BSC-.git
cd BSC-
cp .env.example .env
# 编辑 .env 文件
npm install
npm run build
npm start

# 或使用快速启动脚本
./start.sh
```

### 日常操作 / Daily Operations
```bash
# 启动机器人（开发模式）
npm run dev

# 启动机器人（生产模式）
npm start

# 后台运行（使用PM2）
pm2 start dist/index.js --name bsc-sniper

# 查看日志
tail -f logs/combined.log

# 停止机器人
pm2 stop bsc-sniper
# 或 Ctrl+C
```

---

## 配置速查 / Configuration Cheat Sheet

### 基础配置 / Basic Config
```env
PRIVATE_KEY=your_key                                    # 必需
BSC_RPC_URL=https://bsc-dataseed1.binance.org/         # BSC节点
AUTO_TRADE_ENABLED=false                                # 测试时false
```

### 交易配置 / Trading Config
```env
MAX_BUY_AMOUNT=0.1                                      # 最大购买(BNB)
MIN_LIQUIDITY_BNB=5                                     # 最小流动性
SLIPPAGE_TOLERANCE=10                                   # 滑点(%)
GAS_PRICE_MULTIPLIER=1.5                               # Gas倍数
```

### 策略配置 / Strategy Config

**保守策略 / Conservative**
```env
MAX_BUY_AMOUNT=0.02
MIN_LIQUIDITY_BNB=20
SLIPPAGE_TOLERANCE=8
GAS_PRICE_MULTIPLIER=1.2
```

**激进策略 / Aggressive**
```env
MAX_BUY_AMOUNT=0.5
MIN_LIQUIDITY_BNB=3
SLIPPAGE_TOLERANCE=20
GAS_PRICE_MULTIPLIER=3.0
```

---

## 常用命令 / Common Commands

### 项目管理 / Project Management
```bash
npm install              # 安装依赖
npm run build           # 构建项目
npm run dev             # 开发模式
npm start               # 生产模式
npm audit               # 检查安全漏洞
npm audit fix           # 修复漏洞
```

### Git操作 / Git Operations
```bash
git status              # 检查状态
git pull               # 更新代码
git add .              # 暂存更改
git commit -m "msg"    # 提交
git push               # 推送
```

### PM2管理 / PM2 Management
```bash
pm2 start dist/index.js --name bsc-sniper    # 启动
pm2 stop bsc-sniper                          # 停止
pm2 restart bsc-sniper                       # 重启
pm2 logs bsc-sniper                          # 查看日志
pm2 logs bsc-sniper --lines 100              # 查看最后100行
pm2 delete bsc-sniper                        # 删除进程
pm2 list                                     # 列出所有进程
pm2 monit                                    # 监控
```

### 日志管理 / Log Management
```bash
tail -f logs/combined.log                    # 实时查看
tail -n 100 logs/combined.log               # 最后100行
grep "错误" logs/combined.log               # 搜索错误
grep "交易成功" logs/combined.log | wc -l   # 统计成功次数
```

---

## 故障排除 / Troubleshooting

### 常见错误及解决 / Common Errors & Fixes

#### Error: "PRIVATE_KEY is required"
```bash
# 检查 .env 文件
cat .env | grep PRIVATE_KEY
# 确保私钥正确设置，不含0x前缀
```

#### Error: "insufficient funds"
```bash
# 检查钱包余额
# 访问 https://bscscan.com/address/YOUR_ADDRESS
# 确保有足够BNB
```

#### 构建失败 / Build Failed
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### RPC连接失败 / RPC Connection Failed
```bash
# 测试RPC连接
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://bsc-dataseed1.binance.org/

# 尝试其他节点
BSC_RPC_URL=https://bsc-dataseed2.binance.org/
```

---

## 性能优化 / Performance Optimization

### 提高成功率 / Improve Success Rate
```env
# 1. 使用更快的RPC节点
BSC_RPC_URL=https://your-premium-rpc-node.com

# 2. 提高Gas价格
GAS_PRICE_MULTIPLIER=2.5

# 3. 增加滑点
SLIPPAGE_TOLERANCE=15

# 4. 减少监控间隔
MONITOR_INTERVAL=500
```

### 降低成本 / Reduce Costs
```env
# 1. 降低Gas倍数
GAS_PRICE_MULTIPLIER=1.2

# 2. 减少交易频率
MIN_LIQUIDITY_BNB=10

# 3. 使用白名单
TOKEN_WHITELIST=0x...
```

---

## 安全检查清单 / Security Checklist

### 部署前 / Before Deployment
- [ ] `.env` 文件已创建且配置正确
- [ ] 私钥安全存储，不含0x前缀
- [ ] `.gitignore` 包含 `.env`
- [ ] 使用专用钱包，余额有限
- [ ] 在测试网测试过
- [ ] 了解所有风险

### 运行中 / During Operation
- [ ] 定期检查日志
- [ ] 监控钱包余额
- [ ] 记录所有交易
- [ ] 及时转出利润
- [ ] 更新黑名单

### 定期维护 / Regular Maintenance
- [ ] 更新依赖包: `npm update`
- [ ] 检查安全漏洞: `npm audit`
- [ ] 备份配置和日志
- [ ] 评估策略效果
- [ ] 更新文档

---

## 有用的链接 / Useful Links

### BSC工具 / BSC Tools
- **BscScan**: https://bscscan.com/
- **PancakeSwap**: https://pancakeswap.finance/
- **蜜罐检测**: https://honeypot.is/
- **代币检测**: https://tokensniffer.com/

### RPC节点 / RPC Nodes
- **Binance官方**: https://bsc-dataseed1.binance.org/
- **备用节点**: https://bsc-dataseed2.binance.org/
- **付费节点**: QuickNode, Alchemy, Moralis

### 开发资源 / Development Resources
- **Web3.js文档**: https://web3js.readthedocs.io/
- **BSC文档**: https://docs.bnbchain.org/
- **PancakeSwap文档**: https://docs.pancakeswap.finance/

---

## 监控和分析 / Monitoring & Analytics

### 关键指标 / Key Metrics
```bash
# 成功率
成功交易数 / 总尝试数 * 100%

# ROI
(当前价值 - 总投入 - Gas成本) / 总投入 * 100%

# 平均Gas成本
总Gas成本 / 交易数

# 响应时间
交易对创建时间 - 交易提交时间
```

### 日志分析 / Log Analysis
```bash
# 统计成功交易
grep "交易成功" logs/combined.log | wc -l

# 统计失败交易
grep "交易失败" logs/combined.log | wc -l

# 查看最近的错误
grep "error" logs/error.log | tail -n 20

# 分析Gas使用
grep "gasUsed" logs/combined.log
```

---

## 测试网信息 / Testnet Info

### BSC测试网 / BSC Testnet
```env
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

### 获取测试BNB / Get Test BNB
- https://testnet.binance.org/faucet-smart

### 测试网浏览器 / Testnet Explorer
- https://testnet.bscscan.com/

---

## 应急响应 / Emergency Response

### 立即停止 / Immediate Stop
```bash
# 前台运行
Ctrl + C

# PM2运行
pm2 stop bsc-sniper

# 强制停止
pkill -f "node.*index.js"
```

### 转移资金 / Transfer Funds
```bash
# 使用MetaMask或其他钱包
# 将资金转移到安全地址
```

### 更换钱包 / Change Wallet
```bash
# 1. 生成新钱包
# 2. 更新.env中的PRIVATE_KEY
# 3. 重启机器人
```

---

## 支持和帮助 / Support & Help

### 文档 / Documentation
- [README.md](README.md) - 主要文档
- [FAQ.md](FAQ.md) - 常见问题
- [SECURITY.md](SECURITY.md) - 安全指南
- [EXAMPLES.md](EXAMPLES.md) - 使用示例

### 获取帮助 / Get Help
1. 查看文档
2. 搜索Issues
3. 创建新Issue
4. 社区讨论

---

**提示：将此文件添加到浏览器书签以便快速访问！**

**Tip: Bookmark this file for quick access!**
