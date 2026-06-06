const { Duffel } = require('@duffel/api');

// Initialize Duffel client
const duffel = process.env.DUFFEL_ACCESS_TOKEN 
  ? new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN })
  : null;

const duffelEnabled = !!process.env.DUFFEL_ACCESS_TOKEN;

/**
 * Search flights using Duffel API
 * Duffel has excellent LCC coverage including IndiGo, Spirit, Frontier, etc.
 */
async function searchFlights(params) {
  if (!duffel) {
    throw new Error('Duffel API is not configured');
  }

  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults = 1,
    cabinClass = 'economy',
    max = 50
  } = params;

  try {
    // Create an offer request (this searches for flights)
    const slices = [
      {
        origin: originLocationCode,
        destination: destinationLocationCode,
        departure_date: departureDate
      }
    ];

    // Add return slice for roundtrip
    if (returnDate) {
      slices.push({
        origin: destinationLocationCode,
        destination: originLocationCode,
        departure_date: returnDate
      });
    }

    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers: Array(parseInt(adults)).fill({ type: 'adult' }),
      cabin_class: cabinClass,
      return_offers: true, // Return offers inline instead of separate call
      max_connections: 2
    });

    // Get offers from the response
    const offers = offerRequest.data.offers || [];
    
    // Limit results
    return offers.slice(0, parseInt(max));
  } catch (error) {
    console.error('Duffel API Error:', error.message);
    throw error;
  }
}

/**
 * Transform Duffel offer to our standard flight format
 */
function transformDuffelOffer(offer, searchParams) {
  const { originLocationCode, destinationLocationCode, departureDate, returnDate } = searchParams;
  
  const outboundSlice = offer.slices[0];
  const returnSlice = offer.slices[1];
  
  const firstSegment = outboundSlice.segments[0];
  const lastSegment = outboundSlice.segments[outboundSlice.segments.length - 1];
  const airlineCode = firstSegment.marketing_carrier.iata_code || firstSegment.operating_carrier.iata_code;
  
  // Convert price to USD
  let priceInUSD = parseFloat(offer.total_amount);
  const originalCurrency = offer.total_currency;
  
  const exchangeRates = {
    'EUR': 1.10, 'GBP': 1.27, 'CAD': 0.74, 'AUD': 0.65,
    'JPY': 0.0067, 'CNY': 0.14, 'INR': 0.012, 'USD': 1.0
  };
  
  if (originalCurrency !== 'USD' && exchangeRates[originalCurrency]) {
    priceInUSD = priceInUSD * exchangeRates[originalCurrency];
  }

  // Parse outbound segments
  const segments = outboundSlice.segments.map(seg => ({
    flightNumber: `${seg.marketing_carrier.iata_code}${seg.marketing_carrier_flight_number}`,
    from: {
      code: seg.origin.iata_code,
      name: seg.origin.name,
      city: seg.origin.city_name || seg.origin.iata_code
    },
    to: {
      code: seg.destination.iata_code,
      name: seg.destination.name,
      city: seg.destination.city_name || seg.destination.iata_code
    },
    departure: {
      time: new Date(seg.departing_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: seg.origin_terminal
    },
    arrival: {
      time: new Date(seg.arriving_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: seg.destination_terminal
    },
    duration: seg.duration,
    aircraft: seg.aircraft?.name || 'Unknown',
    cabin: outboundSlice.fare_brand_name || 'ECONOMY'
  }));

  // Calculate stopovers
  const stopovers = [];
  for (let i = 0; i < outboundSlice.segments.length - 1; i++) {
    const currentSeg = outboundSlice.segments[i];
    const nextSeg = outboundSlice.segments[i + 1];
    const arrivalTime = new Date(currentSeg.arriving_at);
    const departureTime = new Date(nextSeg.departing_at);
    const layoverMinutes = Math.floor((departureTime - arrivalTime) / 60000);
    const layoverHours = Math.floor(layoverMinutes / 60);
    const layoverMins = layoverMinutes % 60;
    
    stopovers.push({
      airport: currentSeg.destination.iata_code,
      city: currentSeg.destination.city_name || currentSeg.destination.iata_code,
      duration: `${layoverHours}h ${layoverMins}m`,
      terminal: currentSeg.destination_terminal
    });
  }

  // Process return flight
  let returnFlightData = null;
  if (returnSlice) {
    const returnSegments = returnSlice.segments.map(seg => ({
      flightNumber: `${seg.marketing_carrier.iata_code}${seg.marketing_carrier_flight_number}`,
      from: {
        code: seg.origin.iata_code,
        name: seg.origin.name,
        city: seg.origin.city_name || seg.origin.iata_code
      },
      to: {
        code: seg.destination.iata_code,
        name: seg.destination.name,
        city: seg.destination.city_name || seg.destination.iata_code
      },
      departure: {
        time: new Date(seg.departing_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: seg.origin_terminal
      },
      arrival: {
        time: new Date(seg.arriving_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: seg.destination_terminal
      },
      duration: seg.duration,
      aircraft: seg.aircraft?.name || 'Unknown',
      cabin: returnSlice.fare_brand_name || 'ECONOMY'
    }));

    const returnStopovers = [];
    for (let i = 0; i < returnSlice.segments.length - 1; i++) {
      const currentSeg = returnSlice.segments[i];
      const nextSeg = returnSlice.segments[i + 1];
      const arrivalTime = new Date(currentSeg.arriving_at);
      const departureTime = new Date(nextSeg.departing_at);
      const layoverMinutes = Math.floor((departureTime - arrivalTime) / 60000);
      const layoverHours = Math.floor(layoverMinutes / 60);
      const layoverMins = layoverMinutes % 60;
      
      returnStopovers.push({
        airport: currentSeg.destination.iata_code,
        city: currentSeg.destination.city_name || currentSeg.destination.iata_code,
        duration: `${layoverHours}h ${layoverMins}m`,
        terminal: currentSeg.destination_terminal
      });
    }

    const returnFirstSeg = returnSlice.segments[0];
    const returnLastSeg = returnSlice.segments[returnSlice.segments.length - 1];

    returnFlightData = {
      flightNumber: `${returnFirstSeg.marketing_carrier.iata_code}${returnFirstSeg.marketing_carrier_flight_number}`,
      departure: {
        date: returnDate,
        time: new Date(returnFirstSeg.departing_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: returnFirstSeg.origin_terminal
      },
      arrival: {
        time: new Date(returnLastSeg.arriving_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        terminal: returnLastSeg.destination_terminal
      },
      duration: returnSlice.duration,
      stops: returnSlice.segments.length - 1,
      stopover: returnStopovers.length > 0 ? returnStopovers : undefined,
      segments: returnSegments.length > 1 ? returnSegments : undefined
    };
  }

  // Get airline logo URL
  const airlineLogo = firstSegment.marketing_carrier.logo_symbol_url || 
    firstSegment.marketing_carrier.logo_lockup_url ||
    `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airlineCode}.svg`;

  return {
    id: offer.id,
    airline: airlineCode,
    airlineName: firstSegment.marketing_carrier.name,
    airlineLogo: airlineLogo,
    flightNumber: `${airlineCode}${firstSegment.marketing_carrier_flight_number}`,
    from: {
      code: originLocationCode,
      name: firstSegment.origin.name,
      city: firstSegment.origin.city_name || originLocationCode,
      airport: firstSegment.origin.iata_code
    },
    to: {
      code: destinationLocationCode,
      name: lastSegment.destination.name,
      city: lastSegment.destination.city_name || destinationLocationCode,
      airport: lastSegment.destination.iata_code
    },
    departure: {
      date: departureDate,
      time: new Date(firstSegment.departing_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: firstSegment.origin_terminal
    },
    arrival: {
      time: new Date(lastSegment.arriving_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      terminal: lastSegment.destination_terminal
    },
    duration: outboundSlice.duration,
    price: Math.round(priceInUSD * 100) / 100,
    originalPrice: parseFloat(offer.total_amount),
    currency: 'USD',
    originalCurrency: originalCurrency,
    stops: outboundSlice.segments.length - 1,
    stopover: stopovers.length > 0 ? stopovers : undefined,
    segments: segments.length > 1 ? segments : undefined,
    aircraft: firstSegment.aircraft?.name || 'Unknown',
    class: outboundSlice.fare_brand_name || 'ECONOMY',
    seatsAvailable: offer.available_services?.length > 0 ? 9 : 5,
    amenities: {
      wifi: true,
      entertainment: true,
      meals: outboundSlice.segments.length > 1
    },
    returnFlight: returnFlightData,
    tripType: returnFlightData ? 'roundtrip' : 'oneway',
    source: 'duffel'
  };
}

module.exports = {
  searchFlights,
  transformDuffelOffer,
  duffelEnabled
};
