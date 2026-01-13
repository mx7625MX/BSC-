# BSC MEME币阻击机器人

一个用于在Binance Smart Chain (BSC)上自动监控和购买新上线MEME代币的阻击机器人。

## ⚠️ 免责声明

**本软件仅供学习和研究目的使用。加密货币交易存在极高风险，使用本机器人可能导致财务损失。作者不对使用本软件造成的任何损失负责。**

- ❌ 不要投入超过您能承受损失的资金
- ❌ 许多新代币可能是骗局或"蜜罐"合约
- ❌ 高Gas费和MEV抢跑可能导致交易失败或损失
- ✅ 建议先在BSC测试网络上测试
- ✅ 使用前请充分了解智能合约和DeFi风险

## 功能特性

- 🔍 **实时监控**: 监控PancakeSwap上的新交易对创建
- ⚡ **快速响应**: 发现新代币后立即执行购买
- 🛡️ **安全控制**: 
  - 最大购买金额限制
  - 最小流动性检查
  - 滑点保护
  - 黑名单/白名单功能
- 📊 **智能分析**: 
  - 代币信息获取
  - 流动性分析
  - Gas价格优化
- 📝 **日志记录**: 详细的操作日志和错误记录

## 系统要求

- Node.js 18.x 或更高版本
- npm 或 yarn
- BSC RPC节点访问权限（可使用公共节点或私有节点）
- 钱包私钥（包含BNB用于Gas费和购买）

## 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/mx7625MX/BSC-.git
cd BSC-
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入您的配置：

```env
# 必需配置
PRIVATE_KEY=your_private_key_here  # 您的钱包私钥（不含0x前缀）
BSC_RPC_URL=https://bsc-dataseed1.binance.org/  # BSC RPC节点

# 交易配置
MAX_BUY_AMOUNT=0.1  # 最大购买金额（BNB）
MIN_LIQUIDITY_BNB=5  # 最小流动性要求（BNB）
SLIPPAGE_TOLERANCE=10  # 滑点容忍度（%）
GAS_PRICE_MULTIPLIER=1.5  # Gas价格倍数

# 安全配置
AUTO_TRADE_ENABLED=false  # 是否启用自动交易（建议先设为false测试）
```

4. **编译项目**
```bash
npm run build
```

## 使用方法

### 开发模式（推荐用于测试）
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

### 测试模式（仅监控，不交易）
确保 `.env` 文件中设置：
```
AUTO_TRADE_ENABLED=false
```

然后运行：
```bash
npm run dev
```

## 配置说明

### 核心配置

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `PRIVATE_KEY` | 钱包私钥（必需） | - | `abc123...` |
| `BSC_RPC_URL` | BSC节点地址 | 公共节点 | `https://bsc-dataseed1.binance.org/` |
| `MAX_BUY_AMOUNT` | 单次最大购买金额（BNB） | 0.1 | `0.5` |
| `MIN_LIQUIDITY_BNB` | 最小流动性要求（BNB） | 5 | `10` |

### 高级配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `GAS_PRICE_MULTIPLIER` | Gas价格倍数（提高成交率） | 1.5 |
| `GAS_LIMIT` | Gas限制 | 500000 |
| `SLIPPAGE_TOLERANCE` | 滑点容忍度（%） | 10 |
| `MONITOR_INTERVAL` | 监控间隔（毫秒） | 1000 |

### 安全配置

| 参数 | 说明 | 示例 |
|------|------|------|
| `TOKEN_BLACKLIST` | 黑名单（逗号分隔的地址） | `0xabc...,0xdef...` |
| `TOKEN_WHITELIST` | 白名单（仅交易这些代币） | `0x123...,0x456...` |
| `AUTO_TRADE_ENABLED` | 是否启用自动交易 | `true/false` |

## 工作原理

1. **监控**: 机器人持续监控BSC区块链上的新区块
2. **检测**: 检测PancakeSwap Factory合约的PairCreated事件
3. **分析**: 
   - 获取新代币的基本信息（名称、符号、供应量）
   - 检查流动性是否满足最小要求
   - 验证代币是否在黑名单/白名单中
4. **执行**: 如果所有条件满足且启用了自动交易，执行购买操作
5. **记录**: 记录所有操作和结果到日志文件

## 风险提示

### 常见风险

1. **蜜罐合约**: 一些代币只能买入不能卖出
2. **高税收**: 某些代币有极高的买卖税
3. **流动性陷阱**: 创建者可能移除流动性
4. **抢跑(MEV)**: 矿工或机器人可能抢先交易
5. **Gas费损失**: 失败的交易仍会消耗Gas

### 降低风险的建议

- ✅ 设置合理的最小流动性要求
- ✅ 使用较低的最大购买金额
- ✅ 启用白名单模式（仅交易已验证的代币）
- ✅ 先在测试网络测试
- ✅ 定期查看和更新黑名单
- ✅ 监控机器人运行状态

## 日志文件

机器人会在 `logs/` 目录下生成日志文件：

- `combined.log`: 所有日志
- `error.log`: 仅错误日志

## 常见问题

### Q: 机器人不工作？
A: 检查：
1. `.env` 文件是否正确配置
2. 私钥是否正确（不含0x前缀）
3. 钱包是否有足够的BNB
4. RPC节点是否可访问

### Q: 交易失败？
A: 可能原因：
1. Gas价格太低（提高 `GAS_PRICE_MULTIPLIER`）
2. 滑点设置太小（提高 `SLIPPAGE_TOLERANCE`）
3. 流动性不足
4. 代币有购买限制

### Q: 如何提高成功率？
A: 建议：
1. 使用更快的RPC节点（私有节点）
2. 提高Gas价格倍数
3. 增加滑点容忍度（注意风险）
4. 减少购买金额

## 技术架构

```
src/
├── index.ts        # 主入口文件
├── bot.ts          # 机器人核心逻辑
├── config.ts       # 配置加载
├── logger.ts       # 日志系统
├── types.ts        # 类型定义
└── abis.ts         # 智能合约ABI
```

## 开发

### 构建
```bash
npm run build
```

### 开发模式
```bash
npm run dev
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue。

---

**再次提醒：加密货币交易有风险，投资需谨慎！**
