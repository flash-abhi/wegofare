const axios = require('axios');

/**
 * BacklinkAI Service
 * Automated backlink generation and submission for SEO purposes
 * 
 * Features:
 * - Find backlink opportunities (directories, forums, guest posts)
 * - Generate contextual content using AI
 * - Auto-submit to various platforms
 * - Track backlink status and effectiveness
 */

class BacklinkAIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.siteUrl = process.env.SITE_URL || 'https://wegofare.com';
    this.siteName = process.env.SITE_NAME || 'WegoFare';
    this.siteDescription = process.env.SITE_DESCRIPTION || 'Best flight deals, hotels, cruises, and vacation packages';
    
    // Backlink storage (in production, use MongoDB)
    this.backlinks = [];
    this.backlinkIdCounter = 1;
    this.submissions = [];
    this.submissionIdCounter = 1;
    
    // Platform configurations
    this.platforms = {
      directories: [
        { name: 'DMOZ', url: 'https://dmoz-odp.org', category: 'Travel', status: 'active' },
        { name: 'Best of the Web', url: 'https://botw.org', category: 'Travel', status: 'active' },
        { name: 'Yahoo Directory', url: 'https://dir.yahoo.com', category: 'Travel', status: 'active' },
        { name: 'Yelp', url: 'https://yelp.com', category: 'Travel Agencies', status: 'active' },
        { name: 'Yellow Pages', url: 'https://yellowpages.com', category: 'Travel', status: 'active' },
        { name: 'Manta', url: 'https://manta.com', category: 'Travel Services', status: 'active' },
        { name: 'Hotfrog', url: 'https://hotfrog.com', category: 'Travel', status: 'active' },
        { name: 'Spoke', url: 'https://spoke.com', category: 'Travel', status: 'active' },
        { name: 'Brownbook', url: 'https://brownbook.net', category: 'Travel', status: 'active' },
        { name: 'Cylex', url: 'https://cylex.com', category: 'Travel', status: 'active' }
      ],
      travelDirectories: [
        { name: 'TripAdvisor', url: 'https://tripadvisor.com', type: 'listing', status: 'premium' },
        { name: 'Kayak', url: 'https://kayak.com', type: 'partner', status: 'premium' },
        { name: 'TravelZoo', url: 'https://travelzoo.com', type: 'deals', status: 'active' },
        { name: 'Lonely Planet', url: 'https://lonelyplanet.com', type: 'content', status: 'active' },
        { name: 'Travel Weekly', url: 'https://travelweekly.com', type: 'news', status: 'active' },
        { name: 'Skyscanner', url: 'https://skyscanner.com', type: 'partner', status: 'premium' },
        { name: 'CheapOair', url: 'https://cheapoair.com', type: 'affiliate', status: 'active' },
        { name: 'Orbitz', url: 'https://orbitz.com', type: 'partner', status: 'active' }
      ],
      forums: [
        { name: 'FlyerTalk', url: 'https://flyertalk.com', category: 'Frequent Flyers', status: 'active' },
        { name: 'TripAdvisor Forums', url: 'https://tripadvisor.com/ShowForum', category: 'Travel', status: 'active' },
        { name: 'Lonely Planet Thorntree', url: 'https://lonelyplanet.com/thorntree', category: 'Budget Travel', status: 'active' },
        { name: 'Reddit r/travel', url: 'https://reddit.com/r/travel', category: 'General', status: 'active' },
        { name: 'Reddit r/flights', url: 'https://reddit.com/r/flights', category: 'Flights', status: 'active' },
        { name: 'Reddit r/Shoestring', url: 'https://reddit.com/r/Shoestring', category: 'Budget', status: 'active' },
        { name: 'Quora Travel', url: 'https://quora.com/topic/Travel', category: 'Q&A', status: 'active' },
        { name: 'Travel Stack Exchange', url: 'https://travel.stackexchange.com', category: 'Q&A', status: 'active' }
      ],
      guestPostSites: [
        { name: 'Medium', url: 'https://medium.com', dr: 95, traffic: 'high', status: 'active' },
        { name: 'HubPages', url: 'https://hubpages.com', dr: 85, traffic: 'medium', status: 'active' },
        { name: 'Vocal Media', url: 'https://vocal.media', dr: 75, traffic: 'medium', status: 'active' },
        { name: 'Blogger', url: 'https://blogger.com', dr: 95, traffic: 'high', status: 'active' },
        { name: 'WordPress.com', url: 'https://wordpress.com', dr: 95, traffic: 'high', status: 'active' },
        { name: 'Tumblr', url: 'https://tumblr.com', dr: 90, traffic: 'high', status: 'active' },
        { name: 'LiveJournal', url: 'https://livejournal.com', dr: 85, traffic: 'medium', status: 'active' },
        { name: 'Wix Blog', url: 'https://wix.com/blog', dr: 90, traffic: 'high', status: 'active' }
      ],
      socialBookmarks: [
        { name: 'Pinterest', url: 'https://pinterest.com', type: 'visual', status: 'active' },
        { name: 'Mix (StumbleUpon)', url: 'https://mix.com', type: 'discovery', status: 'active' },
        { name: 'Flipboard', url: 'https://flipboard.com', type: 'magazine', status: 'active' },
        { name: 'Scoop.it', url: 'https://scoop.it', type: 'curation', status: 'active' },
        { name: 'Digg', url: 'https://digg.com', type: 'news', status: 'active' },
        { name: 'Pocket', url: 'https://getpocket.com', type: 'save', status: 'active' },
        { name: 'Instapaper', url: 'https://instapaper.com', type: 'save', status: 'active' }
      ],
      web2Sites: [
        { name: 'LinkedIn Articles', url: 'https://linkedin.com', dr: 98, status: 'active' },
        { name: 'SlideShare', url: 'https://slideshare.net', dr: 95, status: 'active' },
        { name: 'Issuu', url: 'https://issuu.com', dr: 92, status: 'active' },
        { name: 'Scribd', url: 'https://scribd.com', dr: 93, status: 'active' },
        { name: 'About.me', url: 'https://about.me', dr: 90, status: 'active' },
        { name: 'Gravatar', url: 'https://gravatar.com', dr: 90, status: 'active' }
      ],
      pressRelease: [
        { name: 'PRLog', url: 'https://prlog.org', type: 'free', status: 'active' },
        { name: 'OpenPR', url: 'https://openpr.com', type: 'free', status: 'active' },
        { name: 'PR.com', url: 'https://pr.com', type: 'free', status: 'active' },
        { name: '1888 Press Release', url: 'https://1888pressrelease.com', type: 'free', status: 'active' },
        { name: 'Free Press Release', url: 'https://free-press-release.com', type: 'free', status: 'active' }
      ]
    };

    // Content templates for different platforms
    this.contentTemplates = {
      directory: {
        title: '{siteName} - Best Flight Deals & Travel Packages',
        description: '{siteName} offers exclusive flight deals, hotel bookings, cruise packages, and vacation bundles. Save up to 70% on your next trip with our AI-powered price comparison. Book cheap flights to destinations worldwide.',
        keywords: 'cheap flights, flight deals, hotel bookings, cruise packages, vacation deals, travel agency, airline tickets'
      },
      forum: {
        intro: "Hey everyone! I've been using {siteName} for booking my flights and wanted to share my experience.",
        helpful: "If you're looking for {topic}, I found some great deals on {siteName}. They compare prices across multiple airlines.",
        recommendation: "For anyone searching for cheap flights to {destination}, check out {siteName} - they often have better rates than booking direct."
      },
      guestPost: {
        intro: "Planning your next adventure? Finding the best flight deals can make or break your travel budget.",
        cta: "For the latest flight deals and exclusive offers, visit {siteUrl}.",
        bio: "This article is brought to you by {siteName}, your trusted partner for finding the best travel deals online."
      }
    };

    // Keywords for content generation
    this.keywords = {
      primary: ['cheap flights', 'flight deals', 'airline tickets', 'book flights'],
      secondary: ['vacation packages', 'hotel deals', 'cruise bookings', 'travel discounts'],
      longtail: [
        'cheap flights to {destination}',
        'best time to book flights',
        'last minute flight deals',
        'discount airline tickets',
        'cheap round trip flights',
        'budget travel tips',
        'flight comparison',
        'airline price comparison'
      ],
      destinations: [
        'New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Chicago',
        'San Francisco', 'Orlando', 'Denver', 'Seattle', 'Boston',
        'Paris', 'London', 'Tokyo', 'Dubai', 'Cancun', 'Hawaii'
      ]
    };

    // Scheduling configuration - AGGRESSIVE MODE
    this.schedule = {
      dailyLimit: 5000,
      hourlyLimit: 200,
      submissionsToday: 0,
      submissionsThisHour: 0,
      lastSubmission: null,
      lastHourReset: Date.now(),
      enabled: true
    };
  }

  /**
   * Generate content using OpenAI GPT
   */
  async generateContent(type, context = {}) {
    const prompts = {
      directory: `Write a professional business listing description for a travel website called "${this.siteName}" (${this.siteUrl}). 
        Include: flight deals, hotel bookings, cruise packages, vacation bundles. 
        Mention: 24/7 support, price match guarantee, easy booking.
        Keep it under 200 words, professional tone, include a call to action.`,
      
      forumPost: `Write a helpful, natural-sounding forum post about ${context.topic || 'finding cheap flights'}. 
        Subtly mention ${this.siteName} as a useful resource without being spammy.
        Make it feel like genuine travel advice from an experienced traveler.
        Include personal anecdotes and tips. Under 150 words.`,
      
      forumComment: `Write a helpful forum comment responding to someone asking about ${context.question || 'how to find cheap flights'}.
        Provide genuine advice and casually mention ${this.siteName} as one option.
        Be helpful first, promotional second. Under 100 words.`,
      
      guestPost: `Write a 500-word travel blog article about "${context.topic || 'Top 10 Tips for Finding Cheap Flights'}".
        Include practical tips, personal insights, and engaging storytelling.
        Naturally incorporate a mention of ${this.siteName} (${this.siteUrl}) as a helpful resource.
        Include an author bio at the end mentioning ${this.siteName}.
        Use subheadings, bullet points, and a conversational tone.`,
      
      pressRelease: `Write a professional press release announcing ${context.announcement || 'the launch of new flight deal features'} at ${this.siteName}.
        Include: headline, dateline, lead paragraph, body, boilerplate, contact info.
        Professional AP style, newsworthy angle, under 400 words.`,
      
      socialPost: `Write an engaging social media post about ${context.topic || 'travel deals'} that links to ${this.siteUrl}.
        Make it shareable, include relevant hashtags, under 280 characters.`,
      
      quoraAnswer: `Write a detailed, helpful Quora answer to: "${context.question || 'What are the best websites to find cheap flights?'}".
        Provide comprehensive advice with ${this.siteName} mentioned as one of several options.
        Be genuinely helpful, include multiple tips, around 200 words.`,
      
      pinterestPin: `Write a compelling Pinterest pin description for a travel infographic about ${context.topic || 'saving money on flights'}.
        Include keywords: cheap flights, travel deals, budget travel.
        Add a CTA to visit ${this.siteUrl}. Under 100 words.`
    };

    // Use OpenAI if available
    if (this.openaiKey) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a skilled content writer specializing in travel and SEO-optimized content. Write natural, engaging content that provides value while subtly promoting the brand.'
            },
            {
              role: 'user',
              content: prompts[type] || prompts.directory
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        });

        return {
          success: true,
          content: response.data.choices[0].message.content,
          type,
          generatedAt: new Date()
        };
      } catch (error) {
        console.error('OpenAI generation failed:', error.message);
        // Fall back to template
      }
    }

    // Template-based fallback
    return this.generateFromTemplate(type, context);
  }

  /**
   * Generate content from templates (no AI required)
   */
  generateFromTemplate(type, context = {}) {
    const destination = context.destination || this.keywords.destinations[Math.floor(Math.random() * this.keywords.destinations.length)];
    const topic = context.topic || 'finding cheap flights';

    const templates = {
      directory: {
        title: `${this.siteName} - Best Flight Deals, Hotels & Vacation Packages`,
        description: `${this.siteName} helps travelers find the best flight deals, hotel bookings, and vacation packages at unbeatable prices. With our AI-powered search, compare prices across 500+ airlines and save up to 70% on your next trip. We offer 24/7 customer support, price match guarantee, and flexible booking options. Whether you're planning a budget getaway or a luxury vacation, ${this.siteName} has you covered. Visit ${this.siteUrl} to start saving on your next adventure!`,
        keywords: this.contentTemplates.directory.keywords
      },
      
      forumPost: `Hey fellow travelers! 👋

I just wanted to share a tip that's saved me hundreds on flights lately. Instead of booking directly with airlines, I've been using flight comparison sites to find better deals.

Recently found a round-trip to ${destination} for almost 40% less than what the airline was showing! The key is to:
1. Be flexible with dates (even 1-2 days can make a huge difference)
2. Compare multiple sites (I use ${this.siteName} among others)
3. Book on Tuesdays or Wednesdays
4. Clear your cookies before searching

Hope this helps someone! Happy travels! ✈️`,

      forumComment: `Great question! I've had good luck with a few different approaches:

First, try searching on multiple comparison sites - sometimes prices vary quite a bit. I personally use ${this.siteName}, Google Flights, and Skyscanner to compare.

Also, try the "nearby airports" option - flying into a different airport can save you a lot!

What destination are you looking at? Happy to share more specific tips!`,

      guestPost: `# ${context.topic || 'How to Find the Best Flight Deals in 2024'}

Planning a trip but worried about flight costs? You're not alone. With airfare prices fluctuating constantly, finding affordable flights can feel like a full-time job. But with the right strategies, you can score incredible deals without sacrificing comfort.

## 1. Be Flexible with Your Dates

This is the golden rule of cheap flight hunting. Flying mid-week (Tuesday-Thursday) is typically cheaper than weekends. Use fare comparison tools that show price calendars to identify the cheapest days.

## 2. Use Flight Comparison Sites

Don't just check one airline. Sites like ${this.siteName} compare prices across hundreds of airlines, often finding deals you'd never discover on your own. I recently saved $200 on a flight to ${destination} just by using a comparison tool.

## 3. Book at the Right Time

The sweet spot for domestic flights is 1-3 months before departure. For international, aim for 2-8 months ahead. Avoid booking too early or too late.

## 4. Set Price Alerts

Most flight search engines let you set alerts when prices drop for specific routes. This is especially useful for flexible travelers.

## 5. Consider Alternative Airports

Flying into a nearby airport can sometimes save you hundreds. The slight inconvenience of a longer drive is often worth the savings.

## 6. Clear Your Cookies

Some travel sites use cookies to track your searches and may increase prices if you search repeatedly. Browse in incognito mode or clear your cookies before booking.

## Final Thoughts

Finding cheap flights isn't magic—it's about knowing where to look and when to book. Start your search at ${this.siteUrl} to compare prices across multiple airlines and find the best deals for your next adventure.

---

*About the Author: This article is brought to you by ${this.siteName}, helping travelers find the best flight deals, hotels, and vacation packages since 2024.*`,

      pressRelease: `FOR IMMEDIATE RELEASE

**${this.siteName} Launches AI-Powered Flight Price Prediction Tool**

*New Feature Helps Travelers Save Up to 40% on Airfare*

[City, ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}] – ${this.siteName}, a leading online travel platform, today announced the launch of its revolutionary AI-powered flight price prediction tool, designed to help travelers book flights at the optimal time for maximum savings.

The new feature analyzes millions of flight price data points to predict whether fares will rise or fall, giving users confidence in their booking decisions.

"We've seen customers save an average of 25-40% by following our price predictions," said the ${this.siteName} team. "Our AI learns from billions of historical prices to give travelers an edge in finding the best deals."

**Key Features:**
- Real-time price predictions for over 500 airlines
- Historical price charts for informed decision-making
- Price drop alerts sent directly to users' phones
- Integration with hotel and vacation package bookings

For more information, visit ${this.siteUrl}

**About ${this.siteName}:**
${this.siteName} is a comprehensive travel platform offering flight comparisons, hotel bookings, cruise packages, and vacation deals. With a commitment to transparency and savings, ${this.siteName} helps millions of travelers find the best prices on their dream trips.

**Contact:**
${this.siteName}
Email: press@${this.siteUrl.replace('https://', '').replace('http://', '')}
Website: ${this.siteUrl}`,

      socialPost: `✈️ Pro tip: The best day to book flights is Tuesday! 

I just saved $180 on my next trip by comparing prices on ${this.siteName} 

#TravelDeals #CheapFlights #TravelTips #BudgetTravel #Wanderlust`,

      quoraAnswer: `Great question! Finding cheap flights is definitely an art, but here are some strategies that consistently work:

**1. Use Multiple Search Engines**
Don't rely on just one site. I typically check Google Flights for an overview, then compare with sites like ${this.siteName}, Skyscanner, and Momondo. Each has different airline partnerships and sometimes shows different prices.

**2. Be Date Flexible**
Flying on Tuesdays and Wednesdays is usually cheapest. If you can, use the flexible date search feature to see prices across the whole month.

**3. Book in Advance (But Not Too Far)**
For domestic flights, 1-3 months ahead is ideal. International flights? 2-6 months is the sweet spot.

**4. Set Price Alerts**
Most flight search sites let you track specific routes and alert you when prices drop. I've caught some amazing deals this way!

**5. Consider Budget Airlines**
They're not always the cheapest after fees, but worth checking. Just watch out for baggage costs.

**6. Check Alternative Airports**
Flying into a nearby city can sometimes save hundreds.

Personally, I've had the best luck using ${this.siteName} because they aggregate prices from multiple sources and often show deals I don't find elsewhere.

Hope this helps! Safe travels! ✈️`,

      pinterestPin: `💰 SAVE MONEY ON FLIGHTS ✈️

🔹 Book on Tuesdays
🔹 Be flexible with dates
🔹 Use comparison sites like ${this.siteName}
🔹 Set price alerts
🔹 Consider nearby airports
🔹 Clear cookies before searching

Find the best flight deals and start saving on your next adventure! 

Visit ${this.siteUrl} for exclusive deals

#CheapFlights #TravelHacks #BudgetTravel #FlightDeals #TravelTips #SaveMoney #Wanderlust`
    };

    return {
      success: true,
      content: templates[type] || templates.directory,
      type,
      generatedAt: new Date(),
      isTemplate: true
    };
  }

  /**
   * Get all platforms for backlink opportunities
   */
  getPlatforms() {
    return this.platforms;
  }

  /**
   * Get platform by category
   */
  getPlatformsByCategory(category) {
    return this.platforms[category] || [];
  }

  /**
   * Create a new backlink submission
   */
  createSubmission(platformType, platform, content) {
    const submission = {
      id: this.submissionIdCounter++,
      platformType,
      platformName: platform.name,
      platformUrl: platform.url,
      content,
      status: 'pending',
      submittedAt: null,
      approvedAt: null,
      backlinkUrl: null,
      dofollow: null,
      anchorText: null,
      createdAt: new Date()
    };

    this.submissions.push(submission);
    return submission;
  }

  /**
   * Add a submission directly (for external integrations)
   */
  addSubmission(data) {
    const submission = {
      id: this.submissionIdCounter++,
      platformType: data.platformType || 'external',
      platformName: data.platformName,
      platformUrl: data.platformUrl,
      content: data.content,
      status: data.status || 'submitted',
      submittedAt: new Date(),
      approvedAt: data.approvedAt || null,
      backlinkUrl: data.backlinkUrl || null,
      postId: data.postId || null,
      dofollow: data.dofollow || null,
      anchorText: data.anchorText || null,
      createdAt: new Date()
    };

    this.submissions.push(submission);
    this.schedule.submissionsToday++;
    return submission;
  }

  /**
   * Update submission status
   */
  updateSubmission(id, updates) {
    const index = this.submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.submissions[index] = { ...this.submissions[index], ...updates };
      return this.submissions[index];
    }
    return null;
  }

  /**
   * Get all submissions
   */
  getSubmissions(filters = {}) {
    let results = [...this.submissions];

    if (filters.status) {
      results = results.filter(s => s.status === filters.status);
    }
    if (filters.platformType) {
      results = results.filter(s => s.platformType === filters.platformType);
    }
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Add a confirmed backlink
   */
  addBacklink(data) {
    const backlink = {
      id: this.backlinkIdCounter++,
      url: data.url,
      sourceUrl: data.sourceUrl,
      sourceDomain: this.extractDomain(data.sourceUrl),
      anchorText: data.anchorText || this.siteName,
      dofollow: data.dofollow !== false,
      status: 'active',
      domainRating: data.domainRating || 0,
      pageAuthority: data.pageAuthority || 0,
      discoveredAt: new Date(),
      lastChecked: new Date(),
      submissionId: data.submissionId || null
    };

    this.backlinks.push(backlink);
    return backlink;
  }

  /**
   * Get all backlinks
   */
  getBacklinks(filters = {}) {
    let results = [...this.backlinks];

    if (filters.status) {
      results = results.filter(b => b.status === filters.status);
    }
    if (filters.dofollow !== undefined) {
      results = results.filter(b => b.dofollow === filters.dofollow);
    }
    if (filters.minDR) {
      results = results.filter(b => b.domainRating >= filters.minDR);
    }

    return results.sort((a, b) => new Date(b.discoveredAt) - new Date(a.discoveredAt));
  }

  /**
   * Get backlink statistics
   */
  getStats() {
    const totalBacklinks = this.backlinks.length;
    const dofollowCount = this.backlinks.filter(b => b.dofollow).length;
    const nofollowCount = totalBacklinks - dofollowCount;
    const activeCount = this.backlinks.filter(b => b.status === 'active').length;
    const avgDR = totalBacklinks > 0 
      ? Math.round(this.backlinks.reduce((sum, b) => sum + (b.domainRating || 0), 0) / totalBacklinks)
      : 0;

    const pendingSubmissions = this.submissions.filter(s => s.status === 'pending').length;
    const approvedSubmissions = this.submissions.filter(s => s.status === 'approved').length;
    const rejectedSubmissions = this.submissions.filter(s => s.status === 'rejected').length;

    const uniqueDomains = new Set(this.backlinks.map(b => b.sourceDomain)).size;

    return {
      backlinks: {
        total: totalBacklinks,
        dofollow: dofollowCount,
        nofollow: nofollowCount,
        active: activeCount,
        avgDomainRating: avgDR,
        uniqueDomains
      },
      submissions: {
        total: this.submissions.length,
        pending: pendingSubmissions,
        approved: approvedSubmissions,
        rejected: rejectedSubmissions,
        today: this.schedule.submissionsToday
      },
      schedule: {
        enabled: this.schedule.enabled,
        dailyLimit: this.schedule.dailyLimit,
        remaining: this.schedule.dailyLimit - this.schedule.submissionsToday
      }
    };
  }

  /**
   * Helper to extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Generate a batch of content for multiple platforms
   */
  async generateBatch(count = 5) {
    const types = ['forumPost', 'forumComment', 'guestPost', 'socialPost', 'quoraAnswer'];
    const results = [];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const content = await this.generateContent(type, {
        destination: this.keywords.destinations[Math.floor(Math.random() * this.keywords.destinations.length)],
        topic: this.keywords.longtail[Math.floor(Math.random() * this.keywords.longtail.length)]
      });
      results.push(content);
    }

    return results;
  }

  /**
   * Get suggested opportunities based on current backlink profile
   */
  getOpportunities() {
    const existingDomains = new Set(this.backlinks.map(b => b.sourceDomain));
    const opportunities = [];

    // Check each platform category
    Object.entries(this.platforms).forEach(([category, platforms]) => {
      platforms.forEach(platform => {
        const domain = this.extractDomain(platform.url);
        if (!existingDomains.has(domain)) {
          opportunities.push({
            ...platform,
            category,
            priority: platform.dr || (platform.status === 'premium' ? 'high' : 'medium'),
            estimatedDR: platform.dr || 50
          });
        }
      });
    });

    // Sort by priority/DR
    return opportunities.sort((a, b) => {
      if (typeof a.priority === 'number' && typeof b.priority === 'number') {
        return b.priority - a.priority;
      }
      if (a.priority === 'high') return -1;
      if (b.priority === 'high') return 1;
      return 0;
    });
  }

  /**
   * Enable/disable automatic submissions
   */
  setAutoSubmit(enabled) {
    this.schedule.enabled = enabled;
    return this.schedule;
  }

  /**
   * Update schedule settings
   */
  updateSchedule(settings) {
    this.schedule = { ...this.schedule, ...settings };
    return this.schedule;
  }

  /**
   * Reset daily submission counter (call daily via cron)
   */
  resetDailyCounter() {
    this.schedule.submissionsToday = 0;
    console.log('📊 Backlink daily counter reset');
  }

  /**
   * Simulate submitting to a platform (for demonstration)
   */
  async simulateSubmission(platformType, platformIndex) {
    const platforms = this.platforms[platformType];
    if (!platforms || !platforms[platformIndex]) {
      return { success: false, error: 'Platform not found' };
    }

    const platform = platforms[platformIndex];
    
    // Generate appropriate content
    let contentType = 'directory';
    if (platformType === 'forums') contentType = 'forumPost';
    else if (platformType === 'guestPostSites') contentType = 'guestPost';
    else if (platformType === 'socialBookmarks') contentType = 'socialPost';
    else if (platformType === 'pressRelease') contentType = 'pressRelease';

    const content = await this.generateContent(contentType);
    
    // Create submission record
    const submission = this.createSubmission(platformType, platform, content.content);
    submission.status = 'submitted';
    submission.submittedAt = new Date();

    // Increment counter
    this.schedule.submissionsToday++;
    this.schedule.lastSubmission = new Date();

    return {
      success: true,
      submission,
      content: content.content,
      platform: platform.name
    };
  }

  /**
   * Import backlinks from external sources (e.g., Ahrefs, Moz)
   */
  importBacklinks(backlinksData) {
    const imported = [];
    
    backlinksData.forEach(data => {
      const existing = this.backlinks.find(b => b.sourceUrl === data.sourceUrl);
      if (!existing) {
        const backlink = this.addBacklink(data);
        imported.push(backlink);
      }
    });

    return {
      success: true,
      imported: imported.length,
      total: this.backlinks.length
    };
  }

  /**
   * Export backlinks data
   */
  exportBacklinks() {
    return {
      backlinks: this.backlinks,
      submissions: this.submissions,
      stats: this.getStats(),
      exportedAt: new Date()
    };
  }

  /**
   * Check backlink health (simulated)
   */
  async checkBacklinkHealth(backlinkId) {
    const backlink = this.backlinks.find(b => b.id === backlinkId);
    if (!backlink) {
      return { success: false, error: 'Backlink not found' };
    }

    // In production, you would actually check if the link still exists
    // For now, simulate a health check
    backlink.lastChecked = new Date();
    
    return {
      success: true,
      backlink,
      healthy: backlink.status === 'active'
    };
  }
}

module.exports = new BacklinkAIService();
