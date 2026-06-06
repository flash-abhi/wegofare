# 🔧 MongoDB Installation Fix for Ubuntu 22.04

MongoDB installation often fails on Ubuntu 22.04 due to libssl dependency issues. Here are **3 working solutions**.

---

## ✅ Solution 1: Install MongoDB 7.0 (Recommended)

This is the easiest and most reliable method:

```bash
# Step 1: Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Step 2: Add MongoDB 7.0 repository for Ubuntu 22.04 (Jammy)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Step 3: Update package list
sudo apt update

# Step 4: Install MongoDB 7.0
sudo apt install -y mongodb-org

# Step 5: Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Step 6: Verify installation
sudo systemctl status mongod

# Should show: active (running)
```

---

## ✅ Solution 2: Install MongoDB 6.0 (Alternative)

If MongoDB 7.0 doesn't work, try version 6.0:

```bash
# Clean up any previous attempts
sudo apt remove --purge mongodb-org* -y
sudo rm -rf /var/log/mongodb
sudo rm -rf /var/lib/mongodb
sudo rm /etc/apt/sources.list.d/mongodb*.list

# Install MongoDB 6.0
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
   sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update
sudo apt install -y mongodb-org

# Start and enable
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

---

## ✅ Solution 3: Use MongoDB Atlas (Cloud - No Installation Needed)

**Best option if installation keeps failing!**

### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free - no credit card required)
3. Verify email

### Step 2: Create Free Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select cloud provider: **AWS**
4. Region: Choose closest to your VPS (e.g., US East, EU West)
5. Cluster name: `flight-booking`
6. Click **"Create"**
7. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. Click **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Authentication: **Username and Password**
4. Username: `flightuser`
5. Password: Click **"Autogenerate Secure Password"** (SAVE THIS!)
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### Step 4: Whitelist IP Address

1. Click **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Confirm: `0.0.0.0/0` appears
5. Click **"Confirm"**

### Step 5: Get Connection String

1. Click **"Database"** (left menu)
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://flightuser:<password>@flight-booking.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from Step 3

### Step 6: Test Connection from VPS

```bash
# Install MongoDB Shell (mongosh) to test
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-mongosh

# Test connection (replace with your connection string)
mongosh "mongodb+srv://flightuser:YOUR_PASSWORD@flight-booking.xxxxx.mongodb.net/"

# If successful, you'll see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb+srv://...
# Atlas atlas-xxxxx-shard-0 [primary]>

# Type 'exit' to quit
exit
```

---

## 🔧 Troubleshooting MongoDB Installation

### Error: "Unable to locate package mongodb-org"

**Fix:**
```bash
# Check if repository was added correctly
ls -la /etc/apt/sources.list.d/mongodb*

# Should show: mongodb-org-7.0.list or mongodb-org-6.0.list

# If not there, re-run the repository setup commands

# Also try updating again
sudo apt update
```

### Error: "Depends: libssl1.1 but it is not installable"

This happens on Ubuntu 22.04 which uses libssl3. **Use MongoDB 6.0+ or Atlas instead**.

**Quick fix - Install libssl1.1 manually:**
```bash
# Download libssl1.1
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Install it
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Now try installing MongoDB again
sudo apt install -y mongodb-org
```

### Error: "Failed to start mongod.service"

**Fix:**
```bash
# Check the logs
sudo journalctl -u mongod -n 50

# Common fix - Create data directory
sudo mkdir -p /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb

# Create log directory
sudo mkdir -p /var/log/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb

# Restart
sudo systemctl restart mongod
```

### Error: "mongod: unrecognized service"

**Fix:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable and start
sudo systemctl enable mongod
sudo systemctl start mongod
```

---

## 🎯 Which Solution Should You Use?

| Solution | Pros | Cons | Recommended For |
|----------|------|------|-----------------|
| **MongoDB 7.0** | Latest features, fast | May have compatibility issues | Most users |
| **MongoDB 6.0** | Stable, proven | Slightly older | If 7.0 fails |
| **MongoDB Atlas** | No installation, managed, free tier | Requires internet | **Best for beginners** |

**My Recommendation:** Try Solution 1 (MongoDB 7.0), if it fails go directly to **Solution 3 (MongoDB Atlas)** - it's easier and free!

---

## 📝 Update Your Backend .env File

### If using LOCAL MongoDB (Solution 1 or 2):

```bash
cd ~/flight/backend
nano .env
```

Add:
```env
MONGODB_URI=mongodb://localhost:27017/flight-booking
```

### If using MongoDB Atlas (Solution 3):

```bash
cd ~/flight/backend
nano .env
```

Add (replace with your connection string):
```env
MONGODB_URI=mongodb+srv://flightuser:YOUR_PASSWORD@flight-booking.xxxxx.mongodb.net/flight-booking?retryWrites=true&w=majority
```

**Important:** Make sure to:
1. Replace `YOUR_PASSWORD` with actual password
2. Add `/flight-booking` before the `?` in the connection string
3. No spaces in the connection string

---

## ✅ Verify MongoDB is Working

### For Local MongoDB:

```bash
# Check MongoDB status
sudo systemctl status mongod

# Should show: active (running)

# Connect to MongoDB
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Using MongoDB: 7.0.x
# test>

# Create your database
use flight-booking

# Create a test document
db.test.insertOne({ message: "MongoDB works!" })

# Verify
db.test.find()

# Exit
exit
```

### For MongoDB Atlas:

```bash
# Test connection
mongosh "mongodb+srv://flightuser:YOUR_PASSWORD@flight-booking.xxxxx.mongodb.net/"

# You should see:
# Atlas atlas-xxxxx-shard-0 [primary]>

# Switch to your database
use flight-booking

# Create test
db.test.insertOne({ message: "Atlas works!" })

# Verify
db.test.find()

# Exit
exit
```

---

## 🚀 Continue VPS Deployment

Once MongoDB is working, continue with the VPS deployment:

```bash
# Test your backend with MongoDB
cd ~/flight/backend
node server.js

# You should see:
# 🚀 Server running on port 5000
# ✅ Connected to MongoDB
```

Press `Ctrl+C` to stop, then continue with PM2 setup from the VPS_DEPLOYMENT_GUIDE.md.

---

## 💡 Quick Command Summary

### Complete Fresh Install (MongoDB 7.0):

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### If Installation Fails - Use Atlas:

1. Go to https://mongodb.com/cloud/atlas
2. Create free account
3. Create M0 free cluster
4. Create database user and save password
5. Whitelist 0.0.0.0/0
6. Copy connection string
7. Update backend/.env with connection string

---

**Need more help? Share the exact error message you're getting!**
