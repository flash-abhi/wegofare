# Airline Logos and Data

This directory contains SVG logos for major airlines worldwide and the airline data API.

## Available Airlines

### North American Airlines
- **American Airlines (AA)** - United States
- **Delta Air Lines (DL)** - United States
- **United Airlines (UA)** - United States
- **Southwest Airlines (WN)** - United States
- **JetBlue Airways (B6)** - United States
- **Alaska Airlines (AS)** - United States
- **Air Canada (AC)** - Canada
- **WestJet (WS)** - Canada

### European Airlines
- **British Airways (BA)** - United Kingdom
- **Lufthansa (LH)** - Germany
- **Air France (AF)** - France
- **KLM Royal Dutch Airlines (KL)** - Netherlands
- **Iberia (IB)** - Spain
- **TAP Air Portugal (TP)** - Portugal
- **ITA Airways (AZ)** - Italy
- **Swiss International Air Lines (LX)** - Switzerland
- **Austrian Airlines (OS)** - Austria
- **Brussels Airlines (SN)** - Belgium
- **Finnair (AY)** - Finland
- **Scandinavian Airlines (SK)** - Sweden
- **Ryanair (FR)** - Ireland
- **easyJet (U2)** - United Kingdom
- **Vueling (VY)** - Spain
- **Wizz Air (W6)** - Hungary

### Middle Eastern Airlines
- **Emirates (EK)** - United Arab Emirates
- **Qatar Airways (QR)** - Qatar
- **Etihad Airways (EY)** - United Arab Emirates
- **Saudi Arabian Airlines (SV)** - Saudi Arabia
- **Turkish Airlines (TK)** - Turkey

### Asian Airlines
- **Singapore Airlines (SQ)** - Singapore
- **Cathay Pacific (CX)** - Hong Kong
- **All Nippon Airways (NH)** - Japan
- **Japan Airlines (JL)** - Japan
- **Korean Air (KE)** - South Korea
- **Thai Airways (TG)** - Thailand
- **Air India (AI)** - India
- **IndiGo (6E)** - India
- **Air China (CA)** - China
- **China Southern Airlines (CZ)** - China
- **China Eastern Airlines (MU)** - China

### Oceanian Airlines
- **Qantas (QF)** - Australia
- **Virgin Australia (VA)** - Australia

### Latin American Airlines
- **LATAM Airlines (LA)** - Chile
- **Aeroméxico (AM)** - Mexico
- **Copa Airlines (CM)** - Panama

### African Airlines
- **Ethiopian Airlines (ET)** - Ethiopia
- **South African Airways (SA)** - South Africa

## API Endpoints

### Get All Airlines
```
GET http://localhost:5000/api/airlines
```

**Query Parameters:**
- `search` - Search by airline name, code, or country
- `alliance` - Filter by alliance (Oneworld, Star Alliance, SkyTeam)
- `country` - Filter by country

**Example:**
```bash
# Get all airlines
curl http://localhost:5000/api/airlines

# Search for airlines
curl http://localhost:5000/api/airlines?search=emirates

# Filter by alliance
curl http://localhost:5000/api/airlines?alliance=Star%20Alliance

# Filter by country
curl http://localhost:5000/api/airlines?country=United%20States
```

### Get Airline by Code
```
GET http://localhost:5000/api/airlines/:code
```

**Example:**
```bash
# Get Emirates details
curl http://localhost:5000/api/airlines/EK

# Get British Airways details
curl http://localhost:5000/api/airlines/BA
```

## Logo Files

All logos are available as SVG files at:
```
http://localhost:5000/airlines/{airline-name}.svg
```

**Examples:**
- `http://localhost:5000/airlines/emirates.svg`
- `http://localhost:5000/airlines/british-airways.svg`
- `http://localhost:5000/airlines/delta.svg`
- `http://localhost:5000/airlines/singapore.svg`

## Alliance Information

### Star Alliance (28 members globally)
Major carriers: United Airlines, Lufthansa, Air Canada, Singapore Airlines, ANA, Thai Airways, Air China, Turkish Airlines, etc.

### Oneworld (14 members globally)
Major carriers: American Airlines, British Airways, Cathay Pacific, Qantas, Japan Airlines, Qatar Airways, Iberia, Finnair, etc.

### SkyTeam (19 members globally)
Major carriers: Delta Air Lines, Air France, KLM, Korean Air, China Eastern, Aeroméxico, Saudi Arabian Airlines, etc.

## Usage in Frontend

The flight results automatically display airline logos when available:

```javascript
// In FlightResults.js
{flight.airlineLogo && (
  <img 
    src={flight.airlineLogo} 
    alt={flight.airlineName}
    className="airline-logo"
  />
)}
```

## Adding New Airlines

To add a new airline:

1. Create an SVG logo file in `/backend/public/airlines/{airline-code}.svg`
2. Add airline data to `/backend/data/airlines.js`:

```javascript
'XX': {
  code: 'XX',
  name: 'Airline Name',
  logo: '/airlines/airline-name.svg',
  country: 'Country',
  alliance: 'Alliance Name or null'
}
```

3. Restart the backend server

## Logo Design Guidelines

- **Size:** 200x60px viewBox
- **Format:** SVG
- **Background:** Brand color
- **Text:** White or brand color
- **Font:** Arial or similar sans-serif
- **Style:** Clean and minimal
