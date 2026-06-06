# 🔒 Security & Phishing Detection System

## Overview

LockMyFare (wegofare.com) now includes a comprehensive security system to protect against phishing attempts, brute force attacks, and unauthorized access. The system provides real-time monitoring, automatic IP blocking, CAPTCHA challenges, and email alerts.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Security Dashboard](#security-dashboard)
6. [API Endpoints](#api-endpoints)
7. [Best Practices](#best-practices)

---

## Features

### 🛡️ Phishing Detection

- **Suspicious Pattern Recognition**: Detects common phishing email patterns
- **User Agent Analysis**: Identifies automated tools and bots
- **Behavioral Analysis**: Tracks unusual login patterns
- **Scoring System**: Assigns suspicious scores (0-10) to login attempts

### 🚫 Brute Force Protection

- **Rate Limiting**: Limits login attempts per IP address
- **Progressive Blocking**: Blocks IPs after multiple failed attempts
- **Temporary Blocks**: Auto-expires blocks after configurable duration
- **Multiple Email Detection**: Flags IPs trying different email addresses

### 🔐 CAPTCHA Integration

- **Multiple Providers**: Support for reCAPTCHA, hCaptcha, and Cloudflare Turnstile
- **Progressive Challenges**: Shows CAPTCHA after suspicious activity
- **Test Mode**: Development mode with simple math challenges

### 📧 Email Alerts

- **Security Notifications**: Real-time alerts for suspicious activity
- **Blocked IP Alerts**: Notifications when IPs are auto-blocked
- **Brute Force Alerts**: Warnings for potential attack patterns
- **Beautiful HTML Emails**: Professional email templates

### 📊 Real-time Monitoring

- **Live Statistics**: Dashboard showing security metrics
- **Login History**: Complete audit trail of all login attempts
- **Suspicious Attempts**: Dedicated view for flagged activities
- **Top Offenders**: List of most suspicious IP addresses

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Security Dashboard UI                        │  │
│  │  - Stats Grid                                        │  │
│  │  - Blocked IPs Panel                                 │  │
│  │  - Suspicious Attempts Table                         │  │
│  │  - Login History Table                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Middleware Layer                             │  │
│  │  - loginRateLimiter                                  │  │
│  │  - apiRateLimiter                                    │  │
│  │  - blockSuspiciousUserAgents                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Services Layer                               │  │
│  │  - loginSecurity.js (core security logic)            │  │
│  │  - captcha.js (CAPTCHA verification)                 │  │
│  │  - emailNotifications.js (alerts)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         API Routes                                   │  │
│  │  - POST /api/admin/login (protected)                 │  │
│  │  - GET /api/admin/security/stats                     │  │
│  │  - GET /api/admin/security/history                   │  │
│  │  - POST /api/admin/security/block-ip                 │  │
│  │  - POST /api/admin/security/unblock-ip               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  In-Memory Storage                          │
│  - Login Attempts (Map)                                     │
│  - Login History (Array)                                    │
│  - Blocked IPs (Set)                                        │
└─────────────────────────────────────────────────────────────┘
```

### Files Created

#### Backend
1. **`backend/services/loginSecurity.js`** (600+ lines)
   - Core security service
   - Phishing detection algorithms
   - Brute force protection
   - Statistics and reporting

2. **`backend/middleware/rateLimiter.js`** (200+ lines)
   - Login rate limiting
   - API rate limiting
   - IP whitelist/blacklist
   - User agent blocking

3. **`backend/services/captcha.js`** (300+ lines)
   - Multi-provider CAPTCHA support
   - Verification logic
   - Test mode for development

4. **`backend/services/emailNotifications.js`** (400+ lines)
   - Email alert system
   - Beautiful HTML templates
   - Multiple SMTP providers

5. **`backend/routes/admin.js`** (Enhanced)
   - Secured login endpoint
   - Security dashboard API routes
   - IP blocking/unblocking

#### Frontend
1. **`src/pages/AdminDashboard.js`** (Enhanced)
   - Security tab implementation
   - Real-time statistics display
   - IP management UI
   - Login history viewer

2. **`src/pages/AdminDashboard.css`** (Enhanced)
   - Security dashboard styles
   - Responsive tables
   - Color-coded threat levels
   - Loading animations

---

## Installation & Setup

### 1. Install Dependencies

The security system uses existing dependencies, but ensure you have:

```bash
cd backend
npm install jsonwebtoken bcryptjs express axios nodemailer
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# JWT Secret (required)
JWT_SECRET=your-super-secret-jwt-key-change-this

# CAPTCHA (optional but recommended)
CAPTCHA_ENABLED=true
CAPTCHA_PROVIDER=hcaptcha
HCAPTCHA_SITE_KEY=your-site-key
HCAPTCHA_SECRET_KEY=your-secret-key

# Email Alerts (optional)
EMAIL_NOTIFICATIONS_ENABLED=true
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAILS=info@wegofare.com
```

### 3. CAPTCHA Setup (Optional)

Choose one provider:

#### hCaptcha (Recommended)
1. Go to https://dashboard.hcaptcha.com/signup
2. Create an account
3. Add your website domain
4. Copy Site Key and Secret Key
5. Add to `.env`

#### Google reCAPTCHA
1. Go to https://www.google.com/recaptcha/admin
2. Register a new site
3. Choose reCAPTCHA v3
4. Copy Site Key and Secret Key
5. Set `CAPTCHA_PROVIDER=recaptcha` in `.env`

#### Cloudflare Turnstile
1. Go to Cloudflare Dashboard
2. Navigate to Turnstile
3. Create a new site
4. Copy Site Key and Secret Key
5. Set `CAPTCHA_PROVIDER=turnstile` in `.env`

### 4. Email Notifications Setup (Optional)

#### Using Gmail
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App Passwords
   - Generate password for "Mail"
3. Add to `.env`:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

#### Using SendGrid
1. Sign up at https://sendgrid.com
2. Create API Key
3. Add to `.env`:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
```

### 5. Restart Servers

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ..
npm start
```

---

## Configuration

### Security Settings

Edit `backend/services/loginSecurity.js` to customize:

```javascript
this.config = {
  maxAttemptsBeforeBlock: 5,        // Block after N failed attempts
  blockDurationMs: 15 * 60 * 1000,  // Block duration (15 minutes)
  attemptWindowMs: 10 * 60 * 1000,  // Time window for counting (10 min)
  maxAttemptsPerMinute: 3,          // Rate limit per minute
  requireCaptchaAfter: 3,           // Show CAPTCHA after N failures
  maxDifferentEmailsPerIP: 5,       // Max emails from same IP
  suspiciousThreshold: 3,           // Suspicious score threshold
  cleanupIntervalMs: 60 * 60 * 1000, // Cleanup interval (1 hour)
  maxHistoryEntries: 1000           // Max history records
};
```

### Suspicious Patterns

Add custom patterns in `loginSecurity.js`:

```javascript
this.suspiciousPatterns = {
  userAgents: [
    'curl', 'wget', 'python-requests', // Automated tools
    'bot', 'crawler', 'spider'          // Bots
  ],
  emailPatterns: [
    /admin@admin/i,                    // Test emails
    /@example\.com$/i                   // Example domains
  ],
  commonPhishingEmails: [
    'admin@admin.com',
    'test@test.com'
  ]
};
```

---

## Security Dashboard

### Accessing the Dashboard

1. Log in to admin panel: `http://localhost:3000/admin/login`
2. Click **Security** tab in sidebar
3. Click **Load Security Data** button

### Dashboard Sections

#### 1. Statistics Grid

Real-time metrics:
- **Total Attempts (24h)**: All login attempts in last 24 hours
- **Suspicious Attempts**: Flagged attempts
- **Blocked IPs**: Currently blocked IP addresses
- **Success Rate**: Percentage of successful logins

#### 2. Blocked IP Addresses

- List of all blocked IPs
- Failed attempt count
- Different emails tried
- Block expiration time
- **Unblock** button for each IP

#### 3. Top Suspicious IPs

Table showing:
- IP address
- Total/failed/suspicious attempts
- Different emails tried
- Suspicious score (0-10)
- Last attempt time
- **Block** button

#### 4. Recent Suspicious Attempts

Detailed log of flagged login attempts:
- Timestamp
- Email used
- IP address
- Success/failure status
- Suspicious score
- User agent

#### 5. Login History

Complete audit trail:
- All login attempts (successful and failed)
- Highlighted suspicious rows
- Filter by time period

#### 6. Security Tips

Best practices and recommendations

---

## API Endpoints

### Authentication

#### POST /api/admin/login
Login with security checks

**Request:**
```json
{
   "email": "info@wegofare.com",
  "password": "admin123",
  "captchaToken": "optional-captcha-token"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "jwt-token",
  "admin": {
    "id": 1,
    "name": "Admin",
   "email": "info@wegofare.com"
  },
  "security": {
    "suspiciousScore": 0,
    "warning": null
  }
}
```

**Response (Blocked):**
```json
{
  "success": false,
  "message": "Too many failed login attempts. Try again in 15 minutes.",
  "blocked": true,
  "requireCaptcha": false,
  "suspiciousScore": 10
}
```

**Response (CAPTCHA Required):**
```json
{
  "success": false,
  "message": "CAPTCHA verification required",
  "requireCaptcha": true,
  "captchaConfig": {
    "enabled": true,
    "provider": "hcaptcha",
    "siteKey": "your-site-key"
  }
}
```

### Security Dashboard

#### GET /api/admin/security/stats
Get security statistics

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "last24Hours": {
      "total": 45,
      "successful": 40,
      "failed": 5,
      "suspicious": 2
    },
    "blockedIPs": {
      "count": 1,
      "list": ["192.168.1.100"]
    },
    "topSuspiciousIPs": [...]
  }
}
```

#### GET /api/admin/security/history?limit=50
Get login history

#### GET /api/admin/security/suspicious?limit=50
Get suspicious attempts

#### POST /api/admin/security/block-ip
Manually block an IP

**Request:**
```json
{
  "ip": "192.168.1.100",
  "duration": 60  // minutes (optional)
}
```

#### POST /api/admin/security/unblock-ip
Unblock an IP

**Request:**
```json
{
  "ip": "192.168.1.100"
}
```

#### GET /api/admin/security/captcha-config
Get CAPTCHA configuration

#### POST /api/admin/security/test-email
Test email notification setup

---

## Best Practices

### For Administrators

1. **Enable Two-Factor Authentication**
   - Add 2FA for admin accounts (future enhancement)

2. **Monitor Security Dashboard Regularly**
   - Check weekly for suspicious patterns
   - Review blocked IPs
   - Investigate failed login attempts

3. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passwords

4. **Keep API Keys Secure**
   - Never commit `.env` to git
   - Rotate keys regularly
   - Use environment-specific keys

5. **Enable Email Alerts**
   - Configure email notifications
   - Monitor security alerts
   - Act on suspicious activity immediately

6. **Regular Audits**
   - Review login history monthly
   - Check for unusual patterns
   - Update security settings as needed

### For Developers

1. **Test Security Features**
   - Try failed login attempts
   - Test CAPTCHA flow
   - Verify email alerts work

2. **Custom Security Rules**
   - Add industry-specific patterns
   - Adjust thresholds for your use case
   - Implement geo-IP blocking if needed

3. **Database Migration**
   - Current system uses in-memory storage
   - For production, migrate to Redis or MongoDB
   - Persist security logs for compliance

4. **Rate Limiting**
   - Apply rate limiting to all API endpoints
   - Use `apiRateLimiter` middleware
   - Customize limits per endpoint

5. **Security Headers**
   - Add helmet.js for security headers
   - Enable CORS properly
   - Use HTTPS in production

---

## Threat Scoring System

### Score Breakdown (0-10)

| Score | Description | Actions |
|-------|-------------|---------|
| 0-2   | Normal activity | No action |
| 3-4   | Slightly suspicious | Monitor |
| 5-6   | Moderately suspicious | Require CAPTCHA |
| 7-8   | Highly suspicious | Email alert + CAPTCHA |
| 9-10  | Critical threat | Block IP + email alert |

### Scoring Criteria

- **Suspicious User Agent**: +3 points
- **Phishing Email Pattern**: +2 points
- **Common Phishing Email**: +3 points
- **Too Many Different Emails**: +4 points
- **Rapid Attempts**: +2 points
- **Invalid Email Format**: +1 point

---

## Email Alert Types

### 1. Suspicious Login Alert
Sent when: Suspicious score ≥ 5

### 2. Blocked IP Alert
Sent when: IP automatically blocked after max attempts

### 3. Brute Force Alert
Sent when: ≥5 different emails tried from same IP

### 4. New Location Login (Future)
Sent when: Login from new geographic location

### 5. Failed Login Warning
Sent when: Multiple failed attempts for same account

---

## Testing

### Test Scenarios

1. **Normal Login**
   ```
   Email: info@wegofare.com
   Password: admin123
   Expected: Success
   ```

2. **Failed Login**
   ```
   Email: info@wegofare.com
   Password: wrongpassword
   Expected: Failure, counter increases
   ```

3. **Trigger CAPTCHA**
   ```
   Fail login 3 times
   Expected: CAPTCHA required on 4th attempt
   ```

4. **Trigger Block**
   ```
   Fail login 5 times
   Expected: IP blocked for 15 minutes
   ```

5. **Suspicious Pattern**
   ```
   Email: admin@admin.com
   User-Agent: curl/7.64.1
   Expected: High suspicious score, email alert
   ```

---

## Troubleshooting

### CAPTCHA Not Showing

1. Check `.env` has correct keys
2. Verify `CAPTCHA_ENABLED=true`
3. Check browser console for errors
4. Test with dev mode (test CAPTCHA)

### Email Alerts Not Sending

1. Verify SMTP credentials
2. Check `EMAIL_NOTIFICATIONS_ENABLED=true`
3. Test email configuration:
   ```bash
   curl -X POST http://localhost:5001/api/admin/security/test-email \
     -H "Authorization: Bearer <token>"
   ```

### IP Block Not Working

1. Check if using proxy/load balancer
2. Verify IP extraction in `getClientIP()`
3. Review `loginAttempts` Map in debugger

### Statistics Not Loading

1. Check backend server running
2. Verify JWT token valid
3. Check browser console for errors
4. Try refreshing security data

---

## Future Enhancements

1. **Database Persistence**
   - Migrate from in-memory to Redis/MongoDB
   - Persist security logs long-term

2. **Geo-IP Blocking**
   - Block by country/region
   - Detect VPN/proxy usage

3. **Two-Factor Authentication**
   - TOTP (Google Authenticator)
   - SMS verification
   - Email verification codes

4. **Advanced Analytics**
   - Attack pattern visualization
   - Heatmaps by time/location
   - Predictive threat detection

5. **Webhook Integration**
   - Slack notifications
   - Discord alerts
   - Custom webhook endpoints

6. **IP Reputation Service**
   - Check against threat databases
   - Automatic blocking of known bad IPs

7. **Session Management**
   - Active session viewer
   - Force logout capability
   - Session expiration controls

---

## Support

For questions or issues:
- **Email**: security@wegofare.com
- **Phone**: +1-866-938-8061
- **Documentation**: Check IMPLEMENTATION_SUMMARY.md

---

## License

Copyright © 2024 LockMyFare. All rights reserved.
