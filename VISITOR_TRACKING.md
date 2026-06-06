# Live Visitor Tracking System

## Overview
Real-time visitor tracking system using WebSocket (Socket.IO) to monitor live website traffic with **geolocation support** displaying visitor's country, state/region, and city in the admin dashboard.

## Features Implemented

### 1. **Real-Time Visitor Tracking**
- Tracks active visitors on the website in real-time
- Automatic connection/disconnection detection
- WebSocket-based instant updates
- **IP-based geolocation tracking**

### 2. **Visitor Statistics**
- **Live Visitors**: Current number of active users on the website
- **Total Visits**: All-time visitor count since server start
- **Peak Visitors**: Highest concurrent visitor count
- **Visit History**: Last 100 visitor events (join/leave) with location data

### 3. **Geolocation Data**
- **Country**: Visitor's country with flag emoji
- **Region/State**: State or region within the country
- **City**: City of the visitor
- **Timezone**: Visitor's timezone
- **Coordinates**: Latitude and longitude

### 4. **Admin Dashboard Display**
Located in the Overview tab of the Admin Dashboard:
- **Live Visitors Card**: Shows current active visitors with animated pulse indicator
- **Total Visits Card**: Displays all-time visitor count
- **Peak Visitors Card**: Shows highest concurrent visitor count
- **Live Visitors Table**: Real-time table showing each visitor's location (City, Country, Region, Connection Time)
- **Visitors by Location**: Cards showing visitor count grouped by country and region
- **Real-time Updates**: WebSocket connection for instant statistics updates

## Technical Implementation

### Backend (server.js)
```javascript
- Socket.IO server setup with CORS
- geoip-lite for IP geolocation
- Visitor tracking with Map data structure (stores visitor details)
- Location tracking per visitor (country, region, city, timezone, coordinates)
- Statistics object tracking current/total/peak visitors and locations
- Event listeners for connection/disconnection with location logging
- History logging (last 100 events) with location data
- Broadcasts updates with visitor list and locations to admin panels
```

### Backend API (admin.js)
```javascript
GET /api/admin/visitors
- Returns current visitor statistics
- Includes location breakdown by country and region
- Requires admin authentication
- Provides last 20 history entries with location data
```

### Frontend (App.js)
```javascript
- WebSocket connection on app load
- Automatic page view tracking
- Connection only for non-admin pages
- Cleanup on component unmount
```

### Frontend (AdminDashboard.js)
```javascript
- Real-time visitor stats state with location data
- WebSocket listener for live updates with visitor list
- Fetches initial stats on mount
- Auto-updates when visitors join/leave
- Displays visitor table with location details
- Shows location statistics cards
- Country flag emoji helper function
```

### CSS Styling
```css
- Animated pulse effect for live indicator
- Gradient backgrounds for stat cards
- Responsive grid layout
- Smooth animations and transitions
- Visitor table with hover effects
- Location cards with flag display
- Mobile-responsive design
```

## How It Works

1. **Visitor Connects**:
   - User opens any page on the website
   - WebSocket connection established automatically
   - Server captures visitor's IP address
   - IP is geocoded to get country, region, city, timezone
   - Visitor added to active visitors Map with location data
   - Statistics updated (current + total)
   - Location count incremented
   - Update broadcast to all admin dashboards with visitor list

2. **Page Navigation**:
   - Page view events tracked via WebSocket
   - Logs which pages are being viewed
   - Same connection maintained across page changes
   - Location remains associated with the connection

3. **Visitor Leaves**:
   - User closes browser/tab
   - WebSocket disconnection detected
   - Visitor removed from active Map
   - Location count decremented
   - Current count decremented
   - Update broadcast to admins with updated visitor list

4. **Admin Monitoring**:
   - Admin dashboard receives real-time updates
   - No page refresh needed
   - Statistics update automatically
   - Visual indicators show live status
   - **Live visitors table shows each visitor's location**
   - **Location cards show visitor distribution by region**

## Visual Features

### Live Indicator
- Green pulsing dot on Live Visitors card
- Animated glow effect around the card
- Updates instantly when visitors join/leave

### Statistics Cards
- Color-coded gradient backgrounds
- Icon representations for each metric
- Large, readable numbers
- Descriptive labels

### Live Visitors Table
- **Real-time list of active visitors**
- **Location column with globe icon**
- **Country with flag emoji (e.g., 🇺🇸 US, 🇬🇧 GB)**
- **Region/State display**
- **Connection time for each visitor**
- Hover effects on rows
- Responsive design for mobile

### Visitors by Location Cards
- **Country flag emoji display**
- **Country and region names**
- **Visitor count per location**
- Gradient backgrounds
- Hover animations

### Real-time Badge
- "🔄 Real-time updates via WebSocket" badge
- Indicates active WebSocket connection
- Gradient styling matching admin panel theme

## Performance

- **Lightweight**: Minimal server overhead
- **Scalable**: Uses efficient Set data structure
- **Real-time**: Sub-second update latency
- **Memory Efficient**: History limited to 100 entries

## Future Enhancements

1. **Geographic Tracking**: Show visitor locations
2. **Page Analytics**: Most visited pages
3. **Session Duration**: Average time on site
4. **Device Detection**: Desktop vs mobile breakdown
5. **Referrer Tracking**: Where visitors come from
6. **Custom Events**: Track specific user interactions
7. **Historical Charts**: Visitor trends over time
8. **Export Data**: Download visitor statistics
9. **Alerts**: Notifications for traffic spikes
10. **Comparison**: Compare with previous periods

## Testing

To test the visitor tracking:

1. Open the admin dashboard
2. Navigate to the Overview tab
3. Open the website in another browser/tab
4. Watch the Live Visitors count increase
5. Close the website tab
6. See the count decrease in real-time

## Notes

- Visitor count resets when server restarts
- For production, consider persistent storage (Redis/MongoDB)
- WebSocket connection is separate from admin connections
- Admin panel users are also tracked as visitors
- Connection is maintained across page navigation
- Automatic reconnection on connection loss

## Dependencies

### Backend
- `socket.io`: ^4.x - WebSocket server
- `geoip-lite`: ^1.x - IP geolocation database

### Frontend  
- `socket.io-client`: ^4.x - WebSocket client

All installed and configured for real-time communication with geolocation support.

## Geolocation Details

### IP Detection
- Captures visitor IP from Socket.IO handshake
- Supports X-Forwarded-For header for proxy detection
- Falls back to socket connection address

### GeoIP Lookup
- Uses `geoip-lite` offline database (no API calls needed)
- Fast and free geolocation
- Provides: country, region, city, timezone, coordinates
- Regular database updates available via npm

### Location Data Structure
```javascript
{
  ip: "192.168.1.1",
  country: "US",
  region: "CA",
  city: "Los Angeles",
  timezone: "America/Los_Angeles",
  ll: [34.0522, -118.2437] // [latitude, longitude]
}
```

### Country Flag Display
- Converts ISO 3166-1 alpha-2 country codes to flag emojis
- Examples: US → 🇺🇸, GB → 🇬🇧, IN → 🇮🇳, CA → 🇨🇦
- Fallback to 🌐 for unknown locations

### Localhost Handling
- Local connections show "Unknown" for location
- Production deployment will show real geolocation
- Test with deployed version to see actual locations
