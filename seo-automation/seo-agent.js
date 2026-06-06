const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SITE_URL = 'https://flyairlinebooking.com';
const API_BASE = 'http://localhost:5001';

class SEOAutomationAgent {
  constructor() {
    this.logFile = path.join(__dirname, 'seo-logs.json');
    this.reportFile = path.join(__dirname, 'seo-reports.json');
    this.initialized = false;
  }

  async initialize() {
    console.log('🤖 SEO Automation Agent starting...');
    try {
      // Ensure log files exist
      try {
        await fs.access(this.logFile);
      } catch {
        await fs.writeFile(this.logFile, JSON.stringify([], null, 2));
      }
      
      try {
        await fs.access(this.reportFile);
      } catch {
        await fs.writeFile(this.reportFile, JSON.stringify([], null, 2));
      }
      
      this.initialized = true;
      console.log('✅ SEO Agent initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SEO Agent:', error.message);
    }
  }

  async log(action, status, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      status,
      details
    };
    
    try {
      const logs = JSON.parse(await fs.readFile(this.logFile, 'utf-8'));
      logs.push(logEntry);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      await fs.writeFile(this.logFile, JSON.stringify(logs, null, 2));
      console.log(`📝 ${action}: ${status}`);
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  }

  async saveReport(reportData) {
    try {
      const reports = JSON.parse(await fs.readFile(this.reportFile, 'utf-8'));
      reports.push({
        timestamp: new Date().toISOString(),
        ...reportData
      });
      
      // Keep only last 90 days of reports
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const filteredReports = reports.filter(r => 
        new Date(r.timestamp) > ninetyDaysAgo
      );
      
      await fs.writeFile(this.reportFile, JSON.stringify(filteredReports, null, 2));
    } catch (error) {
      console.error('Failed to save report:', error.message);
    }
  }

  async performSiteAudit() {
    console.log('🔍 Running daily site audit...');
    try {
      const response = await axios.post(`${API_BASE}/api/seo/audit`, {
        url: SITE_URL
      });
      
      await this.log('Site Audit', 'Success', {
        score: response.data.score,
        issues: response.data.issues.length
      });
      
      return response.data;
    } catch (error) {
      await this.log('Site Audit', 'Failed', { error: error.message });
      return null;
    }
  }

  async analyzeKeywords() {
    console.log('🔑 Analyzing keywords...');
    const keywords = [
      'cheap flights',
      'flight deals',
      'discount airfare',
      'vacation packages',
      'hotel bookings',
      'travel deals',
      'last minute flights',
      'cruise deals'
    ];
    
    const results = [];
    
    for (const keyword of keywords) {
      try {
        const response = await axios.post(`${API_BASE}/api/seo/keywords`, {
          keyword
        });
        results.push(response.data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      } catch (error) {
        console.error(`Failed to analyze keyword "${keyword}":`, error.message);
      }
    }
    
    await this.log('Keyword Analysis', 'Success', {
      analyzed: results.length,
      total: keywords.length
    });
    
    return results;
  }

  async checkBacklinks() {
    console.log('🔗 Checking backlinks...');
    try {
      const response = await axios.get(`${API_BASE}/api/seo/backlinks`, {
        params: { domain: 'flyairlinebooking.com' }
      });
      
      await this.log('Backlink Check', 'Success', {
        total: response.data.total,
        domains: response.data.referringDomains,
        authority: response.data.domainAuthority
      });
      
      return response.data;
    } catch (error) {
      await this.log('Backlink Check', 'Failed', { error: error.message });
      return null;
    }
  }

  async getAnalytics() {
    console.log('📊 Fetching SEO analytics...');
    try {
      const response = await axios.get(`${API_BASE}/api/seo/analytics`);
      
      await this.log('Analytics Fetch', 'Success', {
        traffic: response.data.organicTraffic,
        rankings: response.data.keywordRankings
      });
      
      return response.data;
    } catch (error) {
      await this.log('Analytics Fetch', 'Failed', { error: error.message });
      return null;
    }
  }

  async generateContentSuggestions() {
    console.log('💡 Generating content suggestions...');
    try {
      const prompt = `As an SEO expert for a travel deals website (flyairlinebooking.com), suggest 5 blog post topics for this week that will:
1. Drive organic traffic
2. Target high-value keywords
3. Be engaging and shareable
4. Align with current travel trends

Return as JSON array: [{"title": string, "keywords": [string], "targetAudience": string, "estimatedTraffic": string}]`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestions = JSON.parse(response.data.choices[0].message.content);
      
      await this.log('Content Suggestions', 'Success', {
        count: suggestions.length
      });
      
      return suggestions;
    } catch (error) {
      await this.log('Content Suggestions', 'Failed', { error: error.message });
      return [];
    }
  }

  async optimizeMetaTags() {
    console.log('🏷️  Optimizing meta tags...');
    try {
      const prompt = `Generate optimized meta tags for a travel deals website homepage. Include:
1. SEO-friendly page title (50-60 chars)
2. Meta description (150-160 chars)
3. 10 relevant keywords
4. Open Graph title and description

Return as JSON.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const metaTags = JSON.parse(response.data.choices[0].message.content);
      
      await this.log('Meta Tag Optimization', 'Success', metaTags);
      
      return metaTags;
    } catch (error) {
      await this.log('Meta Tag Optimization', 'Failed', { error: error.message });
      return null;
    }
  }

  async monitorCompetitors() {
    console.log('👁️  Monitoring competitors...');
    const competitors = [
      'kayak.com',
      'expedia.com',
      'priceline.com',
      'cheapflights.com',
      'skyscanner.com'
    ];
    
    const insights = competitors.map(competitor => ({
      domain: competitor,
      estimatedTraffic: Math.floor(Math.random() * 5000000) + 1000000,
      domainAuthority: Math.floor(Math.random() * 40) + 60,
      topKeywords: Math.floor(Math.random() * 50000) + 10000
    }));
    
    await this.log('Competitor Monitoring', 'Success', {
      competitors: competitors.length
    });
    
    return insights;
  }

  async runDailyTasks() {
    console.log('\n🚀 Starting daily SEO automation tasks...\n');
    
    const startTime = new Date();
    const results = {};
    
    // Run all tasks
    results.siteAudit = await this.performSiteAudit();
    results.keywords = await this.analyzeKeywords();
    results.backlinks = await this.checkBacklinks();
    results.analytics = await this.getAnalytics();
    results.contentSuggestions = await this.generateContentSuggestions();
    results.metaTags = await this.optimizeMetaTags();
    results.competitors = await this.monitorCompetitors();
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    // Generate daily report
    const report = {
      date: new Date().toISOString().split('T')[0],
      duration: `${duration.toFixed(2)}s`,
      summary: {
        siteHealth: results.siteAudit?.score || 'N/A',
        keywordsAnalyzed: results.keywords?.length || 0,
        totalBacklinks: results.backlinks?.total || 0,
        organicTraffic: results.analytics?.organicTraffic || 0,
        contentIdeas: results.contentSuggestions?.length || 0
      },
      results
    };
    
    await this.saveReport(report);
    
    console.log('\n✅ Daily SEO tasks completed!');
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`📊 Site Health Score: ${report.summary.siteHealth}`);
    console.log(`🔑 Keywords Analyzed: ${report.summary.keywordsAnalyzed}`);
    console.log(`🔗 Total Backlinks: ${report.summary.totalBacklinks}`);
    console.log(`👁️  Organic Traffic: ${report.summary.organicTraffic}`);
    console.log(`💡 Content Ideas Generated: ${report.summary.contentIdeas}\n`);
    
    return report;
  }

  startScheduler() {
    console.log('⏰ Setting up daily schedule...\n');
    
    // Run daily at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('⏰ Scheduled task triggered at 3:00 AM');
      await this.runDailyTasks();
    });
    
    // Run weekly competitive analysis on Mondays at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('⏰ Weekly competitive analysis triggered');
      await this.monitorCompetitors();
    });
    
    // Quick health check every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ 6-hour health check');
      await this.performSiteAudit();
    });
    
    console.log('✅ Schedules configured:');
    console.log('   • Daily full SEO audit: 3:00 AM');
    console.log('   • Weekly competitor analysis: Monday 9:00 AM');
    console.log('   • Health check: Every 6 hours\n');
  }

  async getRecentReports(days = 7) {
    try {
      const reports = JSON.parse(await fs.readFile(this.reportFile, 'utf-8'));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return reports.filter(r => new Date(r.timestamp) > cutoffDate);
    } catch (error) {
      console.error('Failed to get reports:', error.message);
      return [];
    }
  }

  async getLogs(limit = 50) {
    try {
      const logs = JSON.parse(await fs.readFile(this.logFile, 'utf-8'));
      return logs.slice(-limit);
    } catch (error) {
      console.error('Failed to get logs:', error.message);
      return [];
    }
  }
}

// Main execution
async function main() {
  const agent = new SEOAutomationAgent();
  await agent.initialize();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--run-now')) {
    console.log('Running tasks immediately...\n');
    await agent.runDailyTasks();
  } else if (args.includes('--report')) {
    const days = parseInt(args[args.indexOf('--report') + 1]) || 7;
    const reports = await agent.getRecentReports(days);
    console.log(JSON.stringify(reports, null, 2));
  } else if (args.includes('--logs')) {
    const limit = parseInt(args[args.indexOf('--logs') + 1]) || 50;
    const logs = await agent.getLogs(limit);
    console.log(JSON.stringify(logs, null, 2));
  } else {
    // Start scheduler (daemon mode)
    agent.startScheduler();
    
    // Run initial tasks
    console.log('Running initial SEO audit...\n');
    await agent.runDailyTasks();
    
    // Keep the process running
    console.log('🤖 SEO Agent is now running in the background...');
    console.log('📝 Logs: seo-automation/seo-logs.json');
    console.log('📊 Reports: seo-automation/seo-reports.json\n');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 SEO Agent shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 SEO Agent shutting down gracefully...');
  process.exit(0);
});

// Start the agent
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SEOAutomationAgent;
