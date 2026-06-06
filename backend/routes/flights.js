const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const { getAirlineByCode } = require('../data/airlines');
const { searchFlights: amadeusSearchFlights } = require('../utils/amadeusApi');
const { searchFlights: duffelSearchFlights, transformDuffelOffer, duffelEnabled } = require('../utils/duffelApi');
const { searchSabreFlights, isConfigured: sabreConfigured } = require('../services/sabreService');

// Check if APIs are configured
const amadeusEnabled = !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
const sabreEnabled = sabreConfigured();

// Get all flights with filters (using Amadeus + Duffel APIs)
router.get('/', async (req, res) => {
  try {
    const { from, to, date, passengers, tripType, returnDate, airline, source: preferredSource } = req.query;

    // Require basic search params
    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, and date are required.',
        source: 'api'
      });
    }

    // If no external API is configured, we'll rely solely on the
    // database fallback instead of failing the request outright.
    if (!amadeusEnabled && !duffelEnabled && !sabreEnabled) {
      console.warn('No external flight API configured; using database fallback only.');
    }

    const searchParams = {
      originLocationCode: from.toUpperCase(),
      destinationLocationCode: to.toUpperCase(),
      departureDate: date,
      adults: passengers || '1',
      max: '50'
    };

    // Add return date for roundtrip
    if (tripType === 'roundtrip' && returnDate) {
      searchParams.returnDate = returnDate;
    }

    // Add airline filter if specified
    if (airline) {
      searchParams.includedAirlineCodes = airline.toUpperCase();
    }

    let allFlights = [];
    let sources = [];
    let errors = [];

    // Search both APIs in parallel
    const apiPromises = [];

    // Amadeus search
    if (amadeusEnabled && preferredSource !== 'duffel') {
      apiPromises.push(
        (async () => {
          try {
            console.log('🔍 Searching Amadeus with params:', searchParams);
            const response = await amadeusSearchFlights(searchParams);
            return { source: 'amadeus', data: response.data, error: null };
          } catch (error) {
            console.error('❌ Amadeus API Error:', error.message);
            return { source: 'amadeus', data: [], error: error.message };
          }
        })()
      );
    }

    // Duffel search (has better LCC coverage - IndiGo, Spirit, etc.)
    if (duffelEnabled && preferredSource !== 'amadeus') {
      apiPromises.push(
        (async () => {
          try {
            console.log('🔍 Searching Duffel with params:', searchParams);
            const offers = await duffelSearchFlights(searchParams);
            return { source: 'duffel', data: offers, error: null };
          } catch (error) {
            console.error('❌ Duffel API Error:', error.message);
            return { source: 'duffel', data: [], error: error.message };
          }
        })()
      );
    }

    // Sabre search
    if (sabreEnabled && preferredSource !== 'amadeus' && preferredSource !== 'duffel') {
      apiPromises.push(
        (async () => {
          try {
            console.log('🔍 Searching Sabre with params:', { from, to, date, passengers, tripType, returnDate, airline });
            const result = await searchSabreFlights({
              from: from.toUpperCase(),
              to: to.toUpperCase(),
              date,
              passengers: passengers || '1',
              tripType,
              returnDate,
              airline
            });
            if (result.success) {
              return { source: 'sabre', data: result.data, error: null };
            } else {
              return { source: 'sabre', data: [], error: result.error?.message || result.reason };
            }
          } catch (error) {
            console.error('❌ Sabre API Error:', error.message);
            return { source: 'sabre', data: [], error: error.message };
          }
        })()
      );
    }

    // Wait for all API calls
    const results = await Promise.all(apiPromises);

    // Process results from each API
    for (const result of results) {
      if (result.error) {
        errors.push({ source: result.source, error: result.error });
      }

      if (result.data && result.data.length > 0) {
        sources.push(result.source);

        if (result.source === 'amadeus') {
          // Transform Amadeus data
          const amadeusFlights = result.data.map(offer => transformAmadeusOffer(offer, searchParams, getAirlineByCode));
          allFlights.push(...amadeusFlights);
        } else if (result.source === 'duffel') {
          // Transform Duffel data
          const duffelFlights = result.data.map(offer => transformDuffelOffer(offer, searchParams));
          allFlights.push(...duffelFlights);
        }
      }
    }

    // If we have flights, return them
    if (allFlights.length > 0) {
      // Sort by price
      allFlights.sort((a, b) => a.price - b.price);

      return res.json({
        success: true,
        count: allFlights.length,
        data: allFlights,
        sources: sources,
        note: sources.length > 1 ? 'Combined results from multiple providers' : undefined
      });
    }

    // If no flights from APIs, try database fallback
    console.log('⚠️ No flights from APIs, falling back to database...');
    try {
      let query = {};
      if (from) query['from.code'] = from.toUpperCase();
      if (to) query['to.code'] = to.toUpperCase();
      if (airline) query['airline'] = airline.toUpperCase();
      if (date) {
        const searchDate = new Date(date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        query['departure.date'] = { $gte: searchDate, $lt: nextDay };
      }
      
      const dbFlights = await Flight.find(query).sort({ 'departure.date': 1, 'departure.time': 1 });
      
      if (dbFlights.length > 0) {
        return res.json({
          success: true,
          count: dbFlights.length,
          data: dbFlights,
          sources: ['database'],
          note: 'APIs temporarily unavailable, showing cached flights'
        });
      }
    } catch (dbError) {
      console.error('Database fallback also failed:', dbError.message);
      errors.push({ source: 'database', error: dbError.message });
    }

    // No flights found anywhere
    return res.json({
      success: true,
      count: 0,
      data: [],
      sources: [],
      message: 'No flights found for this route and date.',
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flights',
      error: error.message,
      source: 'api'
    });
  }
});

// Helper function to transform Amadeus offer to standard format
function transformAmadeusOffer(offer, searchParams, getAirlineByCode) {
  const { originLocationCode: from, destinationLocationCode: to, departureDate: date, returnDate } = searchParams;
  const outbound = offer.itineraries[0];
  const returnFlight = offer.itineraries[1];
  const airlineCode = outbound.segments[0].carrierCode;
  const airlineInfo = getAirlineByCode(airlineCode);
  
  // Convert price to USD if needed
  let priceInUSD = parseFloat(offer.price.total);
  const originalCurrency = offer.price.currency;
  
  const exchangeRates = {
    'EUR': 1.10, 'GBP': 1.27, 'CAD': 0.74, 'AUD': 0.65,
    'JPY': 0.0067, 'CNY': 0.14, 'INR': 0.012, 'USD': 1.0
  };
  
  if (originalCurrency !== 'USD' && exchangeRates[originalCurrency]) {
    priceInUSD = priceInUSD * exchangeRates[originalCurrency];
  }
  
  // Parse segments for connecting flights
  const segments = outbound.segments.map(seg => ({
    flightNumber: `${seg.carrierCode}${seg.number}`,
    from: { code: seg.departure.iataCode, name: seg.departure.iataCode, city: seg.departure.iataCode },
    to: { code: seg.arrival.iataCode, name: seg.arrival.iataCode, city: seg.arrival.iataCode },
    departure: {
      time: new Date(seg.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: seg.departure.terminal
    },
    arrival: {
      time: new Date(seg.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: seg.arrival.terminal
    },
    duration: seg.duration,
    aircraft: seg.aircraft?.code || 'Unknown',
    cabin: offer.travelerPricings[0].fareDetailsBySegment[0].cabin
  }));
  
  // Calculate stopovers
  const stopovers = [];
  for (let i = 0; i < outbound.segments.length - 1; i++) {
    const currentSeg = outbound.segments[i];
    const nextSeg = outbound.segments[i + 1];
    const arrivalTime = new Date(currentSeg.arrival.at);
    const departureTime = new Date(nextSeg.departure.at);
    const layoverMinutes = Math.floor((departureTime - arrivalTime) / 60000);
    const layoverHours = Math.floor(layoverMinutes / 60);
    const layoverMins = layoverMinutes % 60;
    
    stopovers.push({
      airport: currentSeg.arrival.iataCode,
      city: currentSeg.arrival.iataCode,
      duration: `${layoverHours}h ${layoverMins}m`,
      terminal: currentSeg.arrival.terminal
    });
  }
  
  // Process return flight for roundtrip
  let returnFlightData = null;
  if (returnFlight) {
    const returnSegments = returnFlight.segments.map(seg => ({
      flightNumber: `${seg.carrierCode}${seg.number}`,
      from: { code: seg.departure.iataCode, name: seg.departure.iataCode, city: seg.departure.iataCode },
      to: { code: seg.arrival.iataCode, name: seg.arrival.iataCode, city: seg.arrival.iataCode },
      departure: {
        time: new Date(seg.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: seg.departure.terminal
      },
      arrival: {
        time: new Date(seg.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: seg.arrival.terminal
      },
      duration: seg.duration,
      aircraft: seg.aircraft?.code || 'Unknown',
      cabin: offer.travelerPricings[0].fareDetailsBySegment[returnFlight.segments.length]?.cabin || 'ECONOMY'
    }));

    const returnStopovers = [];
    for (let i = 0; i < returnFlight.segments.length - 1; i++) {
      const currentSeg = returnFlight.segments[i];
      const nextSeg = returnFlight.segments[i + 1];
      const arrivalTime = new Date(currentSeg.arrival.at);
      const departureTime = new Date(nextSeg.departure.at);
      const layoverMinutes = Math.floor((departureTime - arrivalTime) / 60000);
      const layoverHours = Math.floor(layoverMinutes / 60);
      const layoverMins = layoverMinutes % 60;
      
      returnStopovers.push({
        airport: currentSeg.arrival.iataCode,
        city: currentSeg.arrival.iataCode,
        duration: `${layoverHours}h ${layoverMins}m`,
        terminal: currentSeg.arrival.terminal
      });
    }

    returnFlightData = {
      flightNumber: `${returnFlight.segments[0].carrierCode}${returnFlight.segments[0].number}`,
      departure: {
        date: returnDate,
        time: new Date(returnFlight.segments[0].departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: returnFlight.segments[0].departure.terminal
      },
      arrival: {
        time: new Date(returnFlight.segments[returnFlight.segments.length - 1].arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: returnFlight.segments[returnFlight.segments.length - 1].arrival.terminal
      },
      duration: returnFlight.duration,
      stops: returnFlight.segments.length - 1,
      stopover: returnStopovers.length > 0 ? returnStopovers : undefined,
      segments: returnSegments.length > 1 ? returnSegments : undefined
    };
  }
  
  return {
    id: offer.id,
    airline: airlineCode,
    airlineName: airlineInfo.name,
    airlineLogo: airlineInfo.logo,
    flightNumber: `${airlineCode}${outbound.segments[0].number}`,
    from: {
      code: from,
      name: from,
      city: from,
      airport: outbound.segments[0].departure.iataCode
    },
    to: {
      code: to,
      name: to,
      city: to,
      airport: outbound.segments[outbound.segments.length - 1].arrival.iataCode
    },
    departure: {
      date: date,
      time: new Date(outbound.segments[0].departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: outbound.segments[0].departure.terminal
    },
    arrival: {
      time: new Date(outbound.segments[outbound.segments.length - 1].arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: outbound.segments[outbound.segments.length - 1].arrival.terminal
    },
    duration: outbound.duration,
    price: Math.round(priceInUSD * 100) / 100,
    originalPrice: parseFloat(offer.price.total),
    currency: 'USD',
    originalCurrency: originalCurrency,
    stops: outbound.segments.length - 1,
    stopover: stopovers.length > 0 ? stopovers : undefined,
    segments: segments.length > 1 ? segments : undefined,
    aircraft: outbound.segments[0].aircraft?.code || 'Unknown',
    class: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
    seatsAvailable: offer.numberOfBookableSeats || 9,
    amenities: {
      wifi: true,
      entertainment: true,
      meals: outbound.segments.length > 1
    },
    returnFlight: returnFlightData,
    tripType: returnFlightData ? 'roundtrip' : 'oneway',
    source: 'amadeus'
  };
}

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      data: flight
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching flight',
      error: error.message
    });
  }
});

// Create new flight (admin)
router.post('/', async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    
    res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      data: flight
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating flight',
      error: error.message
    });
  }
});

// Update flight
router.put('/:id', async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Flight updated successfully',
      data: flight
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating flight',
      error: error.message
    });
  }
});

// Delete flight
router.delete('/:id', async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Flight deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting flight',
      error: error.message
    });
  }
});

// Get seat map for a flight
router.post('/seatmap', async (req, res) => {
  try {
    const { flightOfferId } = req.body;

    if (!flightOfferId) {
      return res.status(400).json({
        success: false,
        message: 'Flight offer ID is required'
      });
    }

    if (amadeus) {
      try {
        // Call Amadeus Seatmap Display API
        const response = await amadeus.shopping.seatmaps.post(
          JSON.stringify({
            data: [{ type: 'flight-offer', id: flightOfferId }]
          })
        );

        return res.json({
          success: true,
          data: response.data,
          source: 'amadeus'
        });
      } catch (amadeusError) {
        console.error('Amadeus Seatmap API Error:', amadeusError.message);
      }
    }

    // Return mock seat map as fallback
    res.json({
      success: true,
      data: generateMockSeatMap(),
      source: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seat map',
      error: error.message
    });
  }
});

// Generate mock seat map (fallback)
function generateMockSeatMap() {
  const rows = 30;
  const seats = [];
  
  for (let row = 1; row <= rows; row++) {
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(seat => {
      const seatNumber = `${row}${seat}`;
      const isAisle = seat === 'C' || seat === 'D';
      const isWindow = seat === 'A' || seat === 'F';
      const isExit = row === 12 || row === 25;
      
      seats.push({
        number: seatNumber,
        available: Math.random() > 0.3,
        type: isExit ? 'exit' : (isWindow ? 'window' : (isAisle ? 'aisle' : 'middle')),
        price: isExit ? 25 : (isWindow ? 15 : 0),
        characteristics: {
          legroom: isExit ? 'extra' : 'standard',
          recline: row < 5 ? 'none' : 'standard'
        }
      });
    });
  }
  
  return {
    decks: [{
      deckType: 'MAIN',
      seats: seats
    }]
  };
}

module.exports = router;
