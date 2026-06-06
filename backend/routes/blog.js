const express = require('express');
const router = express.Router();

// Function to get blog posts from admin routes
const getBlogPosts = () => {
  try {
    const adminRouter = require('./admin');
    if (adminRouter.getBlogPosts) {
      return adminRouter.getBlogPosts();
    }
  } catch (err) {
    console.log('Could not access admin blog posts');
  }
  return [];
};

// Get all published blogs (public)
router.get('/', (req, res) => {
  try {
    const blogPosts = getBlogPosts();
    const publishedBlogs = blogPosts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      image: post.image,
      author: post.author,
      date: post.date,
      tags: post.tags,
      url: post.url
    }));
    
    res.json({
      success: true,
      posts: publishedBlogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
});

// Get single blog by slug (public)
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const blogPosts = getBlogPosts();
    
    // Find blog by URL slug
    const blog = blogPosts.find(post => {
      if (post.url) {
        const urlSlug = post.url.split('/blog/')[1];
        return urlSlug === slug;
      }
      return false;
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Return full blog content
    res.json({
      success: true,
      post: {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        image: blog.image,
        images: blog.images,
        author: blog.author,
        date: blog.date,
        tags: blog.tags,
        url: blog.url,
        metadata: blog.metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
});

module.exports = router;
