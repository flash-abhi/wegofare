/**
 * Custom Amadeus API client using native fetch
 * Works with Node.js 18+ and bypasses SDK compatibility issues
 */

const AMADEUS_BASE_URL = 'https://api.amadeus.com';

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Amadeus credentials');
  }

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Amadeus auth failed: ${error.error_description || response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);
  
  return cachedToken;
}

async function searchFlights(params) {
  const token = await getAccessToken();
  
  const queryParams = new URLSearchParams({
    originLocationCode: params.originLocationCode,
    destinationLocationCode: params.destinationLocationCode,
    departureDate: params.departureDate,
    adults: params.adults || '1',
    max: params.max || '50',
  });

  if (params.returnDate) {
    queryParams.append('returnDate', params.returnDate);
  }
  if (params.includedAirlineCodes) {
    queryParams.append('includedAirlineCodes', params.includedAirlineCodes);
  }
  if (params.nonStop) {
    queryParams.append('nonStop', 'true');
  }
  if (params.travelClass) {
    queryParams.append('travelClass', params.travelClass);
  }

  const response = await fetch(
    `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = error.errors?.[0]?.detail || error.error_description || response.statusText;
    const err = new Error(`Amadeus API error: ${errorMsg}`);
    err.statusCode = response.status;
    err.response = { body: error, statusCode: response.status };
    throw err;
  }

  const data = await response.json();
  return { data: data.data || [], dictionaries: data.dictionaries };
}

/**
 * Search for hotels by city
 */
async function searchHotelsByCity(params) {
  const token = await getAccessToken();
  
  const queryParams = new URLSearchParams({
    cityCode: params.cityCode,
  });

  if (params.radius) queryParams.append('radius', params.radius);
  if (params.radiusUnit) queryParams.append('radiusUnit', params.radiusUnit);
  if (params.ratings) queryParams.append('ratings', params.ratings);

  const response = await fetch(
    `${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = error.errors?.[0]?.detail || error.error_description || response.statusText;
    throw new Error(`Amadeus Hotel Search error: ${errorMsg}`);
  }

  const data = await response.json();
  return { data: data.data || [] };
}

/**
 * Get hotel offers/prices
 */
async function getHotelOffers(params) {
  const token = await getAccessToken();
  
  const queryParams = new URLSearchParams({
    hotelIds: params.hotelIds,
    adults: params.adults || '1',
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
  });

  if (params.roomQuantity) queryParams.append('roomQuantity', params.roomQuantity);
  if (params.currency) queryParams.append('currency', params.currency);

  const response = await fetch(
    `${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = error.errors?.[0]?.detail || error.error_description || response.statusText;
    throw new Error(`Amadeus Hotel Offers error: ${errorMsg}`);
  }

  const data = await response.json();
  return { data: data.data || [] };
}

/**
 * Search for activities/tours by location
 */
async function searchActivities(params) {
  const token = await getAccessToken();
  
  const queryParams = new URLSearchParams({
    latitude: params.latitude,
    longitude: params.longitude,
  });

  if (params.radius) queryParams.append('radius', params.radius);

  const response = await fetch(
    `${AMADEUS_BASE_URL}/v1/shopping/activities?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMsg = error.errors?.[0]?.detail || error.error_description || response.statusText;
    throw new Error(`Amadeus Activities error: ${errorMsg}`);
  }

  const data = await response.json();
  return { data: data.data || [] };
}

/**
 * Get city/airport coordinates for activity search
 */
async function getCityCoordinates(cityCode) {
  const token = await getAccessToken();
  
  const response = await fetch(
    `${AMADEUS_BASE_URL}/v1/reference-data/locations?subType=CITY&keyword=${cityCode}&page[limit]=1`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.data && data.data[0]) {
    return {
      latitude: data.data[0].geoCode?.latitude,
      longitude: data.data[0].geoCode?.longitude,
      name: data.data[0].name,
      cityCode: data.data[0].iataCode
    };
  }
  return null;
}

/**
 * Search for vacation packages (combines flights + hotels)
 */
async function searchVacationPackages(params) {
  const { originCode, destinationCode, departureDate, returnDate, adults, rooms } = params;
  
  // Search flights and hotels in parallel
  const [flightsResult, cityInfo] = await Promise.all([
    searchFlights({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: departureDate,
      returnDate: returnDate,
      adults: adults || '1',
      max: '10'
    }).catch(() => ({ data: [] })),
    getCityCoordinates(destinationCode)
  ]);

  // Search hotels if we have city info
  let hotelsResult = { data: [] };
  if (cityInfo) {
    try {
      const hotelList = await searchHotelsByCity({ 
        cityCode: destinationCode, 
        radius: '50',
        radiusUnit: 'KM' 
      });
      
      if (hotelList.data.length > 0) {
        const hotelIds = hotelList.data.slice(0, 20).map(h => h.hotelId).join(',');
        hotelsResult = await getHotelOffers({
          hotelIds,
          checkInDate: departureDate,
          checkOutDate: returnDate,
          adults: adults || '1',
          roomQuantity: rooms || '1'
        }).catch(() => ({ data: [] }));
      }
    } catch (e) {
      console.log('Hotel search failed:', e.message);
    }
  }

  // Search activities
  let activitiesResult = { data: [] };
  if (cityInfo?.latitude && cityInfo?.longitude) {
    try {
      activitiesResult = await searchActivities({
        latitude: cityInfo.latitude,
        longitude: cityInfo.longitude,
        radius: '20'
      }).catch(() => ({ data: [] }));
    } catch (e) {
      console.log('Activities search failed:', e.message);
    }
  }

  return {
    flights: flightsResult.data,
    hotels: hotelsResult.data,
    activities: activitiesResult.data,
    destination: cityInfo
  };
}

module.exports = {
  getAccessToken,
  searchFlights,
  searchHotelsByCity,
  getHotelOffers,
  searchActivities,
  getCityCoordinates,
  searchVacationPackages,
};
