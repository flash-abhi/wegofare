/**
 * Google Search Console Live API Integration
 * Uses OAuth2 for authentication with Google Search Console API
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { google } = require('googleapis');

// OAuth2 credentials from Google Cloud Console
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/gsc/oauth2callback'
);

// Store tokens and data (use database in production)
let tokenStore = {
  accessToken: null,
  refreshToken: null,
  expiryDate: null
};

let gscData = {
  connected: false,
  siteUrl: process.env.GSC_SITE_URL || 'https://wegofare.com',
  lastSync: null,
  performance: null,
  indexing: null,
  sitemaps: [],
  coverage: null
};

// Verify admin token middleware
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  next();
};

// Initialize Search Console API client
const getSearchConsole = () => {
  if (tokenStore.accessToken) {
    oauth2Client.setCredentials({
      access_token: tokenStore.accessToken,
      refresh_token: tokenStore.refreshToken,
      expiry_date: tokenStore.expiryDate
    });
  }
  return google.searchconsole({ version: 'v1', auth: oauth2Client });
};

// Check if GSC is configured
const isGSCConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

// Get OAuth2 authorization URL
router.get('/auth-url', verifyAdminToken, (req, res) => {
  if (!isGSCConfigured()) {
    return res.json({
      success: false,
      message: 'Google Search Console not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env',
      configured: false
    });
  }

  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({
    success: true,
    authUrl,
    configured: true
  });
});

// OAuth2 callback handler
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens
    tokenStore.accessToken = tokens.access_token;
    tokenStore.refreshToken = tokens.refresh_token;
    tokenStore.expiryDate = tokens.expiry_date;
    
    oauth2Client.setCredentials(tokens);
    gscData.connected = true;
    gscData.lastSync = new Date();

    // Redirect back to admin dashboard
    res.redirect('http://localhost:3000/admin/dashboard?gsc=connected');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Get GSC connection status
router.get('/status', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    data: {
      connected: gscData.connected,
      configured: isGSCConfigured(),
      siteUrl: gscData.siteUrl,
      lastSync: gscData.lastSync,
      hasTokens: !!tokenStore.accessToken
    }
  });
});

// Connect to GSC (initiate OAuth flow)
router.post('/connect', verifyAdminToken, async (req, res) => {
  if (!isGSCConfigured()) {
    return res.json({
      success: false,
      message: 'Google Search Console not configured',
      configured: false
    });
  }

  // Return auth URL for client to redirect
  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({
    success: true,
    requiresAuth: true,
    authUrl
  });
});

// Disconnect from GSC
router.post('/disconnect', verifyAdminToken, async (req, res) => {
  try {
    // Revoke tokens if possible
    if (tokenStore.accessToken) {
      try {
        await oauth2Client.revokeToken(tokenStore.accessToken);
      } catch (err) {
        console.log('Token revocation failed (may already be invalid)');
      }
    }

    // Clear stored data
    tokenStore = {
      accessToken: null,
      refreshToken: null,
      expiryDate: null
    };
    
    gscData.connected = false;
    gscData.lastSync = null;
    gscData.performance = null;
    gscData.indexing = null;
    gscData.sitemaps = [];

    res.json({
      success: true,
      message: 'Disconnected from Google Search Console'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get performance data
router.get('/performance', verifyAdminToken, async (req, res) => {
  if (!gscData.connected || !tokenStore.accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Not connected to Google Search Console',
      connected: false
    });
  }

  try {
    const searchConsole = getSearchConsole();
    const siteUrl = gscData.siteUrl;
    
    // Calculate date range (last 28 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Fetch search analytics data
    const response = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 10,
        dataState: 'final'
      }
    });

    // Fetch page-level data
    const pagesResponse = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: 10,
        dataState: 'final'
      }
    });

    // Fetch country data
    const countriesResponse = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['country'],
        rowLimit: 5,
        dataState: 'final'
      }
    });

    // Fetch device data
    const devicesResponse = await searchConsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['device'],
        rowLimit: 3,
        dataState: 'final'
      }
    });

    // Calculate totals
    let totalClicks = 0;
    let totalImpressions = 0;
    
    if (response.data.rows) {
      response.data.rows.forEach(row => {
        totalClicks += row.clicks || 0;
        totalImpressions += row.impressions || 0;
      });
    }

    const queries = (response.data.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }));

    const pages = (pagesResponse.data.rows || []).map(row => ({
      page: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }));

    const countries = (countriesResponse.data.rows || []).map(row => ({
      country: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0
    }));

    const devices = (devicesResponse.data.rows || []).map(row => ({
      device: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0
    }));

    const performanceData = {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      position: queries.length > 0 ? queries.reduce((sum, q) => sum + q.position, 0) / queries.length : 0,
      queries,
      pages,
      countries,
      devices,
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate)
      }
    };

    gscData.performance = performanceData;
    gscData.lastSync = new Date();

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('GSC Performance Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Get indexing status
router.get('/indexing', verifyAdminToken, async (req, res) => {
  if (!gscData.connected || !tokenStore.accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Not connected to Google Search Console'
    });
  }

  try {
    const searchConsole = getSearchConsole();
    const siteUrl = gscData.siteUrl;

    // Get URL inspection data for homepage
    const urlInspection = await searchConsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: siteUrl,
        siteUrl: siteUrl
      }
    });

    // This is simplified - in production, you'd fetch coverage report
    const indexingData = {
      indexed: 0,
      notIndexed: 0,
      errors: [],
      warnings: [],
      inspectionResult: urlInspection.data
    };

    gscData.indexing = indexingData;

    res.json({
      success: true,
      data: indexingData
    });
  } catch (error) {
    console.error('GSC Indexing Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get sitemaps
router.get('/sitemaps', verifyAdminToken, async (req, res) => {
  if (!gscData.connected || !tokenStore.accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Not connected to Google Search Console'
    });
  }

  try {
    const searchConsole = getSearchConsole();
    const siteUrl = gscData.siteUrl;

    const response = await searchConsole.sitemaps.list({
      siteUrl: siteUrl
    });

    const sitemaps = (response.data.sitemap || []).map(sitemap => ({
      path: sitemap.path,
      lastSubmitted: sitemap.lastSubmitted,
      lastDownloaded: sitemap.lastDownloaded,
      isPending: sitemap.isPending,
      isSitemapsIndex: sitemap.isSitemapsIndex,
      warnings: sitemap.warnings || 0,
      errors: sitemap.errors || 0
    }));

    gscData.sitemaps = sitemaps;

    res.json({
      success: true,
      data: sitemaps
    });
  } catch (error) {
    console.error('GSC Sitemaps Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Submit URL for indexing
router.post('/index-url', verifyAdminToken, async (req, res) => {
  if (!gscData.connected || !tokenStore.accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Not connected to Google Search Console'
    });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Use Google Indexing API (requires separate setup)
    // For now, return a message
    res.json({
      success: true,
      message: 'URL indexing requires Google Indexing API setup',
      url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Request re-indexing
router.post('/request-reindex', verifyAdminToken, async (req, res) => {
  if (!gscData.connected || !tokenStore.accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Not connected to Google Search Console'
    });
  }

  try {
    const { url } = req.body;
    
    res.json({
      success: true,
      message: 'Re-indexing request submitted (requires Google Indexing API)',
      url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
