#!/usr/bin/env node

/**
 * Backlink Automation Agent
 * 
 * Automated backlink building system that:
 * - Generates SEO content using AI
 * - Submits to directories, forums, and guest post sites
 * - Tracks submissions and monitors backlink health
 * - Reports on backlink acquisition progress
 * 
 * Usage:
 *   npm run backlink-agent     # Start the agent
 *   npm run backlink-now       # Run once immediately
 *   npm run backlink-report    # Generate report
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:5001',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  
  // Schedule settings - AGGRESSIVE MODE
  submissionsPerDay: parseInt(process.env.SUBMISSIONS_PER_DAY) || 5000, // High limit
  submissionsPerHour: parseInt(process.env.SUBMISSIONS_PER_HOUR) || 200, // 200 per hour
  submissionInterval: parseInt(process.env.SUBMISSION_INTERVAL) || 18, // 18 seconds between submissions (200/hour)
  reportInterval: parseInt(process.env.REPORT_INTERVAL) || 60, // Report every 60 minutes
  
  // Logging
  logsFile: path.join(__dirname, 'backlink-logs.json'),
  reportsFile: path.join(__dirname, 'backlink-reports.json'),
  
  // Platform priorities (which to submit to first)
  platformPriority: [
    'directories',
    'travelDirectories', 
    'web2Sites',
    'socialBookmarks',
    'forums',
    'guestPostSites',
    'pressRelease'
  ]
};

// State
let authToken = null;
let logs = [];
let reports = [];

// Load existing logs
try {
  if (fs.existsSync(config.logsFile)) {
    logs = JSON.parse(fs.readFileSync(config.logsFile, 'utf8'));
  }
} catch (e) {
  console.error('⚠️ Could not load logs:', e.message);
  logs = [];
}

// Load existing reports
try {
  if (fs.existsSync(config.reportsFile)) {
    reports = JSON.parse(fs.readFileSync(config.reportsFile, 'utf8'));
  }
} catch (e) {
  console.error('⚠️ Could not load reports:', e.message);
  reports = [];
}

/**
 * Save logs to file
 */
function saveLogs() {
  try {
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    fs.writeFileSync(config.logsFile, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error('❌ Failed to save logs:', e.message);
  }
}

/**
 * Save reports to file
 */
function saveReports() {
  try {
    // Keep only last 100 reports
    if (reports.length > 100) {
      reports = reports.slice(-100);
    }
    fs.writeFileSync(config.reportsFile, JSON.stringify(reports, null, 2));
  } catch (e) {
    console.error('❌ Failed to save reports:', e.message);
  }
}

/**
 * Log a message
 */
function log(level, message, data = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  
  logs.push(entry);
  
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    action: '🔗'
  }[level] || '📝';
  
  console.log(`${emoji} [${new Date().toLocaleTimeString()}] ${message}`);
  if (data) {
    console.log('   ', JSON.stringify(data, null, 2).split('\n').join('\n    '));
  }
  
  saveLogs();
}

/**
 * Authenticate with the API
 */
async function authenticate() {
  try {
    log('info', 'Authenticating with API...');
    
    const response = await axios.post(`${config.apiUrl}/api/admin/login`, {
      email: config.adminEmail,
      password: config.adminPassword,
      captchaToken: 'agent-bypass' // In production, handle this properly
    });
    
    // Check for token in response (API returns {token, admin} on success)
    if (response.data.token) {
      authToken = response.data.token;
      log('success', 'Authentication successful');
      return true;
    }
    
    log('error', 'Authentication failed', response.data);
    return false;
  } catch (error) {
    log('error', 'Authentication error', { message: error.message });
    return false;
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest(method, endpoint, data = null) {
  try {
    const requestConfig = {
      method,
      url: `${config.apiUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Only include data for POST/PUT/PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestConfig.data = data;
    }
    
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      log('warning', 'Token expired, re-authenticating...');
      if (await authenticate()) {
        return apiRequest(method, endpoint, data);
      }
    }
    throw error;
  }
}

/**
 * Get current backlink stats
 */
async function getStats() {
  try {
    const response = await apiRequest('GET', '/api/backlinks/stats');
    return response.stats;
  } catch (error) {
    log('error', 'Failed to get stats', { message: error.message });
    return null;
  }
}

/**
 * Get available opportunities
 */
async function getOpportunities() {
  try {
    const response = await apiRequest('GET', '/api/backlinks/opportunities');
    return response.opportunities || [];
  } catch (error) {
    log('error', 'Failed to get opportunities', { message: error.message });
    return [];
  }
}

/**
 * Get platforms
 */
async function getPlatforms() {
  try {
    const response = await apiRequest('GET', '/api/backlinks/platforms');
    return response.platforms || {};
  } catch (error) {
    log('error', 'Failed to get platforms', { message: error.message });
    return {};
  }
}

/**
 * Generate content for a platform type
 */
async function generateContent(type, context = {}) {
  try {
    const response = await apiRequest('POST', '/api/backlinks/generate', {
      type,
      context
    });
    return response;
  } catch (error) {
    log('error', 'Failed to generate content', { type, message: error.message });
    return null;
  }
}

/**
 * Simulate submission to a platform
 */
async function submitToPlatform(platformType, platformIndex) {
  try {
    const response = await apiRequest('POST', '/api/backlinks/submit/simulate', {
      platformType,
      platformIndex
    });
    return response;
  } catch (error) {
    log('error', 'Failed to submit', { platformType, platformIndex, message: error.message });
    return null;
  }
}

/**
 * Select best platform for submission - ROTATING through all platforms
 */
let platformRotationIndex = 0;
let categoryRotationIndex = 0;

function selectPlatform(platforms, opportunities) {
  const categories = Object.keys(platforms).filter(cat => platforms[cat]?.length > 0);
  
  if (categories.length === 0) {
    return null;
  }
  
  // Rotate through categories
  const category = categories[categoryRotationIndex % categories.length];
  const categoryPlatforms = platforms[category] || [];
  
  if (categoryPlatforms.length === 0) {
    categoryRotationIndex++;
    return selectPlatform(platforms, opportunities); // Try next category
  }
  
  // Rotate through platforms within category
  const index = platformRotationIndex % categoryPlatforms.length;
  const platform = categoryPlatforms[index];
  
  // Move to next platform for next call
  platformRotationIndex++;
  if (platformRotationIndex >= categoryPlatforms.length) {
    platformRotationIndex = 0;
    categoryRotationIndex++; // Move to next category
  }
  
  return { category, index, platform };
}

/**
 * Run a single submission cycle
 */
async function runSubmissionCycle() {
  log('info', '🔄 Starting submission cycle...');
  
  const stats = await getStats();
  if (!stats) {
    log('error', 'Could not get stats, aborting cycle');
    return false;
  }
  
  // Check if we've hit daily limit
  if (stats.submissions.today >= config.submissionsPerDay) {
    log('info', `Daily limit reached (${stats.submissions.today}/${config.submissionsPerDay})`);
    return false;
  }
  
  const opportunities = await getOpportunities();
  const platforms = await getPlatforms();
  
  // Select platform
  const selected = selectPlatform(platforms, opportunities);
  if (!selected) {
    log('warning', 'No suitable platform found for submission');
    return false;
  }
  
  log('action', `Submitting to ${selected.platform.name}`, {
    category: selected.category,
    url: selected.platform.url
  });
  
  // Submit
  const result = await submitToPlatform(selected.category, selected.index);
  
  if (result?.success) {
    log('success', `Successfully submitted to ${selected.platform.name}`, {
      submissionId: result.submission?.id
    });
    return true;
  }
  
  log('error', `Submission to ${selected.platform.name} failed`);
  return false;
}

/**
 * Generate daily report
 */
async function generateReport() {
  log('info', '📊 Generating daily report...');
  
  const stats = await getStats();
  if (!stats) {
    log('error', 'Could not get stats for report');
    return null;
  }
  
  const report = {
    date: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
    backlinks: stats.backlinks,
    submissions: stats.submissions,
    todayActivity: {
      submitted: stats.submissions.today,
      limit: config.submissionsPerDay
    },
    recommendations: []
  };
  
  // Add recommendations
  if (stats.backlinks.total < 10) {
    report.recommendations.push('Focus on directory submissions to build foundational backlinks');
  }
  if (stats.backlinks.avgDomainRating < 30) {
    report.recommendations.push('Target higher DR sites like Medium, LinkedIn, and major directories');
  }
  if (stats.submissions.pending > 10) {
    report.recommendations.push('Review pending submissions and follow up on approvals');
  }
  if (stats.backlinks.dofollow < stats.backlinks.nofollow) {
    report.recommendations.push('Prioritize platforms that offer dofollow links');
  }
  
  reports.push(report);
  saveReports();
  
  log('success', 'Report generated', report);
  return report;
}

/**
 * Print report to console
 */
function printReport(report) {
  console.log('\n========================================');
  console.log('       BACKLINK AGENT DAILY REPORT');
  console.log('========================================\n');
  console.log(`Date: ${report.date}`);
  console.log(`Generated: ${new Date(report.generatedAt).toLocaleString()}\n`);
  
  console.log('📊 BACKLINKS SUMMARY');
  console.log('--------------------');
  console.log(`Total Backlinks: ${report.backlinks.total}`);
  console.log(`  ├─ Dofollow: ${report.backlinks.dofollow}`);
  console.log(`  ├─ Nofollow: ${report.backlinks.nofollow}`);
  console.log(`  ├─ Active: ${report.backlinks.active}`);
  console.log(`  └─ Unique Domains: ${report.backlinks.uniqueDomains}`);
  console.log(`Avg Domain Rating: ${report.backlinks.avgDomainRating}\n`);
  
  console.log('📤 SUBMISSIONS');
  console.log('--------------');
  console.log(`Total: ${report.submissions.total}`);
  console.log(`  ├─ Pending: ${report.submissions.pending}`);
  console.log(`  ├─ Approved: ${report.submissions.approved}`);
  console.log(`  └─ Rejected: ${report.submissions.rejected}`);
  console.log(`Today: ${report.todayActivity.submitted}/${report.todayActivity.limit}\n`);
  
  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('------------------');
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }
  
  console.log('\n========================================\n');
}

/**
 * Main agent loop
 */
async function runAgent() {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║       BACKLINK AUTOMATION AGENT           ║');
  console.log('║         Automated SEO Backlinks           ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  Submissions/Day: ${String(config.submissionsPerDay).padEnd(23)}║`);
  console.log(`║  Interval: ${String(config.submissionInterval + ' hours').padEnd(30)}║`);
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  
  // Authenticate
  if (!await authenticate()) {
    log('error', 'Failed to authenticate, exiting');
    process.exit(1);
  }
  
  // Initial report
  const initialReport = await generateReport();
  if (initialReport) {
    printReport(initialReport);
  }
  
  // Run initial cycle
  await runSubmissionCycle();
  
  // AGGRESSIVE MODE: Submit every 18 seconds (200/hour)
  const intervalMs = config.submissionInterval * 1000; // Now in seconds, not hours
  
  log('info', `🚀 AGGRESSIVE MODE: Submitting every ${config.submissionInterval} seconds (${config.submissionsPerHour}/hour target)`);
  
  let hourlyCount = 0;
  let lastHourReset = Date.now();
  
  const submissionLoop = async () => {
    // Reset hourly counter every hour
    if (Date.now() - lastHourReset >= 3600000) {
      log('info', `📊 Hourly Summary: ${hourlyCount} submissions in the last hour`);
      hourlyCount = 0;
      lastHourReset = Date.now();
    }
    
    // Check if we hit hourly limit
    if (hourlyCount >= config.submissionsPerHour) {
      log('info', `⏸️ Hourly limit reached (${hourlyCount}/${config.submissionsPerHour}), waiting for next hour...`);
      return;
    }
    
    const success = await runSubmissionCycle();
    if (success) {
      hourlyCount++;
      
      // Progress update every 10 submissions
      if (hourlyCount % 10 === 0) {
        log('info', `📈 Progress: ${hourlyCount}/${config.submissionsPerHour} submissions this hour`);
      }
    }
  };
  
  setInterval(submissionLoop, intervalMs);
  
  // Report every hour (configurable)
  const reportIntervalMs = config.reportInterval * 60 * 1000;
  log('info', `📊 Reports scheduled every ${config.reportInterval} minutes`);
  
  setInterval(async () => {
    const report = await generateReport();
    if (report) {
      printReport(report);
    }
  }, reportIntervalMs);
  
  log('info', 'Agent started successfully');
}

/**
 * Run once and exit
 */
async function runOnce() {
  console.log('🔗 Running backlink submission once...\n');
  
  if (!await authenticate()) {
    log('error', 'Failed to authenticate');
    process.exit(1);
  }
  
  const success = await runSubmissionCycle();
  
  console.log('\n' + (success ? '✅ Submission completed' : '❌ Submission failed'));
  process.exit(success ? 0 : 1);
}

/**
 * Generate and print report only
 */
async function runReport() {
  console.log('📊 Generating backlink report...\n');
  
  if (!await authenticate()) {
    log('error', 'Failed to authenticate');
    process.exit(1);
  }
  
  const report = await generateReport();
  if (report) {
    printReport(report);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

/**
 * Print recent logs
 */
function printLogs(count = 50) {
  console.log(`\n📜 Recent Backlink Agent Logs (last ${count}):\n`);
  
  const recentLogs = logs.slice(-count);
  
  recentLogs.forEach(entry => {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      action: '🔗'
    }[entry.level] || '📝';
    
    console.log(`${emoji} [${entry.timestamp}] ${entry.message}`);
  });
  
  console.log('');
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'once':
  case 'now':
  case 'run-now':
    runOnce();
    break;
    
  case 'report':
    runReport();
    break;
    
  case 'logs':
    printLogs(parseInt(args[1]) || 50);
    break;
    
  case 'daemon':
  case 'start':
  default:
    runAgent();
    break;
}
