/**
 * CAPTCHA Service
 * Provides CAPTCHA verification to prevent automated attacks
 * Supports multiple CAPTCHA providers
 */

const axios = require('axios');

class CaptchaService {
  constructor() {
    this.provider = process.env.CAPTCHA_PROVIDER || 'hcaptcha'; // 'recaptcha', 'hcaptcha', or 'turnstile'
    this.secretKey = this.getSecretKey();
    this.enabled = process.env.CAPTCHA_ENABLED !== 'false';
    
    // In-memory CAPTCHA challenges for testing (when no API key is set)
    this.testChallenges = new Map(); // token -> { answer, expiresAt }
    this.testMode = !this.secretKey;
  }
  
  /**
   * Get secret key based on provider
   */
  getSecretKey() {
    switch (this.provider) {
      case 'recaptcha':
        return process.env.RECAPTCHA_SECRET_KEY;
      case 'hcaptcha':
        return process.env.HCAPTCHA_SECRET_KEY;
      case 'turnstile':
        return process.env.TURNSTILE_SECRET_KEY;
      default:
        return null;
    }
  }
  
  /**
   * Verify CAPTCHA token
   * @param {string} token - CAPTCHA token from client
   * @param {string} ip - Client IP address
   * @returns {Promise<Object>} - { success: boolean, error?: string }
   */
  async verify(token, ip = null) {
    if (!this.enabled) {
      return { success: true, message: 'CAPTCHA disabled' };
    }
    
    if (this.testMode) {
      return this.verifyTestCaptcha(token);
    }
    
    try {
      switch (this.provider) {
        case 'recaptcha':
          return await this.verifyRecaptcha(token, ip);
        case 'hcaptcha':
          return await this.verifyHCaptcha(token, ip);
        case 'turnstile':
          return await this.verifyTurnstile(token, ip);
        default:
          return { success: false, error: 'Invalid CAPTCHA provider' };
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      return { success: false, error: 'CAPTCHA verification failed' };
    }
  }
  
  /**
   * Verify Google reCAPTCHA
   * @param {string} token 
   * @param {string} ip 
   * @returns {Promise<Object>}
   */
  async verifyRecaptcha(token, ip) {
    try {
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: this.secretKey,
          response: token,
          remoteip: ip
        }
      });
      
      const data = response.data;
      
      console.log('reCAPTCHA v3 verification response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        // For v3, check the score (0.0 to 1.0, higher is better)
        const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
        
        if (data.score && data.score < minScore) {
          console.log(`reCAPTCHA score ${data.score} below threshold ${minScore}`);
          return {
            success: false,
            error: `CAPTCHA score too low (${data.score})`,
            score: data.score
          };
        }
        
        return {
          success: true,
          score: data.score, // reCAPTCHA v3 returns a score
          action: data.action,
          hostname: data.hostname
        };
      } else {
        console.error('reCAPTCHA verification failed:', data['error-codes']);
        return {
          success: false,
          error: data['error-codes']?.join(', ') || 'CAPTCHA verification failed',
          errorCodes: data['error-codes']
        };
      }
    } catch (error) {
      console.error('reCAPTCHA API error:', error.message);
      return {
        success: false,
        error: 'Failed to verify CAPTCHA: ' + error.message
      };
    }
  }
  
  /**
   * Verify hCaptcha
   * @param {string} token 
   * @param {string} ip 
   * @returns {Promise<Object>}
   */
  async verifyHCaptcha(token, ip) {
    const params = new URLSearchParams();
    params.append('secret', this.secretKey);
    params.append('response', token);
    if (ip) params.append('remoteip', ip);
    
    const response = await axios.post('https://hcaptcha.com/siteverify', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const data = response.data;
    
    if (data.success) {
      return {
        success: true,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname
      };
    } else {
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'CAPTCHA verification failed',
        errorCodes: data['error-codes']
      };
    }
  }
  
  /**
   * Verify Cloudflare Turnstile
   * @param {string} token 
   * @param {string} ip 
   * @returns {Promise<Object>}
   */
  async verifyTurnstile(token, ip) {
    const params = new URLSearchParams();
    params.append('secret', this.secretKey);
    params.append('response', token);
    if (ip) params.append('remoteip', ip);
    
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const data = response.data;
    
    if (data.success) {
      return {
        success: true,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname
      };
    } else {
      return {
        success: false,
        error: data['error-codes']?.join(', ') || 'CAPTCHA verification failed',
        errorCodes: data['error-codes']
      };
    }
  }
  
  /**
   * Generate test CAPTCHA challenge (for development)
   * @returns {Object} - { token: string, challenge: string }
   */
  generateTestChallenge() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    
    const token = this.generateToken();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    this.testChallenges.set(token, { answer, expiresAt });
    
    // Clean up old challenges
    this.cleanupTestChallenges();
    
    return {
      token,
      challenge: `What is ${num1} + ${num2}?`,
      testMode: true
    };
  }
  
  /**
   * Verify test CAPTCHA (for development)
   * @param {string} token 
   * @param {string} answer 
   * @returns {Object}
   */
  verifyTestCaptcha(token, answer = null) {
    const challenge = this.testChallenges.get(token);
    
    if (!challenge) {
      return {
        success: false,
        error: 'Invalid or expired CAPTCHA token'
      };
    }
    
    if (Date.now() > challenge.expiresAt) {
      this.testChallenges.delete(token);
      return {
        success: false,
        error: 'CAPTCHA token expired'
      };
    }
    
    // In test mode, if no answer provided, just accept the token
    if (answer === null) {
      this.testChallenges.delete(token);
      return {
        success: true,
        testMode: true
      };
    }
    
    if (parseInt(answer) === challenge.answer) {
      this.testChallenges.delete(token);
      return {
        success: true,
        testMode: true
      };
    }
    
    return {
      success: false,
      error: 'Incorrect CAPTCHA answer'
    };
  }
  
  /**
   * Generate random token
   * @returns {string}
   */
  generateToken() {
    return Math.random().toString(36).substring(2) + 
           Math.random().toString(36).substring(2) +
           Date.now().toString(36);
  }
  
  /**
   * Clean up expired test challenges
   */
  cleanupTestChallenges() {
    const now = Date.now();
    for (const [token, challenge] of this.testChallenges.entries()) {
      if (now > challenge.expiresAt) {
        this.testChallenges.delete(token);
      }
    }
  }
  
  /**
   * Get CAPTCHA configuration for frontend
   * @returns {Object}
   */
  getConfig() {
    return {
      enabled: this.enabled,
      provider: this.provider,
      siteKey: this.getSiteKey(),
      testMode: this.testMode
    };
  }
  
  /**
   * Get site key based on provider
   * @returns {string}
   */
  getSiteKey() {
    switch (this.provider) {
      case 'recaptcha':
        return process.env.RECAPTCHA_SITE_KEY || '';
      case 'hcaptcha':
        return process.env.HCAPTCHA_SITE_KEY || '';
      case 'turnstile':
        return process.env.TURNSTILE_SITE_KEY || '';
      default:
        return '';
    }
  }
}

// Create singleton instance
const captchaService = new CaptchaService();

module.exports = captchaService;
