const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const geoip = require('geoip-lite');

// Load environment variables from .env file in the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Visitor tracking
let activeVisitors = new Map(); // Changed to Map to store visitor details
let visitorStats = {
  total: 0,
  current: 0,
  peak: 0,
  history: [],
  locations: new Map() // Track visitors by location
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Get visitor's IP address
  const clientIP = socket.handshake.headers['x-forwarded-for']?.split(',')[0] || 
                   socket.handshake.address || 
                   socket.conn.remoteAddress;
  
  // Get geolocation from IP
  const geo = geoip.lookup(clientIP);
  
  // For localhost/development, provide mock data
  const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1' || !geo;
  
  const location = isLocalhost ? {
    ip: clientIP,
    country: 'Local',
    region: 'Development',
    city: 'Localhost',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ll: [0, 0]
  } : {
    ip: clientIP,
    country: geo.country || 'Unknown',
    region: geo.region || 'Unknown',
    city: geo.city || 'Unknown',
    timezone: geo.timezone || 'Unknown',
    ll: geo.ll || [0, 0]
  };
  
  // New visitor connected
  activeVisitors.set(socket.id, {
    id: socket.id,
    connectedAt: new Date().toISOString(),
    location: location
  });
  
  visitorStats.current = activeVisitors.size;
  visitorStats.total++;
  
  // Update peak if current visitors exceed it
  if (visitorStats.current > visitorStats.peak) {
    visitorStats.peak = visitorStats.current;
  }
  
  // Track location statistics
  const locationKey = `${location.country}-${location.region}`;
  const currentCount = visitorStats.locations.get(locationKey) || 0;
  visitorStats.locations.set(locationKey, currentCount + 1);
  
  // Record in history (keep last 100 entries)
  visitorStats.history.push({
    timestamp: new Date().toISOString(),
    count: visitorStats.current,
    action: 'join',
    location: `${location.city}, ${location.region}, ${location.country}`
  });
  if (visitorStats.history.length > 100) {
    visitorStats.history.shift();
  }
  
  console.log(`👤 Visitor connected: ${socket.id} from ${location.city}, ${location.region}, ${location.country} (Total: ${visitorStats.current})`);
  
  // Broadcast updated visitor count to all admin panels
  const visitors = Array.from(activeVisitors.values()).map(v => ({
    id: v.id,
    country: v.location.country,
    region: v.location.region,
    city: v.location.city,
    connectedAt: v.connectedAt
  }));
  
  io.emit('visitorUpdate', {
    current: visitorStats.current,
    total: visitorStats.total,
    peak: visitorStats.peak,
    visitors: visitors
  });
  
  // Visitor disconnected
  socket.on('disconnect', () => {
    const visitor = activeVisitors.get(socket.id);
    const location = visitor?.location || { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
    
    // Update location count
    const locationKey = `${location.country}-${location.region}`;
    const currentCount = visitorStats.locations.get(locationKey) || 0;
    if (currentCount > 1) {
      visitorStats.locations.set(locationKey, currentCount - 1);
    } else {
      visitorStats.locations.delete(locationKey);
    }
    
    activeVisitors.delete(socket.id);
    visitorStats.current = activeVisitors.size;
    
    // Record in history
    visitorStats.history.push({
      timestamp: new Date().toISOString(),
      count: visitorStats.current,
      action: 'leave',
      location: `${location.city}, ${location.region}, ${location.country}`
    });
    if (visitorStats.history.length > 100) {
      visitorStats.history.shift();
    }
    
    console.log(`👤 Visitor disconnected: ${socket.id} from ${location.city}, ${location.region}, ${location.country} (Total: ${visitorStats.current})`);
    
    // Broadcast updated visitor count
    const visitors = Array.from(activeVisitors.values()).map(v => ({
      id: v.id,
      country: v.location.country,
      region: v.location.region,
      city: v.location.city,
      connectedAt: v.connectedAt
    }));
    
    io.emit('visitorUpdate', {
      current: visitorStats.current,
      total: visitorStats.total,
      peak: visitorStats.peak,
      visitors: visitors
    });
  });
  
  // Track page views
  socket.on('pageView', (data) => {
    console.log(`📄 Page view: ${data.page} by ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('visitorStats', visitorStats);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (airline logos)
app.use('/airlines', express.static(path.join(__dirname, 'public/airlines')));

// Database connection
mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flight-booking')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Sitemap routes (specific paths before other routes)
const sitemapRouter = require('./routes/sitemap');
console.log('📍 Mounting sitemap routes');
app.use(sitemapRouter);

// API Routes
app.use('/api/flights', require('./routes/flights'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/cruises', require('./routes/cruises'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// Wire up blog posts getter for sitemap (after admin router is loaded)
sitemapRouter.setBlogPostsGetter(() => adminRouter.getBlogPosts());

app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/airlines', require('./routes/airlines'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/backlinks', require('./routes/backlinks'));
app.use('/api/seo-agent', require('./routes/seo-automation'));
// Use live GSC integration if Google credentials are configured
const gscRoute = process.env.GOOGLE_CLIENT_ID ? './routes/gsc-live' : './routes/gsc';
app.use('/api/gsc', require(gscRoute));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Flight Booking API',
    version: '1.0.0',
    endpoints: {
      flights: '/api/flights',
      hotels: '/api/hotels',
      cruises: '/api/cruises',
      packages: '/api/packages',
      bookings: '/api/bookings',
      users: '/api/users',
      airlines: '/api/airlines'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running for live visitor tracking`);
});
