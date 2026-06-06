const axios = require('axios');

class BlogPublisherService {
  constructor() {
    // High DA platforms for blog posting
    this.platforms = {
      medium: {
        name: 'Medium',
        da: 95,
        enabled: !!process.env.MEDIUM_API_KEY,
        apiKey: process.env.MEDIUM_API_KEY,
        userId: process.env.MEDIUM_USER_ID
      },
      devto: {
        name: 'Dev.to',
        da: 90,
        enabled: !!process.env.DEVTO_API_KEY,
        apiKey: process.env.DEVTO_API_KEY
      },
      hashnode: {
        name: 'Hashnode',
        da: 88,
        enabled: !!process.env.HASHNODE_API_KEY,
        apiKey: process.env.HASHNODE_API_KEY,
        publicationId: process.env.HASHNODE_PUBLICATION_ID
      },
      wordpress: {
        name: 'WordPress.com',
        da: 92,
        enabled: !!process.env.WORDPRESS_API_KEY && !!process.env.WORDPRESS_SITE_ID,
        apiKey: process.env.WORDPRESS_API_KEY,
        siteId: process.env.WORDPRESS_SITE_ID
      },
      ghost: {
        name: 'Ghost',
        da: 85,
        enabled: !!process.env.GHOST_API_KEY && !!process.env.GHOST_URL,
        apiKey: process.env.GHOST_API_KEY,
        url: process.env.GHOST_URL
      }
    };
  }

  async publishToAll(blogPost) {
    const results = {
      success: [],
      failed: [],
      total: 0
    };

    // Publish to each enabled platform
    for (const [platform, config] of Object.entries(this.platforms)) {
      if (config.enabled) {
        try {
          const url = await this[`publishTo${platform.charAt(0).toUpperCase() + platform.slice(1)}`](blogPost);
          results.success.push({
            platform: config.name,
            da: config.da,
            url
          });
          results.total++;
        } catch (error) {
          console.error(`Failed to publish to ${config.name}:`, error.message);
          results.failed.push({
            platform: config.name,
            error: error.message
          });
        }
      }
    }

    // If no platforms are enabled, use fallback manual publishing instructions
    if (results.total === 0) {
      return this.generateManualPublishingGuide(blogPost);
    }

    return results;
  }

  async publishToMedium(blogPost) {
    if (!this.platforms.medium.enabled) {
      throw new Error('Medium API not configured');
    }

    const { apiKey, userId } = this.platforms.medium;
    
    // Convert content to Medium-compatible format
    const content = this.convertToMediumFormat(blogPost.content);
    
    const response = await axios.post(
      `https://api.medium.com/v1/users/${userId}/posts`,
      {
        title: blogPost.title,
        contentFormat: 'markdown',
        content: content,
        tags: blogPost.tags.slice(0, 5), // Medium allows max 5 tags
        publishStatus: 'public',
        canonicalUrl: `https://wegofare.com/blog/${blogPost.slug}`
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data.url;
  }

  async publishToDevto(blogPost) {
    if (!this.platforms.devto.enabled) {
      throw new Error('Dev.to API not configured');
    }

    const { apiKey } = this.platforms.devto;
    
    const response = await axios.post(
      'https://dev.to/api/articles',
      {
        article: {
          title: blogPost.title,
          published: true,
          body_markdown: blogPost.content,
          tags: blogPost.tags.slice(0, 4).map(tag => tag.toLowerCase().replace(/\s+/g, '')),
          canonical_url: `https://wegofare.com/blog/${blogPost.slug}`,
          description: blogPost.excerpt
        }
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.url;
  }

  async publishToHashnode(blogPost) {
    if (!this.platforms.hashnode.enabled) {
      throw new Error('Hashnode API not configured');
    }

    const { apiKey, publicationId } = this.platforms.hashnode;
    
    const query = `
      mutation CreatePublicationStory($input: CreateStoryInput!) {
        createPublicationStory(input: $input, publicationId: "${publicationId}") {
          post {
            slug
            url
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.hashnode.com/',
      {
        query,
        variables: {
          input: {
            title: blogPost.title,
            contentMarkdown: blogPost.content,
            tags: blogPost.tags.slice(0, 5).map(tag => ({ name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') })),
            coverImageURL: blogPost.image,
            isPartOfPublication: {
              publicationId: publicationId
            }
          }
        }
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data.createPublicationStory.post.url;
  }

  async publishToWordpress(blogPost) {
    if (!this.platforms.wordpress.enabled) {
      throw new Error('WordPress API not configured');
    }

    const { apiKey, siteId } = this.platforms.wordpress;
    
    const response = await axios.post(
      `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/new`,
      {
        title: blogPost.title,
        content: this.convertMarkdownToHTML(blogPost.content),
        excerpt: blogPost.excerpt,
        tags: blogPost.tags.join(','),
        status: 'publish',
        featured_image: blogPost.image
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.URL;
  }

  async publishToGhost(blogPost) {
    if (!this.platforms.ghost.enabled) {
      throw new Error('Ghost API not configured');
    }

    const { apiKey, url } = this.platforms.ghost;
    const jwt = require('jsonwebtoken');
    
    // Generate Ghost JWT token
    const [id, secret] = apiKey.split(':');
    const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
      keyid: id,
      algorithm: 'HS256',
      expiresIn: '5m',
      audience: '/admin/'
    });

    const response = await axios.post(
      `${url}/ghost/api/admin/posts/`,
      {
        posts: [{
          title: blogPost.title,
          markdown: blogPost.content,
          featured_image: blogPost.image,
          tags: blogPost.tags.map(tag => ({ name: tag })),
          excerpt: blogPost.excerpt,
          status: 'published',
          visibility: 'public'
        }]
      },
      {
        headers: {
          'Authorization': `Ghost ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return `${url}/${response.data.posts[0].slug}/`;
  }

  convertToMediumFormat(content) {
    // Add canonical link at the bottom
    return content + '\n\n---\n\n*Originally published at [wegofare.com](https://wegofare.com)*';
  }

  convertMarkdownToHTML(markdown) {
    // Basic markdown to HTML conversion
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and Italic
    html = html.replace(/\*\*\*([^\*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');
    
    // Line breaks
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  }

  generateManualPublishingGuide(blogPost) {
    return {
      success: [],
      failed: [],
      total: 0,
      manualPublishing: {
        message: 'No API keys configured. Use these high-DA platforms for manual publishing:',
        platforms: [
          {
            name: 'Medium',
            da: 95,
            url: 'https://medium.com/new-story',
            instructions: 'Copy content and paste. Add canonical URL to wegofare.com',
            canonicalUrl: `https://wegofare.com/blog/${blogPost.slug}`
          },
          {
            name: 'Dev.to',
            da: 90,
            url: 'https://dev.to/new',
            instructions: 'Create new post, paste markdown content, add canonical URL',
            canonicalUrl: `https://wegofare.com/blog/${blogPost.slug}`
          },
          {
            name: 'LinkedIn Articles',
            da: 98,
            url: 'https://www.linkedin.com/post/new',
            instructions: 'Write article, paste content, link back to wegofare.com'
          },
          {
            name: 'Hashnode',
            da: 88,
            url: 'https://hashnode.com/create/story',
            instructions: 'Create story, paste markdown, set canonical URL'
          },
          {
            name: 'Tumblr',
            da: 99,
            url: 'https://www.tumblr.com/new/text',
            instructions: 'Create text post, paste content with backlink'
          },
          {
            name: 'Blogger',
            da: 94,
            url: 'https://www.blogger.com/new',
            instructions: 'Create new post, paste HTML content, add source link'
          },
          {
            name: 'WordPress.com',
            da: 92,
            url: 'https://wordpress.com/post',
            instructions: 'Create new post, paste content, publish publicly'
          }
        ],
        blogData: {
          title: blogPost.title,
          content: blogPost.content,
          excerpt: blogPost.excerpt,
          tags: blogPost.tags,
          image: blogPost.image,
          canonicalUrl: `https://wegofare.com/blog/${blogPost.slug}`
        }
      }
    };
  }

  getEnabledPlatforms() {
    return Object.entries(this.platforms)
      .filter(([, config]) => config.enabled)
      .map(([key, config]) => ({
        platform: key,
        name: config.name,
        da: config.da
      }));
  }
}

module.exports = new BlogPublisherService();
