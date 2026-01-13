# 新手上手指南 / Beginner's Getting Started Guide

**👋 您好！欢迎使用BSC MEME币阻击机器人！**

作为代码新手，请按照以下步骤操作。我会用最简单的语言解释每一步。

---

## 🎯 第一步：准备工作（10分钟）

### 1.1 需要准备的东西

✅ **一台电脑** - Windows、Mac或Linux都可以  
✅ **一个BSC钱包** - 推荐MetaMask  
✅ **一些BNB** - 至少1-2个BNB（用于交易和Gas费）  
✅ **网络连接** - 稳定的互联网

### 1.2 安装必需软件

#### Windows用户：

1. **安装Node.js**
   - 访问：https://nodejs.org/
   - 下载"LTS"版本（推荐版本）
   - 双击安装文件，一路点"下一步"
   - 安装完成后，打开"命令提示符"（搜索cmd）
   - 输入 `node --version` 检查是否安装成功

2. **安装Git**（可选，如果您已经下载了代码可跳过）
   - 访问：https://git-scm.com/
   - 下载Windows版本
   - 双击安装，一路点"下一步"

#### Mac用户：

1. **安装Node.js**
   - 访问：https://nodejs.org/
   - 下载Mac版本
   - 双击安装
   - 打开"终端"（在应用程序/实用工具中）
   - 输入 `node --version` 检查

2. **Git通常已安装**
   - 在终端输入 `git --version` 检查

---

## 🔧 第二步：配置机器人（15分钟）

### 2.1 下载代码（如果还没下载）

打开命令提示符（Windows）或终端（Mac），输入：

```bash
cd Desktop
git clone https://github.com/mx7625MX/BSC-.git
cd BSC-
```

现在代码已经在您的桌面上了！

### 2.2 安装依赖

在同一个窗口中，输入：

```bash
npm install
```

这会下载机器人需要的所有组件。**需要等待2-5分钟**，看到很多文字滚动是正常的。

### 2.3 创建配置文件

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

### 2.4 填写配置（⚠️ 重要！）

配置文件会在文本编辑器中打开。您需要修改以下内容：

#### 必须修改的内容：

```env
# 1. 填入您的钱包私钥（从MetaMask导出）
PRIVATE_KEY=在这里粘贴您的私钥（不要包含0x）

# 2. 测试时设置为false（重要！）
AUTO_TRADE_ENABLED=false

# 3. 设置最大购买金额（建议从小金额开始）
MAX_BUY_AMOUNT=0.05
```

#### 如何获取私钥？

1. 打开MetaMask钱包
2. 点击右上角三个点
3. 点击"账户详情"
4. 点击"导出私钥"
5. 输入密码
6. **复制私钥**（不要分享给任何人！）
7. 粘贴到配置文件中（去掉开头的0x）

#### 保存配置文件

- Windows（记事本）：点击"文件" → "保存"
- Mac（nano）：按 `Ctrl+O`，然后 `Enter`，再按 `Ctrl+X`

---

## 🚀 第三步：运行机器人（5分钟）

### 3.1 编译代码

在命令提示符/终端中输入：

```bash
npm run build
```

等待10-30秒，看到没有红色错误信息就是成功了。

### 3.2 第一次运行（测试模式）

**重要：第一次必须用测试模式！**

```bash
npm run dev
```

您会看到类似这样的输出：

```
========================================
   BSC MEME币阻击机器人
   BSC MEME Coin Sniper Bot
========================================

正在加载配置...
[时间] [info]: === 配置信息 ===
[时间] [info]: 自动交易: 未启用
[时间] [info]: SniperBot 初始化完成
[时间] [info]: 钱包余额: X.XX BNB
[时间] [info]: 开始监控新交易对...
```

**这表示机器人正在运行！** 它会：
- ✅ 监控新代币
- ✅ 显示代币信息
- ❌ 不会自动购买（因为AUTO_TRADE_ENABLED=false）

### 3.3 停止机器人

按键盘上的 `Ctrl + C` 即可停止。

---

## 📝 第四步：查看日志（了解发生了什么）

### 4.1 查看日志文件

#### Windows：
```bash
type logs\combined.log
```

#### Mac/Linux：
```bash
cat logs/combined.log
```

### 4.2 实时查看日志

#### Windows：
```bash
# 打开一个新的命令提示符窗口
powershell Get-Content logs\combined.log -Wait
```

#### Mac/Linux：
```bash
# 打开一个新的终端窗口
tail -f logs/combined.log
```

---

## ⚠️ 第五步：理解风险（必读！）

### 在启用自动交易前，您必须知道：

1. **MEME币风险极高**
   - 90%以上的新MEME币会归零
   - 很多是骗局或"蜜罐"（只能买不能卖）
   - 您可能损失全部投资

2. **测试的重要性**
   - 先在测试模式运行几天
   - 观察机器人发现了哪些代币
   - 手动研究这些代币是否安全

3. **小额开始**
   - 第一次真实交易，用0.01-0.05 BNB测试
   - 确认一切正常后再增加金额
   - 永远不要投入超过您能承受损失的金额

---

## 🎯 第六步：启用自动交易（可选，谨慎！）

**只有在完全理解风险后才执行此步骤！**

### 6.1 修改配置

编辑 `.env` 文件，修改：

```env
# 启用自动交易
AUTO_TRADE_ENABLED=true

# 小金额开始
MAX_BUY_AMOUNT=0.02

# 提高安全要求
MIN_LIQUIDITY_BNB=10
SLIPPAGE_TOLERANCE=10
```

### 6.2 使用白名单（推荐！）

如果您知道某些安全的代币地址，可以设置白名单：

```env
# 只交易这些代币（用逗号分隔）
TOKEN_WHITELIST=0x地址1,0x地址2,0x地址3
```

### 6.3 重新启动

```bash
# 停止机器人（如果还在运行）
# 按 Ctrl+C

# 重新编译（如果改了配置）
npm run build

# 启动
npm run dev
```

---

## 📊 第七步：监控和管理

### 7.1 后台运行（可选）

如果您想让机器人一直运行：

```bash
# 安装PM2（只需要做一次）
npm install -g pm2

# 启动机器人
pm2 start dist/index.js --name bsc-sniper

# 查看状态
pm2 status

# 查看日志
pm2 logs bsc-sniper

# 停止
pm2 stop bsc-sniper
```

### 7.2 检查交易

1. 打开 https://bscscan.com/
2. 输入您的钱包地址
3. 查看所有交易记录

### 7.3 定期检查

- ✅ 每天查看日志
- ✅ 检查钱包余额
- ✅ 记录成功/失败的交易
- ✅ 及时转出利润

---

## 🆘 遇到问题？

### 常见错误解决方法

#### 错误："PRIVATE_KEY is required"
**原因**：没有正确配置私钥  
**解决**：
```bash
# 检查配置文件
notepad .env  # Windows
nano .env     # Mac/Linux

# 确保PRIVATE_KEY=后面有您的私钥
```

#### 错误："insufficient funds"
**原因**：钱包BNB不足  
**解决**：向钱包转入更多BNB

#### 错误："Cannot find module"
**原因**：依赖未安装  
**解决**：
```bash
rm -rf node_modules
npm install
```

#### 机器人没反应
**原因**：可能没有新代币上线  
**解决**：这是正常的，耐心等待

---

## 📚 更多帮助

### 详细文档

- **[README.md](README.md)** - 完整说明
- **[FAQ.md](FAQ.md)** - 100+个问题解答
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - 快速参考
- **[SECURITY.md](SECURITY.md)** - 安全指南

### 推荐学习顺序

1. ✅ 先读完本文档
2. ✅ 测试模式运行1-3天
3. ✅ 阅读 SECURITY.md 了解风险
4. ✅ 阅读 FAQ.md 解决疑问
5. ✅ 小额测试自动交易
6. ✅ 根据结果优化参数

---

## ✅ 快速检查清单

开始前确认：

- [ ] Node.js已安装
- [ ] 代码已下载
- [ ] 依赖已安装（npm install）
- [ ] .env文件已创建
- [ ] 私钥已填入（不含0x）
- [ ] AUTO_TRADE_ENABLED=false（测试）
- [ ] 钱包有足够BNB
- [ ] 已理解所有风险

第一次运行：

- [ ] npm run build成功
- [ ] npm run dev启动成功
- [ ] 看到"钱包余额"信息
- [ ] 看到"开始监控"信息
- [ ] 能够用Ctrl+C停止

---

## 💡 给新手的建议

### DO（应该做）：
✅ 从测试模式开始  
✅ 使用小金额  
✅ 经常查看日志  
✅ 定期转出利润  
✅ 保持学习  

### DON'T（不要做）：
❌ 第一次就启用自动交易  
❌ 投入大额资金  
❌ 分享您的私钥  
❌ 忽视风险警告  
❌ 不看文档就操作  

---

## 🎓 术语解释

**BNB** - Binance币，BSC链的Gas费代币  
**Gas费** - 交易手续费  
**私钥** - 钱包密码，极其重要  
**滑点** - 预期价格和实际价格的差异  
**流动性** - 交易池中的资金量  
**蜜罐** - 只能买不能卖的骗局代币  
**RPC节点** - 连接区块链的服务器  

---

## 📞 需要帮助？

1. **查看文档** - 先查FAQ.md
2. **检查日志** - logs/combined.log
3. **提交问题** - GitHub Issues
4. **重新阅读本指南** - 很多答案都在这里

---

**记住：加密货币交易有极高风险！**

**作为新手，请务必：**
1. 从测试开始
2. 使用小额资金
3. 充分学习和了解
4. 谨慎决策
5. 永远不要投入超过您能承受损失的资金

**祝您学习愉快！但请务必注意安全！** 🚀

---

**最后更新**: 2024-01-13  
**适用对象**: 代码新手  
**预计阅读时间**: 20分钟  
**实践时间**: 30-60分钟
