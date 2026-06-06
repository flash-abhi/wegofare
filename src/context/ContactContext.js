import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/api';

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'WegoFare',
    tagline: 'Lock Your Fare. Unlock Your Journey.',
    logoUrl: '/logo.svg',
    faviconUrl: '/favicon.ico',
    tfn: '+1-800-889-9279',
    email: 'info@wegofare.com',
    workingHours: 'Mon-Sun 24/7',
    billingAddress: {
      company: 'WegoFare',
      street: '447 Broadway',
      city: 'New York',
      state: 'NY',
      zip: '10013',
      country: 'USA'
    },
    copyrightText: `© 2006-${new Date().getFullYear()} WegoFare. All rights reserved.`,
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
    colors: {
      headerBg: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      headerText: '#ffffff',
      footerBg: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
      footerText: '#e2e8f0'
    },
    siteUrl: 'https://wegofare.com',
    address: '447 Broadway, New York, NY 10013 USA'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/public/site-settings`);
      const data = await response.json();
      if (data.success && data.settings) {
        setSiteSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      // Fallback: try old contact-settings endpoint
      try {
        const fallback = await fetch(`${API_URL}/api/admin/public/contact-settings`);
        const fbData = await fallback.json();
        if (fbData.success && fbData.settings) {
          setSiteSettings(prev => ({
            ...prev,
            tfn: fbData.settings.tfn || prev.tfn,
            email: fbData.settings.email || prev.email,
            address: fbData.settings.address || prev.address,
            workingHours: fbData.settings.workingHours || prev.workingHours
          }));
        }
      } catch (e) {
        console.error('Error fetching settings:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Backward-compatible contactSettings shape
  const contactSettings = {
    tfn: siteSettings.tfn,
    email: siteSettings.email,
    address: siteSettings.address,
    workingHours: siteSettings.workingHours
  };

  return (
    <ContactContext.Provider value={{
      contactSettings,
      siteSettings,
      loading,
      refreshSettings: fetchSettings
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within ContactProvider');
  }
  return context;
};

// New hook for full site settings
export const useSiteSettings = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within ContactProvider');
  }
  return {
    siteSettings: context.siteSettings,
    loading: context.loading,
    refreshSettings: context.refreshSettings
  };
};

export default ContactContext;
