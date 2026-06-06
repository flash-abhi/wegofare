# Deploying Flight Booking Website to Hostinger

## Prerequisites
- Hostinger account with hosting plan (Premium or Business plan recommended)
- SSH access enabled on your Hostinger account
- Domain name configured in Hostinger

## Deployment Architecture
Since Hostinger doesn't support separate backend services like Render, we'll deploy both frontend and backend together:
- **Frontend**: React build files served as static HTML/CSS/JS
- **Backend**: Node.js Express API running on Hostinger's Node.js hosting

---

## Step 1: Set Up MongoDB Database

### Option A: MongoDB Atlas (Recommended - Free Tier Available)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Create database user (username + password)
4. Whitelist all IPs (0.0.0.0/0) for Hostinger access
5. Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/flight-booking`

### Option B: Hostinger MongoDB (If available in your plan)
1. Log in to Hostinger hPanel
2. Go to Databases → MongoDB
3. Create new database
4. Note connection details

---

## Step 2: Prepare Files for Upload

### A. Update Frontend API URL
1. Edit `.env.production` file with your domain:
   ```
   REACT_APP_API_URL=https://yourdomain.com/api
   ```

2. Rebuild frontend with production settings:
   ```bash
   npm run build
   ```

### B. Update Backend for Production
The backend is already configured to use environment variables.

---

## Step 3: Deploy to Hostinger

### Method 1: Using Hostinger File Manager (Easier)

1. **Log in to Hostinger hPanel**
   - Go to https://hpanel.hostinger.com

2. **Navigate to File Manager**
   - Click on "File Manager" in your hosting plan

3. **Upload Backend Files**
   - Go to `public_html` directory (or your domain's root folder)
   - Create a new folder called `api`
   - Upload ALL backend files to `public_html/api/`:
     - `server.js`
     - `package.json`
     - `.env` (with your credentials)
     - Entire `routes/` folder
     - Entire `models/` folder
     - Entire `middleware/` folder
     - Entire `utils/` folder
     - Entire `data/` folder

4. **Upload Frontend Files**
   - In `public_html` directory (root)
   - Upload ALL files from the `build/` folder:
     - `index.html`
     - `static/` folder (contains CSS and JS)
     - `asset-manifest.json`
     - `manifest.json`
     - `robots.txt`
     - `favicon.ico`

5. **Install Node.js Dependencies**
   - In hPanel, go to "Advanced" → "SSH Access"
   - Enable SSH access and note credentials
   - Connect via SSH (see Method 2 for commands)
   - Run:
     ```bash
     cd public_html/api
     npm install
     ```

6. **Set Up Environment Variables in Hostinger**
   - Edit `.env` file in `public_html/api/` with your credentials:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flight-booking
     AMADEUS_CLIENT_ID=oUHjs6hiAnCL5sREmsc4cy40GryqJdak
     AMADEUS_CLIENT_SECRET=SCtAZgPEEIpnV4vq
     SABRE_CLIENT_ID=V1:bgpam8t1f59rztux:DEVCENTER:EXT
     SABRE_CLIENT_SECRET=your-complete-secret-here
     SABRE_REST_API_URL=https://api-crt.cert.havail.sabre.com
     PORT=5000
     NODE_ENV=production
     ```

7. **Configure Node.js Application**
   - In hPanel, go to "Advanced" → "Node.js"
   - Click "Create Application"
   - Set:
     - **Node.js version**: 18.x or latest
     - **Application mode**: Production
     - **Application root**: `api`
     - **Application startup file**: `server.js`
     - **Port**: 5000 (or auto-assigned)

8. **Set Up Reverse Proxy**
   - Create/edit `.htaccess` file in `public_html`:
     ```apache
     # Redirect API calls to Node.js backend
     RewriteEngine On
     RewriteCond %{REQUEST_URI} ^/api
     RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
     
     # Serve React app for all other routes
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^ index.html [L]
     ```

---

### Method 2: Using SSH/FTP (Advanced)

1. **Enable SSH Access**
   - In hPanel → Advanced → SSH Access
   - Enable SSH and note: hostname, port, username, password

2. **Connect via SSH**
   ```bash
   ssh username@your-hostname -p port
   ```

3. **Navigate to web directory**
   ```bash
   cd domains/yourdomain.com/public_html
   ```

4. **Clone/Upload Your Project**
   
   Option A - Using Git:
   ```bash
   # Backend
   mkdir api && cd api
   git clone https://github.com/rawatsachin9-arch/flight.git temp
   mv temp/backend/* .
   rm -rf temp
   npm install
   
   # Frontend
   cd ..
   git clone https://github.com/rawatsachin9-arch/flight.git temp
   mv temp/build/* .
   rm -rf temp
   ```
   
   Option B - Using SCP from your local machine:
   ```bash
   # Upload backend
   scp -P port -r backend/* username@hostname:~/domains/yourdomain.com/public_html/api/
   
   # Upload frontend build
   scp -P port -r build/* username@hostname:~/domains/yourdomain.com/public_html/
   ```

5. **Install Dependencies**
   ```bash
   cd ~/domains/yourdomain.com/public_html/api
   npm install --production
   ```

6. **Configure Environment**
   ```bash
   nano .env
   # Add all environment variables (see Step 3.6 above)
   # Save: Ctrl+O, Enter, Ctrl+X
   ```

7. **Start Node.js Application**
   - Use Hostinger's Node.js manager in hPanel (recommended)
   - OR use PM2:
     ```bash
     npm install -g pm2
     pm2 start server.js --name flight-api
     pm2 startup
     pm2 save
     ```

---

## Step 4: Configure Domain and SSL

1. **Point Domain to Hostinger** (if not already)
   - In your domain registrar, update nameservers to Hostinger's
   - OR update A record to point to Hostinger's IP

2. **Enable SSL Certificate**
   - In hPanel → SSL → Manage
   - Install free Let's Encrypt SSL certificate
   - Enable "Force HTTPS"

3. **Update Frontend API URL**
   - After deployment, edit `.env.production`:
     ```
     REACT_APP_API_URL=https://yourdomain.com/api
     ```
   - Rebuild and re-upload frontend:
     ```bash
     npm run build
     # Upload build/* files again
     ```

---

## Step 5: Verify Deployment

1. **Test Backend API**
   - Visit: `https://yourdomain.com/api/health`
   - Should return: `{"status":"healthy"}`

2. **Test Frontend**
   - Visit: `https://yourdomain.com`
   - Should load the flight booking homepage

3. **Test Full Flow**
   - Search for flights
   - Check browser console for API calls
   - Verify results load correctly

---

## Directory Structure on Hostinger

```
public_html/
├── api/                          # Backend (Node.js)
│   ├── server.js
│   ├── package.json
│   ├── .env                      # Environment variables
│   ├── routes/
│   │   ├── flights.js
│   │   ├── hotels.js
│   │   ├── packages.js
│   │   └── cruises.js
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   │   └── sabreClient.js
│   └── data/
├── index.html                    # Frontend (React build)
├── static/
│   ├── css/
│   └── js/
├── .htaccess                     # URL rewriting rules
└── Other frontend build files
```

---

## Troubleshooting

### Issue: API calls returning 404
**Solution**: Check `.htaccess` rewrite rules are configured correctly

### Issue: Node.js app not starting
**Solution**: 
- Check Node.js version compatibility (use 18.x)
- Verify `server.js` path in Node.js settings
- Check error logs in hPanel → Node.js → Application logs

### Issue: Database connection failed
**Solution**: 
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format in `.env`
- Test connection string with MongoDB Compass

### Issue: CORS errors
**Solution**: Already configured in `server.js` with:
```javascript
app.use(cors({ origin: '*' }));
```

### Issue: Frontend showing old cached version
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Or add cache-busting to `.htaccess`:
  ```apache
  <FilesMatch "\.(html|htm|js|css)$">
    FileETag None
    Header unset ETag
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
  </FilesMatch>
  ```

---

## Alternative: Deploy Backend Elsewhere

If Hostinger's Node.js hosting is limited, you can:

1. **Deploy Backend to Railway/Render**
   - Keep backend on free cloud service
   - Update `.env.production` to point to cloud backend:
     ```
     REACT_APP_API_URL=https://your-backend.railway.app/api
     ```

2. **Deploy Only Frontend to Hostinger**
   - Upload only `build/*` files to `public_html`
   - No Node.js setup needed
   - Just static file hosting

---

## Important Notes

1. **Keep `.env` file secure** - Never commit real credentials to Git
2. **MongoDB Atlas Free Tier**: 512 MB storage, perfect for starting
3. **Hostinger Node.js**: Check if your plan supports Node.js hosting
4. **Domain Propagation**: DNS changes can take 24-48 hours
5. **Sabre Credentials**: Complete the secret when available for full GDS functionality

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Hostinger Node.js application set up
- [ ] All environment variables added to `.env`
- [ ] Frontend built with production API URL
- [ ] Backend files uploaded to `public_html/api/`
- [ ] Frontend build files uploaded to `public_html/`
- [ ] `.htaccess` configured for routing
- [ ] SSL certificate installed and forced HTTPS
- [ ] Domain pointing to Hostinger
- [ ] Backend API responding at `/api/*`
- [ ] Frontend loading at domain root
- [ ] Flight search working end-to-end
- [ ] Hotel search working
- [ ] Package search working
- [ ] Cruise search working

---

## Support Resources

- **Hostinger Support**: https://www.hostinger.com/tutorials/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Your GitHub Repo**: https://github.com/rawatsachin9-arch/flight

Good luck with your deployment! 🚀
