#!/bin/bash

echo "🚀 Starting SEO Automation Setup..."
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "📦 PM2 not found. Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed successfully"
else
    echo "✅ PM2 already installed"
fi

# Navigate to seo-automation directory
cd "$(dirname "$0")/seo-automation"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Start the SEO agent
echo ""
echo "🤖 Starting SEO Automation Agent..."
pm2 start seo-agent.js --name seo-agent

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "📊 Current Status:"
pm2 status seo-agent

echo ""
echo "✅ SEO Automation Agent is now running!"
echo ""
echo "Commands:"
echo "  pm2 status seo-agent     - Check status"
echo "  pm2 logs seo-agent       - View logs"
echo "  pm2 stop seo-agent       - Stop agent"
echo "  pm2 restart seo-agent    - Restart agent"
echo "  pm2 monit                - Real-time monitoring"
echo ""
echo "🎯 The agent will run daily SEO tasks at 3:00 AM"
echo "📊 View reports in the Admin Dashboard > SEO > Automation tab"
echo ""
