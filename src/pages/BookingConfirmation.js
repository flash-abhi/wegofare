import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar,
  Clock,
  User,
  Plane,
  MapPin,
  ArrowRight,
  Home,
  Send,
  Printer,
  QrCode,
  Shield,
  Info,
  Phone,
  CreditCard
} from 'lucide-react';
import './BookingConfirmation.css';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  if (!booking) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="error-state">
            <Plane size={64} />
            <h2>No booking found</h2>
            <p>Please complete your booking first</p>
            <button onClick={() => navigate('/flights')} className="btn-primary">
              Search Flights
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    window.print();
  };

  const handleEmailConfirmation = () => {
    alert(`Confirmation sent to ${booking.contact?.email}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getFlightDuration = (flight) => {
    return flight?.duration || 'N/A';
  };

  const isRoundTrip = booking?.outboundFlight && booking?.returnFlight;
  const primaryFlight = booking?.outboundFlight || booking?.flight;
  const returnFlight = booking?.returnFlight;

  return (
    <div className="confirmation-page">
      <div className="confirmation-header">
        <div className="container">
          <div className="success-animation">
            <div className="success-icon">
              <CheckCircle size={80} />
            </div>
            <div className="confetti"></div>
          </div>
          <h1>🎉 Booking Confirmed!</h1>
          <p className="subtitle">Your flight has been successfully booked</p>
          <div className="booking-reference">
            <span className="ref-label">Booking Reference</span>
            <strong className="ref-number">{booking.referenceNumber}</strong>
            <span className="ref-hint">Keep this reference for check-in</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="confirmation-content">
          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn" onClick={handleEmailConfirmation}>
              <Send size={18} />
              <span>Email Confirmation</span>
            </button>
            <button className="action-btn" onClick={handleDownload}>
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button className="action-btn" onClick={handleDownload}>
              <Printer size={18} />
              <span>Print Ticket</span>
            </button>
          </div>

          <div className="confirmation-message">
            <Mail size={24} />
            <div>
              <p className="message-text">Confirmation email sent to</p>
              <p className="message-email">{booking.contact?.email}</p>
            </div>
          </div>

          {/* Boarding Pass Style Tickets */}
          <div className="boarding-passes">
            {/* Outbound Flight */}
            <div className="boarding-pass">
              <div className="pass-header">
                <div className="pass-type">
                  <Plane size={18} />
                  <span>{isRoundTrip ? 'Outbound Flight' : 'Flight'}</span>
                </div>
                {primaryFlight?.airlineLogo && (
                  <img 
                    src={primaryFlight.airlineLogo} 
                    alt={primaryFlight.airlineName} 
                    className="airline-logo-small"
                  />
                )}
              </div>
              
              <div className="pass-body">
                <div className="flight-route-compact">
                  <div className="route-endpoint">
                    <div className="airport-code">{primaryFlight?.from?.code}</div>
                    <div className="airport-name">{primaryFlight?.from?.city}</div>
                    <div className="flight-time">{primaryFlight?.departure?.time}</div>
                    <div className="flight-date">{formatDate(booking.searchParams?.departureDate || booking.searchParams?.date)}</div>
                  </div>
                  
                  <div className="route-connector">
                    <div className="route-duration">
                      <span>{getFlightDuration(primaryFlight)}</span>
                      {primaryFlight?.stops > 0 && <span className="stops-badge">{primaryFlight.stops} stop{primaryFlight.stops > 1 ? 's' : ''}</span>}
                    </div>
                    <div className="route-line-animated">
                      <Plane size={20} className="route-plane" />
                    </div>
                  </div>
                  
                  <div className="route-endpoint">
                    <div className="airport-code">{primaryFlight?.to?.code}</div>
                    <div className="airport-name">{primaryFlight?.to?.city}</div>
                    <div className="flight-time">{primaryFlight?.arrival?.time}</div>
                    <div className="flight-date">{formatDate(booking.searchParams?.departureDate || booking.searchParams?.date)}</div>
                  </div>
                </div>
                
                <div className="pass-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Flight</span>
                      <span className="detail-value">{primaryFlight?.flightNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Class</span>
                      <span className="detail-value">{primaryFlight?.class || 'Economy'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Airline</span>
                      <span className="detail-value">{primaryFlight?.airlineName}</span>
                    </div>
                    {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Seats</span>
                        <span className="detail-value">{booking.selectedSeats.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pass-footer">
                <div className="barcode-section">
                  <QrCode size={80} />
                  <span className="barcode-ref">{booking.referenceNumber}</span>
                </div>
              </div>
            </div>

            {/* Return Flight */}
            {isRoundTrip && returnFlight && (
              <div className="boarding-pass">
                <div className="pass-header">
                  <div className="pass-type">
                    <Plane size={18} />
                    <span>Return Flight</span>
                  </div>
                  {returnFlight?.airlineLogo && (
                    <img 
                      src={returnFlight.airlineLogo} 
                      alt={returnFlight.airlineName} 
                      className="airline-logo-small"
                    />
                  )}
                </div>
                
                <div className="pass-body">
                  <div className="flight-route-compact">
                    <div className="route-endpoint">
                      <div className="airport-code">{returnFlight?.from?.code}</div>
                      <div className="airport-name">{returnFlight?.from?.city}</div>
                      <div className="flight-time">{returnFlight?.departure?.time}</div>
                      <div className="flight-date">{formatDate(booking.searchParams?.returnDate)}</div>
                    </div>
                    
                    <div className="route-connector">
                      <div className="route-duration">
                        <span>{getFlightDuration(returnFlight)}</span>
                        {returnFlight?.stops > 0 && <span className="stops-badge">{returnFlight.stops} stop{returnFlight.stops > 1 ? 's' : ''}</span>}
                      </div>
                      <div className="route-line-animated">
                        <Plane size={20} className="route-plane" />
                      </div>
                    </div>
                    
                    <div className="route-endpoint">
                      <div className="airport-code">{returnFlight?.to?.code}</div>
                      <div className="airport-name">{returnFlight?.to?.city}</div>
                      <div className="flight-time">{returnFlight?.arrival?.time}</div>
                      <div className="flight-date">{formatDate(booking.searchParams?.returnDate)}</div>
                    </div>
                  </div>
                  
                  <div className="pass-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Flight</span>
                        <span className="detail-value">{returnFlight?.flightNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Class</span>
                        <span className="detail-value">{returnFlight?.class || 'Economy'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Airline</span>
                        <span className="detail-value">{returnFlight?.airlineName}</span>
                      </div>
                      {booking.returnSelectedSeats && booking.returnSelectedSeats.length > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Seats</span>
                          <span className="detail-value">{booking.returnSelectedSeats.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pass-footer">
                  <div className="barcode-section">
                    <QrCode size={80} />
                    <span className="barcode-ref">{booking.referenceNumber}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information Grid */}
          <div className="info-grid">

            {/* Passenger Information */}
            <div className="info-card">
              <div className="card-header">
                <User size={22} />
                <h3>Passenger Information</h3>
              </div>
              <div className="passengers-grid">
                {booking.passengers?.map((passenger, index) => (
                  <div key={index} className="passenger-item">
                    <div className="passenger-number">PAX {index + 1}</div>
                    <div className="passenger-details">
                      <div className="passenger-name">
                        {passenger.firstName} {passenger.lastName}
                      </div>
                      <div className="passenger-meta">
                        <span className="badge-type">{passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}</span>
                        <span className="passenger-gender">{passenger.gender}</span>
                        {passenger.dob && <span className="passenger-dob">DOB: {passenger.dob}</span>}
                      </div>
                      {passenger.passportNumber && (
                        <div className="passenger-passport">
                          <Shield size={14} />
                          <span>Passport: {passenger.passportNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="info-card">
              <div className="card-header">
                <CreditCard size={22} />
                <h3>Payment Summary</h3>
              </div>
              <div className="payment-breakdown">
                <div className="price-row">
                  <span>Base Fare ({booking.passengers?.length || 1} passenger{(booking.passengers?.length || 1) > 1 ? 's' : ''})</span>
                  <span className="price">${booking.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Taxes & Fees</span>
                  <span className="price">${booking.taxesAndFees?.toFixed(2) || (booking.totalPrice * 0.15).toFixed(2)}</span>
                </div>
                {booking.seatCharges > 0 && (
                  <div className="price-row">
                    <span>Seat Selection</span>
                    <span className="price">${booking.seatCharges?.toFixed(2)}</span>
                  </div>
                )}
                {isRoundTrip && (
                  <div className="price-row highlight">
                    <span>Round Trip Discount</span>
                    <span className="price discount">-${(booking.totalPrice * 0.05).toFixed(2)}</span>
                  </div>
                )}
                <div className="price-divider"></div>
                <div className="price-row total">
                  <span>Total Amount Paid</span>
                  <span className="price">${booking.finalAmount?.toFixed(2)}</span>
                </div>
                <div className="payment-badge">
                  <CheckCircle size={18} />
                  <span>Payment Confirmed</span>
                  <span className="payment-method">•••• {booking.payment?.cardNumber?.slice(-4) || '****'}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="info-card">
              <div className="card-header">
                <Mail size={22} />
                <h3>Contact Details</h3>
              </div>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail size={16} />
                  <span>{booking.contact?.email}</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <span>{booking.contact?.countryCode} {booking.contact?.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Guidelines */}
          <div className="travel-guidelines">
            <div className="guideline-header">
              <Info size={24} />
              <h3>Important Travel Information</h3>
            </div>
            <div className="guidelines-grid">
              <div className="guideline-item">
                <div className="guideline-icon">✓</div>
                <div className="guideline-content">
                  <h4>Check-in</h4>
                  <p>Web check-in opens 48 hours before departure. Airport check-in closes 60 minutes before departure.</p>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">✓</div>
                <div className="guideline-content">
                  <h4>Arrival Time</h4>
                  <p>Arrive at least 3 hours before international flights and 2 hours before domestic flights.</p>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">✓</div>
                <div className="guideline-content">
                  <h4>Documents</h4>
                  <p>Carry valid government-issued ID, passport, and visa (if required) for international travel.</p>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">✓</div>
                <div className="guideline-content">
                  <h4>Baggage</h4>
                  <p>Check airline's baggage policy. Standard allowance: 1 cabin bag (7kg) + 1 checked bag (20kg).</p>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">✓</div>
                <div className="guideline-content">
                  <h4>Cancellation</h4>
                  <p>Free cancellation within 24 hours of booking. After that, cancellation charges may apply.</p>
                </div>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">✓</div>
                <div className="guideline-content">
                  <h4>Contact Support</h4>
                  <p>For any queries, contact our 24/7 support at support@flights.com or call +1-800-FLIGHTS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="confirmation-footer">
            <button className="btn-outline" onClick={() => navigate('/flights')}>
              <ArrowRight size={20} />
              Book Another Flight
            </button>
            <button className="btn-primary-large" onClick={() => navigate('/')}>
              <Home size={20} />
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
