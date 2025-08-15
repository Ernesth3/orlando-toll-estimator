# 🚀 部署到Vercel指南

## 📋 前置要求

1. **GitHub账户** - 用于代码托管
2. **Vercel账户** - 用于部署
3. **Node.js 18+** - 本地开发环境

## 🔧 部署步骤

### 步骤1：推送代码到GitHub

```bash
# 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "Initial commit: Orlando e-Toll Estimator with Avis theme"

# 添加远程仓库
git remote add origin https://github.com/yourusername/toll-estimator.git
git push -u origin main
```

### 步骤2：在Vercel上部署

1. **访问** [vercel.com](https://vercel.com)
2. **登录** 你的账户
3. **点击** "New Project"
4. **选择** 你的GitHub仓库
5. **配置项目：**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 步骤3：环境变量配置

在Vercel项目设置中添加：

```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_APP_TITLE=Orlando e-Toll Estimator
```

### 步骤4：部署

点击 "Deploy" 按钮，等待部署完成！

## 🌐 部署后配置

### API代理设置

由于前端和后端分离，需要在Vercel上配置API代理：

1. 在项目根目录创建 `vercel.json`
2. 配置API重写规则（见vercel.json文件）

### 自定义域名（可选）

1. 在Vercel项目设置中添加自定义域名
2. 配置DNS记录

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本（需要18+）
   - 确保所有依赖都正确安装

2. **API调用失败**
   - 检查CORS设置
   - 验证API端点URL

3. **样式问题**
   - 确保Tailwind CSS正确构建
   - 检查CSS文件路径

## 📞 支持

如果遇到问题，请检查：
- Vercel部署日志
- 浏览器控制台错误
- 网络请求状态
