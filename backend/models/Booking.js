const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for guest bookings
  },
  bookingType: {
    type: String,
    enum: ['flight', 'hotel', 'package'],
    required: true
  },
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  // Flight booking details
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  },
  // Hotel booking details
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  hotelDetails: {
    checkIn: Date,
    checkOut: Date,
    roomType: String,
    numberOfRooms: Number
  },
  // Package booking details
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  packageDetails: {
    startDate: Date,
    endDate: Date
  },
  // Common details
  passengers: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 }
  },
  passengerDetails: [{
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    passportNumber: String,
    type: { type: String, enum: ['adult', 'child', 'infant'] }
  }],
  contactInfo: {
    email: String,
    phone: String
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'pending'
  },
  // Embedded flight details (for API-sourced flights that don't have MongoDB IDs)
  flightDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  returnFlightDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  selectedSeats: [{
    number: String,
    row: Number,
    column: String,
    occupied: Boolean,
    exit: Boolean,
    type: String,
    price: Number
  }],
  returnSelectedSeats: [{
  number: String,
  row: Number,
  column: String,
  occupied: Boolean,
  exit: Boolean,
  type: String,
  price: Number
}],
  searchParams: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Generate unique booking reference
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const prefix = this.bookingType.toUpperCase().substring(0, 2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    this.bookingReference = `${prefix}${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
