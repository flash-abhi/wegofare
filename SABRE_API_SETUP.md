# Sabre API Integration Guide

## Overview
This project now supports both **Amadeus** and **Sabre** APIs for flight and hotel searches, giving you access to a wider range of inventory and better pricing options.

## Getting Started with Sabre API

### 1. Sign Up for Sabre Developer Account
1. Go to [Sabre Developer Portal](https://developer.sabre.com/)
2. Click "Sign Up" and create a free account
3. Complete the registration process

### 2. Create a New Application
1. Log in to your Sabre Developer account
2. Navigate to "My Apps" or "Applications"
3. Click "Create New App"
4. Fill in the application details:
   - **Application Name**: Your app name (e.g., "Flight Booking System")
   - **Description**: Brief description of your app
5. Select the APIs you want to use:
   - ✅ **Shop for Flights** (OTA_AirLowFareSearchRQ)
   - ✅ **Shop for Hotels** (GetHotelAvailRQ)
   - ✅ **Authorization** (OAuth2)

### 3. Get Your Credentials
After creating the app, you'll receive:
- **Client ID** (also called User ID or PCC)
- **Client Secret** (also called Password or Shared Secret)
- **API Endpoint URLs**:
  - **Cert Environment** (Testing): `https://api-crt.cert.havail.sabre.com`
  - **Production Environment**: `https://api.havail.sabre.com`

### 4. Configure Environment Variables
Update your `.env` file in the `backend` folder:

```env
# Sabre API Credentials
SABRE_CLIENT_ID=your_sabre_client_id_here
SABRE_CLIENT_SECRET=your_sabre_client_secret_here
SABRE_REST_API_URL=https://api-crt.cert.havail.sabre.com
```

**Important:**
- Start with the **Cert Environment** for testing
- Switch to **Production** when ready to go live
- Never commit your credentials to Git (already in `.gitignore`)

## API Features

### Flight Search
The flight search now combines results from both Amadeus and Sabre:

```javascript
// Search using both providers (default)
GET /api/flights?from=JFK&to=LAX&date=2025-12-01&passengers=2

// Search using only Sabre
GET /api/flights?from=JFK&to=LAX&date=2025-12-01&passengers=2&provider=sabre

// Search using only Amadeus
GET /api/flights?from=JFK&to=LAX&date=2025-12-01&passengers=2&provider=amadeus
```

**Response includes:**
```json
{
  "success": true,
  "count": 75,
  "data": [...],
  "sources": {
    "amadeus": 50,
    "sabre": 25
  }
}
```

### Hotel Search
Hotels can be searched through Sabre's extensive inventory:

```javascript
const hotels = await sabreClient.searchHotels({
  destination: 'NYC',
  checkIn: '2025-12-01',
  checkOut: '2025-12-05',
  adults: 2,
  rooms: 1
});
```

## Sabre API Limits

### Free Tier (Developer)
- **Transactions per Second (TPS)**: 1 TPS
- **Daily Limit**: 1,000 transactions per day
- **Environment**: Cert only (testing data)

### Paid Tiers
Contact Sabre for production access:
- Higher TPS limits
- Production data
- Additional API access
- Priority support

## Testing Your Integration

### 1. Test Flight Search
```bash
# Test with both providers
curl "http://localhost:5000/api/flights?from=JFK&to=LAX&date=2025-12-15&passengers=2"

# Test Sabre only
curl "http://localhost:5000/api/flights?from=JFK&to=LAX&date=2025-12-15&passengers=2&provider=sabre"
```

### 2. Check Response
Look for the `sources` field in the response:
```json
{
  "sources": {
    "amadeus": 50,  // Number of results from Amadeus
    "sabre": 25     // Number of results from Sabre
  }
}
```

### 3. Verify Source in Flight Data
Each flight includes a `source` field:
```json
{
  "id": "sabre-1",
  "airline": "AA",
  "flightNumber": "AA100",
  "source": "sabre",  // ← Source identifier
  ...
}
```

## Common Test Airports

### US Airports
- **JFK** - New York JFK
- **LAX** - Los Angeles
- **ORD** - Chicago O'Hare
- **MIA** - Miami
- **DFW** - Dallas/Fort Worth
- **ATL** - Atlanta

### International Airports
- **LHR** - London Heathrow
- **CDG** - Paris Charles de Gaulle
- **DXB** - Dubai
- **SYD** - Sydney
- **NRT** - Tokyo Narita

## Error Handling

The system is designed with fallback mechanisms:

1. **Try Amadeus** first (if enabled)
2. **Try Sabre** second (if enabled)
3. **Fallback to database** if both APIs fail
4. **Never fail completely** - always return some results

### Common Errors

#### Authentication Error
```
Failed to authenticate with Sabre API
```
**Solution:** Check your `SABRE_CLIENT_ID` and `SABRE_CLIENT_SECRET` in `.env`

#### Invalid Airport Code
```
Invalid airport code
```
**Solution:** Use valid IATA codes (3 letters, e.g., JFK, LAX)

#### Rate Limit Exceeded
```
Rate limit exceeded
```
**Solution:** Wait a few seconds or upgrade your Sabre plan

## Benefits of Using Both APIs

### 1. **More Flight Options**
- Amadeus: 50 results
- Sabre: 25 results
- **Total: 75 flight options** for users to choose from

### 2. **Better Pricing**
- Compare prices across multiple GDS systems
- Find the best deals automatically

### 3. **Higher Availability**
- If one API is down, the other continues working
- Redundancy ensures service reliability

### 4. **Wider Coverage**
- Amadeus: Strong in Europe and Asia
- Sabre: Strong in Americas
- Combined: Global coverage

## API Documentation Links

### Sabre Documentation
- [Getting Started Guide](https://developer.sabre.com/guides/travel-agency/getting-started)
- [Flight Search API](https://developer.sabre.com/docs/rest_apis/air/search)
- [Hotel Search API](https://developer.sabre.com/docs/rest_apis/hotel/search)
- [Authentication](https://developer.sabre.com/guides/travel-agency/developer-guides/REST_APIs/authorization)

### Amadeus Documentation
- [Getting Started](https://developers.amadeus.com/get-started)
- [Flight Offers Search](https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search)
- [Hotel Search](https://developers.amadeus.com/self-service/category/hotel/api-doc/hotel-search)

## Troubleshooting

### Check API Status
```bash
# Test Sabre authentication
node -e "const sabre = require('./backend/utils/sabreClient'); sabre.getAccessToken().then(token => console.log('✓ Sabre connected:', token.substring(0, 20) + '...')).catch(err => console.log('✗ Error:', err.message))"
```

### Enable Debug Logging
Set `NODE_ENV=development` in your `.env` to see detailed API logs.

### Monitor API Calls
Check your Sabre dashboard to monitor:
- API usage
- Transaction counts
- Error rates
- Response times

## Best Practices

1. **Start with Cert Environment** - Test thoroughly before production
2. **Cache Responses** - Reduce API calls by caching search results
3. **Handle Errors Gracefully** - Always have fallback options
4. **Monitor Usage** - Stay within your API limits
5. **Update Credentials Securely** - Never expose API keys in client code

## Support

### Sabre Support
- [Developer Forums](https://sabre-developer-community.force.com/s/)
- [Support Portal](https://developer.sabre.com/support)
- Email: developer.support@sabre.com

### Amadeus Support
- [Developer Portal](https://developers.amadeus.com/support)
- [Community](https://developers.amadeus.com/support/community)

## Next Steps

1. ✅ Sign up for Sabre account
2. ✅ Get API credentials
3. ✅ Update `.env` file
4. ✅ Test flight search
5. ✅ Monitor API usage
6. 🚀 Deploy to production

Happy coding! 🎉
