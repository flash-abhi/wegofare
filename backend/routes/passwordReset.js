const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Import admin password updater
const adminRoute = require('./admin');

// Store reset tokens temporarily (in production, use database)
const resetTokens = new Map();

// Email configuration - same as booking email service
let transporter = null;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    console.log('📧 Password reset email service initialized');
  }
} catch (error) {
  console.error('❌ Failed to initialize password reset email:', error.message);
}

// Request password reset
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Password reset request received for:', email);

    // Validate email
    if (!email || email !== 'info@wegofare.com') {
      console.log('❌ Email validation failed:', email);
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = Date.now() + 3600000; // 1 hour

    // Store token
    resetTokens.set(email, {
      token: resetToken,
      expiry: resetExpiry
    });

    // Create reset link - use production URL
    const baseUrl = process.env.SITE_URL || 'https://wegofare.com';
    const resetLink = `${baseUrl}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@myfaredeal.com',
      to: email,
      subject: 'Password Reset Request - MyFareDeal Admin',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello Admin,</h2>
              <p>We received a request to reset your MyFareDeal Admin Panel password.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetLink}
              </p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>Best regards,<br><strong>MyFareDeal Team</strong></p>
            </div>
            <div class="footer">
              <p>MyFareDeal Admin Panel | Secure Password Management</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    console.log('📤 Sending email to:', email);
    console.log('📧 From:', process.env.EMAIL_USER);
    console.log('🔗 Reset link:', resetLink);
    
    // Check if email is configured
    if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email not configured, returning reset link directly');
      return res.json({
        success: true,
        message: 'Password reset link generated. Since email is not configured, use the link below:',
        resetLink: resetLink
      });
    }
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email. Please try again.'
    });
  }
});

// Verify reset token
router.post('/verify', (req, res) => {
  try {
    const { email, token } = req.body;

    const storedToken = resetTokens.get(email);

    if (!storedToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (storedToken.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    if (Date.now() > storedToken.expiry) {
      resetTokens.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    res.json({
      success: true,
      message: 'Token verified'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

// Reset password
router.post('/reset', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const storedToken = resetTokens.get(email);

    if (!storedToken || storedToken.token !== token || Date.now() > storedToken.expiry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin password directly
    const updated = adminRoute.updateAdminPassword(email, hashedPassword);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    console.log(`
🔑 Password Reset Successful!
Email: ${email}
Password has been updated automatically!
    `);

    // Clear token
    resetTokens.delete(email);

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

module.exports = router;
