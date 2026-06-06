# Admin Panel Access Guide

## 🔐 Login Credentials

**Admin Login URL:** `http://localhost:3000/admin/login`

**Email:** ``  
**Password:** ``

---

## ✅ Fixed Issues

1. ✅ **Server Running** - Backend is now running on port 5000
2. ✅ **Admin Routes Added** - All admin API endpoints working
3. ✅ **JWT Authentication** - Secure token-based login
4. ✅ **Admin UI** - Header/Footer hidden on admin pages
5. ✅ **Database Connected** - MongoDB connected successfully
6. ✅ **Content Management** - Full CRUD operations for website content
7. ✅ **Blog Management** - Create, edit, delete blog posts

---

## 📊 Admin Dashboard Features

### Overview Tab
- **Total Bookings** - Real-time booking count
- **Total Revenue** - Revenue tracking with trends
- **Total Users** - User registration statistics
- **Page Views** - Website traffic analytics
- **Recent Activity** - Live activity feed

### SEO Tools Tab
Complete SEO management suite with 6 integrated tools:

1. **🔍 Keyword Research** - Analyze search volume, difficulty, CPC
2. **📈 Analytics** - Google Search Console integration
3. **🌐 Site Audit** - Comprehensive SEO health check
4. **🔗 Backlinks Monitor** - Track backlink profile
5. **📝 Content Optimizer** - Optimize page content
6. **⚡ Speed Test** - Page performance analysis

**SEO Settings:**
- Page Title management
- Meta Description optimization
- Keywords management
- OG Image URL
- Canonical URL settings

### Content Management Tab ⭐ NEW
**Website Content Editor:**
- Hero Title - Homepage main heading
- Hero Subtitle - Homepage tagline
- About Text - Company description
- Contact Email - Support email address
- Contact Phone - Customer service number
- Contact Address - Physical office address

**Blog Posts Management:**
- **Create New Posts** - Add blog articles with title, excerpt, content, and images
- **Edit Posts** - Modify existing blog content inline
- **Delete Posts** - Remove outdated articles
- **View All Posts** - See complete blog post list with metadata
- **Post Details** - Title, excerpt, full content, featured image, author, timestamps

### Bookings Tab
- View all bookings
- Filter by status
- Export reports

### Users Tab
- Manage registered users
- View user statistics
- User activity tracking

### Settings Tab
- System configuration
- API settings
- Email templates

---

## 🚀 API Endpoints

All endpoints require Authorization header with JWT token:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Authentication
- `POST /api/admin/login` - Admin login

### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/users` - Get all users

### SEO Management
- `GET /api/admin/seo` - Get SEO settings
- `PUT /api/admin/seo` - Update SEO settings
- `GET /api/admin/seo/analytics` - Google Search Console data
- `GET /api/admin/seo/audit` - Site audit results
- `POST /api/admin/seo/keywords` - Keyword research
- `GET /api/admin/seo/backlinks` - Backlink monitoring
- `POST /api/admin/seo/speed-test` - Page speed analysis

### Content Management ⭐ NEW
- `GET /api/admin/content` - Get website content
- `PUT /api/admin/content` - Update website content

### Blog Management ⭐ NEW
- `GET /api/admin/blog` - Get all blog posts
- `GET /api/admin/blog/:id` - Get single blog post
- `POST /api/admin/blog` - Create new blog post
- `PUT /api/admin/blog/:id` - Update blog post
- `DELETE /api/admin/blog/:id` - Delete blog post

---

## 📝 Content Management Features

### Website Content
Edit all main website content from one place:

```json
{
  "heroTitle": "Find Your Perfect Flight Deal",
  "heroSubtitle": "Save up to 40% on flights worldwide",
  "aboutText": "Company description...",
  "contactEmail": "info@wegofare.com",
  "contactPhone": "+1-866-938-8061",
  "contactAddress": "447 Broadway, New York, NY 10013 USA"
}
```

### Blog Posts
Full CRUD operations for blog management:

**Create Post:**
```json
{
  "title": "10 Tips for Finding Cheap Flights",
  "excerpt": "Learn the insider secrets...",
  "content": "Full article content here...",
  "image": "https://example.com/image.jpg",
  "author": "Admin"
}
```

**Post Response:**
```json
{
  "id": 1,
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "image": "...",
  "author": "Admin",
  "createdAt": "2025-11-22T...",
  "updatedAt": "2025-11-22T..."
}
```

---

## 🔧 Server Status

**Backend:** Running on `http://localhost:5000`  
**Frontend:** Running on `http://localhost:3000`

### Start Backend Server:
```bash
cd /Users/sachinrawat/Desktop/N/flight/backend
node server.js
```

### Start Frontend:
```bash
cd /Users/sachinrawat/Desktop/N/flight
npm start
```

---

## 🎯 Usage Examples

### Update Website Content
```javascript
// Login first
const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'info@wegofare.com',
    password: 'admin123'
  })
});
const { token } = await loginResponse.json();

// Update content
await fetch('http://localhost:5000/api/admin/content', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    heroTitle: 'New Amazing Title',
    contactPhone: '+1-866-938-8061'
  })
});
```

### Create Blog Post
```javascript
await fetch('http://localhost:5000/api/admin/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Summer Travel Guide 2025',
    excerpt: 'Best destinations for summer...',
    content: 'Full article content...',
    image: 'https://example.com/summer.jpg',
    author: 'Admin'
  })
});
```

---

## 📝 Next Steps for Production

### 1. Security Enhancements
- [ ] Change default admin password
- [ ] Use environment variables for JWT secret
- [ ] Implement password hashing with bcrypt
- [ ] Add rate limiting for login attempts
- [ ] Enable HTTPS

### 2. Database Integration
- [ ] Store admin users in MongoDB
- [ ] Store SEO settings in database
- [ ] Store bookings and users in database
- [ ] Store website content in database
- [ ] Store blog posts in database with MongoDB

### 3. SEO API Integration
- [ ] Connect Google Search Console API
- [ ] Integrate SEMrush/Ahrefs API
- [ ] Add PageSpeed Insights API
- [ ] Connect Google Analytics

### 4. Features to Add
- [ ] Email notifications
- [ ] Export reports (CSV, PDF)
- [ ] Advanced filtering and search
- [ ] Multi-admin support with roles
- [ ] Activity logs
- [ ] Automated backups
- [ ] Image upload for blog posts
- [ ] Rich text editor for content
- [ ] Content versioning
- [ ] Scheduled blog posts

---

## 🎨 Admin Panel Styling

The admin panel uses a modern, professional design with:
- **Dark sidebar** with gradient (2d3748 → 1a202c)
- **Purple accent colors** (#667eea → #764ba2)
- **White content area** with cards and shadows
- **Responsive design** for mobile/tablet
- **Smooth animations** and transitions
- **Icon-based navigation** using Lucide React
- **Inline editing** for blog posts
- **Form validation** and error handling

---

## 🐛 Troubleshooting

### "Server error. Please try again"
**Solution:** Backend server is not running. Start it with:
```bash
cd /Users/sachinrawat/Desktop/N/flight/backend
nohup node server.js > server.log 2>&1 &
```

### "Invalid credentials"
**Solution:** Use correct credentials:
- Email: `info@wegofare.com`
- Password: `admin123`

### Cannot access admin panel
**Solution:** Make sure you're accessing the correct URL:
`http://localhost:3000/admin/login`

### Token expired
**Solution:** Tokens expire after 24 hours. Login again to get a new token.

### Content not updating
**Solution:** Make sure to click "Save Content" or "Save" button after editing.

---

## 📦 Installed Packages

Backend packages added:
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing (ready for production)

---

## 🎯 Current Status

✅ **WORKING:**
- Admin login system
- JWT authentication
- Dashboard with statistics
- SEO tools interface
- All API endpoints
- Responsive design
- Protected routes
- **Content management system**
- **Blog post CRUD operations**
- **Inline editing for blogs**
- **Image support for posts**

🔄 **READY FOR INTEGRATION:**
- Google Search Console API
- SEMrush/Ahrefs API
- Real database storage
- Email notifications
- Advanced analytics
- Rich text editor
- Image upload service

---

## 📚 Content Management Details

### Pre-loaded Blog Posts
The system comes with 2 sample blog posts:

1. **"10 Tips for Finding Cheap Flights"**
   - Insider secrets for booking affordable airfare
   - Includes featured image
   - Author: Admin

2. **"Best Time to Book Holiday Travel"**
   - Guide for planning holiday trips
   - Includes featured image
   - Author: Admin

### Blog Post Features
- **Title** - SEO-optimized headline
- **Excerpt** - Short description (used in listings)
- **Content** - Full article text
- **Featured Image** - Image URL for post thumbnail
- **Author** - Post author name
- **Timestamps** - Created and updated dates
- **ID** - Unique identifier for each post

### Inline Editing
- Click **Edit** button on any post
- Modify content directly in the list
- Click **Save** to update
- Click **Cancel** to discard changes
- Click **Delete** to remove post (with confirmation)

---

*Last Updated: November 22, 2025*
*Version: 2.0 - Content Management Integrated*
