#!/usr/bin/env node

/**
 * Real Backlink Agent
 * 
 * Actually submits to real platforms via APIs to create live, indexed backlinks:
 * - Pinterest pins (dofollow!)
 * - Twitter/X posts
 * - LinkedIn articles
 * - Blogger posts (dofollow!)
 * - Reddit posts
 * - Directory submissions (manual tracking)
 * 
 * Usage:
 *   node real-backlink-agent.js start    # Start continuous mode
 *   node real-backlink-agent.js once     # Submit to all configured APIs once
 *   node real-backlink-agent.js status   # Show current backlink status
 *   node real-backlink-agent.js priority # Show priority actions
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configuration
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:5001',
  adminEmail: process.env.ADMIN_EMAIL || 'info@wegofare.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'resert',
  
  siteUrl: process.env.SITE_URL || 'https://wegofare.com',
  siteName: process.env.SITE_NAME || 'WegoFare',
  
  // API credentials (set these in .env)
  pinterest: {
    accessToken: process.env.PINTEREST_ACCESS_TOKEN,
    boardId: process.env.PINTEREST_BOARD_ID
  },
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET
  },
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    companyId: process.env.LINKEDIN_COMPANY_ID
  },
  blogger: {
    accessToken: process.env.GOOGLE_BLOGGER_TOKEN,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    blogId: process.env.BLOGGER_BLOG_ID,
    // Support multiple blogs for more diverse backlinks
    additionalBlogIds: (process.env.BLOGGER_ADDITIONAL_BLOGS || '').split(',').filter(Boolean)
  },
  tumblr: {
    consumerKey: process.env.TUMBLR_CONSUMER_KEY,
    consumerSecret: process.env.TUMBLR_CONSUMER_SECRET,
    accessToken: process.env.TUMBLR_ACCESS_TOKEN,
    accessTokenSecret: process.env.TUMBLR_ACCESS_TOKEN_SECRET,
    blogName: process.env.TUMBLR_BLOG_NAME
  },
  wordpress: {
    // WordPress.com REST API (not self-hosted)
    accessToken: process.env.WORDPRESS_ACCESS_TOKEN,
    siteId: process.env.WORDPRESS_SITE_ID
  },
  medium: {
    accessToken: process.env.MEDIUM_ACCESS_TOKEN,
    userId: process.env.MEDIUM_USER_ID
  },
  reddit: {
    accessToken: process.env.REDDIT_ACCESS_TOKEN,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET
  },
  
  // Storage
  dataFile: path.join(__dirname, 'real-backlinks-data.json'),
  
  // Submission intervals - More aggressive for available platforms
  pinterestInterval: 4 * 60 * 60 * 1000,   // Every 4 hours
  twitterInterval: 2 * 60 * 60 * 1000,      // Every 2 hours
  linkedinInterval: 24 * 60 * 60 * 1000,    // Once a day
  bloggerInterval: 1.5 * 60 * 60 * 1000,    // Every 1.5 hours (16 posts per day!)
  tumblrInterval: 3 * 60 * 60 * 1000,       // Every 3 hours
  wordpressInterval: 4 * 60 * 60 * 1000,    // Every 4 hours
  mediumInterval: 12 * 60 * 60 * 1000,      // Twice a day
};

// State
let authToken = null;
let data = {
  liveBacklinks: [],
  pendingActions: [],
  lastSubmissions: {},
  stats: {
    total: 0,
    dofollow: 0,
    byPlatform: {}
  }
};

// Load existing data
try {
  if (fs.existsSync(config.dataFile)) {
    data = JSON.parse(fs.readFileSync(config.dataFile, 'utf8'));
    console.log(`📂 Loaded ${data.liveBacklinks.length} existing backlinks`);
  }
} catch (e) {
  console.error('⚠️ Could not load data:', e.message);
}

// Save data
function saveData() {
  try {
    fs.writeFileSync(config.dataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('❌ Failed to save data:', e.message);
  }
}

// Content templates for different platforms
const contentTemplates = {
  pinterest: [
    {
      title: '✈️ How to Find Cheap Flights - Travel Hack',
      description: 'Save up to 70% on your next flight with these proven tips! Compare prices across 500+ airlines. #CheapFlights #TravelDeals #BudgetTravel'
    },
    {
      title: '🏖️ Best Vacation Package Deals 2024',
      description: 'Flight + Hotel bundles at unbeatable prices. Plan your dream vacation without breaking the bank! #VacationDeals #TravelHacks'
    },
    {
      title: '💰 Last Minute Flight Deals You Need to Know',
      description: 'Score amazing last-minute airfare deals. Our tips to find cheap flights even at the last minute! #LastMinuteTravel #FlightDeals'
    },
    {
      title: '🌎 International Flight Booking Tips',
      description: 'Expert tips for booking affordable international flights. Save hundreds on your next overseas adventure! #InternationalTravel #FlightTips'
    }
  ],
  
  twitter: [
    '✈️ Pro tip: The best day to book flights is Tuesday or Wednesday! I just saved $200 on my next trip. #TravelHacks #CheapFlights',
    '🔥 Flash sale alert! Amazing flight deals to popular destinations. Don\'t miss out! #FlightDeals #Travel',
    '💡 Travel hack: Use incognito mode when searching for flights - prices can increase if you search repeatedly! #TravelTips',
    '🌴 Planning your next vacation? Flight + Hotel bundles can save you up to 40% vs booking separately! #VacationDeals',
    '⚡ Last minute getaway? You can still find amazing deals! Here\'s how... #LastMinuteTravel #BudgetTravel'
  ],
  
  linkedin: [
    {
      title: 'The Future of Travel Technology',
      text: '🌍 The travel industry is evolving rapidly. AI-powered price comparison tools are revolutionizing how we book flights, helping travelers save an average of 25-40% on airfare.\n\nKey trends we\'re seeing:\n✈️ Dynamic pricing algorithms\n💰 Personalized deal recommendations\n📊 Historical price analysis\n🔔 Smart price alerts\n\nWhat\'s your experience with travel tech? Share your thoughts! #TravelTech #Innovation #FutureOfTravel'
    },
    {
      title: 'Business Travel Tips for 2024',
      text: '💼 Business travel is back! Here are my top tips for cost-effective corporate travel:\n\n1️⃣ Book 21 days in advance for best rates\n2️⃣ Consider alternative airports\n3️⃣ Use price comparison tools\n4️⃣ Join airline loyalty programs\n5️⃣ Set price alerts for regular routes\n\nHow do you optimize your business travel budget? #BusinessTravel #CorporateTravel #TravelTips'
    }
  ],
  
  blogger: [
    {
      title: 'Top 10 Tips for Finding Cheap Flights in 2024',
      content: `<h2>The Ultimate Guide to Affordable Air Travel</h2>
<p>Finding cheap flights doesn't have to be complicated. With the right strategies and tools, you can save hundreds on your next trip. Here's our comprehensive guide to booking affordable airfare.</p>

<h3>1. Be Flexible with Your Dates</h3>
<p>This is the golden rule of cheap flight hunting. Flying mid-week (Tuesday-Thursday) is typically cheaper than weekends. Use fare calendars to identify the cheapest days to fly.</p>

<h3>2. Use Flight Comparison Sites</h3>
<p>Don't just check one airline. Use comparison tools that search across hundreds of airlines to find the best deals. You'd be surprised how much prices can vary!</p>

<h3>3. Book at the Right Time</h3>
<p>For domestic flights, the sweet spot is 1-3 months before departure. For international trips, aim for 2-6 months ahead.</p>

<h3>4. Set Price Alerts</h3>
<p>Most flight search engines let you track specific routes and alert you when prices drop. This is especially useful for flexible travelers.</p>

<h3>5. Consider Alternative Airports</h3>
<p>Flying into a nearby airport can sometimes save you hundreds. The slight inconvenience of a longer drive is often worth the savings.</p>

<h3>6. Clear Your Cookies</h3>
<p>Some travel sites use cookies to track your searches and may increase prices. Browse in incognito mode or clear cookies before booking.</p>

<h3>7. Book Connecting Flights Strategically</h3>
<p>Sometimes booking separate legs can be cheaper than a direct route. Just make sure to leave enough time between connections!</p>

<h3>8. Look for Error Fares</h3>
<p>Airlines occasionally post incorrect prices. These "error fares" can offer massive savings if you act quickly.</p>

<h3>9. Use Airline Miles Wisely</h3>
<p>Frequent flyer miles can be incredibly valuable if used strategically. Check award availability early and be flexible with dates.</p>

<h3>10. Travel During Off-Peak Seasons</h3>
<p>Avoid peak travel times like holidays and school breaks. Shoulder seasons often offer the best combination of good weather and low prices.</p>

<p><strong>Ready to find your next cheap flight?</strong> Start comparing prices today and discover deals you won't find anywhere else!</p>`
    },
    {
      title: 'Best Time to Book Flights for Maximum Savings',
      content: `<h2>When Should You Book Your Flight?</h2>
<p>Timing is everything when it comes to finding cheap flights. Book too early or too late, and you could end up paying hundreds more than necessary.</p>

<h3>Domestic Flights</h3>
<p>For flights within the US, the sweet spot is typically <strong>1-3 months before departure</strong>. Booking too far in advance rarely gets you the best deal, and last-minute bookings are almost always expensive.</p>

<h3>International Flights</h3>
<p>For overseas travel, start looking <strong>2-8 months ahead</strong>. International routes have more price volatility, so setting up price alerts is especially valuable here.</p>

<h3>Best Days to Book</h3>
<p>Tuesday and Wednesday are traditionally the best days to book flights. Airlines often release sales early in the week, and by midweek, competitors have matched prices.</p>

<h3>Best Days to Fly</h3>
<p>Want the cheapest fares? Fly on Tuesday, Wednesday, or Saturday. Avoid Sunday evenings and Monday mornings when business travelers dominate the skies.</p>

<p>Start your search today and save big on your next adventure!</p>`
    },
    {
      title: 'Hidden City Ticketing: The Secret Flight Hack',
      content: `<h2>What is Hidden City Ticketing?</h2>
<p>Hidden city ticketing is a controversial but legal way to save money on flights. Here's how it works and what you need to know.</p>

<h3>How It Works</h3>
<p>Sometimes a flight with a layover in your destination city is cheaper than a direct flight to that city. You simply book the cheaper connecting flight and get off at the layover city.</p>

<h3>Example</h3>
<p>A flight from New York to Denver might cost $400. But a flight from New York to Los Angeles with a layover in Denver might only cost $250. You book the LA flight and exit in Denver.</p>

<h3>Important Warnings</h3>
<ul>
<li>Only works for one-way trips with no checked bags</li>
<li>Airlines don't like this practice</li>
<li>Never do this on the return leg of a round trip</li>
<li>Frequent use could risk your loyalty status</li>
</ul>

<p>While this hack can save money, use it sparingly and understand the risks involved.</p>`
    },
    {
      title: 'How to Use Airline Miles Like a Pro',
      content: `<h2>Maximize Your Frequent Flyer Miles</h2>
<p>Airline miles can be worth a fortune if you know how to use them correctly. Here's our guide to getting maximum value from your points.</p>

<h3>Best Redemption Values</h3>
<p>Business and first class redemptions typically offer the best value per mile. A $10,000 business class ticket might only cost 80,000 miles - that's over 12 cents per mile!</p>

<h3>Avoid These Mistakes</h3>
<ul>
<li>Don't redeem miles for merchandise or gift cards</li>
<li>Avoid paying high fuel surcharges on award tickets</li>
<li>Don't let miles expire - set calendar reminders</li>
<li>Never buy miles at full price</li>
</ul>

<h3>Partner Airlines</h3>
<p>Remember that miles can often be redeemed on partner airlines. United miles can book Lufthansa flights, American miles work on British Airways, etc.</p>

<p>Start earning and burning smarter today!</p>`
    },
    {
      title: 'Budget Airlines: Are They Worth It?',
      content: `<h2>The Truth About Low-Cost Carriers</h2>
<p>Spirit, Frontier, Allegiant, Ryanair - budget airlines promise rock-bottom fares, but are they really a good deal?</p>

<h3>The Pros</h3>
<ul>
<li>Incredibly low base fares</li>
<li>Great for short trips with just a backpack</li>
<li>Forces you to pack light</li>
<li>Opens up travel to more people</li>
</ul>

<h3>The Hidden Costs</h3>
<ul>
<li>Carry-on bags often cost extra</li>
<li>Seat selection fees add up</li>
<li>No free snacks or drinks</li>
<li>Tight seat pitch can be uncomfortable</li>
</ul>

<h3>When Budget Airlines Make Sense</h3>
<p>For short flights under 3 hours where you can travel light, budget carriers can save you hundreds. For longer trips or when you need luggage, do the full cost comparison.</p>

<p>Compare all your options before booking!</p>`
    },
    {
      title: 'Flight Delay Compensation: Know Your Rights',
      content: `<h2>What Airlines Owe You When Things Go Wrong</h2>
<p>Flight delays and cancellations are frustrating, but you may be entitled to compensation. Here's what you need to know.</p>

<h3>US Regulations</h3>
<p>In the US, airlines must refund your ticket if your flight is cancelled, regardless of the reason. For delays, policies vary by airline.</p>

<h3>EU Regulations (EC 261)</h3>
<p>European rules are much stronger. For delays over 3 hours or cancellations, you may be entitled to up to €600 in compensation, plus rebooking or refund.</p>

<h3>What to Do</h3>
<ol>
<li>Document everything - keep boarding passes and delay notices</li>
<li>Ask the airline for compensation at the airport</li>
<li>Follow up in writing if denied</li>
<li>Consider using a claims service for EU flights</li>
</ol>

<p>Don't leave money on the table - know your rights!</p>`
    },
    {
      title: 'Best Credit Cards for Free Flights',
      content: `<h2>Earn Free Flights with the Right Credit Card</h2>
<p>The right travel credit card can earn you thousands of dollars in free flights every year. Here's how to choose.</p>

<h3>Types of Travel Cards</h3>
<ul>
<li><strong>Airline Co-Branded Cards:</strong> Earn miles on a specific airline with perks like free checked bags</li>
<li><strong>Flexible Point Cards:</strong> Earn transferable points that work with multiple airlines</li>
<li><strong>Cash Back Cards:</strong> Simple rewards you can use anywhere</li>
</ul>

<h3>Key Features to Look For</h3>
<ul>
<li>Sign-up bonus (often worth $500-1000+ in travel)</li>
<li>Earning rate on travel purchases</li>
<li>Transfer partners</li>
<li>Travel protections and perks</li>
</ul>

<p>The right card could fund your next vacation!</p>`
    },
    {
      title: 'How to Survive Long-Haul Flights',
      content: `<h2>Tips for Comfortable Long-Distance Flying</h2>
<p>A 12-hour flight doesn't have to be miserable. Here's how to arrive feeling refreshed.</p>

<h3>Before You Fly</h3>
<ul>
<li>Choose your seat wisely - use SeatGuru</li>
<li>Stay hydrated the day before</li>
<li>Pack entertainment and snacks</li>
<li>Wear comfortable, layered clothing</li>
</ul>

<h3>During the Flight</h3>
<ul>
<li>Walk around every few hours</li>
<li>Drink water constantly, avoid alcohol</li>
<li>Use noise-canceling headphones</li>
<li>Set your watch to destination time immediately</li>
</ul>

<h3>Essential Carry-On Items</h3>
<p>Neck pillow, eye mask, compression socks, moisturizer, and entertainment. These items make a huge difference on long flights.</p>

<p>Book your long-haul adventure with confidence!</p>`
    },
    {
      title: 'Mistake Fares: How to Find and Book Them',
      content: `<h2>Score Incredible Deals on Airline Pricing Errors</h2>
<p>Airlines occasionally post fares at a fraction of the normal price due to human or computer error. These "mistake fares" can save you thousands.</p>

<h3>How Mistake Fares Happen</h3>
<ul>
<li>Currency conversion errors</li>
<li>Missing a digit in the fare</li>
<li>Forgetting fuel surcharges</li>
<li>Technical glitches</li>
</ul>

<h3>How to Find Them</h3>
<ul>
<li>Follow deal alert websites and Twitter accounts</li>
<li>Join mistake fare communities</li>
<li>Set up Google Flights alerts for routes you want</li>
<li>Be ready to book immediately</li>
</ul>

<h3>Will Airlines Honor Them?</h3>
<p>In the US, DOT requires airlines to honor mistake fares. Many international carriers also honor them to avoid bad publicity.</p>

<p>Stay alert and you could fly business class for economy prices!</p>`
    },
    {
      title: 'Solo Travel Flight Tips for First-Timers',
      content: `<h2>Everything You Need to Know About Flying Alone</h2>
<p>Flying solo for the first time can be nerve-wracking, but it's also incredibly liberating. Here's your complete guide.</p>

<h3>Booking Tips</h3>
<ul>
<li>Aisle seats give you freedom to move</li>
<li>Consider paying for seat selection for peace of mind</li>
<li>Book direct flights when possible</li>
<li>Allow extra time for connections</li>
</ul>

<h3>At the Airport</h3>
<ul>
<li>Arrive early - 2 hours domestic, 3 hours international</li>
<li>Keep valuables in your carry-on</li>
<li>Have documents easily accessible</li>
<li>Stay aware of boarding announcements</li>
</ul>

<h3>Safety Tips</h3>
<ul>
<li>Share your itinerary with someone at home</li>
<li>Keep copies of important documents</li>
<li>Trust your instincts</li>
</ul>

<p>Solo travel opens up a world of possibilities. Book your adventure today!</p>`
    }
  ],
  
  reddit: [
    {
      subreddit: 'travel',
      title: 'Just saved $300 on flights using these tips - sharing what worked for me'
    },
    {
      subreddit: 'Shoestring',
      title: 'Budget travel tip: How I find cheap flights consistently'
    },
    {
      subreddit: 'TravelHacks',
      title: 'PSA: Best day to book flights and other money-saving tips'
    }
  ]
};

/**
 * Authenticate with API
 */
async function authenticate() {
  try {
    console.log('🔐 Authenticating...');
    
    const response = await axios.post(`${config.apiUrl}/api/admin/login`, {
      email: config.adminEmail,
      password: config.adminPassword,
      captchaToken: 'agent-bypass'
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      console.log('✅ Authentication successful');
      return true;
    }
    
    console.error('❌ Authentication failed');
    return false;
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return false;
  }
}

/**
 * Make API request
 */
async function apiRequest(method, endpoint, reqData = null) {
  try {
    const requestConfig = {
      method,
      url: `${config.apiUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (reqData && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestConfig.data = reqData;
    }
    
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && await authenticate()) {
      return apiRequest(method, endpoint, reqData);
    }
    throw error;
  }
}

/**
 * Add a live backlink to tracking
 */
function addLiveBacklink(backlinkData) {
  const backlink = {
    id: data.liveBacklinks.length + 1,
    ...backlinkData,
    createdAt: new Date().toISOString(),
    status: 'live'
  };
  
  data.liveBacklinks.push(backlink);
  data.stats.total++;
  if (backlinkData.dofollow) data.stats.dofollow++;
  data.stats.byPlatform[backlinkData.platform] = (data.stats.byPlatform[backlinkData.platform] || 0) + 1;
  
  saveData();
  console.log(`✅ Added live backlink from ${backlinkData.platform} (DR: ${backlinkData.dr}, ${backlinkData.dofollow ? 'dofollow' : 'nofollow'})`);
  
  return backlink;
}

/**
 * Submit to Pinterest
 */
async function submitToPinterest() {
  if (!config.pinterest.accessToken || !config.pinterest.boardId) {
    console.log('⏭️ Pinterest: Not configured (set PINTEREST_ACCESS_TOKEN and PINTEREST_BOARD_ID)');
    return null;
  }
  
  // Check last submission time
  const lastSubmit = data.lastSubmissions.pinterest;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.pinterestInterval) {
    console.log('⏳ Pinterest: Too soon since last submission');
    return null;
  }
  
  try {
    const template = contentTemplates.pinterest[Math.floor(Math.random() * contentTemplates.pinterest.length)];
    
    console.log('📌 Submitting to Pinterest...');
    
    const response = await axios.post('https://api.pinterest.com/v5/pins', {
      board_id: config.pinterest.boardId,
      title: template.title,
      description: `${template.description}\n\n📍 Learn more: ${config.siteUrl}`,
      link: config.siteUrl,
      media_source: {
        source_type: 'image_url',
        url: `${config.siteUrl}/travel-deals.jpg` // You'll need a travel image
      }
    }, {
      headers: {
        'Authorization': `Bearer ${config.pinterest.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const backlink = addLiveBacklink({
      platform: 'Pinterest',
      sourceUrl: `https://pinterest.com/pin/${response.data.id}`,
      backlinkUrl: config.siteUrl,
      anchorText: template.title,
      dofollow: true, // Pinterest pins ARE dofollow!
      dr: 94
    });
    
    data.lastSubmissions.pinterest = new Date().toISOString();
    saveData();
    
    console.log(`✅ Pinterest: Created pin ${response.data.id}`);
    return backlink;
    
  } catch (error) {
    console.error('❌ Pinterest error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Submit to Twitter/X
 */
async function submitToTwitter() {
  if (!config.twitter.bearerToken) {
    console.log('⏭️ Twitter: Not configured (set TWITTER_BEARER_TOKEN)');
    return null;
  }
  
  const lastSubmit = data.lastSubmissions.twitter;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.twitterInterval) {
    console.log('⏳ Twitter: Too soon since last submission');
    return null;
  }
  
  try {
    const tweet = contentTemplates.twitter[Math.floor(Math.random() * contentTemplates.twitter.length)];
    
    console.log('🐦 Submitting to Twitter...');
    
    const response = await axios.post('https://api.twitter.com/2/tweets', {
      text: `${tweet}\n\n🔗 ${config.siteUrl}`
    }, {
      headers: {
        'Authorization': `Bearer ${config.twitter.bearerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const backlink = addLiveBacklink({
      platform: 'Twitter',
      sourceUrl: `https://twitter.com/i/status/${response.data.data.id}`,
      backlinkUrl: config.siteUrl,
      anchorText: config.siteName,
      dofollow: false,
      dr: 94
    });
    
    data.lastSubmissions.twitter = new Date().toISOString();
    saveData();
    
    console.log(`✅ Twitter: Posted tweet ${response.data.data.id}`);
    return backlink;
    
  } catch (error) {
    console.error('❌ Twitter error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Submit to LinkedIn
 */
async function submitToLinkedIn() {
  if (!config.linkedin.accessToken) {
    console.log('⏭️ LinkedIn: Not configured (set LINKEDIN_ACCESS_TOKEN)');
    return null;
  }
  
  const lastSubmit = data.lastSubmissions.linkedin;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.linkedinInterval) {
    console.log('⏳ LinkedIn: Too soon since last submission');
    return null;
  }
  
  try {
    const template = contentTemplates.linkedin[Math.floor(Math.random() * contentTemplates.linkedin.length)];
    
    console.log('💼 Submitting to LinkedIn...');
    
    // Get user URN first
    const meResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${config.linkedin.accessToken}` }
    });
    const authorUrn = `urn:li:person:${meResponse.data.id}`;
    
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: `${template.text}\n\n🔗 ${config.siteUrl}` },
          shareMediaCategory: 'ARTICLE',
          media: [{
            status: 'READY',
            originalUrl: config.siteUrl,
            title: { text: template.title }
          }]
        }
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    }, {
      headers: {
        'Authorization': `Bearer ${config.linkedin.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    const backlink = addLiveBacklink({
      platform: 'LinkedIn',
      sourceUrl: `https://linkedin.com/feed/update/${response.data.id}`,
      backlinkUrl: config.siteUrl,
      anchorText: template.title,
      dofollow: false,
      dr: 98
    });
    
    data.lastSubmissions.linkedin = new Date().toISOString();
    saveData();
    
    console.log(`✅ LinkedIn: Published post`);
    return backlink;
    
  } catch (error) {
    console.error('❌ LinkedIn error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Refresh Google OAuth token
 */
async function refreshGoogleToken() {
  if (!config.blogger.refreshToken || !config.blogger.clientId || !config.blogger.clientSecret) {
    return null;
  }
  
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.blogger.clientId,
      client_secret: config.blogger.clientSecret,
      refresh_token: config.blogger.refreshToken,
      grant_type: 'refresh_token'
    });
    
    config.blogger.accessToken = response.data.access_token;
    console.log('🔄 Refreshed Google access token');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Failed to refresh Google token:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Submit to Blogger
 */
async function submitToBlogger() {
  if (!config.blogger.blogId) {
    console.log('⏭️ Blogger: Not configured (set BLOGGER_BLOG_ID)');
    return null;
  }
  
  if (!config.blogger.accessToken && !config.blogger.refreshToken) {
    console.log('⏭️ Blogger: Not configured (set GOOGLE_BLOGGER_TOKEN or GOOGLE_REFRESH_TOKEN)');
    return null;
  }
  
  // Try to refresh token if we have refresh token
  if (config.blogger.refreshToken) {
    await refreshGoogleToken();
  }
  
  if (!config.blogger.accessToken) {
    console.log('❌ Blogger: Could not get access token');
    return null;
  }
  
  const lastSubmit = data.lastSubmissions.blogger;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.bloggerInterval) {
    console.log('⏳ Blogger: Too soon since last submission');
    return null;
  }
  
  try {
    // Rotate through templates based on how many we've posted
    const bloggerPostCount = data.stats.byPlatform['Blogger'] || 0;
    const templateIndex = bloggerPostCount % contentTemplates.blogger.length;
    const template = contentTemplates.blogger[templateIndex];
    
    // Add date variation to title to make each post unique
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const uniqueTitle = `${template.title} - ${dateStr}`;
    
    console.log(`📝 Submitting to Blogger (post #${bloggerPostCount + 1}, template ${templateIndex + 1}/${contentTemplates.blogger.length})...`);
    
    const response = await axios.post(
      `https://www.googleapis.com/blogger/v3/blogs/${config.blogger.blogId}/posts`,
      {
        kind: 'blogger#post',
        title: uniqueTitle,
        content: `${template.content}<br><br><p>Ready to find cheap flights? Visit <a href="${config.siteUrl}">${config.siteName}</a> to compare prices across 500+ airlines!</p>`
      },
      {
        headers: {
          'Authorization': `Bearer ${config.blogger.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const backlink = addLiveBacklink({
      platform: 'Blogger',
      sourceUrl: response.data.url,
      backlinkUrl: config.siteUrl,
      anchorText: config.siteName,
      dofollow: true, // Blogger links ARE dofollow!
      dr: 95
    });
    
    data.lastSubmissions.blogger = new Date().toISOString();
    saveData();
    
    console.log(`✅ Blogger: Published post at ${response.data.url}`);
    return backlink;
    
  } catch (error) {
    console.error('❌ Blogger error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Submit to Tumblr
 */
async function submitToTumblr() {
  if (!config.tumblr.accessToken || !config.tumblr.blogName) {
    console.log('⏭️ Tumblr: Not configured (set TUMBLR_ACCESS_TOKEN and TUMBLR_BLOG_NAME)');
    return null;
  }
  
  const lastSubmit = data.lastSubmissions.tumblr;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.tumblrInterval) {
    console.log('⏳ Tumblr: Too soon since last submission');
    return null;
  }
  
  try {
    const tumblrPostCount = data.stats.byPlatform['Tumblr'] || 0;
    const templateIndex = tumblrPostCount % contentTemplates.blogger.length;
    const template = contentTemplates.blogger[templateIndex];
    
    console.log(`📝 Submitting to Tumblr (post #${tumblrPostCount + 1})...`);
    
    const response = await axios.post(
      `https://api.tumblr.com/v2/blog/${config.tumblr.blogName}/posts`,
      {
        type: 'text',
        title: template.title,
        body: `${template.content}<br><br><p>Find cheap flights at <a href="${config.siteUrl}">${config.siteName}</a>!</p>`,
        tags: 'travel,cheap flights,travel deals,vacation,flight deals'
      },
      {
        headers: {
          'Authorization': `Bearer ${config.tumblr.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const postId = response.data.response.id_string;
    const backlink = addLiveBacklink({
      platform: 'Tumblr',
      sourceUrl: `https://${config.tumblr.blogName}.tumblr.com/post/${postId}`,
      backlinkUrl: config.siteUrl,
      anchorText: config.siteName,
      dofollow: false, // Tumblr is nofollow but high DR
      dr: 90
    });
    
    data.lastSubmissions.tumblr = new Date().toISOString();
    saveData();
    
    console.log(`✅ Tumblr: Published post ${postId}`);
    return backlink;
    
  } catch (error) {
    console.error('❌ Tumblr error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Submit to WordPress.com
 */
async function submitToWordPress() {
  if (!config.wordpress.accessToken || !config.wordpress.siteId) {
    console.log('⏭️ WordPress: Not configured (set WORDPRESS_ACCESS_TOKEN and WORDPRESS_SITE_ID)');
    return null;
  }
  
  const lastSubmit = data.lastSubmissions.wordpress;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.wordpressInterval) {
    console.log('⏳ WordPress: Too soon since last submission');
    return null;
  }
  
  try {
    const wpPostCount = data.stats.byPlatform['WordPress'] || 0;
    const templateIndex = wpPostCount % contentTemplates.blogger.length;
    const template = contentTemplates.blogger[templateIndex];
    
    console.log(`📝 Submitting to WordPress.com (post #${wpPostCount + 1})...`);
    
    const response = await axios.post(
      `https://public-api.wordpress.com/rest/v1.1/sites/${config.wordpress.siteId}/posts/new`,
      {
        title: template.title,
        content: `${template.content}\n\n<p>Looking for cheap flights? Check out <a href="${config.siteUrl}">${config.siteName}</a> for the best deals!</p>`,
        status: 'publish',
        categories: 'Travel',
        tags: 'cheap flights, travel deals, vacation, airline tickets'
      },
      {
        headers: {
          'Authorization': `Bearer ${config.wordpress.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const backlink = addLiveBacklink({
      platform: 'WordPress',
      sourceUrl: response.data.URL,
      backlinkUrl: config.siteUrl,
      anchorText: config.siteName,
      dofollow: false, // WordPress.com is nofollow but DR 95
      dr: 95
    });
    
    data.lastSubmissions.wordpress = new Date().toISOString();
    saveData();
    
    console.log(`✅ WordPress: Published post at ${response.data.URL}`);
    return backlink;
    
  } catch (error) {
    console.error('❌ WordPress error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Submit to Medium
 */
async function submitToMedium() {
  if (!config.medium.accessToken) {
    console.log('⏭️ Medium: Not configured (set MEDIUM_ACCESS_TOKEN)');
    return null;
  }
  
  const lastSubmit = data.lastSubmissions.medium;
  if (lastSubmit && Date.now() - new Date(lastSubmit).getTime() < config.mediumInterval) {
    console.log('⏳ Medium: Too soon since last submission');
    return null;
  }
  
  try {
    // First get user ID if not set
    let userId = config.medium.userId;
    if (!userId) {
      const meResponse = await axios.get('https://api.medium.com/v1/me', {
        headers: { 'Authorization': `Bearer ${config.medium.accessToken}` }
      });
      userId = meResponse.data.data.id;
    }
    
    const mediumPostCount = data.stats.byPlatform['Medium'] || 0;
    const templateIndex = mediumPostCount % contentTemplates.blogger.length;
    const template = contentTemplates.blogger[templateIndex];
    
    console.log(`📝 Submitting to Medium (post #${mediumPostCount + 1})...`);
    
    // Convert HTML to Medium's markdown-ish format
    const content = template.content
      .replace(/<h2>/g, '## ')
      .replace(/<\/h2>/g, '\n\n')
      .replace(/<h3>/g, '### ')
      .replace(/<\/h3>/g, '\n\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<ol>/g, '')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li>/g, '- ')
      .replace(/<\/li>/g, '\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<br>/g, '\n');
    
    const response = await axios.post(
      `https://api.medium.com/v1/users/${userId}/posts`,
      {
        title: template.title,
        contentFormat: 'markdown',
        content: `${content}\n\n---\n\n*Find the best flight deals at [${config.siteName}](${config.siteUrl})!*`,
        tags: ['Travel', 'Cheap Flights', 'Travel Tips', 'Vacation', 'Budget Travel'],
        publishStatus: 'public'
      },
      {
        headers: {
          'Authorization': `Bearer ${config.medium.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const backlink = addLiveBacklink({
      platform: 'Medium',
      sourceUrl: response.data.data.url,
      backlinkUrl: config.siteUrl,
      anchorText: config.siteName,
      dofollow: false, // Medium is nofollow but DR 95
      dr: 95
    });
    
    data.lastSubmissions.medium = new Date().toISOString();
    saveData();
    
    console.log(`✅ Medium: Published post at ${response.data.data.url}`);
    return backlink;
    
  } catch (error) {
    console.error('❌ Medium error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Show status
 */
function showStatus() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║         REAL BACKLINKS STATUS                 ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  
  console.log(`📊 TOTAL LIVE BACKLINKS: ${data.stats.total}`);
  console.log(`   ├─ Dofollow: ${data.stats.dofollow}`);
  console.log(`   └─ Nofollow: ${data.stats.total - data.stats.dofollow}\n`);
  
  console.log('📈 BY PLATFORM:');
  Object.entries(data.stats.byPlatform).forEach(([platform, count]) => {
    console.log(`   ├─ ${platform}: ${count}`);
  });
  
  console.log('\n🕐 LAST SUBMISSIONS:');
  Object.entries(data.lastSubmissions).forEach(([platform, time]) => {
    const timeAgo = Math.round((Date.now() - new Date(time).getTime()) / 60000);
    console.log(`   ├─ ${platform}: ${timeAgo} minutes ago`);
  });
  
  console.log('\n🔗 RECENT BACKLINKS:');
  const recent = data.liveBacklinks.slice(-5).reverse();
  recent.forEach(bl => {
    console.log(`   ├─ [${bl.platform}] ${bl.sourceUrl.substring(0, 50)}...`);
    console.log(`   │  DR: ${bl.dr}, ${bl.dofollow ? '✅ dofollow' : '❌ nofollow'}`);
  });
  
  console.log('\n⚙️ API CONFIGURATION:');
  console.log(`   ├─ Blogger: ${(config.blogger.accessToken || config.blogger.refreshToken) ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   ├─ Tumblr: ${config.tumblr.accessToken ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   ├─ WordPress: ${config.wordpress.accessToken ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   ├─ Medium: ${config.medium.accessToken ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   ├─ Pinterest: ${config.pinterest.accessToken ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   ├─ Twitter: ${config.twitter.bearerToken ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   └─ LinkedIn: ${config.linkedin.accessToken ? '✅ Configured' : '❌ Not set'}`);
  
  console.log('');
}

/**
 * Show priority actions
 */
function showPriorityActions() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║       PRIORITY BACKLINK ACTIONS               ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  
  const existingPlatforms = new Set(data.liveBacklinks.map(b => b.platform));
  
  const priorities = [
    { platform: 'Google Business Profile', dr: 100, dofollow: true, critical: true },
    { platform: 'Bing Places', dr: 93, dofollow: true },
    { platform: 'Yelp', dr: 93, dofollow: false },
    { platform: 'TripAdvisor', dr: 93, dofollow: false },
    { platform: 'Yellow Pages', dr: 87, dofollow: true },
    { platform: 'SlideShare', dr: 95, dofollow: true },
    { platform: 'Crunchbase', dr: 91, dofollow: true },
    { platform: 'About.me', dr: 90, dofollow: true },
    { platform: 'Medium', dr: 95, dofollow: false },
    { platform: 'Quora', dr: 93, dofollow: false }
  ];
  
  let priority = 1;
  priorities.forEach(p => {
    if (!existingPlatforms.has(p.platform)) {
      const icon = p.critical ? '🔴' : '🟡';
      console.log(`${icon} Priority ${priority++}: ${p.platform}`);
      console.log(`   DR: ${p.dr}, ${p.dofollow ? 'dofollow' : 'nofollow'}`);
      console.log(`   → Manual submission required\n`);
    }
  });
  
  if (priority === 1) {
    console.log('✅ All priority platforms have backlinks!\n');
  }
}

/**
 * Run all submissions once
 */
async function runOnce() {
  console.log('\n🚀 Running real backlink submissions...\n');
  
  // Blogger doesn't need API auth, runs directly
  const results = await Promise.allSettled([
    submitToPinterest(),
    submitToTwitter(),
    submitToLinkedIn(),
    submitToBlogger(),
    submitToTumblr(),
    submitToWordPress(),
    submitToMedium()
  ]);
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`\n✅ Completed: ${successful}/${results.length} submissions successful`);
  
  showStatus();
}

/**
 * Run continuous mode
 */
async function runContinuous() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║       REAL BACKLINK AGENT - CONTINUOUS        ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  
  showStatus();
  
  // Initial run
  await runOnce();
  
  // Pinterest: every 4 hours
  setInterval(async () => {
    await submitToPinterest();
  }, config.pinterestInterval);
  
  // Twitter: every 2 hours
  setInterval(async () => {
    await submitToTwitter();
  }, config.twitterInterval);
  
  // LinkedIn: once a day
  setInterval(async () => {
    await submitToLinkedIn();
  }, config.linkedinInterval);
  
  // Blogger: every 1.5 hours (16 posts/day!)
  setInterval(async () => {
    await submitToBlogger();
  }, config.bloggerInterval);
  
  // Tumblr: every 3 hours
  setInterval(async () => {
    await submitToTumblr();
  }, config.tumblrInterval);
  
  // WordPress: every 4 hours
  setInterval(async () => {
    await submitToWordPress();
  }, config.wordpressInterval);
  
  // Medium: twice a day
  setInterval(async () => {
    await submitToMedium();
  }, config.mediumInterval);
  
  // Status report every hour
  setInterval(() => {
    showStatus();
  }, 60 * 60 * 1000);
  
  console.log('🔄 Agent running in continuous mode...\n');
  console.log('   Blogger: every 1.5 hours (16/day)');
  console.log('   Tumblr: every 3 hours (8/day)');
  console.log('   WordPress: every 4 hours (6/day)');
  console.log('   Medium: every 12 hours (2/day)');
  console.log('   Pinterest: every 4 hours');
  console.log('   Twitter: every 2 hours');
  console.log('   LinkedIn: once a day\n');
}

// CLI
const command = process.argv[2] || 'status';

switch (command) {
  case 'start':
  case 'run':
  case 'continuous':
    runContinuous();
    break;
    
  case 'once':
  case 'submit':
    runOnce().then(() => process.exit(0));
    break;
    
  case 'priority':
  case 'actions':
    showPriorityActions();
    break;
    
  case 'status':
  default:
    showStatus();
    break;
}
