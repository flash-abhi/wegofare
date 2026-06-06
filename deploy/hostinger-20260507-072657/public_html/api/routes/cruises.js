const express = require('express');
const router = express.Router();
const Cruise = require('../models/Cruise');

// Currency conversion rates (approximate)
const exchangeRates = {
  'EUR': 1.10,
  'GBP': 1.27,
  'CAD': 0.74,
  'AUD': 0.65,
  'JPY': 0.0067,
  'MXN': 0.058,
  'BRL': 0.20,
  'AED': 0.27
};

const convertToUSD = (amount, currency) => {
  if (currency === 'USD') return amount;
  return (amount * (exchangeRates[currency] || 1)).toFixed(2);
};

// Mock cruise data generator (since Amadeus doesn't have a direct cruise API)
const generateCruises = (destination, departurePort, departureDate, duration, passengers) => {
  const cruiseLines = [
    { name: 'Royal Caribbean', ships: ['Symphony of the Seas', 'Harmony of the Seas', 'Allure of the Seas', 'Oasis of the Seas'] },
    { name: 'Carnival', ships: ['Carnival Mardi Gras', 'Carnival Celebration', 'Carnival Jubilee', 'Carnival Vista'] },
    { name: 'Norwegian', ships: ['Norwegian Prima', 'Norwegian Encore', 'Norwegian Bliss', 'Norwegian Joy'] },
    { name: 'MSC Cruises', ships: ['MSC World Europa', 'MSC Seascape', 'MSC Seashore', 'MSC Meraviglia'] },
    { name: 'Princess Cruises', ships: ['Discovery Princess', 'Enchanted Princess', 'Sky Princess', 'Majestic Princess'] },
    { name: 'Celebrity Cruises', ships: ['Celebrity Beyond', 'Celebrity Apex', 'Celebrity Edge', 'Celebrity Reflection'] }
  ];

  const destinationItineraries = {
    caribbean: [
      { ports: ['Miami', 'Nassau', 'Cozumel', 'Grand Cayman'], region: 'Western Caribbean' },
      { ports: ['Fort Lauderdale', 'St. Thomas', 'St. Maarten', 'San Juan'], region: 'Eastern Caribbean' },
      { ports: ['Port Canaveral', 'Aruba', 'Curacao', 'Bonaire'], region: 'Southern Caribbean' }
    ],
    mediterranean: [
      { ports: ['Barcelona', 'Marseille', 'Rome', 'Naples', 'Florence'], region: 'Western Mediterranean' },
      { ports: ['Venice', 'Dubrovnik', 'Athens', 'Santorini', 'Mykonos'], region: 'Eastern Mediterranean' },
      { ports: ['Rome', 'Sicily', 'Malta', 'Tunisia', 'Barcelona'], region: 'Mediterranean Islands' }
    ],
    alaska: [
      { ports: ['Seattle', 'Juneau', 'Skagway', 'Glacier Bay', 'Ketchikan'], region: 'Inside Passage' },
      { ports: ['Vancouver', 'Sitka', 'Icy Strait Point', 'Hubbard Glacier', 'Juneau'], region: 'Gulf of Alaska' }
    ],
    hawaii: [
      { ports: ['Honolulu', 'Maui', 'Kona', 'Hilo', 'Kauai'], region: 'Hawaiian Islands' }
    ],
    bahamas: [
      { ports: ['Miami', 'Nassau', 'Freeport', 'CocoCay'], region: 'Bahamas' }
    ],
    mexico: [
      { ports: ['Los Angeles', 'Cabo San Lucas', 'Mazatlan', 'Puerto Vallarta'], region: 'Mexican Riviera' }
    ],
    europe: [
      { ports: ['Copenhagen', 'Stockholm', 'Helsinki', 'St. Petersburg', 'Tallinn'], region: 'Northern Europe' },
      { ports: ['London', 'Amsterdam', 'Brussels', 'Paris', 'Dublin'], region: 'British Isles' }
    ],
    asia: [
      { ports: ['Singapore', 'Bangkok', 'Hong Kong', 'Ho Chi Minh', 'Phuket'], region: 'Southeast Asia' },
      { ports: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Nagasaki'], region: 'Japan' }
    ]
  };

  const durationRanges = {
    '3-5': { min: 3, max: 5 },
    '6-8': { min: 6, max: 8 },
    '9-12': { min: 9, max: 12 },
    '13+': { min: 13, max: 21 }
  };

  const range = durationRanges[duration] || { min: 7, max: 7 };
  const nights = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  const itineraries = destinationItineraries[destination] || destinationItineraries.caribbean;
  const cruises = [];

  cruiseLines.forEach((line, lineIndex) => {
    itineraries.forEach((itinerary, itiIndex) => {
      const ship = line.ships[Math.floor(Math.random() * line.ships.length)];
      
      // Base price calculation
      const basePrice = {
        caribbean: 599,
        bahamas: 449,
        mexico: 549,
        mediterranean: 899,
        alaska: 1299,
        hawaii: 1499,
        europe: 1199,
        asia: 1399
      }[destination] || 799;

      const nightMultiplier = nights / 7;
      const cabinPrices = {
        Interior: basePrice * nightMultiplier,
        Oceanview: basePrice * nightMultiplier * 1.3,
        Balcony: basePrice * nightMultiplier * 1.6,
        Suite: basePrice * nightMultiplier * 2.5
      };

      // Generate itinerary details
      const detailedItinerary = itinerary.ports.map((port, idx) => ({
        day: idx + 1,
        port: port,
        arrival: idx === 0 ? 'Departure' : '08:00 AM',
        departure: idx === itinerary.ports.length - 1 ? 'Return' : '05:00 PM',
        description: `Explore the beautiful ${port}`
      }));

      const cruise = {
        cruiseId: `CR${Date.now()}-${lineIndex}-${itiIndex}`,
        cruiseLine: line.name,
        shipName: ship,
        destination: itinerary.region,
        departurePort: itinerary.ports[0],
        arrivalPort: itinerary.ports[itinerary.ports.length - 1],
        departureDate: new Date(departureDate),
        returnDate: new Date(new Date(departureDate).getTime() + nights * 24 * 60 * 60 * 1000),
        duration: nights,
        itinerary: detailedItinerary,
        cabinTypes: [
          {
            type: 'Interior',
            available: Math.floor(Math.random() * 20) + 5,
            price: { amount: Math.round(cabinPrices.Interior), currency: 'USD' },
            amenities: ['2 Twin Beds', 'Private Bathroom', 'TV', 'Mini Fridge']
          },
          {
            type: 'Oceanview',
            available: Math.floor(Math.random() * 15) + 3,
            price: { amount: Math.round(cabinPrices.Oceanview), currency: 'USD' },
            amenities: ['2 Twin Beds', 'Ocean View Window', 'Private Bathroom', 'TV', 'Mini Fridge']
          },
          {
            type: 'Balcony',
            available: Math.floor(Math.random() * 10) + 2,
            price: { amount: Math.round(cabinPrices.Balcony), currency: 'USD' },
            amenities: ['Queen Bed', 'Private Balcony', 'Sitting Area', 'TV', 'Mini Bar', 'Bathrobes']
          },
          {
            type: 'Suite',
            available: Math.floor(Math.random() * 5) + 1,
            price: { amount: Math.round(cabinPrices.Suite), currency: 'USD' },
            amenities: ['King Bed', 'Large Balcony', 'Living Room', 'Premium TV', 'Full Bar', 'Butler Service', 'Priority Boarding']
          }
        ],
        amenities: [
          'Swimming Pools',
          'Fitness Center',
          'Spa & Wellness',
          'Casino',
          'Theater',
          'Kids Club',
          'Rock Climbing Wall',
          'Water Slides',
          'Mini Golf',
          'Library'
        ],
        dining: [
          'Main Dining Room',
          'Buffet',
          'Specialty Restaurants',
          'Room Service',
          'Cafe & Bars',
          'Ice Cream Parlor'
        ],
        entertainment: [
          'Broadway-style Shows',
          'Live Music',
          'Comedy Shows',
          'Nightclubs',
          'Movies Under Stars',
          'Karaoke'
        ],
        activities: [
          'Shore Excursions',
          'Cooking Classes',
          'Art Auctions',
          'Trivia Games',
          'Dance Lessons',
          'Wine Tasting'
        ],
        images: [
          `https://images.unsplash.com/photo-1560800452-f2d475982b96?w=800`, // Large cruise ship at sea
          `https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=800`, // Cruise ship deck with pool
          `https://images.unsplash.com/photo-1585159812596-fac104f2f069?w=800`, // Luxury cruise interior
          `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800`, // Cruise ship aerial view
          `https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800`  // Modern cruise ship
        ],
        rating: (Math.random() * 1 + 4).toFixed(1),
        reviews: Math.floor(Math.random() * 2000) + 500,
        inclusions: [
          'Accommodation',
          'All Meals',
          'Entertainment',
          'Pool & Fitness Access',
          'Kids Programs',
          'Select Beverages'
        ],
        exclusions: [
          'Gratuities',
          'Specialty Dining',
          'Alcoholic Beverages',
          'Shore Excursions',
          'Spa Services',
          'Casino'
        ],
        policies: {
          cancellation: 'Full refund if cancelled 90+ days before departure. 50% refund 60-89 days. No refund within 59 days.',
          deposit: '20% deposit required at booking',
          payment: 'Full payment due 60 days before departure'
        }
      };

      cruises.push(cruise);
    });
  });

  return cruises;
};

// GET /api/cruises - Search for cruises
router.get('/', async (req, res) => {
  try {
    const {
      destination,
      departurePort,
      departureDate,
      duration,
      passengers = 2
    } = req.query;

    console.log('Cruise search params:', { destination, departurePort, departureDate, duration, passengers });

    // Validate required parameters
    if (!destination || !departurePort || !departureDate || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: destination, departurePort, departureDate, duration'
      });
    }

    // Generate cruise results
    const cruises = generateCruises(destination, departurePort, departureDate, duration, parseInt(passengers));

    // Sort by price (lowest Interior cabin)
    cruises.sort((a, b) => {
      const priceA = a.cabinTypes.find(c => c.type === 'Interior')?.price.amount || 0;
      const priceB = b.cabinTypes.find(c => c.type === 'Interior')?.price.amount || 0;
      return priceA - priceB;
    });

    res.json({
      success: true,
      count: cruises.length,
      data: cruises,
      searchParams: {
        destination,
        departurePort,
        departureDate,
        duration,
        passengers: parseInt(passengers)
      }
    });

  } catch (error) {
    console.error('Error searching cruises:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for cruises',
      error: error.message
    });
  }
});

// GET /api/cruises/:id - Get cruise details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find in database first
    let cruise = await Cruise.findOne({ cruiseId: id });

    if (!cruise) {
      return res.status(404).json({
        success: false,
        message: 'Cruise not found'
      });
    }

    res.json({
      success: true,
      data: cruise
    });

  } catch (error) {
    console.error('Error fetching cruise details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cruise details',
      error: error.message
    });
  }
});

// POST /api/cruises/book - Book a cruise
router.post('/book', async (req, res) => {
  try {
    const {
      cruiseId,
      cabinType,
      passengers,
      personalInfo,
      paymentInfo
    } = req.body;

    // Validate required fields
    if (!cruiseId || !cabinType || !passengers || !personalInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // In a real implementation, you would:
    // 1. Verify cruise availability
    // 2. Process payment
    // 3. Create booking record
    // 4. Send confirmation email

    // Generate booking reference
    const bookingReference = 'CRZ' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Calculate pricing
    const subtotal = req.body.totalAmount || 0;
    const taxes = subtotal * 0.12;
    const serviceFee = 50;
    const total = subtotal + taxes + serviceFee;

    const booking = {
      bookingReference,
      cruiseId,
      cabinType,
      passengers,
      contactEmail: req.body.contactInfo.email,
      contactPhone: req.body.contactInfo.phone,
      specialRequests: req.body.specialRequests,
      taxes,
      serviceFee,
      totalAmount: total,
      depositPaid: total * 0.2,
      balanceDue: total * 0.8,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    res.json({
      success: true,
      message: 'Cruise booked successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error booking cruise:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking cruise',
      error: error.message
    });
  }
});

// GET /api/cruises/destinations - Get popular destinations
router.get('/meta/destinations', async (req, res) => {
  try {
    const destinations = [
      { code: 'caribbean', name: 'Caribbean', cruises: 50, startingPrice: 599 },
      { code: 'mediterranean', name: 'Mediterranean', cruises: 40, startingPrice: 899 },
      { code: 'alaska', name: 'Alaska', cruises: 25, startingPrice: 1299 },
      { code: 'hawaii', name: 'Hawaii', cruises: 15, startingPrice: 1499 },
      { code: 'bahamas', name: 'Bahamas', cruises: 30, startingPrice: 449 },
      { code: 'mexico', name: 'Mexico', cruises: 20, startingPrice: 549 },
      { code: 'europe', name: 'Europe', cruises: 35, startingPrice: 1199 },
      { code: 'asia', name: 'Asia', cruises: 18, startingPrice: 1399 }
    ];

    res.json({
      success: true,
      data: destinations
    });

  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching destinations',
      error: error.message
    });
  }
});

module.exports = router;
