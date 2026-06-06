const express = require('express');
const router = express.Router();
const backlinkAI = require('../services/backlinkAI');
const platformIntegrations = require('../services/platformIntegrations');
const realBacklinks = require('../services/realBacklinks');
const fs = require('fs');
const path = require('path');

// Load real backlinks data from file
function getRealBacklinksData() {
  try {
    const dataFile = path.join(__dirname, '..', 'real-backlinks-data.json');
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading real backlinks data:', e.message);
  }
  return { liveBacklinks: [], stats: { total: 0, dofollow: 0, byPlatform: {} } };
}

// Middleware to verify admin token
const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Support both token formats: {id, email} and {admin: {email, name}}
    req.adminId = decoded.id || decoded.admin?.email;
    req.admin = decoded.admin || { email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * GET /api/backlinks/stats
 * Get backlink statistics (includes real backlinks)
 */
router.get('/stats', verifyAdminToken, (req, res) => {
  try {
    const simulatedStats = backlinkAI.getStats();
    const realData = getRealBacklinksData();
    
    // Calculate real backlink stats
    const realTotal = realData.stats?.total || 0;
    const realDofollow = realData.stats?.dofollow || 0;
    const realNofollow = realTotal - realDofollow;
    
    // Merge stats - update the nested backlinks object that the frontend expects
    const stats = {
      ...simulatedStats,
      backlinks: {
        ...simulatedStats.backlinks,
        total: (simulatedStats.backlinks?.total || 0) + realTotal,
        dofollow: (simulatedStats.backlinks?.dofollow || 0) + realDofollow,
        nofollow: (simulatedStats.backlinks?.nofollow || 0) + realNofollow,
        active: (simulatedStats.backlinks?.active || 0) + realTotal,
        avgDomainRating: realTotal > 0 ? 95 : (simulatedStats.backlinks?.avgDomainRating || 0),
        uniqueDomains: (simulatedStats.backlinks?.uniqueDomains || 0) + Object.keys(realData.stats?.byPlatform || {}).length
      },
      totalBacklinks: (simulatedStats.totalBacklinks || 0) + realTotal,
      liveBacklinks: realTotal,
      dofollowBacklinks: (simulatedStats.dofollowBacklinks || 0) + realDofollow,
      realBacklinks: realData.stats || { total: 0, dofollow: 0, byPlatform: {} }
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Backlink stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
});

/**
 * GET /api/backlinks/platforms
 * Get all available platforms for backlink opportunities
 */
router.get('/platforms', verifyAdminToken, (req, res) => {
  try {
    const platforms = backlinkAI.getPlatforms();
    res.json({ success: true, platforms });
  } catch (error) {
    console.error('Platforms error:', error);
    res.status(500).json({ success: false, message: 'Failed to get platforms' });
  }
});

/**
 * GET /api/backlinks/platforms/:category
 * Get platforms by category
 */
router.get('/platforms/:category', verifyAdminToken, (req, res) => {
  try {
    const { category } = req.params;
    const platforms = backlinkAI.getPlatformsByCategory(category);
    res.json({ success: true, platforms, category });
  } catch (error) {
    console.error('Platforms category error:', error);
    res.status(500).json({ success: false, message: 'Failed to get platforms' });
  }
});

/**
 * GET /api/backlinks/opportunities
 * Get suggested backlink opportunities
 */
router.get('/opportunities', verifyAdminToken, (req, res) => {
  try {
    const opportunities = backlinkAI.getOpportunities();
    res.json({ success: true, opportunities });
  } catch (error) {
    console.error('Opportunities error:', error);
    res.status(500).json({ success: false, message: 'Failed to get opportunities' });
  }
});

/**
 * POST /api/backlinks/generate
 * Generate content for backlink submission
 */
router.post('/generate', verifyAdminToken, async (req, res) => {
  try {
    const { type, context } = req.body;
    
    if (!type) {
      return res.status(400).json({ success: false, message: 'Content type is required' });
    }

    const content = await backlinkAI.generateContent(type, context || {});
    res.json({ success: true, ...content });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate content' });
  }
});

/**
 * POST /api/backlinks/generate/batch
 * Generate batch content for multiple platforms
 */
router.post('/generate/batch', verifyAdminToken, async (req, res) => {
  try {
    const { count } = req.body;
    const results = await backlinkAI.generateBatch(count || 5);
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate batch' });
  }
});

/**
 * GET /api/backlinks/submissions
 * Get all submissions
 */
router.get('/submissions', verifyAdminToken, (req, res) => {
  try {
    const { status, platformType, limit } = req.query;
    const submissions = backlinkAI.getSubmissions({
      status,
      platformType,
      limit: limit ? parseInt(limit) : undefined
    });
    res.json({ success: true, submissions, count: submissions.length });
  } catch (error) {
    console.error('Submissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get submissions' });
  }
});

/**
 * POST /api/backlinks/submissions
 * Create a new submission
 */
router.post('/submissions', verifyAdminToken, (req, res) => {
  try {
    const { platformType, platform, content } = req.body;
    
    if (!platformType || !platform || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'platformType, platform, and content are required' 
      });
    }

    const submission = backlinkAI.createSubmission(platformType, platform, content);
    res.json({ success: true, submission });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to create submission' });
  }
});

/**
 * PUT /api/backlinks/submissions/:id
 * Update submission status
 */
router.put('/submissions/:id', verifyAdminToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const submission = backlinkAI.updateSubmission(parseInt(id), updates);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, submission });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to update submission' });
  }
});

/**
 * POST /api/backlinks/submit/simulate
 * Simulate submitting to a platform
 */
router.post('/submit/simulate', verifyAdminToken, async (req, res) => {
  try {
    const { platformType, platformIndex } = req.body;
    
    if (!platformType || platformIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'platformType and platformIndex are required' 
      });
    }

    const result = await backlinkAI.simulateSubmission(platformType, platformIndex);
    res.json(result);
  } catch (error) {
    console.error('Simulate submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to simulate submission' });
  }
});

/**
 * GET /api/backlinks/integrations
 * Get configured platform integrations
 */
router.get('/integrations', verifyAdminToken, (req, res) => {
  try {
    const configured = platformIntegrations.getConfiguredPlatforms();
    res.json({ 
      success: true, 
      configuredPlatforms: configured,
      available: ['medium', 'linkedin', 'wordpress', 'blogger', 'tumblr', 'pinterest', 'reddit', 'devto', 'hashnode']
    });
  } catch (error) {
    console.error('Integrations error:', error);
    res.status(500).json({ success: false, message: 'Failed to get integrations' });
  }
});

/**
 * POST /api/backlinks/submit/live
 * Submit to a real platform via API integration
 */
router.post('/submit/live', verifyAdminToken, async (req, res) => {
  try {
    const { platform, title, content, tags, link, imageUrl, subreddit } = req.body;
    
    if (!platform) {
      return res.status(400).json({ success: false, message: 'platform is required' });
    }

    // Generate content if not provided
    let postContent = content;
    let postTitle = title;
    
    if (!postContent) {
      const generated = await backlinkAI.generateContent('guestPost', { 
        topic: 'Best Tips for Finding Cheap Flights' 
      });
      postContent = generated.content;
    }
    
    if (!postTitle) {
      postTitle = '✈️ Top Tips for Finding the Best Flight Deals in 2025';
    }

    // Submit to platform
    const result = await platformIntegrations.post(platform, {
      title: postTitle,
      content: postContent,
      tags: tags || ['travel', 'flights', 'deals', 'vacation'],
      link: link || process.env.SITE_URL || 'https://wegofare.com',
      imageUrl,
      subreddit,
      description: postContent.substring(0, 200),
      labels: tags || ['travel', 'flights']
    });

    // Track the submission if successful
    if (result.success) {
      backlinkAI.addSubmission({
        platformName: platform,
        platformUrl: result.url || `https://${platform}.com`,
        content: postContent,
        status: 'submitted',
        backlinkUrl: result.url,
        postId: result.postId
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Live submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/backlinks/submit/medium
 * Direct submission to Medium
 */
router.post('/submit/medium', verifyAdminToken, async (req, res) => {
  try {
    let { title, content, tags } = req.body;
    
    // Generate content if not provided
    if (!content) {
      const generated = await backlinkAI.generateContent('guestPost', { 
        topic: 'How to Find the Best Flight Deals Online' 
      });
      content = generated.content;
    }
    
    if (!title) {
      title = '✈️ Complete Guide to Finding Cheap Flights in 2025';
    }

    const result = await platformIntegrations.postToMedium(
      title, 
      content, 
      tags || ['travel', 'flights', 'travel-tips', 'vacation', 'budget-travel']
    );

    if (result.success) {
      backlinkAI.addSubmission({
        platformName: 'Medium',
        platformUrl: 'https://medium.com',
        content,
        status: 'submitted',
        backlinkUrl: result.url,
        postId: result.postId
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Medium submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/backlinks/submit/linkedin
 * Direct submission to LinkedIn
 */
router.post('/submit/linkedin', verifyAdminToken, async (req, res) => {
  try {
    let { content, title, link } = req.body;
    
    // Generate content if not provided
    if (!content) {
      const generated = await backlinkAI.generateContent('socialPost', { 
        topic: 'travel deals and savings tips' 
      });
      content = generated.content || `✈️ Planning your next trip? Here's how to save big on flights!\n\nCheck out the latest deals at ${process.env.SITE_URL || 'https://wegofare.com'}\n\n#travel #flights #deals`;
    }

    const result = await platformIntegrations.postToLinkedIn(
      content,
      title || 'Best Flight Deals',
      link || process.env.SITE_URL || 'https://wegofare.com'
    );

    if (result.success) {
      backlinkAI.addSubmission({
        platformName: 'LinkedIn',
        platformUrl: 'https://linkedin.com',
        content,
        status: 'submitted',
        postId: result.postId
      });
    }

    res.json(result);
  } catch (error) {
    console.error('LinkedIn submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/backlinks/submit/devto
 * Direct submission to Dev.to
 */
router.post('/submit/devto', verifyAdminToken, async (req, res) => {
  try {
    let { title, content, tags } = req.body;
    
    // Generate content if not provided
    if (!content) {
      const generated = await backlinkAI.generateContent('guestPost', { 
        topic: 'Building a Travel Deals Aggregator with AI' 
      });
      content = generated.content;
    }
    
    if (!title) {
      title = 'How We Built an AI-Powered Flight Deals Finder';
    }

    const result = await platformIntegrations.postToDevTo(
      title,
      content,
      tags || ['webdev', 'javascript', 'ai', 'travel']
    );

    if (result.success) {
      backlinkAI.addSubmission({
        platformName: 'Dev.to',
        platformUrl: 'https://dev.to',
        content,
        status: 'submitted',
        backlinkUrl: result.url,
        postId: result.postId
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Dev.to submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/backlinks
 * Get all backlinks (includes real backlinks)
 */
router.get('/', verifyAdminToken, (req, res) => {
  try {
    const { status, dofollow, minDR } = req.query;
    const simulatedBacklinks = backlinkAI.getBacklinks({
      status,
      dofollow: dofollow !== undefined ? dofollow === 'true' : undefined,
      minDR: minDR ? parseInt(minDR) : undefined
    });
    
    // Get real backlinks
    const realData = getRealBacklinksData();
    const realBacklinks = (realData.liveBacklinks || []).map(bl => {
      // Extract domain from sourceUrl
      let sourceDomain = bl.platform;
      try {
        const url = new URL(bl.sourceUrl);
        sourceDomain = url.hostname;
      } catch (e) {}
      
      return {
        ...bl,
        platform: bl.platform,
        platformName: bl.platform,
        platformUrl: bl.sourceUrl,
        sourceDomain: sourceDomain,
        domainRating: bl.dr || 95,
        discoveredAt: bl.createdAt,
        status: 'live',
        isReal: true
      };
    });
    
    // Combine: real backlinks first, then simulated
    const backlinks = [...realBacklinks, ...simulatedBacklinks];
    
    res.json({ 
      success: true, 
      backlinks, 
      count: backlinks.length,
      realCount: realBacklinks.length,
      simulatedCount: simulatedBacklinks.length
    });
  } catch (error) {
    console.error('Get backlinks error:', error);
    res.status(500).json({ success: false, message: 'Failed to get backlinks' });
  }
});

/**
 * POST /api/backlinks
 * Add a new backlink manually
 */
router.post('/', verifyAdminToken, (req, res) => {
  try {
    const { url, sourceUrl, anchorText, dofollow, domainRating, pageAuthority } = req.body;
    
    if (!url || !sourceUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'url and sourceUrl are required' 
      });
    }

    const backlink = backlinkAI.addBacklink({
      url,
      sourceUrl,
      anchorText,
      dofollow,
      domainRating,
      pageAuthority
    });

    res.json({ success: true, backlink });
  } catch (error) {
    console.error('Add backlink error:', error);
    res.status(500).json({ success: false, message: 'Failed to add backlink' });
  }
});

/**
 * POST /api/backlinks/import
 * Import backlinks from external source
 */
router.post('/import', verifyAdminToken, (req, res) => {
  try {
    const { backlinks } = req.body;
    
    if (!backlinks || !Array.isArray(backlinks)) {
      return res.status(400).json({ 
        success: false, 
        message: 'backlinks array is required' 
      });
    }

    const result = backlinkAI.importBacklinks(backlinks);
    res.json(result);
  } catch (error) {
    console.error('Import backlinks error:', error);
    res.status(500).json({ success: false, message: 'Failed to import backlinks' });
  }
});

/**
 * GET /api/backlinks/export
 * Export all backlinks data
 */
router.get('/export', verifyAdminToken, (req, res) => {
  try {
    const data = backlinkAI.exportBacklinks();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Export backlinks error:', error);
    res.status(500).json({ success: false, message: 'Failed to export backlinks' });
  }
});

/**
 * POST /api/backlinks/:id/check
 * Check backlink health
 */
router.post('/:id/check', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await backlinkAI.checkBacklinkHealth(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Check backlink error:', error);
    res.status(500).json({ success: false, message: 'Failed to check backlink' });
  }
});

/**
 * GET /api/backlinks/schedule
 * Get auto-submit schedule settings
 */
router.get('/schedule', verifyAdminToken, (req, res) => {
  try {
    const stats = backlinkAI.getStats();
    res.json({ success: true, schedule: stats.schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to get schedule' });
  }
});

/**
 * PUT /api/backlinks/schedule
 * Update auto-submit schedule settings
 */
router.put('/schedule', verifyAdminToken, (req, res) => {
  try {
    const { enabled, dailyLimit, hourlyLimit } = req.body;
    const schedule = backlinkAI.updateSchedule({ enabled, dailyLimit, hourlyLimit });
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

/**
 * POST /api/backlinks/schedule/toggle
 * Enable/disable automatic submissions
 */
router.post('/schedule/toggle', verifyAdminToken, (req, res) => {
  try {
    const { enabled } = req.body;
    const schedule = backlinkAI.setAutoSubmit(enabled);
    res.json({ success: true, schedule, message: `Auto-submit ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Toggle schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle schedule' });
  }
});

// ========================================
// REAL BACKLINKS ROUTES
// ========================================

/**
 * GET /api/backlinks/real/platforms
 * Get all real platforms with submission info
 */
router.get('/real/platforms', verifyAdminToken, (req, res) => {
  try {
    const platforms = realBacklinks.getRealPlatforms();
    const summary = realBacklinks.getPlatformsSummary();
    res.json({ success: true, platforms, summary });
  } catch (error) {
    console.error('Real platforms error:', error);
    res.status(500).json({ success: false, message: 'Failed to get real platforms' });
  }
});

/**
 * GET /api/backlinks/real/summary
 * Get platforms summary with stats
 */
router.get('/real/summary', verifyAdminToken, (req, res) => {
  try {
    const summary = realBacklinks.getPlatformsSummary();
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Real platforms summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get summary' });
  }
});

/**
 * GET /api/backlinks/real/instructions/:platform
 * Get manual submission instructions for a platform
 */
router.get('/real/instructions/:platform', verifyAdminToken, (req, res) => {
  try {
    const { platform } = req.params;
    const instructions = realBacklinks.getManualSubmissionInstructions(platform);
    res.json({ success: true, platform, instructions });
  } catch (error) {
    console.error('Instructions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get instructions' });
  }
});

/**
 * GET /api/backlinks/real/priority
 * Get priority action items for backlink building
 */
router.get('/real/priority', verifyAdminToken, (req, res) => {
  try {
    const actions = realBacklinks.getPriorityActions();
    res.json({ success: true, actions, count: actions.length });
  } catch (error) {
    console.error('Priority actions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get priority actions' });
  }
});

/**
 * GET /api/backlinks/real/directory-listing
 * Get pre-filled directory listing content
 */
router.get('/real/directory-listing', verifyAdminToken, (req, res) => {
  try {
    const listing = realBacklinks.generateDirectoryListing();
    res.json({ success: true, listing });
  } catch (error) {
    console.error('Directory listing error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate listing' });
  }
});

/**
 * GET /api/backlinks/real/live
 * Get all live backlinks
 */
router.get('/real/live', verifyAdminToken, (req, res) => {
  try {
    const { dofollow, indexed, platform, category, minDR } = req.query;
    const backlinks = realBacklinks.getLiveBacklinks({
      dofollow: dofollow === 'true' ? true : dofollow === 'false' ? false : undefined,
      indexed: indexed === 'true' ? true : indexed === 'false' ? false : undefined,
      platform,
      category,
      minDR: minDR ? parseInt(minDR) : undefined
    });
    res.json({ success: true, backlinks, count: backlinks.length });
  } catch (error) {
    console.error('Live backlinks error:', error);
    res.status(500).json({ success: false, message: 'Failed to get live backlinks' });
  }
});

/**
 * GET /api/backlinks/real/stats
 * Get real backlink statistics
 */
router.get('/real/stats', verifyAdminToken, (req, res) => {
  try {
    const stats = realBacklinks.getBacklinkStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Real backlink stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
});

/**
 * POST /api/backlinks/real/add
 * Manually add a live backlink
 */
router.post('/real/add', verifyAdminToken, (req, res) => {
  try {
    const { platform, category, sourceUrl, anchorText, dofollow, dr, indexed } = req.body;
    
    if (!platform || !sourceUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'platform and sourceUrl are required' 
      });
    }

    const backlink = realBacklinks.addLiveBacklink({
      platform,
      category: category || 'manual',
      sourceUrl,
      anchorText,
      dofollow: dofollow !== false,
      dr: dr || 0,
      indexed: indexed || false
    });

    res.json({ success: true, backlink, message: 'Live backlink added successfully' });
  } catch (error) {
    console.error('Add live backlink error:', error);
    res.status(500).json({ success: false, message: 'Failed to add backlink' });
  }
});

/**
 * POST /api/backlinks/real/submit/pinterest
 * Submit to Pinterest (real API)
 */
router.post('/real/submit/pinterest', verifyAdminToken, async (req, res) => {
  try {
    const { boardId, title, description, imageUrl } = req.body;
    
    if (!boardId || !title || !imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'boardId, title, and imageUrl are required' 
      });
    }

    const result = await realBacklinks.submitToPinterest({ boardId, title, description, imageUrl });
    
    if (result.success) {
      // Track the live backlink
      realBacklinks.addLiveBacklink({
        platform: 'Pinterest',
        category: 'socialProfiles',
        sourceUrl: result.postUrl,
        dofollow: result.dofollow,
        dr: result.dr
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Pinterest submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit to Pinterest' });
  }
});

/**
 * POST /api/backlinks/real/submit/twitter
 * Submit to Twitter/X (real API)
 */
router.post('/real/submit/twitter', verifyAdminToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }

    const result = await realBacklinks.submitToTwitter({ text });
    
    if (result.success) {
      realBacklinks.addLiveBacklink({
        platform: 'Twitter',
        category: 'socialProfiles',
        sourceUrl: result.postUrl,
        dofollow: false,
        dr: 94
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Twitter submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit to Twitter' });
  }
});

/**
 * POST /api/backlinks/real/submit/linkedin
 * Submit to LinkedIn (real API)
 */
router.post('/real/submit/linkedin', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }

    const result = await realBacklinks.submitToLinkedIn({ title, description, text });
    
    if (result.success) {
      realBacklinks.addLiveBacklink({
        platform: 'LinkedIn',
        category: 'socialProfiles',
        sourceUrl: `https://linkedin.com/posts/${result.postId}`,
        dofollow: false,
        dr: 98
      });
    }

    res.json(result);
  } catch (error) {
    console.error('LinkedIn submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit to LinkedIn' });
  }
});

/**
 * POST /api/backlinks/real/submit/blogger
 * Submit to Blogger (real Google API)
 */
router.post('/real/submit/blogger', verifyAdminToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'title and content are required' });
    }

    const result = await realBacklinks.submitToBlogger({ title, content });
    
    if (result.success) {
      realBacklinks.addLiveBacklink({
        platform: 'Blogger',
        category: 'web2Blogs',
        sourceUrl: result.postUrl,
        dofollow: true, // Blogger is dofollow!
        dr: 95
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Blogger submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit to Blogger' });
  }
});

/**
 * POST /api/backlinks/real/submit/reddit
 * Submit to Reddit (real API)
 */
router.post('/real/submit/reddit', verifyAdminToken, async (req, res) => {
  try {
    const { subreddit, title } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const result = await realBacklinks.submitToReddit({ subreddit, title });
    
    if (result.success) {
      realBacklinks.addLiveBacklink({
        platform: 'Reddit',
        category: 'qaSites',
        sourceUrl: result.postUrl,
        dofollow: false,
        dr: 97
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Reddit submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit to Reddit' });
  }
});

/**
 * POST /api/backlinks/real/check-index
 * Check if a URL is indexed by Google
 */
router.post('/real/check-index', verifyAdminToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'url is required' });
    }

    const result = await realBacklinks.checkIndexStatus(url);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Check index error:', error);
    res.status(500).json({ success: false, message: 'Failed to check index status' });
  }
});

module.exports = router;
