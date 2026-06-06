# Google Search Console Live Integration Setup Guide

## Overview

This guide will help you set up **live Google Search Console (GSC)** integration for wegofare.com. Once configured, you'll get **real-time data** from Google Search Console directly in your admin dashboard.

## Prerequisites

- Google Search Console account
- Your website verified in GSC (https://search.google.com/search-console)
- Google Cloud Console account
- Admin access to your backend server

---

## Step 1: Verify Website in Google Search Console

1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Enter your website: `https://wegofare.com`
4. Choose verification method:
   - **DNS verification** (recommended)
   - **HTML file upload**
   - **HTML tag**
   - **Google Analytics**
5. Complete verification process

---

## Step 2: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Project name: `skyfaretravels GSC`
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Search Console API"
   - Click on it and press "Enable"
   - Also enable "Google Indexing API" (optional, for URL submission)

---

## Step 3: Create OAuth 2.0 Credentials

1. **Go to Credentials Page**
   - Navigate to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth Consent Screen** (if prompted)
   - User Type: Choose "External"
   - App name: `skyfaretravels Admin`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip for now (click "Save and Continue")
   - Test users: Add your email
   - Click "Save and Continue"

3. **Create OAuth Client ID**
   - Application type: **Web application**
   - Name: `skyfaretravels GSC Client`
   
4. **Add Authorized Redirect URIs**
   
   **For Development (localhost):**
   ```
   http://localhost:5001/api/gsc/oauth2callback
   ```
   
   **For Production (VPS):**
   ```
   https://wegofare.com/api/gsc/oauth2callback
   http://164.92.122.115:5001/api/gsc/oauth2callback
   ```
   
5. **Click "Create"**
   - You'll see your Client ID and Client Secret
   - **IMPORTANT**: Copy these values immediately

---

## Step 4: Configure Environment Variables

1. **Edit your `.env` file**
   ```bash
   cd /Users/sachinrawat/Desktop/N/flight/backend
   nano .env
   ```

2. **Add Google Credentials**
   ```env
   # Google Search Console Configuration
   GSC_SITE_URL=https://wegofare.com
   
   # Replace with your actual values from Google Cloud Console
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678ijkl
   GOOGLE_REDIRECT_URI=http://localhost:5001/api/gsc/oauth2callback
   ```

3. **For Production VPS, use production URL:**
   ```env
   GOOGLE_REDIRECT_URI=https://wegofare.com/api/gsc/oauth2callback
   ```

4. **Save and exit** (Ctrl+X, Y, Enter)

---

## Step 5: Restart Backend Server

```bash
cd /Users/sachinrawat/Desktop/N/flight/backend
pkill -9 node
npm run dev
```

Or if using PM2 on VPS:
```bash
pm2 restart all
```

---

## Step 6: Connect GSC in Admin Dashboard

1. **Login to Admin Panel**
   - Go to: http://localhost:3000/admin/login
   - Email: `info@wegofare.com`
   - Password: `admin123`

2. **Navigate to SEO Tab**
   - Click "SEO" in sidebar
   - Click "Search Console" tab

3. **Click "Connect to Google Search Console"**
   - A Google OAuth login window will open
   - Sign in with the Google account that owns the Search Console property
   - Grant permissions to the app
   - You'll be redirected back to the dashboard

4. **View Real-Time Data**
   - After connecting, click "Refresh Data"
   - You'll see:
     - Total clicks
     - Total impressions
     - Average CTR
     - Average position
     - Top 10 queries
     - Top 10 pages
     - Traffic by country
     - Traffic by device

---

## What Data You'll Get

### Performance Metrics (Last 28 Days)
- **Total Clicks**: How many times users clicked your site in search results
- **Total Impressions**: How many times your site appeared in search results
- **CTR (Click-Through Rate)**: Percentage of impressions that resulted in clicks
- **Average Position**: Your average ranking position in search results

### Top Queries
- Search terms that brought traffic to your site
- Individual clicks, impressions, CTR, and position for each query

### Top Pages
- Your pages that appear most in search results
- Performance metrics for each page

### Geographic Data
- Traffic breakdown by country
- Top 5 countries with most clicks

### Device Data
- Traffic breakdown by device type (Mobile, Desktop, Tablet)

### Sitemaps
- List of submitted sitemaps
- Submission status and errors

---

## Troubleshooting

### Error: "Not configured"
**Solution**: Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`

### Error: "redirect_uri_mismatch"
**Solution**: 
1. Check that your redirect URI in `.env` matches exactly what's in Google Cloud Console
2. Make sure to include the port number (e.g., `:5001`)
3. No trailing slashes

### Error: "Access denied"
**Solution**:
1. Make sure you're signed in with the Google account that owns the Search Console property
2. Grant all requested permissions during OAuth flow
3. Add your email as a test user in OAuth consent screen

### Error: "Invalid credentials"
**Solution**:
1. Double-check Client ID and Secret in `.env`
2. Make sure there are no extra spaces or quotes
3. Recreate OAuth credentials if needed

### No Data Showing
**Solution**:
1. Make sure your website has been verified in Search Console
2. Wait 24-48 hours after verification for data to populate
3. Check that the site URL in GSC matches exactly: `https://wegofare.com`

---

## Security Best Practices

1. **Keep Credentials Secret**
   - Never commit `.env` to git
   - Add `.env` to `.gitignore`
   - Use different credentials for dev and production

2. **Rotate Credentials Regularly**
   - Generate new OAuth credentials every 6 months
   - Delete old credentials from Google Cloud Console

3. **Limit Scopes**
   - Only request necessary permissions
   - Use read-only scope when possible

4. **Monitor Access**
   - Check OAuth consent screen for authorized users
   - Review access logs in Google Cloud Console

---

## Production Deployment

When deploying to VPS:

1. **Update Redirect URI**
   ```env
   GOOGLE_REDIRECT_URI=https://wegofare.com/api/gsc/oauth2callback
   ```

2. **Add Production URI to Google Cloud**
   - Go to OAuth credentials
   - Add `https://wegofare.com/api/gsc/oauth2callback`

3. **Use Environment Variables**
   - Don't hardcode credentials
   - Use secure environment variable management

4. **Enable HTTPS**
   - Google requires HTTPS for OAuth in production
   - Set up SSL certificate (Let's Encrypt)

---

## API Limits

Google Search Console API has these limits:

- **Queries per day**: 1,200
- **Queries per minute**: 60
- **Rows per query**: 25,000

The dashboard refreshes data when you click "Refresh", so you won't hit limits with normal usage.

---

## Testing

1. **Check Connection Status**
   ```bash
   curl http://localhost:5001/api/gsc/status \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

2. **Test Performance Data**
   ```bash
   curl http://localhost:5001/api/gsc/performance \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **Test Sitemaps**
   ```bash
   curl http://localhost:5001/api/gsc/sitemaps \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

---

## Support

- **Google Cloud Console**: https://console.cloud.google.com/
- **Search Console Help**: https://support.google.com/webmasters/
- **OAuth 2.0 Docs**: https://developers.google.com/identity/protocols/oauth2

For issues with this integration, check:
- Backend logs: `npm run dev` output
- Browser console: F12 → Console tab
- Network tab: Check API responses

---

## VPS / Production Deployment

### Important: Update Redirect URI for Production

When deploying to your VPS (production), you MUST update the redirect URI:

**1. Update Google Cloud Console:**
```
Go to: https://console.cloud.google.com/apis/credentials
Select your OAuth 2.0 Client ID
Under "Authorized redirect URIs", ADD:
  https://wegofare.com/api/gsc/oauth2callback

Keep the localhost URI for development:
  http://localhost:5001/api/gsc/oauth2callback
```

**2. Update VPS .env file:**
```bash
ssh root@164.92.122.115
cd /var/www/flight/backend
nano .env

# Change this line:
GOOGLE_REDIRECT_URI=https://wegofare.com/api/gsc/oauth2callback

# Save and exit (Ctrl+X, Y, Enter)
```

**3. Restart Backend:**
```bash
pm2 restart backend
# or
pm2 restart all
```

**4. Test Connection:**
- Go to: https://wegofare.com/admin/dashboard
- Click SEO tab
- Click "Connect Google Search Console"
- Authorize with your Google account
- You should now see live data!

### Common VPS Issues:

**Issue 1: "Redirect URI mismatch"**
- Solution: Make sure GOOGLE_REDIRECT_URI in .env matches exactly what's in Google Cloud Console
- Check: No trailing slashes, correct protocol (https), correct domain

**Issue 2: "Connection timeout"**
- Solution: Check if backend port 5001 is accessible
- Run: `pm2 logs backend` to see errors
- Verify nginx proxy is forwarding `/api/gsc/*` correctly

**Issue 3: "CORS error"**
- Solution: Check nginx configuration allows OAuth callback
- Backend should have CORS enabled for your domain

**Issue 4: ".env not loading"**
- Solution: Make sure .env is in `/var/www/flight/backend/` directory
- Check file permissions: `chmod 600 .env`
- Verify pm2 is starting from correct directory

### Verify Setup on VPS:

```bash
# 1. Check .env file
cat /var/www/flight/backend/.env | grep GOOGLE

# Should show:
# GOOGLE_CLIENT_ID=233092646892-...
# GOOGLE_CLIENT_SECRET=GOCSPX-...
# GOOGLE_REDIRECT_URI=https://wegofare.com/api/gsc/oauth2callback

# 2. Check backend is running
pm2 status

# 3. Test GSC route
curl http://localhost:5001/api/gsc/status

# 4. Check logs
pm2 logs backend --lines 50
```

---

## Summary

Once set up, you'll have:
- ✅ Real-time search performance data
- ✅ Top performing queries and pages
- ✅ Geographic and device insights
- ✅ Sitemap status monitoring
- ✅ All data refreshable from admin dashboard

**Total Setup Time**: ~15 minutes

**Next Steps**:
1. Create Google Cloud project
2. Enable Search Console API
3. Create OAuth credentials
4. Add credentials to `.env`
5. Restart server
6. Connect in admin dashboard
7. View your live data! 🎉
