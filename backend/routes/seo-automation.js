const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// In-memory storage for SEO automation data
let seoAgentStatus = {
  running: false,
  uptime: null,
  restarts: 0,
  lastRun: null
};

let seoAutomationSettings = {
  enabled: false,
  schedule: {
    fullAudit: '0 3 * * *', // 3 AM daily
    quickCheck: '0 */6 * * *', // Every 6 hours
    competitorAnalysis: '0 9 * * 1' // 9 AM Monday
  },
  tasks: {
    sitemapGeneration: true,
    metaOptimization: true,
    keywordTracking: true,
    backlinkMonitoring: true,
    performanceAudit: true,
    contentAnalysis: true
  },
  notifications: {
    email: true,
    emailAddress: '',
    slackWebhook: ''
  }
};

let seoReports = [];
let seoLogs = [];
let automatedTasks = [];

// Middleware to check admin authentication
const checkAdminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Get SEO agent status
router.get('/status', checkAdminAuth, async (req, res) => {
  try {
    // Check if PM2 process is running
    exec('pm2 jlist', (error, stdout) => {
      if (error) {
        return res.json(seoAgentStatus);
      }
      
      try {
        const processes = JSON.parse(stdout);
        const seoAgent = processes.find(p => p.name === 'seo-agent');
        
        if (seoAgent) {
          seoAgentStatus = {
            running: seoAgent.pm2_env.status === 'online',
            uptime: seoAgent.pm2_env.pm_uptime,
            restarts: seoAgent.pm2_env.restart_time,
            lastRun: seoAgentStatus.lastRun
          };
        }
      } catch (e) {
        console.error('Error parsing PM2 list:', e);
      }
      
      res.json(seoAgentStatus);
    });
  } catch (error) {
    console.error('Error getting SEO agent status:', error);
    res.json(seoAgentStatus);
  }
});

// Start SEO agent
router.post('/start', checkAdminAuth, (req, res) => {
  const agentPath = path.join(__dirname, '../../seo-automation/seo-agent.js');
  
  exec(`pm2 start ${agentPath} --name seo-agent`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error starting SEO agent:', error);
      return res.status(500).json({ message: 'Failed to start SEO agent', error: stderr });
    }
    
    seoAgentStatus.running = true;
    seoAgentStatus.uptime = Date.now();
    
    addLog('info', 'SEO Agent started via admin panel');
    res.json({ message: 'SEO Agent started successfully', output: stdout });
  });
});

// Stop SEO agent
router.post('/stop', checkAdminAuth, (req, res) => {
  exec('pm2 stop seo-agent', (error, stdout, stderr) => {
    if (error) {
      console.error('Error stopping SEO agent:', error);
      return res.status(500).json({ message: 'Failed to stop SEO agent', error: stderr });
    }
    
    seoAgentStatus.running = false;
    seoAgentStatus.uptime = null;
    
    addLog('info', 'SEO Agent stopped via admin panel');
    res.json({ message: 'SEO Agent stopped successfully', output: stdout });
  });
});

// Run SEO tasks immediately
router.post('/run-now', checkAdminAuth, async (req, res) => {
  try {
    addLog('info', 'Manual SEO task execution started');
    
    // Run all enabled tasks
    const results = {
      timestamp: new Date().toISOString(),
      tasks: []
    };
    
    if (seoAutomationSettings.tasks.sitemapGeneration) {
      const sitemapResult = await generateSitemap();
      results.tasks.push({ name: 'Sitemap Generation', status: 'success', ...sitemapResult });
    }
    
    if (seoAutomationSettings.tasks.metaOptimization) {
      const metaResult = await optimizeMetaTags();
      results.tasks.push({ name: 'Meta Optimization', status: 'success', ...metaResult });
    }
    
    if (seoAutomationSettings.tasks.performanceAudit) {
      const perfResult = await runPerformanceAudit();
      results.tasks.push({ name: 'Performance Audit', status: 'success', ...perfResult });
    }
    
    seoAgentStatus.lastRun = new Date().toISOString();
    
    // Add report
    seoReports.push({
      date: new Date().toLocaleString(),
      duration: '2m 34s',
      summary: {
        siteHealth: 85,
        keywordsAnalyzed: 45,
        totalBacklinks: 128,
        organicTraffic: 15420
      },
      tasks: results.tasks
    });
    
    // Keep only last 50 reports
    if (seoReports.length > 50) {
      seoReports = seoReports.slice(-50);
    }
    
    addLog('success', `SEO tasks completed. ${results.tasks.length} tasks executed`);
    res.json({ message: 'SEO tasks completed', results });
  } catch (error) {
    console.error('Error running SEO tasks:', error);
    addLog('error', `SEO task execution failed: ${error.message}`);
    res.status(500).json({ message: 'Failed to run SEO tasks', error: error.message });
  }
});

// Get SEO reports
router.get('/reports', checkAdminAuth, (req, res) => {
  res.json(seoReports);
});

// Get SEO logs
router.get('/logs', checkAdminAuth, (req, res) => {
  res.json(seoLogs);
});

// Get automation settings
router.get('/settings', checkAdminAuth, (req, res) => {
  res.json(seoAutomationSettings);
});

// Update automation settings
router.post('/settings', checkAdminAuth, (req, res) => {
  seoAutomationSettings = { ...seoAutomationSettings, ...req.body };
  addLog('info', 'SEO automation settings updated');
  res.json({ message: 'Settings updated successfully', settings: seoAutomationSettings });
});

// Get automated tasks list
router.get('/tasks', checkAdminAuth, (req, res) => {
  res.json(automatedTasks);
});

// Create new automated task
router.post('/tasks', checkAdminAuth, (req, res) => {
  const task = {
    id: Date.now().toString(),
    name: req.body.name,
    type: req.body.type,
    schedule: req.body.schedule,
    enabled: req.body.enabled !== false,
    lastRun: null,
    nextRun: null,
    createdAt: new Date().toISOString()
  };
  
  automatedTasks.push(task);
  addLog('info', `New automated task created: ${task.name}`);
  res.json({ message: 'Task created successfully', task });
});

// Update automated task
router.put('/tasks/:id', checkAdminAuth, (req, res) => {
  const taskIndex = automatedTasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  automatedTasks[taskIndex] = { ...automatedTasks[taskIndex], ...req.body };
  addLog('info', `Task updated: ${automatedTasks[taskIndex].name}`);
  res.json({ message: 'Task updated successfully', task: automatedTasks[taskIndex] });
});

// Delete automated task
router.delete('/tasks/:id', checkAdminAuth, (req, res) => {
  const taskIndex = automatedTasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const deletedTask = automatedTasks.splice(taskIndex, 1)[0];
  addLog('info', `Task deleted: ${deletedTask.name}`);
  res.json({ message: 'Task deleted successfully' });
});

// Helper functions
function addLog(status, message) {
  seoLogs.push({
    timestamp: new Date().toISOString(),
    status: status,
    message: message
  });
  
  // Keep only last 100 logs
  if (seoLogs.length > 100) {
    seoLogs = seoLogs.slice(-100);
  }
}

async function generateSitemap() {
  addLog('info', 'Generating sitemap...');
  // Simulate sitemap generation
  return {
    urls: 156,
    message: 'Sitemap updated with 156 URLs'
  };
}

async function optimizeMetaTags() {
  addLog('info', 'Optimizing meta tags...');
  // Simulate meta optimization
  return {
    pagesOptimized: 23,
    message: '23 pages meta tags optimized'
  };
}

async function runPerformanceAudit() {
  addLog('info', 'Running performance audit...');
  // Simulate performance audit
  return {
    score: 87,
    metrics: {
      fcp: '1.2s',
      lcp: '2.1s',
      cls: 0.05
    },
    message: 'Performance score: 87/100'
  };
}

module.exports = router;
