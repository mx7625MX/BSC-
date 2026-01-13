# 新功能说明：止盈止损 & 钱包跟单

## 📊 功能1：自动止盈止损

### 功能说明

机器人可以自动监控您持有的代币，当达到盈利目标或触发止损线时，自动卖出代币。

### 配置参数

在 `.env` 文件中添加以下配置：

```env
# 是否启用自动止盈 (true/false)
TAKE_PROFIT_ENABLED=true

# 止盈百分比 (例如50表示盈利50%时卖出)
TAKE_PROFIT_PERCENT=50

# 止损百分比 (例如30表示亏损30%时卖出)
STOP_LOSS_PERCENT=30

# 检查盈亏间隔 (毫秒，建议60000即1分钟)
CHECK_PROFIT_INTERVAL=60000
```

### 参数说明

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `TAKE_PROFIT_ENABLED` | 是否启用止盈止损功能 | `false` | `true` |
| `TAKE_PROFIT_PERCENT` | 达到多少盈利百分比时自动卖出 | `50` | `50`（盈利50%卖出）|
| `STOP_LOSS_PERCENT` | 达到多少亏损百分比时自动卖出 | `30` | `30`（亏损30%卖出）|
| `CHECK_PROFIT_INTERVAL` | 多久检查一次盈亏（毫秒） | `60000` | `60000`（1分钟）|

### 使用示例

#### 示例1：保守止盈止损
```env
TAKE_PROFIT_ENABLED=true
TAKE_PROFIT_PERCENT=30        # 盈利30%就卖
STOP_LOSS_PERCENT=20          # 亏损20%就止损
CHECK_PROFIT_INTERVAL=30000   # 每30秒检查一次
```

#### 示例2：激进止盈止损
```env
TAKE_PROFIT_ENABLED=true
TAKE_PROFIT_PERCENT=100       # 盈利翻倍才卖
STOP_LOSS_PERCENT=50          # 亏损50%止损
CHECK_PROFIT_INTERVAL=120000  # 每2分钟检查一次
```

#### 示例3：仅止盈，不止损
```env
TAKE_PROFIT_ENABLED=true
TAKE_PROFIT_PERCENT=50        # 盈利50%卖出
STOP_LOSS_PERCENT=999         # 设置极大值，实际不会触发
CHECK_PROFIT_INTERVAL=60000
```

### 工作原理

1. **自动记录**：当机器人购买代币后，自动记录购买价格和数量
2. **定期检查**：按设定的间隔（如1分钟）检查每个持仓的盈亏
3. **计算盈亏**：获取当前代币价格，计算盈利/亏损百分比
4. **自动卖出**：
   - 如果盈利达到 `TAKE_PROFIT_PERCENT`，自动卖出
   - 如果亏损达到 `STOP_LOSS_PERCENT`，自动止损卖出
5. **记录日志**：所有操作都会详细记录在日志中

### 日志示例

```
[info]: 已记录持仓信息 { token: '0x...' }
[debug]: 持仓检查 { token: '0x...', profitPercent: '35.50%', ... }
[info]: 触发止盈！ { token: '0x...', profitPercent: '52.30%' }
[info]: 准备卖出代币 { token: '0x...', amount: '...' }
[info]: 卖出成功 { hash: '0x...', amountReceived: '0.15 BNB' }
```

### ⚠️ 重要提醒

1. **需要授权**：首次卖出某个代币时，需要先授权，会消耗额外的Gas
2. **Gas成本**：每次卖出都需要支付Gas费，频繁卖出会增加成本
3. **价格波动**：加密货币价格波动剧烈，设置合理的止盈止损点位
4. **检查间隔**：
   - 间隔太短：检查频繁，消耗更多资源
   - 间隔太长：可能错过最佳卖出时机
   - 建议：30秒 - 2分钟

---

## 👥 功能2：钱包跟单

### 功能说明

监控其他钱包的交易，当目标钱包购买代币时，机器人自动跟随购买相同或按比例的代币。

### 配置参数

在 `.env` 文件中添加以下配置：

```env
# 是否启用跟单功能 (true/false)
COPY_TRADE_ENABLED=true

# 监控的钱包地址 (用逗号分隔，跟随这些地址的交易)
MONITORED_WALLETS=0x1234...,0x5678...,0xabcd...

# 跟单金额 (BNB，每次跟单使用的固定金额)
COPY_TRADE_AMOUNT=0.05

# 跟单倍数 (根据目标钱包的购买金额按比例跟单)
COPY_TRADE_MULTIPLIER=1.0
```

### 参数说明

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `COPY_TRADE_ENABLED` | 是否启用跟单功能 | `false` | `true` |
| `MONITORED_WALLETS` | 要监控的钱包地址列表 | - | `0x123...,0x456...` |
| `COPY_TRADE_AMOUNT` | 固定跟单金额（BNB） | `0.05` | `0.1` |
| `COPY_TRADE_MULTIPLIER` | 跟单倍数 | `1.0` | `0.5`（一半）或 `2.0`（双倍）|

### 跟单模式

#### 模式1：固定金额跟单
```env
COPY_TRADE_AMOUNT=0.1      # 每次固定用0.1 BNB跟单
COPY_TRADE_MULTIPLIER=1.0  # 忽略此参数
```

**特点**：
- 无论目标钱包买多少，您都用固定金额跟单
- 风险可控，适合新手

**示例**：
- 目标钱包买 1 BNB → 您买 0.1 BNB
- 目标钱包买 0.5 BNB → 您买 0.1 BNB
- 目标钱包买 0.05 BNB → 您买 0.1 BNB

#### 模式2：按倍数跟单
```env
COPY_TRADE_AMOUNT=0        # 设为0表示使用倍数模式
COPY_TRADE_MULTIPLIER=0.5  # 用目标钱包金额的50%跟单
```

**特点**：
- 根据目标钱包的购买金额按比例跟单
- 更灵活，但风险也随之变化

**示例**（倍数0.5）：
- 目标钱包买 1 BNB → 您买 0.5 BNB
- 目标钱包买 0.5 BNB → 您买 0.25 BNB
- 目标钱包买 0.1 BNB → 您买 0.05 BNB

**示例**（倍数2.0）：
- 目标钱包买 0.1 BNB → 您买 0.2 BNB
- 目标钱包买 0.05 BNB → 您买 0.1 BNB

### 使用示例

#### 示例1：跟随知名地址（固定金额）
```env
COPY_TRADE_ENABLED=true
# 假设这是某个成功交易者的地址
MONITORED_WALLETS=0x1234567890123456789012345678901234567890
COPY_TRADE_AMOUNT=0.05     # 每次固定0.05 BNB
COPY_TRADE_MULTIPLIER=1.0
```

#### 示例2：跟随多个地址（按比例）
```env
COPY_TRADE_ENABLED=true
# 监控多个地址
MONITORED_WALLETS=0x123...,0x456...,0x789...
COPY_TRADE_AMOUNT=0        # 设为0启用倍数模式
COPY_TRADE_MULTIPLIER=0.3  # 用目标金额的30%跟单
```

#### 示例3：保守跟单
```env
COPY_TRADE_ENABLED=true
MONITORED_WALLETS=0x123...
COPY_TRADE_AMOUNT=0.02     # 小额固定跟单
COPY_TRADE_MULTIPLIER=1.0
MAX_BUY_AMOUNT=0.05        # 限制最大金额
```

### 工作原理

1. **监控交易**：机器人每隔一段时间（`MONITOR_INTERVAL`）检查最新区块
2. **识别目标**：查找目标钱包地址的交易
3. **过滤交易**：只处理发送到PancakeSwap Router的交易（购买交易）
4. **解析交易**：分析交易内容，获取购买的代币和金额
5. **计算跟单**：根据配置（固定金额或倍数）计算跟单金额
6. **执行跟单**：自动购买相同的代币

### 日志示例

```
[info]: 启动钱包跟单监控... { wallets: ['0x123...'] }
[info]: 检测到目标钱包购买交易 { from: '0x123...', hash: '0x...', value: '0.5 BNB' }
[info]: 准备跟单 { originalAmount: 0.5, copyAmount: 0.1, multiplier: 0.2 }
[info]: 跟单购买成功 { token: '0xabc...', amount: '0.1 BNB' }
```

### ⚠️ 重要提醒

1. **选择目标**：
   - 选择经过验证的成功交易者
   - 不要盲目跟随不知名地址
   - 研究目标钱包的历史交易记录

2. **延迟问题**：
   - 跟单有延迟，可能错过最佳价格
   - 目标钱包可能使用更快的节点
   - 考虑提高 `GAS_PRICE_MULTIPLIER` 加快交易

3. **风险控制**：
   - 设置合理的 `MAX_BUY_AMOUNT` 限制
   - 使用固定金额模式更安全
   - 不要投入大额资金

4. **合法性**：
   - 跟单是合法的链上行为
   - 但不保证盈利
   - 自行承担所有风险

5. **技术限制**：
   - 当前版本仅支持基础跟单
   - 需要进一步优化交易解析
   - 复杂交易可能无法正确识别

---

## 🔄 两个功能结合使用

### 完整配置示例

```env
# ========== 基础配置 ==========
PRIVATE_KEY=your_private_key_here
AUTO_TRADE_ENABLED=true
MAX_BUY_AMOUNT=0.2
MIN_LIQUIDITY_BNB=5

# ========== 止盈止损配置 ==========
TAKE_PROFIT_ENABLED=true
TAKE_PROFIT_PERCENT=50         # 盈利50%卖出
STOP_LOSS_PERCENT=30           # 亏损30%止损
CHECK_PROFIT_INTERVAL=60000    # 每分钟检查

# ========== 钱包跟单配置 ==========
COPY_TRADE_ENABLED=true
MONITORED_WALLETS=0x1234567890123456789012345678901234567890
COPY_TRADE_AMOUNT=0.05         # 固定0.05 BNB跟单
COPY_TRADE_MULTIPLIER=1.0
```

### 工作流程

1. 机器人启动后，同时运行三个模块：
   - 新币监控（原有功能）
   - 止盈止损监控（新功能）
   - 钱包跟单监控（新功能）

2. 当检测到交易机会时：
   - 新币上线 → 自动购买 → 记录持仓 → 定期检查盈亏
   - 目标钱包购买 → 跟单购买 → 记录持仓 → 定期检查盈亏

3. 止盈止损自动执行：
   - 所有持仓（新币或跟单）都会被监控
   - 达到止盈/止损条件自动卖出
   - 清除持仓记录

---

## 📚 常见问题

### Q: 止盈止损会自动卖出所有代币吗？
A: 是的，当触发条件时，会卖出该代币的全部持仓。

### Q: 可以手动卖出部分代币吗？
A: 目前不支持部分卖出，需要手动操作或停止机器人。

### Q: 跟单会跟目标钱包的卖出操作吗？
A: 当前版本仅跟随买入操作，不跟随卖出。

### Q: 如何找到值得跟单的钱包地址？
A: 
- 使用 BSCScan 分析历史成功交易
- 关注社区推荐的地址
- 观察代币的早期购买者
- ⚠️ 务必自己研究，不要盲目跟随

### Q: 两个功能可以单独使用吗？
A: 可以！您可以：
- 只启用止盈止损：`TAKE_PROFIT_ENABLED=true`，`COPY_TRADE_ENABLED=false`
- 只启用跟单：`TAKE_PROFIT_ENABLED=false`，`COPY_TRADE_ENABLED=true`
- 都启用：两个都设为 `true`
- 都不启用：保持原有功能

### Q: 检查盈亏的间隔应该设置多少？
A: 建议：
- 快速：30秒（`30000`）- 更及时但消耗更多资源
- 标准：1分钟（`60000`）- 推荐
- 慢速：2-5分钟（`120000-300000`）- 节省资源

### Q: 跟单的最大金额如何限制？
A: 跟单金额会自动受到 `MAX_BUY_AMOUNT` 限制，不会超过这个值。

---

## 🎯 最佳实践

### 止盈止损策略

1. **保守策略**
   ```env
   TAKE_PROFIT_PERCENT=30
   STOP_LOSS_PERCENT=20
   ```
   
2. **平衡策略**
   ```env
   TAKE_PROFIT_PERCENT=50
   STOP_LOSS_PERCENT=30
   ```

3. **激进策略**
   ```env
   TAKE_PROFIT_PERCENT=100
   STOP_LOSS_PERCENT=50
   ```

### 跟单策略

1. **新手策略**
   - 固定小额跟单：`COPY_TRADE_AMOUNT=0.02`
   - 监控1-2个经过验证的地址
   - 设置低的 `MAX_BUY_AMOUNT`

2. **进阶策略**
   - 按比例跟单：`COPY_TRADE_MULTIPLIER=0.5`
   - 监控3-5个地址
   - 结合止盈止损自动管理

3. **高级策略**
   - 多个地址不同倍数（需修改代码）
   - 结合其他分析指标
   - 自定义跟单逻辑

---

## ⚠️ 最后提醒

1. **测试先行**：
   - 先在测试网测试功能
   - 用小额资金在主网测试
   - 确认一切正常后再加大投入

2. **风险控制**：
   - 设置合理的止盈止损点位
   - 不要过度依赖跟单
   - 保持对市场的独立判断

3. **持续监控**：
   - 定期查看日志
   - 检查持仓状态
   - 调整策略参数

4. **技术限制**：
   - 跟单功能仍在优化中
   - 复杂交易可能识别不准确
   - 建议结合手动分析

**祝您使用愉快！但请务必注意风险！** 🚀
