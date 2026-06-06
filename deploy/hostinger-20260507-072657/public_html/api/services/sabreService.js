const axios = require('axios');
const { getAirlineByCode } = require('../data/airlines');

let cachedToken = null;
let tokenExpiry = 0;

const getConfig = () => ({
  clientId: process.env.SABRE_CLIENT_ID,
  clientSecret: process.env.SABRE_CLIENT_SECRET,
  baseUrl: (process.env.SABRE_BASE_URL || process.env.SABRE_ENV || '').replace(/\/$/, '') || 'https://api-crt.cert.havail.sabre.com',
  pointOfSaleCountry: process.env.SABRE_POS_COUNTRY || 'US'
});

const isConfigured = () => {
  const { clientId, clientSecret } = getConfig();
  return Boolean(clientId && clientSecret);
};

const buildAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
});

const sabreTimeToDisplay = (value) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().substring(11, 16);
    }
    return value.substring(11, 16);
  } catch (error) {
    return value;
  }
};

const normalizeSegments = (segments, searchParams) => {
  if (!Array.isArray(segments)) {
    return [];
  }

  return segments.map((segment, index) => {
    const marketingCarrier = segment.MarketingAirline || segment.OperatingAirline || {};
    const departureAirport = segment.DepartureAirport || {};
    const arrivalAirport = segment.ArrivalAirport || {};

    return {
      flightNumber: `${marketingCarrier.Code || ''}${segment.FlightNumber || ''}`.trim(),
      from: {
        code: departureAirport.LocationCode || searchParams.from,
        name: departureAirport.LocationCode || '',
        city: departureAirport.LocationCode || ''
      },
      to: {
        code: arrivalAirport.LocationCode || searchParams.to,
        name: arrivalAirport.LocationCode || '',
        city: arrivalAirport.LocationCode || ''
      },
      departure: {
        time: sabreTimeToDisplay(segment.DepartureDateTime),
        terminal: segment.DepartureAirport?.Terminal || undefined
      },
      arrival: {
        time: sabreTimeToDisplay(segment.ArrivalDateTime),
        terminal: segment.ArrivalAirport?.Terminal || undefined
      },
      duration: segment.ElapsedTime ? `${Math.floor(segment.ElapsedTime / 60)}h ${segment.ElapsedTime % 60}m` : undefined,
      aircraft: segment.Equipment?.AirEquipType || undefined,
      cabin: segment.Cabin || segment.ResBookDesigCode || undefined,
      id: `${segment.FlightNumber || index}-${index}`
    };
  });
};

const buildFlightObject = (itinerary, index, searchParams) => {
  const options = itinerary?.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption || [];
  const pricing = itinerary?.AirItineraryPricingInfo?.[0]?.ItinTotalFare?.TotalFare;
  const currency = pricing?.CurrencyCode || 'USD';
  const priceAmount = pricing?.Amount ? Number(pricing.Amount) : 0;

  const outboundOption = options[0];
  const outboundSegmentsRaw = outboundOption?.FlightSegment;
  const outboundSegments = Array.isArray(outboundSegmentsRaw)
    ? outboundSegmentsRaw
    : outboundSegmentsRaw
      ? [outboundSegmentsRaw]
      : [];

  const returnOption = options[1];
  const returnSegmentsRaw = returnOption?.FlightSegment;
  const returnSegments = Array.isArray(returnSegmentsRaw)
    ? returnSegmentsRaw
    : returnSegmentsRaw
      ? [returnSegmentsRaw]
      : [];

  const outboundSegmentsNormalized = normalizeSegments(outboundSegments, searchParams);
  const returnSegmentsNormalized = normalizeSegments(returnSegments, {
    from: searchParams.to,
    to: searchParams.from
  });

  const firstSegment = outboundSegmentsNormalized[0] || {};
  const lastSegment = outboundSegmentsNormalized[outboundSegmentsNormalized.length - 1] || {};
  const airlineCode = outboundSegments?.[0]?.MarketingAirline?.Code || firstSegment?.flightNumber?.slice(0, 2) || 'XX';
  const airlineInfo = getAirlineByCode(airlineCode);

  const formatStops = (segments) => Math.max(segments.length - 1, 0);

  const buildStopovers = (segments) => {
    if (!Array.isArray(segments) || segments.length <= 1) {
      return undefined;
    }

    return segments.slice(0, -1).map((segment, segmentIndex) => ({
      airport: segment.ArrivalAirport?.LocationCode || segment.to?.code || 'Stop',
      city: segment.ArrivalAirport?.LocationCode || segment.to?.city || 'Stop',
      duration: segment.ElapsedTime
        ? `${Math.floor(segment.ElapsedTime / 60)}h ${segment.ElapsedTime % 60}m`
        : undefined,
      id: `${segment.ArrivalAirport?.LocationCode || segmentIndex}-${segmentIndex}`
    }));
  };

  const itineraryId = itinerary?.SequenceNumber || itinerary?.ItinSequenceNumber || index;

  const flight = {
    id: `sabre-${itineraryId}`,
    airline: airlineCode,
    airlineName: airlineInfo?.name || airlineCode,
    airlineLogo: airlineInfo?.logo,
    flightNumber: firstSegment.flightNumber || `SAB${itineraryId}`,
    from: {
      code: firstSegment?.from?.code || searchParams.from,
      name: firstSegment?.from?.name || searchParams.from,
      city: firstSegment?.from?.city || searchParams.from,
      airport: outboundSegments?.[0]?.DepartureAirport?.LocationCode || searchParams.from
    },
    to: {
      code: lastSegment?.to?.code || searchParams.to,
      name: lastSegment?.to?.name || searchParams.to,
      city: lastSegment?.to?.city || searchParams.to,
      airport: outboundSegments?.[outboundSegments.length - 1]?.ArrivalAirport?.LocationCode || searchParams.to
    },
    departure: {
      date: searchParams.date,
      time: firstSegment?.departure?.time || sabreTimeToDisplay(outboundSegments?.[0]?.DepartureDateTime),
      terminal: outboundSegments?.[0]?.DepartureAirport?.Terminal
    },
    arrival: {
      time: lastSegment?.arrival?.time || sabreTimeToDisplay(outboundSegments?.[outboundSegments.length - 1]?.ArrivalDateTime),
      terminal: outboundSegments?.[outboundSegments.length - 1]?.ArrivalAirport?.Terminal
    },
    duration: outboundOption?.ElapsedTime
      ? `${Math.floor(outboundOption.ElapsedTime / 60)}h ${outboundOption.ElapsedTime % 60}m`
      : undefined,
    price: Number.isFinite(priceAmount) ? Math.round(priceAmount * 100) / 100 : 0,
    originalPrice: Number.isFinite(priceAmount) ? priceAmount : undefined,
    currency,
    originalCurrency: currency,
    stops: formatStops(outboundSegmentsNormalized),
    stopover: buildStopovers(outboundSegments),
    segments: outboundSegmentsNormalized.length > 1 ? outboundSegmentsNormalized : undefined,
    aircraft: outboundSegments?.[0]?.Equipment?.AirEquipType || undefined,
    class: outboundSegments?.[0]?.Cabin || undefined,
    seatsAvailable: itinerary?.AirItineraryPricingInfo?.[0]?.PTC_FareBreakdowns?.[0]?.PassengerFare?.FareComponents?.length || undefined,
    amenities: {
      wifi: false,
      entertainment: false,
      meals: outboundSegmentsNormalized.length > 1
    },
    tripType: returnSegmentsNormalized.length > 0 ? 'roundtrip' : 'oneway',
    source: 'sabre'
  };

  if (returnSegmentsNormalized.length > 0) {
    const firstReturn = returnSegmentsNormalized[0];
    const lastReturn = returnSegmentsNormalized[returnSegmentsNormalized.length - 1];
    flight.returnFlight = {
      flightNumber: firstReturn.flightNumber,
      departure: {
        date: searchParams.returnDate || searchParams.date,
        time: firstReturn.departure?.time,
        terminal: returnSegments?.[0]?.DepartureAirport?.Terminal
      },
      arrival: {
        time: lastReturn.arrival?.time,
        terminal: returnSegments?.[returnSegments.length - 1]?.ArrivalAirport?.Terminal
      },
      duration: returnOption?.ElapsedTime
        ? `${Math.floor(returnOption.ElapsedTime / 60)}h ${returnOption.ElapsedTime % 60}m`
        : undefined,
      stops: formatStops(returnSegmentsNormalized),
      stopover: buildStopovers(returnSegments),
      segments: returnSegmentsNormalized.length > 1 ? returnSegmentsNormalized : undefined
    };
  }

  return flight;
};

const fetchSabreToken = async () => {
  if (!isConfigured()) {
    throw new Error('Sabre credentials are not configured');
  }

  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const { clientId, clientSecret, baseUrl } = getConfig();

  try {
    const response = await axios.post(
      `${baseUrl}/v2/auth/token`,
      new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        }
      }
    );

    const { access_token: accessToken, expires_in: expiresIn } = response.data || {};

    if (!accessToken) {
      throw new Error('Sabre token response missing access_token');
    }

    cachedToken = accessToken;
    tokenExpiry = now + (Number(expiresIn || 1800) * 1000);
    return cachedToken;
  } catch (error) {
    cachedToken = null;
    tokenExpiry = 0;
    throw error;
  }
};

const searchSabreFlights = async ({
  from,
  to,
  date,
  passengers = '1',
  tripType = 'oneway',
  returnDate,
  airline
}) => {
  if (!from || !to || !date) {
    return {
      success: false,
      skipped: true,
      reason: 'Missing required search parameters for Sabre'
    };
  }

  if (!isConfigured()) {
    return {
      success: false,
      skipped: true,
      reason: 'Sabre credentials are not configured'
    };
  }

  try {
    const token = await fetchSabreToken();
    const { baseUrl, pointOfSaleCountry } = getConfig();

    const params = {
      origin: from.toUpperCase(),
      destination: to.toUpperCase(),
      departuredate: date,
      pointofsalecountry: pointOfSaleCountry,
      limit: 50,
      offset: 1,
      sortby: 'totalFare',
      order: 'asc'
    };

    if (tripType === 'roundtrip' && returnDate) {
      params.returndate = returnDate;
    }

    if (airline) {
      params.includedcarriers = airline.toUpperCase();
    }

    const response = await axios.get(`${baseUrl}/v1/shop/flights`, {
      params,
      headers: buildAuthHeaders(token),
      timeout: 15_000
    });

    const pricedItineraries = response.data?.PricedItineraries || [];

    if (!Array.isArray(pricedItineraries) || pricedItineraries.length === 0) {
      return {
        success: true,
        data: [],
        meta: {
          provider: 'sabre',
          rawCount: 0
        }
      };
    }

    const normalized = pricedItineraries
      .map((itinerary, index) => buildFlightObject(itinerary, index, {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        date,
        returnDate,
        tripType
      }))
      .filter(Boolean);

    return {
      success: true,
      data: normalized,
      meta: {
        provider: 'sabre',
        rawCount: pricedItineraries.length,
        requestId: response.headers?.['x-sabre-trace-id'] || response.headers?.['sabre-trace-id']
      }
    };
  } catch (error) {
    const statusCode = error?.response?.status || 500;
    return {
      success: false,
      error: {
        message: error?.response?.data?.Message || error.message,
        statusCode,
        details: error?.response?.data || null
      }
    };
  }
};

module.exports = {
  searchSabreFlights,
  fetchSabreToken,
  isConfigured: isConfigured
};
