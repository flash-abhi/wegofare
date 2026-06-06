#!/bin/bash

echo "🚀 Quick Update Script for LockMyFare VPS"
echo "=========================================="

DEPLOY_DIR="/var/www/lockmyfare"
PM2_NAME="lockmyfare-backend"

# Navigate to project directory
cd $DEPLOY_DIR || { echo "❌ Project directory not found"; exit 1; }

# Stash any local changes
echo "📦 Stashing local changes..."
git stash

# Pull latest changes from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install/update dependencies if package.json changed
echo "📦 Checking dependencies..."
npm install

# Build React app
echo "🔨 Building React frontend..."
npm run build

# Restart backend with PM2
echo "🔄 Restarting backend server..."
pm2 restart $PM2_NAME || pm2 start ecosystem.config.js

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Update complete!"
echo "🌍 Your changes are now live at https://wegofare.com"
echo ""
echo "Quick checks:"
pm2 status
echo ""
echo "View logs: pm2 logs $PM2_NAME"
