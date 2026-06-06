const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Flight = require('./models/Flight');
const Hotel = require('./models/Hotel');
const Package = require('./models/Package');

dotenv.config();

// Sample data - using string dates for easier querying
const flights = [
  // JFK → LAX (Popular US route)
  {
    airline: 'SkyWings Airlines',
    flightNumber: 'SW101',
    from: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    to: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    departure: { date: '2025-12-15', time: '08:00' },
    arrival: { date: '2025-12-15', time: '11:30' },
    duration: '5h 30m',
    price: { adult: 450, child: 360, infant: 80 },
    stops: 'Non-stop',
    availableSeats: 180,
    class: 'Economy'
  },
  {
    airline: 'Global Air',
    flightNumber: 'GA102',
    from: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    to: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    departure: { date: '2025-12-15', time: '14:00' },
    arrival: { date: '2025-12-15', time: '17:30' },
    duration: '5h 30m',
    price: { adult: 380, child: 304, infant: 70 },
    stops: 'Non-stop',
    availableSeats: 200,
    class: 'Economy'
  },
  {
    airline: 'American Airlines',
    flightNumber: 'AA202',
    from: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    to: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    departure: { date: '2025-12-20', time: '10:30' },
    arrival: { date: '2025-12-20', time: '14:00' },
    duration: '5h 30m',
    price: { adult: 520, child: 416, infant: 90 },
    stops: 'Non-stop',
    availableSeats: 150,
    class: 'Business'
  },
  // JFK → LHR (Transatlantic)
  {
    airline: 'British Airways',
    flightNumber: 'BA178',
    from: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    to: { code: 'LHR', city: 'London', airport: 'Heathrow' },
    departure: { date: '2025-12-15', time: '22:00' },
    arrival: { date: '2025-12-16', time: '10:15' },
    duration: '7h 15m',
    price: { adult: 650, child: 520, infant: 100 },
    stops: 'Non-stop',
    availableSeats: 220,
    class: 'Economy'
  },
  // LAX → JFK (Return flights)
  {
    airline: 'SkyWings Airlines',
    flightNumber: 'SW102',
    from: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    to: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    departure: { date: '2025-12-20', time: '07:00' },
    arrival: { date: '2025-12-20', time: '15:30' },
    duration: '5h 30m',
    price: { adult: 420, child: 336, infant: 75 },
    stops: 'Non-stop',
    availableSeats: 175,
    class: 'Economy'
  },
  {
    airline: 'Global Air',
    flightNumber: 'GA103',
    from: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    to: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    departure: { date: '2025-12-20', time: '12:00' },
    arrival: { date: '2025-12-20', time: '20:30' },
    duration: '5h 30m',
    price: { adult: 350, child: 280, infant: 65 },
    stops: 'Non-stop',
    availableSeats: 190,
    class: 'Economy'
  },
  {
    airline: 'Delta Airlines',
    flightNumber: 'DL456',
    from: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    to: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    departure: { date: '2025-12-22', time: '09:00' },
    arrival: { date: '2025-12-22', time: '17:30' },
    duration: '5h 30m',
    price: { adult: 480, child: 384, infant: 85 },
    stops: 'Non-stop',
    availableSeats: 165,
    class: 'Business'
  },
  // LAX → NRT (Pacific route)
  {
    airline: 'Japan Airlines',
    flightNumber: 'JL062',
    from: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    to: { code: 'NRT', city: 'Tokyo', airport: 'Narita International' },
    departure: { date: '2025-12-18', time: '14:15' },
    arrival: { date: '2025-12-19', time: '18:30' },
    duration: '11h 15m',
    price: { adult: 890, child: 712, infant: 150 },
    stops: 'Non-stop',
    availableSeats: 250,
    class: 'Economy'
  },
  // SFO → LAX (West Coast)
  {
    airline: 'United Airlines',
    flightNumber: 'UA321',
    from: { code: 'SFO', city: 'San Francisco', airport: 'San Francisco International' },
    to: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles International' },
    departure: { date: '2025-12-18', time: '09:00' },
    arrival: { date: '2025-12-18', time: '10:30' },
    duration: '1h 30m',
    price: { adult: 180, child: 144, infant: 40 },
    stops: 'Non-stop',
    availableSeats: 160,
    class: 'Economy'
  },
  // CDG → DXB (Europe to Middle East)
  {
    airline: 'Emirates',
    flightNumber: 'EK076',
    from: { code: 'CDG', city: 'Paris', airport: 'Charles de Gaulle' },
    to: { code: 'DXB', city: 'Dubai', airport: 'Dubai International' },
    departure: { date: '2025-12-20', time: '08:00' },
    arrival: { date: '2025-12-20', time: '16:30' },
    duration: '6h 30m',
    price: { adult: 540, child: 432, infant: 90 },
    stops: 'Non-stop',
    availableSeats: 300,
    class: 'Economy'
  }
];

const hotels = [
  {
    name: 'Grand Plaza Hotel',
    description: 'Luxury 5-star hotel in the heart of the city with world-class amenities',
    location: { city: 'New York', country: 'USA', address: '123 Fifth Avenue' },
    rating: 4.8,
    reviews: 1250,
    stars: 5,
    price: { perNight: 250, currency: 'USD' },
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Room Service'],
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', caption: 'Exterior' }],
    roomTypes: [
      { name: 'Deluxe Room', capacity: 2, price: 250, available: 20 },
      { name: 'Suite', capacity: 4, price: 450, available: 10 }
    ],
    featured: true
  },
  {
    name: 'Seaside Resort',
    description: 'Beachfront paradise with stunning ocean views and private beach access',
    location: { city: 'Maldives', country: 'Maldives', address: 'Paradise Island' },
    rating: 4.9,
    reviews: 980,
    stars: 5,
    price: { perNight: 380, currency: 'USD' },
    amenities: ['Beach Access', 'Infinity Pool', 'Spa', 'Water Sports', 'Fine Dining'],
    images: [{ url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', caption: 'Beach View' }],
    roomTypes: [
      { name: 'Ocean Villa', capacity: 2, price: 380, available: 15 },
      { name: 'Overwater Bungalow', capacity: 3, price: 650, available: 8 }
    ],
    featured: true
  }
];

const packages = [
  {
    title: 'European Explorer',
    description: 'Experience the best of Europe with visits to Paris, Rome, and Barcelona',
    destination: 'Europe',
    duration: { days: 10, nights: 9 },
    price: { amount: 2499, currency: 'USD' },
    includes: ['Round-trip flights', 'Hotel accommodation', 'Daily breakfast', 'Guided tours', 'Airport transfers'],
    itinerary: [
      { day: 1, title: 'Arrival in Paris', description: 'Check in and evening Seine River cruise', activities: ['Hotel check-in', 'Seine cruise'] },
      { day: 2, title: 'Paris Sightseeing', description: 'Visit Eiffel Tower, Louvre, and Champs-Élysées', activities: ['Eiffel Tower', 'Louvre Museum'] }
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a', caption: 'Paris' }],
    rating: 4.9,
    maxGroupSize: 20,
    category: 'Cultural',
    featured: true
  },
  {
    title: 'Tropical Paradise',
    description: 'Relax in Bali with luxury resort stay and cultural experiences',
    destination: 'Bali',
    duration: { days: 7, nights: 6 },
    price: { amount: 1799, currency: 'USD' },
    includes: ['Flights', '5-star resort', 'All meals', 'Spa treatments', 'Activities'],
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Welcome to Bali', activities: ['Airport pickup', 'Resort check-in'] },
      { day: 2, title: 'Beach Day', description: 'Relax at pristine beaches', activities: ['Beach activities', 'Spa'] }
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', caption: 'Bali Beach' }],
    rating: 4.8,
    maxGroupSize: 15,
    category: 'Beach',
    featured: true
  }
];

// Seed database
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flight-booking');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    await Package.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample data
    await Flight.insertMany(flights);
    console.log('✈️  Flights seeded');

    await Hotel.insertMany(hotels);
    console.log('🏨  Hotels seeded');

    await Package.insertMany(packages);
    console.log('📦  Packages seeded');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
