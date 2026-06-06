# External Blog Publishing Setup Guide

This guide explains how to set up automated blog publishing to high-authority websites for maximum SEO impact.

## Overview

The wegofare.com admin dashboard can automatically publish AI-generated travel blogs to multiple high-authority platforms with Domain Authority (DA) scores of 85-99. This provides:

- **Instant Distribution**: One-click publishing to 5+ platforms
- **SEO Benefits**: Backlinks from high-DA sites (85-99)
- **Canonical URLs**: Prevents duplicate content penalties
- **Manual Fallback**: Detailed instructions if API keys aren't configured

## Supported Platforms

| Platform | DA Score | API Support | Manual Support |
|----------|----------|-------------|----------------|
| Tumblr | 99 | Coming Soon | ✅ Yes |
| LinkedIn | 98 | Coming Soon | ✅ Yes |
| Blogger | 94 | Coming Soon | ✅ Yes |
| Medium | 95 | ✅ Yes | ✅ Yes |
| WordPress.com | 92 | ✅ Yes | ✅ Yes |
| Dev.to | 90 | ✅ Yes | ✅ Yes |
| Hashnode | 88 | ✅ Yes | ✅ Yes |
| Ghost | 85 | ✅ Yes | ✅ Yes |

## Quick Start

### 1. Copy Environment Template

5. Enter a description (e.g., "skyfaretravels Publishing")
cd backend
cp .env.example .env
```

### 2. Configure API Keys

Edit `backend/.env` and add at least one platform's API key:

```bash
# Minimum configuration
JWT_SECRET=your-random-secret-key-here
MEDIUM_API_KEY=your-medium-api-key-here
5. Give it a description (e.g., "skyfaretravels Blog Publisher")

### 3. Restart Backend Server

```bash
# From the backend directory
npm run dev
```

### 4. Test Publishing

1. Go to Admin Dashboard > Blog Management
5. Copy the Personal Access Token to `.env`:
3. Click the 🚀 (rocket) button next to any blog post
4. View publishing results

## API Key Setup Instructions

### Medium (Recommended - DA 95)

1. Log in to [Medium](https://medium.com)
2. Go to Settings: https://medium.com/me/settings
3. Click "Security and apps" in the sidebar
4. Scroll to "Integration tokens"
5. Enter a description (e.g., "FlyTravelDeals Publishing")
6. Click "Get integration token"
7. Copy the token to `.env`:
   ```
   MEDIUM_API_KEY=your-token-here
   ```

**Features:**
- Supports markdown
- Canonical URLs
- Tag support
- Draft/publish options

### Dev.to (DA 90)

1. Log in to [Dev.to](https://dev.to)
2. Go to Settings: https://dev.to/settings/extensions
This tells search engines that wegofare.com is the original source, preventing duplicate content penalties while gaining backlink benefits.
4. Click "Generate API Key"
5. Give it a description (e.g., "FlyTravelDeals Blog Publisher")
6. Copy the API key to `.env`:
   ```
   DEVTO_API_KEY=your-key-here
   ```

**Features:**
✅ Already handled! Every published post includes canonical URLs pointing to wegofare.com as the original source.
- Canonical URLs
- Tag system
- Series support

### Hashnode (DA 88)

1. Log in to [Hashnode](https://hashnode.com)
2. Go to Settings > Developer: https://hashnode.com/settings/developer
3. Click "Generate New Token"
4. Name it (e.g., "FlyTravelDeals Publisher")
5. Copy the Personal Access Token to `.env`:
   ```
   HASHNODE_API_KEY=your-token-here
   ```
Should show:
```html
<link rel="canonical" href="https://wegofare.com/blog/your-slug">
```
6. Get your Publication ID:
   - Go to your blog dashboard
   - Check the URL: `hashnode.com/[username]` or your custom domain
   - Your publication ID is shown in blog settings
   ```
   HASHNODE_PUBLICATION_ID=your-publication-id
   ```

**Features:**
- GraphQL API
- Markdown support
- SEO optimization
- Custom domain support

### WordPress.com (DA 92)

1. Create a WordPress.com app: https://developer.wordpress.com/apps/new/
2. Fill in app details:
   - Name: "FlyTravelDeals Publisher"
   - Description: "Automated blog publishing"
  - Website: https://wegofare.com
   - Redirect URLs: http://localhost:5001/callback
3. After creating, note your Client ID and Secret
4. Get an access token via OAuth (manual process or use WordPress app)
5. Add to `.env`:
   ```
   WORDPRESS_API_KEY=your-access-token
   WORDPRESS_SITE_ID=yourblog.wordpress.com
   ```

**Note:** WordPress.com OAuth is complex. Consider using manual publishing for WordPress initially.

### Ghost (DA 85)

1. Log in to your Ghost admin panel (e.g., `yoursite.com/ghost`)
2. Go to Settings > Integrations
3. Click "Add custom integration"
4. Name it "FlyTravelDeals Publisher"
5. Copy the Admin API Key and API URL
6. Add to `.env`:
   ```
   GHOST_ADMIN_API_KEY=your-admin-api-key-here
   GHOST_API_URL=https://yoursite.com
   ```

**Requirements:**
- Self-hosted Ghost blog or Ghost(Pro) subscription
- Admin API access enabled

## How It Works

### Automated Publishing Flow

1. **Generate Blog**: Create blog via AI generator or manual entry
2. **Click Publish**: Press 🚀 button next to blog post
3. **Automatic Distribution**: System publishes to all configured platforms
4. **View Results**: See success/failure status for each platform

### Publishing Process

```javascript
// When you click the 🚀 button, the system:

1. Calls POST /api/admin/blog/:id/publish
2. Backend reads API keys from .env
3. For each configured platform:
   - Converts content to platform format
   - Sets canonical URL to prevent duplicate content
   - Publishes via platform's API
   - Returns URL of published post
4. Shows results in alert dialog
```

### Canonical URLs

All published blogs include a canonical URL pointing back to your main site:

```html
<link rel="canonical" href="https://wegofare.com/blog/your-blog-slug">
```

This tells search engines that wegofare.com is the original source, preventing duplicate content penalties while gaining backlink benefits.

## Manual Publishing

If API keys aren't configured, the system provides detailed manual publishing instructions:

1. Click the 🚀 button
2. View the manual publishing guide
3. Follow step-by-step instructions for each platform
4. Copy blog content and paste into each site manually

The manual guide includes:
- Direct links to publishing pages
- Step-by-step instructions
- Canonical URL reminder
- Suggested tags

## Testing

### Test Automated Publishing

```bash
# 1. Start backend with at least one API key configured
cd backend
npm run dev

# 2. Open admin dashboard
# http://localhost:3000/admin

# 3. Generate a test blog
# - Go to Blog Management tab
# - Click "Generate Single Blog with AI"
# - Wait for generation

# 4. Publish to external sites
# - Find the new blog in the list
# - Click the 🚀 (rocket) button
# - View results in alert

# 5. Check published URLs
# - Results show URLs for each platform
# - Visit URLs to verify content
# - Check canonical URL is set correctly
```

### Verify Canonical URLs

After publishing, visit each platform and check the HTML source:

```bash
# View source and search for canonical
curl -s https://medium.com/@yourname/your-post | grep canonical
```

Should show:
```html
<link rel="canonical" href="https://flytraveldeals.us/blog/your-slug">
```

## Troubleshooting

### "Failed to publish" errors

**Problem:** Publishing fails with error message

**Solutions:**
1. Check API key is valid and not expired
2. Verify API key has correct permissions
3. Check platform-specific requirements:
   - Medium: Token must have "write" permission
   - Dev.to: API key must be active
   - Hashnode: Must have publication ID
   - WordPress: Must have valid access token
   - Ghost: Must have Admin API access

### "No API keys configured"

**Problem:** System shows manual publishing guide instead of publishing

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify API keys are set (not empty)
3. Restart backend server after adding keys
4. Check server logs for environment variable errors

### Rate Limiting

**Problem:** Too many publish requests rejected

**Solution:**
- Most platforms have rate limits (e.g., Medium: 10 posts/hour)
- Wait before publishing again
- Stagger publishing across different times
- Use manual publishing for immediate needs

### Duplicate Content

**Problem:** Search engines penalize duplicate content

**Solution:**
✅ Already handled! Every published post includes canonical URLs pointing to flytraveldeals.us as the original source.

## Best Practices

### 1. Start with Medium

Medium is the easiest to set up and has highest DA (95):
- Simple API key generation
- No OAuth required
- Good documentation
- Immediate publishing

### 2. Add Platforms Gradually

Don't rush to configure all platforms:
1. Start with Medium (week 1)
2. Add Dev.to (week 2)
3. Add Hashnode (week 3)
4. Consider WordPress/Ghost for your own sites

### 3. Monitor Results

Track which platforms drive the most traffic:
- Check Google Analytics for referral sources
- Monitor backlinks in Search Console
- Adjust strategy based on performance

### 4. Use Tags Effectively

Each platform supports tags/topics:
- Travel, Deals, Flights, Hotels
- Destination-specific: Dubai, Paris, Tokyo
- Airline-specific: Delta, Emirates, United

### 5. Timing

Best times to publish:
- Medium: Weekday mornings (9-11 AM EST)
- Dev.to: Developer blogs do well anytime
- LinkedIn: Business hours (10 AM - 3 PM)

## API Reference

### Publish Existing Blog

```javascript
POST /api/admin/blog/:id/publish

Headers:
  Authorization: Bearer {admin-token}
  Content-Type: application/json

Response:
{
  "success": true,
  "publishResults": {
    "successful": [
      {
        "platform": "Medium",
        "url": "https://medium.com/@user/post-id",
        "daScore": 95
      }
    ],
    "failed": [
      {
        "platform": "WordPress",
        "error": "Invalid access token"
      }
    ]
  },
  "manualPublishingGuide": {
    "introduction": "Follow these steps...",
    "platforms": [...]
  }
}
```

### Get Platform Status

```javascript
GET /api/admin/blog/publishing/platforms

Headers:
  Authorization: Bearer {admin-token}

Response:
{
  "platforms": [
    {
      "name": "Medium",
      "enabled": true,
      "configured": true,
      "daScore": 95
    },
    {
      "name": "Dev.to",
      "enabled": true,
      "configured": false,
      "daScore": 90
    }
  ]
}
```

### Get Manual Publishing Guide

```javascript
GET /api/admin/blog/:id/publish-guide

Headers:
  Authorization: Bearer {admin-token}

Response:
{
  "blogPost": {
    "title": "...",
    "content": "...",
    "url": "https://flytraveldeals.us/blog/..."
  },
  "platforms": [
    {
      "name": "Medium",
      "daScore": 95,
      "url": "https://medium.com/new-story",
      "instructions": "1. Go to the URL...",
      "canonicalUrl": "Add canonical URL..."
    }
  ]
}
```

## Security Considerations

### Protect API Keys

**NEVER** commit `.env` file to git:

```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
```

### Rotate Keys Regularly

- Change API keys every 3-6 months
- Revoke old keys after generating new ones
- Monitor for unauthorized usage

### Limit Permissions

- Use read/write scopes only (not admin/delete)
- Create separate keys for different services
- Monitor API usage in platform dashboards

## Support

### Documentation

- Medium API: https://github.com/Medium/medium-api-docs
- Dev.to API: https://developers.forem.com/api
- Hashnode API: https://api.hashnode.com
- WordPress API: https://developer.wordpress.com/docs/api/
- Ghost API: https://ghost.org/docs/admin-api/

### Contact

For issues with the FlyTravelDeals publishing system, check:
1. Server logs: `backend/logs/` (if logging enabled)
2. Browser console: Network tab for API errors
3. Platform status pages for service outages

## Future Enhancements

Planned features:
- [ ] LinkedIn article publishing
- [ ] Tumblr blog posting
- [ ] Blogger integration
- [ ] Scheduled publishing (auto-post at specific times)
- [ ] A/B testing for titles
- [ ] Analytics dashboard showing platform performance
- [ ] Bulk publishing (publish multiple posts at once)
- [ ] Content syndication scheduling

---

**Ready to Start?**

1. Copy `.env.example` to `.env`
2. Add at least one API key (Medium recommended)
3. Restart backend server
4. Click the 🚀 button on any blog post!
