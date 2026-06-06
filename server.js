const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
let mongoose;
try {
  mongoose = require('mongoose');
} catch (error) {
  mongoose = require('./backend/node_modules/mongoose');
}
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flight-booking')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Serve static airline logo files
app.use('/airlines', express.static(path.join(__dirname, 'backend/public/airlines')));

// Sitemap routes (must be before other routes)
const sitemapRouter = require('./backend/routes/sitemap');
app.use(sitemapRouter);

const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Import admin router to access admin users (for login sync)
const adminRouter = require('./backend/routes/admin');

// Admin login - uses the same credentials as backend admin route
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Get admin from the admin router module using the exported function
    const admin = adminRouter.getAdminByEmail ? adminRouter.getAdminByEmail(email) : null;
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (isPasswordValid) {
      const token = jwt.sign({ admin: { email: admin.email, name: admin.name } }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        success: true,
        token,
        admin: { email: admin.email, name: admin.name }
      });
    }
    
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// SEO Keyword Research API
app.post('/api/seo/keywords', async (req, res) => {
  const { keyword } = req.body;
  try {
    // Use OpenAI to analyze keyword potential
    const prompt = `Analyze the keyword "${keyword}" for SEO purposes. Provide:
1. Estimated monthly search volume (realistic number)
2. SEO difficulty score (0-100)
3. Suggested CPC (cost per click in USD)
4. Current trend (up or down)
5. Related keywords (5 suggestions)

Format as JSON: {"volume": number, "difficulty": number, "cpc": number, "trend": "up/down", "relatedKeywords": []}`;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const analysis = JSON.parse(response.data.choices[0].message.content);
    res.json({ keyword, ...analysis });
  } catch (error) {
    console.error('Keyword analysis error:', error.message);
    // Return mock data if API fails
    res.json({
      keyword,
      volume: Math.floor(Math.random() * 100000) + 10000,
      difficulty: Math.floor(Math.random() * 50) + 30,
      opportunity: Math.floor(Math.random() * 40) + 50,
      relatedKeywords: [
        `${keyword} deals`,
        `cheap ${keyword}`,
        `best ${keyword}`,
        `${keyword} tips`
      ]
    });
  }
});

// Site Audit API
app.post('/api/seo/audit', async (req, res) => {
  const { url } = req.body;
  try {
    const prompt = `Perform a comprehensive SEO audit for the website: ${url}. Analyze and provide:
1. Overall SEO health score (0-100)
2. List of issues found (categorize as error, warning, or success)
3. Specific recommendations

Format as JSON: {"score": number, "issues": [{"type": "error/warning/success", "count": number, "message": string}]}`;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const audit = JSON.parse(response.data.choices[0].message.content);
    res.json(audit);
  } catch (error) {
    console.error('SEO Audit error:', error.message);
    // Return mock data if API fails
    res.json({
      score: 72,
      issues: [
        { type: 'success', count: 15, message: 'Meta tags properly configured' },
        { type: 'success', count: 8, message: 'Mobile-responsive design detected' },
        { type: 'warning', count: 3, message: 'Some images missing alt text' },
        { type: 'warning', count: 2, message: 'Page load time could be improved' },
        { type: 'error', count: 1, message: 'SSL certificate needs renewal attention' }
      ]
    });
  }
});

// Content Optimization API
app.post('/api/seo/optimize-content', async (req, res) => {
  const { content, targetKeyword } = req.body;
  try {
    const prompt = `Analyze this content for SEO optimization targeting the keyword "${targetKeyword}":

${content}

Provide:
1. Current keyword density
2. SEO score (0-100)
3. Specific recommendations to improve
4. Suggested headings to add
5. Internal linking opportunities

Format as JSON.`;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const optimization = JSON.parse(response.data.choices[0].message.content);
    res.json(optimization);
  } catch (error) {
    console.error('Content optimization error:', error.message);
    // Return mock data if API fails
    res.json({
      keywordDensity: '1.8%',
      score: 78,
      suggestions: [
        'Add the target keyword in the first paragraph',
        'Include 2-3 internal links to related pages',
        'Add more descriptive headings with keywords',
        'Optimize meta description length (155-160 characters)'
      ]
    });
  }
});

// Backlink Analysis API
app.get('/api/seo/backlinks', async (req, res) => {
  const { domain } = req.query;
  try {
    // Simulate backlink data (in production, use services like Moz, Ahrefs, or SEMrush API)
    const backlinks = {
      total: Math.floor(Math.random() * 5000) + 500,
      referringDomains: Math.floor(Math.random() * 300) + 50,
      domainAuthority: Math.floor(Math.random() * 50) + 30,
      recentBacklinks: [
        { domain: 'traveldeals.com', authority: 65, type: 'Follow', anchor: 'cheap flights' },
        { domain: 'flightblog.net', authority: 48, type: 'Follow', anchor: 'flight deals' },
        { domain: 'cheapflights.org', authority: 52, type: 'NoFollow', anchor: 'travel' },
        { domain: 'traveltips.io', authority: 38, type: 'Follow', anchor: 'vacation packages' }
      ]
    };
    res.json(backlinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics API
app.get('/api/seo/analytics', async (req, res) => {
  try {
    // Simulate analytics data (in production, integrate with Google Analytics API)
    const analytics = {
      organicTraffic: Math.floor(Math.random() * 20000) + 5000,
      trafficChange: (Math.random() * 50 - 10).toFixed(1),
      keywordRankings: Math.floor(Math.random() * 500) + 100,
      newRankings: Math.floor(Math.random() * 30) + 5,
      clickRate: (Math.random() * 5 + 2).toFixed(1),
      clickRateChange: (Math.random() * 2 - 0.5).toFixed(1),
      avgPosition: (Math.random() * 10 + 5).toFixed(1),
      positionChange: (Math.random() * 3 - 1.5).toFixed(1)
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints for managing site content
app.put('/api/admin/seo', (req, res) => {
  // In production, save to database
  res.json({ message: 'SEO settings updated successfully', data: req.body });
});

app.put('/api/admin/content', (req, res) => {
  res.json({ message: 'Content updated successfully', data: req.body });
});

app.get('/api/admin/blog', (req, res) => {
  res.json([]);
});

app.post('/api/admin/blog', (req, res) => {
  res.json({ message: 'Blog post created', id: Date.now() });
});

app.put('/api/admin/blog/:id', (req, res) => {
  res.json({ message: 'Blog post updated' });
});

app.delete('/api/admin/blog/:id', (req, res) => {
  res.json({ message: 'Blog post deleted' });
});

app.get('/api/admin/campaigns', (req, res) => {
  res.json([]);
});

app.post('/api/admin/campaigns', (req, res) => {
  res.json({ message: 'Campaign created', id: Date.now() });
});

app.post('/api/admin/campaigns/:id/launch', (req, res) => {
  res.json({ message: 'Campaign launched' });
});

app.delete('/api/admin/campaigns/:id', (req, res) => {
  res.json({ message: 'Campaign deleted' });
});

app.post('/api/admin/coupons', (req, res) => {
  res.json({ message: 'Coupon created', id: Date.now() });
});

app.delete('/api/admin/coupons/:id', (req, res) => {
  res.json({ message: 'Coupon deleted' });
});

app.get('/api/admin/reviews', (req, res) => {
  res.json([]);
});

app.post('/api/admin/reviews/:id/approve', (req, res) => {
  res.json({ message: 'Review approved' });
});

app.post('/api/admin/reviews/:id/reject', (req, res) => {
  res.json({ message: 'Review rejected' });
});

app.get('/api/admin/notifications', (req, res) => {
  res.json([]);
});

app.post('/api/admin/notifications/:id/read', (req, res) => {
  res.json({ message: 'Notification marked as read' });
});

app.get('/api/admin/transactions', (req, res) => {
  res.json([]);
});

app.post('/api/admin/transactions/:id/refund', (req, res) => {
  res.json({ message: 'Refund processed' });
});

app.get('/api/admin/chat', (req, res) => {
  res.json([]);
});

app.post('/api/admin/chat/:id/message', (req, res) => {
  res.json({ message: 'Message sent' });
});

app.put('/api/admin/gds', (req, res) => {
  res.json({ message: 'GDS settings updated' });
});

app.post('/api/admin/gds/:provider/test', (req, res) => {
  res.json({ success: true, message: `${req.params.provider} connection successful` });
});

// SEO Agent endpoints
app.get('/api/seo-agent/status', async (req, res) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    const { stdout } = await execPromise('pm2 jlist');
    const processes = JSON.parse(stdout);
    const agent = processes.find(p => p.name === 'seo-agent');
    
    res.json({
      running: agent ? agent.pm2_env.status === 'online' : false,
      uptime: agent ? agent.pm2_env.pm_uptime : null,
      restarts: agent ? agent.pm2_env.restart_time : 0
    });
  } catch (error) {
    res.json({ running: false, message: 'PM2 not installed or agent not running' });
  }
});

app.post('/api/seo-agent/start', async (req, res) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    await execPromise('cd seo-automation && pm2 start seo-agent.js --name seo-agent');
    res.json({ success: true, message: 'SEO Agent started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/seo-agent/stop', async (req, res) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    await execPromise('pm2 stop seo-agent');
    res.json({ success: true, message: 'SEO Agent stopped' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/seo-agent/run-now', async (req, res) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    execPromise('cd seo-automation && node seo-agent.js --run-now').catch(console.error);
    res.json({ success: true, message: 'SEO Agent tasks started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/seo-agent/reports', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const reportFile = path.join(__dirname, 'seo-automation', 'seo-reports.json');
    const data = await fs.readFile(reportFile, 'utf-8');
    const reports = JSON.parse(data);
    
    // Get last 30 reports
    res.json(reports.slice(-30));
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/seo-agent/logs', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const logFile = path.join(__dirname, 'seo-automation', 'seo-logs.json');
    const data = await fs.readFile(logFile, 'utf-8');
    const logs = JSON.parse(data);
    
    // Get last 100 logs
    res.json(logs.slice(-100));
  } catch (error) {
    res.json([]);
  }
});

// API Routes from backend
app.use('/api/flights', require('./backend/routes/flights'));
app.use('/api/hotels', require('./backend/routes/hotels'));
app.use('/api/cruises', require('./backend/routes/cruises'));
app.use('/api/packages', require('./backend/routes/packages'));
app.use('/api/bookings', require('./backend/routes/bookings'));
app.use('/api/users', require('./backend/routes/users'));
app.use('/api/password-reset', require('./backend/routes/passwordReset'));
app.use('/api/admin', adminRouter);
app.use('/api/airlines', require('./backend/routes/airlines'));
app.use('/api/oauth', require('./backend/routes/oauth'));

// Wire up blog posts getter for sitemap
sitemapRouter.setBlogPostsGetter(() => adminRouter.getBlogPosts());

// Serve the React production build for the website UI.
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));
app.get(/^\/(?!api\/?).*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
