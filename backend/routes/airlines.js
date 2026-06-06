const express = require('express');
const router = express.Router();
const { airlines, getAirlineByCode, searchAirlines } = require('../data/airlines');

// Get all airlines
router.get('/', (req, res) => {
  try {
    const { search, alliance, country } = req.query;
    
    let filteredAirlines = Object.values(airlines);
    
    // Filter by search term
    if (search) {
      filteredAirlines = searchAirlines(search);
    }
    
    // Filter by alliance
    if (alliance) {
      filteredAirlines = filteredAirlines.filter(
        airline => airline.alliance === alliance
      );
    }
    
    // Filter by country
    if (country) {
      filteredAirlines = filteredAirlines.filter(
        airline => airline.country.toLowerCase() === country.toLowerCase()
      );
    }
    
    res.json({
      success: true,
      count: filteredAirlines.length,
      data: filteredAirlines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching airlines',
      error: error.message
    });
  }
});

// Get airline by code
router.get('/:code', (req, res) => {
  try {
    const airline = getAirlineByCode(req.params.code);
    
    res.json({
      success: true,
      data: airline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching airline',
      error: error.message
    });
  }
});

module.exports = router;
