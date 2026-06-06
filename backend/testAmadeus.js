const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getAmadeusClient } = require('./utils/amadeusClient');

const { client: amadeus, metadata } = getAmadeusClient();

if (!amadeus) {
  console.error('❌ Amadeus credentials are missing. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in backend/.env');
  process.exit(1);
}

console.log(`Using Amadeus host: ${metadata.hostname}`);

// Test function to search flights
async function testFlightSearch() {
  try {
    console.log('Testing Amadeus Flight Search API...\n');
    
    // Search for flights from New York to London
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'JFK',
      destinationLocationCode: 'LHR',
      departureDate: '2025-12-15',
      adults: '1',
      max: '5' // Limit to 5 results for testing
    });

    console.log('✅ Flight search successful!');
    console.log(`Found ${response.data.length} flight offers\n`);

    // Display first flight offer details
    if (response.data.length > 0) {
      const flight = response.data[0];
      console.log('Sample Flight Offer:');
      console.log('-------------------');
      console.log(`Price: ${flight.price.total} ${flight.price.currency}`);
      console.log(`Segments: ${flight.itineraries[0].segments.length}`);
      
      flight.itineraries[0].segments.forEach((segment, index) => {
        console.log(`\nSegment ${index + 1}:`);
        console.log(`  ${segment.departure.iataCode} → ${segment.arrival.iataCode}`);
        console.log(`  Carrier: ${segment.carrierCode} ${segment.number}`);
        console.log(`  Departure: ${segment.departure.at}`);
        console.log(`  Arrival: ${segment.arrival.at}`);
        console.log(`  Duration: ${segment.duration}`);
      });

      console.log('\n✅ API is working correctly!');
      return true;
    }
  } catch (error) {
    console.error('❌ Error testing Amadeus API:');
    
    if (error.response) {
      console.error(`Status: ${error.response.statusCode}`);
      console.error(`Error: ${JSON.stringify(error.response.body, null, 2)}`);
      
      if (error.response.statusCode === 401) {
        console.error('\n⚠️  Authentication failed!');
        console.error('Please check your AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env file');
        console.error('Get your credentials at: https://developers.amadeus.com/');
      }
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Test airport search
async function testAirportSearch() {
  try {
    console.log('\n\nTesting Amadeus Airport Search API...\n');
    
    const response = await amadeus.referenceData.locations.get({
      keyword: 'LON',
      subType: 'AIRPORT'
    });

    console.log('✅ Airport search successful!');
    console.log(`Found ${response.data.length} airports\n`);

    response.data.slice(0, 3).forEach(airport => {
      console.log(`${airport.iataCode} - ${airport.name}, ${airport.address.cityName}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error testing airport search:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('AMADEUS API TEST SUITE');
  console.log('='.repeat(60));
  console.log();

  const flightTest = await testFlightSearch();
  const airportTest = await testAirportSearch();

  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS:');
  console.log('='.repeat(60));
  console.log(`Flight Search: ${flightTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Airport Search: ${airportTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(60));

  if (!flightTest) {
    console.log('\n⚠️  To use Amadeus API:');
    console.log('1. Sign up at https://developers.amadeus.com/');
    console.log('2. Create an app to get your API credentials');
    console.log('3. Add credentials to backend/.env file:');
    console.log('   AMADEUS_CLIENT_ID=your_client_id');
    console.log('   AMADEUS_CLIENT_SECRET=your_client_secret');
  }
}

// Run the tests
runTests();
