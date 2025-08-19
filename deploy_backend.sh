#!/bin/bash

echo "🚀 开始部署后端到Vercel..."

# 检查是否在正确的目录
if [ ! -d "backend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 进入backend目录
cd backend

echo "📁 进入backend目录..."

# 检查git状态
if [ -d ".git" ]; then
    echo "📝 检查git状态..."
    git status
    
    echo "🔄 添加所有更改..."
    git add .
    
    echo "💾 提交更改..."
    git commit -m "Configure for Vercel deployment"
    
    echo "📤 推送到GitHub..."
    git push origin main
    
    echo "✅ 代码已推送到GitHub！"
else
    echo "❌ 错误：backend目录不是git仓库"
    echo "请先初始化git仓库："
    echo "cd backend"
    echo "git init"
    echo "git remote add origin https://github.com/Ernesth3/orlando-toll-estimator.git"
    exit 1
fi

echo ""
echo "🎯 下一步："
echo "1. 访问 https://vercel.com"
echo "2. 点击 'New Project'"
echo "3. 选择您的GitHub仓库"
echo "4. 设置 Root Directory 为 'backend'"
echo "5. 配置环境变量："
echo "   - OPENAI_API_KEY=your_key_here"
echo "   - TOLLGURU_API_KEY=your_key_here"
echo "   - NODE_ENV=production"
echo "6. 点击 'Deploy'"
echo ""
echo "部署完成后，请告诉我后端URL，我会帮您更新前端配置！"
