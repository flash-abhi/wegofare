import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContact } from '../context/ContactContext';
import './BlogPost.css';

function BlogPost() {
  const { contactSettings } = useContact();
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setBlog(data.post);
      } else {
        setError(data.message || 'Blog post not found');
      }
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-post-container">
        <div className="error-message">
          <h2>😞 Blog Post Not Found</h2>
          <p>{error || 'The blog post you are looking for does not exist.'}</p>
          <Link to="/blogs" className="back-link">← Back to All Blogs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <article className="blog-post">
        {/* Header */}
        <header className="blog-header">
          <Link to="/blogs" className="back-link">← Back to All Blogs</Link>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags">
              {blog.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
          
          <h1 className="blog-title">{blog.title}</h1>
          
          <div className="blog-meta">
            <span className="author">By {blog.author || 'WegoFare'}</span>
            <span className="separator">•</span>
            <span className="date">{new Date(blog.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </header>

        {/* Featured Image */}
        {blog.image && (
          <div className="featured-image">
            <img src={blog.image} alt={blog.title} />
          </div>
        )}

        {/* Content */}
        <div className="blog-content">
          {blog.content ? (
            <div dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} />
          ) : (
            <p>{blog.excerpt}</p>
          )}
        </div>

        {/* Call to Action */}
        <div className="blog-cta">
          <div className="cta-card">
            <h3>✈️ Ready to Book Your Next Adventure?</h3>
            <p>Find the best flight deals and save up to 40% on your next trip!</p>
            <div className="cta-buttons">
              <Link to="/" className="cta-button primary">Search Flights</Link>
              <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="cta-button secondary">
                📞 Call {contactSettings.tfn}
              </a>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-section">
          <h4>Share this article:</h4>
          <div className="share-buttons">
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="share-btn twitter"
            >
              🐦 Twitter
            </button>
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="share-btn facebook"
            >
              📘 Facebook
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="share-btn linkedin"
            >
              💼 LinkedIn
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="share-btn copy"
            >
              🔗 Copy Link
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogPost;
