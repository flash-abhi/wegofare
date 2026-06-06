# VPS Deployment Guide - Flight Booking Application

## Prerequisites on VPS
- Ubuntu/Debian Linux
- Root or sudo access
- Domain name (optional but recommended)

## Step 1: Initial VPS Setup

### Connect to your VPS
```bash
ssh root@your-vps-ip
# or
ssh user@your-vps-ip
```

### Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (v18 or higher)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v18+
npm --version
```

### Install Git
```bash
sudo apt install -y git
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx (Web Server)
```bash
sudo apt install -y nginx
```

## Step 2: Clone Your Repository

### Create application directory
```bash
sudo mkdir -p /var/www
cd /var/www
```

### Clone your repository
```bash
sudo git clone https://github.com/rawatsachin9-arch/flight.git
cd flight
```

### Set proper permissions
```bash
sudo chown -R $USER:$USER /var/www/flight
```

## Step 3: Configure Environment Variables

### Create .env file
```bash
cd /var/www/flight
nano .env
```

### Add your environment variables
```env
# Amadeus API Credentials
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_ENV=production

# Sabre API Credentials (if using)
SABRE_CLIENT_ID=your_sabre_client_id
SABRE_CLIENT_SECRET=your_sabre_client_secret
SABRE_ENV=production

# Server Configuration
PORT=5001
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 4: Install Dependencies

### Install backend dependencies
```bash
cd /var/www/flight
npm install
```

### Build React frontend
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Step 5: Configure PM2

### Start backend server with PM2
```bash
pm2 start server.js --name flight-backend
```

### Configure PM2 to start on system reboot
```bash
pm2 startup
# Copy and run the command it outputs
pm2 save
```

### Check PM2 status
```bash
pm2 status
pm2 logs flight-backend
```

### Useful PM2 commands
```bash
pm2 restart flight-backend   # Restart app
pm2 stop flight-backend       # Stop app
pm2 delete flight-backend     # Remove from PM2
pm2 monit                     # Monitor in real-time
```

## Step 6: Configure Nginx

### Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/flight
```

### Add this configuration:

#### Option A: Without Domain (using IP only)
```nginx
server {
    listen 80;
    server_name your-vps-ip;

    # Frontend (React build)
    root /var/www/flight/build;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io support
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Airline logos
    location /airlines/ {
        proxy_pass http://localhost:5001;
    }
}
```

#### Option B: With Domain Name
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    root /var/www/flight/build;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io support
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Airline logos
    location /airlines/ {
        proxy_pass http://localhost:5001;
    }
}
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/flight /etc/nginx/sites-enabled/
```

### Remove default Nginx site
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Test Nginx configuration
```bash
sudo nginx -t
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

## Step 7: Configure Firewall

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for SSL later)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 8: Setup SSL/HTTPS (Recommended)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Set up auto-renewal

### Test auto-renewal
```bash
sudo certbot renew --dry-run
```

## Step 9: Update Backend API URL

### Update API base URL in React app
```bash
nano /var/www/flight/src/config.js
```

Create or update with your domain:
```javascript
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:5001'
};

export default config;
```

### Rebuild the app
```bash
npm run build
```

## Step 10: Deploy Updates

### Create deployment script
```bash
nano /var/www/flight/deploy.sh
```

Add this content:
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/flight

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
pm2 restart flight-backend

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌍 Your app is live at: http://$(curl -s ifconfig.me)"
```

### Make it executable
```bash
chmod +x /var/www/flight/deploy.sh
```

### Run deployment
```bash
./deploy.sh
```

## Quick Reference Commands

### Deploy updates
```bash
cd /var/www/flight && ./deploy.sh
```

### View backend logs
```bash
pm2 logs flight-backend
```

### Restart backend
```bash
pm2 restart flight-backend
```

### Check Nginx status
```bash
sudo systemctl status nginx
```

### View Nginx error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check if app is running
```bash
curl http://localhost:5001/api/flights?from=JFK&to=LAX&date=2025-12-15&passengers=1
```

## Troubleshooting

### Backend not starting
```bash
# Check PM2 logs
pm2 logs flight-backend --lines 50

# Check if port is in use
sudo lsof -i :5001

# Restart PM2
pm2 restart flight-backend
```

### Nginx issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Build errors
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API not responding
```bash
# Check environment variables
cat /var/www/flight/.env

# Test backend directly
curl http://localhost:5001/api/flights?from=JFK&to=LAX&date=2025-12-15&passengers=1

# Check if backend is running
pm2 status
```

## Security Best Practices

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use strong passwords**
3. **Enable automatic security updates**
4. **Use SSH keys instead of passwords**
5. **Keep .env file secure**
   ```bash
   chmod 600 /var/www/flight/.env
   ```

6. **Regular backups**
7. **Monitor logs regularly**
8. **Use HTTPS (SSL)**

## Monitoring

### Set up PM2 monitoring
```bash
pm2 install pm2-logrotate
```

### Monitor server resources
```bash
# Install htop
sudo apt install htop

# Run htop
htop
```

## Your App is Live! 🎉

- **Frontend**: http://your-vps-ip or https://yourdomain.com
- **Backend API**: http://your-vps-ip/api or https://yourdomain.com/api

## Support

For issues or questions:
1. Check PM2 logs: `pm2 logs flight-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Review this deployment guide
