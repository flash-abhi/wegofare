const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  duration: {
    days: { type: Number, required: true },
    nights: { type: Number, required: true }
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  includes: [{
    type: String
  }],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    activities: [String]
  }],
  images: [{
    url: String,
    caption: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  maxGroupSize: {
    type: Number,
    default: 20
  },
  availableDates: [{
    startDate: Date,
    endDate: Date,
    availableSlots: Number
  }],
  category: {
    type: String,
    enum: ['Beach', 'Adventure', 'Cultural', 'Luxury', 'Family', 'Honeymoon'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

packageSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Package', packageSchema);
