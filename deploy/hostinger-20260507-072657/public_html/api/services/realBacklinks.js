const axios = require('axios');

/**
 * Real Backlink Submission Service
 * 
 * Actually submits backlinks to real platforms via APIs
 * Tracks live backlinks that get indexed by search engines
 */

class RealBacklinkService {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://wegofare.com';
    this.siteName = process.env.SITE_NAME || 'WegoFare';
    this.siteEmail = process.env.SITE_EMAIL || 'info@wegofare.com';
    this.sitePhone = process.env.SITE_PHONE || '+1-800-555-0199';
    this.siteDescription = 'Find the best flight deals, cheap airline tickets, hotel bookings, and vacation packages. Save up to 70% on your next trip with WegoFare.';
    
    // Real backlinks tracking
    this.liveBacklinks = [];
    this.backlinkIdCounter = 1;
    
    // Submission stats
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      byPlatform: {}
    };

    // Platform configurations with real API endpoints
    this.realPlatforms = {
      // ===== WEB 2.0 BLOGS (Instant Backlinks) =====
      web2Blogs: [
        {
          name: 'Blogger/Blogspot',
          type: 'blog',
          apiType: 'google',
          dofollow: true,
          dr: 95,
          instructions: 'Create blog posts with embedded links'
        },
        {
          name: 'WordPress.com',
          type: 'blog',
          apiType: 'rest',
          dofollow: false, // nofollow but high DR
          dr: 95,
          instructions: 'Create free blog with posts linking back'
        },
        {
          name: 'Tumblr',
          type: 'blog',
          apiType: 'oauth',
          dofollow: false,
          dr: 90,
          instructions: 'Post travel content with links'
        },
        {
          name: 'Medium',
          type: 'publishing',
          apiType: 'integration',
          dofollow: false,
          dr: 95,
          instructions: 'Publish articles with embedded links'
        }
      ],

      // ===== SOCIAL PROFILES (Indexed Profile Links) =====
      socialProfiles: [
        {
          name: 'Pinterest',
          type: 'social',
          url: 'https://pinterest.com',
          profileLinkDofollow: false,
          pinLinksDofollow: true, // Pin descriptions can have dofollow!
          dr: 94,
          apiAvailable: true
        },
        {
          name: 'Twitter/X',
          type: 'social',
          url: 'https://twitter.com',
          dofollow: false,
          dr: 94,
          apiAvailable: true
        },
        {
          name: 'Facebook Page',
          type: 'social',
          url: 'https://facebook.com',
          dofollow: false,
          dr: 96,
          apiAvailable: true
        },
        {
          name: 'LinkedIn Company',
          type: 'social',
          url: 'https://linkedin.com',
          dofollow: false,
          dr: 98,
          apiAvailable: true
        },
        {
          name: 'YouTube Channel',
          type: 'social',
          url: 'https://youtube.com',
          dofollow: false, // Description links
          dr: 100,
          apiAvailable: true
        }
      ],

      // ===== BUSINESS DIRECTORIES (Instant Dofollow) =====
      businessDirectories: [
        {
          name: 'Google Business Profile',
          type: 'local',
          url: 'https://business.google.com',
          dofollow: true,
          dr: 100,
          apiAvailable: true,
          priority: 'critical'
        },
        {
          name: 'Bing Places',
          type: 'local',
          url: 'https://bingplaces.com',
          dofollow: true,
          dr: 93,
          apiAvailable: true
        },
        {
          name: 'Apple Maps Connect',
          type: 'local',
          url: 'https://mapsconnect.apple.com',
          dofollow: true,
          dr: 100,
          apiAvailable: false
        },
        {
          name: 'Yelp',
          type: 'directory',
          url: 'https://yelp.com',
          dofollow: false,
          dr: 93,
          apiAvailable: true
        },
        {
          name: 'Yellow Pages',
          type: 'directory',
          url: 'https://yellowpages.com',
          dofollow: true,
          dr: 87,
          apiAvailable: false
        },
        {
          name: 'Manta',
          type: 'directory',
          url: 'https://manta.com',
          dofollow: true,
          dr: 72,
          apiAvailable: false
        },
        {
          name: 'Hotfrog',
          type: 'directory',
          url: 'https://hotfrog.com',
          dofollow: true,
          dr: 65,
          apiAvailable: true
        },
        {
          name: 'Brownbook',
          type: 'directory',
          url: 'https://brownbook.net',
          dofollow: true,
          dr: 60,
          apiAvailable: true
        },
        {
          name: 'Cylex',
          type: 'directory',
          url: 'https://cylex.us.com',
          dofollow: true,
          dr: 55,
          apiAvailable: true
        },
        {
          name: 'Foursquare',
          type: 'directory',
          url: 'https://foursquare.com',
          dofollow: true,
          dr: 91,
          apiAvailable: true
        },
        {
          name: 'MapQuest',
          type: 'directory',
          url: 'https://mapquest.com',
          dofollow: true,
          dr: 85,
          apiAvailable: false
        }
      ],

      // ===== TRAVEL-SPECIFIC DIRECTORIES =====
      travelDirectories: [
        {
          name: 'TripAdvisor',
          type: 'travel',
          url: 'https://tripadvisor.com',
          dofollow: false,
          dr: 93,
          apiAvailable: false,
          submissionUrl: 'https://www.tripadvisor.com/Owners'
        },
        {
          name: 'Kayak',
          type: 'travel',
          url: 'https://kayak.com',
          dofollow: true,
          dr: 89,
          apiAvailable: false
        },
        {
          name: 'ASTA (American Society of Travel Advisors)',
          type: 'travel',
          url: 'https://asta.org',
          dofollow: true,
          dr: 65,
          apiAvailable: false
        }
      ],

      // ===== BOOKMARKING SITES (Quick Indexed Links) =====
      bookmarkingSites: [
        {
          name: 'Mix.com',
          type: 'bookmark',
          url: 'https://mix.com',
          dofollow: true,
          dr: 92,
          apiAvailable: true
        },
        {
          name: 'Scoop.it',
          type: 'curation',
          url: 'https://scoop.it',
          dofollow: true,
          dr: 88,
          apiAvailable: true
        },
        {
          name: 'Diigo',
          type: 'bookmark',
          url: 'https://diigo.com',
          dofollow: true,
          dr: 85,
          apiAvailable: true
        },
        {
          name: 'Pearltrees',
          type: 'curation',
          url: 'https://pearltrees.com',
          dofollow: true,
          dr: 82,
          apiAvailable: false
        },
        {
          name: 'Folkd',
          type: 'bookmark',
          url: 'https://folkd.com',
          dofollow: true,
          dr: 70,
          apiAvailable: false
        },
        {
          name: 'Instapaper',
          type: 'bookmark',
          url: 'https://instapaper.com',
          dofollow: false,
          dr: 85,
          apiAvailable: true
        },
        {
          name: 'Pocket',
          type: 'bookmark',
          url: 'https://getpocket.com',
          dofollow: false,
          dr: 92,
          apiAvailable: true
        }
      ],

      // ===== DOCUMENT SHARING (High DR Backlinks) =====
      documentSharing: [
        {
          name: 'SlideShare',
          type: 'presentation',
          url: 'https://slideshare.net',
          dofollow: true,
          dr: 95,
          apiAvailable: true
        },
        {
          name: 'Scribd',
          type: 'document',
          url: 'https://scribd.com',
          dofollow: true,
          dr: 93,
          apiAvailable: false
        },
        {
          name: 'Issuu',
          type: 'magazine',
          url: 'https://issuu.com',
          dofollow: true,
          dr: 92,
          apiAvailable: true
        },
        {
          name: 'Calameo',
          type: 'magazine',
          url: 'https://calameo.com',
          dofollow: true,
          dr: 85,
          apiAvailable: false
        },
        {
          name: 'Academia.edu',
          type: 'academic',
          url: 'https://academia.edu',
          dofollow: true,
          dr: 93,
          apiAvailable: false
        }
      ],

      // ===== PRESS RELEASE SITES (News Backlinks) =====
      pressRelease: [
        {
          name: 'PRLog',
          type: 'free',
          url: 'https://prlog.org',
          dofollow: true,
          dr: 75,
          apiAvailable: true,
          submissionUrl: 'https://www.prlog.org/post/'
        },
        {
          name: 'OpenPR',
          type: 'free',
          url: 'https://openpr.com',
          dofollow: true,
          dr: 72,
          apiAvailable: false,
          submissionUrl: 'https://www.openpr.com/news/submit.html'
        },
        {
          name: 'PR.com',
          type: 'free',
          url: 'https://pr.com',
          dofollow: true,
          dr: 70,
          apiAvailable: false
        },
        {
          name: '1888 Press Release',
          type: 'free',
          url: 'https://1888pressrelease.com',
          dofollow: true,
          dr: 65,
          apiAvailable: false
        },
        {
          name: 'Free Press Release',
          type: 'free',
          url: 'https://free-press-release.com',
          dofollow: true,
          dr: 60,
          apiAvailable: false
        },
        {
          name: 'Newswire',
          type: 'free',
          url: 'https://newswire.com',
          dofollow: true,
          dr: 78,
          apiAvailable: false
        }
      ],

      // ===== WIKI SITES (High Authority Backlinks) =====
      wikiSites: [
        {
          name: 'WikiTravel',
          type: 'wiki',
          url: 'https://wikitravel.org',
          dofollow: true,
          dr: 80,
          apiAvailable: false
        },
        {
          name: 'WikiVoyage',
          type: 'wiki',
          url: 'https://wikivoyage.org',
          dofollow: true,
          dr: 75,
          apiAvailable: false
        }
      ],

      // ===== PROFILE SITES (Instant Backlinks) =====
      profileSites: [
        {
          name: 'About.me',
          type: 'profile',
          url: 'https://about.me',
          dofollow: true,
          dr: 90,
          apiAvailable: false
        },
        {
          name: 'Gravatar',
          type: 'profile',
          url: 'https://gravatar.com',
          dofollow: true,
          dr: 90,
          apiAvailable: true
        },
        {
          name: 'Crunchbase',
          type: 'profile',
          url: 'https://crunchbase.com',
          dofollow: true,
          dr: 91,
          apiAvailable: true
        },
        {
          name: 'AngelList',
          type: 'profile',
          url: 'https://angel.co',
          dofollow: true,
          dr: 91,
          apiAvailable: false
        },
        {
          name: 'F6S',
          type: 'profile',
          url: 'https://f6s.com',
          dofollow: true,
          dr: 75,
          apiAvailable: false
        },
        {
          name: 'Product Hunt',
          type: 'profile',
          url: 'https://producthunt.com',
          dofollow: true,
          dr: 90,
          apiAvailable: true
        }
      ],

      // ===== Q&A SITES (Contextual Backlinks) =====
      qaSites: [
        {
          name: 'Quora',
          type: 'qa',
          url: 'https://quora.com',
          dofollow: false,
          dr: 93,
          apiAvailable: false,
          instructions: 'Answer travel questions with helpful advice and subtle link mentions'
        },
        {
          name: 'Reddit',
          type: 'qa',
          url: 'https://reddit.com',
          dofollow: false,
          dr: 97,
          apiAvailable: true,
          subreddits: ['travel', 'flights', 'Shoestring', 'TravelHacks', 'solotravel']
        },
        {
          name: 'Stack Exchange Travel',
          type: 'qa',
          url: 'https://travel.stackexchange.com',
          dofollow: true,
          dr: 85,
          apiAvailable: false
        }
      ],

      // ===== IMAGE SHARING (Visual Backlinks) =====
      imageSharing: [
        {
          name: 'Flickr',
          type: 'image',
          url: 'https://flickr.com',
          dofollow: true,
          dr: 94,
          apiAvailable: true
        },
        {
          name: 'Imgur',
          type: 'image',
          url: 'https://imgur.com',
          dofollow: false,
          dr: 93,
          apiAvailable: true
        },
        {
          name: '500px',
          type: 'image',
          url: 'https://500px.com',
          dofollow: true,
          dr: 89,
          apiAvailable: true
        }
      ],

      // ===== VIDEO SHARING =====
      videoSharing: [
        {
          name: 'YouTube',
          type: 'video',
          url: 'https://youtube.com',
          dofollow: false, // But very high authority
          dr: 100,
          apiAvailable: true
        },
        {
          name: 'Vimeo',
          type: 'video',
          url: 'https://vimeo.com',
          dofollow: true,
          dr: 96,
          apiAvailable: true
        },
        {
          name: 'Dailymotion',
          type: 'video',
          url: 'https://dailymotion.com',
          dofollow: true,
          dr: 93,
          apiAvailable: true
        }
      ]
    };
  }

  /**
   * Get all real platforms organized by category
   */
  getRealPlatforms() {
    return this.realPlatforms;
  }

  /**
   * Get platforms summary with stats
   */
  getPlatformsSummary() {
    const summary = {};
    let totalPlatforms = 0;
    let dofollowCount = 0;
    let avgDR = 0;
    let drSum = 0;

    Object.entries(this.realPlatforms).forEach(([category, platforms]) => {
      summary[category] = {
        count: platforms.length,
        dofollow: platforms.filter(p => p.dofollow).length,
        avgDR: Math.round(platforms.reduce((sum, p) => sum + (p.dr || 0), 0) / platforms.length),
        platforms: platforms.map(p => ({
          name: p.name,
          dofollow: p.dofollow,
          dr: p.dr,
          apiAvailable: p.apiAvailable
        }))
      };
      
      totalPlatforms += platforms.length;
      dofollowCount += platforms.filter(p => p.dofollow).length;
      drSum += platforms.reduce((sum, p) => sum + (p.dr || 0), 0);
    });

    avgDR = Math.round(drSum / totalPlatforms);

    return {
      categories: Object.keys(this.realPlatforms).length,
      totalPlatforms,
      dofollowPlatforms: dofollowCount,
      nofollowPlatforms: totalPlatforms - dofollowCount,
      averageDR: avgDR,
      byCategory: summary
    };
  }

  /**
   * Submit to Pinterest (Real API)
   */
  async submitToPinterest(pinData) {
    const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
    if (!accessToken) {
      return { success: false, error: 'Pinterest access token not configured', manual: true };
    }

    try {
      const response = await axios.post('https://api.pinterest.com/v5/pins', {
        board_id: pinData.boardId,
        title: pinData.title,
        description: `${pinData.description}\n\nLearn more: ${this.siteUrl}`,
        link: this.siteUrl,
        media_source: {
          source_type: 'image_url',
          url: pinData.imageUrl
        }
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        platform: 'Pinterest',
        postUrl: `https://pinterest.com/pin/${response.data.id}`,
        backlinkUrl: this.siteUrl,
        dofollow: true, // Pinterest pin links are dofollow!
        dr: 94
      };
    } catch (error) {
      return { success: false, error: error.message, platform: 'Pinterest' };
    }
  }

  /**
   * Submit to Twitter/X (Real API)
   */
  async submitToTwitter(tweetData) {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!bearerToken) {
      return { success: false, error: 'Twitter API not configured', manual: true };
    }

    try {
      // Twitter API v2
      const response = await axios.post('https://api.twitter.com/2/tweets', {
        text: `${tweetData.text}\n\n${this.siteUrl}`
      }, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        platform: 'Twitter',
        postUrl: `https://twitter.com/i/status/${response.data.data.id}`,
        backlinkUrl: this.siteUrl,
        dofollow: false,
        dr: 94
      };
    } catch (error) {
      return { success: false, error: error.message, platform: 'Twitter' };
    }
  }

  /**
   * Submit to LinkedIn (Real API)
   */
  async submitToLinkedIn(postData) {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const companyId = process.env.LINKEDIN_COMPANY_ID;

    if (!accessToken) {
      return { success: false, error: 'LinkedIn API not configured', manual: true };
    }

    try {
      const response = await axios.post('https://api.linkedin.com/v2/posts', {
        author: companyId ? `urn:li:organization:${companyId}` : 'urn:li:person:me',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postData.text
            },
            shareMediaCategory: 'ARTICLE',
            media: [{
              status: 'READY',
              originalUrl: this.siteUrl,
              title: { text: postData.title },
              description: { text: postData.description }
            }]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        platform: 'LinkedIn',
        postId: response.data.id,
        backlinkUrl: this.siteUrl,
        dofollow: false,
        dr: 98
      };
    } catch (error) {
      return { success: false, error: error.message, platform: 'LinkedIn' };
    }
  }

  /**
   * Submit to Reddit (Real API)
   */
  async submitToReddit(postData) {
    const accessToken = process.env.REDDIT_ACCESS_TOKEN;
    const refreshToken = process.env.REDDIT_REFRESH_TOKEN;

    if (!accessToken) {
      return { success: false, error: 'Reddit API not configured', manual: true };
    }

    try {
      const response = await axios.post('https://oauth.reddit.com/api/submit', 
        new URLSearchParams({
          kind: 'link',
          sr: postData.subreddit || 'travel',
          title: postData.title,
          url: this.siteUrl,
          resubmit: true
        }), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'WegoFare/1.0'
        }
      });

      if (response.data.success) {
        return {
          success: true,
          platform: 'Reddit',
          postUrl: response.data.jquery?.[10]?.[3]?.[0] || 'submitted',
          backlinkUrl: this.siteUrl,
          dofollow: false,
          dr: 97
        };
      }
      
      return { success: false, error: 'Reddit submission failed', platform: 'Reddit' };
    } catch (error) {
      return { success: false, error: error.message, platform: 'Reddit' };
    }
  }

  /**
   * Submit to Mix.com (Bookmarking)
   */
  async submitToMix(pageData) {
    // Mix doesn't have a public API, but we can track manual submissions
    return {
      success: false,
      manual: true,
      platform: 'Mix.com',
      instructions: `
        1. Go to https://mix.com
        2. Sign in or create account
        3. Click the "+" button
        4. Add URL: ${this.siteUrl}
        5. Add title: ${pageData.title || 'Best Flight Deals - WegoFare'}
        6. Select collection: Travel
      `,
      dofollow: true,
      dr: 92
    };
  }

  /**
   * Submit to Blogger (Google API)
   */
  async submitToBlogger(postData) {
    const accessToken = process.env.GOOGLE_BLOGGER_TOKEN;
    const blogId = process.env.BLOGGER_BLOG_ID;

    if (!accessToken || !blogId) {
      return { success: false, error: 'Blogger API not configured', manual: true };
    }

    try {
      const response = await axios.post(
        `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`,
        {
          kind: 'blogger#post',
          title: postData.title,
          content: `${postData.content}<br><br>Visit <a href="${this.siteUrl}">${this.siteName}</a> for more travel deals!`
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'Blogger',
        postUrl: response.data.url,
        backlinkUrl: this.siteUrl,
        dofollow: true, // Blogger links ARE dofollow!
        dr: 95
      };
    } catch (error) {
      return { success: false, error: error.message, platform: 'Blogger' };
    }
  }

  /**
   * Create directory listing content
   */
  generateDirectoryListing() {
    return {
      businessName: this.siteName,
      website: this.siteUrl,
      email: this.siteEmail,
      phone: this.sitePhone,
      description: this.siteDescription,
      shortDescription: 'Find cheap flights, hotels, and vacation packages. Save up to 70% on travel.',
      category: 'Travel & Tourism',
      subcategory: 'Travel Agencies',
      keywords: 'cheap flights, airline tickets, hotel deals, vacation packages, travel agency, flight comparison',
      address: {
        street: '123 Travel Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      },
      hours: 'Open 24/7',
      socialLinks: {
        facebook: process.env.FACEBOOK_URL || '',
        twitter: process.env.TWITTER_URL || '',
        instagram: process.env.INSTAGRAM_URL || '',
        linkedin: process.env.LINKEDIN_URL || '',
        pinterest: process.env.PINTEREST_URL || ''
      }
    };
  }

  /**
   * Get submission instructions for manual platforms
   */
  getManualSubmissionInstructions(platformName) {
    const instructions = {
      'Yelp': {
        url: 'https://biz.yelp.com/signup',
        steps: [
          'Go to https://biz.yelp.com',
          'Click "Claim your Business"',
          'Search for your business or add new',
          `Enter business name: ${this.siteName}`,
          `Enter website: ${this.siteUrl}`,
          'Complete verification process'
        ],
        estimatedTime: '10-15 minutes',
        backlinkType: 'Profile link (nofollow, high DR)'
      },
      'Yellow Pages': {
        url: 'https://advertising.yp.com',
        steps: [
          'Go to https://advertising.yp.com',
          'Click "Get Listed"',
          'Fill in business details',
          `Website: ${this.siteUrl}`,
          'Verify ownership'
        ],
        estimatedTime: '10 minutes',
        backlinkType: 'Directory listing (dofollow)'
      },
      'TripAdvisor': {
        url: 'https://www.tripadvisor.com/Owners',
        steps: [
          'Go to TripAdvisor Owners page',
          'Register your business',
          'Complete business profile',
          `Add website: ${this.siteUrl}`,
          'Wait for verification'
        ],
        estimatedTime: '15-20 minutes',
        backlinkType: 'Travel directory listing'
      },
      'Google Business Profile': {
        url: 'https://business.google.com',
        steps: [
          'Go to Google Business Profile',
          'Sign in with Google account',
          'Add your business',
          `Website: ${this.siteUrl}`,
          'Verify via phone/postcard/email'
        ],
        estimatedTime: '5-10 minutes (verification may take days)',
        backlinkType: 'Critical - dofollow, DR 100'
      },
      'Quora': {
        url: 'https://quora.com',
        steps: [
          'Create Quora account',
          'Set up profile with website link',
          'Find travel-related questions',
          'Write helpful answers',
          `Include ${this.siteUrl} where relevant`
        ],
        estimatedTime: 'Ongoing',
        backlinkType: 'Contextual (nofollow, high traffic)'
      },
      'Medium': {
        url: 'https://medium.com',
        steps: [
          'Create Medium account',
          'Set up publication or profile',
          'Write travel articles',
          `Include links to ${this.siteUrl}`,
          'Publish and share'
        ],
        estimatedTime: '30-60 minutes per article',
        backlinkType: 'Article links (nofollow, high DR 95)'
      },
      'SlideShare': {
        url: 'https://slideshare.net',
        steps: [
          'Create SlideShare/LinkedIn account',
          'Create travel presentation (PowerPoint/PDF)',
          'Include website link in slides',
          `Add ${this.siteUrl} in profile`,
          'Upload and publish'
        ],
        estimatedTime: '30-60 minutes',
        backlinkType: 'Presentation links (dofollow, DR 95)'
      }
    };

    return instructions[platformName] || {
      url: 'Check platform website',
      steps: ['Visit the platform', 'Create account', 'Add your business/profile', `Include link to ${this.siteUrl}`],
      estimatedTime: 'Varies',
      backlinkType: 'Check platform for link type'
    };
  }

  /**
   * Track a new live backlink
   */
  addLiveBacklink(data) {
    const backlink = {
      id: this.backlinkIdCounter++,
      platform: data.platform,
      category: data.category,
      backlinkUrl: data.backlinkUrl || this.siteUrl,
      sourceUrl: data.sourceUrl,
      sourceDomain: this.extractDomain(data.sourceUrl),
      anchorText: data.anchorText || this.siteName,
      dofollow: data.dofollow,
      dr: data.dr || 0,
      status: data.status || 'live',
      indexed: data.indexed || false,
      createdAt: new Date(),
      lastChecked: new Date()
    };

    this.liveBacklinks.push(backlink);
    this.stats.total++;
    this.stats.successful++;
    this.stats.byPlatform[data.platform] = (this.stats.byPlatform[data.platform] || 0) + 1;

    return backlink;
  }

  /**
   * Get all live backlinks
   */
  getLiveBacklinks(filters = {}) {
    let results = [...this.liveBacklinks];

    if (filters.dofollow !== undefined) {
      results = results.filter(b => b.dofollow === filters.dofollow);
    }
    if (filters.indexed !== undefined) {
      results = results.filter(b => b.indexed === filters.indexed);
    }
    if (filters.platform) {
      results = results.filter(b => b.platform === filters.platform);
    }
    if (filters.category) {
      results = results.filter(b => b.category === filters.category);
    }
    if (filters.minDR) {
      results = results.filter(b => b.dr >= filters.minDR);
    }

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get backlink statistics
   */
  getBacklinkStats() {
    const total = this.liveBacklinks.length;
    const dofollow = this.liveBacklinks.filter(b => b.dofollow).length;
    const indexed = this.liveBacklinks.filter(b => b.indexed).length;
    const avgDR = total > 0 
      ? Math.round(this.liveBacklinks.reduce((sum, b) => sum + (b.dr || 0), 0) / total)
      : 0;

    return {
      total,
      dofollow,
      nofollow: total - dofollow,
      indexed,
      notIndexed: total - indexed,
      averageDR: avgDR,
      byPlatform: this.stats.byPlatform,
      uniqueDomains: new Set(this.liveBacklinks.map(b => b.sourceDomain)).size
    };
  }

  /**
   * Check if a URL is indexed by Google
   */
  async checkIndexStatus(url) {
    try {
      // Use Google's site: operator via Custom Search API
      const apiKey = process.env.GOOGLE_API_KEY;
      const cx = process.env.GOOGLE_SEARCH_CX;

      if (!apiKey || !cx) {
        return { indexed: 'unknown', error: 'Google API not configured' };
      }

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: cx,
          q: `site:${url}`
        }
      });

      const indexed = response.data.searchInformation.totalResults > 0;
      return { indexed, totalResults: parseInt(response.data.searchInformation.totalResults) };
    } catch (error) {
      return { indexed: 'unknown', error: error.message };
    }
  }

  /**
   * Helper to extract domain
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
   * Get priority action items for manual submission
   */
  getPriorityActions() {
    const existingPlatforms = new Set(this.liveBacklinks.map(b => b.platform));
    const actions = [];

    // Critical priority - Google Business
    if (!existingPlatforms.has('Google Business Profile')) {
      actions.push({
        priority: 1,
        platform: 'Google Business Profile',
        type: 'manual',
        reason: 'DR 100, dofollow, critical for local SEO',
        instructions: this.getManualSubmissionInstructions('Google Business Profile')
      });
    }

    // High priority - High DR directories
    const highPriority = ['Yelp', 'Yellow Pages', 'TripAdvisor', 'SlideShare', 'Medium'];
    highPriority.forEach((platform, index) => {
      if (!existingPlatforms.has(platform)) {
        actions.push({
          priority: index + 2,
          platform,
          type: 'manual',
          reason: 'High DR directory/platform',
          instructions: this.getManualSubmissionInstructions(platform)
        });
      }
    });

    return actions.sort((a, b) => a.priority - b.priority);
  }
}

module.exports = new RealBacklinkService();
