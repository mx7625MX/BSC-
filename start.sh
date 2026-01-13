#!/bin/bash

# BSC MEME币阻击机器人 - 快速启动脚本

echo "========================================="
echo "   BSC MEME币阻击机器人"
echo "   快速启动脚本"
echo "========================================="
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ 错误: 未找到 .env 文件"
    echo ""
    echo "请执行以下步骤:"
    echo "1. 复制配置模板: cp .env.example .env"
    echo "2. 编辑 .env 文件，填入您的私钥和配置"
    echo "3. 重新运行此脚本"
    echo ""
    exit 1
fi

# 检查 node_modules
if [ ! -d node_modules ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 检查 dist 目录
if [ ! -d dist ]; then
    echo "🔨 构建项目..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 构建失败"
        exit 1
    fi
fi

echo "✅ 准备完成，启动机器人..."
echo ""

# 启动机器人
npm start
