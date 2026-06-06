const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const sabreClient = require('../utils/sabreClient');
const { searchHotelsByCity, getHotelOffers } = require('../utils/amadeusApi');

// Check if Amadeus is configured
const amadeusEnabled = !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);

// Get all hotels with filters (using Amadeus and Sabre APIs)
router.get('/', async (req, res) => {
  try {
    const { 
      cityCode, checkInDate, checkOutDate, adults, roomQuantity, 
      radius, radiusUnit, chainCodes, amenities,
      city, minRating, maxPrice, featured, provider 
    } = req.query;
    
    // If we have search parameters, use APIs
    if (cityCode && checkInDate && checkOutDate) {
      let amadeusHotels = [];
      let sabreHotels = [];

      // Use specific provider if requested, otherwise use both for cheapest results
      const useAmadeus = amadeusEnabled && (!provider || provider === 'amadeus' || provider === 'all');
      const useSabre = !provider || provider === 'sabre' || provider === 'all';

      // Try Amadeus API (using custom fetch-based client)
      if (useAmadeus) {
        try {
          console.log('🔍 Searching Amadeus hotels for:', cityCode);
          
          // Step 1: Get hotel list by city code
          const hotelListResponse = await searchHotelsByCity({
            cityCode: cityCode.toUpperCase(),
            radius: radius || '50',
            radiusUnit: radiusUnit || 'KM',
            ratings: minRating || undefined
          });
          
          if (!hotelListResponse.data || hotelListResponse.data.length === 0) {
            console.log('⚠️ No hotels found in city:', cityCode);
          } else {
            // Get up to 20 hotel IDs (API limit)
            const hotelIds = hotelListResponse.data.slice(0, 20).map(h => h.hotelId).join(',');

            // Step 2: Get hotel offers for those IDs
            const offersResponse = await getHotelOffers({
              hotelIds: hotelIds,
              checkInDate: checkInDate,
              checkOutDate: checkOutDate,
              adults: adults || '1',
              roomQuantity: roomQuantity || '1'
            });

            // Transform Amadeus hotel data to our format
            amadeusHotels = offersResponse.data.map(offer => {
              const hotel = offer.hotel;
              const offerDetails = offer.offers[0];
              
              // Convert price to USD if needed
              let priceTotal = parseFloat(offerDetails.price.total);
              const originalCurrency = offerDetails.price.currency;
              
              const exchangeRates = {
                'EUR': 1.10,
                'GBP': 1.27,
                'CAD': 0.74,
                'AUD': 0.65,
                'JPY': 0.0067,
                'CNY': 0.14,
                'INR': 0.012,
                'USD': 1.0
              };
              
              if (originalCurrency !== 'USD' && exchangeRates[originalCurrency]) {
                priceTotal = priceTotal * exchangeRates[originalCurrency];
              }

              // Calculate number of nights
              const checkIn = new Date(checkInDate);
              const checkOut = new Date(checkOutDate);
              const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
              
              return {
                id: offer.id,
                hotelId: hotel.hotelId,
                chainCode: hotel.chainCode,
                name: hotel.name,
                rating: hotel.rating || 0,
                location: {
                  city: cityCode.toUpperCase(),
                  address: hotel.address?.lines?.join(', ') || '',
                  cityName: hotel.address?.cityName || cityCode,
                  countryCode: hotel.address?.countryCode || '',
                  postalCode: hotel.address?.postalCode || '',
                  coordinates: hotel.latitude && hotel.longitude ? {
                    lat: parseFloat(hotel.latitude),
                    lng: parseFloat(hotel.longitude)
                  } : null
                },
                price: {
                  perNight: Math.round(priceTotal / nights * 100) / 100,
                  total: Math.round(priceTotal * 100) / 100,
                  currency: 'USD',
                  originalCurrency: originalCurrency,
                  originalPrice: parseFloat(offerDetails.price.total)
                },
                availability: {
                  checkInDate: checkInDate,
                  checkOutDate: checkOutDate,
                  nights: nights
                },
                room: {
                  type: offerDetails.room?.type || 'Standard',
                  typeEstimated: offerDetails.room?.typeEstimated?.category || 'STANDARD_ROOM',
                  bedType: offerDetails.room?.typeEstimated?.beds || 1,
                  sleeps: offerDetails.guests?.adults || parseInt(adults || 1)
                },
                policies: {
                  checkInTime: offerDetails.policies?.checkInTime || '15:00',
                  checkOutTime: offerDetails.policies?.checkOutTime || '11:00',
                  cancellation: offerDetails.policies?.cancellation?.description?.text || 'Please check with hotel',
                  guarantee: offerDetails.policies?.guarantee?.description?.text || 'Credit card required',
                  paymentType: offerDetails.policies?.paymentType || 'UNKNOWN'
                },
                distance: hotel.hotelDistance ? {
                  value: hotel.hotelDistance.distance,
                  unit: hotel.hotelDistance.distanceUnit
                } : null,
                amenities: hotel.amenities || [],
                media: hotel.media || [],
                description: offerDetails.description?.text || hotel.description?.text || '',
                contact: hotel.contact || {}
              };
            });
          }
        } catch (amadeusError) {
          console.error('Amadeus Hotel API Error:', {
            message: amadeusError.message,
            statusCode: amadeusError.response?.statusCode,
            body: amadeusError.response?.body,
            description: amadeusError.description
          });
        }
      }

      // Try Sabre API
      if (useSabre) {
        try {
          const sabreResults = await sabreClient.searchHotels({
            cityCode: cityCode.toUpperCase(),
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            adults: parseInt(adults) || 2,
            rooms: parseInt(roomQuantity) || 1
          });

          // Transform Sabre results to match our format
          const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
          
          sabreHotels = sabreResults.map(hotel => ({
            id: hotel.id,
            hotelId: hotel.hotelId,
            name: hotel.name,
            rating: hotel.rating || 0,
            location: {
              city: cityCode.toUpperCase(),
              address: hotel.address?.street || '',
              cityName: hotel.address?.city || cityCode,
              countryCode: hotel.address?.country || '',
              coordinates: hotel.position ? {
                lat: hotel.position.latitude,
                lng: hotel.position.longitude
              } : null
            },
            price: {
              perNight: Math.round(hotel.price.total / nights * 100) / 100,
              total: hotel.price.total,
              currency: hotel.price.currency || 'USD'
            },
            availability: {
              checkInDate,
              checkOutDate,
              nights
            },
            amenities: hotel.amenities || [],
            source: 'sabre'
          }));
        } catch (sabreError) {
          console.error('Sabre Hotel API Error:', sabreError.message);
        }
      }

      // Combine results from both sources - Sabre first
      const allHotels = [...sabreHotels, ...amadeusHotels];

      if (allHotels.length > 0) {
        // Sort by price
        allHotels.sort((a, b) => a.price.total - b.price.total);

        return res.json({
          success: true,
          count: allHotels.length,
          data: allHotels,
          sources: {
            amadeus: amadeusHotels.length,
            sabre: sabreHotels.length
          },
          searchParams: {
            cityCode,
            checkInDate,
            checkOutDate,
            adults,
            nights: Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
          }
        });
      }
    }
    
    // Fallback to database query
    let query = {};
    
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxPrice) query['price.perNight'] = { $lte: parseFloat(maxPrice) };
    if (featured) query.featured = featured === 'true';
    
    const hotels = await Hotel.find(query).sort({ rating: -1 });
    
    res.json({
      success: true,
      count: hotels.length,
      data: hotels,
      source: 'database'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hotels',
      error: error.message
    });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hotel',
      error: error.message
    });
  }
});

// Get hotel offers by hotel ID from Amadeus
router.get('/offers/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkInDate, checkOutDate, adults, roomQuantity } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    try {
      const response = await amadeus.shopping.hotelOffersByHotel.get({
        hotelId: hotelId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: adults || '1',
        roomQuantity: roomQuantity || '1'
      });

      const offers = response.data.offers.map(offer => {
        let priceTotal = parseFloat(offer.price.total);
        const originalCurrency = offer.price.currency;
        
        const exchangeRates = {
          'EUR': 1.10,
          'GBP': 1.27,
          'CAD': 0.74,
          'AUD': 0.65,
          'JPY': 0.0067,
          'CNY': 0.14,
          'INR': 0.012,
          'USD': 1.0
        };
        
        if (originalCurrency !== 'USD' && exchangeRates[originalCurrency]) {
          priceTotal = priceTotal * exchangeRates[originalCurrency];
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        return {
          id: offer.id,
          rateCode: offer.rateCode,
          room: {
            type: offer.room?.type || 'Standard',
            typeEstimated: offer.room?.typeEstimated?.category || 'STANDARD_ROOM',
            description: offer.room?.description?.text || '',
            bedType: offer.room?.typeEstimated?.beds || 1,
            sleeps: offer.guests?.adults || parseInt(adults || 1)
          },
          price: {
            total: Math.round(priceTotal * 100) / 100,
            perNight: Math.round(priceTotal / nights * 100) / 100,
            currency: 'USD',
            originalPrice: parseFloat(offer.price.total),
            originalCurrency: originalCurrency,
            variations: offer.price.variations
          },
          policies: {
            checkInTime: offer.policies?.checkInTime || '15:00',
            checkOutTime: offer.policies?.checkOutTime || '11:00',
            cancellation: offer.policies?.cancellation?.description?.text || 'Please check with hotel',
            guarantee: offer.policies?.guarantee?.description?.text || 'Credit card required',
            paymentType: offer.policies?.paymentType || 'UNKNOWN'
          },
          boardType: offer.boardType || 'ROOM_ONLY',
          commission: offer.commission,
          self: offer.self
        };
      });

      res.json({
        success: true,
        hotelId: hotelId,
        hotel: response.data.hotel,
        count: offers.length,
        offers: offers,
        source: 'amadeus'
      });
    } catch (amadeusError) {
      console.error('Amadeus Hotel Offers API Error:', {
        message: amadeusError.message,
        statusCode: amadeusError.response?.statusCode,
        body: amadeusError.response?.body
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotel offers from Amadeus',
        error: amadeusError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hotel offers',
      error: error.message
    });
  }
});

// Search hotels by geographic coordinates
router.post('/search/location', async (req, res) => {
  try {
    const { latitude, longitude, checkInDate, checkOutDate, adults, radius, radiusUnit } = req.body;

    if (!latitude || !longitude || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, check-in date, and check-out date are required'
      });
    }

    try {
      const response = await amadeus.shopping.hotelOffersSearch.get({
        latitude: latitude,
        longitude: longitude,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: adults || '1',
        radius: radius || '5',
        radiusUnit: radiusUnit || 'KM',
        bestRateOnly: 'true'
      });

      const hotels = response.data.map(offer => {
        const hotel = offer.hotel;
        const offerDetails = offer.offers[0];
        
        let pricePerNight = parseFloat(offerDetails.price.total);
        const originalCurrency = offerDetails.price.currency;
        
        const exchangeRates = {
          'EUR': 1.10, 'GBP': 1.27, 'CAD': 0.74, 'AUD': 0.65,
          'JPY': 0.0067, 'CNY': 0.14, 'INR': 0.012, 'USD': 1.0
        };
        
        if (originalCurrency !== 'USD' && exchangeRates[originalCurrency]) {
          pricePerNight = pricePerNight * exchangeRates[originalCurrency];
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        return {
          id: offer.id,
          hotelId: hotel.hotelId,
          name: hotel.name,
          rating: hotel.rating || 0,
          location: {
            address: hotel.address?.lines?.join(', ') || '',
            city: hotel.address?.cityName || '',
            coordinates: {
              lat: parseFloat(hotel.latitude),
              lng: parseFloat(hotel.longitude)
            }
          },
          distance: hotel.hotelDistance ? {
            value: hotel.hotelDistance.distance,
            unit: hotel.hotelDistance.distanceUnit
          } : null,
          price: {
            perNight: Math.round(pricePerNight / nights * 100) / 100,
            total: Math.round(pricePerNight * 100) / 100,
            currency: 'USD'
          },
          room: {
            type: offerDetails.room?.type || 'Standard',
            sleeps: offerDetails.guests?.adults || 1
          }
        };
      });

      res.json({
        success: true,
        count: hotels.length,
        data: hotels,
        source: 'amadeus'
      });
    } catch (amadeusError) {
      console.error('Amadeus Location Search Error:', amadeusError.message);
      
      return res.status(500).json({
        success: false,
        message: 'Error searching hotels by location',
        error: amadeusError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing location search',
      error: error.message
    });
  }
});

// Create new hotel
router.post('/', async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating hotel',
      error: error.message
    });
  }
});

// Update hotel
router.put('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating hotel',
      error: error.message
    });
  }
});

// Delete hotel
router.delete('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting hotel',
      error: error.message
    });
  }
});

module.exports = router;
