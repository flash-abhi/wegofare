# SEO Automation Agent 🤖

Automated daily SEO optimization and monitoring system for Fly Travel Deals.

## Features

✅ **Daily Site Audits** - Complete SEO health checks every day at 3 AM
✅ **Keyword Analysis** - Automatic tracking of 8+ critical travel keywords
✅ **Backlink Monitoring** - Track backlinks and domain authority
✅ **Analytics Tracking** - Monitor organic traffic and rankings
✅ **Content Suggestions** - AI-generated blog post ideas weekly
✅ **Meta Tag Optimization** - Automatic meta tag recommendations
✅ **Competitor Analysis** - Weekly monitoring of top competitors
✅ **Detailed Reports** - JSON reports saved for 90 days
✅ **Activity Logs** - Last 1000 actions tracked

## Installation

```bash
cd seo-automation
npm install
```

## Usage

### Start the Agent (Background Mode)

```bash
npm start
```

This starts the agent with scheduled tasks:
- **3:00 AM Daily** - Full SEO audit and optimization
- **9:00 AM Monday** - Weekly competitor analysis
- **Every 6 hours** - Quick health check

### Run Tasks Immediately

```bash
npm run run-now
```

### View Reports (Last 7 Days)

```bash
npm run report
```

### View Recent Logs

```bash
npm run logs
```

### Run as Daemon (Production)

Install PM2 globally first:
```bash
npm install -g pm2
```

Then run:
```bash
npm run daemon    # Start as background service
npm run status    # Check status
npm run restart   # Restart service
npm run stop      # Stop service
```

To auto-start on system reboot:
```bash
pm2 startup
pm2 save
```

## Daily Tasks Performed

1. **Site Audit** 🔍
   - SEO health score
   - Technical issues detection
   - Performance metrics

2. **Keyword Analysis** 🔑
   - Search volume tracking
   - Difficulty scoring
   - Opportunity identification
   - Related keywords discovery

3. **Backlink Check** 🔗
   - Total backlinks count
   - Referring domains
   - Domain authority
   - Recent backlinks list

4. **Analytics** 📊
   - Organic traffic trends
   - Keyword rankings
   - Click-through rates
   - Position changes

5. **Content Ideas** 💡
   - AI-generated topics
   - Keyword-optimized titles
   - Target audience analysis
   - Traffic estimates

6. **Meta Optimization** 🏷️
   - Title tag suggestions
   - Meta descriptions
   - Keyword recommendations
   - Open Graph tags

7. **Competitor Monitoring** 👁️
   - Traffic estimates
   - Domain authority
   - Top keywords count

## Reports & Logs

### Reports Location
`seo-automation/seo-reports.json`

Each report contains:
- Date and duration
- Site health score
- Keywords analyzed
- Backlinks count
- Organic traffic
- Content suggestions
- Full results from all tasks

### Logs Location
`seo-automation/seo-logs.json`

Each log entry includes:
- Timestamp
- Action performed
- Status (Success/Failed)
- Detailed results

## Configuration

The agent uses environment variables from the root `.env` file:
- `OPENAI_API_KEY` - For AI-powered content and keyword analysis

## Monitoring

Check agent status:
```bash
pm2 status seo-agent
pm2 logs seo-agent
pm2 monit
```

## Sample Daily Report

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
  }
}
```

## Commands Cheat Sheet

```bash
# Development
npm start              # Start with scheduler
npm run run-now        # Run tasks immediately
npm run report         # View last 7 days reports
npm run logs           # View last 100 log entries

# Production (with PM2)
npm run daemon         # Start as background service
npm run stop           # Stop the service
npm run restart        # Restart the service
npm run status         # Check service status

# PM2 Advanced
pm2 logs seo-agent --lines 100   # View logs
pm2 monit                        # Real-time monitoring
pm2 restart seo-agent --cron "0 3 * * *"  # Restart daily at 3 AM
```

## Troubleshooting

**Agent not running?**
```bash
pm2 status seo-agent
pm2 logs seo-agent --err
```

**No reports generated?**
- Check if backend server is running on port 5001
- Verify OPENAI_API_KEY in `.env`
- Check logs with `npm run logs`

**Tasks failing?**
- Ensure backend API is accessible
- Check internet connection
- Verify API key is valid

## Benefits

- 🕐 **24/7 Monitoring** - Never miss SEO opportunities
- 📈 **Data-Driven** - Make decisions based on real metrics
- 🤖 **Fully Automated** - No manual intervention needed
- 📊 **Historical Data** - 90 days of reports for trend analysis
- 💰 **Cost-Effective** - Automated tasks save hours of manual work
- 🎯 **Actionable Insights** - Clear recommendations for improvement

## Support

For issues or questions, check the logs first:
```bash
tail -f seo-automation/seo-logs.json
```

---

**Powered by AI & Automation** 🚀
