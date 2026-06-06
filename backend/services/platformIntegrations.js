const axios = require('axios');
const FormData = require('form-data');

/**
 * Platform Integrations Service
 * Real API integrations for backlink posting
 * 
 * Supported Platforms:
 * - Medium (via Integration Tokens)
 * - LinkedIn (via OAuth)
 * - WordPress.com (via OAuth)
 * - Blogger (via Google API)
 * - Tumblr (via OAuth)
 * - Pinterest (via OAuth)
 * - Reddit (via OAuth)
 * - Dev.to (via API Key)
 */

class PlatformIntegrations {
  constructor() {
    // Platform credentials from environment
    this.credentials = {
      medium: {
        token: process.env.MEDIUM_TOKEN,
        // Get token from: https://medium.com/me/settings/security -> Integration Tokens
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        // Get from: https://www.linkedin.com/developers/apps
      },
      wordpress: {
        clientId: process.env.WORDPRESS_CLIENT_ID,
        clientSecret: process.env.WORDPRESS_CLIENT_SECRET,
        accessToken: process.env.WORDPRESS_ACCESS_TOKEN,
        blogId: process.env.WORDPRESS_BLOG_ID,
        // Get from: https://developer.wordpress.com/apps/
      },
      blogger: {
        apiKey: process.env.GOOGLE_API_KEY,
        accessToken: process.env.BLOGGER_ACCESS_TOKEN,
        blogId: process.env.BLOGGER_BLOG_ID,
        // Get from: https://console.cloud.google.com/
      },
      tumblr: {
        consumerKey: process.env.TUMBLR_CONSUMER_KEY,
        consumerSecret: process.env.TUMBLR_CONSUMER_SECRET,
        token: process.env.TUMBLR_TOKEN,
        tokenSecret: process.env.TUMBLR_TOKEN_SECRET,
        blogName: process.env.TUMBLR_BLOG_NAME,
        // Get from: https://www.tumblr.com/oauth/apps
      },
      pinterest: {
        accessToken: process.env.PINTEREST_ACCESS_TOKEN,
        boardId: process.env.PINTEREST_BOARD_ID,
        // Get from: https://developers.pinterest.com/
      },
      reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
        userAgent: 'FlightDealsBot/1.0',
        // Get from: https://www.reddit.com/prefs/apps
      },
      devto: {
        apiKey: process.env.DEVTO_API_KEY,
        // Get from: https://dev.to/settings/extensions
      },
      hashnode: {
        token: process.env.HASHNODE_TOKEN,
        publicationId: process.env.HASHNODE_PUBLICATION_ID,
        // Get from: https://hashnode.com/settings/developer
      }
    };

    // Track submissions
    this.submissionHistory = [];
  }

  /**
   * Check which platforms are configured
   */
  getConfiguredPlatforms() {
    const configured = [];
    
    if (this.credentials.medium.token) configured.push('medium');
    if (this.credentials.linkedin.accessToken) configured.push('linkedin');
    if (this.credentials.wordpress.accessToken) configured.push('wordpress');
    if (this.credentials.blogger.accessToken) configured.push('blogger');
    if (this.credentials.tumblr.token) configured.push('tumblr');
    if (this.credentials.pinterest.accessToken) configured.push('pinterest');
    if (this.credentials.reddit.clientId) configured.push('reddit');
    if (this.credentials.devto.apiKey) configured.push('devto');
    if (this.credentials.hashnode.token) configured.push('hashnode');
    
    return configured;
  }

  /**
   * Post to Medium
   * Docs: https://github.com/Medium/medium-api-docs
   */
  async postToMedium(title, content, tags = []) {
    if (!this.credentials.medium.token) {
      return { success: false, error: 'Medium token not configured' };
    }

    try {
      // Get user info first
      const userResponse = await axios.get('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.credentials.medium.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userId = userResponse.data.data.id;
      
      // Create post
      const response = await axios.post(
        `https://api.medium.com/v1/users/${userId}/posts`,
        {
          title,
          contentFormat: 'markdown',
          content,
          tags: tags.slice(0, 5), // Medium allows max 5 tags
          publishStatus: 'public'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.medium.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'medium',
        postId: response.data.data.id,
        url: response.data.data.url,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Medium post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'medium',
        error: error.response?.data?.errors?.[0]?.message || error.message
      };
    }
  }

  /**
   * Post to LinkedIn
   * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api
   */
  async postToLinkedIn(content, title = null, link = null) {
    if (!this.credentials.linkedin.accessToken) {
      return { success: false, error: 'LinkedIn access token not configured' };
    }

    try {
      // Get user URN first
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.credentials.linkedin.accessToken}`
        }
      });
      
      const personUrn = `urn:li:person:${profileResponse.data.sub}`;
      
      // Create share
      const shareData = {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: link ? 'ARTICLE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Add article if link provided
      if (link) {
        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          originalUrl: link,
          title: { text: title || 'Check this out!' }
        }];
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        shareData,
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.linkedin.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      return {
        success: true,
        platform: 'linkedin',
        postId: response.data.id,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('LinkedIn post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'linkedin',
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Post to WordPress.com
   * Docs: https://developer.wordpress.com/docs/api/
   */
  async postToWordPress(title, content, tags = [], categories = []) {
    if (!this.credentials.wordpress.accessToken || !this.credentials.wordpress.blogId) {
      return { success: false, error: 'WordPress credentials not configured' };
    }

    try {
      const response = await axios.post(
        `https://public-api.wordpress.com/rest/v1.1/sites/${this.credentials.wordpress.blogId}/posts/new`,
        {
          title,
          content,
          tags: tags.join(','),
          categories: categories.join(','),
          status: 'publish',
          format: 'standard'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.wordpress.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'wordpress',
        postId: response.data.ID,
        url: response.data.URL,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('WordPress post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'wordpress',
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Post to Blogger
   * Docs: https://developers.google.com/blogger/docs/3.0/using
   */
  async postToBlogger(title, content, labels = []) {
    if (!this.credentials.blogger.accessToken || !this.credentials.blogger.blogId) {
      return { success: false, error: 'Blogger credentials not configured' };
    }

    try {
      const response = await axios.post(
        `https://www.googleapis.com/blogger/v3/blogs/${this.credentials.blogger.blogId}/posts`,
        {
          kind: 'blogger#post',
          title,
          content,
          labels
        },
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.blogger.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'blogger',
        postId: response.data.id,
        url: response.data.url,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Blogger post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'blogger',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Post to Tumblr
   * Docs: https://www.tumblr.com/docs/en/api/v2
   */
  async postToTumblr(title, content, tags = []) {
    if (!this.credentials.tumblr.token || !this.credentials.tumblr.blogName) {
      return { success: false, error: 'Tumblr credentials not configured' };
    }

    try {
      // Note: This is a simplified version. Full OAuth 1.0a signing is complex.
      // In production, use a library like 'tumblr.js'
      const response = await axios.post(
        `https://api.tumblr.com/v2/blog/${this.credentials.tumblr.blogName}/post`,
        {
          type: 'text',
          title,
          body: content,
          tags: tags.join(','),
          state: 'published'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.tumblr.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'tumblr',
        postId: response.data.response.id_string,
        url: `https://${this.credentials.tumblr.blogName}.tumblr.com/post/${response.data.response.id_string}`,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Tumblr post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'tumblr',
        error: error.response?.data?.meta?.msg || error.message
      };
    }
  }

  /**
   * Post to Pinterest
   * Docs: https://developers.pinterest.com/docs/api/v5/
   */
  async postToPinterest(title, description, link, imageUrl) {
    if (!this.credentials.pinterest.accessToken || !this.credentials.pinterest.boardId) {
      return { success: false, error: 'Pinterest credentials not configured' };
    }

    try {
      const response = await axios.post(
        'https://api.pinterest.com/v5/pins',
        {
          board_id: this.credentials.pinterest.boardId,
          title,
          description,
          link,
          media_source: {
            source_type: 'image_url',
            url: imageUrl
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.pinterest.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'pinterest',
        pinId: response.data.id,
        url: `https://pinterest.com/pin/${response.data.id}`,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Pinterest post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'pinterest',
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Post to Reddit
   * Docs: https://www.reddit.com/dev/api
   */
  async postToReddit(subreddit, title, content, isLink = false, url = null) {
    if (!this.credentials.reddit.clientId || !this.credentials.reddit.clientSecret) {
      return { success: false, error: 'Reddit credentials not configured' };
    }

    try {
      // Get access token first
      const authResponse = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        `grant_type=password&username=${this.credentials.reddit.username}&password=${this.credentials.reddit.password}`,
        {
          auth: {
            username: this.credentials.reddit.clientId,
            password: this.credentials.reddit.clientSecret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.credentials.reddit.userAgent
          }
        }
      );

      const accessToken = authResponse.data.access_token;

      // Submit post
      const postData = {
        sr: subreddit,
        title,
        kind: isLink ? 'link' : 'self',
        ...(isLink ? { url } : { text: content })
      };

      const response = await axios.post(
        'https://oauth.reddit.com/api/submit',
        new URLSearchParams(postData).toString(),
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.credentials.reddit.userAgent
          }
        }
      );

      if (response.data.json.errors?.length > 0) {
        throw new Error(response.data.json.errors[0][1]);
      }

      return {
        success: true,
        platform: 'reddit',
        postId: response.data.json.data.id,
        url: response.data.json.data.url,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Reddit post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'reddit',
        error: error.message
      };
    }
  }

  /**
   * Post to Dev.to
   * Docs: https://developers.forem.com/api
   */
  async postToDevTo(title, content, tags = [], series = null) {
    if (!this.credentials.devto.apiKey) {
      return { success: false, error: 'Dev.to API key not configured' };
    }

    try {
      const response = await axios.post(
        'https://dev.to/api/articles',
        {
          article: {
            title,
            body_markdown: content,
            published: true,
            tags: tags.slice(0, 4), // Dev.to allows max 4 tags
            series
          }
        },
        {
          headers: {
            'api-key': this.credentials.devto.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'devto',
        postId: response.data.id,
        url: response.data.url,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Dev.to post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'devto',
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Post to Hashnode
   * Docs: https://apidocs.hashnode.com/
   */
  async postToHashnode(title, content, tags = []) {
    if (!this.credentials.hashnode.token || !this.credentials.hashnode.publicationId) {
      return { success: false, error: 'Hashnode credentials not configured' };
    }

    try {
      const mutation = `
        mutation CreatePost($input: CreateStoryInput!) {
          createPublicationStory(input: $input, publicationId: "${this.credentials.hashnode.publicationId}") {
            success
            post {
              _id
              slug
              title
            }
          }
        }
      `;

      const response = await axios.post(
        'https://api.hashnode.com',
        {
          query: mutation,
          variables: {
            input: {
              title,
              contentMarkdown: content,
              tags: tags.map(tag => ({ _id: tag, slug: tag.toLowerCase(), name: tag }))
            }
          }
        },
        {
          headers: {
            'Authorization': this.credentials.hashnode.token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const post = response.data.data.createPublicationStory.post;
      return {
        success: true,
        platform: 'hashnode',
        postId: post._id,
        url: `https://hashnode.com/post/${post.slug}`,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hashnode post error:', error.response?.data || error.message);
      return {
        success: false,
        platform: 'hashnode',
        error: error.message
      };
    }
  }

  /**
   * Submit to a directory (generic form submission)
   * Many directories use similar form structures
   */
  async submitToDirectory(directoryUrl, businessInfo) {
    // This is a template - actual implementation depends on each directory's structure
    const defaultInfo = {
      businessName: process.env.SITE_NAME || 'WegoFare',
      website: process.env.SITE_URL || 'https://wegofare.com',
      description: 'Best flight deals, hotels, cruises, and vacation packages. Save up to 70% on travel.',
      category: 'Travel',
      email: process.env.CONTACT_EMAIL || 'info@wegofare.com',
      phone: process.env.CONTACT_PHONE || '',
      address: process.env.BUSINESS_ADDRESS || '',
      ...businessInfo
    };

    // Log the submission attempt (actual submission would require specific integration per directory)
    const submission = {
      directory: directoryUrl,
      businessInfo: defaultInfo,
      submittedAt: new Date().toISOString(),
      status: 'pending_manual_review'
    };

    this.submissionHistory.push(submission);

    return {
      success: true,
      platform: 'directory',
      directory: directoryUrl,
      message: 'Directory submission prepared. Manual submission may be required.',
      data: defaultInfo
    };
  }

  /**
   * Universal post method - routes to appropriate platform
   */
  async post(platform, data) {
    switch (platform.toLowerCase()) {
      case 'medium':
        return this.postToMedium(data.title, data.content, data.tags);
      
      case 'linkedin':
        return this.postToLinkedIn(data.content, data.title, data.link);
      
      case 'wordpress':
        return this.postToWordPress(data.title, data.content, data.tags, data.categories);
      
      case 'blogger':
        return this.postToBlogger(data.title, data.content, data.labels);
      
      case 'tumblr':
        return this.postToTumblr(data.title, data.content, data.tags);
      
      case 'pinterest':
        return this.postToPinterest(data.title, data.description, data.link, data.imageUrl);
      
      case 'reddit':
        return this.postToReddit(data.subreddit, data.title, data.content, data.isLink, data.url);
      
      case 'devto':
        return this.postToDevTo(data.title, data.content, data.tags);
      
      case 'hashnode':
        return this.postToHashnode(data.title, data.content, data.tags);
      
      case 'directory':
        return this.submitToDirectory(data.directoryUrl, data.businessInfo);
      
      default:
        return { success: false, error: `Unknown platform: ${platform}` };
    }
  }

  /**
   * Get submission history
   */
  getHistory() {
    return this.submissionHistory;
  }
}

module.exports = new PlatformIntegrations();
