import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Calendar, Users, CreditCard, ChevronRight, MapPin, Clock } from 'lucide-react';
import './Booking.css';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, searchParams, totalPrice, selectedSeats } = location.state || {};

  const [passengerDetails, setPassengerDetails] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  if (!flight) {
    navigate('/flights');
    return null;
  }

  const totalPassengers = (searchParams.passengers?.adults || 1) + 
                         (searchParams.passengers?.children || 0) + 
                         (searchParams.passengers?.infants || 0);

  const seatSelectionFee = selectedSeats?.reduce((sum, seat) => sum + seat.price, 0) || 0;
  const finalTotalPrice = totalPrice + seatSelectionFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle booking submission
    alert('Booking confirmed! Thank you for choosing our service.');
    navigate('/');
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <div className="container">
          <h1>Complete Your Booking</h1>
          <p>You're just one step away from your trip!</p>
        </div>
      </div>

      <div className="container">
        <div className="booking-layout">
          <div className="booking-main">
            {/* Flight Summary */}
            <div className="booking-section">
              <h2><Plane size={24} /> Flight Details</h2>
              <div className="flight-summary-card">
                <div className="flight-route">
                  <div className="route-info">
                    <div className="airport">
                      <h3>{flight.from.code}</h3>
                      <p>{flight.departure.time}</p>
                    </div>
                    <div className="route-visual">
                      <div className="line"></div>
                      <Plane size={20} />
                      <div className="line"></div>
                    </div>
                    <div className="airport">
                      <h3>{flight.to.code}</h3>
                      <p>{flight.arrival.time}</p>
                    </div>
                  </div>
                  <div className="flight-meta">
                    <span><Clock size={16} /> {flight.duration}</span>
                    <span>•</span>
                    <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                    <span>•</span>
                    <span>{flight.class}</span>
                  </div>
                </div>
                <div className="airline-badge">
                  {flight.airlineLogo && (
                    <img src={flight.airlineLogo} alt={flight.airlineName} />
                  )}
                  <div>
                    <strong>{flight.airlineName || flight.airline}</strong>
                    <span>{flight.flightNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Seats */}
            {selectedSeats && selectedSeats.length > 0 && (
              <div className="booking-section">
                <h2><MapPin size={24} /> Selected Seats</h2>
                <div className="seats-summary">
                  {selectedSeats.map((seat, index) => (
                    <div key={index} className="seat-item">
                      <div className="seat-badge">{seat.number}</div>
                      <div className="seat-info">
                        <strong>Seat {seat.number}</strong>
                        <span>{seat.type}</span>
                      </div>
                      {seat.price > 0 && (
                        <div className="seat-price">+${seat.price}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passenger Details */}
            <div className="booking-section">
              <h2><Users size={24} /> Passenger Information</h2>
              <form className="passenger-form">
                {[...Array(totalPassengers)].map((_, index) => (
                  <div key={index} className="passenger-card">
                    <h4>Passenger {index + 1} {selectedSeats?.[index] && `- Seat ${selectedSeats[index].number}`}</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input type="text" placeholder="John" required />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input type="text" placeholder="Doe" required />
                      </div>
                      <div className="form-group">
                        <label>Date of Birth *</label>
                        <input type="date" required />
                      </div>
                      <div className="form-group">
                        <label>Passport Number *</label>
                        <input type="text" placeholder="A12345678" required />
                      </div>
                    </div>
                  </div>
                ))}
              </form>
            </div>

            {/* Contact Information */}
            <div className="booking-section">
              <h2>Contact Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="john.doe@example.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="+1 234 567 8900"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="booking-section">
              <h2><CreditCard size={24} /> Payment Details</h2>
              <div className="payment-form">
                <div className="form-group full-width">
                  <label>Card Number *</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Cardholder Name *</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    required 
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      maxLength="5"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      maxLength="3"
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <aside className="booking-sidebar">
            <div className="price-summary">
              <h3>Price Summary</h3>
              
              <div className="summary-item">
                <span>Base Fare ({totalPassengers} passenger{totalPassengers > 1 ? 's' : ''})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {seatSelectionFee > 0 && (
                <div className="summary-item">
                  <span>Seat Selection</span>
                  <span>+${seatSelectionFee.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-item">
                <span>Taxes & Fees</span>
                <span>${(finalTotalPrice * 0.1).toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total Amount</span>
                <span>${(finalTotalPrice + finalTotalPrice * 0.1).toFixed(2)}</span>
              </div>

              <button className="confirm-booking-btn" onClick={handleSubmit}>
                Confirm & Pay
                <ChevronRight size={20} />
              </button>

              <div className="secure-payment">
                <span>🔒 Secure payment with SSL encryption</span>
              </div>
            </div>

            <div className="booking-benefits">
              <h4>What's included</h4>
              <ul>
                <li>✓ Free cancellation within 24 hours</li>
                <li>✓ Instant booking confirmation</li>
                <li>✓ 24/7 customer support</li>
                <li>✓ Travel insurance available</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Booking;
