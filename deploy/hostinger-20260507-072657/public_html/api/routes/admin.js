const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const Booking = require('../models/Booking');
const User = require('../models/User');
const blogAI = require('../services/blogAI');
const blogPublisher = require('../services/blogPublisher');
const loginSecurity = require('../services/loginSecurity');
const captchaService = require('../services/captcha');
const emailNotifications = require('../services/emailNotifications');
const { loginRateLimiter, getClientIP, getUserAgent } = require('../middleware/rateLimiter');
const contactConfig = require('../config/contactSettings');
const siteConfig = require('../config/siteSettings');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'public');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo${ext}`);
  }
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only SVG, PNG, JPG, WEBP files are allowed'));
  }
});

// Admin credentials (in production, use database)
let adminUsers = [
  {
    id: 1,
    name: "Admin",
    email: "info@skytravelfare.com",
    password: "$2a$10$BaiQ2Njj1a3jsNLN9YYruu0wPKMzEQdvh0vM1iLMMhnPHhqt1TAky", // Hash: 'admin123'
  },
];

// Function to update admin password (for password reset)
const updateAdminPassword = (email, newPasswordHash) => {
  const admin = adminUsers.find(u => u.email === email);
  if (admin) {
    admin.password = newPasswordHash;
    return true;
  }
  return false;
};

// SEO data storage (in production, use database)
let seoSettings = {
  pageTitle: 'Best Flight Deals, Hotels & Cruises | Sky Fare',
  metaDescription: 'Find the best flight deals, hotels, cruises, and vacation packages at unbeatable prices. Book your next adventure with skytravelfare.com - Your trusted travel partner.',
  keywords: 'flight deals, cheap flights, hotels, cruises, vacation packages, travel deals, airline tickets',
  ogImage: 'https://skytravelfare.com/og-image.jpg',
  canonicalUrl: 'https://skytravelfare.com'
};

// Website content storage
let websiteContent = {
  heroTitle: '',
  heroSubtitle: '',
  aboutText: '',
  contactEmail: 'info@skytravelfare.com',
  contactPhone: '+1-844-480-0252',
  contactAddress: '1309 Coffeen Ave STE 1200, Sheridan, WY 82801, USA'
};

// Blog posts storage
let blogPosts = [];

// Campaigns storage
let campaigns = [];
let campaignIdCounter = 1;

// Coupons storage
let coupons = [];
let couponIdCounter = 1;

// Reviews storage
let reviews = [];
let reviewIdCounter = 1;

// Notifications storage
let notifications = [];
let notificationIdCounter = 1;

// Transactions storage
let transactions = [];
let transactionIdCounter = 1;

// Roles storage
let roles = [
  { id: 1, name: 'Super Admin', description: 'Full system access', permissions: ['all'], userCount: 1 },
  { id: 2, name: 'Manager', description: 'Manage bookings and users', permissions: ['bookings', 'users', 'reports'], userCount: 3 },
  { id: 3, name: 'Support', description: 'Customer support access', permissions: ['chat', 'tickets', 'bookings'], userCount: 5 }
];

// Activity Logs storage
let activityLogs = [];
let logIdCounter = 1;

// Chat storage
let chatMessages = [];
let chatIdCounter = 1;

// GDS Settings storage
let gdsSettings = {
  amadeus: { clientId: '', clientSecret: '', enabled: false },
  sabre: { clientId: '', clientSecret: '', enabled: false },
  travelport: { username: '', password: '', targetBranch: '', enabled: false },
  galileo: { username: '', password: '', pcc: '', enabled: false },
  llc: { apiKey: '', apiSecret: '', enabled: false }
};

// Contact Settings storage
let contactSettings = {
  tfn: '+1-888-859-0441',
  email: 'info@skytravelfare.com',
  address: '1309 Coffeen Ave STE 1200, Sheridan, WY 82801, USA',
  workingHours: 'Mon-Sun 24/7'
};

// Google Search Console Settings storage
let gscSettings = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  siteUrl: process.env.GSC_SITE_URL || 'https://skytravelfare.com',
  enabled: false,
  connected: false
};

// Stats data (in production, fetch from database)
let stats = {
  totalBookings: 0,
  totalRevenue: 0,
  totalUsers: 0,
  pageViews: 0
};

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin login with comprehensive security
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);
    
    // Find admin user
    const admin = adminUsers.find(u => u.email === email);
    
    if (!admin) {
      // Failed login - record the attempt
      const failureResult = loginSecurity.recordFailedAttempt(email, ip, userAgent, 'Invalid email');
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        requireCaptcha: failureResult.requireCaptcha,
        captchaConfig: failureResult.requireCaptcha ? captchaService.getConfig() : null
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      // Failed login - record the attempt
      const failureResult = loginSecurity.recordFailedAttempt(email, ip, userAgent, 'Invalid password');
      
      // Send alerts if suspicious
      if (req.security.suspiciousScore >= 5) {
        await emailNotifications.sendSuspiciousLoginAlert({
          email,
          ip,
          userAgent,
          suspiciousScore: req.security.suspiciousScore,
          reason: 'High suspicious score on failed login'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        requireCaptcha: failureResult.requireCaptcha,
        captchaConfig: failureResult.requireCaptcha ? captchaService.getConfig() : null,
        security: {
          attempts: failureResult.attempts,
          suspiciousScore: req.security.suspiciousScore,
          warning: req.security.warning
        }
      });
    }

    // Successful login
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Record successful login
    loginSecurity.recordSuccessfulLogin(email, ip, userAgent);
    
    // Log successful login
    console.log(`✅ Successful admin login: ${email} from ${ip}`);

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      },
      security: {
        suspiciousScore: req.security.suspiciousScore,
        warning: req.security.warning
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get dashboard stats
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    res.json({
      ...stats,
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.json(stats);
  }
});

// Update stats (for testing)
router.post('/stats', verifyAdminToken, (req, res) => {
  stats = { ...stats, ...req.body };
  res.json({ success: true, stats });
});

// Get SEO settings
router.get('/seo', verifyAdminToken, (req, res) => {
  res.json(seoSettings);
});

// Update SEO settings
router.put('/seo', verifyAdminToken, (req, res) => {
  seoSettings = { ...seoSettings, ...req.body };
  res.json({ success: true, seoSettings });
});

// Get all bookings
router.get('/bookings', verifyAdminToken, async (req, res) => {
  try {
    const allBookings = await Booking.find()
      .populate('user', 'firstName lastName email phone')
      .populate('flight')
      .populate('hotel')
      .populate('package')
      .sort({ createdAt: -1 })
      .lean();
    
    // Group by booking type
    const bookings = {
      flights: allBookings.filter(b => b.bookingType === 'flight').map(b => {
        // Get route from embedded flightDetails or populated flight
        let route = 'N/A';
        let date = b.createdAt;
        let airline = 'N/A';
        let flightNumber = 'N/A';
        if (b.flightDetails) {
          const fd = b.flightDetails;
          route = `${fd.departure?.airport || fd.origin || 'N/A'} → ${fd.arrival?.airport || fd.destination || 'N/A'}`;
          date = fd.departure?.date || fd.departureDate || b.createdAt;
          airline = fd.airline || 'N/A';
          flightNumber = fd.flightNumber || 'N/A';
        } else if (b.flight) {
          route = `${b.flight.origin || 'N/A'} → ${b.flight.destination || 'N/A'}`;
          date = b.flight.departureDate || b.createdAt;
          airline = b.flight.airline || 'N/A';
          flightNumber = b.flight.flightNumber || 'N/A';
        }
        return {
          id: b._id,
          reference: b.bookingReference,
          customer: b.user ? `${b.user.firstName} ${b.user.lastName}` : (b.passengerDetails?.[0] ? `${b.passengerDetails[0].firstName} ${b.passengerDetails[0].lastName}` : 'Guest'),
          email: b.user?.email || b.contactInfo?.email || '',
          phone: b.user?.phone || b.contactInfo?.phone || '',
          route,
          date,
          airline,
          flightNumber,
          passengerCount: (b.passengers?.adults || 1) + (b.passengers?.children || 0) + (b.passengers?.infants || 0),
          passengers: b.passengers,
          passengerDetails: b.passengerDetails || [],
          selectedSeats: b.selectedSeats || [],
          amount: b.totalPrice,
          status: b.bookingStatus,
          paymentStatus: b.paymentStatus,
          createdAt: b.createdAt,
          flightDetails: b.flightDetails,
          returnFlightDetails: b.returnFlightDetails
        };
      }),
      hotels: allBookings.filter(b => b.bookingType === 'hotel').map(b => ({
        id: b._id,
        reference: b.bookingReference,
        customer: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Guest',
        email: b.user?.email || b.contactInfo?.email || '',
        hotel: b.hotel?.name || 'N/A',
        checkIn: b.hotelDetails?.checkIn,
        checkOut: b.hotelDetails?.checkOut,
        rooms: b.hotelDetails?.numberOfRooms || 1,
        amount: b.totalPrice,
        status: b.bookingStatus,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt
      })),
      vacations: allBookings.filter(b => b.bookingType === 'package').map(b => ({
        id: b._id,
        reference: b.bookingReference,
        customer: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Guest',
        email: b.user?.email || b.contactInfo?.email || '',
        package: b.package?.name || 'N/A',
        startDate: b.packageDetails?.startDate,
        endDate: b.packageDetails?.endDate,
        travelers: (b.passengers?.adults || 1) + (b.passengers?.children || 0),
        amount: b.totalPrice,
        status: b.bookingStatus,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt
      }))
    };
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.json({ success: true, bookings: { flights: [], hotels: [], vacations: [] } });
  }
});

// Get all users
router.get('/users', verifyAdminToken, (req, res) => {
  // In production, fetch from database
  const users = [];
  
  res.json({ success: true, users });
});

// SEO Analytics - Google Search Console integration
router.get('/seo/analytics', verifyAdminToken, async (req, res) => {
  // Placeholder for Google Search Console API integration
  const analyticsData = {
    impressions: 0,
    clicks: 0,
    ctr: 0,
    avgPosition: 0,
    topQueries: []
  };
  
  res.json({ success: true, data: analyticsData });
});

// SEO Site Audit
router.get('/seo/audit', verifyAdminToken, async (req, res) => {
  try {
    const siteUrl = process.env.GSC_SITE_URL || 'https://skytravelfare.com';
    
    const auditResults = {
      score: 85,
      timestamp: new Date(),
      url: siteUrl,
      issues: [],
      recommendations: [],
      metrics: {
        performance: 0,
        seo: 0,
        accessibility: 0,
        bestPractices: 0
      },
      details: {
        meta: {
          title: null,
          description: null,
          status: 'checking'
        },
        ssl: {
          enabled: siteUrl.startsWith('https'),
          status: siteUrl.startsWith('https') ? 'pass' : 'fail'
        },
        mobile: {
          friendly: true,
          status: 'pass'
        },
        speed: {
          loadTime: 0,
          status: 'checking'
        }
      }
    };

    // Check SSL
    if (!siteUrl.startsWith('https')) {
      auditResults.issues.push({
        severity: 'high',
        category: 'Security',
        message: 'Site is not using HTTPS',
        impact: 'Security and SEO ranking impact'
      });
      auditResults.recommendations.push('Enable HTTPS with SSL certificate');
      auditResults.score -= 20;
    } else {
      auditResults.metrics.bestPractices += 25;
    }

    // Try to fetch the homepage
    try {
      const startTime = Date.now();
      const response = await axios.get(siteUrl, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)'
        }
      });
      const loadTime = Date.now() - startTime;
      
      auditResults.details.speed.loadTime = loadTime;
      auditResults.details.speed.status = loadTime < 3000 ? 'pass' : 'warning';

      // Check page speed
      if (loadTime > 3000) {
        auditResults.issues.push({
          severity: 'medium',
          category: 'Performance',
          message: `Slow page load time: ${loadTime}ms`,
          impact: 'User experience and SEO impact'
        });
        auditResults.recommendations.push('Optimize images and reduce page load time');
        auditResults.score -= 10;
        auditResults.metrics.performance = Math.max(0, 100 - (loadTime / 100));
      } else {
        auditResults.metrics.performance = 100;
      }

      // Parse HTML to check meta tags
      const html = response.data;
      
      // Check title tag
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        auditResults.details.meta.title = titleMatch[1];
        auditResults.details.meta.status = 'pass';
        auditResults.metrics.seo += 25;
        
        if (titleMatch[1].length < 30 || titleMatch[1].length > 60) {
          auditResults.issues.push({
            severity: 'low',
            category: 'SEO',
            message: `Title tag length (${titleMatch[1].length}) not optimal (30-60 chars)`,
            impact: 'SEO optimization opportunity'
          });
          auditResults.recommendations.push('Optimize title tag length to 30-60 characters');
          auditResults.score -= 5;
        }
      } else {
        auditResults.issues.push({
          severity: 'high',
          category: 'SEO',
          message: 'Missing title tag',
          impact: 'Critical SEO issue'
        });
        auditResults.recommendations.push('Add a descriptive title tag');
        auditResults.score -= 15;
        auditResults.details.meta.status = 'fail';
      }

      // Check meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatch) {
        auditResults.details.meta.description = descMatch[1];
        auditResults.metrics.seo += 25;
        
        if (descMatch[1].length < 120 || descMatch[1].length > 160) {
          auditResults.issues.push({
            severity: 'low',
            category: 'SEO',
            message: `Meta description length (${descMatch[1].length}) not optimal (120-160 chars)`,
            impact: 'SEO optimization opportunity'
          });
          auditResults.recommendations.push('Optimize meta description to 120-160 characters');
          auditResults.score -= 5;
        }
      } else {
        auditResults.issues.push({
          severity: 'medium',
          category: 'SEO',
          message: 'Missing meta description',
          impact: 'SEO opportunity missed'
        });
        auditResults.recommendations.push('Add a compelling meta description');
        auditResults.score -= 10;
      }

      // Check for h1 tags
      const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
      if (h1Count === 0) {
        auditResults.issues.push({
          severity: 'medium',
          category: 'SEO',
          message: 'No H1 heading found',
          impact: 'SEO structure issue'
        });
        auditResults.recommendations.push('Add a single H1 heading per page');
        auditResults.score -= 10;
      } else if (h1Count > 1) {
        auditResults.issues.push({
          severity: 'low',
          category: 'SEO',
          message: `Multiple H1 headings found (${h1Count})`,
          impact: 'SEO best practice violation'
        });
        auditResults.recommendations.push('Use only one H1 heading per page');
        auditResults.score -= 5;
      } else {
        auditResults.metrics.seo += 25;
      }

      // Check for images without alt text
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      let imagesWithoutAlt = 0;
      imgTags.forEach(img => {
        if (!img.match(/alt=["'][^"']*["']/i)) {
          imagesWithoutAlt++;
        }
      });
      
      if (imagesWithoutAlt > 0) {
        auditResults.issues.push({
          severity: 'medium',
          category: 'Accessibility',
          message: `${imagesWithoutAlt} images without alt text`,
          impact: 'Accessibility and SEO impact'
        });
        auditResults.recommendations.push('Add descriptive alt text to all images');
        auditResults.score -= Math.min(10, imagesWithoutAlt * 2);
        auditResults.metrics.accessibility = Math.max(0, 100 - (imagesWithoutAlt * 10));
      } else {
        auditResults.metrics.accessibility = 100;
      }

      // Check for viewport meta tag
      if (!html.match(/<meta[^>]*name=["']viewport["']/i)) {
        auditResults.issues.push({
          severity: 'high',
          category: 'Mobile',
          message: 'Missing viewport meta tag',
          impact: 'Mobile usability issue'
        });
        auditResults.recommendations.push('Add viewport meta tag for mobile optimization');
        auditResults.score -= 15;
        auditResults.details.mobile.status = 'fail';
      }

      // Check for robots meta tag or robots.txt
      const hasRobotsMeta = html.match(/<meta[^>]*name=["']robots["']/i);
      if (hasRobotsMeta && hasRobotsMeta[0].includes('noindex')) {
        auditResults.issues.push({
          severity: 'critical',
          category: 'SEO',
          message: 'Site is set to noindex - not visible to search engines',
          impact: 'Critical SEO blocker'
        });
        auditResults.recommendations.push('Remove noindex directive to allow search engine indexing');
        auditResults.score -= 30;
      }

      // Final score calculation
      if (auditResults.metrics.seo < 75) auditResults.metrics.seo = 75;
      if (auditResults.metrics.bestPractices < 75) auditResults.metrics.bestPractices = 75;
      
      auditResults.score = Math.max(0, Math.min(100, auditResults.score));

    } catch (fetchError) {
      auditResults.issues.push({
        severity: 'critical',
        category: 'Availability',
        message: `Unable to fetch site: ${fetchError.message}`,
        impact: 'Site may be down or inaccessible'
      });
      auditResults.recommendations.push('Verify site is online and accessible');
      auditResults.score = 30;
      auditResults.metrics.performance = 0;
      auditResults.details.speed.status = 'fail';
      auditResults.details.meta.status = 'fail';
    }

    // Add general recommendations if score is good
    if (auditResults.score >= 80 && auditResults.recommendations.length === 0) {
      auditResults.recommendations.push('Site is well optimized! Continue monitoring performance');
      auditResults.recommendations.push('Consider adding structured data (Schema.org) for rich snippets');
      auditResults.recommendations.push('Submit sitemap to Google Search Console');
    }

    res.json({ success: true, audit: auditResults });
  } catch (error) {
    console.error('Site audit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run site audit',
      error: error.message 
    });
  }
});

// Keyword Research Tool
router.post('/seo/keywords', verifyAdminToken, (req, res) => {
  const { keyword } = req.body;
  
  const keywordData = {
    keyword: keyword,
    searchVolume: 0,
    difficulty: 0,
    cpc: 0,
    relatedKeywords: []
  };
  
  res.json({ success: true, data: keywordData });
});

// Backlink Monitor
router.get('/seo/backlinks', verifyAdminToken, (req, res) => {
  const backlinkData = {
    totalBacklinks: 0,
    referringDomains: 0,
    newBacklinks: 0,
    lostBacklinks: 0,
    topBacklinks: []
  };
  
  res.json({ success: true, data: backlinkData });
});

// Page Speed Test
router.post('/seo/speed-test', verifyAdminToken, (req, res) => {
  const { url } = req.body;
  
  const speedData = {
    url: url,
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    loadTime: 0,
    suggestions: [
      'Run PageSpeed Insights test',
      'Analyze performance metrics',
      'Check mobile optimization'
    ]
  };
  
  res.json({ success: true, data: speedData });
});

// Content Management Routes

// Get website content
router.get('/content', verifyAdminToken, (req, res) => {
  res.json(websiteContent);
});

// Update website content
router.put('/content', verifyAdminToken, (req, res) => {
  websiteContent = { ...websiteContent, ...req.body };
  res.json({ success: true, content: websiteContent });
});

// Blog Management Routes

// Get all blog posts
router.get('/blog', verifyAdminToken, (req, res) => {
  res.json({ success: true, posts: blogPosts });
});

// Get single blog post
router.get('/blog/:id', verifyAdminToken, (req, res) => {
  const post = blogPosts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json({ success: true, post });
});

// Create blog post
router.post('/blog', verifyAdminToken, (req, res) => {
  const newPost = {
    id: blogPosts.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  blogPosts.push(newPost);
  res.json({ success: true, post: newPost });
});

// Update blog post
router.put('/blog/:id', verifyAdminToken, (req, res) => {
  const postIndex = blogPosts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  blogPosts[postIndex] = {
    ...blogPosts[postIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({ success: true, post: blogPosts[postIndex] });
});

// Delete blog post
router.delete('/blog/:id', verifyAdminToken, (req, res) => {
  const postIndex = blogPosts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  blogPosts.splice(postIndex, 1);
  res.json({ success: true, message: 'Post deleted' });
});

// AI Blog Generation Routes

// Generate a single AI blog post
router.post('/blog/ai/generate', verifyAdminToken, async (req, res) => {
  try {
    const aiPost = await blogAI.generateBlogPost();
    
    // Generate live URL for the blog post
    const blogUrl = `https://skytravelfare.com/blog/${aiPost.slug}`;
    
    const newPost = {
      id: blogPosts.length + 1,
      ...aiPost,
      url: blogUrl,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    blogPosts.push(newPost);
    
    // Auto-publish to external platforms if requested
    let publishResults = null;
    if (req.body.autoPublish) {
      publishResults = await blogPublisher.publishToAll(newPost);
    }
    
    res.json({ 
      success: true, 
      post: newPost,
      url: blogUrl,
      publishResults,
      message: `Blog post created successfully! Live at: ${blogUrl}`
    });
  } catch (error) {
    console.error('AI Blog Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate blog post' });
  }
});

// Generate multiple AI blog posts
router.post('/blog/ai/generate-bulk', verifyAdminToken, async (req, res) => {
  try {
    const count = parseInt(req.body.count) || 5;
    const generatedPosts = [];

    for (let i = 0; i < count; i++) {
      const aiPost = await blogAI.generateBlogPost();
      
      // Generate live URL for the blog post
      const blogUrl = `https://skytravelfare.com/blog/${aiPost.slug}`;
      
      const newPost = {
        id: blogPosts.length + 1,
        ...aiPost,
        url: blogUrl,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      blogPosts.push(newPost);
      generatedPosts.push(newPost);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({ success: true, posts: generatedPosts, count: generatedPosts.length });
  } catch (error) {
    console.error('Bulk AI Blog Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate blog posts' });
  }
});

// Enable auto-posting (schedule AI blogs)
let autoPostingEnabled = false;
let autoPostingInterval = null;

router.post('/blog/ai/auto-enable', verifyAdminToken, (req, res) => {
  const { interval = 24 } = req.body; // Default: 24 hours
  
  if (autoPostingEnabled) {
    return res.json({ success: true, message: 'Auto-posting already enabled', enabled: true });
  }

  autoPostingEnabled = true;
  
  // Schedule automatic blog posting
  autoPostingInterval = setInterval(async () => {
    try {
      const aiPost = await blogAI.generateBlogPost();
      const newPost = {
        id: blogPosts.length + 1,
        ...aiPost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      blogPosts.push(newPost);
      console.log(`Auto-posted new blog: ${newPost.title}`);
    } catch (error) {
      console.error('Auto-posting error:', error);
    }
  }, interval * 60 * 60 * 1000); // Convert hours to milliseconds

  res.json({ success: true, message: `Auto-posting enabled (every ${interval} hours)`, enabled: true });
});

router.post('/blog/ai/auto-disable', verifyAdminToken, (req, res) => {
  if (!autoPostingEnabled) {
    return res.json({ success: true, message: 'Auto-posting already disabled', enabled: false });
  }

  autoPostingEnabled = false;
  if (autoPostingInterval) {
    clearInterval(autoPostingInterval);
    autoPostingInterval = null;
  }

  res.json({ success: true, message: 'Auto-posting disabled', enabled: false });
});

router.get('/blog/ai/status', verifyAdminToken, (req, res) => {
  res.json({ success: true, enabled: autoPostingEnabled });
});

// Get enabled publishing platforms
router.get('/blog/publishing/platforms', verifyAdminToken, (req, res) => {
  const platforms = blogPublisher.getEnabledPlatforms();
  res.json({ 
    success: true, 
    platforms,
    total: platforms.length,
    message: platforms.length > 0 
      ? `${platforms.length} platforms configured` 
      : 'No platforms configured. Add API keys to .env file.'
  });
});

// Publish existing blog to external platforms
router.post('/blog/:id/publish', verifyAdminToken, async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const blog = blogPosts.find(p => p.id === blogId);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const results = await blogPublisher.publishToAll(blog);
    
    res.json({
      success: true,
      results,
      message: results.success.length > 0 
        ? `Published to ${results.success.length} platforms` 
        : 'Check manual publishing guide'
    });
  } catch (error) {
    console.error('Publishing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get manual publishing guide for a blog
router.get('/blog/:id/publish-guide', verifyAdminToken, (req, res) => {
  const blogId = parseInt(req.params.id);
  const blog = blogPosts.find(p => p.id === blogId);
  
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog post not found' });
  }

  const guide = blogPublisher.generateManualPublishingGuide(blog);
  res.json({ success: true, guide });
});

// ========== CAMPAIGNS ROUTES ==========

// Get all campaigns
router.get('/campaigns', verifyAdminToken, (req, res) => {
  res.json({ success: true, campaigns });
});

// Get single campaign
router.get('/campaigns/:id', verifyAdminToken, (req, res) => {
  const campaign = campaigns.find(c => c.id === parseInt(req.params.id));
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  res.json({ success: true, campaign });
});

// Create new campaign
router.post('/campaigns', verifyAdminToken, (req, res) => {
  const newCampaign = {
    id: campaignIdCounter++,
    ...req.body,
    status: 'draft',
    sentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  campaigns.push(newCampaign);
  res.json({ success: true, campaign: newCampaign });
});

// Launch campaign
router.post('/campaigns/:id/launch', verifyAdminToken, (req, res) => {
  const campaignIndex = campaigns.findIndex(c => c.id === parseInt(req.params.id));
  if (campaignIndex === -1) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  campaigns[campaignIndex].status = 'active';
  campaigns[campaignIndex].launchedAt = new Date().toISOString();
  campaigns[campaignIndex].updatedAt = new Date().toISOString();
  
  // In production, this would trigger actual email/SMS/push sending
  // For now, simulate sending
  campaigns[campaignIndex].sentCount = Math.floor(Math.random() * 1000) + 100;
  
  res.json({ success: true, campaign: campaigns[campaignIndex] });
});

// Update campaign
router.put('/campaigns/:id', verifyAdminToken, (req, res) => {
  const campaignIndex = campaigns.findIndex(c => c.id === parseInt(req.params.id));
  if (campaignIndex === -1) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  campaigns[campaignIndex] = {
    ...campaigns[campaignIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({ success: true, campaign: campaigns[campaignIndex] });
});

// Delete campaign
router.delete('/campaigns/:id', verifyAdminToken, (req, res) => {
  const campaignIndex = campaigns.findIndex(c => c.id === parseInt(req.params.id));
  if (campaignIndex === -1) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  campaigns.splice(campaignIndex, 1);
  res.json({ success: true, message: 'Campaign deleted' });
});

// ========== COUPONS ROUTES ==========

// Get all coupons
router.get('/coupons', verifyAdminToken, (req, res) => {
  res.json({ success: true, coupons });
});

// Create coupon
router.post('/coupons', verifyAdminToken, (req, res) => {
  const newCoupon = {
    id: couponIdCounter++,
    ...req.body,
    usedCount: 0,
    createdAt: new Date().toISOString()
  };
  coupons.push(newCoupon);
  res.json({ success: true, coupon: newCoupon });
});

// Delete coupon
router.delete('/coupons/:id', verifyAdminToken, (req, res) => {
  const index = coupons.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Coupon not found' });
  coupons.splice(index, 1);
  res.json({ success: true, message: 'Coupon deleted' });
});

// ========== REVIEWS ROUTES ==========

// Get all reviews
router.get('/reviews', verifyAdminToken, (req, res) => {
  res.json({ success: true, reviews });
});

// Approve review
router.post('/reviews/:id/approve', verifyAdminToken, (req, res) => {
  const review = reviews.find(r => r.id === parseInt(req.params.id));
  if (!review) return res.status(404).json({ message: 'Review not found' });
  review.status = 'approved';
  res.json({ success: true, review });
});

// Reject review
router.post('/reviews/:id/reject', verifyAdminToken, (req, res) => {
  const review = reviews.find(r => r.id === parseInt(req.params.id));
  if (!review) return res.status(404).json({ message: 'Review not found' });
  review.status = 'rejected';
  res.json({ success: true, review });
});

// ========== NOTIFICATIONS ROUTES ==========

// Get all notifications
router.get('/notifications', verifyAdminToken, (req, res) => {
  res.json({ success: true, notifications });
});

// Mark notification as read
router.post('/notifications/:id/read', verifyAdminToken, (req, res) => {
  const notification = notifications.find(n => n.id === parseInt(req.params.id));
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  notification.read = true;
  res.json({ success: true, notification });
});

// ========== TRANSACTIONS ROUTES ==========

// Get all transactions
router.get('/transactions', verifyAdminToken, (req, res) => {
  res.json({ success: true, transactions });
});

// Process refund
router.post('/transactions/:id/refund', verifyAdminToken, (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  transaction.status = 'refunded';
  transaction.refundedAt = new Date().toISOString();
  res.json({ success: true, transaction });
});

// ========== ROLES ROUTES ==========

// Get all roles
router.get('/roles', verifyAdminToken, (req, res) => {
  res.json({ success: true, roles });
});

// ========== ACTIVITY LOGS ROUTES ==========

// Get activity logs
router.get('/activity-logs', verifyAdminToken, (req, res) => {
  res.json({ success: true, logs: activityLogs });
});

// ========== CHAT ROUTES ==========

// Get chat messages
router.get('/chat', verifyAdminToken, (req, res) => {
  res.json({ success: true, chats: chatMessages });
});

// Send chat message
router.post('/chat/:id/message', verifyAdminToken, (req, res) => {
  const chat = chatMessages.find(c => c.id === parseInt(req.params.id));
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  
  const newMessage = {
    sender: 'admin',
    text: req.body.message,
    time: new Date().toISOString()
  };
  
  if (!chat.messages) chat.messages = [];
  chat.messages.push(newMessage);
  chat.lastMessage = req.body.message;
  chat.unread = 0;
  
  res.json({ success: true, message: newMessage });
});

// ========== GDS SETTINGS ROUTES ==========

// Get GDS settings
router.get('/gds', verifyAdminToken, (req, res) => {
  // Return settings with masked secrets (show only last 4 characters)
  const maskedSettings = {
    amadeus: {
      ...gdsSettings.amadeus,
      clientSecret: gdsSettings.amadeus.clientSecret ? '****' + gdsSettings.amadeus.clientSecret.slice(-4) : ''
    },
    sabre: {
      ...gdsSettings.sabre,
      clientSecret: gdsSettings.sabre.clientSecret ? '****' + gdsSettings.sabre.clientSecret.slice(-4) : ''
    },
    travelport: {
      ...gdsSettings.travelport,
      password: gdsSettings.travelport.password ? '****' + gdsSettings.travelport.password.slice(-4) : ''
    },
    galileo: {
      ...gdsSettings.galileo,
      password: gdsSettings.galileo.password ? '****' + gdsSettings.galileo.password.slice(-4) : ''
    },
    llc: {
      ...gdsSettings.llc,
      apiSecret: gdsSettings.llc.apiSecret ? '****' + gdsSettings.llc.apiSecret.slice(-4) : ''
    }
  };
  res.json({ success: true, settings: maskedSettings });
});

// Update GDS settings
router.put('/gds', verifyAdminToken, (req, res) => {
  // Only update fields that are not masked
  Object.keys(req.body).forEach(provider => {
    if (gdsSettings[provider]) {
      Object.keys(req.body[provider]).forEach(key => {
        // Skip masked fields (those starting with ****)
        if (!String(req.body[provider][key]).startsWith('****')) {
          gdsSettings[provider][key] = req.body[provider][key];
        }
      });
    }
  });
  
  res.json({ success: true, message: 'GDS settings updated', settings: gdsSettings });
});

// Get visitor statistics
router.get('/visitors', verifyAdminToken, (req, res) => {
  const visitorStats = req.app.get('visitorStats');
  const io = req.app.get('io');
  
  // Get active visitors from the io instance
  const activeVisitors = [];
  if (io && io.sockets && io.sockets.sockets) {
    // This is a workaround - in production, maintain visitor list in shared state
  }
  
  res.json({
    success: true,
    stats: {
      current: visitorStats.current,
      total: visitorStats.total,
      peak: visitorStats.peak,
      history: visitorStats.history.slice(-20), // Last 20 entries
      locations: Array.from(visitorStats.locations.entries()).map(([key, count]) => {
        const [country, region] = key.split('-');
        return { country, region, count };
      })
    }
  });
});

// Test GDS connection
router.post('/gds/:provider/test', verifyAdminToken, (req, res) => {
  const provider = req.params.provider;
  
  if (!gdsSettings[provider]) {
    return res.status(404).json({ message: 'GDS provider not found' });
  }
  
  if (!gdsSettings[provider].enabled) {
    return res.status(400).json({ message: 'GDS provider is not enabled' });
  }
  
  // In production, this would make actual API calls to test connection
  // For now, just check if credentials are provided
  const providerSettings = gdsSettings[provider];
  let hasCredentials = false;
  
  switch(provider) {
    case 'amadeus':
    case 'sabre':
      hasCredentials = providerSettings.clientId && providerSettings.clientSecret;
      break;
    case 'travelport':
      hasCredentials = providerSettings.username && providerSettings.password && providerSettings.targetBranch;
      break;
    case 'galileo':
      hasCredentials = providerSettings.username && providerSettings.password && providerSettings.pcc;
      break;
    case 'llc':
      hasCredentials = providerSettings.apiKey && providerSettings.apiSecret;
      break;
  }
  
  if (!hasCredentials) {
    return res.status(400).json({ message: 'Missing required credentials' });
  }
  
  // Simulate successful connection
  res.json({ 
    success: true, 
    message: `${provider.toUpperCase()} connection successful`,
    provider: provider,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// SECURITY DASHBOARD ROUTES
// ============================================

// Get security statistics
router.get('/security/stats', verifyAdminToken, (req, res) => {
  try {
    const stats = loginSecurity.getSecurityStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get login history
router.get('/security/history', verifyAdminToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = loginSecurity.getLoginHistory(limit);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get suspicious attempts
router.get('/security/suspicious', verifyAdminToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const suspicious = loginSecurity.getSuspiciousAttempts(limit);
    res.json({ success: true, data: suspicious });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Block an IP manually
router.post('/security/block-ip', verifyAdminToken, (req, res) => {
  try {
    const { ip, duration } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, message: 'IP address required' });
    }
    
    const durationMs = duration ? parseInt(duration) * 60 * 1000 : loginSecurity.config.blockDurationMs;
    loginSecurity.blockIP(ip, durationMs);
    
    res.json({ 
      success: true, 
      message: `IP ${ip} blocked for ${Math.ceil(durationMs / 60000)} minutes` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unblock an IP
router.post('/security/unblock-ip', verifyAdminToken, (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, message: 'IP address required' });
    }
    
    loginSecurity.unblockIP(ip);
    res.json({ success: true, message: `IP ${ip} unblocked` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get CAPTCHA configuration
router.get('/security/captcha-config', (req, res) => {
  try {
    const config = captchaService.getConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate test CAPTCHA (for development)
router.get('/security/test-captcha', (req, res) => {
  try {
    const challenge = captchaService.generateTestChallenge();
    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test email notifications
router.post('/security/test-email', verifyAdminToken, async (req, res) => {
  try {
    const testResult = await emailNotifications.testConfiguration();
    if (testResult.success) {
      await emailNotifications.sendSecurityAlert(
        'Email Test',
        'This is a test email from the security system.',
        {
          'Test Time': new Date().toLocaleString(),
          'Configuration': 'Valid',
          'Status': 'Working'
        }
      );
    }
    res.json({ success: true, data: testResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear security logs (careful!)
router.post('/security/clear-logs', verifyAdminToken, (req, res) => {
  try {
    loginSecurity.reset();
    res.json({ success: true, message: 'Security logs cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GOOGLE SEARCH CONSOLE SETTINGS ==========

// Get GSC settings
router.get('/gsc-settings', verifyAdminToken, (req, res) => {
  // Don't send sensitive data to frontend
  res.json({
    success: true,
    settings: {
      siteUrl: gscSettings.siteUrl,
      enabled: gscSettings.enabled,
      connected: gscSettings.connected,
      hasClientId: !!gscSettings.clientId,
      hasClientSecret: !!gscSettings.clientSecret
    }
  });
});

// Update GSC settings
router.post('/gsc-settings', verifyAdminToken, (req, res) => {
  try {
    const { clientId, clientSecret, siteUrl } = req.body;

    if (clientId) gscSettings.clientId = clientId;
    if (clientSecret) gscSettings.clientSecret = clientSecret;
    if (siteUrl) gscSettings.siteUrl = siteUrl;
    
    // Enable if both credentials are provided
    if (gscSettings.clientId && gscSettings.clientSecret) {
      gscSettings.enabled = true;
      
      // Update environment for gsc-live.js to use
      process.env.GOOGLE_CLIENT_ID = gscSettings.clientId;
      process.env.GOOGLE_CLIENT_SECRET = gscSettings.clientSecret;
      process.env.GSC_SITE_URL = gscSettings.siteUrl;
    }

    res.json({
      success: true,
      message: 'Google Search Console settings updated',
      settings: {
        siteUrl: gscSettings.siteUrl,
        enabled: gscSettings.enabled,
        hasClientId: !!gscSettings.clientId,
        hasClientSecret: !!gscSettings.clientSecret
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get GSC settings for export
router.getGSCSettings = () => gscSettings;

// Get contact settings
router.get('/contact-settings', verifyAdminToken, (req, res) => {
  try {
    res.json({
      success: true,
      settings: contactConfig.getContactSettings()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update contact settings
router.post('/contact-settings', verifyAdminToken, (req, res) => {
  try {
    const { tfn, email, address, workingHours } = req.body;

    const updated = contactConfig.updateContactSettings({ tfn, email, address, workingHours });

    // Update websiteContent for backward compatibility
    websiteContent.contactEmail = updated.email;
    websiteContent.contactPhone = updated.tfn;
    websiteContent.contactAddress = updated.address;

    res.json({
      success: true,
      message: 'Contact settings updated successfully',
      settings: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get contact settings for public use (no auth required)
router.get('/public/contact-settings', (req, res) => {
  try {
    res.json({
      success: true,
      settings: contactConfig.getContactSettings()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// SITE SETTINGS ROUTES
// =============================================

// Get all site settings (admin)
router.get('/site-settings', verifyAdminToken, (req, res) => {
  try {
    res.json({ success: true, settings: siteConfig.getSiteSettings() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update site settings (admin)
router.post('/site-settings', verifyAdminToken, (req, res) => {
  try {
    const updated = siteConfig.updateSiteSettings(req.body);

    // Sync backward-compatible contactConfig
    contactConfig.updateContactSettings({
      tfn: updated.tfn,
      email: updated.email,
      address: `${updated.billingAddress.street}, ${updated.billingAddress.city}, ${updated.billingAddress.state} ${updated.billingAddress.zip}, ${updated.billingAddress.country}`,
      workingHours: updated.workingHours
    });

    // Also sync websiteContent
    websiteContent.contactEmail = updated.email;
    websiteContent.contactPhone = updated.tfn;
    websiteContent.contactAddress = `${updated.billingAddress.street}, ${updated.billingAddress.city}, ${updated.billingAddress.state} ${updated.billingAddress.zip}, ${updated.billingAddress.country}`;

    res.json({ success: true, message: 'Site settings updated successfully', settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload logo (admin)
router.post('/site-settings/logo', verifyAdminToken, (req, res) => {
  logoUpload.single('logo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const logoUrl = `/${req.file.filename}`;
    siteConfig.updateSiteSettings({ logoUrl });

    res.json({ success: true, message: 'Logo uploaded successfully', logoUrl });
  });
});

// Get site settings for public use (no auth required)
router.get('/public/site-settings', (req, res) => {
  try {
    res.json({ success: true, settings: siteConfig.getPublicSettings() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get admin by email (for login sync with password reset)
const getAdminByEmail = (email) => {
  return adminUsers.find(u => u.email === email);
};

// Export router and blogPosts for public blog routes
router.getBlogPosts = () => blogPosts;
router.updateAdminPassword = updateAdminPassword;
router.getAdminByEmail = getAdminByEmail;
module.exports = router;
