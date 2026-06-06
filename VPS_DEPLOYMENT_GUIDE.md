# 🖥️ VPS Deployment Guide

Complete guide to deploy your Flight Booking Platform on a VPS (Virtual Private Server).

## 📋 Table of Contents

1. [VPS Provider Options](#vps-provider-options)
2. [Initial Server Setup](#initial-server-setup)
3. [Install Dependencies](#install-dependencies)
4. [MongoDB Setup](#mongodb-setup)
5. [Deploy Application](#deploy-application)
6. [Configure Nginx](#configure-nginx)
7. [SSL Certificate](#ssl-certificate)
8. [Process Manager (PM2)](#process-manager-pm2)
9. [Environment Variables](#environment-variables)
10. [Firewall Setup](#firewall-setup)
11. [Monitoring & Logs](#monitoring--logs)

---

## 🌐 VPS Provider Options

### Recommended Providers:

1. **DigitalOcean** (Recommended)
   - $4-6/month for basic droplet
   - Easy setup, great documentation
   - Website: https://digitalocean.com
   - Choose: Ubuntu 22.04 LTS, 1GB RAM, 25GB SSD

2. **Linode (Akamai)**
   - $5/month for Nanode
   - Excellent performance
   - Website: https://linode.com

3. **Vultr**
   - $3.50-6/month
   - Good global coverage
   - Website: https://vultr.com

4. **AWS Lightsail**
   - $3.50/month for smallest instance
   - Free 3 months trial
   - Website: https://aws.amazon.com/lightsail

5. **Hostinger VPS**
   - $4.99/month
   - Good for beginners
   - Website: https://hostinger.com

**What You Need:**
- OS: Ubuntu 22.04 LTS (recommended)
- RAM: Minimum 1GB (2GB recommended)
- Storage: 25GB SSD
- CPU: 1 vCPU minimum

---

## 🔧 Initial Server Setup

### Step 1: Connect to Your VPS

```bash
# Replace with your VPS IP address
ssh root@your_vps_ip

# Example:
ssh root@159.65.123.45
```

### Step 2: Create Non-Root User

```bash
# Create new user
adduser deploy

# Add to sudo group
usermod -aG sudo deploy

# Switch to new user
su - deploy
```

### Step 3: Setup SSH Key (Optional but Recommended)

On your **local machine**:
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096

# Copy public key
cat ~/.ssh/id_rsa.pub
```

On your **VPS**:
```bash
# Create .ssh directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key
nano ~/.ssh/authorized_keys
# Paste your public key, save (Ctrl+X, Y, Enter)

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

Now you can connect without password:
```bash
ssh deploy@your_vps_ip
```

---

## 📦 Install Dependencies

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js 18.x

```bash
# Install Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 3: Install Git

```bash
sudo apt install -y git
git --version
```

### Step 4: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl status nginx  # Should show "active (running)"
```

### Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 --version
```

---

## 🗄️ MongoDB Setup

### Option A: Install MongoDB Locally on VPS

```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod

# Create database and user
mongosh

# In MongoDB shell:
use flight-booking
db.createUser({
  user: "flightuser",
  pwd: "your_secure_password_here",
  roles: [{ role: "readWrite", db: "flight-booking" }]
})
exit
```

**MongoDB Connection String:**
```
mongodb://flightuser:your_secure_password_here@localhost:27017/flight-booking
```

### Option B: Use MongoDB Atlas (Recommended for Beginners)

1. Go to https://mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (or your VPS IP)
5. Get connection string

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/flight-booking
```

---

## 🚀 Deploy Application

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/rawatsachin9-arch/flight.git

# Navigate to project
cd flight
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd ~/flight/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Paste this configuration** (update with your values):
```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB (choose one option)
# Option A: Local MongoDB
MONGODB_URI=mongodb://flightuser:your_secure_password_here@localhost:27017/flight-booking

# Option B: MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flight-booking

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Amadeus API
AMADEUS_CLIENT_ID=oUHjs6hiAnCL5sREmsc4cy40GryqJdak
AMADEUS_CLIENT_SECRET=SCtAZgPEEIpnV4vq

# Sabre API (if you have credentials)
# SABRE_CLIENT_ID=your_sabre_client_id
# SABRE_CLIENT_SECRET=your_sabre_client_secret

# CORS (your domain)
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
```

Save: `Ctrl+X`, `Y`, `Enter`

**Generate JWT Secret:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output and paste as JWT_SECRET
```

### Step 3: Build Frontend

```bash
# Navigate to frontend
cd ~/flight

# Install dependencies
npm install

# Create production .env
nano .env.production
```

**Paste this:**
```env
REACT_APP_API_URL=http://your-domain.com/api
# Or if using IP: http://your_vps_ip/api
```

Save: `Ctrl+X`, `Y`, `Enter`

```bash
# Build frontend
npm run build

# This creates ~/flight/build folder with optimized files
```

### Step 4: Test Backend

```bash
cd ~/flight/backend
node server.js
```

You should see:
```
🚀 Server running on port 5000
✅ Connected to MongoDB
👤 WebSocket server initialized
```

Press `Ctrl+C` to stop.

---

## 🌐 Configure Nginx

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/flight
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    # Or use your VPS IP: server_name 159.65.123.45;

    # Frontend - Serve React build
    location / {
        root /home/deploy/flight/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for API calls
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket for live visitor tracking
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

**Important:** Replace `your-domain.com` with:
- Your actual domain (if you have one): `example.com`
- Or your VPS IP address: `159.65.123.45`

Save: `Ctrl+X`, `Y`, `Enter`

### Step 2: Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/flight /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Should show:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate (HTTPS)

### Install Certbot (Let's Encrypt)

**Only if you have a domain name:**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)

# Auto-renewal (already set up by Certbot)
sudo certbot renew --dry-run
```

**Update .env.production:**
```bash
nano ~/flight/.env.production
```

Change to HTTPS:
```env
REACT_APP_API_URL=https://your-domain.com/api
```

Rebuild frontend:
```bash
cd ~/flight
npm run build
```

---

## ⚙️ Process Manager (PM2)

### Start Backend with PM2

```bash
cd ~/flight/backend

# Start with PM2
pm2 start server.js --name flight-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it shows
```

### PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs flight-api

# Monitor resources
pm2 monit

# Restart
pm2 restart flight-api

# Stop
pm2 stop flight-api

# Delete
pm2 delete flight-api
```

---

## 🔥 Firewall Setup

### Configure UFW (Uncomplicated Firewall)

```bash
# Enable UFW
sudo ufw allow OpenSSH  # Allow SSH first!
sudo ufw allow 'Nginx Full'  # Allow HTTP & HTTPS
sudo ufw enable

# Check status
sudo ufw status

# Should show:
# To                         Action      From
# --                         ------      ----
# OpenSSH                    ALLOW       Anywhere
# Nginx Full                 ALLOW       Anywhere
```

---

## 📊 Monitoring & Logs

### View Application Logs

```bash
# PM2 logs
pm2 logs flight-api

# Only errors
pm2 logs flight-api --err

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs (if local)
sudo tail -f /var/log/mongodb/mongod.log
```

### Check System Resources

```bash
# CPU and Memory
htop
# Or
top

# Disk space
df -h

# PM2 monitoring
pm2 monit
```

---

## 🔄 Updating Your Application

### Pull Latest Changes from GitHub

```bash
# Stop backend
pm2 stop flight-api

# Navigate to project
cd ~/flight

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
pm2 restart flight-api

# Update frontend
cd ~/flight
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🧪 Testing Your Deployment

### Test API Endpoints

```bash
# Health check
curl http://your-domain.com/api/health

# Flight search
curl "http://your-domain.com/api/flights?from=NYC&to=LAX&date=2025-12-01"

# Hotels
curl "http://your-domain.com/api/hotels?destination=miami&checkIn=2025-12-01&checkOut=2025-12-05"
```

### Test Frontend

Open browser:
- `http://your-domain.com` - Homepage
- `http://your-domain.com/admin` - Admin panel
- `http://your-domain.com/flights` - Flight search

### Test Admin Login

- URL: `http://your-domain.com/admin/login`
- Email: `admin@flight.com`
- Password: `admin123`

**Change password immediately after first login!**

---

## 🚨 Troubleshooting

### Issue: Can't connect to server

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if backend is running
pm2 list

# Check firewall
sudo ufw status
```

### Issue: API calls failing

```bash
# Check backend logs
pm2 logs flight-api

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Test backend directly
curl http://localhost:5000/api/health
```

### Issue: MongoDB connection failed

```bash
# If local MongoDB
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -50 /var/log/mongodb/mongod.log

# If Atlas, check connection string in .env
```

### Issue: Frontend not loading

```bash
# Check build folder exists
ls -la ~/flight/build

# Rebuild if needed
cd ~/flight
npm run build

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: Port 5000 already in use

```bash
# Kill process on port 5000
sudo lsof -ti:5000 | xargs kill -9

# Restart PM2
pm2 restart flight-api
```

---

## 📈 Performance Optimization

### Enable HTTP/2 (after SSL setup)

```bash
sudo nano /etc/nginx/sites-available/flight
```

Change `listen 443 ssl;` to:
```nginx
listen 443 ssl http2;
```

### Increase PM2 Instances (for multi-core)

```bash
# Stop current instance
pm2 delete flight-api

# Start in cluster mode (uses all CPU cores)
pm2 start server.js --name flight-api -i max

pm2 save
```

### Setup Nginx Caching

Add to Nginx config:
```nginx
# Cache settings
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    
    # ... rest of proxy settings
}
```

---

## 🔐 Security Best Practices

### 1. Change Default Admin Password

Login to admin panel and change password immediately.

### 2. Setup Fail2Ban (Prevent Brute Force)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates

```bash
# Weekly updates
sudo apt update && sudo apt upgrade -y

# Update Node packages
cd ~/flight/backend && npm update
cd ~/flight && npm update
```

### 4. Backup Database

```bash
# Create backup script
nano ~/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://flightuser:password@localhost:27017/flight-booking" --out=/home/deploy/backups/mongo_$DATE
tar -czf /home/deploy/backups/mongo_$DATE.tar.gz /home/deploy/backups/mongo_$DATE
rm -rf /home/deploy/backups/mongo_$DATE
find /home/deploy/backups -name "mongo_*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add:
```
0 2 * * * /home/deploy/backup.sh
```

---

## 📞 Quick Command Reference

```bash
# Restart everything
pm2 restart flight-api
sudo systemctl reload nginx

# View logs
pm2 logs flight-api
sudo tail -f /var/log/nginx/error.log

# Update application
cd ~/flight && git pull
cd backend && npm install && pm2 restart flight-api
cd ~/flight && npm install && npm run build

# System monitoring
pm2 monit
htop
df -h

# Firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

---

## 🎉 Deployment Complete!

Your website is now live at:
- **Website**: `http://your-domain.com` or `http://your_vps_ip`
- **Admin Panel**: `http://your-domain.com/admin`
- **API**: `http://your-domain.com/api`

### Next Steps:

1. ✅ Change admin password
2. ✅ Setup SSL certificate (if using domain)
3. ✅ Configure backup script
4. ✅ Monitor logs and resources
5. ✅ Share your website!

---

## 📚 Resources

- **Nginx Docs**: https://nginx.org/en/docs/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **MongoDB Docs**: https://docs.mongodb.com/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **Ubuntu Server Guide**: https://ubuntu.com/server/docs

**Estimated Deployment Time: 30-60 minutes**

**Need help? Check logs with `pm2 logs` and `sudo tail -f /var/log/nginx/error.log`**
