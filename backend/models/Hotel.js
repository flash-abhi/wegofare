const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  price: {
    perNight: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    caption: String
  }],
  roomTypes: [{
    name: String,
    capacity: Number,
    price: Number,
    available: Number
  }],
  policies: {
    checkIn: String,
    checkOut: String,
    cancellation: String
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

hotelSchema.index({ 'location.city': 1, rating: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);
