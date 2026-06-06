const Amadeus = require('amadeus');

let cachedClient = null;

function resolveHostname() {
  const rawHost = (process.env.AMADEUS_HOST || process.env.AMADEUS_ENV || process.env.AMADEUS_MODE || '').toLowerCase();

  if (rawHost.startsWith('test')) {
    return 'test';
  }

  if (rawHost.startsWith('prod')) {
    return 'production';
  }

  return 'production';
}

function getAmadeusClient() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
    cachedClient = {
      client: null,
      metadata: {
        enabled: false,
        reason: 'Missing Amadeus credentials'
      }
    };
    return cachedClient;
  }

  const hostname = resolveHostname();
  const client = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    hostname
  });

  cachedClient = {
    client,
    metadata: {
      enabled: true,
      hostname
    }
  };

  console.log(`🔌 Amadeus client initialised (host=${hostname})`);

  return cachedClient;
}

module.exports = { getAmadeusClient };
