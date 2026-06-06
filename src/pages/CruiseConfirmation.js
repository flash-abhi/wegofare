import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Ship, Calendar, Users, Mail, Phone, MapPin, Download, Home } from 'lucide-react';
import './CruiseConfirmation.css';

function CruiseConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, cruise, selectedCabin, passengers } = location.state || {};

  if (!booking || !cruise) {
    navigate('/cruises');
    return null;
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cruise-confirmation-page">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1>Booking Confirmed!</h1>
          <p>Your cruise adventure awaits. We've sent the confirmation to your email.</p>
          <div className="booking-number">
            <span>Booking Reference</span>
            <strong>{booking.bookingReference}</strong>
          </div>
        </div>

        {/* Booking Details */}
        <div className="confirmation-content">
          <div className="confirmation-section">
            <h2>
              <Ship size={24} />
              Cruise Details
            </h2>
            
            <div className="cruise-detail-card">
              <img src={cruise.images[0]} alt={cruise.shipName} />
              <div className="cruise-detail-info">
                <h3>{cruise.shipName}</h3>
                <p className="cruise-line">{cruise.cruiseLine}</p>
                <div className="detail-grid">
                  <div className="detail-item">
                    <MapPin size={18} />
                    <div>
                      <span className="label">Destination</span>
                      <strong>{cruise.destination}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Calendar size={18} />
                    <div>
                      <span className="label">Departure</span>
                      <strong>{formatDate(cruise.departureDate)}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Calendar size={18} />
                    <div>
                      <span className="label">Return</span>
                      <strong>{formatDate(cruise.returnDate)}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Ship size={18} />
                    <div>
                      <span className="label">Duration</span>
                      <strong>{cruise.duration} nights</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Users size={18} />
                    <div>
                      <span className="label">Cabin Type</span>
                      <strong>{selectedCabin.type}</strong>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Users size={18} />
                    <div>
                      <span className="label">Passengers</span>
                      <strong>{passengers.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="confirmation-section">
            <h2>
              <Users size={24} />
              Passenger Information
            </h2>
            <div className="passengers-list">
              {passengers.map((passenger, index) => (
                <div key={index} className="passenger-card">
                  <div className="passenger-header">
                    <span className="passenger-number">Passenger {index + 1}</span>
                    {index === 0 && <span className="lead-badge">Lead Passenger</span>}
                  </div>
                  <div className="passenger-info">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-value">
                        {passenger.title} {passenger.firstName} {passenger.lastName}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date of Birth:</span>
                      <span className="info-value">
                        {new Date(passenger.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Nationality:</span>
                      <span className="info-value">{passenger.nationality}</span>
                    </div>
                    {passenger.dietary && (
                      <div className="info-row">
                        <span className="info-label">Dietary:</span>
                        <span className="info-value">{passenger.dietary}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="confirmation-section">
            <h2>
              <Mail size={24} />
              Contact Information
            </h2>
            <div className="contact-grid">
              <div className="contact-item">
                <Mail size={18} />
                <div>
                  <span className="label">Email</span>
                  <strong>{booking.contactEmail}</strong>
                </div>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <div>
                  <span className="label">Phone</span>
                  <strong>{booking.contactPhone}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="confirmation-section">
            <h2>Payment Summary</h2>
            <div className="payment-summary">
              <div className="payment-row">
                <span>Cabin Price × {passengers.length}</span>
                <span>{formatPrice(selectedCabin.price.amount * passengers.length)}</span>
              </div>
              <div className="payment-row">
                <span>Taxes & Fees</span>
                <span>{formatPrice(booking.taxes)}</span>
              </div>
              <div className="payment-row">
                <span>Service Fee</span>
                <span>{formatPrice(booking.serviceFee)}</span>
              </div>
              <div className="payment-total">
                <span>Total Paid (20% Deposit)</span>
                <strong>{formatPrice(booking.totalAmount * 0.2)}</strong>
              </div>
              <div className="payment-balance">
                <span>Balance Due (60 days before departure)</span>
                <strong>{formatPrice(booking.totalAmount * 0.8)}</strong>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="confirmation-section info-section">
            <h2>Important Information</h2>
            <div className="info-boxes">
              <div className="info-box">
                <h3>📋 What's Next</h3>
                <ul>
                  <li>Check-in opens 90 days before departure</li>
                  <li>Final payment due 60 days before departure</li>
                  <li>E-documents will be sent 2 weeks before sailing</li>
                  <li>Arrive at port 2-3 hours before departure</li>
                </ul>
              </div>
              <div className="info-box">
                <h3>🎒 What to Bring</h3>
                <ul>
                  <li>Valid passport (must be valid for 6+ months)</li>
                  <li>Printed booking confirmation</li>
                  <li>Travel insurance documents</li>
                  <li>Any medical prescriptions</li>
                </ul>
              </div>
              <div className="info-box">
                <h3>❌ Cancellation Policy</h3>
                <ul>
                  <li>90+ days: Full refund minus $100 fee</li>
                  <li>60-89 days: 50% refund</li>
                  <li>30-59 days: 25% refund</li>
                  <li>Less than 30 days: No refund</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <button className="download-btn" onClick={handlePrint}>
              <Download size={20} />
              Download Confirmation
            </button>
            <button className="home-btn" onClick={() => navigate('/')}>
              <Home size={20} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CruiseConfirmation;
