# 贡献指南 / Contributing Guide

感谢您对BSC MEME币阻击机器人项目的关注！

Thank you for your interest in the BSC MEME Coin Sniper Bot project!

---

## 如何贡献 / How to Contribute

### 报告问题 / Reporting Issues

如果您发现bug或有改进建议：

1. 检查 [Issues](https://github.com/mx7625MX/BSC-/issues) 是否已存在类似问题
2. 如果没有，创建新Issue
3. 提供详细信息：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（Node版本、操作系统等）
   - 相关日志

### 提交代码 / Submitting Code

#### 1. Fork项目

```bash
# Fork到您的账户，然后克隆
git clone https://github.com/YOUR_USERNAME/BSC-.git
cd BSC-
```

#### 2. 创建分支

```bash
# 从主分支创建功能分支
git checkout -b feature/your-feature-name

# 或修复分支
git checkout -b fix/your-bug-fix
```

#### 3. 开发

```bash
# 安装依赖
npm install

# 开发
# 编辑代码...

# 构建
npm run build

# 测试
npm run test
```

#### 4. 提交

```bash
# 提交更改
git add .
git commit -m "feat: 添加新功能描述"

# 推送到您的fork
git push origin feature/your-feature-name
```

#### 5. 创建Pull Request

1. 访问原仓库
2. 点击 "New Pull Request"
3. 选择您的分支
4. 填写PR描述：
   - 更改内容
   - 相关Issue
   - 测试结果
   - 截图（如适用）

---

## 代码规范 / Code Standards

### TypeScript风格

```typescript
// ✅ 好的
function processToken(address: string): Promise<TokenInfo> {
  // 实现...
}

// ❌ 避免
function processToken(address) {
  // 实现...
}
```

### 命名规范

- **函数**: camelCase - `getTokenInfo`
- **类**: PascalCase - `SniperBot`
- **常量**: UPPER_SNAKE_CASE - `MAX_BUY_AMOUNT`
- **私有成员**: 使用private关键字

### 注释规范

```typescript
/**
 * 获取代币信息
 * @param tokenAddress 代币合约地址
 * @returns 代币详细信息
 */
private async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  // 实现...
}
```

### 错误处理

```typescript
// ✅ 好的
try {
  await this.executeTrade();
} catch (error) {
  this.logger.error('交易失败', { error: error.message });
  throw error;
}

// ❌ 避免
try {
  await this.executeTrade();
} catch (error) {
  // 忽略错误
}
```

---

## 提交消息规范 / Commit Message Convention

使用约定式提交（Conventional Commits）：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 / Types

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例 / Examples

```bash
feat(bot): 添加自动卖出功能

实现了基于利润目标的自动卖出逻辑。
- 可配置利润目标百分比
- 支持止损设置
- 添加相关日志

Closes #123

---

fix(config): 修复环境变量解析错误

修复了当TOKEN_WHITELIST为空时的解析bug

---

docs(readme): 更新安装说明

添加了更详细的配置步骤和常见问题
```

---

## 开发指南 / Development Guide

### 环境设置

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（用于测试）
cp .env.example .env
# 编辑 .env，使用测试网配置

# 3. 构建
npm run build

# 4. 运行（开发模式）
npm run dev
```

### 调试

```bash
# 启用详细日志
LOG_LEVEL=debug npm run dev

# 使用Node调试器
node --inspect dist/index.js
```

### 测试

```bash
# 运行测试（如果有）
npm test

# 在测试网测试
# 在 .env 中配置测试网RPC
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

---

## 需要帮助的领域 / Areas Needing Help

我们特别欢迎以下方面的贡献：

### 功能增强 / Feature Enhancements
- [ ] 自动卖出功能
- [ ] 蜜罐检测集成
- [ ] 多DEX支持
- [ ] Web界面
- [ ] Telegram机器人

### 文档改进 / Documentation
- [ ] 更多使用示例
- [ ] 视频教程
- [ ] 其他语言翻译
- [ ] API文档

### 测试 / Testing
- [ ] 单元测试
- [ ] 集成测试
- [ ] 测试网测试报告

### 安全 / Security
- [ ] 安全审计
- [ ] 最佳实践文档
- [ ] 漏洞修复

---

## 行为准则 / Code of Conduct

### 我们的承诺

为了创建一个开放和友好的环境，我们承诺：

- ✅ 尊重不同的观点和经验
- ✅ 优雅地接受建设性批评
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心

### 不可接受的行为

- ❌ 使用性化语言或图像
- ❌ 人身攻击或侮辱性评论
- ❌ 骚扰或挑衅
- ❌ 发布他人私人信息
- ❌ 其他不道德或不专业的行为

---

## 许可证 / License

通过贡献代码，您同意您的贡献将采用与本项目相同的MIT许可证。

---

## 问题？ / Questions?

如果您有任何问题：

1. 查看 [FAQ.md](FAQ.md)
2. 搜索现有 [Issues](https://github.com/mx7625MX/BSC-/issues)
3. 创建新Issue寻求帮助

---

## 致谢 / Acknowledgments

感谢所有贡献者对本项目的支持！

Thank you to all contributors for your support of this project!

---

**让我们一起让这个项目变得更好！**

**Let's make this project better together!**
