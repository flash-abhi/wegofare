#!/bin/bash

echo "🚀 Starting deployment..."

DEPLOY_DIR="/var/www/skyfaretravels"
PM2_NAME="skyfaretravels-backend"

# Navigate to project directory
cd $DEPLOY_DIR || { echo "❌ Directory not found"; exit 1; }

# Pull latest changes
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build React app
echo "🔨 Building React app..."
npm run build

# Restart PM2 process
echo "🔄 Restarting backend..."
pm2 restart $PM2_NAME || pm2 start ecosystem.config.js

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌍 Your app is live at http://wegofare.com"
