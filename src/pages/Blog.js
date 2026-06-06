import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Calendar, 
  User, 
  Clock, 
  Search, 
  Tag,
  ChevronRight,
  Plane,
  TrendingUp
} from 'lucide-react';
import { API_URL } from '../config/api';
import './Blog.css';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const categories = [
    { id: 'all', name: 'All Posts', icon: <TrendingUp size={16} /> },
    { id: 'travel-tips', name: 'Travel Tips', icon: <Plane size={16} /> },
    { id: 'destinations', name: 'Destinations', icon: <Tag size={16} /> },
    { id: 'deals', name: 'Flight Deals', icon: <Tag size={16} /> },
    { id: 'airlines', name: 'Airlines', icon: <Plane size={16} /> }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blog`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content) => {
    if (!content) return '3 min read';
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <>
      <Helmet>
        <title>Travel Blog | Flight Deals, Tips & Destinations | WegoFare</title>
        <meta name="description" content="Discover the best travel tips, flight deals, destination guides, and airline reviews. Your ultimate resource for smart travel planning." />
      </Helmet>

      <div className="blog-page">
        {/* Hero Section */}
        <section className="blog-hero">
          <div className="hero-background">
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <h1>Travel Blog</h1>
            <p>Discover tips, deals, and inspiration for your next adventure</p>
            
            {/* Search Bar */}
            <div className="hero-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="blog-container">
          {/* Categories */}
          <div className="blog-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="blog-loading">
              <div className="loading-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text short"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {currentPage === 1 && filteredPosts.length > 0 && selectedCategory === 'all' && !searchTerm && (
                <div className="featured-post">
                  <Link to={`/blog/${filteredPosts[0].slug}`} className="featured-link">
                    <div className="featured-image">
                      <img 
                        src={filteredPosts[0].image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200'} 
                        alt={filteredPosts[0].title} 
                      />
                      <div className="featured-overlay">
                        <span className="featured-badge">Featured</span>
                      </div>
                    </div>
                    <div className="featured-content">
                      {filteredPosts[0].category && (
                        <span className="post-category">{filteredPosts[0].category}</span>
                      )}
                      <h2>{filteredPosts[0].title}</h2>
                      <p>{filteredPosts[0].excerpt}</p>
                      <div className="post-meta">
                        <span><User size={14} /> {filteredPosts[0].author || 'WegoFare'}</span>
                        <span><Calendar size={14} /> {formatDate(filteredPosts[0].date || filteredPosts[0].createdAt)}</span>
                        <span><Clock size={14} /> {getReadTime(filteredPosts[0].content)}</span>
                      </div>
                      <span className="read-more">
                        Read Article <ChevronRight size={16} />
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Posts Grid */}
              {currentPosts.length > 0 ? (
                <div className="posts-grid">
                  {currentPosts.slice(selectedCategory === 'all' && !searchTerm && currentPage === 1 ? 1 : 0).map((post, index) => (
                    <article key={post.id || index} className="post-card">
                      <Link to={`/blog/${post.slug}`}>
                        <div className="post-image">
                          <img 
                            src={post.image || `https://images.unsplash.com/photo-${1500000000000 + index}?w=400`} 
                            alt={post.title}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400';
                            }}
                          />
                          {post.category && (
                            <span className="card-category">{post.category}</span>
                          )}
                        </div>
                        <div className="post-content">
                          <h3>{post.title}</h3>
                          <p>{post.excerpt?.substring(0, 120)}...</p>
                          <div className="post-footer">
                            <div className="post-meta-small">
                              <span><Calendar size={12} /> {formatDate(post.date || post.createdAt)}</span>
                              <span><Clock size={12} /> {getReadTime(post.content)}</span>
                            </div>
                            <span className="read-link">Read More →</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="no-posts">
                  <div className="no-posts-icon">📝</div>
                  <h3>No posts found</h3>
                  <p>Try adjusting your search or category filter</p>
                  <button 
                    className="reset-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`page-num ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <div className="newsletter-content">
            <h2>✈️ Get Travel Deals in Your Inbox</h2>
            <p>Subscribe to our newsletter for exclusive flight deals and travel tips</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

export default Blog;
