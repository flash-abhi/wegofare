// Airline data with codes, names, and logo paths
// Using Duffel's airline logo CDN for high-quality SVG logos
const getDuffelLogoUrl = (iataCode) => {
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${iataCode}.svg`;
};

const airlines = {
  // Major US Airlines
  'AA': {
    code: 'AA',
    name: 'American Airlines',
    logo: getDuffelLogoUrl('AA'),
    country: 'United States',
    alliance: 'Oneworld'
  },
  'DL': {
    code: 'DL',
    name: 'Delta Air Lines',
    logo: getDuffelLogoUrl('DL'),
    country: 'United States',
    alliance: 'SkyTeam'
  },
  'UA': {
    code: 'UA',
    name: 'United Airlines',
    logo: getDuffelLogoUrl('UA'),
    country: 'United States',
    alliance: 'Star Alliance'
  },
  'WN': {
    code: 'WN',
    name: 'Southwest Airlines',
    logo: getDuffelLogoUrl('WN'),
    country: 'United States',
    alliance: null
  },
  'B6': {
    code: 'B6',
    name: 'JetBlue Airways',
    logo: getDuffelLogoUrl('B6'),
    country: 'United States',
    alliance: null
  },
  'AS': {
    code: 'AS',
    name: 'Alaska Airlines',
    logo: getDuffelLogoUrl('AS'),
    country: 'United States',
    alliance: 'Oneworld'
  },

  // European Airlines
  'BA': {
    code: 'BA',
    name: 'British Airways',
    logo: '/airlines/british-airways.png',
    country: 'United Kingdom',
    alliance: 'Oneworld'
  },
  'LH': {
    code: 'LH',
    name: 'Lufthansa',
    logo: '/airlines/lufthansa.png',
    country: 'Germany',
    alliance: 'Star Alliance'
  },
  'AF': {
    code: 'AF',
    name: 'Air France',
    logo: '/airlines/air-france.png',
    country: 'France',
    alliance: 'SkyTeam'
  },
  'KL': {
    code: 'KL',
    name: 'KLM Royal Dutch Airlines',
    logo: '/airlines/klm.png',
    country: 'Netherlands',
    alliance: 'SkyTeam'
  },
  'IB': {
    code: 'IB',
    name: 'Iberia',
    logo: '/airlines/iberia.png',
    country: 'Spain',
    alliance: 'Oneworld'
  },
  'TP': {
    code: 'TP',
    name: 'TAP Air Portugal',
    logo: '/airlines/tap-portugal.png',
    country: 'Portugal',
    alliance: 'Star Alliance'
  },
  'AZ': {
    code: 'AZ',
    name: 'ITA Airways',
    logo: '/airlines/ita-airways.png',
    country: 'Italy',
    alliance: 'SkyTeam'
  },
  'LX': {
    code: 'LX',
    name: 'Swiss International Air Lines',
    logo: '/airlines/swiss.png',
    country: 'Switzerland',
    alliance: 'Star Alliance'
  },
  'OS': {
    code: 'OS',
    name: 'Austrian Airlines',
    logo: '/airlines/austrian.png',
    country: 'Austria',
    alliance: 'Star Alliance'
  },
  'SN': {
    code: 'SN',
    name: 'Brussels Airlines',
    logo: '/airlines/brussels.png',
    country: 'Belgium',
    alliance: 'Star Alliance'
  },

  // Middle Eastern Airlines
  'EK': {
    code: 'EK',
    name: 'Emirates',
    logo: '/airlines/emirates.png',
    country: 'United Arab Emirates',
    alliance: null
  },
  'QR': {
    code: 'QR',
    name: 'Qatar Airways',
    logo: '/airlines/qatar.png',
    country: 'Qatar',
    alliance: 'Oneworld'
  },
  'EY': {
    code: 'EY',
    name: 'Etihad Airways',
    logo: '/airlines/etihad.png',
    country: 'United Arab Emirates',
    alliance: null
  },
  'SV': {
    code: 'SV',
    name: 'Saudi Arabian Airlines',
    logo: '/airlines/saudia.png',
    country: 'Saudi Arabia',
    alliance: 'SkyTeam'
  },

  // Asian Airlines
  'SQ': {
    code: 'SQ',
    name: 'Singapore Airlines',
    logo: '/airlines/singapore.png',
    country: 'Singapore',
    alliance: 'Star Alliance'
  },
  'CX': {
    code: 'CX',
    name: 'Cathay Pacific',
    logo: '/airlines/cathay-pacific.png',
    country: 'Hong Kong',
    alliance: 'Oneworld'
  },
  'NH': {
    code: 'NH',
    name: 'All Nippon Airways',
    logo: '/airlines/ana.png',
    country: 'Japan',
    alliance: 'Star Alliance'
  },
  'JL': {
    code: 'JL',
    name: 'Japan Airlines',
    logo: '/airlines/jal.png',
    country: 'Japan',
    alliance: 'Oneworld'
  },
  'KE': {
    code: 'KE',
    name: 'Korean Air',
    logo: '/airlines/korean-air.png',
    country: 'South Korea',
    alliance: 'SkyTeam'
  },
  'TG': {
    code: 'TG',
    name: 'Thai Airways',
    logo: '/airlines/thai-airways.png',
    country: 'Thailand',
    alliance: 'Star Alliance'
  },
  'AI': {
    code: 'AI',
    name: 'Air India',
    logo: '/airlines/air-india.png',
    country: 'India',
    alliance: 'Star Alliance'
  },
  '6E': {
    code: '6E',
    name: 'IndiGo',
    logo: '/airlines/indigo.png',
    country: 'India',
    alliance: null
  },

  // Australian Airlines
  'QF': {
    code: 'QF',
    name: 'Qantas',
    logo: '/airlines/qantas.png',
    country: 'Australia',
    alliance: 'Oneworld'
  },
  'VA': {
    code: 'VA',
    name: 'Virgin Australia',
    logo: '/airlines/virgin-australia.png',
    country: 'Australia',
    alliance: null
  },

  // Canadian Airlines
  'AC': {
    code: 'AC',
    name: 'Air Canada',
    logo: '/airlines/air-canada.png',
    country: 'Canada',
    alliance: 'Star Alliance'
  },
  'WS': {
    code: 'WS',
    name: 'WestJet',
    logo: '/airlines/westjet.png',
    country: 'Canada',
    alliance: null
  },

  // Latin American Airlines
  'LA': {
    code: 'LA',
    name: 'LATAM Airlines',
    logo: '/airlines/latam.png',
    country: 'Chile',
    alliance: 'Oneworld'
  },
  'AM': {
    code: 'AM',
    name: 'Aeroméxico',
    logo: '/airlines/aeromexico.png',
    country: 'Mexico',
    alliance: 'SkyTeam'
  },
  'CM': {
    code: 'CM',
    name: 'Copa Airlines',
    logo: '/airlines/copa.png',
    country: 'Panama',
    alliance: 'Star Alliance'
  },

  // Low-Cost Carriers
  'FR': {
    code: 'FR',
    name: 'Ryanair',
    logo: '/airlines/ryanair.png',
    country: 'Ireland',
    alliance: null
  },
  'U2': {
    code: 'U2',
    name: 'easyJet',
    logo: '/airlines/easyjet.png',
    country: 'United Kingdom',
    alliance: null
  },
  'VY': {
    code: 'VY',
    name: 'Vueling',
    logo: '/airlines/vueling.png',
    country: 'Spain',
    alliance: null
  },
  'W6': {
    code: 'W6',
    name: 'Wizz Air',
    logo: '/airlines/wizzair.png',
    country: 'Hungary',
    alliance: null
  },

  // Chinese Airlines
  'CA': {
    code: 'CA',
    name: 'Air China',
    logo: '/airlines/air-china.png',
    country: 'China',
    alliance: 'Star Alliance'
  },
  'CZ': {
    code: 'CZ',
    name: 'China Southern Airlines',
    logo: '/airlines/china-southern.png',
    country: 'China',
    alliance: 'SkyTeam'
  },
  'MU': {
    code: 'MU',
    name: 'China Eastern Airlines',
    logo: '/airlines/china-eastern.png',
    country: 'China',
    alliance: 'SkyTeam'
  },

  // Turkish Airlines
  'TK': {
    code: 'TK',
    name: 'Turkish Airlines',
    logo: '/airlines/turkish.png',
    country: 'Turkey',
    alliance: 'Star Alliance'
  },

  // African Airlines
  'ET': {
    code: 'ET',
    name: 'Ethiopian Airlines',
    logo: '/airlines/ethiopian.png',
    country: 'Ethiopia',
    alliance: 'Star Alliance'
  },
  'SA': {
    code: 'SA',
    name: 'South African Airways',
    logo: '/airlines/south-african.png',
    country: 'South Africa',
    alliance: 'Star Alliance'
  },

  // Other Notable Airlines
  'AY': {
    code: 'AY',
    name: 'Finnair',
    logo: '/airlines/finnair.png',
    country: 'Finland',
    alliance: 'Oneworld'
  },
  'SK': {
    code: 'SK',
    name: 'Scandinavian Airlines',
    logo: '/airlines/sas.png',
    country: 'Sweden',
    alliance: 'Star Alliance'
  },
  'AZ': {
    code: 'AZ',
    name: 'Alitalia',
    logo: '/airlines/alitalia.png',
    country: 'Italy',
    alliance: 'SkyTeam'
  },

  // Low-Cost Carriers (LCC)
  'FR': {
    code: 'FR',
    name: 'Ryanair',
    logo: '/airlines/ryanair.svg',
    country: 'Ireland',
    alliance: null,
    type: 'LCC'
  },
  'U2': {
    code: 'U2',
    name: 'easyJet',
    logo: '/airlines/easyjet.svg',
    country: 'United Kingdom',
    alliance: null,
    type: 'LCC'
  },
  '6E': {
    code: '6E',
    name: 'IndiGo',
    logo: '/airlines/indigo.svg',
    country: 'India',
    alliance: null,
    type: 'LCC'
  },
  'SG': {
    code: 'SG',
    name: 'SpiceJet',
    logo: '/airlines/spicejet.svg',
    country: 'India',
    alliance: null,
    type: 'LCC'
  },
  'G8': {
    code: 'G8',
    name: 'Go First',
    logo: '/airlines/go-first.svg',
    country: 'India',
    alliance: null,
    type: 'LCC'
  },
  'I5': {
    code: 'I5',
    name: 'AirAsia India',
    logo: '/airlines/airasia-india.svg',
    country: 'India',
    alliance: null,
    type: 'LCC'
  },
  'AK': {
    code: 'AK',
    name: 'AirAsia',
    logo: '/airlines/airasia.svg',
    country: 'Malaysia',
    alliance: null,
    type: 'LCC'
  },
  'FZ': {
    code: 'FZ',
    name: 'flydubai',
    logo: '/airlines/flydubai.svg',
    country: 'UAE',
    alliance: null,
    type: 'LCC'
  },
  'XY': {
    code: 'XY',
    name: 'flynas',
    logo: '/airlines/flynas.svg',
    country: 'Saudi Arabia',
    alliance: null,
    type: 'LCC'
  },
  'WY': {
    code: 'WY',
    name: 'Oman Air',
    logo: '/airlines/oman-air.svg',
    country: 'Oman',
    alliance: null,
    type: 'LCC'
  },
  'VY': {
    code: 'VY',
    name: 'Vueling',
    logo: '/airlines/vueling.svg',
    country: 'Spain',
    alliance: null,
    type: 'LCC'
  },
  'W6': {
    code: 'W6',
    name: 'Wizz Air',
    logo: '/airlines/wizz-air.svg',
    country: 'Hungary',
    alliance: null,
    type: 'LCC'
  },
  'NK': {
    code: 'NK',
    name: 'Spirit Airlines',
    logo: '/airlines/spirit.svg',
    country: 'United States',
    alliance: null,
    type: 'LCC'
  },
  'F9': {
    code: 'F9',
    name: 'Frontier Airlines',
    logo: '/airlines/frontier.svg',
    country: 'United States',
    alliance: null,
    type: 'LCC'
  },
  'G4': {
    code: 'G4',
    name: 'Allegiant Air',
    logo: '/airlines/allegiant.svg',
    country: 'United States',
    alliance: null,
    type: 'LCC'
  },
  'TP': {
    code: 'TP',
    name: 'TAP Air Portugal',
    logo: '/airlines/tap.svg',
    country: 'Portugal',
    alliance: 'Star Alliance',
    type: 'LCC'
  },
  'VB': {
    code: 'VB',
    name: 'VivaAerobus',
    logo: '/airlines/vivaaerobus.svg',
    country: 'Mexico',
    alliance: null,
    type: 'LCC'
  },
  'Y4': {
    code: 'Y4',
    name: 'Volaris',
    logo: '/airlines/volaris.svg',
    country: 'Mexico',
    alliance: null,
    type: 'LCC'
  },
  'JQ': {
    code: 'JQ',
    name: 'Jetstar',
    logo: '/airlines/jetstar.svg',
    country: 'Australia',
    alliance: null,
    type: 'LCC'
  },
  'TT': {
    code: 'TT',
    name: 'Tiger Airways',
    logo: '/airlines/tiger.svg',
    country: 'Singapore',
    alliance: null,
    type: 'LCC'
  },
  'TR': {
    code: 'TR',
    name: 'Scoot',
    logo: '/airlines/scoot.svg',
    country: 'Singapore',
    alliance: null,
    type: 'LCC'
  },
  '3K': {
    code: '3K',
    name: 'Jetstar Asia',
    logo: '/airlines/jetstar-asia.svg',
    country: 'Singapore',
    alliance: null,
    type: 'LCC'
  },
  'Z2': {
    code: 'Z2',
    name: 'Philippines AirAsia',
    logo: '/airlines/airasia-philippines.svg',
    country: 'Philippines',
    alliance: null,
    type: 'LCC'
  },
  '5J': {
    code: '5J',
    name: 'Cebu Pacific',
    logo: '/airlines/cebu-pacific.svg',
    country: 'Philippines',
    alliance: null,
    type: 'LCC'
  },
  'VJ': {
    code: 'VJ',
    name: 'VietJet Air',
    logo: '/airlines/vietjet.svg',
    country: 'Vietnam',
    alliance: null,
    type: 'LCC'
  },
  'SL': {
    code: 'SL',
    name: 'Thai Lion Air',
    logo: '/airlines/thai-lion.svg',
    country: 'Thailand',
    alliance: null,
    type: 'LCC'
  },
  'DD': {
    code: 'DD',
    name: 'Nok Air',
    logo: '/airlines/nok-air.svg',
    country: 'Thailand',
    alliance: null,
    type: 'LCC'
  },
  'FD': {
    code: 'FD',
    name: 'Thai AirAsia',
    logo: '/airlines/airasia-thai.svg',
    country: 'Thailand',
    alliance: null,
    type: 'LCC'
  }
};

// Helper function to get airline by code
function getAirlineByCode(code) {
  const airline = airlines[code.toUpperCase()];
  if (airline) {
    // Return airline with Duffel CDN logo
    return {
      ...airline,
      logo: getDuffelLogoUrl(code.toUpperCase())
    };
  }
  // Default fallback with Duffel CDN
  return {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    logo: getDuffelLogoUrl(code.toUpperCase()),
    country: 'Unknown',
    alliance: null
  };
}

// Helper function to search airlines
function searchAirlines(query) {
  const searchTerm = query.toLowerCase();
  return Object.values(airlines).filter(airline => 
    airline.name.toLowerCase().includes(searchTerm) ||
    airline.code.toLowerCase().includes(searchTerm) ||
    airline.country.toLowerCase().includes(searchTerm)
  );
}

// Helper function to get all airlines
function getAllAirlines() {
  return Object.values(airlines);
}

// Helper function to get airlines by type
function getAirlinesByType(type) {
  if (type === 'LCC') {
    return Object.values(airlines).filter(airline => airline.type === 'LCC');
  } else if (type === 'FSC') {
    return Object.values(airlines).filter(airline => !airline.type || airline.type !== 'LCC');
  }
  return Object.values(airlines);
}

// Helper function to get airlines by alliance
function getAirlinesByAlliance(alliance) {
  if (!alliance) return Object.values(airlines);
  if (alliance === 'LCC') return getAirlinesByType('LCC');
  if (alliance === 'Independent') {
    return Object.values(airlines).filter(a => !a.alliance && (!a.type || a.type !== 'LCC'));
  }
  return Object.values(airlines).filter(a => a.alliance === alliance);
}

module.exports = {
  airlines,
  getAirlineByCode,
  searchAirlines,
  getAllAirlines,
  getAirlinesByType,
  getAirlinesByAlliance
};
