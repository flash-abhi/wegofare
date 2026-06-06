#!/bin/bash
# Quick VPS Update Script
# Upload this to your VPS and run: bash quick-update.sh

echo "🚀 Updating LockMyFare from GitHub..."
echo "=========================================="

cd /var/www/flight || exit 1

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ..
npm install

echo "🔨 Building React app..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart all

echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Update Complete!"
echo ""
echo "📊 Server Status:"
pm2 status
echo ""
echo "🌍 Site is live at: http://164.92.122.115"
echo "📝 View logs: pm2 logs"
