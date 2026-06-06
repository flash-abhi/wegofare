/**
 * Login Security Service - Phishing Detection and Brute Force Protection
 * Provides comprehensive security features for user authentication
 */

class LoginSecurityService {
  constructor() {
    // Track login attempts by IP
    this.loginAttempts = new Map(); // IP -> { count, firstAttempt, blockedUntil, failedEmails }
    
    // Track successful logins
    this.loginHistory = []; // Array of { email, ip, timestamp, userAgent, location, suspicious }
    
    // Track blocked IPs
    this.blockedIPs = new Set();
    
    // Suspicious patterns
    this.suspiciousPatterns = {
      userAgents: [
        'curl', 'wget', 'python-requests', 'postman', 'insomnia',
        'bot', 'crawler', 'spider', 'scraper'
      ],
      emailPatterns: [
        /admin@admin/i,
        /test@test/i,
        /user@user/i,
        /@example\.com$/i,
        /@test\.com$/i
      ],
      // Common phishing attempt emails
      commonPhishingEmails: [
        'admin@admin.com',
        'admin@localhost',
        'test@test.com',
        'user@user.com'
      ]
    };
    
    // Configuration
    this.config = {
      maxAttemptsBeforeBlock: 5, // Block after 5 failed attempts
      blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
      attemptWindowMs: 10 * 60 * 1000, // 10-minute window for counting attempts
      maxAttemptsPerMinute: 3, // Maximum 3 attempts per minute
      requireCaptchaAfter: 3, // Show CAPTCHA after 3 failed attempts
      maxDifferentEmailsPerIP: 5, // Max different emails from same IP
      suspiciousThreshold: 3, // Suspicious score threshold
      cleanupIntervalMs: 60 * 60 * 1000, // Cleanup old data every hour
      maxHistoryEntries: 1000 // Keep last 1000 login attempts
    };
    
    // Start cleanup interval
    this.startCleanup();
  }
  
  /**
   * Check if login attempt is allowed and safe
   * @param {string} email - Email being used for login
   * @param {string} ip - IP address of the request
   * @param {string} userAgent - User agent string
   * @returns {Object} - { allowed: boolean, reason: string, requireCaptcha: boolean, suspiciousScore: number }
   */
  checkLoginAttempt(email, ip, userAgent = '') {
    const now = Date.now();
    
    // Check if IP is blocked
    if (this.isIPBlocked(ip)) {
      const attempt = this.loginAttempts.get(ip);
      const remainingTime = Math.ceil((attempt.blockedUntil - now) / 1000 / 60);
      return {
        allowed: false,
        reason: `Too many failed login attempts. Try again in ${remainingTime} minutes.`,
        requireCaptcha: false,
        suspiciousScore: 10,
        blocked: true
      };
    }
    
    // Get or create attempt record
    let attempt = this.loginAttempts.get(ip) || {
      count: 0,
      firstAttempt: now,
      blockedUntil: null,
      failedEmails: new Set(),
      recentAttempts: []
    };
    
    // Clean old attempts outside the window
    attempt.recentAttempts = attempt.recentAttempts.filter(
      t => now - t < this.config.attemptWindowMs
    );
    
    // Check rate limiting (attempts per minute)
    const lastMinuteAttempts = attempt.recentAttempts.filter(
      t => now - t < 60000
    ).length;
    
    if (lastMinuteAttempts >= this.config.maxAttemptsPerMinute) {
      return {
        allowed: false,
        reason: 'Too many login attempts. Please slow down.',
        requireCaptcha: true,
        suspiciousScore: 5,
        rateLimited: true
      };
    }
    
    // Calculate suspicious score
    const suspiciousScore = this.calculateSuspiciousScore(email, ip, userAgent, attempt);
    
    // Check if CAPTCHA is required
    const requireCaptcha = attempt.count >= this.config.requireCaptchaAfter || 
                          suspiciousScore >= this.config.suspiciousThreshold;
    
    // Allow the attempt but flag requirements
    return {
      allowed: true,
      reason: '',
      requireCaptcha,
      suspiciousScore,
      attemptsRemaining: this.config.maxAttemptsBeforeBlock - attempt.count,
      warning: attempt.count >= 3 ? 'Multiple failed attempts detected' : null
    };
  }
  
  /**
   * Calculate suspicious score for login attempt
   * @param {string} email 
   * @param {string} ip 
   * @param {string} userAgent 
   * @param {Object} attempt 
   * @returns {number} - Suspicious score (0-10)
   */
  calculateSuspiciousScore(email, ip, userAgent, attempt) {
    let score = 0;
    
    // Check for suspicious user agent
    const lowerUserAgent = userAgent.toLowerCase();
    if (this.suspiciousPatterns.userAgents.some(pattern => lowerUserAgent.includes(pattern))) {
      score += 3;
    }
    
    // Check for suspicious email patterns
    if (this.suspiciousPatterns.emailPatterns.some(pattern => pattern.test(email))) {
      score += 2;
    }
    
    // Check for common phishing emails
    if (this.suspiciousPatterns.commonPhishingEmails.includes(email.toLowerCase())) {
      score += 3;
    }
    
    // Check for too many different emails from same IP
    if (attempt.failedEmails.size >= this.config.maxDifferentEmailsPerIP) {
      score += 4;
    }
    
    // Check for rapid attempts
    if (attempt.recentAttempts.length >= this.config.maxAttemptsPerMinute) {
      score += 2;
    }
    
    // Check for unusual email format
    if (!this.isValidEmailFormat(email)) {
      score += 1;
    }
    
    return Math.min(score, 10);
  }
  
  /**
   * Record failed login attempt
   * @param {string} email 
   * @param {string} ip 
   * @param {string} userAgent 
   * @param {string} reason 
   */
  recordFailedAttempt(email, ip, userAgent = '', reason = 'Invalid credentials') {
    const now = Date.now();
    
    // Get or create attempt record
    let attempt = this.loginAttempts.get(ip) || {
      count: 0,
      firstAttempt: now,
      blockedUntil: null,
      failedEmails: new Set(),
      recentAttempts: []
    };
    
    // Update attempt record
    attempt.count++;
    attempt.failedEmails.add(email);
    attempt.recentAttempts.push(now);
    attempt.lastAttempt = now;
    
    // Check if should block
    if (attempt.count >= this.config.maxAttemptsBeforeBlock) {
      attempt.blockedUntil = now + this.config.blockDurationMs;
      this.blockedIPs.add(ip);
    }
    
    this.loginAttempts.set(ip, attempt);
    
    // Record in history
    const suspiciousScore = this.calculateSuspiciousScore(email, ip, userAgent, attempt);
    this.addToHistory({
      email,
      ip,
      timestamp: now,
      userAgent,
      success: false,
      reason,
      suspicious: suspiciousScore >= this.config.suspiciousThreshold,
      suspiciousScore
    });
    
    return {
      attemptsRemaining: Math.max(0, this.config.maxAttemptsBeforeBlock - attempt.count),
      blocked: attempt.count >= this.config.maxAttemptsBeforeBlock,
      requireCaptcha: attempt.count >= this.config.requireCaptchaAfter
    };
  }
  
  /**
   * Record successful login
   * @param {string} email 
   * @param {string} ip 
   * @param {string} userAgent 
   */
  recordSuccessfulLogin(email, ip, userAgent = '') {
    const now = Date.now();
    
    // Clear failed attempts for this IP
    this.loginAttempts.delete(ip);
    this.blockedIPs.delete(ip);
    
    // Record in history
    this.addToHistory({
      email,
      ip,
      timestamp: now,
      userAgent,
      success: true,
      suspicious: false,
      suspiciousScore: 0
    });
  }
  
  /**
   * Check if IP is currently blocked
   * @param {string} ip 
   * @returns {boolean}
   */
  isIPBlocked(ip) {
    const attempt = this.loginAttempts.get(ip);
    if (!attempt || !attempt.blockedUntil) return false;
    
    const now = Date.now();
    if (now >= attempt.blockedUntil) {
      // Block expired, clear it
      attempt.blockedUntil = null;
      attempt.count = 0;
      attempt.failedEmails.clear();
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }
  
  /**
   * Manually block an IP address
   * @param {string} ip 
   * @param {number} durationMs 
   */
  blockIP(ip, durationMs = this.config.blockDurationMs) {
    const now = Date.now();
    let attempt = this.loginAttempts.get(ip) || {
      count: this.config.maxAttemptsBeforeBlock,
      firstAttempt: now,
      blockedUntil: null,
      failedEmails: new Set(),
      recentAttempts: []
    };
    
    attempt.blockedUntil = now + durationMs;
    this.loginAttempts.set(ip, attempt);
    this.blockedIPs.add(ip);
  }
  
  /**
   * Unblock an IP address
   * @param {string} ip 
   */
  unblockIP(ip) {
    const attempt = this.loginAttempts.get(ip);
    if (attempt) {
      attempt.blockedUntil = null;
      attempt.count = 0;
      attempt.failedEmails.clear();
    }
    this.blockedIPs.delete(ip);
  }
  
  /**
   * Get security statistics
   * @returns {Object}
   */
  getSecurityStats() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last1h = now - 60 * 60 * 1000;
    
    const recentHistory = this.loginHistory.filter(h => h.timestamp >= last24h);
    const lastHourHistory = this.loginHistory.filter(h => h.timestamp >= last1h);
    
    return {
      totalAttempts: this.loginHistory.length,
      last24Hours: {
        total: recentHistory.length,
        successful: recentHistory.filter(h => h.success).length,
        failed: recentHistory.filter(h => !h.success).length,
        suspicious: recentHistory.filter(h => h.suspicious).length
      },
      lastHour: {
        total: lastHourHistory.length,
        successful: lastHourHistory.filter(h => h.success).length,
        failed: lastHourHistory.filter(h => !h.success).length,
        suspicious: lastHourHistory.filter(h => h.suspicious).length
      },
      blockedIPs: {
        count: this.blockedIPs.size,
        list: Array.from(this.blockedIPs)
      },
      activeAttempts: {
        count: this.loginAttempts.size,
        details: Array.from(this.loginAttempts.entries()).map(([ip, attempt]) => ({
          ip,
          failedAttempts: attempt.count,
          differentEmails: attempt.failedEmails.size,
          blocked: this.isIPBlocked(ip),
          blockedUntil: attempt.blockedUntil ? new Date(attempt.blockedUntil) : null
        }))
      },
      topSuspiciousIPs: this.getTopSuspiciousIPs(10),
      recentSuspiciousAttempts: recentHistory
        .filter(h => h.suspicious)
        .slice(-20)
        .reverse()
    };
  }
  
  /**
   * Get login history
   * @param {number} limit 
   * @returns {Array}
   */
  getLoginHistory(limit = 50) {
    return this.loginHistory
      .slice(-limit)
      .reverse()
      .map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
        userAgentShort: this.truncateUserAgent(entry.userAgent)
      }));
  }
  
  /**
   * Get suspicious login attempts
   * @param {number} limit 
   * @returns {Array}
   */
  getSuspiciousAttempts(limit = 50) {
    return this.loginHistory
      .filter(h => h.suspicious)
      .slice(-limit)
      .reverse()
      .map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
        userAgentShort: this.truncateUserAgent(entry.userAgent)
      }));
  }
  
  /**
   * Get top suspicious IPs
   * @param {number} limit 
   * @returns {Array}
   */
  getTopSuspiciousIPs(limit = 10) {
    const ipStats = new Map();
    
    this.loginHistory.forEach(entry => {
      if (!ipStats.has(entry.ip)) {
        ipStats.set(entry.ip, {
          ip: entry.ip,
          totalAttempts: 0,
          failedAttempts: 0,
          suspiciousAttempts: 0,
          differentEmails: new Set(),
          lastAttempt: entry.timestamp
        });
      }
      
      const stat = ipStats.get(entry.ip);
      stat.totalAttempts++;
      if (!entry.success) stat.failedAttempts++;
      if (entry.suspicious) stat.suspiciousAttempts++;
      stat.differentEmails.add(entry.email);
      stat.lastAttempt = Math.max(stat.lastAttempt, entry.timestamp);
    });
    
    return Array.from(ipStats.values())
      .map(stat => ({
        ...stat,
        differentEmails: stat.differentEmails.size,
        suspiciousScore: (stat.suspiciousAttempts / stat.totalAttempts) * 10,
        lastAttempt: new Date(stat.lastAttempt)
      }))
      .sort((a, b) => b.suspiciousScore - a.suspiciousScore)
      .slice(0, limit);
  }
  
  /**
   * Add entry to login history
   * @param {Object} entry 
   */
  addToHistory(entry) {
    this.loginHistory.push(entry);
    
    // Limit history size
    if (this.loginHistory.length > this.config.maxHistoryEntries) {
      this.loginHistory = this.loginHistory.slice(-this.config.maxHistoryEntries);
    }
  }
  
  /**
   * Validate email format
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Truncate user agent for display
   * @param {string} userAgent 
   * @returns {string}
   */
  truncateUserAgent(userAgent) {
    if (!userAgent) return 'Unknown';
    return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
  }
  
  /**
   * Start cleanup interval to remove old data
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);
  }
  
  /**
   * Clean up old data
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.config.attemptWindowMs;
    
    // Clean up old login attempts
    for (const [ip, attempt] of this.loginAttempts.entries()) {
      if (attempt.lastAttempt && attempt.lastAttempt < cutoff && !attempt.blockedUntil) {
        this.loginAttempts.delete(ip);
      }
    }
    
    // Clean up expired blocks
    for (const ip of this.blockedIPs) {
      if (!this.isIPBlocked(ip)) {
        this.blockedIPs.delete(ip);
      }
    }
    
    console.log(`Security cleanup: ${this.loginAttempts.size} active attempts, ${this.blockedIPs.size} blocked IPs`);
  }
  
  /**
   * Reset all security data (for testing)
   */
  reset() {
    this.loginAttempts.clear();
    this.loginHistory = [];
    this.blockedIPs.clear();
    console.log('Security service reset');
  }
}

// Create singleton instance
const loginSecurity = new LoginSecurityService();

module.exports = loginSecurity;
