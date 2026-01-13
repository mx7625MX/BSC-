# 机器人配置教程 / Bot Configuration Tutorial

## 📋 配置步骤（5分钟完成）

### 第一步：创建配置文件

打开命令提示符（Windows）或终端（Mac），进入项目目录后输入：

#### Windows用户：
```bash
copy .env.example .env
notepad .env
```

#### Mac/Linux用户：
```bash
cp .env.example .env
nano .env
```

---

## ⚙️ 必须配置的参数

### 1. 钱包私钥（最重要！）

```env
PRIVATE_KEY=你的私钥粘贴在这里（不要包含0x）
```

**如何获取私钥？**

📱 **使用MetaMask：**
1. 打开MetaMask钱包
2. 点击右上角**三个点** (⋮)
3. 点击"**账户详情**"
4. 点击"**导出私钥**"
5. 输入MetaMask密码
6. 复制显示的私钥
7. **去掉开头的`0x`**，粘贴到配置文件

⚠️ **安全提示：**
- 私钥就是您钱包的密码，绝对不能泄露给任何人
- 建议使用专门的钱包，不要用存放大量资金的主钱包
- 配置文件`.env`已经被`.gitignore`保护，不会上传到GitHub

---

### 2. 自动交易开关（必须设置）

```env
AUTO_TRADE_ENABLED=false
```

**第一次使用时，请务必设置为 `false`！**

- `false` = 只监控，不交易（安全模式，推荐新手）
- `true` = 自动购买（有风险，需谨慎）

---

### 3. 最大购买金额

```env
MAX_BUY_AMOUNT=0.05
```

这是单次最多花费多少BNB购买代币。

**建议设置：**
- 新手测试：`0.01` - `0.05` BNB
- 正式使用：`0.1` - `0.5` BNB
- 激进策略：`1.0` - `5.0` BNB

⚠️ 提醒：设置得越大，风险越高！

---

## 🔧 可选配置（可以使用默认值）

### 4. 最小流动性要求

```env
MIN_LIQUIDITY_BNB=5
```

只购买流动性池中至少有这么多BNB的代币。

- 保守：`10` - `20` BNB（更安全，但机会少）
- 中等：`5` BNB（平衡）
- 激进：`1` - `3` BNB（机会多，但风险高）

---

### 5. Gas价格倍数

```env
GAS_PRICE_MULTIPLIER=1.5
```

Gas费用的倍数，越高交易越快被确认。

- 省钱模式：`1.0` - `1.2`
- 标准模式：`1.5` - `2.0`
- 快速模式：`2.5` - `5.0`

---

### 6. 滑点容忍度

```env
SLIPPAGE_TOLERANCE=10
```

允许的价格变动百分比。

- 保守：`5` - `8`%
- 标准：`10` - `15`%
- 激进：`20` - `25`%

⚠️ 注意：滑点越高，可能损失越大，但成交率越高。

---

### 7. 白名单/黑名单（可选）

```env
# 黑名单 - 永远不买这些代币
TOKEN_BLACKLIST=0x123abc...,0x456def...

# 白名单 - 只买这些代币（更安全！）
TOKEN_WHITELIST=0x789ghi...,0xabcjkl...
```

**如何使用：**
- 多个地址用**英文逗号**分隔
- 如果设置了白名单，只会购买白名单中的代币
- 黑名单可以屏蔽已知的骗局代币

---

## 📝 完整配置示例

### 示例1：新手测试模式（推荐第一次使用）

```env
# 必须配置
PRIVATE_KEY=你的私钥（去掉0x）
AUTO_TRADE_ENABLED=false
MAX_BUY_AMOUNT=0.02

# 使用默认值即可
MIN_LIQUIDITY_BNB=5
GAS_PRICE_MULTIPLIER=1.5
SLIPPAGE_TOLERANCE=10
```

**特点：**
- ✅ 只监控，不交易（安全）
- ✅ 小金额设置
- ✅ 可以观察机器人如何工作

---

### 示例2：保守策略

```env
# 必须配置
PRIVATE_KEY=你的私钥（去掉0x）
AUTO_TRADE_ENABLED=true
MAX_BUY_AMOUNT=0.05

# 保守设置
MIN_LIQUIDITY_BNB=15
GAS_PRICE_MULTIPLIER=1.2
SLIPPAGE_TOLERANCE=8

# 可选：使用白名单
TOKEN_WHITELIST=0x已验证的安全代币地址
```

**特点：**
- 🛡️ 高流动性要求
- 💰 小额投入
- 🐢 不追求速度
- ✅ 白名单保护

---

### 示例3：激进策略（⚠️ 高风险）

```env
# 必须配置
PRIVATE_KEY=你的私钥（去掉0x）
AUTO_TRADE_ENABLED=true
MAX_BUY_AMOUNT=0.3

# 激进设置
MIN_LIQUIDITY_BNB=3
GAS_PRICE_MULTIPLIER=3.0
SLIPPAGE_TOLERANCE=20
MONITOR_INTERVAL=500

# 使用更快的RPC节点（付费）
BSC_RPC_URL=https://your-premium-rpc.com
```

**特点：**
- ⚡ 快速响应
- 💸 高Gas费用
- 🎯 低门槛（抢早期项目）
- ⚠️ 极高风险

---

## 🔍 其他参数说明

### BSC RPC节点

```env
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
```

**免费节点（速度较慢）：**
- `https://bsc-dataseed1.binance.org/`
- `https://bsc-dataseed2.binance.org/`
- `https://bsc-dataseed3.binance.org/`

**付费节点（速度快，推荐）：**
- QuickNode
- Alchemy
- Moralis
- Infura

---

### 监控间隔

```env
MONITOR_INTERVAL=1000
```

每隔多少毫秒检查一次新区块。

- 标准：`1000`（1秒）
- 快速：`500`（0.5秒）

⚠️ 设置太小可能被RPC节点限制。

---

### 日志级别

```env
LOG_LEVEL=info
```

- `debug`：显示所有详细信息
- `info`：显示常规信息（推荐）
- `warn`：只显示警告
- `error`：只显示错误

---

## ✅ 配置检查清单

配置完成后，请检查：

- [ ] `PRIVATE_KEY` 已填入（去掉了0x）
- [ ] `AUTO_TRADE_ENABLED` 第一次设为 `false`
- [ ] `MAX_BUY_AMOUNT` 设置了合理的金额
- [ ] 文件已保存
- [ ] 钱包有足够的BNB

---

## 💾 保存配置

### Windows（记事本）：
1. 点击菜单栏的"文件"
2. 点击"保存"
3. 关闭记事本

### Mac/Linux（nano编辑器）：
1. 按 `Ctrl + O`（保存）
2. 按 `Enter`（确认）
3. 按 `Ctrl + X`（退出）

---

## 🚀 配置完成后的下一步

1. **编译项目**
```bash
npm run build
```

2. **启动机器人（测试模式）**
```bash
npm run dev
```

3. **观察输出**
应该看到：
```
[info]: 钱包余额: X.XX BNB
[info]: 自动交易: 未启用
[info]: 开始监控新交易对...
```

4. **停止机器人**
按 `Ctrl + C`

---

## ❓ 常见配置问题

### Q: 配置文件保存在哪里？
A: 在项目根目录下，文件名是 `.env`（注意有个点）

### Q: 为什么看不到 .env 文件？
A: 因为它是隐藏文件。
- Windows：在文件资源管理器中点击"查看" → 勾选"隐藏的项目"
- Mac：在Finder中按 `Cmd + Shift + .`

### Q: 不小心把私钥提交到GitHub了怎么办？
A: 
1. 立即生成新钱包
2. 转移所有资金到新钱包
3. 更新配置文件中的私钥
4. 旧钱包作废

### Q: 可以修改合约地址吗？
A: 一般不需要修改，除非：
- 使用测试网络
- PancakeSwap更新了合约
- 想使用其他DEX

### Q: 配置修改后需要重新编译吗？
A: 
- 修改 `.env` 文件 → **不需要**重新编译
- 修改 `src/` 目录中的代码 → **需要**重新编译

---

## 🔐 安全提醒

1. ⚠️ **永远不要分享您的私钥**
2. ⚠️ **不要截图包含私钥的配置文件**
3. ⚠️ **使用专用钱包，不要用主钱包**
4. ⚠️ **定期转出利润到安全钱包**
5. ⚠️ **设置合理的最大购买金额**

---

## 📚 相关文档

- **[BEGINNER_GUIDE.md](BEGINNER_GUIDE.md)** - 完整的新手指南
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - 快速参考手册
- **[EXAMPLES.md](EXAMPLES.md)** - 更多配置示例
- **[SECURITY.md](SECURITY.md)** - 安全指南
- **[FAQ.md](FAQ.md)** - 常见问题

---

**配置完成！现在可以运行机器人了！** 🎉

记住：第一次使用请设置 `AUTO_TRADE_ENABLED=false` 先观察几天！
