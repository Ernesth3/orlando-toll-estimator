#!/bin/bash

echo "🚀 Deploying Toll Estimator..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment complete!"
    echo "Your app should be live at the URL shown above."
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi 