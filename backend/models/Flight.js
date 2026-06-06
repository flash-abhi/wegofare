const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    code: { type: String, required: true },
    city: { type: String, required: true },
    airport: { type: String, required: true }
  },
  to: {
    code: { type: String, required: true },
    city: { type: String, required: true },
    airport: { type: String, required: true }
  },
  departure: {
    date: { type: Date, required: true },
    time: { type: String, required: true }
  },
  arrival: {
    date: { type: Date, required: true },
    time: { type: String, required: true }
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    adult: { type: Number, required: true },
    child: { type: Number, required: true },
    infant: { type: Number, required: true }
  },
  stops: {
    type: String,
    enum: ['Non-stop', '1 stop', '2+ stops'],
    default: 'Non-stop'
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 180
  },
  class: {
    type: String,
    enum: ['Economy', 'Premium Economy', 'Business', 'First Class'],
    default: 'Economy'
  },
  status: {
    type: String,
    enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Index for faster searches
flightSchema.index({ 'from.code': 1, 'to.code': 1, 'departure.date': 1 });

module.exports = mongoose.model('Flight', flightSchema);
