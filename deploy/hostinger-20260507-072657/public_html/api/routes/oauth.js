const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * OAuth Helper Routes
 * Handles OAuth flows for platform integrations
 */

// Store tokens temporarily (in production, use database)
const tokenStore = {};

// Verify admin token middleware
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.adminId = decoded.id || decoded.admin?.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * GET /api/oauth/google/auth-url
 * Get Google OAuth authorization URL
 */
router.get('/google/auth-url', verifyAdminToken, (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.SITE_URL || 'https://wegofare.com'}/api/oauth/google/callback`;
  
  const scopes = [
    'https://www.googleapis.com/auth/blogger',
    'https://www.googleapis.com/auth/blogger.readonly'
  ].join(' ');
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.json({ 
    success: true, 
    authUrl,
    message: 'Open this URL in your browser to authorize Blogger access'
  });
});

/**
 * GET /api/oauth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`<html><body><h1>Authorization Failed</h1><p>${error}</p></body></html>`);
  }
  
  if (!code) {
    return res.send('<html><body><h1>No authorization code received</h1></body></html>');
  }
  
  try {
    const redirectUri = `${process.env.SITE_URL || 'https://wegofare.com'}/api/oauth/google/callback`;
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store tokens
    tokenStore.google = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    };
    
    // Get user's blogs
    const blogsResponse = await axios.get('https://www.googleapis.com/blogger/v3/users/self/blogs', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    const blogs = blogsResponse.data.items || [];
    
    // Save to env file
    const fs = require('fs');
    const envPath = '/var/www/flight/.env';
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    // Update or add tokens
    if (!envContent.includes('BLOGGER_ACCESS_TOKEN')) {
      envContent += `\nBLOGGER_ACCESS_TOKEN=${access_token}`;
    }
    if (refresh_token && !envContent.includes('BLOGGER_REFRESH_TOKEN')) {
      envContent += `\nBLOGGER_REFRESH_TOKEN=${refresh_token}`;
    }
    if (blogs.length > 0 && !envContent.includes('BLOGGER_BLOG_ID')) {
      envContent += `\nBLOGGER_BLOG_ID=${blogs[0].id}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    res.send(`
      <html>
      <head><title>Blogger Connected!</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
        <h1 style="color: green;">✅ Blogger Connected Successfully!</h1>
        <p>Your Blogger account has been connected.</p>
        <h3>Your Blogs:</h3>
        <ul>
          ${blogs.map(b => `<li><strong>${b.name}</strong> - ID: ${b.id}</li>`).join('')}
        </ul>
        <p>Access Token saved. You can now close this window and use the Backlink AI.</p>
        <p><a href="/admin">Go to Admin Dashboard</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    res.send(`
      <html>
      <body>
        <h1>Authorization Error</h1>
        <p>${error.response?.data?.error_description || error.message}</p>
        <pre>${JSON.stringify(error.response?.data, null, 2)}</pre>
      </body>
      </html>
    `);
  }
});

/**
 * GET /api/oauth/google/status
 * Check Google OAuth status
 */
router.get('/google/status', verifyAdminToken, (req, res) => {
  const hasToken = !!process.env.BLOGGER_ACCESS_TOKEN;
  const hasBlogId = !!process.env.BLOGGER_BLOG_ID;
  
  res.json({
    success: true,
    connected: hasToken && hasBlogId,
    hasAccessToken: hasToken,
    hasBlogId: hasBlogId,
    blogId: process.env.BLOGGER_BLOG_ID || null
  });
});

/**
 * POST /api/oauth/google/refresh
 * Refresh Google access token
 */
router.post('/google/refresh', verifyAdminToken, async (req, res) => {
  const refreshToken = process.env.BLOGGER_REFRESH_TOKEN;
  
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'No refresh token available' });
  }
  
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    
    const { access_token, expires_in } = response.data;
    
    // Update env file
    const fs = require('fs');
    const envPath = '/var/www/flight/.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/BLOGGER_ACCESS_TOKEN=.*/g, `BLOGGER_ACCESS_TOKEN=${access_token}`);
    fs.writeFileSync(envPath, envContent);
    
    // Update process.env
    process.env.BLOGGER_ACCESS_TOKEN = access_token;
    
    res.json({ 
      success: true, 
      message: 'Token refreshed',
      expiresIn: expires_in
    });
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/oauth/blogger/post
 * Create a blog post on Blogger
 */
router.post('/blogger/post', verifyAdminToken, async (req, res) => {
  const accessToken = process.env.BLOGGER_ACCESS_TOKEN;
  const blogId = process.env.BLOGGER_BLOG_ID;
  
  if (!accessToken || !blogId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Blogger not configured. Please authorize first.',
      authRequired: true
    });
  }
  
  const { title, content, labels } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'title and content are required' });
  }
  
  try {
    const response = await axios.post(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`,
      {
        kind: 'blogger#post',
        title,
        content,
        labels: labels || ['travel', 'flights', 'deals']
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({
      success: true,
      platform: 'blogger',
      postId: response.data.id,
      url: response.data.url,
      title: response.data.title,
      publishedAt: response.data.published
    });
  } catch (error) {
    console.error('Blogger post error:', error.response?.data || error.message);
    
    // If token expired, suggest refresh
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token expired. Please refresh or re-authorize.',
        tokenExpired: true
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.error?.message || error.message 
    });
  }
});

/**
 * GET /api/oauth/blogger/blogs
 * List user's Blogger blogs
 */
router.get('/blogger/blogs', verifyAdminToken, async (req, res) => {
  const accessToken = process.env.BLOGGER_ACCESS_TOKEN;
  
  if (!accessToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'Blogger not authorized',
      authRequired: true
    });
  }
  
  try {
    const response = await axios.get('https://www.googleapis.com/blogger/v3/users/self/blogs', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    res.json({
      success: true,
      blogs: response.data.items || []
    });
  } catch (error) {
    console.error('Get blogs error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
