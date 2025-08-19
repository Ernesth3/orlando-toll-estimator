# 🚀 部署后端到Vercel指南

## 📋 部署步骤

### 步骤1：推送代码到GitHub

```bash
# 在backend目录中
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 步骤2：在Vercel上部署

1. **访问** [vercel.com](https://vercel.com) 并登录
2. **点击** "New Project"
3. **选择** 您的GitHub仓库 `Ernesth3/orlando-toll-estimator`
4. **配置项目：**
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: 留空（Vercel会自动处理）
   - **Output Directory**: 留空
   - **Install Command**: 留空

### 步骤3：环境变量配置

在Vercel项目设置中添加以下环境变量：

```
TOLLGURU_API_KEY=your_tollguru_api_key_here
NODE_ENV=production
```

**注意：** 如果您暂时没有TollGuru API密钥，系统会使用模拟数据进行测试。

### 步骤4：部署

点击 "Deploy" 按钮，等待部署完成！

## 🔧 部署后配置

### 获取后端URL

部署完成后，Vercel会给您一个域名，例如：
`https://your-project-name.vercel.app`

### 更新前端配置

在 `frontend/vercel.json` 中更新API重写规则：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-project-name.vercel.app/api/$1"
    }
  ]
}
```

### 重新部署前端

更新配置后，重新部署前端项目。

## 🧪 测试API

部署完成后，您可以测试以下端点：

- **健康检查**: `https://your-project-name.vercel.app/`
- **API端点**: `https://your-project-name.vercel.app/api/estimate`

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 确保所有依赖都正确安装
   - 检查TypeScript配置

2. **API调用失败**
   - 验证环境变量是否正确设置
   - 检查CORS设置
   - 如果没有TollGuru API密钥，系统会使用模拟数据

3. **路由问题**
   - 确保Vercel配置中的路由规则正确

## 📞 支持

如果遇到问题，请检查：
- Vercel部署日志
- 环境变量设置
- API端点响应

## 💡 关于API密钥

- **TollGuru API密钥**: 用于获取真实的收费公路费用数据
- **模拟数据**: 如果没有API密钥，系统会使用预设的模拟数据进行测试
- **生产环境**: 建议获取真实的TollGuru API密钥以获得准确数据
