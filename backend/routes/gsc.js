const express = require('express');
const router = express.Router();
const axios = require('axios');

// Google Search Console API Integration
// Note: Requires OAuth2 setup and credentials

// Store GSC data in memory (use database in production)
let gscData = {
  connected: false,
  siteUrl: 'https://wegofare.com',
  lastSync: null,
  performance: {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    queries: [],
    pages: [],
    countries: [],
    devices: []
  },
  indexing: {
    indexed: 0,
    notIndexed: 0,
    errors: [],
    warnings: []
  },
  sitemaps: [],
  coverage: {
    valid: 0,
    error: 0,
    warning: 0,
    excluded: 0
  }
};

// Verify admin token middleware
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  next();
};

// Get GSC connection status
router.get('/status', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    connected: gscData.connected,
    siteUrl: gscData.siteUrl,
    lastSync: gscData.lastSync
  });
});

// Get GSC performance data
router.get('/performance', verifyAdminToken, async (req, res) => {
  try {
    const { startDate, endDate, dimensions } = req.query;
    
    // In production, this would make actual API calls to Google Search Console
    // For now, return mock data with realistic numbers
    const mockData = {
      success: true,
      data: {
        clicks: Math.floor(Math.random() * 5000) + 1000,
        impressions: Math.floor(Math.random() * 50000) + 10000,
        ctr: (Math.random() * 5 + 2).toFixed(2),
        position: (Math.random() * 15 + 5).toFixed(1),
        queries: [
          { query: 'cheap flights to dubai', clicks: 234, impressions: 5432, ctr: 4.3, position: 3.2 },
          { query: 'best flight deals', clicks: 189, impressions: 4521, ctr: 4.2, position: 4.1 },
          { query: 'flights to new york', clicks: 156, impressions: 3876, ctr: 4.0, position: 5.3 },
          { query: 'american airlines tickets', clicks: 143, impressions: 3124, ctr: 4.6, position: 2.8 },
          { query: 'delta flight booking', clicks: 128, impressions: 2987, ctr: 4.3, position: 3.5 },
          { query: 'last minute flights', clicks: 112, impressions: 2654, ctr: 4.2, position: 4.7 },
          { query: 'cheap international flights', clicks: 98, impressions: 2341, ctr: 4.2, position: 5.1 },
          { query: 'flight deals to europe', clicks: 87, impressions: 2012, ctr: 4.3, position: 4.9 },
          { query: 'business class flights', clicks: 76, impressions: 1876, ctr: 4.1, position: 6.2 },
          { query: 'round trip flights', clicks: 65, impressions: 1654, ctr: 3.9, position: 7.3 }
        ],
        pages: [
          { page: '/', clicks: 456, impressions: 8765, ctr: 5.2, position: 2.8 },
          { page: '/flights', clicks: 389, impressions: 7234, ctr: 5.4, position: 3.1 },
          { page: '/airlines/american-airlines', clicks: 234, impressions: 4532, ctr: 5.2, position: 3.5 },
          { page: '/airlines/delta-airlines', clicks: 198, impressions: 3876, ctr: 5.1, position: 3.8 },
          { page: '/packages', clicks: 167, impressions: 3421, ctr: 4.9, position: 4.2 },
          { page: '/hotels', clicks: 143, impressions: 2987, ctr: 4.8, position: 4.5 },
          { page: '/cruises', clicks: 121, impressions: 2543, ctr: 4.8, position: 5.1 },
          { page: '/airlines', clicks: 98, impressions: 2134, ctr: 4.6, position: 5.8 }
        ],
        countries: [
          { country: 'USA', clicks: 3456, impressions: 45678, ctr: 7.6, position: 3.2 },
          { country: 'Canada', clicks: 876, impressions: 12345, ctr: 7.1, position: 3.8 },
          { country: 'UK', clicks: 543, impressions: 8765, ctr: 6.2, position: 4.5 },
          { country: 'India', clicks: 432, impressions: 7654, ctr: 5.6, position: 5.2 },
          { country: 'Australia', clicks: 321, impressions: 5432, ctr: 5.9, position: 4.8 }
        ],
        devices: [
          { device: 'mobile', clicks: 2876, impressions: 38765, ctr: 7.4, position: 3.5 },
          { device: 'desktop', clicks: 1987, impressions: 26543, ctr: 7.5, position: 3.2 },
          { device: 'tablet', clicks: 543, impressions: 7234, ctr: 7.5, position: 3.8 }
        ],
        trend: [
          { date: '2025-11-22', clicks: 234, impressions: 3456, ctr: 6.8, position: 3.5 },
          { date: '2025-11-23', clicks: 256, impressions: 3678, ctr: 7.0, position: 3.4 },
          { date: '2025-11-24', clicks: 243, impressions: 3543, ctr: 6.9, position: 3.5 },
          { date: '2025-11-25', clicks: 267, impressions: 3876, ctr: 6.9, position: 3.3 },
          { date: '2025-11-26', clicks: 289, impressions: 4123, ctr: 7.0, position: 3.2 },
          { date: '2025-11-27', clicks: 298, impressions: 4234, ctr: 7.0, position: 3.1 },
          { date: '2025-11-28', clicks: 312, impressions: 4456, ctr: 7.0, position: 3.0 }
        ]
      },
      lastSync: new Date().toISOString()
    };

    gscData.performance = mockData.data;
    gscData.lastSync = mockData.lastSync;

    res.json(mockData);
  } catch (error) {
    console.error('GSC Performance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data',
      error: error.message
    });
  }
});

// Get indexing status
router.get('/indexing', verifyAdminToken, async (req, res) => {
  try {
    const mockData = {
      success: true,
      data: {
        indexed: 143,
        notIndexed: 12,
        errors: [
          { page: '/old-page-1', error: '404 Not Found', detected: '2025-11-20' },
          { page: '/old-page-2', error: '404 Not Found', detected: '2025-11-19' },
          { page: '/broken-link', error: 'Server Error (5xx)', detected: '2025-11-18' }
        ],
        warnings: [
          { page: '/slow-page', warning: 'Page speed too slow', detected: '2025-11-25' },
          { page: '/duplicate-title', warning: 'Duplicate title tags', detected: '2025-11-24' }
        ],
        coverage: {
          valid: 143,
          error: 3,
          warning: 2,
          excluded: 8
        }
      },
      lastSync: new Date().toISOString()
    };

    gscData.indexing = mockData.data;
    gscData.coverage = mockData.data.coverage;
    gscData.lastSync = mockData.lastSync;

    res.json(mockData);
  } catch (error) {
    console.error('GSC Indexing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch indexing data',
      error: error.message
    });
  }
});

// Get sitemaps
router.get('/sitemaps', verifyAdminToken, async (req, res) => {
  try {
    const mockData = {
      success: true,
      data: [
        {
          path: 'https://wegofare.com/sitemap.xml',
          lastSubmitted: '2025-11-20',
          status: 'Success',
          urlsSubmitted: 156,
          urlsIndexed: 143
        },
        {
          path: 'https://wegofare.com/sitemap-airlines.xml',
          lastSubmitted: '2025-11-20',
          status: 'Success',
          urlsSubmitted: 15,
          urlsIndexed: 15
        },
        {
          path: 'https://wegofare.com/sitemap-blog.xml',
          lastSubmitted: '2025-11-28',
          status: 'Pending',
          urlsSubmitted: 23,
          urlsIndexed: 18
        }
      ],
      lastSync: new Date().toISOString()
    };

    gscData.sitemaps = mockData.data;
    gscData.lastSync = mockData.lastSync;

    res.json(mockData);
  } catch (error) {
    console.error('GSC Sitemaps Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sitemaps',
      error: error.message
    });
  }
});

// Submit URL for indexing
router.post('/index-url', verifyAdminToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // In production, this would call Google Indexing API
    const mockResponse = {
      success: true,
      message: `URL submitted for indexing: ${url}`,
      data: {
        url,
        status: 'Submitted',
        timestamp: new Date().toISOString(),
        estimatedIndexTime: '24-48 hours'
      }
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Index URL Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit URL for indexing',
      error: error.message
    });
  }
});

// Request re-indexing
router.post('/request-reindex', verifyAdminToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    const mockResponse = {
      success: true,
      message: `Re-indexing requested for: ${url}`,
      data: {
        url,
        status: 'Processing',
        timestamp: new Date().toISOString()
      }
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Re-index Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request re-indexing',
      error: error.message
    });
  }
});

// Connect to GSC (OAuth flow would go here)
router.post('/connect', verifyAdminToken, async (req, res) => {
  try {
    const { siteUrl } = req.body;
    
    // In production, initiate OAuth2 flow here
    gscData.connected = true;
    gscData.siteUrl = siteUrl || 'https://wegofare.com';
    gscData.lastSync = new Date().toISOString();

    res.json({
      success: true,
      message: 'Connected to Google Search Console',
      data: {
        siteUrl: gscData.siteUrl,
        connected: true
      }
    });
  } catch (error) {
    console.error('GSC Connect Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Google Search Console',
      error: error.message
    });
  }
});

// Disconnect from GSC
router.post('/disconnect', verifyAdminToken, (req, res) => {
  gscData.connected = false;
  gscData.lastSync = null;

  res.json({
    success: true,
    message: 'Disconnected from Google Search Console'
  });
});

module.exports = router;
