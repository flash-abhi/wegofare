# 🤖 SEO Automation Agent - Complete Guide

## What It Does

Your website now has a **fully automated SEO agent** that runs daily optimization tasks without any manual intervention! 

### Daily Automated Tasks (Runs at 3:00 AM)

1. **Site Health Audit** 🔍
   - Checks 50+ SEO factors
   - Identifies errors, warnings, and successes
   - Generates health score (0-100)

2. **Keyword Analysis** 🔑
   - Monitors 8 critical travel keywords
   - Tracks search volume and difficulty
   - Identifies new opportunities

3. **Backlink Monitoring** 🔗
   - Counts total backlinks
   - Tracks referring domains
   - Monitors domain authority changes

4. **Analytics Tracking** 📊
   - Organic traffic trends
   - Keyword ranking positions
   - Click-through rates
   - Position improvements

5. **Content Suggestions** 💡
   - AI-generated blog topics
   - Keyword-optimized titles
   - Traffic estimates
   - Target audience insights

6. **Meta Tag Optimization** 🏷️
   - SEO-friendly titles
   - Optimized descriptions
   - Keyword recommendations

7. **Competitor Analysis** 👁️
   - Weekly monitoring (Mondays)
   - Traffic comparisons
   - Authority tracking

## Quick Start

### Option 1: Use the Admin Dashboard (Easiest)

1. Log into your Admin Panel
2. Go to **SEO** section
3. Click the **🤖 Automation** tab
4. Click **▶️ Start Agent**
5. Done! The agent is now running 24/7

### Option 2: Command Line

```bash
cd /Users/sachinrawat/Desktop/N/flight
./start-seo-agent.sh
```

### Option 3: Manual Setup

```bash
# Install PM2
npm install -g pm2

# Start the agent
cd seo-automation
npm install
pm2 start seo-agent.js --name seo-agent
pm2 save
```

## Using the Admin Dashboard

### Automation Tab Features

**Agent Status**
- 🟢 Running / 🔴 Stopped indicator
- Uptime information
- Restart count

**Control Buttons**
- ▶️ **Start Agent** - Begin 24/7 automation
- ⏹️ **Stop Agent** - Pause automation
- 🚀 **Run Now** - Execute tasks immediately (don't wait for 3 AM)
- 🔄 **Refresh Data** - Update reports and logs

**Scheduled Tasks**
- 🕒 3:00 AM Daily - Full SEO audit
- 🕒 9:00 AM Monday - Competitor analysis
- 🕒 Every 6 hours - Quick health check

**Reports Section**
Shows last 5 daily reports with:
- Site health score
- Keywords analyzed
- Backlinks count
- Organic traffic

**Activity Logs**
Real-time feed of agent actions:
- Last 20 activities
- Status (Success/Failed)
- Timestamps

## Command Line Usage

```bash
# Check status
pm2 status seo-agent

# View live logs
pm2 logs seo-agent

# View last 100 log lines
pm2 logs seo-agent --lines 100

# Restart agent
pm2 restart seo-agent

# Stop agent
pm2 stop seo-agent

# Real-time monitoring dashboard
pm2 monit

# Run tasks immediately (manual)
cd seo-automation
npm run run-now

# View recent reports
npm run report

# View activity logs
npm run logs
```

## Schedule Details

### Daily Tasks (3:00 AM)
- **Duration**: ~45-60 seconds
- **Frequency**: Every day
- **What it does**: All 7 automated tasks
- **Output**: Full daily report saved

### Weekly Tasks (Monday 9:00 AM)
- **Duration**: ~15 seconds
- **Frequency**: Every Monday
- **What it does**: Competitor analysis
- **Output**: Competitor insights

### Health Checks (Every 6 hours)
- **Duration**: ~10 seconds
- **Frequency**: 4 times per day
- **What it does**: Quick site audit
- **Output**: Health score only

## Reports & Data

### Where Reports are Saved
- **Location**: `seo-automation/seo-reports.json`
- **Retention**: Last 90 days
- **Format**: JSON
- **Access**: Via Admin Dashboard or file

### Sample Report Structure
```json
{
  "date": "2025-11-28",
  "duration": "45.23s",
  "summary": {
    "siteHealth": 72,
    "keywordsAnalyzed": 8,
    "totalBacklinks": 3847,
    "organicTraffic": 15234,
    "contentIdeas": 5
  },
  "results": {
    "siteAudit": {...},
    "keywords": [...],
    "backlinks": {...},
    "analytics": {...},
    "contentSuggestions": [...],
    "metaTags": {...},
    "competitors": [...]
  }
}
```

### Activity Logs
- **Location**: `seo-automation/seo-logs.json`
- **Retention**: Last 1000 entries
- **Real-time**: Updated as tasks run

## Auto-Start on Server Reboot

To ensure the agent starts automatically when your server reboots:

```bash
pm2 startup
# Follow the command it shows
pm2 save
```

Now the agent will automatically restart even after:
- Server reboots
- Power failures
- Manual restarts

## Monitoring & Alerts

### Check Agent Health
```bash
# Quick status check
pm2 status seo-agent

# Is it running?
pm2 list | grep seo-agent

# Memory and CPU usage
pm2 monit
```

### View Performance
The agent tracks:
- Task completion time
- Success/failure rates
- API response times
- Error counts

## Customization

### Change Schedule Times

Edit `seo-automation/seo-agent.js`:

```javascript
// Daily tasks (default: 3:00 AM)
cron.schedule('0 3 * * *', async () => {
  await this.runDailyTasks();
});

// Change to 2:00 AM:
cron.schedule('0 2 * * *', async () => {
  await this.runDailyTasks();
});
```

### Add More Keywords

Edit the keywords array in `seo-automation/seo-agent.js`:

```javascript
const keywords = [
  'cheap flights',
  'flight deals',
  'YOUR NEW KEYWORD HERE'
];
```

### Add Custom Tasks

Add your own automation logic in `seo-agent.js`:

```javascript
async runDailyTasks() {
  // ... existing tasks ...
  results.customTask = await this.yourCustomTask();
}

async yourCustomTask() {
  // Your custom automation code
}
```

## Troubleshooting

### Agent Not Starting

**Problem**: Click "Start Agent" but nothing happens

**Solution**:
```bash
# Install PM2
npm install -g pm2

# Try starting manually
cd seo-automation
pm2 start seo-agent.js --name seo-agent
```

### No Reports Generated

**Problem**: Reports array is empty

**Solutions**:
1. Check if backend is running: `lsof -i :5001`
2. Run tasks manually: `cd seo-automation && npm run run-now`
3. Check for errors: `pm2 logs seo-agent --err`

### Tasks Failing

**Problem**: Logs show "Failed" status

**Possible Causes**:
1. OpenAI API key missing/invalid
2. Backend server not running
3. Network connectivity issues

**Solutions**:
1. Check `.env` file has valid `OPENAI_API_KEY`
2. Start backend: `PORT=5001 node server.js &`
3. Test manually: `npm run run-now`

### High Memory Usage

**Problem**: PM2 shows high memory consumption

**Solution**:
```bash
# Restart agent
pm2 restart seo-agent

# Set memory limit
pm2 start seo-agent.js --name seo-agent --max-memory-restart 300M
```

## Benefits

✅ **24/7 Automation** - Works while you sleep
✅ **No Manual Work** - Set it and forget it
✅ **Consistent Optimization** - Never miss a day
✅ **Data-Driven Insights** - Make informed decisions
✅ **Competitive Edge** - Stay ahead of competitors
✅ **Cost Effective** - Saves hours of manual SEO work
✅ **Historical Tracking** - 90 days of trend data

## Performance Impact

- **CPU Usage**: < 5% during tasks (< 1% idle)
- **Memory**: ~50-100 MB
- **Disk Space**: < 10 MB for logs/reports
- **Network**: Minimal (API calls only)

## Security

- All API keys stored in `.env` file
- JWT tokens for admin endpoints
- Logs contain no sensitive data
- Reports saved locally only

## Integration with Other Tools

The agent can be integrated with:
- Google Analytics API
- Google Search Console
- Ahrefs API
- SEMrush API
- Moz API

(Requires additional setup and API keys)

## Support & Maintenance

### Weekly Checks (Recommended)
- Review last 7 reports
- Check for consistent failures
- Monitor traffic trends
- Adjust keywords if needed

### Monthly Reviews
- Analyze 30-day trends
- Update keyword list
- Review competitor data
- Optimize schedule times

## Advanced Usage

### Export Reports to CSV

```bash
cd seo-automation
node -e "const reports = require('./seo-reports.json'); console.log('date,health,traffic'); reports.forEach(r => console.log(\`\${r.date},\${r.summary.siteHealth},\${r.summary.organicTraffic}\`));" > reports.csv
```

### Send Email Alerts

Add nodemailer to send daily summaries:

```bash
npm install nodemailer
```

Then customize the agent to email reports.

### Webhook Integration

Send reports to Slack, Discord, etc:

```javascript
// In seo-agent.js after runDailyTasks()
await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  body: JSON.stringify(report)
});
```

## Next Steps

1. ✅ Start the agent
2. ✅ Monitor first report (run manually with "Run Now")
3. ✅ Review daily reports in dashboard
4. ✅ Adjust keywords based on insights
5. ✅ Set up auto-restart on reboot
6. ✅ Schedule weekly reviews

---

**Your SEO is now on autopilot! 🚀**

Questions? Check the logs first:
```bash
pm2 logs seo-agent
```
