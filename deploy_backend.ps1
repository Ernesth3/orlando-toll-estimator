# 🚀 部署后端到Vercel的PowerShell脚本

Write-Host "🚀 开始部署后端到Vercel..." -ForegroundColor Green

# 检查是否在正确的目录
if (-not (Test-Path "backend")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 进入backend目录
Set-Location backend
Write-Host "📁 进入backend目录..." -ForegroundColor Yellow

# 检查git状态
if (Test-Path ".git") {
    Write-Host "📝 检查git状态..." -ForegroundColor Yellow
    git status
    
    Write-Host "🔄 添加所有更改..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 提交更改..." -ForegroundColor Yellow
    git commit -m "Remove OpenAI dependency and update for TollGuru only"
    
    Write-Host "📤 推送到GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "✅ 代码已推送到GitHub！" -ForegroundColor Green
} else {
    Write-Host "❌ 错误：backend目录不是git仓库" -ForegroundColor Red
    Write-Host "请先初始化git仓库：" -ForegroundColor Yellow
    Write-Host "cd backend" -ForegroundColor Cyan
    Write-Host "git init" -ForegroundColor Cyan
    Write-Host "git remote add origin https://github.com/Ernesth3/orlando-toll-estimator.git" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🎯 下一步：" -ForegroundColor Green
Write-Host "1. 访问 https://vercel.com" -ForegroundColor Cyan
Write-Host "2. 点击 'New Project'" -ForegroundColor Cyan
Write-Host "3. 选择您的GitHub仓库" -ForegroundColor Cyan
Write-Host "4. 设置 Root Directory 为 'backend'" -ForegroundColor Cyan
Write-Host "5. 配置环境变量：" -ForegroundColor Cyan
Write-Host "   - TOLLGURU_API_KEY=your_key_here (可选)" -ForegroundColor Yellow
Write-Host "   - NODE_ENV=production" -ForegroundColor Yellow
Write-Host "6. 点击 'Deploy'" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 注意：如果没有TollGuru API密钥，系统会使用模拟数据进行测试" -ForegroundColor Magenta
Write-Host ""
Write-Host "部署完成后，请告诉我后端URL，我会帮您更新前端配置！" -ForegroundColor Green

# 返回根目录
Set-Location ..
