# Airlines Directory - Complete Guide

## What We've Created

A comprehensive airlines directory with detailed pages for all major airlines worldwide!

## Features

### Airlines Directory Page (`/airlines`)
- **Search Functionality**: Search airlines by name or code
- **Filter by Alliance**: Star Alliance, Oneworld, SkyTeam, Independent
- **20 Major Airlines**: US carriers and international airlines
- **Grid Layout**: Clean, card-based design
- **Alliance Information**: Learn about airline alliances

### Individual Airline Pages (`/airlines/{airline-slug}`)
Each airline has a dedicated page with 4 tabs:

#### 1. Overview Tab
- Airline information (headquarters, founded, fleet size)
- Hub airports list
- Key features and amenities
- Quick stats display

#### 2. Travel Classes Tab
- All cabin classes (First, Business, Premium Economy, Economy)
- Class-specific features
- Amenities for each class
- "Find Deals" buttons

#### 3. Deals & Tips Tab
- Booking tips specific to each airline
- Current deals and promotions
- Frequent flyer program info
- Best practices for saving money

#### 4. Contact Tab
- Phone numbers
- Official website links
- Support hours
- Help center information

## Airlines Included

### US Airlines
1. ✈️ American Airlines (AA) - Oneworld
2. ✈️ Delta Air Lines (DL) - SkyTeam
3. ✈️ United Airlines (UA) - Star Alliance
4. ✈️ Southwest Airlines (WN) - Independent
5. ✈️ JetBlue Airways (B6) - Independent
6. ✈️ Alaska Airlines (AS) - Oneworld

### International Airlines
7. ✈️ Emirates (EK) - Independent
8. ✈️ Lufthansa (LH) - Star Alliance
9. ✈️ British Airways (BA) - Oneworld
10. ✈️ Air France (AF) - SkyTeam
11. ✈️ Singapore Airlines (SQ) - Star Alliance
12. ✈️ Cathay Pacific (CX) - Oneworld
13. ✈️ Qantas (QF) - Oneworld
14. ✈️ All Nippon Airways (NH) - Star Alliance
15. ✈️ Etihad Airways (EY) - Independent
16. ✈️ Qatar Airways (QR) - Oneworld

## URLs

### Main Directory
```
/airlines
```

### Individual Airline Pages
```
/airlines/american-airlines
/airlines/delta-airlines
/airlines/united-airlines
/airlines/southwest-airlines
/airlines/jetblue-airways
/airlines/alaska-airlines
/airlines/emirates
/airlines/lufthansa
/airlines/british-airways
/airlines/air-france
/airlines/singapore-airlines
/airlines/cathay-pacific
/airlines/qantas
/airlines/ana
/airlines/etihad-airways
/airlines/qatar-airways
```

## Data Structure

Each airline includes:
- ✅ Name & IATA Code
- ✅ Logo placeholder
- ✅ Description
- ✅ Headquarters location
- ✅ Year founded
- ✅ Hub airports (all of them)
- ✅ Number of destinations
- ✅ Fleet size
- ✅ Alliance membership
- ✅ Frequent flyer program name
- ✅ Travel classes offered
- ✅ Key features (5+)
- ✅ Booking tips (4+)
- ✅ Contact information

## SEO Benefits

Each page is optimized for search engines:
- **Dynamic Titles**: "American Airlines - Flight Deals & Information"
- **Rich Content**: Detailed airline information
- **Internal Linking**: Links to flight search and other airlines
- **Keyword Rich**: Airline names, routes, deals
- **Unique URLs**: SEO-friendly slugs

## User Benefits

1. **Research**: Compare airlines before booking
2. **Information**: Learn about classes, amenities, hubs
3. **Deals**: Find booking tips and current promotions
4. **Contact**: Easy access to airline contact info
5. **Navigation**: Filter and search functionality

## Integration Points

### Homepage
- Can add "Explore Airlines" section
- Link to /airlines directory

### Flight Results
- Link to airline pages from results
- "Learn more about [Airline]" buttons

### Header
- Added "Airlines" to main navigation
- Accessible from every page

### Footer
- Can add airlines section
- Popular airlines quick links

## Future Enhancements

### Easy to Add
1. **Airline Logos**: Replace placeholder with real logos
2. **Reviews**: Customer ratings and reviews
3. **Route Maps**: Interactive route networks
4. **Live Deals**: Real-time fare data
5. **Photos**: Cabin photos, lounges, etc.
6. **Videos**: Virtual tours
7. **News**: Latest airline news
8. **Fleet Info**: Detailed aircraft information

### Advanced Features
1. **Comparison Tool**: Side-by-side airline comparison
2. **Route Finder**: Search routes by airline
3. **Award Calculator**: Miles/points calculator
4. **Seat Maps**: Interactive seat selection guides
5. **Lounge Access**: Lounge locations and access rules

## Adding New Airlines

Simply add to `/src/data/airlines.js`:

```javascript
'new-airline': {
  name: 'New Airline',
  code: 'NA',
  description: '...',
  headquarters: '...',
  founded: '2020',
  hubs: ['City 1', 'City 2'],
  destinations: 100,
  fleet: 50,
  alliance: 'Star Alliance',
  frequentFlyer: 'Rewards Program',
  classes: ['First', 'Business', 'Economy'],
  features: ['Feature 1', 'Feature 2'],
  bookingTips: ['Tip 1', 'Tip 2'],
  contactInfo: {
    phone: '1-800-XXX-XXXX',
    website: 'https://...',
    customerService: '24/7'
  }
}
```

## Technical Details

### Files Created
1. `/src/data/airlines.js` - All airline data
2. `/src/pages/AirlinesDirectory.js` - Directory page component
3. `/src/pages/AirlinesDirectory.css` - Directory styling
4. `/src/pages/AirlinePage.js` - Individual airline page
5. `/src/pages/AirlinePage.css` - Airline page styling

### Routes Added
```javascript
<Route path="/airlines" element={<AirlinesDirectory />} />
<Route path="/airlines/:airlineSlug" element={<AirlinePage />} />
```

### Helper Functions
- `getAllAirlines()` - Get all airlines
- `getAirlineBySlug(slug)` - Get specific airline
- `getAirlinesByAlliance(alliance)` - Filter by alliance
- `searchAirlines(query)` - Search airlines

## Testing

Visit these URLs to test:
1. http://localhost:5003/airlines
2. http://localhost:5003/airlines/american-airlines
3. http://localhost:5003/airlines/emirates
4. http://localhost:5003/airlines/qatar-airways

## Mobile Responsive

✅ Fully responsive design
✅ Mobile-friendly navigation
✅ Touch-optimized buttons
✅ Adaptive grid layouts

---

**Your website now has a complete airlines directory with 16 major airlines!** 🎉
