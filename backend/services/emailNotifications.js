/**
 * Email Notification Service
 * Sends security alerts and notifications
 */

const nodemailer = require('nodemailer');
const contactConfig = require('../config/contactSettings');

class EmailNotificationService {
  constructor() {
    this.enabled = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
    this.fromEmail = process.env.EMAIL_FROM || 'security@wegofare.com';
    this.adminEmails = (process.env.ADMIN_EMAILS || 'info@wegofare.com').split(',');
    this.transporter = null;
    
    if (this.enabled) {
      this.initializeTransporter();
    }
  }
  
  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
    
    switch (emailProvider) {
      case 'smtp':
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        break;
        
      case 'sendgrid':
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        break;
        
      case 'mailgun':
        this.transporter = nodemailer.createTransport({
          host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
          port: 587,
          auth: {
            user: process.env.MAILGUN_SMTP_USER,
            pass: process.env.MAILGUN_SMTP_PASS
          }
        });
        break;
        
      default:
        console.warn('Unknown email provider. Email notifications disabled.');
        this.enabled = false;
    }
  }
  
  /**
   * Send security alert email
   * @param {string} subject 
   * @param {string} message 
   * @param {Object} details 
   */
  async sendSecurityAlert(subject, message, details = {}) {
    if (!this.enabled || !this.transporter) {
      console.log('[EMAIL] Would send security alert:', subject);
      console.log('[EMAIL] Details:', details);
      return { sent: false, reason: 'Email notifications disabled' };
    }
    
    const htmlContent = this.generateSecurityAlertHTML(subject, message, details);
    
    try {
      const info = await this.transporter.sendMail({
        from: `"WegoFare Security" <${this.fromEmail}>`,
        to: this.adminEmails.join(','),
        subject: `🚨 Security Alert: ${subject}`,
        html: htmlContent,
        text: this.generateSecurityAlertText(subject, message, details)
      });
      
      console.log('[EMAIL] Security alert sent:', info.messageId);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error('[EMAIL] Failed to send security alert:', error);
      return { sent: false, error: error.message };
    }
  }
  
  /**
   * Send suspicious login attempt alert
   * @param {Object} attemptDetails 
   */
  async sendSuspiciousLoginAlert(attemptDetails) {
    const { email, ip, userAgent, suspiciousScore, reason } = attemptDetails;
    
    return await this.sendSecurityAlert(
      'Suspicious Login Attempt Detected',
      `A suspicious login attempt was detected on your admin panel.`,
      {
        'Email Used': email,
        'IP Address': ip,
        'User Agent': userAgent,
        'Suspicious Score': `${suspiciousScore}/10`,
        'Reason': reason || 'Multiple indicators detected',
        'Time': new Date().toLocaleString(),
        'Action Required': 'Review security logs and consider blocking this IP if necessary'
      }
    );
  }
  
  /**
   * Send blocked IP notification
   * @param {string} ip 
   * @param {number} attempts 
   * @param {number} blockDuration 
   */
  async sendBlockedIPAlert(ip, attempts, blockDuration) {
    return await this.sendSecurityAlert(
      'IP Address Blocked Due to Failed Login Attempts',
      `An IP address has been automatically blocked after multiple failed login attempts.`,
      {
        'IP Address': ip,
        'Failed Attempts': attempts,
        'Block Duration': `${Math.ceil(blockDuration / 60000)} minutes`,
        'Time': new Date().toLocaleString(),
        'Action': 'The IP has been automatically blocked. Manual unblock available in security dashboard.'
      }
    );
  }
  
  /**
   * Send brute force attack alert
   * @param {string} ip 
   * @param {number} attemptCount 
   * @param {Array} targetEmails 
   */
  async sendBruteForceAlert(ip, attemptCount, targetEmails) {
    return await this.sendSecurityAlert(
      'Potential Brute Force Attack Detected',
      `A potential brute force attack has been detected from a single IP address.`,
      {
        'IP Address': ip,
        'Total Attempts': attemptCount,
        'Target Emails': targetEmails.slice(0, 10).join(', ') + (targetEmails.length > 10 ? '...' : ''),
        'Different Emails Tried': targetEmails.length,
        'Time': new Date().toLocaleString(),
        'Status': 'IP has been automatically blocked',
        'Recommendation': 'Monitor for similar patterns from other IPs'
      }
    );
  }
  
  /**
   * Send successful login from new location alert
   * @param {string} email 
   * @param {string} ip 
   * @param {string} location 
   */
  async sendNewLocationLoginAlert(email, ip, location) {
    return await this.sendSecurityAlert(
      'Login from New Location',
      `An admin account was accessed from a new location.`,
      {
        'Account': email,
        'IP Address': ip,
        'Location': location || 'Unknown',
        'Time': new Date().toLocaleString(),
        'Action': 'If this was you, no action needed. Otherwise, change your password immediately.'
      }
    );
  }
  
  /**
   * Send multiple failed login attempts warning
   * @param {string} email 
   * @param {number} attempts 
   */
  async sendFailedLoginWarning(email, attempts) {
    return await this.sendSecurityAlert(
      'Multiple Failed Login Attempts',
      `Multiple failed login attempts detected for an admin account.`,
      {
        'Account': email,
        'Failed Attempts': attempts,
        'Time': new Date().toLocaleString(),
        'Action': 'If this was not you, someone may be trying to access your account. Consider changing your password.'
      }
    );
  }
  
  /**
   * Generate HTML content for security alert
   * @param {string} subject 
   * @param {string} message 
   * @param {Object} details 
   * @returns {string}
   */
  generateSecurityAlertHTML(subject, message, details) {
    const detailsRows = Object.entries(details)
      .map(([key, value]) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">${key}:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${value}</td>
        </tr>
      `)
      .join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🚨 Security Alert</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px;">${subject}</h2>
            
            <p style="margin: 0 0 20px 0; color: #4b5563; line-height: 1.6;">${message}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              ${detailsRows}
            </table>
            
            <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Security Reminder:</strong> This is an automated security alert from wegofare.com. 
                Please review the details above and take appropriate action if necessary.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://wegofare.com/admin/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Security Dashboard
              </a>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                <p>wegofare.com Security Team</p>
            <p>${contactConfig.getContactSettings().address}</p>
            <p>Phone: ${contactConfig.getContactSettings().tfn}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Generate plain text content for security alert
   * @param {string} subject 
   * @param {string} message 
   * @param {Object} details 
   * @returns {string}
   */
  generateSecurityAlertText(subject, message, details) {
    const detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    return `
SECURITY ALERT: ${subject}

${message}

DETAILS:
${detailsText}

---
This is an automated security alert from wegofare.com.
Please review the details above and take appropriate action if necessary.

wegofare.com Security Team
${contactConfig.getContactSettings().address}
Phone: ${contactConfig.getContactSettings().tfn}
    `.trim();
  }
  
  /**
   * Test email configuration
   * @returns {Promise<Object>}
   */
  async testConfiguration() {
    if (!this.enabled || !this.transporter) {
      return { success: false, message: 'Email notifications are disabled' };
    }
    
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Create singleton instance
const emailNotificationService = new EmailNotificationService();

module.exports = emailNotificationService;
