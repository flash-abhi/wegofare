const express = require('express');
const router = express.Router();

// Blog posts will be provided by server.js to avoid circular dependency
let blogPostsGetter = () => [];

// Set the blog posts getter function
router.setBlogPostsGetter = (fn) => {
  blogPostsGetter = fn;
};

// Static pages with their priority and change frequency
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/flights', priority: '0.9', changefreq: 'daily' },
  { url: '/hotels', priority: '0.9', changefreq: 'daily' },
  { url: '/cruises', priority: '0.9', changefreq: 'daily' },
  { url: '/packages', priority: '0.9', changefreq: 'daily' },
  { url: '/vacation-search', priority: '0.8', changefreq: 'weekly' },
  { url: '/airlines', priority: '0.8', changefreq: 'weekly' },
  { url: '/blog', priority: '0.8', changefreq: 'daily' },
  { url: '/airline-customer-service', priority: '0.9', changefreq: 'weekly' },
  { url: '/airline-customer-service-number', priority: '0.9', changefreq: 'weekly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms', priority: '0.5', changefreq: 'monthly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/help', priority: '0.6', changefreq: 'monthly' }
];

// Major airlines for individual pages
const airlines = [
  'american-airlines', 'delta-air-lines', 'united-airlines', 'southwest-airlines',
  'jetblue-airways', 'alaska-airlines', 'spirit-airlines', 'frontier-airlines',
  'allegiant-air', 'sun-country-airlines', 'hawaiian-airlines', 'air-canada',
  'westjet', 'lufthansa', 'british-airways', 'air-france', 'klm', 'emirates',
  'qatar-airways', 'singapore-airlines', 'cathay-pacific', 'japan-airlines',
  'ana-all-nippon-airways', 'qantas', 'etihad-airways', 'turkish-airlines',
  'aer-lingus', 'iberia', 'tap-portugal', 'brussels-airlines'
];

// Generate XML sitemap
router.get('/sitemap.xml', (req, res) => {
  console.log('📄 Sitemap.xml requested');
  const baseUrl = process.env.SITE_URL || 'https://wegofare.com';
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add airline pages
  airlines.forEach(airline => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/airlines/${airline}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  // Add blog posts
  try {
    const blogPosts = blogPostsGetter();
    console.log(`📝 Found ${blogPosts.length} blog posts`);
    blogPosts.forEach(post => {
      if (post.slug && post.published !== false) {
        const postDate = post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : currentDate;
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${postDate}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += '  </url>\n';
      }
    });
  } catch (error) {
    console.error('Error loading blog posts:', error.message);
  }

  xml += '</urlset>';

  console.log(`✅ Sitemap XML generated (${xml.length} bytes)`);
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Generate robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://wegofare.com';
  
  let robotsTxt = 'User-agent: *\n';
  robotsTxt += 'Allow: /\n';
  robotsTxt += 'Disallow: /admin/\n';
  robotsTxt += 'Disallow: /api/\n';
  robotsTxt += '\n';
  robotsTxt += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// HTML sitemap for users
router.get('/sitemap.html', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://wegofare.com';
  const blogPosts = blogPostsGetter();

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sitemap - wegofare.com</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f7fafc; color: #2d3748; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 36px; margin-bottom: 16px; color: #1a202c; }
    .subtitle { color: #718096; margin-bottom: 40px; font-size: 18px; }
    .section { background: white; padding: 32px; margin-bottom: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .section h2 { font-size: 24px; margin-bottom: 20px; color: #2d3748; border-bottom: 3px solid #667eea; padding-bottom: 12px; }
    .links { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
    .links a { color: #667eea; text-decoration: none; padding: 8px 12px; border-radius: 6px; transition: all 0.3s; display: block; }
    .links a:hover { background: #f7fafc; color: #764ba2; transform: translateX(4px); }
    .blog-post { border-left: 3px solid #48bb78; }
    .airline-link { border-left: 3px solid #4299e1; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗺️ Site Map</h1>
    <p class="subtitle">Complete navigation of wegofare.com</p>
    
    <div class="section">
      <h2>✈️ Main Pages</h2>
      <div class="links">
        <a href="${baseUrl}/">Home</a>
        <a href="${baseUrl}/flights">Flights</a>
        <a href="${baseUrl}/hotels">Hotels</a>
        <a href="${baseUrl}/cruises">Cruises</a>
        <a href="${baseUrl}/packages">Vacation Packages</a>
        <a href="${baseUrl}/vacation-search">Vacation Search</a>
      </div>
    </div>
    
    <div class="section">
      <h2>🛫 Airlines Directory</h2>
      <div class="links">
        <a href="${baseUrl}/airlines">All Airlines</a>
        ${airlines.map(airline => 
          `<a href="${baseUrl}/airlines/${airline}" class="airline-link">${airline.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</a>`
        ).join('\n        ')}
      </div>
    </div>`;

  if (blogPosts.length > 0) {
    html += `
    <div class="section">
      <h2>📝 Blog Articles</h2>
      <div class="links">
        ${blogPosts.filter(post => post.published !== false).map(post => 
          `<a href="${baseUrl}/blog/${post.slug}" class="blog-post">${post.title}</a>`
        ).join('\n        ')}
      </div>
    </div>`;
  }

  html += `
    <div class="section">
      <h2>ℹ️ Information</h2>
      <div class="links">
        <a href="${baseUrl}/about">About Us</a>
        <a href="${baseUrl}/contact">Contact</a>
        <a href="${baseUrl}/faq">FAQ</a>
        <a href="${baseUrl}/help">Help</a>
        <a href="${baseUrl}/privacy">Privacy Policy</a>
        <a href="${baseUrl}/terms">Terms of Service</a>
      </div>
    </div>

    <div class="section">
      <h2>📞 Customer Support</h2>
      <div class="links">
        <a href="${baseUrl}/airline-customer-service">Airline Customer Service</a>
        <a href="${baseUrl}/airline-customer-service-number">Airline Customer Service Number</a>
        <a href="${baseUrl}/blog">Travel Blog</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  res.header('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
