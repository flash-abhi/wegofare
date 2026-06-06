#!/bin/bash

# Complete fresh deployment script for skyfaretravels VPS
# Run this on your VPS as: bash deploy-fresh.sh

set -e  # Exit on any error

VPS_IP="82.29.197.137"
DOMAIN="wegofare.com"
DEPLOY_DIR="/var/www/skyfaretravels"
PM2_NAME="skyfaretravels-backend"
BACKEND_PORT=5001

echo "🚀 Starting fresh deployment on $VPS_IP..."

# 1. Stop and delete PM2 process
echo "📦 Stopping PM2 processes..."
pm2 delete $PM2_NAME 2>/dev/null || true
pm2 delete flight-api 2>/dev/null || true
pm2 delete flight-backend 2>/dev/null || true

# 2. Backup and remove old directory
echo "🗑️  Removing old deployment..."
cd /var/www
rm -rf skyfaretravels.backup 2>/dev/null || true
mv skyfaretravels skyfaretravels.backup 2>/dev/null || true
rm -rf flight.backup 2>/dev/null || true
mv flight flight.backup 2>/dev/null || true

# 3. Clone fresh from GitHub
echo "📥 Cloning from GitHub..."
git clone git@github.com:rawatsachin9-arch/skyfaretravels.git
cd skyfaretravels

# 4. Install ALL dependencies (including backend)
echo "📦 Installing dependencies..."
npm install

# Install backend-specific dependencies
echo "📦 Installing backend dependencies..."
npm install mongoose amadeus bcryptjs

# 5. Build React app
echo "🏗️  Building React app..."
npm run build

# 6. Verify build exists
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed! index.html not found"
    exit 1
fi
echo "✅ Build successful!"

# 7. Create logs directory
mkdir -p logs

# 7b. Fix permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR
sudo find $DEPLOY_DIR/build -type f -exec chmod 644 {} \;

# 8. Update Nginx config
echo "🌐 Updating Nginx configuration..."
sudo tee /etc/nginx/sites-available/lockmyfare > /dev/null << 'NGINX'
server {
    listen 80;
    listen [::]:80;

    root /var/www/lockmyfare/build;
    index index.html;

    server_name wegofare.com www.wegofare.com;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # React SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # Airline logos
    location /airlines {
        proxy_pass http://localhost:5001;
    }

    # Sitemap
    location /sitemap.xml {
        proxy_pass http://localhost:5001;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# 9. Enable site and reload Nginx
echo "🔄 Configuring Nginx..."
sudo rm -f /etc/nginx/sites-enabled/flight 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo ln -sf /etc/nginx/sites-available/lockmyfare /etc/nginx/sites-enabled/lockmyfare
sudo nginx -t
sudo systemctl reload nginx

# 10. Create .env for production
echo "📝 Setting up environment..."
cd $DEPLOY_DIR
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
MONGODB_URI=mongodb://localhost:27017/flight-booking
JWT_SECRET=$(openssl rand -hex 32)
CAPTCHA_ENABLED=false
EOF
    echo "✅ Created .env file (edit with your secrets later)"
fi

# 11. Start backend with PM2
echo "🚀 Starting backend..."
pm2 start ecosystem.config.js

# 12. Save PM2 and set startup
pm2 save
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

# 13. Verify deployment
echo ""
echo "🔍 Checking deployment status..."
pm2 status
echo ""
sleep 2
curl -sI http://localhost | head -5
echo ""

echo "✅ Deployment complete!"
echo ""
echo "Your site is now live at:"
echo "  - http://$DOMAIN"
echo "  - http://$VPS_IP"
echo ""
echo "Next steps:"
echo "  1. Point DNS A record for $DOMAIN → $VPS_IP"
echo "  2. Run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  3. Edit .env with your API keys"
echo ""
echo "Useful commands:"
echo "  pm2 logs $PM2_NAME    - View logs"
echo "  pm2 restart $PM2_NAME - Restart backend"
echo "  pm2 monit             - Monitor resources"
