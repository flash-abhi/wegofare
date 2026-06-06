# Sabre API Integration Status

## ✅ Completed Integration

### 1. **Sabre Client Setup**
- **File**: `backend/utils/sabreClient.js`
- **Status**: ✅ Fully implemented
- **Features**:
  - Token authentication with caching
  - Flight search API integration
  - Hotel search API integration
  - Response formatting to match internal data structure

### 2. **Flights Route**
- **File**: `backend/routes/flights.js`
- **Status**: ✅ Fully integrated
- **Features**:
  - Multi-provider support (Amadeus + Sabre)
  - Provider selection via query parameter: `?provider=sabre` or `?provider=amadeus` or `?provider=all`
  - Combined results from both providers
  - Automatic fallback if one provider fails

### 3. **Hotels Route**
- **File**: `backend/routes/hotels.js`
- **Status**: ✅ Fully integrated
- **Features**:
  - Multi-provider hotel search (Amadeus + Sabre)
  - Provider selection via query parameter
  - Combined results sorted by price
  - Automatic fallback if one provider fails

### 4. **Packages Route**
- **File**: `backend/routes/packages.js`
- **Status**: ✅ Fully integrated
- **Features**:
  - Vacation packages from both providers
  - Combines Sabre flights + Amadeus hotels or vice versa
  - Provider selection for flights and hotels independently
  - Source tracking for each package component

### 3. **Environment Configuration**
- **File**: `backend/.env`
- **Status**: ⚠️ Credentials needed
- **Required Variables**:
  ```
  SABRE_CLIENT_ID=your_sabre_client_id
  SABRE_CLIENT_SECRET=your_sabre_client_secret
  SABRE_REST_API_URL=https://api.havail.sabre.com
  ```

## 🔧 Setup Instructions

### Getting Sabre API Credentials

1. **Sign up** at https://developer.sabre.com/
2. **Create a new application** in the Sabre Developer Portal
3. **Copy your credentials**:
   - Client ID
   - Client Secret
4. **Update** your `.env` file with the credentials

### Testing Environments

- **Certification (Testing)**: `https://api-crt.cert.havail.sabre.com`
- **Production**: `https://api.havail.sabre.com`

## 📊 API Usage

### Flight Search with Sabre Only
```bash
curl "http://localhost:5000/api/flights?from=LAX&to=JFK&date=2025-12-01&passengers=2&tripType=roundtrip&returnDate=2025-12-10&provider=sabre"
```

### Hotel Search with Both Providers
```bash
curl "http://localhost:5000/api/hotels?cityCode=NYC&checkInDate=2025-12-01&checkOutDate=2025-12-05&adults=2&roomQuantity=1&provider=all"
```

### Vacation Packages with Mixed Providers
```bash
curl "http://localhost:5000/api/packages/search?destinationCode=NYC&departureCityCode=LAX&checkIn=2025-12-10&checkOut=2025-12-15&adults=2&children=0&packageType=all-inclusive&flightClass=economy&rooms=1&provider=all"
```

### Response Format
```json
{
  "success": true,
  "count": 25,
  "data": [...],
  "sources": {
    "amadeus": 15,
    "sabre": 10
  }
}
```

**For Packages:**
```json
{
  "success": true,
  "count": 12,
  "data": [...],
  "sources": {
    "amadeus": {
      "flights": 10,
      "hotels": 8
    },
    "sabre": {
      "flights": 5,
      "hotels": 4
    },
    "combined": 12
  }
}
```

## ⏳ Pending Integration

**All routes now integrated! ✅**

## 🚀 Current Capabilities

### ✅ Working with Sabre (All Features Complete)
- ✅ Flight search (one-way and round-trip)
- ✅ Hotel search with pricing
- ✅ Vacation packages (flights + hotels)
- ✅ Multi-passenger support
- ✅ Cabin class selection (Economy, Premium Economy, Business, First)
- ✅ Connection flights with layover information
- ✅ Price comparisons between providers
- ✅ Automatic provider fallback
- ✅ Mixed provider packages (Sabre flights + Amadeus hotels)

### ⏳ Planned Features
- ⏳ Car rental integration
- ⏳ Price alerts and monitoring
- ⏳ Historical price tracking

## 📝 Notes

- Sabre API requires valid credentials to work
- Currently set to use certification environment (testing)
- Switch to production URL once you have production credentials
- Both Amadeus and Sabre can be used simultaneously for maximum flight options
- Results are automatically merged and sorted by price

## 🔗 Useful Links

- [Sabre Developer Portal](https://developer.sabre.com/)
- [Sabre API Documentation](https://developer.sabre.com/docs/rest_apis)
- [Getting Started Guide](https://developer.sabre.com/guides/getting-started)
