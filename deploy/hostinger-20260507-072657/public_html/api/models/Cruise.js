const mongoose = require('mongoose');

const cruiseSchema = new mongoose.Schema({
  cruiseId: {
    type: String,
    required: true,
    unique: true
  },
  cruiseLine: {
    type: String,
    required: true
  },
  shipName: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departurePort: {
    type: String,
    required: true
  },
  arrivalPort: {
    type: String
  },
  departureDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in nights
    required: true
  },
  itinerary: [{
    day: Number,
    port: String,
    arrival: String,
    departure: String,
    description: String
  }],
  cabinTypes: [{
    type: {
      type: String, // Interior, Oceanview, Balcony, Suite
      required: true
    },
    available: {
      type: Number,
      required: true
    },
    price: {
      amount: Number,
      currency: String
    },
    amenities: [String]
  }],
  amenities: [String],
  dining: [String],
  entertainment: [String],
  activities: [String],
  images: [String],
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  inclusions: [String],
  exclusions: [String],
  policies: {
    cancellation: String,
    deposit: String,
    payment: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cruise', cruiseSchema);
