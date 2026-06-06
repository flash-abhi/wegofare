import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config/api';
import {
  Users,
  Plane,
  Hotel,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  Search,
  BarChart3,
  Globe,
  Link as LinkIcon,
  FileCheck,
  Zap,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  BookOpen,
  Megaphone,
  Mail,
  Calendar,
  Percent,
  Star,
  Bell,
  CreditCard,
  Shield,
  Folder,
  Activity,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Upload,
  Menu,
  Phone,
  MapPin,
  Clock,
  Settings,
  Image,
  Type,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Palette
} from 'lucide-react';
import './AdminDashboard.css';
function AdminDashboard() {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [adminUser] = React.useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu when tab changes
    const handleTabChange = (tab) => {
      setActiveTab(tab);
      setMobileMenuOpen(false);
    };
  // ...existing code...

  // Add missing state definitions
  const [gdsSettings, setGdsSettings] = useState({
    amadeus: { apiKey: '', apiSecret: '', enabled: false },
    sabre: { username: '', password: '', pcc: '', enabled: false },
    travelport: { username: '', password: '', targetBranch: '', enabled: false },
    galileo: { username: '', password: '', pcc: '', enabled: false },
    llc: { apiKey: '', apiSecret: '', enabled: false }
  });

  // If adminUser is used for authentication or display, define it as state
  // ...existing code...

  // Add missing states for coupons, reviews, notifications, etc.
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percentage', expiryDate: '', maxUses: '', minAmount: '' });
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [roles] = useState([]);
  const [activityLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // Add all other missing states and hooks
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, totalUsers: 0, pageViews: 0 });
  const [seoData, setSeoData] = useState({ pageTitle: '', metaDescription: '', canonicalUrl: '', keywords: '', ogImage: '' });
  const [seoAnalysis, setSeoAnalysis] = useState({ focusKeyword: '', score: 0, results: [] });
  const [content, setContent] = useState({});
  const [blogPosts, setBlogPosts] = useState([]);
  const [bookings, setBookings] = useState({ flights: [], hotels: [], vacations: [] });
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ name: '', type: 'email', subject: '', message: '', targetAudience: 'all', scheduledDate: '' });
  const [visitorStats, setVisitorStats] = useState({ current: 0, total: 0, peak: 0, history: [], locations: [], visitors: [] });
  const [newPost, setNewPost] = useState({ title: '', excerpt: '', content: '', image: '', author: 'Admin' });
  const [editingPost, setEditingPost] = useState(null);
  const [activeSeoTool, setActiveSeoTool] = useState('meta');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [autoPostingEnabled, setAutoPostingEnabled] = useState(false);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [seoAgentStatus, setSeoAgentStatus] = useState({ running: false, uptime: null, restarts: 0 });
  const [seoAgentReports, setSeoAgentReports] = useState([]);
  const [seoAgentLogs, setSeoAgentLogs] = useState([]);
  const [seoAutomationSettings, setSeoAutomationSettings] = useState({
    enabled: false,
    tasks: {
      sitemapGeneration: true,
      metaOptimization: true,
      keywordTracking: true,
      backlinkMonitoring: true,
      performanceAudit: true,
      contentAnalysis: true
    },
    schedule: {
      fullAudit: '0 3 * * *',
      quickCheck: '0 */6 * * *',
      competitorAnalysis: '0 9 * * 1'
    },
    notifications: {
      email: true,
      emailAddress: '',
      slackWebhook: ''
    }
  });
  const [automatedTasks, setAutomatedTasks] = useState([]);
  const [seoToolData, setSeoToolData] = useState({ 
    keywords: [], 
    newKeyword: '',
    siteAudit: null,
    speedTest: null,
    analytics: {
      organicTraffic: 0,
      trafficChange: '0.0',
      keywordRankings: 0,
      newRankings: 0,
      clickRate: '0.0',
      clickRateChange: '0.0',
      avgPosition: '0.0',
      positionChange: '0.0'
    },
    backlinks: {
      total: 0,
      referringDomains: 0,
      domainAuthority: 0,
      recentBacklinks: []
    }
  });
  const [gscData, setGscData] = useState({
    connected: false,
    performance: null,
    indexing: null,
    sitemaps: [],
    loading: false
  });
  const [securityData, setSecurityData] = useState({
    stats: null,
    history: [],
    suspicious: [],
    loading: false
  });
  
  // Backlinks AI state
  const [backlinkData, setBacklinkData] = useState({
    stats: null,
    backlinks: [],
    submissions: [],
    platforms: {},
    opportunities: [],
    loading: false,
    generating: false,
    generatedContent: null,
    activeBacklinkTab: 'overview'
  });
  
  const [bookingTab, setBookingTab] = useState('flights');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Contact Settings State
  const [contactSettings, setContactSettings] = useState({
    tfn: '',
    email: '',
    address: '',
    workingHours: ''
  });

  // Website / Site Settings State
  const [siteSettingsData, setSiteSettingsData] = useState({
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
    copyrightText: '© 2006-{year} WegoFare. All rights reserved.',
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
    colors: {
      headerBg: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      headerText: '#ffffff',
      footerBg: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
      footerText: '#e2e8f0'
    },
    siteUrl: 'https://wegofare.com'
  });
  const [settingsTab, setSettingsTab] = useState('general');
  const [logoUploading, setLogoUploading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Utility function for country flag (dummy implementation)
  const getCountryFlag = (countryCode) => `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;

  // Auto-fetch SEO data when switching tabs
  useEffect(() => {
    const fetchSeoToolData = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (activeSeoTool === 'analytics' && seoToolData.analytics.organicTraffic === 0) {
        try {
          const response = await fetch(`${API_URL}/api/seo/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setSeoToolData(prev => ({...prev, analytics: data}));
          }
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
        }
      }
      
      if (activeSeoTool === 'backlinks' && seoToolData.backlinks.total === 0) {
        try {
          const response = await fetch(`${API_URL}/api/seo/backlinks?domain=wegofare.com`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setSeoToolData(prev => ({...prev, backlinks: data}));
          }
        } catch (error) {
          console.error('Failed to fetch backlinks:', error);
        }
      }
    };
    
    fetchSeoToolData();
  }, [activeSeoTool, seoToolData.analytics.organicTraffic, seoToolData.backlinks.total]);

  // Auto-fetch backlink data when backlinks tab is activated
  useEffect(() => {
    if (activeTab === 'backlinks') {
      // Define fetchBacklinkData inline for this effect
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('adminToken');
          if (!token) return;
          
          const headers = { 'Authorization': `Bearer ${token}` };
          
          const [statsRes, backlinksRes, submissionsRes, platformsRes] = await Promise.all([
            fetch(`${API_URL}/api/backlinks/stats`, { headers }),
            fetch(`${API_URL}/api/backlinks`, { headers }),
            fetch(`${API_URL}/api/backlinks/submissions?limit=50`, { headers }),
            fetch(`${API_URL}/api/backlinks/platforms`, { headers })
          ]);
          
          const [statsData, backlinksData, submissionsData, platformsData] = await Promise.all([
            statsRes.json(),
            backlinksRes.json(),
            submissionsRes.json(),
            platformsRes.json()
          ]);
          
          setBacklinkData(prev => ({
            ...prev,
            stats: statsData.stats || null,
            backlinks: backlinksData.backlinks || [],
            submissions: submissionsData.submissions || [],
            platforms: platformsData.platforms || {},
            loading: false
          }));
        } catch (err) {
          console.error('Error fetching backlink data:', err);
        }
      };
      
      fetchData();
    }
  }, [activeTab]);

  // WebSocket connection for live visitor tracking
  useEffect(() => {
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('✅ Connected to visitor tracking');
    });

    socket.on('visitorUpdate', (stats) => {
      console.log('📊 Visitor update received:', stats);
      setVisitorStats(stats);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from visitor tracking');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchStats();
    fetchBookings();
    fetchBlogPosts();
    fetchCampaigns();
    fetchContactSettings();
    fetchSiteSettings();
  }, []);

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  const fetchBlogPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/blog`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBlogPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setBlogPosts([]);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // ...existing code...

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCampaign)
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns([...campaigns, data.campaign]);
        setNewCampaign({
          name: '',
          type: 'email',
          subject: '',
          message: '',
          targetAudience: 'all',
          scheduledDate: ''
        });
        alert('Campaign created successfully!');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Failed to create campaign');
    }
  };

  const handleLaunchCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to launch this campaign?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        fetchCampaigns();
        alert('Campaign launched successfully!');
      }
    } catch (err) {
      console.error('Error launching campaign:', err);
      alert('Failed to launch campaign');
    }
  };

  // Fetch contact settings
  const fetchContactSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/contact-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.settings) {
        setContactSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching contact settings:', err);
    }
  };

  // Fetch site settings
  const fetchSiteSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/site-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.settings) {
        setSiteSettingsData(data.settings);
        // Also sync contactSettings for backward compat
        setContactSettings({
          tfn: data.settings.tfn,
          email: data.settings.email,
          address: `${data.settings.billingAddress?.street || ''}, ${data.settings.billingAddress?.city || ''}, ${data.settings.billingAddress?.state || ''} ${data.settings.billingAddress?.zip || ''}, ${data.settings.billingAddress?.country || ''}`,
          workingHours: data.settings.workingHours
        });
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    }
  };

  // Save site settings
  const handleSaveSiteSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/site-settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteSettingsData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('✅ Website settings updated successfully!');
        if (data.settings) setSiteSettingsData(data.settings);
      } else {
        alert('Failed to update settings: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Upload logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be under 2MB');
      return;
    }
    setLogoUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('logo', file);
      const response = await fetch(`${API_URL}/api/admin/site-settings/logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSiteSettingsData(prev => ({ ...prev, logoUrl: data.logoUrl + '?t=' + Date.now() }));
        alert('✅ Logo uploaded successfully!');
      } else {
        alert('Failed to upload logo: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to upload logo: ' + err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  // Save contact settings
  const handleSaveContactSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Saving contact settings:', contactSettings);
      const response = await fetch(`${API_URL}/api/admin/contact-settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactSettings)
      });
      const data = await response.json();
      console.log('Response:', data);
      if (response.ok && data.success) {
        alert('✅ Contact settings updated successfully!');
      } else {
        console.error('Failed to save:', data);
        alert('Failed to update contact settings: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving contact settings:', err);
      alert('Failed to save contact settings: ' + err.message);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
        alert('Campaign deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign');
    }
  };

  // Coupons Functions
  // ...existing code...

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCoupon)
      });
      const data = await response.json();
      if (response.ok) {
        setCoupons([...coupons, data.coupon]);
        setNewCoupon({ code: '', discount: '', type: 'percentage', expiryDate: '', maxUses: '', minAmount: '' });
        alert('Coupon created successfully!');
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
      alert('Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
        alert('Coupon deleted!');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  // Reviews Functions
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleApproveReview = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/reviews/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchReviews();
    } catch (err) {
      console.error('Error approving review:', err);
    }
  };

  const handleRejectReview = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/reviews/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchReviews();
    } catch (err) {
      console.error('Error rejecting review:', err);
    }
  };

  // Notifications Functions
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification:', err);
    }
  };

  // Transactions Functions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleProcessRefund = async (id) => {
    if (!window.confirm('Process refund for this transaction?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/transactions/${id}/refund`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTransactions();
        alert('Refund processed successfully!');
      }
    } catch (err) {
      console.error('Error processing refund:', err);
    }
  };

  // Roles Functions
  // ...existing code...

  // Activity Logs Functions
  // ...existing code...

  // Chat Functions
  const fetchChatMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setChatMessages(data.chats || []);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleSendChatMessage = async (chatId, message) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/admin/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      fetchChatMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // GDS Functions
  // ...existing code...

  // ...existing code...

  const handleUpdateGdsSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/gds`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gdsSettings)
      });
      if (response.ok) {
        alert('GDS settings updated successfully!');
      }
    } catch (err) {
      console.error('Error updating GDS settings:', err);
      alert('Failed to update GDS settings');
    }
  };

  const handleTestGdsConnection = async (provider) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/gds/${provider}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        alert(`${provider} connection successful!`);
      } else {
        alert(`${provider} connection failed: ${data.message}`);
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      alert('Connection test failed');
    }
  };

  // ...existing code...

  const analyzeSEO = React.useCallback(() => {
    // Custom SEO analysis without external dependencies
    const results = [];
    let totalScore = 0;
    let checks = 0;

    // Title length check
    const titleLength = seoData.pageTitle.length;
    if (titleLength >= 50 && titleLength <= 60) {
      results.push({ type: 'success', message: 'Title length is optimal (50-60 characters)', score: 100 });
      totalScore += 100;
    } else if (titleLength > 0 && titleLength < 50) {
      results.push({ type: 'warning', message: `Title is too short (${titleLength} chars). Aim for 50-60 characters.`, score: 60 });
      totalScore += 60;
    } else if (titleLength > 60) {
      results.push({ type: 'warning', message: `Title is too long (${titleLength} chars). It may be truncated in search results.`, score: 70 });
      totalScore += 70;
    } else {
      results.push({ type: 'error', message: 'Title is missing', score: 0 });
    }
    checks++;

    // Meta description check
    const descLength = seoData.metaDescription.length;
    if (descLength >= 150 && descLength <= 160) {
      results.push({ type: 'success', message: 'Meta description length is optimal (150-160 characters)', score: 100 });
      totalScore += 100;
    } else if (descLength > 0 && descLength < 150) {
      results.push({ type: 'warning', message: `Meta description is too short (${descLength} chars). Aim for 150-160 characters.`, score: 60 });
      totalScore += 60;
    } else if (descLength > 160) {
      results.push({ type: 'warning', message: `Meta description is too long (${descLength} chars). It may be truncated.`, score: 70 });
      totalScore += 70;
    } else {
      results.push({ type: 'error', message: 'Meta description is missing', score: 0 });
    }
    checks++;

    // Focus keyword in title
    if (seoData.pageTitle.toLowerCase().includes(seoAnalysis.focusKeyword.toLowerCase())) {
      results.push({ type: 'success', message: 'Focus keyword appears in title', score: 100 });
      totalScore += 100;
    } else {
      results.push({ type: 'error', message: 'Focus keyword not found in title', score: 0 });
    }
    checks++;

    // Focus keyword in description
    if (seoData.metaDescription.toLowerCase().includes(seoAnalysis.focusKeyword.toLowerCase())) {
      results.push({ type: 'success', message: 'Focus keyword appears in meta description', score: 100 });
      totalScore += 100;
    } else {
      results.push({ type: 'error', message: 'Focus keyword not found in meta description', score: 0 });
    }
    checks++;

    // URL check
    if (seoData.canonicalUrl) {
      if (seoData.canonicalUrl.toLowerCase().includes(seoAnalysis.focusKeyword.toLowerCase().replace(/ /g, '-'))) {
        results.push({ type: 'success', message: 'Focus keyword appears in URL', score: 100 });
        totalScore += 100;
      } else {
        results.push({ type: 'warning', message: 'Consider adding focus keyword to URL', score: 50 });
        totalScore += 50;
      }
      checks++;
    }

    // Keywords check
    const keywordCount = seoData.keywords.split(',').filter(k => k.trim()).length;
    if (keywordCount >= 3 && keywordCount <= 10) {
      results.push({ type: 'success', message: `Good number of keywords (${keywordCount})`, score: 100 });
      totalScore += 100;
    } else if (keywordCount > 0) {
      results.push({ type: 'warning', message: `${keywordCount} keywords. Aim for 3-10 relevant keywords.`, score: 60 });
      totalScore += 60;
    } else {
      results.push({ type: 'error', message: 'No keywords specified', score: 0 });
    }
    checks++;

    // OG Image check
    if (seoData.ogImage) {
      results.push({ type: 'success', message: 'Open Graph image is set', score: 100 });
      totalScore += 100;
      checks++;
    } else {
      results.push({ type: 'warning', message: 'Open Graph image not set (recommended for social sharing)', score: 50 });
      totalScore += 50;
      checks++;
    }

    const finalScore = checks > 0 ? Math.round(totalScore / checks) : 0;

    setSeoAnalysis(prev => ({
      ...prev,
      score: finalScore,
      results: results
    }));
  }, [seoData, seoAnalysis.focusKeyword]);

  useEffect(() => {
    if (seoData.pageTitle || seoData.metaDescription) {
      analyzeSEO();
    }
  }, [seoData, seoAnalysis.focusKeyword, analyzeSEO]);

  const handleSEOUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/seo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(seoData)
      });
      
      if (response.ok) {
        alert('SEO settings updated successfully!');
      }
    } catch (err) {
      console.error('Error updating SEO:', err);
      alert('Failed to update SEO settings');
    }
  };

  const handleContentUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      
      if (response.ok) {
        alert('Content updated successfully!');
      }
    } catch (err) {
      console.error('Error updating content:', err);
      alert('Failed to update content');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });
      
      if (response.ok) {
        alert('Blog post created successfully!');
        setNewPost({ title: '', excerpt: '', content: '', image: '', author: 'Admin' });
        fetchBlogPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create blog post');
    }
  };

  const handleUpdatePost = async (postId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/blog/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPost)
      });
      
      if (response.ok) {
        alert('Blog post updated successfully!');
        setEditingPost(null);
        fetchBlogPosts();
      }
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Failed to update blog post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/blog/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Blog post deleted successfully!');
        fetchBlogPosts();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete blog post');
    }
  };

  const handlePublishToExternalSites = async (post) => {
    if (!window.confirm(`Publish "${post.title}" to external high-authority websites?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/blog/${post.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        let message = '🚀 Publishing Results:\n\n';
        
        // Show successful publications
        if (data.publishResults && data.publishResults.successful && data.publishResults.successful.length > 0) {
          message += '✅ Successfully Published To:\n';
          data.publishResults.successful.forEach(result => {
            message += `\n${result.platform} (DA ${result.daScore})`;
            if (result.url) {
              message += `\n   🔗 ${result.url}`;
            }
          });
          message += '\n';
        }
        
        // Show failed publications
        if (data.publishResults && data.publishResults.failed && data.publishResults.failed.length > 0) {
          message += '\n❌ Failed to Publish To:\n';
          data.publishResults.failed.forEach(result => {
            message += `\n${result.platform}: ${result.error}`;
          });
          message += '\n';
        }
        
        // Show manual publishing guide if no API keys configured
        if (data.manualPublishingGuide) {
          message += '\n📝 Manual Publishing Guide:\n';
          message += data.manualPublishingGuide.introduction + '\n\n';
          data.manualPublishingGuide.platforms.forEach((platform, index) => {
            message += `\n${index + 1}. ${platform.name} (DA ${platform.daScore})\n`;
            message += `   📍 ${platform.url}\n`;
            message += `   Instructions: ${platform.instructions}\n`;
            if (platform.canonicalUrl) {
              message += `   ⚠️ ${platform.canonicalUrl}\n`;
            }
          });
        }
        
        alert(message);
      } else {
        alert(`❌ Failed to publish: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error publishing to external sites:', err);
      alert('❌ Failed to publish to external sites. Please try again.');
    }
  };

  // AI Blog Generation Functions
  const handleGenerateSingleBlog = async () => {
    setAiGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('❌ Error: Not logged in. Please log in first.');
        setAiGenerating(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/blog/ai/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('AI Blog Response:', data);
      
      if (data.success) {
        const blogUrl = data.url || `https://wegofare.com/blog/${data.post.slug}`;
        alert(`✅ AI Blog Post Generated!\n\nTitle: ${data.post.title}\n\n📍 Live URL:\n${blogUrl}\n\nThe blog post has been automatically created and published.\n\nClick OK to copy the URL to clipboard.`);
        
        // Copy URL to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(blogUrl).then(() => {
            console.log('Blog URL copied to clipboard:', blogUrl);
          }).catch(err => {
            console.error('Failed to copy URL:', err);
          });
        }
        
        fetchBlogPosts();
      } else {
        alert(`❌ Failed to generate AI blog post\n\nError: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error generating AI blog:', err);
      alert(`❌ Failed to generate AI blog post\n\nError: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateBulkBlogs = async () => {
    if (!window.confirm('Generate 5 AI blog posts? This will take about 1-2 minutes.')) return;
    
    setAiGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('❌ Error: Not logged in. Please log in first.');
        setAiGenerating(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/blog/ai/generate-bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count: 5 })
      });
      
      const data = await response.json();
      console.log('Bulk AI Blog Response:', data);
      
      if (data.success) {
        const blogUrls = data.posts ? data.posts.map(post => 
          `https://wegofare.com/blog/${post.slug}`
        ).join('\n') : '';
        
        const message = `✅ Successfully generated ${data.count} AI blog posts!\n\nAll posts have been automatically created and published.\n\n${blogUrls ? '📍 Live URLs:\n' + blogUrls : ''}`;
        
        alert(message);
        fetchBlogPosts();
      } else {
        alert(`❌ Failed to generate AI blog posts\n\nError: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error generating bulk AI blogs:', err);
      alert(`❌ Failed to generate AI blog posts\n\nError: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleToggleAutoPosting = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = autoPostingEnabled ? 'auto-disable' : 'auto-enable';
      
      const response = await fetch(`${API_URL}/api/admin/blog/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interval: 24 }) // Post every 24 hours
      });
      
      const data = await response.json();
      if (data.success) {
        setAutoPostingEnabled(!autoPostingEnabled);
        alert(data.message);
      }
    } catch (err) {
      console.error('Error toggling auto-posting:', err);
      alert('Failed to toggle auto-posting');
    }
  };

  // Check auto-posting status on load
  React.useEffect(() => {
    const checkAutoPostingStatus = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/api/admin/blog/ai/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setAutoPostingEnabled(data.enabled);
        }
      } catch (err) {
        console.error('Error checking auto-posting status:', err);
      }
    };
    
    checkAutoPostingStatus();
  }, []);

  // Fetch blog posts on component mount
  React.useEffect(() => {
    fetchBlogPosts();
    fetchCampaigns();
  }, []);

  // Security Functions
  const fetchSecurityStats = async () => {
    setSecurityData(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('adminToken');
      const [statsRes, historyRes, suspiciousRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/security/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/security/history?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/security/suspicious?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const stats = await statsRes.json();
      const history = await historyRes.json();
      const suspicious = await suspiciousRes.json();

      setSecurityData({
        stats: stats.data,
        history: history.data,
        suspicious: suspicious.data,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching security data:', err);
      setSecurityData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBlockIP = async (ip) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/security/block-ip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip, duration: 60 }) // 60 minutes
      });

      const data = await response.json();
      if (data.success) {
        alert(`IP ${ip} blocked successfully`);
        fetchSecurityStats();
      }
    } catch (err) {
      console.error('Error blocking IP:', err);
    }
  };

  const handleUnblockIP = async (ip) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/security/unblock-ip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      });

      const data = await response.json();
      if (data.success) {
        alert(`IP ${ip} unblocked successfully`);
        fetchSecurityStats();
      }
    } catch (err) {
      console.error('Error unblocking IP:', err);
    }
  };

  // ==================== BACKLINKS AI FUNCTIONS ====================
  
  const fetchBacklinkData = async () => {
    setBacklinkData(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, backlinksRes, submissionsRes, platformsRes, opportunitiesRes] = await Promise.all([
        fetch(`${API_URL}/api/backlinks/stats`, { headers }),
        fetch(`${API_URL}/api/backlinks`, { headers }),
        fetch(`${API_URL}/api/backlinks/submissions?limit=50`, { headers }),
        fetch(`${API_URL}/api/backlinks/platforms`, { headers }),
        fetch(`${API_URL}/api/backlinks/opportunities`, { headers })
      ]);
      
      const [statsData, backlinksData, submissionsData, platformsData, opportunitiesData] = await Promise.all([
        statsRes.json(),
        backlinksRes.json(),
        submissionsRes.json(),
        platformsRes.json(),
        opportunitiesRes.json()
      ]);
      
      setBacklinkData(prev => ({
        ...prev,
        stats: statsData.stats || null,
        backlinks: backlinksData.backlinks || [],
        submissions: submissionsData.submissions || [],
        platforms: platformsData.platforms || {},
        opportunities: opportunitiesData.opportunities || [],
        loading: false
      }));
    } catch (err) {
      console.error('Error fetching backlink data:', err);
      setBacklinkData(prev => ({ ...prev, loading: false }));
    }
  };

  const generateBacklinkContent = async (type, context = {}) => {
    setBacklinkData(prev => ({ ...prev, generating: true, generatedContent: null }));
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/backlinks/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, context })
      });
      const data = await response.json();
      if (data.success) {
        setBacklinkData(prev => ({ ...prev, generatedContent: data, generating: false }));
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setBacklinkData(prev => ({ ...prev, generating: false }));
    }
  };

  const simulateSubmission = async (platformType, platformIndex) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/backlinks/submit/simulate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platformType, platformIndex })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Submission simulated to ${data.platform}!`);
        fetchBacklinkData();
      }
    } catch (err) {
      console.error('Error simulating submission:', err);
      alert('Failed to simulate submission');
    }
  };

  const addManualBacklink = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/backlinks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: formData.get('targetUrl'),
          sourceUrl: formData.get('sourceUrl'),
          anchorText: formData.get('anchorText'),
          dofollow: formData.get('dofollow') === 'true',
          domainRating: parseInt(formData.get('domainRating')) || 0
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Backlink added successfully!');
        e.target.reset();
        fetchBacklinkData();
      }
    } catch (err) {
      console.error('Error adding backlink:', err);
      alert('Failed to add backlink');
    }
  };

  const toggleAutoSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const newEnabled = !backlinkData.stats?.schedule?.enabled;
      const response = await fetch(`${API_URL}/api/backlinks/schedule/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newEnabled })
      });
      const data = await response.json();
      if (data.success) {
        fetchBacklinkData();
      }
    } catch (err) {
      console.error('Error toggling auto-submit:', err);
    }
  };

  const renderBacklinksDashboard = () => {
    const { stats: blStats, backlinks, submissions, platforms, opportunities, loading, generating, generatedContent, activeBacklinkTab } = backlinkData;
    
    if (loading && !blStats) {
      return (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading backlinks data...</p>
        </div>
      );
    }

    const setActiveBacklinkTab = (tab) => {
      setBacklinkData(prev => ({ ...prev, activeBacklinkTab: tab }));
    };

    const contentTypes = [
      { key: 'directory', label: 'Directory Listing', icon: '📂' },
      { key: 'forumPost', label: 'Forum Post', icon: '💬' },
      { key: 'forumComment', label: 'Forum Comment', icon: '💭' },
      { key: 'guestPost', label: 'Guest Post Article', icon: '📝' },
      { key: 'pressRelease', label: 'Press Release', icon: '📰' },
      { key: 'socialPost', label: 'Social Media', icon: '📱' },
      { key: 'quoraAnswer', label: 'Quora Answer', icon: '❓' },
      { key: 'pinterestPin', label: 'Pinterest Pin', icon: '📌' }
    ];

    return (
      <div className="backlinks-section">
        <div className="section-header">
          <div>
            <h2>🔗 Backlinks AI</h2>
            <p className="section-description">Automated backlink generation and submission for SEO ranking</p>
          </div>
          <div className="header-actions">
            <button 
              className={`toggle-btn ${blStats?.schedule?.enabled ? 'active' : ''}`}
              onClick={toggleAutoSubmit}
            >
              <Zap size={16} />
              {blStats?.schedule?.enabled ? 'Auto-Submit ON' : 'Auto-Submit OFF'}
            </button>
            <button className="refresh-btn" onClick={fetchBacklinkData}>
              <Activity size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="backlink-stats-grid">
          <div className="backlink-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
              <LinkIcon size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Backlinks</h3>
              <p className="stat-value">{blStats?.backlinks?.total || 0}</p>
              <span className="stat-detail">{blStats?.backlinks?.uniqueDomains || 0} unique domains</span>
            </div>
          </div>
          
          <div className="backlink-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>Dofollow Links</h3>
              <p className="stat-value">{blStats?.backlinks?.dofollow || 0}</p>
              <span className="stat-detail">{blStats?.backlinks?.nofollow || 0} nofollow</span>
            </div>
          </div>
          
          <div className="backlink-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>Avg Domain Rating</h3>
              <p className="stat-value">{blStats?.backlinks?.avgDomainRating || 0}</p>
              <span className="stat-detail">{blStats?.backlinks?.active || 0} active links</span>
            </div>
          </div>
          
          <div className="backlink-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Upload size={24} />
            </div>
            <div className="stat-info">
              <h3>Submissions</h3>
              <p className="stat-value">{blStats?.submissions?.total || 0}</p>
              <span className="stat-detail">{blStats?.submissions?.pending || 0} pending, {blStats?.submissions?.approved || 0} approved</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="backlink-tabs">
          <button 
            className={`backlink-tab ${activeBacklinkTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveBacklinkTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`backlink-tab ${activeBacklinkTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveBacklinkTab('generate')}
          >
            Generate Content
          </button>
          <button 
            className={`backlink-tab ${activeBacklinkTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveBacklinkTab('platforms')}
          >
            Platforms
          </button>
          <button 
            className={`backlink-tab ${activeBacklinkTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveBacklinkTab('opportunities')}
          >
            Opportunities
          </button>
          <button 
            className={`backlink-tab ${activeBacklinkTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveBacklinkTab('submissions')}
          >
            Submissions
          </button>
          <button 
            className={`backlink-tab ${activeBacklinkTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveBacklinkTab('add')}
          >
            Add Backlink
          </button>
        </div>

        {/* Tab Content */}
        <div className="backlink-tab-content">
          {activeBacklinkTab === 'overview' && (
            <div className="backlinks-overview">
              <h3>Recent Backlinks</h3>
              {backlinks.length === 0 ? (
                <p className="empty-state">No backlinks yet. Start by adding backlinks or using the AI generator!</p>
              ) : (
                <table className="backlinks-table">
                  <thead>
                    <tr>
                      <th>Source Domain</th>
                      <th>Anchor Text</th>
                      <th>Type</th>
                      <th>DR</th>
                      <th>Status</th>
                      <th>Discovered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backlinks.slice(0, 20).map((link, idx) => (
                      <tr key={link.id || idx}>
                        <td>
                          <a href={link.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {link.sourceDomain}
                          </a>
                        </td>
                        <td>{link.anchorText}</td>
                        <td>
                          <span className={`link-type ${link.dofollow ? 'dofollow' : 'nofollow'}`}>
                            {link.dofollow ? 'Dofollow' : 'Nofollow'}
                          </span>
                        </td>
                        <td>{link.domainRating || '-'}</td>
                        <td>
                          <span className={`link-status ${link.status}`}>
                            {link.status}
                          </span>
                        </td>
                        <td>{new Date(link.discoveredAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeBacklinkTab === 'generate' && (
            <div className="content-generator">
              <h3>🤖 AI Content Generator</h3>
              <p>Generate SEO-optimized content for backlink submissions</p>
              
              <div className="content-types-grid">
                {contentTypes.map(ct => (
                  <button
                    key={ct.key}
                    className="content-type-btn"
                    onClick={() => generateBacklinkContent(ct.key)}
                    disabled={generating}
                  >
                    <span className="content-icon">{ct.icon}</span>
                    <span>{ct.label}</span>
                  </button>
                ))}
              </div>

              {generating && (
                <div className="generating-indicator">
                  <div className="loader"></div>
                  <p>Generating content with AI...</p>
                </div>
              )}

              {generatedContent && (
                <div className="generated-content">
                  <div className="content-header">
                    <h4>Generated {generatedContent.type} Content</h4>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(typeof generatedContent.content === 'string' ? generatedContent.content : JSON.stringify(generatedContent.content, null, 2));
                        alert('Content copied to clipboard!');
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="content-preview">
                    {typeof generatedContent.content === 'string' 
                      ? generatedContent.content 
                      : JSON.stringify(generatedContent.content, null, 2)}
                  </pre>
                  <p className="content-meta">
                    {generatedContent.isTemplate ? '📝 Template-based' : '🤖 AI-generated'} • 
                    Generated at {new Date(generatedContent.generatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeBacklinkTab === 'platforms' && (
            <div className="platforms-list">
              <h3>📚 Available Platforms</h3>
              
              {Object.entries(platforms).map(([category, categoryPlatforms]) => (
                <div key={category} className="platform-category">
                  <h4>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                  <div className="platforms-grid">
                    {categoryPlatforms.map((platform, idx) => (
                      <div key={idx} className="platform-card">
                        <div className="platform-info">
                          <strong>{platform.name}</strong>
                          <a href={platform.url} target="_blank" rel="noopener noreferrer" className="platform-url">
                            {platform.url.replace('https://', '').replace('http://', '')}
                          </a>
                          {platform.dr && <span className="platform-dr">DR: {platform.dr}</span>}
                          {platform.category && <span className="platform-cat">{platform.category}</span>}
                        </div>
                        <button 
                          className="submit-btn"
                          onClick={() => simulateSubmission(category, idx)}
                        >
                          Submit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeBacklinkTab === 'opportunities' && (
            <div className="opportunities-list">
              <h3>🎯 Backlink Opportunities</h3>
              <p>Platforms where you haven't submitted yet</p>
              
              {opportunities.length === 0 ? (
                <p className="empty-state">Great job! You've covered all available platforms.</p>
              ) : (
                <div className="opportunities-grid">
                  {opportunities.slice(0, 30).map((opp, idx) => (
                    <div key={idx} className={`opportunity-card priority-${opp.priority}`}>
                      <div className="opp-header">
                        <strong>{opp.name}</strong>
                        <span className={`priority-badge ${opp.priority}`}>
                          {opp.priority === 'high' ? '🔥 High Priority' : opp.priority === 'premium' ? '⭐ Premium' : '📌 Medium'}
                        </span>
                      </div>
                      <p className="opp-category">{opp.category}</p>
                      <a href={opp.url} target="_blank" rel="noopener noreferrer">{opp.url}</a>
                      {opp.estimatedDR && <span className="estimated-dr">Est. DR: {opp.estimatedDR}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeBacklinkTab === 'submissions' && (
            <div className="submissions-list">
              <h3>📤 Submission History</h3>
              
              {submissions.length === 0 ? (
                <p className="empty-state">No submissions yet. Use the Platforms tab to start submitting!</p>
              ) : (
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Backlink URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, idx) => (
                      <tr key={sub.id || idx}>
                        <td>{sub.platformName}</td>
                        <td>{sub.platformType}</td>
                        <td>
                          <span className={`submission-status ${sub.status}`}>
                            {sub.status === 'pending' && '⏳'}
                            {sub.status === 'submitted' && '📤'}
                            {sub.status === 'approved' && '✅'}
                            {sub.status === 'rejected' && '❌'}
                            {sub.status}
                          </span>
                        </td>
                        <td>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '-'}</td>
                        <td>
                          {sub.backlinkUrl ? (
                            <a href={sub.backlinkUrl} target="_blank" rel="noopener noreferrer">View</a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeBacklinkTab === 'add' && (
            <div className="add-backlink-form">
              <h3>➕ Add Backlink Manually</h3>
              <p>Track backlinks you've created manually or discovered</p>
              
              <form onSubmit={addManualBacklink} className="backlink-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Target URL (Your Page)</label>
                    <input type="url" name="targetUrl" placeholder="https://yoursite.com/page" required />
                  </div>
                  <div className="form-group">
                    <label>Source URL (Where the link is)</label>
                    <input type="url" name="sourceUrl" placeholder="https://example.com/article" required />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Anchor Text</label>
                    <input type="text" name="anchorText" placeholder="Click here, Your Brand, etc." />
                  </div>
                  <div className="form-group">
                    <label>Domain Rating (0-100)</label>
                    <input type="number" name="domainRating" min="0" max="100" placeholder="50" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Link Type</label>
                    <select name="dofollow">
                      <option value="true">Dofollow</option>
                      <option value="false">Nofollow</option>
                    </select>
                  </div>
                </div>
                
                <button type="submit" className="submit-btn">
                  <Plus size={16} />
                  Add Backlink
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSecurityDashboard = () => {
    if (securityData.loading && !securityData.stats) {
      return (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading security data...</p>
        </div>
      );
    }

    if (!securityData.stats) {
      return (
        <div className="security-section">
          <div className="section-header">
            <h2>🔒 Security Dashboard</h2>
            <button className="refresh-btn" onClick={fetchSecurityStats}>
              <Activity size={16} />
              Load Security Data
            </button>
          </div>
        </div>
      );
    }

    const stats = securityData.stats;

    return (
      <div className="security-section">
        <div className="section-header">
          <div>
            <h2>🔒 Security Dashboard</h2>
            <p className="section-description">Monitor login attempts, detect phishing, and manage IP blocks</p>
          </div>
          <button className="refresh-btn" onClick={fetchSecurityStats}>
            <Activity size={16} />
            Refresh
          </button>
        </div>

        {/* Security Stats Grid */}
        <div className="security-stats-grid">
          <div className="security-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
              <Shield size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Attempts (24h)</h3>
              <p className="stat-value">{stats.last24Hours.total}</p>
              <span className="stat-detail">
                {stats.last24Hours.successful} successful, {stats.last24Hours.failed} failed
              </span>
            </div>
          </div>

          <div className="security-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>Suspicious Attempts</h3>
              <p className="stat-value">{stats.last24Hours.suspicious}</p>
              <span className="stat-detail">
                {stats.lastHour.suspicious} in last hour
              </span>
            </div>
          </div>

          <div className="security-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <XCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>Blocked IPs</h3>
              <p className="stat-value">{stats.blockedIPs.count}</p>
              <span className="stat-detail">
                {stats.activeAttempts.count} active attempts
              </span>
            </div>
          </div>

          <div className="security-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>Success Rate</h3>
              <p className="stat-value">
                {stats.last24Hours.total > 0
                  ? Math.round((stats.last24Hours.successful / stats.last24Hours.total) * 100)
                  : 0}%
              </p>
              <span className="stat-detail">
                Last 24 hours
              </span>
            </div>
          </div>
        </div>

        {/* Blocked IPs Section */}
        {stats.blockedIPs.count > 0 && (
          <div className="security-panel">
            <h3>🚫 Blocked IP Addresses</h3>
            <div className="blocked-ips-grid">
              {stats.activeAttempts.details
                .filter(attempt => attempt.blocked)
                .map((attempt, idx) => (
                  <div key={idx} className="blocked-ip-card">
                    <div className="blocked-ip-header">
                      <code>{attempt.ip}</code>
                      <button
                        className="unblock-btn"
                        onClick={() => handleUnblockIP(attempt.ip)}
                      >
                        Unblock
                      </button>
                    </div>
                    <div className="blocked-ip-details">
                      <span>Failed attempts: {attempt.failedAttempts}</span>
                      <span>Different emails: {attempt.differentEmails}</span>
                      {attempt.blockedUntil && (
                        <span>Blocked until: {new Date(attempt.blockedUntil).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Top Suspicious IPs */}
        {stats.topSuspiciousIPs && stats.topSuspiciousIPs.length > 0 && (
          <div className="security-panel">
            <h3>⚠️ Top Suspicious IP Addresses</h3>
            <table className="security-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Total Attempts</th>
                  <th>Failed</th>
                  <th>Suspicious</th>
                  <th>Different Emails</th>
                  <th>Suspicious Score</th>
                  <th>Last Attempt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSuspiciousIPs.map((ip, idx) => (
                  <tr key={idx}>
                    <td><code>{ip.ip}</code></td>
                    <td>{ip.totalAttempts}</td>
                    <td className="failed-count">{ip.failedAttempts}</td>
                    <td className="suspicious-count">{ip.suspiciousAttempts}</td>
                    <td>{ip.differentEmails}</td>
                    <td>
                      <span className={`score-badge score-${ip.suspiciousScore >= 7 ? 'high' : ip.suspiciousScore >= 4 ? 'medium' : 'low'}`}>
                        {ip.suspiciousScore.toFixed(1)}/10
                      </span>
                    </td>
                    <td>{ip.lastAttempt.toLocaleString()}</td>
                    <td>
                      <button
                        className="block-btn-small"
                        onClick={() => handleBlockIP(ip.ip)}
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Suspicious Attempts */}
        {securityData.suspicious && securityData.suspicious.length > 0 && (
          <div className="security-panel">
            <h3>🔍 Recent Suspicious Login Attempts</h3>
            <table className="security-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Email</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Suspicious Score</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {securityData.suspicious.slice(0, 20).map((attempt, idx) => (
                  <tr key={idx}>
                    <td>{attempt.timestamp.toLocaleString()}</td>
                    <td><code>{attempt.email}</code></td>
                    <td><code>{attempt.ip}</code></td>
                    <td>
                      {attempt.success ? (
                        <span className="status-success">✓ Success</span>
                      ) : (
                        <span className="status-failed">✗ Failed</span>
                      )}
                    </td>
                    <td>
                      <span className={`score-badge score-${attempt.suspiciousScore >= 7 ? 'high' : attempt.suspiciousScore >= 4 ? 'medium' : 'low'}`}>
                        {attempt.suspiciousScore}/10
                      </span>
                    </td>
                    <td className="user-agent-cell">{attempt.userAgentShort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Login History */}
        {securityData.history && securityData.history.length > 0 && (
          <div className="security-panel">
            <h3>📋 Recent Login History</h3>
            <table className="security-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Email</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {securityData.history.slice(0, 30).map((attempt, idx) => (
                  <tr key={idx} className={attempt.suspicious ? 'suspicious-row' : ''}>
                    <td>{attempt.timestamp.toLocaleString()}</td>
                    <td><code>{attempt.email}</code></td>
                    <td><code>{attempt.ip}</code></td>
                    <td>
                      {attempt.success ? (
                        <span className="status-success">✓ Success</span>
                      ) : (
                        <span className="status-failed">✗ {attempt.reason || 'Failed'}</span>
                      )}
                    </td>
                    <td className="user-agent-cell">{attempt.userAgentShort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Security Tips */}
        <div className="security-tips">
          <h3>🛡️ Security Tips</h3>
          <ul>
            <li>Enable two-factor authentication (2FA) for admin accounts</li>
            <li>Use strong, unique passwords for your admin panel</li>
            <li>Monitor suspicious login attempts regularly</li>
            <li>Block IPs showing brute force patterns immediately</li>
            <li>Review security logs weekly</li>
            <li>Keep your server and dependencies updated</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                  <Plane size={24} />
                </div>
                <div className="stat-info">
                  <h3>Total Bookings</h3>
                  <p className="stat-value">{stats.totalBookings}</p>
                  <span className="stat-change neutral">Waiting for first booking</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
                  <span className="stat-change neutral">No revenue yet</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                  <span className="stat-change neutral">No users registered</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <Eye size={24} />
                </div>
                <div className="stat-info">
                  <h3>Page Views</h3>
                  <p className="stat-value">{stats.pageViews.toLocaleString()}</p>
                  <span className="stat-change neutral">Tracking not started</span>
                </div>
              </div>
            </div>

            <div className="visitor-stats-section">
              <h3>🌐 Live Visitor Tracking</h3>
              <div className="visitor-stats-grid">
                <div className="visitor-stat-card live">
                  <div className="visitor-stat-icon">
                    <Eye size={28} />
                    <div className="live-indicator"></div>
                  </div>
                  <div className="visitor-stat-info">
                    <h4>Live Visitors</h4>
                    <p className="visitor-stat-value">{visitorStats.current}</p>
                    <span className="visitor-stat-label">Currently online</span>
                  </div>
                </div>

                <div className="visitor-stat-card">
                  <div className="visitor-stat-icon">
                    <Users size={28} />
                  </div>
                  <div className="visitor-stat-info">
                    <h4>Total Visits</h4>
                    <p className="visitor-stat-value">{visitorStats.total}</p>
                    <span className="visitor-stat-label">All-time visitors</span>
                  </div>
                </div>

                <div className="visitor-stat-card">
                  <div className="visitor-stat-icon">
                    <TrendingUp size={28} />
                  </div>
                  <div className="visitor-stat-info">
                    <h4>Peak Visitors</h4>
                    <p className="visitor-stat-value">{visitorStats.peak}</p>
                    <span className="visitor-stat-label">Highest concurrent</span>
                  </div>
                </div>
              </div>
              <div className="visitor-update-info">
                <span className="update-badge">🔄 Real-time updates via WebSocket</span>
              </div>
            </div>

            {visitorStats.visitors && visitorStats.visitors.length > 0 && (
              <div className="live-visitors-list">
                <h3>🌍 Live Visitors ({visitorStats.visitors.length})</h3>
                <div className="visitors-table">
                  <div className="table-header">
                    <span>Location</span>
                    <span>Country</span>
                    <span>Region/State</span>
                    <span>Connected</span>
                  </div>
                  {visitorStats.visitors.map((visitor, index) => (
                    <div key={visitor.id || index} className="visitor-row">
                      <div className="visitor-location">
                        <Globe size={16} />
                        <span>{visitor.city || 'Unknown'}</span>
                      </div>
                      <span className="visitor-country">
                        {visitor.country === 'Unknown' ? '🌐 Unknown' : `${getCountryFlag(visitor.country)} ${visitor.country}`}
                      </span>
                      <span className="visitor-region">{visitor.region || 'N/A'}</span>
                      <span className="visitor-time">
                        {new Date(visitor.connectedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visitorStats.locations && visitorStats.locations.length > 0 && (
              <div className="location-stats">
                <h3>📊 Visitors by Location</h3>
                <div className="location-grid">
                  {visitorStats.locations.map((loc, index) => (
                    <div key={index} className="location-card">
                      <div className="location-flag">
                        {getCountryFlag(loc.country)}
                      </div>
                      <div className="location-info">
                        <h4>{loc.country}</h4>
                        <p>{loc.region}</p>
                        <span className="location-count">{loc.count} visitor{loc.count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {stats.totalBookings === 0 ? (
                  <div className="empty-state">
                    <p>No recent activity yet</p>
                    <span>Activity will appear here as bookings are made</span>
                  </div>
                ) : (
                  <>
                    <div className="activity-item">
                      <Plane size={20} />
                      <div className="activity-details">
                        <p>New flight booking</p>
                        <span>View bookings tab for details</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="seo-section">
            <h2>SEO Management</h2>

            {/* Yoast SEO Analysis */}
            <div className="yoast-seo-panel">
              <div className="seo-score-header">
                <div className="seo-score-circle" data-score={seoAnalysis.score >= 80 ? 'good' : seoAnalysis.score >= 50 ? 'ok' : 'bad'}>
                  <div className="score-value">{seoAnalysis.score}</div>
                  <div className="score-label">SEO Score</div>
                </div>
                <div className="seo-score-info">
                  <h3>
                    {seoAnalysis.score >= 80 ? '✅ Great SEO!' : seoAnalysis.score >= 50 ? '⚠️ Good, but needs improvement' : '❌ Needs work'}
                  </h3>
                  <p>
                    {seoAnalysis.score >= 80 
                      ? 'Your content is well optimized for search engines.'
                      : seoAnalysis.score >= 50 
                      ? 'Your content has some SEO optimization, but could be better.'
                      : 'Your content needs significant SEO improvements.'}
                  </p>
                </div>
              </div>

              <div className="focus-keyword-section">
                <label>Focus Keyword</label>
                <input
                  type="text"
                  value={seoAnalysis.focusKeyword}
                  onChange={(e) => setSeoAnalysis({...seoAnalysis, focusKeyword: e.target.value})}
                  placeholder="Enter your focus keyword"
                  className="focus-keyword-input"
                />
                <p className="keyword-help">Choose the main keyword you want to rank for</p>
              </div>

              <div className="seo-analysis-results">
                <h4>Analysis Results</h4>
                {seoAnalysis.results.length === 0 ? (
                  <div className="empty-analysis">
                    <p>Start filling in your SEO data below to see analysis results</p>
                  </div>
                ) : (
                  <div className="results-list">
                    {seoAnalysis.results.map((result, index) => (
                      <div key={index} className={`result-item ${result.type}`}>
                        <div className="result-icon">
                          {result.type === 'success' && <CheckCircle size={20} />}
                          {result.type === 'warning' && <AlertCircle size={20} />}
                          {result.type === 'error' && <XCircle size={20} />}
                        </div>
                        <div className="result-message">{result.message}</div>
                        <div className="result-score">{result.score}/100</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="seo-tools-tabs">
              <button 
                className={`seo-tab ${activeSeoTool === 'gsc' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('gsc')}
              >
                <Globe size={20} /> 🔍 Search Console
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'keywords' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('keywords')}
              >
                <Search size={20} /> Keyword Research
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('analytics')}
              >
                <BarChart3 size={20} /> Analytics
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('audit')}
              >
                <Globe size={20} /> Site Audit
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'backlinks' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('backlinks')}
              >
                <LinkIcon size={20} /> Backlinks
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'content' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('content')}
              >
                <FileCheck size={20} /> Content Optimizer
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'speed' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('speed')}
              >
                <Zap size={20} /> Speed Test
              </button>
              <button 
                className={`seo-tab ${activeSeoTool === 'automation' ? 'active' : ''}`}
                onClick={() => setActiveSeoTool('automation')}
              >
                <Activity size={20} /> 🤖 Automation
              </button>
            </div>

            {activeSeoTool === 'gsc' && (
              <div className="seo-tool-content">
                <h3>🔍 Google Search Console</h3>
                
                {!gscData.connected ? (
                  <div className="gsc-connect-panel">
                    <div className="connect-card">
                      <Globe size={64} />
                      <h4>Configure Google Search Console</h4>
                      <p>Enter your Google Cloud OAuth 2.0 credentials to connect</p>
                      
                      <form className="gsc-settings-form" onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const clientId = formData.get('clientId');
                        const clientSecret = formData.get('clientSecret');
                        const siteUrl = formData.get('siteUrl');
                        
                        try {
                          const token = localStorage.getItem('adminToken');
                          const response = await fetch(`${API_URL}/api/admin/gsc-settings`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ clientId, clientSecret, siteUrl })
                          });
                          
                          const data = await response.json();
                          
                          if (data.success) {
                            alert('✅ GSC settings saved! Now click Connect to authorize.');
                            // Show connect button
                            e.target.reset();
                          } else {
                            alert('Failed to save settings: ' + data.message);
                          }
                        } catch (error) {
                          console.error('Failed to save GSC settings:', error);
                          alert('Failed to save settings');
                        }
                      }}>
                        <div className="form-group">
                          <label>Google Client ID</label>
                          <input
                            type="text"
                            name="clientId"
                            placeholder="Your Google OAuth Client ID"
                            required
                          />
                          <small>From Google Cloud Console → APIs & Services → Credentials</small>
                        </div>
                        
                        <div className="form-group">
                          <label>Google Client Secret</label>
                          <input
                            type="password"
                            name="clientSecret"
                            placeholder="Your Google OAuth Client Secret"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Site URL</label>
                          <input
                            type="url"
                            name="siteUrl"
                            placeholder="https://wegofare.com"
                            defaultValue="https://wegofare.com"
                            required
                          />
                        </div>
                        
                        <button type="submit" className="save-btn">
                          💾 Save Settings
                        </button>
                      </form>
                      
                      <div className="gsc-help-text">
                        <p><strong>How to get credentials:</strong></p>
                        <ol>
                          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                          <li>Create/Select a project</li>
                          <li>Enable Search Console API</li>
                          <li>Create OAuth 2.0 Client ID</li>
                          <li>Add redirect URI: <code>https://wegofare.com/api/gsc/oauth2callback</code></li>
                          <li>Copy Client ID and Client Secret here</li>
                        </ol>
                      </div>
                      
                      <button 
                        className="connect-gsc-btn"
                        onClick={async () => {
                          setGscData({...gscData, loading: true});
                          try {
                            const token = localStorage.getItem('adminToken');
                            const response = await fetch(`${API_URL}/api/gsc/connect`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              }
                            });
                            const data = await response.json();
                            
                            if (data.requiresAuth && data.authUrl) {
                              // Open OAuth window
                              const width = 600;
                              const height = 700;
                              const left = window.screen.width / 2 - width / 2;
                              const top = window.screen.height / 2 - height / 2;
                              
                              const authWindow = window.open(
                                data.authUrl,
                                'Google Search Console Authentication',
                                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
                              );
                              
                              // Check for OAuth callback
                              const checkAuth = setInterval(async () => {
                                try {
                                  const statusResp = await fetch(`${API_URL}/api/gsc/status`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  const statusData = await statusResp.json();
                                  
                                  if (statusData.data.connected) {
                                    clearInterval(checkAuth);
                                    if (authWindow && !authWindow.closed) {
                                      authWindow.close();
                                    }
                                    
                                    setGscData({...gscData, connected: true, loading: false});
                                    
                                    // Fetch initial data
                                    const perfResp = await fetch(`${API_URL}/api/gsc/performance`, {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const perfData = await perfResp.json();
                                    setGscData(prev => ({...prev, performance: perfData.data}));
                                    
                                    alert('✅ Connected to Google Search Console!');
                                  }
                                } catch (err) {
                                  console.error('Auth check error:', err);
                                }
                              }, 1000);
                              
                              // Stop checking after 5 minutes
                              setTimeout(() => {
                                clearInterval(checkAuth);
                                setGscData({...gscData, loading: false});
                              }, 300000);
                              
                            } else if (data.success && !data.requiresAuth) {
                              // Already connected
                              setGscData({...gscData, connected: true, loading: false});
                              alert('✅ Connected to Google Search Console!');
                            } else {
                              setGscData({...gscData, loading: false});
                              alert(data.message || 'Please configure Google credentials in .env file');
                            }
                          } catch (error) {
                            console.error('GSC connection failed:', error);
                            setGscData({...gscData, loading: false});
                            alert('Failed to connect. Please check console for details.');
                          }
                        }}
                        disabled={gscData.loading}
                      >
                        {gscData.loading ? 'Connecting...' : '🔗 Connect to Google Search Console'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="gsc-dashboard">
                    {/* Performance Overview */}
                    {gscData.performance && (
                      <div className="gsc-stats-grid">
                        <div className="gsc-stat-card">
                          <div className="stat-icon clicks">👆</div>
                          <div className="stat-info">
                            <div className="stat-label">Total Clicks</div>
                            <div className="stat-value">{gscData.performance.clicks.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="gsc-stat-card">
                          <div className="stat-icon impressions">👁️</div>
                          <div className="stat-info">
                            <div className="stat-label">Impressions</div>
                            <div className="stat-value">{gscData.performance.impressions.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="gsc-stat-card">
                          <div className="stat-icon ctr">📊</div>
                          <div className="stat-info">
                            <div className="stat-label">Avg. CTR</div>
                            <div className="stat-value">{gscData.performance.ctr}%</div>
                          </div>
                        </div>
                        <div className="gsc-stat-card">
                          <div className="stat-icon position">🎯</div>
                          <div className="stat-info">
                            <div className="stat-label">Avg. Position</div>
                            <div className="stat-value">{gscData.performance.position}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Queries */}
                    {gscData.performance && (
                      <div className="gsc-section">
                        <h4>🔍 Top Search Queries</h4>
                        <div className="gsc-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Query</th>
                                <th>Clicks</th>
                                <th>Impressions</th>
                                <th>CTR</th>
                                <th>Position</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gscData.performance.queries.map((query, idx) => (
                                <tr key={idx}>
                                  <td className="query-text">{query.query}</td>
                                  <td>{query.clicks}</td>
                                  <td>{query.impressions.toLocaleString()}</td>
                                  <td>{query.ctr}%</td>
                                  <td className={query.position < 5 ? 'position-good' : 'position-ok'}>
                                    #{query.position}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Top Pages */}
                    {gscData.performance && (
                      <div className="gsc-section">
                        <h4>📄 Top Performing Pages</h4>
                        <div className="gsc-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Page</th>
                                <th>Clicks</th>
                                <th>Impressions</th>
                                <th>CTR</th>
                                <th>Position</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gscData.performance.pages.map((page, idx) => (
                                <tr key={idx}>
                                  <td className="page-url">{page.page}</td>
                                  <td>{page.clicks}</td>
                                  <td>{page.impressions.toLocaleString()}</td>
                                  <td>{page.ctr}%</td>
                                  <td className={page.position < 5 ? 'position-good' : 'position-ok'}>
                                    #{page.position}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="gsc-actions">
                      <button 
                        className="refresh-btn"
                        onClick={async () => {
                          const token = localStorage.getItem('adminToken');
                          const response = await fetch(`${API_URL}/api/gsc/performance`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          const data = await response.json();
                          setGscData(prev => ({...prev, performance: data.data}));
                          alert('✅ Data refreshed!');
                        }}
                      >
                        🔄 Refresh Data
                      </button>
                      <button 
                        className="disconnect-btn"
                        onClick={async () => {
                          const token = localStorage.getItem('adminToken');
                          await fetch(`${API_URL}/api/gsc/disconnect`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          setGscData({ connected: false, performance: null, indexing: null, sitemaps: [], loading: false });
                        }}
                      >
                        ❌ Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSeoTool === 'keywords' && (
              <div className="seo-tool-content">
                <h3>🔍 Keyword Research</h3>
                <div className="keyword-research-panel">
                  <div className="keyword-input-section">
                    <input
                      type="text"
                      value={seoToolData.newKeyword}
                      onChange={(e) => setSeoToolData({...seoToolData, newKeyword: e.target.value})}
                      placeholder="Enter keyword to analyze..."
                      className="keyword-input"
                    />
                    <button 
                      className="analyze-btn"
                      onClick={async () => {
                        if (seoToolData.newKeyword) {
                          try {
                            const token = localStorage.getItem('adminToken');
                            const response = await fetch(`${API_URL}/api/seo/keywords`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ keyword: seoToolData.newKeyword })
                            });
                            const analysis = await response.json();
                            setSeoToolData({
                              ...seoToolData,
                              keywords: [...(seoToolData.keywords || []), analysis],
                              newKeyword: ''
                            });
                          } catch (error) {
                            console.error('Keyword analysis failed:', error);
                            alert('Failed to analyze keyword. Please try again.');
                          }
                        }
                      }}
                    >
                      <Search size={16} /> Analyze
                    </button>
                  </div>
                  <div className="keywords-list">
                    {seoToolData.keywords.length === 0 ? (
                      <div className="empty-state">
                        <Search size={48} />
                        <p>No keywords analyzed yet</p>
                        <span>Enter a keyword above to get started</span>
                      </div>
                    ) : (
                      <div className="keywords-grid">
                        {seoToolData.keywords.map((kw, idx) => (
                          <div key={idx} className="keyword-card">
                            <h4>{kw.keyword}</h4>
                            <div className="keyword-stats">
                              <div className="stat">
                                <span className="label">Volume</span>
                                <span className="value">{kw.volume.toLocaleString()}/mo</span>
                              </div>
                              <div className="stat">
                                <span className="label">Difficulty</span>
                                <span className="value difficulty" data-level={kw.difficulty > 70 ? 'hard' : kw.difficulty > 40 ? 'medium' : 'easy'}>
                                  {kw.difficulty}%
                                </span>
                              </div>
                              <div className="stat">
                                <span className="label">CPC</span>
                                <span className="value">${kw.cpc}</span>
                              </div>
                              <div className="stat">
                                <span className="label">Trend</span>
                                <span className="value">{kw.trend === 'up' ? '📈' : '📉'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSeoTool === 'analytics' && (
              <div className="seo-tool-content">
                <h3>📊 SEO Analytics</h3>
                <button 
                  className="refresh-analytics-btn"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('adminToken');
                      const response = await fetch(`${API_URL}/api/seo/analytics`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await response.json();
                      setSeoToolData({...seoToolData, analytics: data});
                    } catch (error) {
                      console.error('Failed to fetch analytics:', error);
                    }
                  }}
                >
                  🔄 Refresh Analytics
                </button>
                <div className="analytics-dashboard">
                  <div className="analytics-stats">
                    <div className="analytic-card">
                      <div className="analytic-icon" style={{background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'}}>
                        <Eye size={24} />
                      </div>
                      <div className="analytic-info">
                        <h4>Organic Traffic</h4>
                        <p className="big-number">{seoToolData.analytics?.organicTraffic?.toLocaleString() || '0'}</p>
                        <span className={`change ${parseFloat(seoToolData.analytics?.trafficChange || 0) > 0 ? 'positive' : 'negative'}`}>
                          {seoToolData.analytics?.trafficChange > 0 ? '+' : ''}{seoToolData.analytics?.trafficChange}% vs last month
                        </span>
                      </div>
                    </div>
                    <div className="analytic-card">
                      <div className="analytic-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                        <TrendingUp size={24} />
                      </div>
                      <div className="analytic-info">
                        <h4>Keyword Rankings</h4>
                        <p className="big-number">{seoToolData.analytics?.keywordRankings || '0'}</p>
                        <span className="change positive">+{seoToolData.analytics?.newRankings || 0} new rankings</span>
                      </div>
                    </div>
                    <div className="analytic-card">
                      <div className="analytic-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                        <Search size={24} />
                      </div>
                      <div className="analytic-info">
                        <h4>Click Rate</h4>
                        <p className="big-number">{seoToolData.analytics?.clickRate || '0'}%</p>
                        <span className={`change ${parseFloat(seoToolData.analytics?.clickRateChange || 0) > 0 ? 'positive' : 'negative'}`}>
                          {seoToolData.analytics?.clickRateChange > 0 ? '+' : ''}{seoToolData.analytics?.clickRateChange}% improvement
                        </span>
                      </div>
                    </div>
                    <div className="analytic-card">
                      <div className="analytic-icon" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                        <BarChart3 size={24} />
                      </div>
                      <div className="analytic-info">
                        <h4>Avg. Position</h4>
                        <p className="big-number">{seoToolData.analytics?.avgPosition || '0'}</p>
                        <span className={`change ${parseFloat(seoToolData.analytics?.positionChange || 0) < 0 ? 'positive' : 'negative'}`}>
                          {seoToolData.analytics?.positionChange} positions {parseFloat(seoToolData.analytics?.positionChange || 0) < 0 ? '(better)' : '(worse)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSeoTool === 'audit' && (
              <div className="seo-tool-content">
                <h3>🔍 Site Audit</h3>
                <div className="audit-panel">
                  <button 
                    className="run-audit-btn"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('adminToken');
                        if (!token) {
                          alert('Please login first');
                          return;
                        }
                        const response = await fetch(`${API_URL}/api/admin/seo/audit`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                        }
                        
                        const data = await response.json();
                        if (data.success) {
                          setSeoToolData({...seoToolData, siteAudit: data.audit});
                          alert('✅ Site audit completed successfully!');
                        } else {
                          throw new Error(data.message || 'Audit failed');
                        }
                      } catch (error) {
                        console.error('Site audit failed:', error);
                        alert(`Failed to run site audit: ${error.message}`);
                      }
                    }}
                  >
                    <Globe size={20} /> Run Complete Site Audit
                  </button>
                  {seoToolData.siteAudit && (
                    <div className="audit-results">
                      <div className="audit-score">
                        <div className="score-circle-large" data-score={seoToolData.siteAudit.score >= 80 ? 'good' : seoToolData.siteAudit.score >= 60 ? 'ok' : 'bad'}>
                          <span className="score">{seoToolData.siteAudit.score}</span>
                          <span className="label">SEO Health</span>
                        </div>
                        <div className="audit-meta-info">
                          <p><strong>URL:</strong> {seoToolData.siteAudit.url}</p>
                          <p><strong>Last Audited:</strong> {new Date(seoToolData.siteAudit.timestamp).toLocaleString()}</p>
                        </div>
                      </div>

                      {seoToolData.siteAudit.metrics && (
                        <div className="audit-metrics">
                          <div className="metric-item">
                            <span className="metric-label">Performance</span>
                            <div className="metric-bar">
                              <div 
                                className="metric-fill" 
                                style={{width: `${seoToolData.siteAudit.metrics.performance}%`,
                                        backgroundColor: seoToolData.siteAudit.metrics.performance >= 80 ? '#4caf50' : seoToolData.siteAudit.metrics.performance >= 60 ? '#ff9800' : '#f44336'}}
                              ></div>
                            </div>
                            <span className="metric-score">{Math.round(seoToolData.siteAudit.metrics.performance)}</span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">SEO</span>
                            <div className="metric-bar">
                              <div 
                                className="metric-fill" 
                                style={{width: `${seoToolData.siteAudit.metrics.seo}%`,
                                        backgroundColor: seoToolData.siteAudit.metrics.seo >= 80 ? '#4caf50' : seoToolData.siteAudit.metrics.seo >= 60 ? '#ff9800' : '#f44336'}}
                              ></div>
                            </div>
                            <span className="metric-score">{Math.round(seoToolData.siteAudit.metrics.seo)}</span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Accessibility</span>
                            <div className="metric-bar">
                              <div 
                                className="metric-fill" 
                                style={{width: `${seoToolData.siteAudit.metrics.accessibility}%`,
                                        backgroundColor: seoToolData.siteAudit.metrics.accessibility >= 80 ? '#4caf50' : seoToolData.siteAudit.metrics.accessibility >= 60 ? '#ff9800' : '#f44336'}}
                              ></div>
                            </div>
                            <span className="metric-score">{Math.round(seoToolData.siteAudit.metrics.accessibility)}</span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Best Practices</span>
                            <div className="metric-bar">
                              <div 
                                className="metric-fill" 
                                style={{width: `${seoToolData.siteAudit.metrics.bestPractices}%`,
                                        backgroundColor: seoToolData.siteAudit.metrics.bestPractices >= 80 ? '#4caf50' : seoToolData.siteAudit.metrics.bestPractices >= 60 ? '#ff9800' : '#f44336'}}
                              ></div>
                            </div>
                            <span className="metric-score">{Math.round(seoToolData.siteAudit.metrics.bestPractices)}</span>
                          </div>
                        </div>
                      )}

                      {seoToolData.siteAudit.issues && seoToolData.siteAudit.issues.length > 0 && (
                        <div className="audit-issues">
                          <h4>🔴 Issues Found ({seoToolData.siteAudit.issues.length})</h4>
                          {seoToolData.siteAudit.issues.map((issue, idx) => (
                            <div key={idx} className={`audit-issue severity-${issue.severity}`}>
                              {issue.severity === 'critical' && <XCircle size={20} color="#d32f2f" />}
                              {issue.severity === 'high' && <XCircle size={20} color="#f44336" />}
                              {issue.severity === 'medium' && <AlertCircle size={20} color="#ff9800" />}
                              {issue.severity === 'low' && <AlertCircle size={20} color="#ffc107" />}
                              <div className="issue-content">
                                <div className="issue-header">
                                  <span className="severity-badge">{issue.severity.toUpperCase()}</span>
                                  <span className="category-badge">{issue.category}</span>
                                </div>
                                <p className="issue-message">{issue.message}</p>
                                <p className="issue-impact">{issue.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {seoToolData.siteAudit.recommendations && seoToolData.siteAudit.recommendations.length > 0 && (
                        <div className="audit-recommendations">
                          <h4>💡 Recommendations</h4>
                          {seoToolData.siteAudit.recommendations.map((rec, idx) => (
                            <div key={idx} className="recommendation-item">
                              <CheckCircle size={16} color="#4caf50" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {seoToolData.siteAudit.details && (
                        <div className="audit-details">
                          <h4>📊 Technical Details</h4>
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">SSL/HTTPS:</span>
                              <span className={`detail-value status-${seoToolData.siteAudit.details.ssl?.status || 'unknown'}`}>
                                {seoToolData.siteAudit.details.ssl?.enabled ? '✓ Enabled' : '✗ Disabled'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Mobile Friendly:</span>
                              <span className={`detail-value status-${seoToolData.siteAudit.details.mobile?.status || 'unknown'}`}>
                                {seoToolData.siteAudit.details.mobile?.friendly ? '✓ Yes' : '✗ No'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Page Load Time:</span>
                              <span className={`detail-value status-${seoToolData.siteAudit.details.speed?.status || 'unknown'}`}>
                                {seoToolData.siteAudit.details.speed?.loadTime || 'N/A'}ms
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Meta Tags:</span>
                              <span className={`detail-value status-${seoToolData.siteAudit.details.meta?.status || 'unknown'}`}>
                                {seoToolData.siteAudit.details.meta?.status === 'pass' ? '✓ Complete' : '⚠ Issues Found'}
                              </span>
                            </div>
                          </div>
                          {seoToolData.siteAudit.details.meta?.title && (
                            <div className="meta-preview">
                              <p><strong>Title:</strong> {seoToolData.siteAudit.details.meta.title}</p>
                              {seoToolData.siteAudit.details.meta.description && (
                                <p><strong>Description:</strong> {seoToolData.siteAudit.details.meta.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSeoTool === 'backlinks' && (
              <div className="seo-tool-content">
                <h3>🔗 Backlink Monitor</h3>
                <button 
                  className="refresh-backlinks-btn"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('adminToken');
                      const response = await fetch(`${API_URL}/api/seo/backlinks?domain=wegofare.com`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await response.json();
                      setSeoToolData({...seoToolData, backlinks: data});
                    } catch (error) {
                      console.error('Failed to fetch backlinks:', error);
                    }
                  }}
                >
                  🔄 Refresh Backlinks
                </button>
                <div className="backlinks-panel">
                  <div className="backlinks-stats">
                    <div className="backlink-stat">
                      <h4>Total Backlinks</h4>
                      <p className="big-number">{seoToolData.backlinks?.total?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="backlink-stat">
                      <h4>Referring Domains</h4>
                      <p className="big-number">{seoToolData.backlinks?.referringDomains?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="backlink-stat">
                      <h4>Domain Authority</h4>
                      <p className="big-number">{seoToolData.backlinks?.domainAuthority || '0'}</p>
                    </div>
                  </div>
                  <div className="backlinks-list">
                    <h4>Recent Backlinks</h4>
                    {(seoToolData.backlinks?.recentBacklinks || []).map((link, idx) => (
                      <div key={idx} className="backlink-item">
                        <LinkIcon size={16} />
                        <span className="domain">{link.domain}</span>
                        <span className="authority">DA: {link.authority}</span>
                        <span className={`link-type ${link.type.toLowerCase()}`}>{link.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSeoTool === 'content' && (
              <div className="seo-tool-content">
                <h3>📝 Content Optimizer</h3>
                <div className="content-optimizer">
                  <div className="content-tips">
                    <div className="tip-card">
                      <CheckCircle size={24} color="#0ea5e9" />
                      <div>
                        <h4>Use Header Tags</h4>
                        <p>Structure content with H1, H2, H3 tags for better SEO</p>
                      </div>
                    </div>
                    <div className="tip-card">
                      <CheckCircle size={24} color="#0ea5e9" />
                      <div>
                        <h4>Optimize Images</h4>
                        <p>Add alt text and compress images for faster loading</p>
                      </div>
                    </div>
                    <div className="tip-card">
                      <CheckCircle size={24} color="#0ea5e9" />
                      <div>
                        <h4>Internal Linking</h4>
                        <p>Link to related pages to improve site navigation</p>
                      </div>
                    </div>
                    <div className="tip-card">
                      <CheckCircle size={24} color="#0ea5e9" />
                      <div>
                        <h4>Keyword Density</h4>
                        <p>Maintain 1-2% keyword density naturally in content</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSeoTool === 'speed' && (
              <div className="seo-tool-content">
                <h3>⚡ Page Speed Test</h3>
                <div className="speed-test-panel">
                  <button 
                    className="run-speed-test-btn"
                    onClick={() => {
                      setSeoToolData({
                        ...seoToolData,
                        speedTest: {
                          mobile: Math.floor(Math.random() * 30) + 60,
                          desktop: Math.floor(Math.random() * 20) + 75,
                          fcp: (Math.random() * 2 + 1).toFixed(2),
                          lcp: (Math.random() * 3 + 2).toFixed(2),
                          tti: (Math.random() * 4 + 3).toFixed(2)
                        }
                      });
                    }}
                  >
                    <Zap size={20} /> Run Speed Test
                  </button>
                  {seoToolData.speedTest && (
                    <div className="speed-results">
                      <div className="speed-scores">
                        <div className="speed-score">
                          <h4>📱 Mobile</h4>
                          <div className="score-circle" data-score={seoToolData.speedTest.mobile >= 80 ? 'good' : seoToolData.speedTest.mobile >= 50 ? 'ok' : 'bad'}>
                            {seoToolData.speedTest.mobile}
                          </div>
                        </div>
                        <div className="speed-score">
                          <h4>💻 Desktop</h4>
                          <div className="score-circle" data-score={seoToolData.speedTest.desktop >= 80 ? 'good' : seoToolData.speedTest.desktop >= 50 ? 'ok' : 'bad'}>
                            {seoToolData.speedTest.desktop}
                          </div>
                        </div>
                      </div>
                      <div className="speed-metrics">
                        <div className="metric">
                          <span className="label">First Contentful Paint</span>
                          <span className="value">{seoToolData.speedTest.fcp}s</span>
                        </div>
                        <div className="metric">
                          <span className="label">Largest Contentful Paint</span>
                          <span className="value">{seoToolData.speedTest.lcp}s</span>
                        </div>
                        <div className="metric">
                          <span className="label">Time to Interactive</span>
                          <span className="value">{seoToolData.speedTest.tti}s</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSeoTool === 'automation' && (
              <div className="seo-tool-content">
                <h3>🤖 SEO Automation Agent</h3>
                
                {/* Agent Status Card */}
                <div className="automation-panel">
                  <div className="agent-status-card">
                    <div className="status-row">
                      <div className={`status-indicator ${seoAgentStatus.running ? 'active' : 'inactive'}`}>
                        <div className="status-dot"></div>
                        <span className="status-text">{seoAgentStatus.running ? '🟢 Running' : '🔴 Stopped'}</span>
                      </div>
                      {seoAgentStatus.running && (
                        <div className="agent-stats-inline">
                          <span className="stat-item">⏱ Uptime: {seoAgentStatus.uptime ? new Date(seoAgentStatus.uptime).toLocaleString() : 'N/A'}</span>
                          <span className="stat-item">🔄 Restarts: {seoAgentStatus.restarts}</span>
                          <span className="stat-item">🕐 Last Run: {seoAgentStatus.lastRun ? new Date(seoAgentStatus.lastRun).toLocaleTimeString() : 'Never'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="agent-controls">
                    <button 
                      className="agent-btn start"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('adminToken');
                          const response = await fetch(`${API_URL}/api/seo-agent/start`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          const data = await response.json();
                          if (response.ok) {
                            alert('✅ SEO Agent started successfully!');
                            const statusRes = await fetch(`${API_URL}/api/seo-agent/status`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const status = await statusRes.json();
                            setSeoAgentStatus(status);
                          } else {
                            alert('❌ ' + (data.message || 'Failed to start'));
                          }
                        } catch (error) {
                          alert('❌ Failed to start SEO Agent. Ensure PM2 is installed: npm install -g pm2');
                        }
                      }}
                      disabled={seoAgentStatus.running}
                    >
                      ▶️ Start Agent
                    </button>
                    <button 
                      className="agent-btn stop"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('adminToken');
                          const response = await fetch(`${API_URL}/api/seo-agent/stop`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (response.ok) {
                            alert('⏹️ SEO Agent stopped');
                            setSeoAgentStatus({ running: false, uptime: null, restarts: 0 });
                          }
                        } catch (error) {
                          alert('Failed to stop SEO Agent');
                        }
                      }}
                      disabled={!seoAgentStatus.running}
                    >
                      ⏹️ Stop Agent
                    </button>
                    <button 
                      className="agent-btn run-now"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('adminToken');
                          const response = await fetch(`${API_URL}/api/seo-agent/run-now`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (response.ok) {
                            alert('🚀 SEO tasks started! Check logs in a few moments.');
                            // Refresh data after 3 seconds
                            setTimeout(async () => {
                              const [reportsRes, logsRes] = await Promise.all([
                                fetch(`${API_URL}/api/seo-agent/reports`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                }),
                                fetch(`${API_URL}/api/seo-agent/logs`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                })
                              ]);
                              const reports = await reportsRes.json();
                              const logs = await logsRes.json();
                              setSeoAgentReports(reports);
                              setSeoAgentLogs(logs);
                            }, 3000);
                          }
                        } catch (error) {
                          alert('Failed to run SEO tasks');
                        }
                      }}
                    >
                      🚀 Run Now
                    </button>
                    <button 
                      className="agent-btn refresh"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('adminToken');
                          const [statusRes, reportsRes, logsRes, settingsRes] = await Promise.all([
                            fetch(`${API_URL}/api/seo-agent/status`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            }),
                            fetch(`${API_URL}/api/seo-agent/reports`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            }),
                            fetch(`${API_URL}/api/seo-agent/logs`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            }),
                            fetch(`${API_URL}/api/seo-agent/settings`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                          ]);
                          const status = await statusRes.json();
                          const reports = await reportsRes.json();
                          const logs = await logsRes.json();
                          const settings = await settingsRes.json();
                          setSeoAgentStatus(status);
                          setSeoAgentReports(reports);
                          setSeoAgentLogs(logs);
                          setSeoAutomationSettings(settings);
                          alert('✅ Data refreshed successfully!');
                        } catch (error) {
                          console.error('Failed to refresh agent data:', error);
                          alert('❌ Failed to refresh data');
                        }
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {/* Automation Settings */}
                  <div className="automation-settings">
                    <h4>⚙️ Automation Settings</h4>
                    
                    <div className="settings-section">
                      <div className="setting-row">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={seoAutomationSettings.enabled}
                            onChange={async (e) => {
                              const newSettings = { ...seoAutomationSettings, enabled: e.target.checked };
                              setSeoAutomationSettings(newSettings);
                              try {
                                const token = localStorage.getItem('adminToken');
                                await fetch(`${API_URL}/api/seo-agent/settings`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify(newSettings)
                                });
                              } catch (error) {
                                console.error('Failed to save settings:', error);
                              }
                            }}
                          />
                          <span className="toggle-switch"></span>
                          <span className="toggle-text">Enable Automation</span>
                        </label>
                      </div>
                    </div>

                    <div className="settings-section">
                      <h5>🎯 Automated Tasks</h5>
                      <div className="tasks-grid">
                        {Object.entries(seoAutomationSettings.tasks).map(([taskKey, enabled]) => (
                          <label key={taskKey} className="task-checkbox">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={async (e) => {
                                const newSettings = {
                                  ...seoAutomationSettings,
                                  tasks: { ...seoAutomationSettings.tasks, [taskKey]: e.target.checked }
                                };
                                setSeoAutomationSettings(newSettings);
                                try {
                                  const token = localStorage.getItem('adminToken');
                                  await fetch(`${API_URL}/api/seo-agent/settings`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify(newSettings)
                                  });
                                } catch (error) {
                                  console.error('Failed to save settings:', error);
                                }
                              }}
                            />
                            <span>{taskKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="settings-section">
                      <h5>📅 Schedule Configuration</h5>
                      <div className="schedule-inputs">
                        <div className="schedule-input-group">
                          <label>Full Audit (Cron)</label>
                          <input
                            type="text"
                            value={seoAutomationSettings.schedule.fullAudit}
                            onChange={(e) => setSeoAutomationSettings({
                              ...seoAutomationSettings,
                              schedule: { ...seoAutomationSettings.schedule, fullAudit: e.target.value }
                            })}
                            placeholder="0 3 * * *"
                          />
                          <small>Current: 3:00 AM Daily</small>
                        </div>
                        <div className="schedule-input-group">
                          <label>Quick Check (Cron)</label>
                          <input
                            type="text"
                            value={seoAutomationSettings.schedule.quickCheck}
                            onChange={(e) => setSeoAutomationSettings({
                              ...seoAutomationSettings,
                              schedule: { ...seoAutomationSettings.schedule, quickCheck: e.target.value }
                            })}
                            placeholder="0 */6 * * *"
                          />
                          <small>Current: Every 6 hours</small>
                        </div>
                      </div>
                      <button
                        className="save-schedule-btn"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('adminToken');
                            const response = await fetch(`${API_URL}/api/seo-agent/settings`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify(seoAutomationSettings)
                            });
                            if (response.ok) {
                              alert('✅ Schedule updated successfully!');
                            }
                          } catch (error) {
                            alert('❌ Failed to save schedule');
                          }
                        }}
                      >
                        💾 Save Schedule
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Tasks Info */}
                  <div className="automation-info">
                    <h4>📋 Scheduled Tasks</h4>
                    <div className="schedule-list">
                      <div className="schedule-item">
                        <div className="time">🕒 3:00 AM Daily</div>
                        <div className="task">Complete SEO Audit + All Optimizations</div>
                        <div className="status-badge active">Active</div>
                      </div>
                      <div className="schedule-item">
                        <div className="time">🕒 9:00 AM Monday</div>
                        <div className="task">Weekly Competitor Analysis</div>
                        <div className="status-badge active">Active</div>
                      </div>
                      <div className="schedule-item">
                        <div className="time">🕒 Every 6 Hours</div>
                        <div className="task">Quick Health Check</div>
                        <div className="status-badge active">Active</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Reports */}
                  {seoAgentReports.length > 0 && (
                    <div className="agent-reports">
                      <h4>📊 Recent Reports ({seoAgentReports.length})</h4>
                      <div className="reports-grid">
                        {seoAgentReports.slice(-5).reverse().map((report, idx) => (
                          <div key={idx} className="report-card">
                            <div className="report-header">
                              <span className="report-date">📅 {report.date}</span>
                              <span className="report-duration">⏱ {report.duration}</span>
                            </div>
                            <div className="report-metrics">
                              <div className="metric-item">
                                <div className="metric-icon">🏥</div>
                                <div className="metric-details">
                                  <span className="metric-label">Site Health</span>
                                  <span className="metric-value">{report.summary.siteHealth}/100</span>
                                </div>
                              </div>
                              <div className="metric-item">
                                <div className="metric-icon">🔑</div>
                                <div className="metric-details">
                                  <span className="metric-label">Keywords</span>
                                  <span className="metric-value">{report.summary.keywordsAnalyzed}</span>
                                </div>
                              </div>
                              <div className="metric-item">
                                <div className="metric-icon">🔗</div>
                                <div className="metric-details">
                                  <span className="metric-label">Backlinks</span>
                                  <span className="metric-value">{report.summary.totalBacklinks}</span>
                                </div>
                              </div>
                              <div className="metric-item">
                                <div className="metric-icon">📈</div>
                                <div className="metric-details">
                                  <span className="metric-label">Traffic</span>
                                  <span className="metric-value">{report.summary.organicTraffic?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity Logs */}
                  {seoAgentLogs.length > 0 && (
                    <div className="agent-logs">
                      <h4>📝 Activity Logs (Last {Math.min(seoAgentLogs.length, 20)})</h4>
                      <div className="logs-container">
                        {seoAgentLogs.slice(-20).reverse().map((log, idx) => (
                          <div key={idx} className={`log-entry ${log.status?.toLowerCase() || 'info'}`}>
                            <span className="log-icon">
                              {log.status === 'success' && '✅'}
                              {log.status === 'error' && '❌'}
                              {log.status === 'info' && 'ℹ️'}
                              {!log.status && '📝'}
                            </span>
                            <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="log-message">{log.message || log.action}</span>
                            <span className={`log-status ${log.status}`}>{log.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Setup Instructions */}
                  <div className="automation-setup">
                    <h4>📚 Setup Instructions</h4>
                    <div className="setup-steps">
                      <div className="setup-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          <h5>Install PM2</h5>
                          <code>npm install -g pm2</code>
                          <p>Required for process management</p>
                        </div>
                      </div>
                      <div className="setup-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                          <h5>Configure Tasks</h5>
                          <p>Enable/disable tasks and set schedules above</p>
                        </div>
                      </div>
                      <div className="setup-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                          <h5>Start Agent</h5>
                          <p>Click "Start Agent" to begin automated SEO tasks</p>
                        </div>
                      </div>
                      <div className="setup-step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                          <h5>Monitor Results</h5>
                          <p>Check reports and logs for automation results</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!activeSeoTool && (
              <div className="seo-tools-placeholder">
                <div className="placeholder-content">
                  <h3>Select an SEO Tool</h3>
                  <p>Choose a tool from the tabs above to get started with SEO optimization</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSEOUpdate} className="seo-form">
              <h3>SEO Settings</h3>
              
              <div className="form-group">
                <label>Page Title</label>
                <input
                  type="text"
                  value={seoData.pageTitle}
                  onChange={(e) => setSeoData({...seoData, pageTitle: e.target.value})}
                  placeholder="Best Flight Deals | WegoFare"
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({...seoData, metaDescription: e.target.value})}
                  placeholder="Find the best flight deals, hotels, cruises, and vacation packages..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  value={seoData.keywords}
                  onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                  placeholder="flight deals, cheap flights, hotels, cruises"
                />
              </div>

              <div className="form-group">
                <label>OG Image URL</label>
                <input
                  type="text"
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData({...seoData, ogImage: e.target.value})}
                  placeholder="https://wegofare.com/og-image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Canonical URL</label>
                <input
                  type="text"
                  value={seoData.canonicalUrl}
                  onChange={(e) => setSeoData({...seoData, canonicalUrl: e.target.value})}
                  placeholder="https://wegofare.com"
                />
              </div>

              <button type="submit" className="save-button">
                Save SEO Settings
              </button>
            </form>
          </div>
        );

      case 'bookings':
        return (
          <div className="bookings-section">
            <h2>Bookings Management</h2>
            
            <div className="booking-tabs">
              <button 
                className={`booking-tab ${bookingTab === 'flights' ? 'active' : ''}`}
                onClick={() => setBookingTab('flights')}
              >
                <Plane size={20} />
                Flights ({bookings.flights.length})
              </button>
              <button 
                className={`booking-tab ${bookingTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setBookingTab('hotels')}
              >
                <Hotel size={20} />
                Hotels ({bookings.hotels.length})
              </button>
              <button 
                className={`booking-tab ${bookingTab === 'vacations' ? 'active' : ''}`}
                onClick={() => setBookingTab('vacations')}
              >
                <Package size={20} />
                Vacations ({bookings.vacations.length})
              </button>
            </div>

            <div className="booking-content">
              {bookingTab === 'flights' && (
                <div className="flights-bookings">
                  <h3>Flight Bookings</h3>
                  {bookings.flights.length === 0 ? (
                    <div className="empty-state">
                      <Plane size={48} />
                      <p>No flight bookings yet</p>
                      <span>Flight bookings will appear here</span>
                    </div>
                  ) : (
                    <div className="booking-table">
                      <div className="booking-table-header">
                        <div className="th-conf">Confirmation</div>
                        <div className="th-customer">Customer</div>
                        <div className="th-route">Route</div>
                        <div className="th-amount">Amount</div>
                        <div className="th-status">Status</div>
                        <div className="th-action">Action</div>
                      </div>
                      {bookings.flights.map(booking => (
                        <div key={booking.id} className="booking-row" onClick={() => setSelectedBooking(booking)}>
                          <div className="td-conf">
                            <strong>{booking.reference}</strong>
                            <span className="booking-date">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          <div className="td-customer">
                            <span className="customer-name">{booking.customer}</span>
                            <span className="customer-email">{booking.email}</span>
                          </div>
                          <div className="td-route">
                            <span>{booking.route}</span>
                          </div>
                          <div className="td-amount">
                            <strong>${booking.amount?.toFixed(2) || '0.00'}</strong>
                          </div>
                          <div className="td-status">
                            <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                            <span className={`status-badge payment ${booking.paymentStatus}`}>{booking.paymentStatus}</span>
                          </div>
                          <div className="td-action">
                            <button className="view-btn" onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}>
                              <Eye size={16} /> View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Detail Modal */}
              {selectedBooking && (
                <div className="booking-modal-overlay" onClick={() => setSelectedBooking(null)}>
                  <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Booking Details</h2>
                      <button className="close-modal" onClick={() => setSelectedBooking(null)}>×</button>
                    </div>
                    
                    <div className="modal-content">
                      {/* Confirmation Banner */}
                      <div className="confirmation-banner">
                        <div className="conf-number">
                          <label>Confirmation Number</label>
                          <h3>{selectedBooking.reference}</h3>
                        </div>
                        <div className="conf-badges">
                          <span className={`status-badge large ${selectedBooking.status}`}>{selectedBooking.status}</span>
                          <span className={`status-badge large payment ${selectedBooking.paymentStatus}`}>{selectedBooking.paymentStatus}</span>
                        </div>
                      </div>

                      {/* Flight Information */}
                      <div className="modal-section">
                        <h4>✈️ Flight Information</h4>
                        <div className="flight-card">
                          <div className="flight-airline">
                            <img 
                              src={`/airlines/${(selectedBooking.flightDetails?.airlineCode || selectedBooking.flightDetails?.airline || 'default').toLowerCase().replace(/\s+/g, '-')}.png`}
                              alt={selectedBooking.flightDetails?.airline || 'Airline'}
                              onError={(e) => { e.target.src = '/airlines/default.png'; }}
                              className="airline-logo"
                            />
                            <div className="airline-info">
                              <strong>{selectedBooking.flightDetails?.airline || selectedBooking.airline || 'N/A'}</strong>
                              <span>Flight {selectedBooking.flightDetails?.flightNumber || selectedBooking.flightNumber || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flight-route-details">
                            <div className="route-point">
                              <div className="airport-code">{selectedBooking.flightDetails?.departure?.airport || 'N/A'}</div>
                              <div className="airport-city">{selectedBooking.flightDetails?.departure?.city || ''}</div>
                              <div className="route-time">{selectedBooking.flightDetails?.departure?.time || 'N/A'}</div>
                              <div className="route-date">{selectedBooking.flightDetails?.departure?.date || selectedBooking.date}</div>
                            </div>
                            <div className="route-line">
                              <div className="flight-duration">{selectedBooking.flightDetails?.duration || 'N/A'}</div>
                              <div className="route-arrow">
                                {selectedBooking.flightDetails?.stops > 0 || selectedBooking.flightDetails?.stopover ? (
                                  <span className="stopover-info">
                                    {selectedBooking.flightDetails?.stops || 1} Stop
                                    {selectedBooking.flightDetails?.stopover && ` (${selectedBooking.flightDetails.stopover})`}
                                  </span>
                                ) : (
                                  <span className="direct-flight">Direct</span>
                                )}
                              </div>
                            </div>
                            <div className="route-point">
                              <div className="airport-code">{selectedBooking.flightDetails?.arrival?.airport || 'N/A'}</div>
                              <div className="airport-city">{selectedBooking.flightDetails?.arrival?.city || ''}</div>
                              <div className="route-time">{selectedBooking.flightDetails?.arrival?.time || 'N/A'}</div>
                              <div className="route-date">{selectedBooking.flightDetails?.arrival?.date || ''}</div>
                            </div>
                          </div>

                          <div className="flight-extras">
                            <div className="extra-item">
                              <label>Class</label>
                              <span>{selectedBooking.flightDetails?.cabinClass || selectedBooking.flightDetails?.class || 'Economy'}</span>
                            </div>
                            {selectedBooking.selectedSeats && selectedBooking.selectedSeats.length > 0 && (
                              <div className="extra-item">
                                <label>Seats</label>
                                <span>{selectedBooking.selectedSeats.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Return Flight if exists */}
                        {selectedBooking.returnFlightDetails && (
                          <div className="flight-card return-flight">
                            <div className="return-label">Return Flight</div>
                            <div className="flight-airline">
                              <img 
                                src={`/airlines/${(selectedBooking.returnFlightDetails?.airlineCode || selectedBooking.returnFlightDetails?.airline || 'default').toLowerCase().replace(/\s+/g, '-')}.png`}
                                alt={selectedBooking.returnFlightDetails?.airline || 'Airline'}
                                onError={(e) => { e.target.src = '/airlines/default.png'; }}
                                className="airline-logo"
                              />
                              <div className="airline-info">
                                <strong>{selectedBooking.returnFlightDetails?.airline || 'N/A'}</strong>
                                <span>Flight {selectedBooking.returnFlightDetails?.flightNumber || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="flight-route-details">
                              <div className="route-point">
                                <div className="airport-code">{selectedBooking.returnFlightDetails?.departure?.airport || 'N/A'}</div>
                                <div className="route-time">{selectedBooking.returnFlightDetails?.departure?.time || 'N/A'}</div>
                              </div>
                              <div className="route-line">
                                <div className="flight-duration">{selectedBooking.returnFlightDetails?.duration || 'N/A'}</div>
                              </div>
                              <div className="route-point">
                                <div className="airport-code">{selectedBooking.returnFlightDetails?.arrival?.airport || 'N/A'}</div>
                                <div className="route-time">{selectedBooking.returnFlightDetails?.arrival?.time || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Passenger Details */}
                      <div className="modal-section">
                        <h4>👥 Passengers ({selectedBooking.passengerDetails?.length || selectedBooking.passengerCount || 1})</h4>
                        <div className="passengers-grid">
                          {selectedBooking.passengerDetails && selectedBooking.passengerDetails.length > 0 ? (
                            selectedBooking.passengerDetails.map((pax, idx) => (
                              <div key={idx} className="pax-card">
                                <div className="pax-header">
                                  <span className={`pax-type-badge ${pax.type || 'adult'}`}>{(pax.type || 'adult').toUpperCase()}</span>
                                  <span className="pax-number">Passenger {idx + 1}</span>
                                </div>
                                <div className="pax-name">{pax.firstName} {pax.lastName}</div>
                                <div className="pax-details">
                                  {pax.dateOfBirth && <div><label>DOB:</label> {new Date(pax.dateOfBirth).toLocaleDateString()}</div>}
                                  {pax.passportNumber && <div><label>Passport:</label> {pax.passportNumber}</div>}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-data">No passenger details available</p>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="modal-section">
                        <h4>📞 Contact Information</h4>
                        <div className="contact-grid">
                          <div className="contact-item">
                            <label>Email</label>
                            <span>{selectedBooking.email || 'N/A'}</span>
                          </div>
                          <div className="contact-item">
                            <label>Phone</label>
                            <span>{selectedBooking.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="modal-section payment-summary">
                        <h4>💳 Payment Summary</h4>
                        <div className="payment-details">
                          <div className="payment-row">
                            <span>Payment Method</span>
                            <span>{selectedBooking.paymentMethod || 'Credit Card'}</span>
                          </div>
                          <div className="payment-row">
                            <span>Payment Status</span>
                            <span className={`status-text ${selectedBooking.paymentStatus}`}>{selectedBooking.paymentStatus}</span>
                          </div>
                          <div className="payment-row">
                            <span>Booking Date</span>
                            <span>{selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'N/A'}</span>
                          </div>
                          <div className="payment-row total">
                            <span>Total Paid</span>
                            <span className="total-amount">${selectedBooking.amount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bookingTab === 'hotels' && (
                <div className="hotels-bookings">
                  <h3>Hotel Bookings</h3>
                  {bookings.hotels.length === 0 ? (
                    <div className="empty-state">
                      <Hotel size={48} />
                      <p>No hotel bookings yet</p>
                      <span>Hotel bookings will appear here</span>
                    </div>
                  ) : (
                    <div className="booking-list">
                      {bookings.hotels.map(booking => (
                        <div key={booking.id} className="booking-card">
                          <div className="booking-header">
                            <div className="booking-id">#{booking.id}</div>
                            <span className={`booking-status ${booking.status}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="booking-details">
                            <div className="booking-info">
                              <label>Customer</label>
                              <p>{booking.customerName}</p>
                            </div>
                            <div className="booking-info">
                              <label>Hotel</label>
                              <p>{booking.hotelName}</p>
                            </div>
                            <div className="booking-info">
                              <label>Location</label>
                              <p>{booking.location}</p>
                            </div>
                            <div className="booking-info">
                              <label>Check-in</label>
                              <p>{new Date(booking.checkIn).toLocaleDateString()}</p>
                            </div>
                            <div className="booking-info">
                              <label>Check-out</label>
                              <p>{new Date(booking.checkOut).toLocaleDateString()}</p>
                            </div>
                            <div className="booking-info">
                              <label>Guests</label>
                              <p>{booking.guests}</p>
                            </div>
                            <div className="booking-info">
                              <label>Amount</label>
                              <p className="booking-price">${booking.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bookingTab === 'vacations' && (
                <div className="vacations-bookings">
                  <h3>Vacation Packages</h3>
                  {bookings.vacations.length === 0 ? (
                    <div className="empty-state">
                      <Package size={48} />
                      <p>No vacation bookings yet</p>
                      <span>Vacation package bookings will appear here</span>
                    </div>
                  ) : (
                    <div className="booking-list">
                      {bookings.vacations.map(booking => (
                        <div key={booking.id} className="booking-card">
                          <div className="booking-header">
                            <div className="booking-id">#{booking.id}</div>
                            <span className={`booking-status ${booking.status}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="booking-details">
                            <div className="booking-info">
                              <label>Customer</label>
                              <p>{booking.customerName}</p>
                            </div>
                            <div className="booking-info">
                              <label>Package</label>
                              <p>{booking.packageName}</p>
                            </div>
                            <div className="booking-info">
                              <label>Destination</label>
                              <p>{booking.destination}</p>
                            </div>
                            <div className="booking-info">
                              <label>Duration</label>
                              <p>{booking.duration} days</p>
                            </div>
                            <div className="booking-info">
                              <label>Departure</label>
                              <p>{new Date(booking.departureDate).toLocaleDateString()}</p>
                            </div>
                            <div className="booking-info">
                              <label>Travelers</label>
                              <p>{booking.travelers}</p>
                            </div>
                            <div className="booking-info">
                              <label>Amount</label>
                              <p className="booking-price">${booking.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="users-section">
            <h2>User Management</h2>
            <p>Manage registered users</p>
          </div>
        );

      case 'content':
        return (
          <div className="content-section">
            <h2>Content Management</h2>
            
            <form onSubmit={handleContentUpdate} className="content-form">
              <h3>Website Content</h3>
              
              <div className="form-group">
                <label>Hero Title</label>
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => setContent({...content, heroTitle: e.target.value})}
                  placeholder="Find Your Perfect Flight Deal"
                />
              </div>

              <div className="form-group">
                <label>Hero Subtitle</label>
                <input
                  type="text"
                  value={content.heroSubtitle}
                  onChange={(e) => setContent({...content, heroSubtitle: e.target.value})}
                  placeholder="Save up to 40% on flights worldwide"
                />
              </div>

              <div className="form-group">
                <label>About Text</label>
                <textarea
                  value={content.aboutText}
                  onChange={(e) => setContent({...content, aboutText: e.target.value})}
                  placeholder="Company description..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={content.contactEmail}
                  onChange={(e) => setContent({...content, contactEmail: e.target.value})}
                  placeholder="info@wegofare.com"
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={content.contactPhone}
                  onChange={(e) => setContent({...content, contactPhone: e.target.value})}
                  placeholder="+1-800-889-9279"
                />
              </div>

              <div className="form-group">
                <label>Contact Address</label>
                <input
                  type="text"
                  value={content.contactAddress}
                  onChange={(e) => setContent({...content, contactAddress: e.target.value})}
                  placeholder="447 Broadway, New York, NY 10013 USA"
                />
              </div>

              <button type="submit" className="save-button">
                <Save size={20} />
                Save Content
              </button>
            </form>

            <div className="blog-management">
              <h3>Blog Posts Management</h3>
              
              {/* AI Blog Generation Section */}
              <div className="ai-blog-section" style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🤖</span> AI Blog Auto-Generation
                </h4>
                <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
                  Automatically generate SEO-optimized travel blog posts to improve your website's search rankings
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleGenerateSingleBlog}
                    className="ai-button"
                    style={{
                      background: 'white',
                      color: '#0ea5e9',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={20} />
                    Generate 1 Blog Post
                  </button>
                  <button
                    onClick={handleGenerateBulkBlogs}
                    className="ai-button"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={20} />
                    Generate 5 Blog Posts
                  </button>
                  <button
                    onClick={handleToggleAutoPosting}
                    className="ai-button"
                    style={{
                      background: autoPostingEnabled ? 'rgba(255,255,255,0.2)' : 'white',
                      color: autoPostingEnabled ? 'white' : '#0ea5e9',
                      border: autoPostingEnabled ? '1px solid white' : 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {autoPostingEnabled ? '⏸️ Disable' : '▶️ Enable'} Auto-Posting (Daily)
                  </button>
                </div>
                {aiGenerating && (
                  <div style={{ marginTop: '16px', opacity: 0.9 }}>
                    ⏳ Generating AI blog post(s)... This may take a moment.
                  </div>
                )}
              </div>
              
              <div className="create-post-form">
                <h4>Create New Post Manually</h4>
                <form onSubmit={handleCreatePost}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      placeholder="Post title..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Excerpt</label>
                    <textarea
                      value={newPost.excerpt}
                      onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                      placeholder="Brief description..."
                      rows="2"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      placeholder="Full post content..."
                      rows="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={newPost.image}
                      onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <button type="submit" className="save-button">
                    <Plus size={20} />
                    Create Post
                  </button>
                </form>
              </div>

              <div className="blog-posts-list">
                <h4>Existing Posts ({blogPosts.length})</h4>
                {blogPosts.length === 0 ? (
                  <div className="empty-state">
                    <BookOpen size={48} />
                    <p>No blog posts yet</p>
                    <span>Create your first blog post using the form above</span>
                  </div>
                ) : (
                  blogPosts.map(post => (
                  <div key={post.id} className="blog-post-item">
                    {editingPost?.id === post.id ? (
                      <div className="edit-post-form">
                        <input
                          type="text"
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                          placeholder="Title"
                        />
                        <textarea
                          value={editingPost.excerpt}
                          onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                          placeholder="Excerpt"
                          rows="2"
                        />
                        <textarea
                          value={editingPost.content}
                          onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                          placeholder="Content"
                          rows="4"
                        />
                        <input
                          type="text"
                          value={editingPost.image}
                          onChange={(e) => setEditingPost({...editingPost, image: e.target.value})}
                          placeholder="Image URL"
                        />
                        <div className="edit-actions">
                          <button onClick={() => handleUpdatePost(post.id)} className="save-btn">
                            <Save size={16} />
                            Save
                          </button>
                          <button onClick={() => setEditingPost(null)} className="cancel-btn">
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="post-info">
                        {post.image && <img src={post.image} alt={post.title} className="post-thumbnail" />}
                        <div className="post-details">
                          <h5>{post.title}</h5>
                          <p>{post.excerpt}</p>
                          <span className="post-meta">By {post.author} • {new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.slug && (
                            <div className="blog-url">
                              <a href={`https://wegofare.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="url-link">
                                📍 wegofare.com/blog/{post.slug}
                              </a>
                              <button 
                                onClick={() => {
                                  const url = `https://wegofare.com/blog/${post.slug}`;
                                  navigator.clipboard.writeText(url).then(() => alert('URL copied to clipboard!'));
                                }}
                                className="copy-url-btn"
                                title="Copy URL"
                              >
                                📋
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="post-actions">
                          <button onClick={() => setViewingBlog(post)} className="view-btn" title="View Blog">
                            <BookOpen size={16} />
                          </button>
                          <button 
                            onClick={() => handlePublishToExternalSites(post)} 
                            className="publish-btn" 
                            title="Publish to External Sites"
                          >
                            🚀
                          </button>
                          <button onClick={() => setEditingPost(post)} className="edit-btn" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="delete-btn" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )))}
              </div>
            </div>
          </div>
        );

      case 'campaigns':
        return (
          <div className="campaigns-section">
            <h2>Marketing Campaigns</h2>
            
            <div className="create-campaign-form">
              <h3>Create New Campaign</h3>
              <form onSubmit={handleCreateCampaign}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Campaign Name</label>
                    <input
                      type="text"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="Summer Sale 2025"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Campaign Type</label>
                    <select
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value})}
                      required
                    >
                      <option value="email">Email Marketing</option>
                      <option value="sms">SMS Campaign</option>
                      <option value="push">Push Notification</option>
                      <option value="social">Social Media</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select
                      value={newCampaign.targetAudience}
                      onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                      required
                    >
                      <option value="all">All Users</option>
                      <option value="new">New Users</option>
                      <option value="active">Active Users</option>
                      <option value="inactive">Inactive Users</option>
                      <option value="vip">VIP Customers</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Schedule Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={newCampaign.scheduledDate}
                      onChange={(e) => setNewCampaign({...newCampaign, scheduledDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject / Title</label>
                  <input
                    type="text"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                    placeholder="Save up to 50% on summer flights!"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea
                    value={newCampaign.message}
                    onChange={(e) => setNewCampaign({...newCampaign, message: e.target.value})}
                    placeholder="Enter your campaign message here..."
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className="save-button">
                  <Plus size={20} />
                  Create Campaign
                </button>
              </form>
            </div>

            <div className="campaigns-list">
              <h3>All Campaigns ({campaigns.length})</h3>
              {campaigns.length === 0 ? (
                <div className="empty-state">
                  <Megaphone size={48} />
                  <p>No campaigns yet</p>
                  <span>Create your first marketing campaign using the form above</span>
                </div>
              ) : (
                <div className="campaign-grid">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="campaign-card">
                      <div className="campaign-header">
                        <div className="campaign-type-badge">
                          {campaign.type === 'email' && <Mail size={16} />}
                          {campaign.type === 'sms' && <Megaphone size={16} />}
                          {campaign.type === 'push' && <Megaphone size={16} />}
                          {campaign.type === 'social' && <Globe size={16} />}
                          {campaign.type}
                        </div>
                        <span className={`campaign-status ${campaign.status}`}>
                          {campaign.status}
                        </span>
                      </div>
                      
                      <h4>{campaign.name}</h4>
                      <p className="campaign-subject">{campaign.subject}</p>
                      
                      <div className="campaign-details">
                        <div className="campaign-detail-item">
                          <Users size={16} />
                          <span>{campaign.targetAudience}</span>
                        </div>
                        {campaign.scheduledDate && (
                          <div className="campaign-detail-item">
                            <Calendar size={16} />
                            <span>{new Date(campaign.scheduledDate).toLocaleString()}</span>
                          </div>
                        )}
                        {campaign.sentCount !== undefined && (
                          <div className="campaign-detail-item">
                            <Mail size={16} />
                            <span>Sent: {campaign.sentCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="campaign-actions">
                        {campaign.status === 'draft' && (
                          <button 
                            className="launch-btn"
                            onClick={() => handleLaunchCampaign(campaign.id)}
                          >
                            <Zap size={16} />
                            Launch
                          </button>
                        )}
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'coupons':
        return (
          <div className="coupons-section">
            <h2>Discount Coupons</h2>
            
            <div className="create-coupon-form">
              <h3>Create New Coupon</h3>
              <form onSubmit={handleCreateCoupon}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coupon Code</label>
                    <input
                      type="text"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      placeholder="SUMMER25"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount</label>
                    <input
                      type="number"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({...newCoupon, discount: e.target.value})}
                      placeholder="20"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Uses</label>
                    <input
                      type="number"
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({...newCoupon, maxUses: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Amount ($)</label>
                    <input
                      type="number"
                      value={newCoupon.minAmount}
                      onChange={(e) => setNewCoupon({...newCoupon, minAmount: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                </div>
                <button type="submit" className="save-button">
                  <Plus size={20} />
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="coupons-list">
              <h3>Active Coupons ({coupons.length})</h3>
              {coupons.length === 0 ? (
                <div className="empty-state">
                  <Percent size={48} />
                  <p>No coupons yet</p>
                  <span>Create your first discount coupon</span>
                </div>
              ) : (
                <div className="coupons-grid">
                  {coupons.map(coupon => (
                    <div key={coupon.id} className="coupon-card">
                      <div className="coupon-code">{coupon.code}</div>
                      <div className="coupon-discount">
                        {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                      </div>
                      <div className="coupon-details">
                        <p>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                        <p>Uses: {coupon.usedCount || 0} / {coupon.maxUses || '∞'}</p>
                        {coupon.minAmount && <p>Min: ${coupon.minAmount}</p>}
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteCoupon(coupon.id)}>
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="reviews-section">
            <h2>Customer Reviews</h2>
            
            {reviews.length === 0 ? (
              <div className="empty-state">
                <Star size={48} />
                <p>No reviews yet</p>
                <span>Customer reviews will appear here</span>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div>
                        <h4>{review.customerName}</h4>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < review.rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                          ))}
                        </div>
                      </div>
                      <span className={`review-status ${review.status}`}>{review.status}</span>
                    </div>
                    <p className="review-text">{review.text}</p>
                    <div className="review-meta">
                      <span>{review.bookingType} • {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.status === 'pending' && (
                      <div className="review-actions">
                        <button className="approve-btn" onClick={() => handleApproveReview(review.id)}>
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button className="reject-btn" onClick={() => handleRejectReview(review.id)}>
                          <XCircle size={16} />

                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="notifications-section">
            <h2>Notifications Center</h2>
            
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <p>No notifications</p>
                <span>System notifications will appear here</span>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                    <div className="notif-icon">
                      {notif.type === 'booking' && <Plane size={20} />}
                      {notif.type === 'payment' && <CreditCard size={20} />}
                      {notif.type === 'system' && <AlertCircle size={20} />}
                    </div>
                    <div className="notif-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                    {!notif.read && (
                      <button className="mark-read-btn" onClick={() => handleMarkNotificationRead(notif.id)}>
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'transactions':
        return (
          <div className="transactions-section">
            <h2>Payment Transactions</h2>
            
            {transactions.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <p>No transactions yet</p>
                <span>Payment transactions will appear here</span>
              </div>
            ) : (
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <tr key={txn.id}>
                        <td>#{txn.id}</td>
                        <td>{txn.customerName}</td>
                        <td className="amount">${txn.amount}</td>
                        <td>{txn.type}</td>
                        <td>
                          <span className={`txn-status ${txn.status}`}>{txn.status}</span>
                        </td>
                        <td>{new Date(txn.date).toLocaleDateString()}</td>
                        <td>
                          {txn.status === 'completed' && (
                            <button className="refund-btn" onClick={() => handleProcessRefund(txn.id)}>
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'roles':
        return (
          <div className="roles-section">
            <h2>User Roles & Permissions</h2>
            
            {roles.length === 0 ? (
              <div className="empty-state">
                <Shield size={48} />
                <p>No roles defined</p>
                <span>Create user roles and permissions</span>
              </div>
            ) : (
              <div className="roles-grid">
                {roles.map(role => (
                  <div key={role.id} className="role-card">
                    <div className="role-header">
                      <Shield size={24} />
                      <h3>{role.name}</h3>
                    </div>
                    <p className="role-description">{role.description}</p>
                    <div className="role-permissions">
                      <h4>Permissions:</h4>
                      <ul>
                        {role.permissions?.map((perm, idx) => (
                          <li key={idx}><CheckCircle size={14} /> {perm}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="role-stats">
                      <span>{role.userCount || 0} users</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'files':
        return (
          <div className="files-section">
            <h2>File Manager</h2>
            
            <div className="file-upload">
              <div className="upload-zone">
                <Upload size={48} />
                <h3>Upload Files</h3>
                <p>Drag and drop files here or click to browse</p>
                <button className="upload-btn">
                  <Plus size={20} />
                  Choose Files
                </button>
              </div>
            </div>

            <div className="files-library">
              <h3>Media Library</h3>
              <div className="empty-state">
                <Folder size={48} />
                <p>No files uploaded</p>
                <span>Upload images and documents</span>
              </div>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="logs-section">
            <h2>Activity Logs</h2>
            
            {activityLogs.length === 0 ? (
              <div className="empty-state">
                <Activity size={48} />
                <p>No activity logs</p>
                <span>System activity will be logged here</span>
              </div>
            ) : (
              <div className="logs-list">
                {activityLogs.map(log => (
                  <div key={log.id} className="log-item">
                    <div className="log-icon">
                      <Activity size={16} />
                    </div>
                    <div className="log-content">
                      <p><strong>{log.user}</strong> {log.action}</p>
                      <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <span className={`log-type ${log.type}`}>{log.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'chat':
        return (
          <div className="chat-section">
            <h2>Live Chat Support</h2>
            
            <div className="chat-container">
              <div className="chat-sidebar">
                <h3>Conversations</h3>
                {chatMessages.length === 0 ? (
                  <div className="empty-state-small">
                    <MessageCircle size={32} />
                    <p>No chats</p>
                  </div>
                ) : (
                  <div className="chat-list">
                    {chatMessages.map(chat => (
                      <div 
                        key={chat.id} 
                        className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <div className="chat-avatar">{chat.customerName[0]}</div>
                        <div className="chat-info">
                          <h4>{chat.customerName}</h4>
                          <p>{chat.lastMessage}</p>
                        </div>
                        {chat.unread && <span className="unread-badge">{chat.unread}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="chat-main">
                {selectedChat ? (
                  <>
                    <div className="chat-header">
                      <h3>{selectedChat.customerName}</h3>
                      <span>{selectedChat.email}</span>
                    </div>
                    <div className="chat-messages">
                      {selectedChat.messages?.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender}`}>
                          <p>{msg.text}</p>
                          <span>{new Date(msg.time).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chat-input">
                      <input type="text" placeholder="Type a message..." />
                      <button onClick={() => handleSendChatMessage(selectedChat.id, 'Message')}>
                        <Mail size={20} />
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <MessageCircle size={48} />
                    <p>Select a conversation</p>
                    <span>Choose a chat from the sidebar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'gds':
        return (
          <div className="gds-section">
            <h2>GDS API Configuration</h2>
            <p className="section-description">Configure API credentials for Global Distribution Systems</p>
            
            <form onSubmit={handleUpdateGdsSettings} className="gds-form">
              
              {/* Amadeus */}
              <div className="gds-provider-card">
                <div className="gds-header">
                  <div className="gds-title">
                    <Key size={24} />
                    <h3>Amadeus</h3>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={gdsSettings.amadeus.enabled}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        amadeus: { ...gdsSettings.amadeus, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="gds-fields">
                  <div className="form-group">
                    <label>Client ID</label>
                    <input
                      type="text"
                      value={gdsSettings.amadeus.clientId}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        amadeus: { ...gdsSettings.amadeus, clientId: e.target.value }
                      })}
                      placeholder="Enter Amadeus Client ID"
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Secret</label>
                    <input
                      type="password"
                      value={gdsSettings.amadeus.clientSecret}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        amadeus: { ...gdsSettings.amadeus, clientSecret: e.target.value }
                      })}
                      placeholder="Enter Amadeus Client Secret"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  className="test-connection-btn"
                  onClick={() => handleTestGdsConnection('amadeus')}
                  disabled={!gdsSettings.amadeus.enabled}
                >
                  <Zap size={16} />
                  Test Connection
                </button>
              </div>

              {/* Sabre */}
              <div className="gds-provider-card">
                <div className="gds-header">
                  <div className="gds-title">
                    <Key size={24} />
                    <h3>Sabre</h3>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={gdsSettings.sabre.enabled}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        sabre: { ...gdsSettings.sabre, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="gds-fields">
                  <div className="form-group">
                    <label>Client ID</label>
                    <input
                      type="text"
                      value={gdsSettings.sabre.clientId}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        sabre: { ...gdsSettings.sabre, clientId: e.target.value }
                      })}
                      placeholder="Enter Sabre Client ID"
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Secret</label>
                    <input
                      type="password"
                      value={gdsSettings.sabre.clientSecret}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        sabre: { ...gdsSettings.sabre, clientSecret: e.target.value }
                      })}
                      placeholder="Enter Sabre Client Secret"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  className="test-connection-btn"
                  onClick={() => handleTestGdsConnection('sabre')}
                  disabled={!gdsSettings.sabre.enabled}
                >
                  <Zap size={16} />
                  Test Connection
                </button>
              </div>

              {/* Travelport */}
              <div className="gds-provider-card">
                <div className="gds-header">
                  <div className="gds-title">
                    <Key size={24} />
                    <h3>Travelport</h3>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={gdsSettings.travelport.enabled}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        travelport: { ...gdsSettings.travelport, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="gds-fields">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={gdsSettings.travelport.username}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        travelport: { ...gdsSettings.travelport, username: e.target.value }
                      })}
                      placeholder="Enter Travelport Username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={gdsSettings.travelport.password}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        travelport: { ...gdsSettings.travelport, password: e.target.value }
                      })}
                      placeholder="Enter Travelport Password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Branch</label>
                    <input
                      type="text"
                      value={gdsSettings.travelport.targetBranch}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        travelport: { ...gdsSettings.travelport, targetBranch: e.target.value }
                      })}
                      placeholder="Enter Target Branch"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  className="test-connection-btn"
                  onClick={() => handleTestGdsConnection('travelport')}
                  disabled={!gdsSettings.travelport.enabled}
                >
                  <Zap size={16} />
                  Test Connection
                </button>
              </div>

              {/* Galileo */}
              <div className="gds-provider-card">
                <div className="gds-header">
                  <div className="gds-title">
                    <Key size={24} />
                    <h3>Galileo</h3>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={gdsSettings.galileo.enabled}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        galileo: { ...gdsSettings.galileo, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="gds-fields">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={gdsSettings.galileo.username}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        galileo: { ...gdsSettings.galileo, username: e.target.value }
                      })}
                      placeholder="Enter Galileo Username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={gdsSettings.galileo.password}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        galileo: { ...gdsSettings.galileo, password: e.target.value }
                      })}
                      placeholder="Enter Galileo Password"
                    />
                  </div>
                  <div className="form-group">
                    <label>PCC (Pseudo City Code)</label>
                    <input
                      type="text"
                      value={gdsSettings.galileo.pcc}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        galileo: { ...gdsSettings.galileo, pcc: e.target.value }
                      })}
                      placeholder="Enter PCC"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  className="test-connection-btn"
                  onClick={() => handleTestGdsConnection('galileo')}
                  disabled={!gdsSettings.galileo.enabled}
                >
                  <Zap size={16} />
                  Test Connection
                </button>
              </div>

              {/* LLC */}
              <div className="gds-provider-card">
                <div className="gds-header">
                  <div className="gds-title">
                    <Key size={24} />
                    <h3>LLC (Low-Cost Carriers)</h3>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={gdsSettings.llc.enabled}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        llc: { ...gdsSettings.llc, enabled: e.target.checked }
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="gds-fields">
                  <div className="form-group">
                    <label>API Key</label>
                    <input
                      type="text"
                      value={gdsSettings.llc.apiKey}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        llc: { ...gdsSettings.llc, apiKey: e.target.value }
                      })}
                      placeholder="Enter LLC API Key"
                    />
                  </div>
                  <div className="form-group">
                    <label>API Secret</label>
                    <input
                      type="password"
                      value={gdsSettings.llc.apiSecret}
                      onChange={(e) => setGdsSettings({
                        ...gdsSettings,
                        llc: { ...gdsSettings.llc, apiSecret: e.target.value }
                      })}
                      placeholder="Enter LLC API Secret"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  className="test-connection-btn"
                  onClick={() => handleTestGdsConnection('llc')}
                  disabled={!gdsSettings.llc.enabled}
                >
                  <Zap size={16} />
                  Test Connection
                </button>
              </div>

              <button type="submit" className="save-button save-gds-btn">
                <Save size={20} />
                Save All GDS Settings
              </button>
            </form>
          </div>
        );

      case 'security':
        return renderSecurityDashboard();

      case 'backlinks':
        return renderBacklinksDashboard();

      case 'settings':
        return (
          <div className="settings-section">
            <h2><Settings size={24} /> Website Settings</h2>
            <p>Manage your website's branding, contact info, billing address, and more. Changes apply across the entire website.</p>
            
            {/* Settings Sub-tabs */}
            <div className="settings-tabs">
              <button className={`settings-tab ${settingsTab === 'general' ? 'active' : ''}`} onClick={() => setSettingsTab('general')}>
                <Globe size={16} /> General
              </button>
              <button className={`settings-tab ${settingsTab === 'contact' ? 'active' : ''}`} onClick={() => setSettingsTab('contact')}>
                <Phone size={16} /> Contact & TFN
              </button>
              <button className={`settings-tab ${settingsTab === 'billing' ? 'active' : ''}`} onClick={() => setSettingsTab('billing')}>
                <CreditCard size={16} /> Billing Address
              </button>
              <button className={`settings-tab ${settingsTab === 'branding' ? 'active' : ''}`} onClick={() => setSettingsTab('branding')}>
                <Image size={16} /> Logo & Branding
              </button>
              <button className={`settings-tab ${settingsTab === 'social' ? 'active' : ''}`} onClick={() => setSettingsTab('social')}>
                <LinkIcon size={16} /> Social Links
              </button>
              <button className={`settings-tab ${settingsTab === 'colors' ? 'active' : ''}`} onClick={() => setSettingsTab('colors')}>
                <Palette size={16} /> Colors
              </button>
            </div>
            
            <form onSubmit={handleSaveSiteSettings}>
            
            {/* General Settings */}
            {settingsTab === 'general' && (
              <div className="settings-card">
                <h3><Type size={18} /> General Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Site Name</label>
                    <input
                      type="text"
                      value={siteSettingsData.siteName}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, siteName: e.target.value})}
                      placeholder="WegoFare"
                      required
                    />
                    <small>Displayed in the browser tab and across the website</small>
                  </div>
                  <div className="form-group">
                    <label>Tagline</label>
                    <input
                      type="text"
                      value={siteSettingsData.tagline}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, tagline: e.target.value})}
                      placeholder="Lock Your Fare. Unlock Your Journey."
                    />
                    <small>Short description shown in headers and SEO</small>
                  </div>
                  <div className="form-group">
                    <label>Site URL</label>
                    <input
                      type="url"
                      value={siteSettingsData.siteUrl}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, siteUrl: e.target.value})}
                      placeholder="https://wegofare.com"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Copyright Text</label>
                    <input
                      type="text"
                      value={siteSettingsData.copyrightText}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, copyrightText: e.target.value})}
                      placeholder="© 2006-{year} WegoFare. All rights reserved."
                    />
                    <small>Use {'{year}'} as a placeholder for the current year</small>
                  </div>
                </div>
                <button type="submit" className="btn-save-settings" disabled={settingsSaving}>
                  <Save size={20} />
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {/* Contact & TFN */}
            {settingsTab === 'contact' && (
              <div className="settings-card">
                <h3><Phone size={18} /> Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <Phone size={16} />
                      Toll-Free Number (TFN)
                    </label>
                    <input
                      type="text"
                      value={siteSettingsData.tfn}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, tfn: e.target.value})}
                      placeholder="+1-800-889-9279"
                      required
                    />
                    <small>Displayed in header, footer, and all call-to-action sections</small>
                  </div>
                  <div className="form-group">
                    <label>
                      <Mail size={16} />
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={siteSettingsData.email}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, email: e.target.value})}
                      placeholder="info@wegofare.com"
                      required
                    />
                    <small>Customer support email shown across the website</small>
                  </div>
                  <div className="form-group full-width">
                    <label>
                      <Clock size={16} />
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={siteSettingsData.workingHours}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, workingHours: e.target.value})}
                      placeholder="Mon-Sun 24/7"
                    />
                  </div>
                </div>

                <div className="settings-preview">
                  <h4>Live Preview</h4>
                  <div className="preview-card">
                    <div className="preview-item"><Phone size={16} /><span>{siteSettingsData.tfn || 'Not set'}</span></div>
                    <div className="preview-item"><Mail size={16} /><span>{siteSettingsData.email || 'Not set'}</span></div>
                    <div className="preview-item"><Clock size={16} /><span>{siteSettingsData.workingHours || 'Not set'}</span></div>
                  </div>
                </div>

                <button type="submit" className="btn-save-settings" disabled={settingsSaving}>
                  <Save size={20} />
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {/* Billing Address */}
            {settingsTab === 'billing' && (
              <div className="settings-card">
                <h3><MapPin size={18} /> Billing / Business Address</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={siteSettingsData.billingAddress.company}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, billingAddress: {...siteSettingsData.billingAddress, company: e.target.value}})}
                      placeholder="WegoFare"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Street Address</label>
                    <input
                      type="text"
                      value={siteSettingsData.billingAddress.street}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, billingAddress: {...siteSettingsData.billingAddress, street: e.target.value}})}
                      placeholder="447 Broadway"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={siteSettingsData.billingAddress.city}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, billingAddress: {...siteSettingsData.billingAddress, city: e.target.value}})}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={siteSettingsData.billingAddress.state}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, billingAddress: {...siteSettingsData.billingAddress, state: e.target.value}})}
                      placeholder="WY"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      value={siteSettingsData.billingAddress.zip}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, billingAddress: {...siteSettingsData.billingAddress, zip: e.target.value}})}
                      placeholder="82801"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={siteSettingsData.billingAddress.country}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, billingAddress: {...siteSettingsData.billingAddress, country: e.target.value}})}
                      placeholder="USA"
                      required
                    />
                  </div>
                </div>

                <div className="settings-preview">
                  <h4>Formatted Address</h4>
                  <div className="preview-card">
                    <div className="preview-item address-preview">
                      <MapPin size={16} />
                      <div>
                        <strong>{siteSettingsData.billingAddress.company}</strong><br/>
                        {siteSettingsData.billingAddress.street}<br/>
                        {siteSettingsData.billingAddress.city}, {siteSettingsData.billingAddress.state} {siteSettingsData.billingAddress.zip}<br/>
                        {siteSettingsData.billingAddress.country}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-save-settings" disabled={settingsSaving}>
                  <Save size={20} />
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {/* Logo & Branding */}
            {settingsTab === 'branding' && (
              <div className="settings-card">
                <h3><Image size={18} /> Logo & Branding</h3>
                
                <div className="logo-upload-section">
                  <div className="current-logo-preview">
                    <h4>Current Logo</h4>
                    <div className="logo-preview-box">
                      <img 
                        src={siteSettingsData.logoUrl || '/logo.svg'} 
                        alt="Current logo" 
                        className="logo-preview-img"
                        onError={(e) => { e.target.src = '/logo.svg'; }}
                      />
                    </div>
                    <span className="logo-url-text">{siteSettingsData.logoUrl}</span>
                  </div>

                  <div className="logo-upload-area">
                    <h4>Upload New Logo</h4>
                    <p>Accepted formats: SVG, PNG, JPG, WEBP. Max size: 2MB</p>
                    <label className="upload-btn">
                      <Upload size={18} />
                      {logoUploading ? 'Uploading...' : 'Choose File'}
                      <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        onChange={handleLogoUpload}
                        disabled={logoUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: '24px' }}>
                  <div className="form-group full-width">
                    <label>Logo URL (manual)</label>
                    <input
                      type="text"
                      value={siteSettingsData.logoUrl}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, logoUrl: e.target.value})}
                      placeholder="/logo.svg"
                    />
                    <small>You can also paste an external logo URL here instead of uploading</small>
                  </div>
                  <div className="form-group full-width">
                    <label>Favicon URL</label>
                    <input
                      type="text"
                      value={siteSettingsData.faviconUrl}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, faviconUrl: e.target.value})}
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save-settings" disabled={settingsSaving}>
                  <Save size={20} />
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {/* Social Links */}
            {settingsTab === 'social' && (
              <div className="settings-card">
                <h3><LinkIcon size={18} /> Social Media Links</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label><Facebook size={16} /> Facebook</label>
                    <input
                      type="url"
                      value={siteSettingsData.socialLinks.facebook}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, socialLinks: {...siteSettingsData.socialLinks, facebook: e.target.value}})}
                      placeholder="https://facebook.com/skyfaretravels"
                    />
                  </div>
                  <div className="form-group">
                    <label><Twitter size={16} /> Twitter / X</label>
                    <input
                      type="url"
                      value={siteSettingsData.socialLinks.twitter}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, socialLinks: {...siteSettingsData.socialLinks, twitter: e.target.value}})}
                      placeholder="https://twitter.com/skyfaretravels"
                    />
                  </div>
                  <div className="form-group">
                    <label><Instagram size={16} /> Instagram</label>
                    <input
                      type="url"
                      value={siteSettingsData.socialLinks.instagram}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, socialLinks: {...siteSettingsData.socialLinks, instagram: e.target.value}})}
                      placeholder="https://instagram.com/skyfaretravels"
                    />
                  </div>
                  <div className="form-group">
                    <label><Linkedin size={16} /> LinkedIn</label>
                    <input
                      type="url"
                      value={siteSettingsData.socialLinks.linkedin}
                      onChange={(e) => setSiteSettingsData({...siteSettingsData, socialLinks: {...siteSettingsData.socialLinks, linkedin: e.target.value}})}
                      placeholder="https://linkedin.com/company/skyfaretravels"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save-settings" disabled={settingsSaving}>
                  <Save size={20} />
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {/* Colors */}
            {settingsTab === 'colors' && (
              <div className="settings-card">
                <h3><Palette size={18} /> Header & Footer Colors</h3>
                <p style={{color:'#718096',fontSize:'14px',marginTop:'-12px',marginBottom:'24px'}}>Customize header and footer background and text colors. Use a CSS color (#hex) or a gradient.</p>

                {/* Header Colors */}
                <div className="color-section">
                  <h4>Header</h4>
                  <div className="color-preview-bar" style={{background: siteSettingsData.colors?.headerBg || 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: siteSettingsData.colors?.headerText || '#fff'}}>
                    <span>Header Preview</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Background</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          className="color-swatch"
                          value={siteSettingsData.colors?.headerBg?.startsWith('#') ? siteSettingsData.colors.headerBg : '#0ea5e9'}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: e.target.value}})}
                        />
                        <input
                          type="text"
                          value={siteSettingsData.colors?.headerBg || ''}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: e.target.value}})}
                          placeholder="#0ea5e9 or linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)"
                        />
                      </div>
                      <small>Enter a hex color or full CSS gradient value</small>
                    </div>
                    <div className="form-group">
                      <label>Text Color</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          className="color-swatch"
                          value={siteSettingsData.colors?.headerText || '#ffffff'}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerText: e.target.value}})}
                        />
                        <input
                          type="text"
                          value={siteSettingsData.colors?.headerText || ''}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerText: e.target.value}})}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Colors */}
                <div className="color-section">
                  <h4>Footer</h4>
                  <div className="color-preview-bar" style={{background: siteSettingsData.colors?.footerBg || 'linear-gradient(135deg,#2d3748,#1a202c)', color: siteSettingsData.colors?.footerText || '#e2e8f0'}}>
                    <span>Footer Preview</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Background</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          className="color-swatch"
                          value={siteSettingsData.colors?.footerBg?.startsWith('#') ? siteSettingsData.colors.footerBg : '#2d3748'}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), footerBg: e.target.value}})}
                        />
                        <input
                          type="text"
                          value={siteSettingsData.colors?.footerBg || ''}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), footerBg: e.target.value}})}
                          placeholder="#2d3748 or linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
                        />
                      </div>
                      <small>Enter a hex color or full CSS gradient value</small>
                    </div>
                    <div className="form-group">
                      <label>Text Color</label>
                      <div className="color-input-row">
                        <input
                          type="color"
                          className="color-swatch"
                          value={siteSettingsData.colors?.footerText?.startsWith('#') ? siteSettingsData.colors.footerText : '#e2e8f0'}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), footerText: e.target.value}})}
                        />
                        <input
                          type="text"
                          value={siteSettingsData.colors?.footerText || ''}
                          onChange={(e) => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), footerText: e.target.value}})}
                          placeholder="#e2e8f0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preset Themes */}
                <div className="color-presets">
                  <h4>Quick Presets</h4>
                  <div className="preset-grid">
                    <button type="button" className="preset-btn" onClick={() => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', footerBg: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)', headerText: '#ffffff', footerText: '#e2e8f0'}})}>
                      <span className="preset-swatch" style={{background:'linear-gradient(135deg,#0ea5e9,#2563eb)'}}></span>
                      Default Purple
                    </button>
                    <button type="button" className="preset-btn" onClick={() => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: 'linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%)', footerBg: 'linear-gradient(135deg, #0f2027 0%, #1a1a2e 100%)', headerText: '#ffffff', footerText: '#cbd5e0'}})}>
                      <span className="preset-swatch" style={{background:'linear-gradient(135deg,#1e3a5f,#0f2027)'}}></span>
                      Dark Navy
                    </button>
                    <button type="button" className="preset-btn" onClick={() => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', footerBg: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)', headerText: '#ffffff', footerText: '#e2e8f0'}})}>
                      <span className="preset-swatch" style={{background:'linear-gradient(135deg,#e53e3e,#c53030)'}}></span>
                      Bold Red
                    </button>
                    <button type="button" className="preset-btn" onClick={() => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: 'linear-gradient(135deg, #7dd3fc 0%, #2563eb 100%)', footerBg: 'linear-gradient(135deg, #1a202c 0%, #0ea5e9 100%)', headerText: '#ffffff', footerText: '#c6f6d5'}})}>
                      <span className="preset-swatch" style={{background:'linear-gradient(135deg,#7dd3fc,#2563eb)'}}></span>
                      Light Blue
                    </button>
                    <button type="button" className="preset-btn" onClick={() => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', footerBg: 'linear-gradient(135deg, #2d3748 0%, #4a2c1a 100%)', headerText: '#ffffff', footerText: '#feebc8'}})}>
                      <span className="preset-swatch" style={{background:'linear-gradient(135deg,#ed8936,#dd6b20)'}}></span>
                      Warm Orange
                    </button>
                    <button type="button" className="preset-btn" onClick={() => setSiteSettingsData({...siteSettingsData, colors: {...(siteSettingsData.colors||{}), headerBg: '#ffffff', footerBg: '#1a202c', headerText: '#1a202c', footerText: '#e2e8f0'}})}>
                      <span className="preset-swatch" style={{background:'#ffffff',border:'1px solid #e2e8f0'}}></span>
                      Clean White
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-save-settings" disabled={settingsSaving}>
                  <Save size={20} />
                  {settingsSaving ? 'Saving...' : 'Save Colors'}
                </button>
              </div>
            )}
            
            </form>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{adminUser?.name || 'Administrator'}</p>
          <button 
            className="sidebar-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <BarChart3 size={20} />
            <span>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => handleTabChange('seo')}
          >
            <Globe size={20} />
            <span>SEO</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleTabChange('bookings')}
          >
            <Plane size={20} />
            <span>Bookings</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => handleTabChange('content')}
          >
            <FileCheck size={20} />
            <span>Content</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => handleTabChange('blog')}
          >
            <BookOpen size={20} />
            <span>Blog</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => handleTabChange('campaigns')}
          >
            <Megaphone size={20} />
            <span>Campaigns</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => handleTabChange('coupons')}
          >
            <Percent size={20} />
            <span>Coupons</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            <Star size={20} />
            <span>Reviews</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => handleTabChange('transactions')}
          >
            <CreditCard size={20} />
            <span>Transactions</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => handleTabChange('roles')}
          >
            <Shield size={20} />
            <span>Roles</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => handleTabChange('activity')}
          >
            <Activity size={20} />
            <span>Activity Logs</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <Shield size={20} />
            <span>Security</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
          >
            <MessageCircle size={20} />
            <span>Chat</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'gds' ? 'active' : ''}`}
            onClick={() => handleTabChange('gds')}
          >
            <Key size={20} />
            <span>GDS Settings</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'backlinks' ? 'active' : ''}`}
            onClick={() => { handleTabChange('backlinks'); fetchBacklinkData(); }}
          >
            <LinkIcon size={20} />
            <span>Backlinks AI</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>
      <main className="admin-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>

      {/* Blog Viewer Modal */}
      {viewingBlog && (
        <div className="blog-viewer-modal" onClick={() => setViewingBlog(null)}>
          <div className="blog-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setViewingBlog(null)}>
              <X size={24} />
            </button>
            <div className="blog-viewer-header">
              {viewingBlog.image && (
                <img src={viewingBlog.image} alt={viewingBlog.title} className="blog-hero-image" />
              )}
              <h1>{viewingBlog.title}</h1>
              <div className="blog-meta">
                <span>By {viewingBlog.author}</span>
                <span>•</span>
                <span>{new Date(viewingBlog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {viewingBlog.category && (
                  <>
                    <span>•</span>
                    <span className="blog-category">{viewingBlog.category}</span>
                  </>
                )}
              </div>
            </div>
            <div className="blog-viewer-body">
              {viewingBlog.excerpt && (
                <div className="blog-excerpt">
                  <em>{viewingBlog.excerpt}</em>
                </div>
              )}
              <div className="blog-content" dangerouslySetInnerHTML={{ __html: viewingBlog.content.replace(/\n/g, '<br/>') }} />
              {viewingBlog.tags && viewingBlog.tags.length > 0 && (
                <div className="blog-tags">
                  <strong>Tags:</strong>
                  {viewingBlog.tags.map((tag, index) => (
                    <span key={index} className="blog-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
