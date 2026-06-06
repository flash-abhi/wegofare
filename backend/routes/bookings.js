const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const bookingEmailService = require('../services/bookingEmailService');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { userId, bookingType, status } = req.query;

    const query = {};
    if (userId) query.user = userId;
    if (bookingType) query.bookingType = bookingType;
    if (status) query.bookingStatus = status;

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('flight')
      .populate('hotel')
      .populate('package')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('flight')
      .populate('hotel')
      .populate('package');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Get booking by reference
router.get('/reference/:ref', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.ref })
      .populate('user', 'firstName lastName email phone')
      .populate('flight')
      .populate('hotel')
      .populate('package');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

function generateBookingReference(type = 'flight') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefixes = {
    flight: 'FLT-',
    hotel: 'HTL-',
    package: 'PKG-'
  };
  let ref = prefixes[type] || 'BKG-';

  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// Create new booking (flight + package)
router.post('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please try again after MongoDB is available.'
      });
    }

    const {
      bookingType = 'flight',
      flight,
      outboundFlight,
      returnFlight,
      packageData,
      packageDetails,
      passengers = [],
      contact,
      contactInfo,
      selectedSeats = [],
      totalPrice,
      searchParams
    } = req.body;

    const normalizedContact = contactInfo || contact || {};
    if (!normalizedContact.email || !normalizedContact.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required contact information'
      });
    }

    const bookingReference = generateBookingReference(bookingType);
    let bookingData = {};

    if (bookingType === 'package') {
      if (!packageData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required package booking information'
        });
      }

      const guestCount =
        Number(searchParams?.adults || packageDetails?.passengers?.adults || 1) +
        Number(searchParams?.children || packageDetails?.passengers?.children || 0);
      const computedTotal = Number(packageData?.pricePerPerson || 0) * (guestCount || 1);
      const finalPackageTotal = Number.isFinite(Number(totalPrice)) && Number(totalPrice) > 0
        ? Number(totalPrice)
        : computedTotal;

      if (!Number.isFinite(finalPackageTotal) || finalPackageTotal <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package total price'
        });
      }

      bookingData = {
        bookingType: 'package',
        bookingReference,
        packageDetails: {
          startDate: packageData.checkIn ? new Date(packageData.checkIn) : undefined,
          endDate: packageData.checkOut ? new Date(packageData.checkOut) : undefined
        },
        passengers: {
          adults: Number(searchParams?.adults || packageDetails?.passengers?.adults || 1),
          children: Number(searchParams?.children || packageDetails?.passengers?.children || 0),
          infants: Number(searchParams?.infants || packageDetails?.passengers?.infants || 0)
        },
        passengerDetails: passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth || p.dob,
          passportNumber: p.passportNumber || p.passport,
          type: p.type || 'adult'
        })),
        contactInfo: {
          email: normalizedContact.email,
          phone: normalizedContact.phone
        },
        totalPrice: finalPackageTotal,
        bookingStatus: 'confirmed',
        paymentStatus: 'completed',
        searchParams: {
          ...searchParams,
          packageData,
          packageDetails
        }
      };
    } else if (bookingType === 'hotel') {
      if (!req.body.hotelData || !totalPrice) {
        return res.status(400).json({
          success: false,
          message: 'Missing required hotel booking information'
        });
      }

      const hotelData = req.body.hotelData;
      bookingData = {
        bookingType: 'hotel',
        bookingReference,
        hotelDetails: {
          checkIn: req.body.checkInDate ? new Date(req.body.checkInDate) : undefined,
          checkOut: req.body.checkOutDate ? new Date(req.body.checkOutDate) : undefined,
          roomType: req.body.roomType || 'Standard Room',
          numberOfRooms: Number(req.body.roomQuantity || searchParams?.roomQuantity || 1)
        },
        passengers: {
          adults: Number(searchParams?.adults || req.body.adults || 1),
          children: Number(searchParams?.children || req.body.children || 0),
          infants: 0
        },
        passengerDetails: passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth || p.dob,
          passportNumber: p.passportNumber || p.passport,
          type: p.type || 'adult'
        })),
        contactInfo: {
          email: normalizedContact.email,
          phone: normalizedContact.phone
        },
        totalPrice: Number(totalPrice),
        bookingStatus: 'confirmed',
        paymentStatus: 'completed',
        searchParams: {
          ...searchParams,
          hotelData
        }
      };
    } else {
      if ((!flight && !outboundFlight) || !passengers.length) {
        return res.status(400).json({
          success: false,
          message: 'Missing required flight booking information'
        });
      }

      const basePrice = Number(totalPrice || 0);
      const taxesAndFees = basePrice * 0.15;
      const seatCharges = (selectedSeats.length || 0) * 15;
      const finalAmount = basePrice + taxesAndFees + seatCharges;

      bookingData = {
        bookingType: 'flight',
        bookingReference,
        passengers: {
          adults: passengers.filter((p) => p.type === 'adult').length || 1,
          children: passengers.filter((p) => p.type === 'child').length || 0,
          infants: passengers.filter((p) => p.type === 'infant').length || 0
        },
        passengerDetails: passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dob,
          passportNumber: p.passport,
          type: p.type || 'adult'
        })),
        contactInfo: {
          email: normalizedContact.email,
          phone: normalizedContact.phone
        },
        totalPrice: finalAmount,
        bookingStatus: 'confirmed',
        paymentStatus: 'completed',
        flightDetails: flight || outboundFlight,
        returnFlightDetails: returnFlight,
        selectedSeats,
        searchParams
      };
    }

    const booking = new Booking(bookingData);
    await booking.save();

    const responseData = {
      ...bookingData,
      referenceNumber: booking.bookingReference,
      _id: booking._id
    };

    // Current template is flight-specific; keep package flow DB-only confirmation.
    if (bookingType === 'flight') {
      bookingEmailService.sendBookingConfirmation(responseData).catch((err) => {
        console.error('Email error:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    console.error('Booking payload:', req.body);
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// Resend booking confirmation email
router.post('/:id/resend-email', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const emailData = {
      referenceNumber: booking.bookingReference,
      contactInfo: booking.contactInfo,
      contact: booking.contact,
      passengers: booking.passengerDetails || booking.passengers || [],
      outboundFlight: booking.outboundFlight || booking.flightDetails,
      returnFlight: booking.returnFlightDetails,
      totalPrice: booking.totalPrice || booking.pricing?.totalPrice,
      finalAmount: booking.pricing?.totalPrice || booking.totalPrice,
      selectedSeats: booking.seatSelections || booking.selectedSeats || [],
      searchParams: {
        date: booking.searchParams?.departDate || booking.flightDetails?.departure?.date,
        returnDate: booking.searchParams?.returnDate || booking.returnFlightDetails?.departure?.date
      },
      taxesAndFees: booking.pricing?.taxesAndFees || 0,
      bookingDate: booking.createdAt
    };

    const result = await bookingEmailService.sendBookingConfirmation(emailData);

    if (result.sent) {
      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send email',
        reason: result.reason || result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
});

module.exports = router;
