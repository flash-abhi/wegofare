const express = require('express');
const router = express.Router();
const sabreClient = require('../utils/sabreClient');
const { searchFlights, searchHotelsByCity, getHotelOffers } = require('../utils/amadeusApi');

// Check if Amadeus is configured
const amadeusEnabled = !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);

// Mock data generator for packages (fallback when Amadeus API doesn't return enough results)
const generateMockPackages = (destination, departureCity, checkIn, checkOut, adults, children, packageType, flightClass, count = 12) => {
  const airlines = [
    { code: 'AA', name: 'American Airlines', logo: '🛫' },
    { code: 'DL', name: 'Delta Airlines', logo: '✈️' },
    { code: 'UA', name: 'United Airlines', logo: '🛬' },
    { code: 'BA', name: 'British Airways', logo: '✈️' },
    { code: 'EK', name: 'Emirates', logo: '🛫' },
    { code: 'LH', name: 'Lufthansa', logo: '✈️' }
  ];

  const flightPriceMultipliers = {
    'economy': 1,
    'premium-economy': 1.5,
    'business': 2.5,
    'first': 4
  };

  const hotels = [
    { name: 'Paradise Resort & Spa', stars: 5, rating: 4.8, reviews: 1245 },
    { name: 'Oceanview Grand Hotel', stars: 5, rating: 4.7, reviews: 892 },
    { name: 'Tropical Breeze Resort', stars: 4, rating: 4.6, reviews: 1567 },
    { name: 'Sunset Beach Club', stars: 4, rating: 4.5, reviews: 734 },
    { name: 'Azure Waters Hotel', stars: 5, rating: 4.9, reviews: 2103 },
    { name: 'Golden Sands Resort', stars: 4, rating: 4.4, reviews: 956 },
    { name: 'Royal Palm Hotel', stars: 5, rating: 4.8, reviews: 1432 },
    { name: 'Seaside Luxury Resort', stars: 5, rating: 4.7, reviews: 1089 }
  ];

  const images = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'
  ];

  const dining = [
    'International Buffet Restaurant',
    'Italian A La Carte',
    'Asian Fusion Restaurant',
    'Beachside Grill',
    '24/7 Room Service',
    'Poolside Bar & Snacks'
  ];

  const activities = [
    'Water sports (kayaking, paddle boarding)',
    'Scuba diving & snorkeling',
    'Beach volleyball',
    'Fitness center & yoga',
    'Live entertainment & shows',
    'Kids club',
    'Casino',
    'Spa treatments',
    'Tennis courts',
    'Golf nearby',
    'Cooking classes',
    'Dance lessons'
  ];

  const amenities = [
    'Free WiFi',
    'Multiple swimming pools',
    'Private beach access',
    'Spa & wellness center',
    'Fitness center',
    'Kids club',
    'Concierge service',
    'Airport transfers',
    'Laundry service',
    'Non-smoking rooms'
  ];

  const packages = [];
  
  for (let i = 0; i < count; i++) {
    const hotel = hotels[i % hotels.length];
    const airline = airlines[i % airlines.length];
    const flightMultiplier = flightPriceMultipliers[flightClass] || 1;
    
    // Calculate prices
    const hotelBasePrice = hotel.stars === 5 ? 800 + (i * 100) : 600 + (i * 80);
    const flightBasePrice = (400 + (i * 50)) * flightMultiplier;
    const basePrice = hotelBasePrice + flightBasePrice;
    const discount = i % 3 === 0 ? 15 : i % 5 === 0 ? 20 : 0;
    const finalPrice = basePrice - (basePrice * discount / 100);

    // Generate flight times
    const departDate = new Date(checkIn);
    const returnDate = new Date(checkOut);
    
    const outboundDepartTime = `${String(6 + (i % 8)).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`;
    const outboundArrivalTime = `${String(10 + (i % 8)).padStart(2, '0')}:${i % 2 === 0 ? '45' : '15'}`;
    
    const returnDepartTime = `${String(14 + (i % 6)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;
    const returnArrivalTime = `${String(18 + (i % 6)).padStart(2, '0')}:${i % 2 === 0 ? '15' : '45'}`;

    packages.push({
      packageId: `PKG${Date.now()}${i}`,
      hotelName: hotel.name,
      hotelStars: hotel.stars,
      rating: hotel.rating,
      reviews: hotel.reviews,
      location: destination,
      departureCity: departureCity,
      checkIn: checkIn,
      checkOut: checkOut,
      images: images,
      pricePerPerson: Math.round(finalPrice),
      originalPrice: discount > 0 ? Math.round(basePrice) : null,
      discount: discount > 0 ? discount : null,
      packageType: packageType,
      flightClass: flightClass,
      description: `Experience luxury and comfort at ${hotel.name}. This stunning ${hotel.stars}-star resort offers the perfect blend of relaxation and adventure. Enjoy pristine beaches, world-class dining, and endless activities in a tropical paradise.`,
      dining: dining.slice(0, 4 + (i % 3)),
      activities: activities.slice(0, 8 + (i % 5)),
      amenities: amenities,
      flightDetails: {
        outbound: {
          airline: airline.name,
          airlineCode: airline.code,
          flightNumber: `${airline.code}${100 + i}`,
          from: departureCity,
          to: destination,
          departDate: checkIn,
          departTime: outboundDepartTime,
          arrivalTime: outboundArrivalTime,
          duration: `${3 + (i % 5)}h ${15 + (i % 4) * 15}m`,
          stops: i % 4 === 0 ? 0 : 1,
          class: flightClass,
          aircraft: i % 2 === 0 ? 'Boeing 787' : 'Airbus A350'
        },
        return: {
          airline: airline.name,
          airlineCode: airline.code,
          flightNumber: `${airline.code}${200 + i}`,
          from: destination,
          to: departureCity,
          departDate: checkOut,
          departTime: returnDepartTime,
          arrivalTime: returnArrivalTime,
          duration: `${3 + (i % 5)}h ${15 + (i % 4) * 15}m`,
          stops: i % 4 === 0 ? 0 : 1,
          class: flightClass,
          aircraft: i % 2 === 0 ? 'Boeing 787' : 'Airbus A350'
        }
      },
      transfersIncluded: true,
      mealsIncluded: packageType === 'all-inclusive',
      cancellationPolicy: 'Free cancellation up to 30 days before check-in',
      source: 'mock'
    });
  }

  return packages;
};

// GET /api/packages/search - Search for packages using Amadeus API
router.get('/search', async (req, res) => {
  try {
    const { destination, destinationCode, departureCity, departureCityCode, checkIn, checkOut, adults, children, packageType, flightClass, rooms, provider } = req.query;

    // Validate required parameters
    if (!destinationCode || !departureCityCode || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: destinationCode, departureCityCode, checkIn, checkOut'
      });
    }

    const totalTravelers = parseInt(adults || 1) + parseInt(children || 0);
    const roomCount = parseInt(rooms || 1);

    // Use specific provider if requested, otherwise use both for cheapest results
    const useAmadeus = amadeusEnabled && (!provider || provider === 'amadeus' || provider === 'all');
    const useSabre = !provider || provider === 'sabre' || provider === 'all';

    // Search for flights
    let amadeusFlights = [];
    let sabreFlights = [];

    // Try Amadeus flights (using custom fetch-based API)
    if (useAmadeus) {
      try {
        console.log('🔍 Searching Amadeus flights for package:', departureCityCode, '->', destinationCode);
        
        const flightResults = await searchFlights({
          originLocationCode: departureCityCode.toUpperCase(),
          destinationLocationCode: destinationCode.toUpperCase(),
          departureDate: checkIn,
          returnDate: checkOut,
          adults: String(parseInt(adults || 1)),
          travelClass: flightClass === 'first' ? 'FIRST' : 
                       flightClass === 'business' ? 'BUSINESS' :
                       flightClass === 'premium-economy' ? 'PREMIUM_ECONOMY' : 'ECONOMY',
          max: '10'
        });

        amadeusFlights = flightResults.data.slice(0, 10);
        console.log(`✅ Found ${amadeusFlights.length} flight offers from Amadeus`);
      } catch (flightError) {
        console.error('Amadeus Flight API Error:', flightError.message);
      }
    }

    // Try Sabre flights
    if (useSabre) {
      try {
        const sabreFlightResults = await sabreClient.searchFlights({
          origin: departureCityCode.toUpperCase(),
          destination: destinationCode.toUpperCase(),
          departureDate: checkIn,
          returnDate: checkOut,
          adults: parseInt(adults || 1),
          children: parseInt(children || 0),
          cabinClass: flightClass === 'economy' ? 'Y' : 
                      flightClass === 'premium-economy' ? 'W' :
                      flightClass === 'business' ? 'C' : 'F'
        });
        sabreFlights = sabreFlightResults.slice(0, 10);
        console.log(`Found ${sabreFlights.length} flight offers from Sabre`);
      } catch (flightError) {
        console.error('Sabre Flight API Error:', flightError.message);
      }
    }

    // Combine flight offers - Sabre first
    const flightOffers = [...sabreFlights, ...amadeusFlights].slice(0, 15);

    // Search for hotels
    let amadeusHotels = [];
    let sabreHotels = [];

    // Try Amadeus hotels (using custom fetch-based API)
    if (useAmadeus) {
      try {
        console.log('🔍 Searching Amadeus hotels for package:', destinationCode);
        
        // First, search for hotels by city code
        const hotelListResponse = await searchHotelsByCity({
          cityCode: destinationCode.toUpperCase(),
          radius: '50',
          radiusUnit: 'KM',
          ratings: '4,5'
        });

        if (hotelListResponse.data && hotelListResponse.data.length > 0) {
          // Get hotel IDs (limit to first 10)
          const hotelIds = hotelListResponse.data.slice(0, 10).map(h => h.hotelId).join(',');
          
          // Get hotel offers with pricing
          const hotelOffersResponse = await getHotelOffers({
            hotelIds: hotelIds,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults: adults || '1',
            roomQuantity: String(roomCount)
          });

          amadeusHotels = hotelOffersResponse.data || [];
          console.log(`✅ Found ${amadeusHotels.length} hotel offers from Amadeus`);
        } else {
          console.log('⚠️ No hotels found in destination city from Amadeus');
        }
      } catch (hotelError) {
        console.error('Amadeus Hotel API Error:', hotelError.message);
      }
    }

    // Try Sabre hotels
    if (useSabre) {
      try {
        const sabreHotelResults = await sabreClient.searchHotels({
          cityCode: destinationCode.toUpperCase(),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: parseInt(adults || 1),
          rooms: roomCount
        });
        sabreHotels = sabreHotelResults.slice(0, 10);
        console.log(`Found ${sabreHotels.length} hotel offers from Sabre`);
      } catch (hotelError) {
        console.error('Sabre Hotel API Error:', hotelError.message);
      }
    }

    // Combine hotel offers - Sabre first
    const hotelOffers = [...sabreHotels, ...amadeusHotels].slice(0, 15);

    // Combine flight and hotel data into packages
    const packages = [];
    const maxPackages = 12;

    // Helper function to get destination-specific hotel images
    const getHotelImages = (destinationCode, hotelName, hotelStars) => {
      // Curated high-quality hotel images by destination
      const imagesByDestination = {
        'NYC': [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'
        ],
        'LON': [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
          'https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        'PAR': [
          'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
          'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        'TYO': [
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        'DXB': [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        'LAX': [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        'MIA': [
          'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
          'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
        ],
        'CUN': [
          'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        'DPS': [
          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
        'DEFAULT': [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ]
      };

      // Get images for destination or use default
      const images = imagesByDestination[destinationCode.toUpperCase()] || imagesByDestination['DEFAULT'];
      
      // Rotate images based on hotel index to provide variety
      const hash = hotelName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const startIndex = hash % images.length;
      return [...images.slice(startIndex), ...images.slice(0, startIndex)].slice(0, 5);
    };

    if (flightOffers.length > 0 && hotelOffers.length > 0) {
      // Create packages from real API data (Amadeus + Sabre)
      for (let i = 0; i < Math.min(maxPackages, hotelOffers.length); i++) {
        const hotel = hotelOffers[i];
        const flight = flightOffers[i % flightOffers.length]; // Cycle through flights if fewer than hotels

        try {
          // Determine hotel source and extract data accordingly
          const isAmadeusHotel = hotel.hotel !== undefined;
          const isSabreHotel = hotel.hotelId !== undefined && !isAmadeusHotel;
          
          const hotelName = isAmadeusHotel ? hotel.hotel?.name : hotel.name;
          const hotelRating = isAmadeusHotel ? parseInt(hotel.hotel?.rating || 4) : parseInt(hotel.rating || 4);
          const hotelPrice = isAmadeusHotel ? parseFloat(hotel.offers?.[0]?.price?.total || 0) : parseFloat(hotel.price?.total || 0);
          const hotelCurrency = isAmadeusHotel ? (hotel.offers?.[0]?.price?.currency || 'USD') : (hotel.price?.currency || 'USD');
          const hotelAmenities = isAmadeusHotel ? (hotel.hotel?.amenities || []) : (hotel.amenities || []);

          // Determine flight source and extract data accordingly
          const isAmadeusFlight = flight.itineraries !== undefined;
          const isSabreFlight = flight.source === 'sabre';
          
          let flightPrice, flightCurrency, outboundData, returnData;
          
          if (isAmadeusFlight) {
            flightPrice = parseFloat(flight.price?.total || 0);
            flightCurrency = flight.price?.currency || 'USD';
            const outbound = flight.itineraries[0];
            const returnFlight = flight.itineraries[1];
            const outboundSegment = outbound.segments[0];
            const lastOutboundSeg = outbound.segments[outbound.segments.length - 1];
            const returnSegment = returnFlight?.segments[0];
            const lastReturnSeg = returnFlight?.segments[returnFlight.segments.length - 1];

            outboundData = {
              airline: outboundSegment.carrierCode,
              airlineCode: outboundSegment.carrierCode,
              flightNumber: `${outboundSegment.carrierCode}${outboundSegment.number}`,
              from: departureCityCode,
              to: destinationCode,
              departTime: new Date(outboundSegment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              arrivalTime: new Date(lastOutboundSeg.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              departDate: checkIn,
              duration: outbound.duration?.replace('PT', '').toLowerCase(),
              stops: outbound.segments.length - 1,
              class: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || flightClass,
              aircraft: outboundSegment.aircraft?.code || 'Unknown'
            };

            returnData = returnFlight ? {
              airline: returnSegment.carrierCode,
              airlineCode: returnSegment.carrierCode,
              flightNumber: `${returnSegment.carrierCode}${returnSegment.number}`,
              from: destinationCode,
              to: departureCityCode,
              departTime: new Date(returnSegment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              arrivalTime: new Date(lastReturnSeg.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              departDate: checkOut,
              duration: returnFlight.duration?.replace('PT', '').toLowerCase(),
              stops: returnFlight.segments.length - 1,
              class: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || flightClass,
              aircraft: returnSegment.aircraft?.code || 'Unknown'
            } : null;
          } else if (isSabreFlight) {
            flightPrice = flight.price || 0;
            flightCurrency = flight.currency || 'USD';
            
            outboundData = {
              airline: flight.airline,
              airlineCode: flight.airline,
              flightNumber: flight.flightNumber,
              from: departureCityCode,
              to: destinationCode,
              departTime: flight.departure?.time || '08:00',
              arrivalTime: flight.arrival?.time || '12:00',
              departDate: checkIn,
              duration: flight.duration || '4h',
              stops: flight.stops || 0,
              class: flight.class || flightClass,
              aircraft: flight.segments?.[0]?.aircraft || 'Unknown'
            };

            returnData = null; // Sabre might have return in different format
          }

          // Get curated images for this hotel
          const hotelImages = getHotelImages(destinationCode, hotelName, hotelRating);
          
          // Convert to USD if needed
          const exchangeRates = { 'EUR': 1.10, 'GBP': 1.27, 'CAD': 0.74, 'JPY': 0.0067, 'USD': 1 };
          const hotelPriceUSD = hotelPrice * (exchangeRates[hotelCurrency] || 1);
          const flightPriceUSD = flightPrice * (exchangeRates[flightCurrency] || 1);

          // Calculate total price per person
          const basePrice = (hotelPriceUSD / roomCount) + flightPriceUSD;
          const discount = i % 3 === 0 ? 15 : i % 5 === 0 ? 10 : 0;
          const finalPrice = basePrice - (basePrice * discount / 100);

          packages.push({
            packageId: `PKG${Date.now()}${i}`,
            hotelName: hotelName || `${destinationCode} Resort`,
            hotelStars: hotelRating,
            rating: 4.5 + (Math.random() * 0.5),
            reviews: Math.floor(500 + Math.random() * 2000),
            location: destination || destinationCode,
            departureCity: departureCity || departureCityCode,
            checkIn: checkIn,
            checkOut: checkOut,
            images: hotelImages,
            pricePerPerson: Math.round(finalPrice),
            originalPrice: discount > 0 ? Math.round(basePrice) : null,
            discount: discount > 0 ? discount : null,
            packageType: packageType,
            flightClass: flightClass,
            description: `Experience luxury at ${hotelName || 'this stunning resort'}. ${isAmadeusHotel ? (hotel.hotel?.description?.text || '') : ''} Enjoy world-class amenities, pristine beaches, and unforgettable experiences.`,
            dining: ['International Buffet', 'A La Carte Restaurant', 'Poolside Bar', '24/7 Room Service'],
            activities: ['Water sports', 'Spa & wellness', 'Fitness center', 'Entertainment shows', 'Kids club', 'Beach access'],
            amenities: hotelAmenities.slice(0, 10).length > 0 ? hotelAmenities.slice(0, 10) : ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'],
            flightDetails: {
              outbound: outboundData,
              return: returnData
            },
            transfersIncluded: true,
            mealsIncluded: packageType === 'all-inclusive',
            cancellationPolicy: 'Free cancellation up to 30 days before check-in',
            source: {
              hotel: isAmadeusHotel ? 'amadeus' : 'sabre',
              flight: isAmadeusFlight ? 'amadeus' : 'sabre'
            }
          });
        } catch (parseError) {
          console.error('Error parsing package data:', parseError);
        }
      }
    }

    // If we don't have enough packages from Amadeus, generate mock data
    if (packages.length < maxPackages) {
      const mockPackages = generateMockPackages(
        destination || destinationCode,
        departureCity || departureCityCode,
        checkIn,
        checkOut,
        adults,
        children,
        packageType,
        flightClass,
        maxPackages - packages.length
      );
      packages.push(...mockPackages);
    }

    res.json({
      success: true,
      count: packages.length,
      data: packages,
      sources: {
        amadeus: {
          flights: amadeusFlights.length,
          hotels: amadeusHotels.length
        },
        sabre: {
          flights: sabreFlights.length,
          hotels: sabreHotels.length
        },
        combined: packages.filter(p => p.source && typeof p.source === 'object').length
      }
    });

  } catch (error) {
    console.error('Error searching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching packages',
      error: error.message
    });
  }
});

// POST /api/packages/book - Book a package
router.post('/book', async (req, res) => {
  try {
    const { packageId, travelers, contactInfo, totalAmount } = req.body;

    // Generate booking reference
    const bookingReference = 'PKG' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Calculate pricing
    const subtotal = totalAmount || 0;
    const taxes = subtotal * 0.15;
    const serviceFee = 75;
    const total = subtotal + taxes + serviceFee;

    const booking = {
      bookingReference,
      packageId,
      travelers,
      contactEmail: contactInfo.email,
      contactPhone: contactInfo.phone,
      taxes,
      serviceFee,
      totalAmount: total,
      depositPaid: total * 0.25,
      balanceDue: total * 0.75,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    res.json({
      success: true,
      message: 'Package booked successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error booking package:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking package',
      error: error.message
    });
  }
});

module.exports = router;
