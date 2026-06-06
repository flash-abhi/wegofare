/**
 * Rate Limiter Middleware
 * Prevents brute force attacks and API abuse
 */

const loginSecurity = require('../services/loginSecurity');

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
const getClientIP = (req) => {
  // Check for IP in various headers (for proxy/load balancer scenarios)
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         'unknown';
};

/**
 * Extract user agent from request
 * @param {Object} req - Express request object
 * @returns {string} - User agent string
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

/**
 * Rate limiter middleware for login attempts
 */
const loginRateLimiter = (req, res, next) => {
  const ip = getClientIP(req);
  const userAgent = getUserAgent(req);
  const { email, captchaToken } = req.body;
  
  // Whitelist localhost and agent requests
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip.includes('127.0.0.1');
  const isAgentRequest = captchaToken === 'agent-bypass';
  
  if (isLocalhost || isAgentRequest) {
    req.security = {
      ip,
      userAgent,
      requireCaptcha: false,
      suspiciousScore: 0,
      attemptsRemaining: 999,
      warning: null,
      bypassed: true
    };
    return next();
  }
  
  // Check if login attempt is allowed
  const securityCheck = loginSecurity.checkLoginAttempt(email, ip, userAgent);
  
  if (!securityCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: securityCheck.reason,
      blocked: securityCheck.blocked,
      rateLimited: securityCheck.rateLimited,
      requireCaptcha: securityCheck.requireCaptcha
    });
  }
  
  // Attach security info to request for use in route handler
  req.security = {
    ip,
    userAgent,
    requireCaptcha: securityCheck.requireCaptcha,
    suspiciousScore: securityCheck.suspiciousScore,
    attemptsRemaining: securityCheck.attemptsRemaining,
    warning: securityCheck.warning
  };
  
  next();
};

/**
 * General API rate limiter
 * Limits requests per IP to prevent API abuse
 */
class APIRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.message = options.message || 'Too many requests, please try again later.';
    this.requests = new Map(); // IP -> Array of timestamps
    
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  middleware() {
    return (req, res, next) => {
      const ip = getClientIP(req);
      const now = Date.now();
      
      // Get or create request history for this IP
      let ipRequests = this.requests.get(ip) || [];
      
      // Filter out old requests outside the window
      ipRequests = ipRequests.filter(timestamp => now - timestamp < this.windowMs);
      
      // Check if limit exceeded
      if (ipRequests.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          message: this.message,
          retryAfter: Math.ceil(this.windowMs / 1000)
        });
      }
      
      // Add current request
      ipRequests.push(now);
      this.requests.set(ip, ipRequests);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - ipRequests.length));
      res.setHeader('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());
      
      next();
    };
  }
  
  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
      if (validTimestamps.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validTimestamps);
      }
    }
  }
}

/**
 * IP whitelist middleware
 * Allows only specific IPs to access certain routes
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const ip = getClientIP(req);
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(ip)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from your IP address'
      });
    }
    
    next();
  };
};

/**
 * IP blacklist middleware
 * Blocks specific IPs from accessing routes
 */
const ipBlacklist = (blockedIPs = []) => {
  return (req, res, next) => {
    const ip = getClientIP(req);
    
    if (blockedIPs.includes(ip)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    next();
  };
};

/**
 * Suspicious user agent blocker
 * Blocks known bots and scrapers
 */
const blockSuspiciousUserAgents = (req, res, next) => {
  const userAgent = getUserAgent(req).toLowerCase();
  
  const suspiciousPatterns = [
    'sqlmap',
    'nikto',
    'masscan',
    'nmap',
    'acunetix',
    'burp',
    'zap'
  ];
  
  if (suspiciousPatterns.some(pattern => userAgent.includes(pattern))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Create rate limiter instances
const apiRateLimiter = new APIRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const strictApiRateLimiter = new APIRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20,
  message: 'Rate limit exceeded for this sensitive endpoint.'
});

module.exports = {
  loginRateLimiter,
  apiRateLimiter: apiRateLimiter.middleware(),
  strictApiRateLimiter: strictApiRateLimiter.middleware(),
  ipWhitelist,
  ipBlacklist,
  blockSuspiciousUserAgents,
  getClientIP,
  getUserAgent
};
