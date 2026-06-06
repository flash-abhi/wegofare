/**
 * Site Settings Module
 * Centralized website settings that can be updated via Admin Panel
 * Covers: Logo, TFN, Email, Billing Address, Site Name, Copyright, Favicon, Social Links
 */

const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'siteSettings.json');

// Default site settings
const defaults = {
  // Branding
  siteName: 'Sky Fare',
  tagline: 'Lock Your Fare. Unlock Your Journey.',
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.ico',
  
  // Contact
  tfn: '+1-888-859-0441',
  email: 'info@skytravelfare.com',
  workingHours: 'Mon-Sun 24/7',
  
  // Billing / Business Address
  billingAddress: {
    company: 'Sky Fare',
    street: '1309 Coffeen Ave STE 1200',
    city: 'Sheridan',
    state: 'WY',
    zip: '82801',
    country: 'USA'
  },
  
  // Legal
  copyrightText: '© 2006-{year} Sky Fare All rights reserved.',
  
  // Social Links
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  },

  // Colors
  colors: {
    headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerText: '#ffffff',
    footerBg: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    footerText: '#e2e8f0'
  },

  // SEO
  siteUrl: 'https://skytravelfare.com'
};

let siteSettings = { ...defaults };

// Load persisted settings from disk
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const saved = JSON.parse(raw);
      siteSettings = { ...defaults, ...saved, billingAddress: { ...defaults.billingAddress, ...(saved.billingAddress || {}) }, socialLinks: { ...defaults.socialLinks, ...(saved.socialLinks || {}) }, colors: { ...defaults.colors, ...(saved.colors || {}) } };
    }
  } catch (err) {
    console.error('Error loading site settings:', err.message);
  }
};

// Save settings to disk
const saveSettings = () => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(siteSettings, null, 2));
  } catch (err) {
    console.error('Error saving site settings:', err.message);
  }
};

// Load on startup
loadSettings();

// Get all settings
const getSiteSettings = () => {
  return JSON.parse(JSON.stringify(siteSettings));
};

// Get public-safe settings (no internal fields)
const getPublicSettings = () => {
  const s = getSiteSettings();
  return {
    siteName: s.siteName,
    tagline: s.tagline,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    tfn: s.tfn,
    email: s.email,
    workingHours: s.workingHours,
    billingAddress: s.billingAddress,
    copyrightText: s.copyrightText.replace('{year}', new Date().getFullYear()),
    socialLinks: s.socialLinks,
    colors: s.colors,
    siteUrl: s.siteUrl,
    // Backward compatible flat address string
    address: `${s.billingAddress.street}, ${s.billingAddress.city}, ${s.billingAddress.state} ${s.billingAddress.zip}, ${s.billingAddress.country}`
  };
};

// Update settings (partial update)
const updateSiteSettings = (newSettings) => {
  // Merge top-level fields
  const simpleFields = ['siteName', 'tagline', 'logoUrl', 'faviconUrl', 'tfn', 'email', 'workingHours', 'copyrightText', 'siteUrl'];
  simpleFields.forEach(key => {
    if (newSettings[key] !== undefined) siteSettings[key] = newSettings[key];
  });

  // Merge nested objects
  if (newSettings.billingAddress) {
    siteSettings.billingAddress = { ...siteSettings.billingAddress, ...newSettings.billingAddress };
  }
  if (newSettings.socialLinks) {
    siteSettings.socialLinks = { ...siteSettings.socialLinks, ...newSettings.socialLinks };
  }
  if (newSettings.colors) {
    siteSettings.colors = { ...siteSettings.colors, ...newSettings.colors };
  }

  saveSettings();
  return getSiteSettings();
};

module.exports = {
  getSiteSettings,
  getPublicSettings,
  updateSiteSettings,
  loadSettings
};
