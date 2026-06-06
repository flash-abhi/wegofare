import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plane, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  MapPin,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock,
  Gift,
  Sparkles,
  ChevronDown,
  Users,
  Baby,
  Timer
} from 'lucide-react';
import SeatMap from '../components/SeatMap';
import { API_URL } from '../config/api';
import './FlightOrder.css';

function FlightOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, outboundFlight, returnFlight, searchParams, totalPrice } = location.state || {};
  
  // Use outboundFlight if available (roundtrip), otherwise use flight (one-way)
  const primaryFlight = outboundFlight || flight;

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [returnSelectedSeats, setReturnSelectedSeats] = useState([]);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [currentSeatMapFlight, setCurrentSeatMapFlight] = useState('outbound');
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    email: '',
    phone: '',
    countryCode: '+1'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const totalPassengers = (searchParams?.passengers?.adults || 1) + 
                          (searchParams?.passengers?.children || 0) + 
                          (searchParams?.passengers?.infants || 0);

  // Helper to determine country from airport code (simplified)
  const getCountryFromAirportCode = (code) => {
    if (!code) return 'unknown';
    // Indian airports
    const indianAirports = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'AMD', 'GOI', 'COK', 'PNQ', 'JAI', 'LKO', 'TRV', 'VNS', 'IXC', 'GAU', 'IXB', 'SXR', 'ATQ', 'GAY'];
    if (indianAirports.includes(code.toUpperCase())) return 'IN';
    
    // US airports
    const usAirports = ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'SEA', 'LAS', 'MCO', 'EWR', 'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'DTW', 'PHL', 'LGA'];
    if (usAirports.includes(code.toUpperCase())) return 'US';
    
    // UK airports
    const ukAirports = ['LHR', 'LGW', 'MAN', 'STN', 'EDI', 'BHX', 'GLA'];
    if (ukAirports.includes(code.toUpperCase())) return 'UK';
    
    // Default: assume international if not recognized
    return code.substring(0, 2);
  };

  // Check if traveler is originating from US
  const isOriginatingFromUS = () => {
    const fromCountry = getCountryFromAirportCode(primaryFlight?.from?.code);
    return fromCountry === 'US';
  };

  // Check if passport field should be shown
  const shouldShowPassport = () => {
    return !isOriginatingFromUS();
  };

  // Initialize passenger details
  React.useEffect(() => {
    if (passengerDetails.length === 0) {
      const passengers = [];
      for (let i = 0; i < (searchParams?.passengers?.adults || 1); i++) {
        passengers.push({ type: 'adult', firstName: '', lastName: '', dob: '', gender: 'male', passportNumber: '' });
      }
      for (let i = 0; i < (searchParams?.passengers?.children || 0); i++) {
        passengers.push({ type: 'child', firstName: '', lastName: '', dob: '', gender: 'male', passportNumber: '' });
      }
      for (let i = 0; i < (searchParams?.passengers?.infants || 0); i++) {
        passengers.push({ type: 'infant', firstName: '', lastName: '', dob: '', gender: 'male', passportNumber: '' });
      }
      setPassengerDetails(passengers);
    }
  }, [searchParams, passengerDetails.length]);

  const updatePassenger = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const validateStep1 = () => {
    // Passport is always optional, only basic details required
    return passengerDetails.every(p => p.firstName && p.lastName && p.dob);
  };

  const validateStep2 = () => {
    return contactDetails.email && contactDetails.phone;
  };

  const validateStep3 = () => {
    return paymentDetails.cardNumber && paymentDetails.cardHolder && 
           paymentDetails.expiryDate && paymentDetails.cvv;
  };

  const handleContinue = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      // Seat selection - just continue, seats are optional
      setStep(3);
    } else if (step === 3 && validateStep2()) {
      setStep(4);
    } else if (step === 4 && validateStep3()) {
      handleBooking();
    }
  };

  const handleBooking = async () => {
    setIsProcessing(true);
    const bookingData = {
      flight: primaryFlight,
      outboundFlight,
      returnFlight,
      passengers: passengerDetails,
      contact: contactDetails,
      payment: paymentDetails,
      selectedSeats,
      returnSelectedSeats: returnFlight ? returnSelectedSeats : undefined,
      totalPrice: calculateFinalTotal(),
      promoCode: promoApplied ? promoCode : null,
      searchParams
    };

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/booking-confirmation', { state: { booking: data.data } });
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Unable to complete booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate seat extras
  const getSeatExtras = () => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0) +
           returnSelectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    const basePrice = totalPrice || 0;
    const taxes = basePrice * 0.15;
    const seatExtras = getSeatExtras();
    const subtotal = basePrice + taxes + seatExtras;
    return promoApplied ? subtotal - promoDiscount : subtotal;
  };

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoDiscount(calculateFinalTotal() * 0.1);
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'FLY20') {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    if (v.length === 0) return '';
    // Split into groups of 4
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format expiry date
  const formatExpiry = (value) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    if (v.length === 0) return '';
    if (v.length <= 2) return v;
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  };

  if (!primaryFlight) {
    return (
      <div className="flight-order-page">
        <div className="container">
          <div className="error-state">
            <Plane size={64} />
            <h2>No flight selected</h2>
            <p>Please go back and select a flight</p>
            <button onClick={() => navigate('/flights')} className="btn-primary">
              Search Flights
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-order-page">
      {/* Animated Header */}
      <div className="order-header">
        <div className="header-bg-animation"></div>
        <div className="container">
          <div className="header-content">
            <div className="header-icon">
              <Plane size={32} />
            </div>
            <h1>Complete Your Booking</h1>
            <p className="header-subtitle">You're just a few steps away from your dream trip!</p>
          </div>
          
          {/* Enhanced Progress Steps */}
          <div className="progress-container">
            <div className="progress-line">
              <div className="progress-fill" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            </div>
            <div className="progress-steps">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 1 ? <CheckCircle size={20} /> : <User size={18} />}
                </div>
                <span>Travelers</span>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 2 ? <CheckCircle size={20} /> : <MapPin size={18} />}
                </div>
                <span>Seats</span>
              </div>
              <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 3 ? <CheckCircle size={20} /> : <Mail size={18} />}
                </div>
                <span>Contact</span>
              </div>
              <div className={`step ${step >= 4 ? 'active' : ''}`}>
                <div className="step-number">
                  <CreditCard size={18} />
                </div>
                <span>Payment</span>
              </div>
            </div>
          </div>

          {/* Time remaining banner */}
          <div className="time-banner">
            <Timer size={16} />
            <span>Your selected fare is held for <strong>15:00</strong> minutes</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="order-layout">
          <div className="order-main">
            {step === 1 && (
              <div className="order-section animate-in">
                <div className="section-header">
                  <div className="section-icon">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2>Traveler Information</h2>
                    <p className="section-subtitle">Please enter details exactly as they appear on your ID</p>
                  </div>
                </div>
                
                {passengerDetails.map((passenger, index) => (
                  <div key={index} className="passenger-form">
                    <div className="passenger-header">
                      <div className="passenger-badge">
                        {passenger.type === 'adult' ? <User size={18} /> : 
                         passenger.type === 'child' ? <Users size={18} /> : <Baby size={18} />}
                        <span>Traveler {index + 1}</span>
                      </div>
                      <span className={`passenger-type-badge ${passenger.type}`}>
                        {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}
                      </span>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>First Name <span className="required">*</span></label>
                        <input
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                          placeholder="As shown on ID"
                          className={passenger.firstName ? 'filled' : ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name <span className="required">*</span></label>
                        <input
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                          placeholder="As shown on ID"
                          className={passenger.lastName ? 'filled' : ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Date of Birth <span className="required">*</span></label>
                        <input
                          type="date"
                          value={passenger.dob}
                          onChange={(e) => updatePassenger(index, 'dob', e.target.value)}
                          className={passenger.dob ? 'filled' : ''}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Gender <span className="required">*</span></label>
                        <div className="select-wrapper">
                          <select
                            value={passenger.gender}
                            onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          <ChevronDown size={18} className="select-icon" />
                        </div>
                      </div>
                      {shouldShowPassport() && (
                        <div className="form-group full-width">
                          <label>Passport Number <span className="optional">(Optional)</span></label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value.toUpperCase())}
                            placeholder="Enter passport number for international travel"
                            className={passenger.passportNumber ? 'filled' : ''}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="info-box">
                  <AlertCircle size={20} />
                  <p>Ensure all names match your government-issued ID exactly. Name changes are not permitted after booking.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="order-section">
                <h2><MapPin size={24} /> Select Your Seats</h2>
                <p className="section-subtitle">Choose your preferred seats (optional)</p>
                
                {/* Outbound Flight Seats */}
                <div className="seat-selection-section">
                  <h3 style={{marginBottom: '15px', fontSize: '18px', color: '#2d3748'}}>
                    {returnFlight ? 'Outbound Flight - ' : ''}{primaryFlight?.from?.code} → {primaryFlight?.to?.code}
                  </h3>
                  {selectedSeats.length > 0 ? (
                    <div className="selected-seats-display">
                      <h4>Selected Seats:</h4>
                      <div className="seats-grid">
                        {selectedSeats.map((seat, idx) => (
                          <div key={idx} className="seat-card">
                            <span className="seat-number">{seat.number}</span>
                            <span className="seat-type">{seat.type}</span>
                            {seat.price > 0 && <span className="seat-price">+${seat.price}</span>}
                          </div>
                        ))}
                      </div>
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          setCurrentSeatMapFlight('outbound');
                          setShowSeatMap(true);
                        }}
                      >
                        Change Seats
                      </button>
                    </div>
                  ) : (
                    <div className="no-seats-selected">
                      <p>No seats selected yet. You can select seats now or later at check-in.</p>
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setCurrentSeatMapFlight('outbound');
                          setShowSeatMap(true);
                        }}
                      >
                        Select Seats
                      </button>
                    </div>
                  )}
                </div>

                {/* Return Flight Seats (if roundtrip) */}
                {returnFlight && (
                  <div className="seat-selection-section" style={{marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e2e8f0'}}>
                    <h3 style={{marginBottom: '15px', fontSize: '18px', color: '#2d3748'}}>
                      Return Flight - {returnFlight?.from?.code} → {returnFlight?.to?.code}
                    </h3>
                    {returnSelectedSeats.length > 0 ? (
                      <div className="selected-seats-display">
                        <h4>Selected Seats:</h4>
                        <div className="seats-grid">
                          {returnSelectedSeats.map((seat, idx) => (
                            <div key={idx} className="seat-card">
                              <span className="seat-number">{seat.number}</span>
                              <span className="seat-type">{seat.type}</span>
                              {seat.price > 0 && <span className="seat-price">+${seat.price}</span>}
                            </div>
                          ))}
                        </div>
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            setCurrentSeatMapFlight('return');
                            setShowSeatMap(true);
                          }}
                        >
                          Change Seats
                        </button>
                      </div>
                    ) : (
                      <div className="no-seats-selected">
                        <p>No seats selected yet. You can select seats now or later at check-in.</p>
                        <button 
                          className="btn-primary"
                          onClick={() => {
                            setCurrentSeatMapFlight('return');
                            setShowSeatMap(true);
                          }}
                        >
                          Select Seats
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="order-section">
                <h2><Mail size={24} /> Contact Information</h2>
                <p className="section-subtitle">We'll send your booking confirmation here</p>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) => setContactDetails({...contactDetails, email: e.target.value})}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country Code</label>
                    <select
                      value={contactDetails.countryCode}
                      onChange={(e) => setContactDetails({...contactDetails, countryCode: e.target.value})}
                    >
                      <option value="+1">+1 (USA/Canada)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+91 (India)</option>
                      <option value="+86">+86 (China)</option>
                      <option value="+81">+81 (Japan)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={contactDetails.phone}
                      onChange={(e) => setContactDetails({...contactDetails, phone: e.target.value})}
                      placeholder="1234567890"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="order-section animate-in">
                <div className="section-header">
                  <div className="section-icon payment">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2>Secure Payment</h2>
                    <p className="section-subtitle">Your payment information is encrypted and secure</p>
                  </div>
                </div>

                {/* Card Type Icons */}
                <div className="card-types">
                  <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" alt="Visa" />
                  <img src="https://cdn-icons-png.flaticon.com/128/349/349228.png" alt="Mastercard" />
                  <img src="https://cdn-icons-png.flaticon.com/128/349/349230.png" alt="Amex" />
                  <img src="https://cdn-icons-png.flaticon.com/128/6124/6124998.png" alt="Discover" />
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Card Number <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <CreditCard size={20} className="input-icon" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: formatCardNumber(e.target.value)})}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={paymentDetails.cardNumber ? 'filled' : ''}
                        autoComplete="cc-number"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Cardholder Name <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <User size={20} className="input-icon" />
                      <input
                        type="text"
                        value={paymentDetails.cardHolder}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardHolder: e.target.value.toUpperCase()})}
                        placeholder="NAME ON CARD"
                        className={paymentDetails.cardHolder ? 'filled' : ''}
                        autoComplete="cc-name"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Expiry Date <span className="required">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: formatExpiry(e.target.value)})}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={paymentDetails.expiryDate ? 'filled' : ''}
                      autoComplete="cc-exp"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <Lock size={20} className="input-icon" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value.replace(/\D/g, '')})}
                        placeholder="123"
                        maxLength="4"
                        className={paymentDetails.cvv ? 'filled' : ''}
                        autoComplete="cc-csc"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Billing Address <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <MapPin size={20} className="input-icon" />
                      <input
                        type="text"
                        value={paymentDetails.billingAddress}
                        onChange={(e) => setPaymentDetails({...paymentDetails, billingAddress: e.target.value})}
                        placeholder="Street address, City, State, ZIP"
                        className={paymentDetails.billingAddress ? 'filled' : ''}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="security-badges">
                  <div className="security-badge">
                    <ShieldCheck size={20} />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="security-badge">
                    <Lock size={20} />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="security-badge">
                    <CheckCircle size={20} />
                    <span>Verified Secure</span>
                  </div>
                </div>

                <div className="security-notice">
                  <ShieldCheck size={20} />
                  <span>Your payment is protected by bank-level security. We never store your full card details.</span>
                </div>
              </div>
            )}

            <div className="order-actions">
              {step > 1 && (
                <button className="btn-primary" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              {step === 2 && (
                <button 
                  className="btn-skip" 
                  onClick={() => setStep(3)}
                >
                  Skip for now
                </button>
              )}
              <button 
                className={`btn-primary ${isProcessing ? 'processing' : ''}`}
                onClick={handleContinue}
                disabled={
                  isProcessing ||
                  (step === 1 && !validateStep1()) ||
                  (step === 3 && !validateStep2()) ||
                  (step === 4 && !validateStep3())
                }
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : step === 4 ? (
                  <>
                    <Lock size={20} />
                    Pay ${calculateFinalTotal().toFixed(2)}
                  </>
                ) : (
                  <>
                    Continue
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="order-summary">
            {/* Flight Summary Card */}
            <div className="summary-card flight-card">
              <div className="summary-header">
                <Plane size={20} />
                <h3>Flight Details</h3>
              </div>
              
              {/* Outbound Flight */}
              <div className="flight-summary">
                {returnFlight && <div className="flight-label">Outbound</div>}
                <div className="flight-route-display">
                  <div className="airport-info">
                    <span className="airport-code">{primaryFlight?.from?.code}</span>
                    <span className="airport-city">{primaryFlight?.from?.city || primaryFlight?.from?.name}</span>
                  </div>
                  <div className="route-line">
                    <Plane size={16} />
                  </div>
                  <div className="airport-info">
                    <span className="airport-code">{primaryFlight?.to?.code}</span>
                    <span className="airport-city">{primaryFlight?.to?.city || primaryFlight?.to?.name}</span>
                  </div>
                </div>
                <div className="flight-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{searchParams?.date}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{primaryFlight?.departure?.time} - {primaryFlight?.arrival?.time}</span>
                  </div>
                </div>
                <div className="airline-badge">
                  {primaryFlight?.airlineLogo && (
                    <img src={primaryFlight.airlineLogo} alt="" />
                  )}
                  <span>{primaryFlight?.airlineName || primaryFlight?.airline}</span>
                </div>
              </div>

              {/* Return Flight */}
              {returnFlight && (
                <div className="flight-summary return">
                  <div className="flight-label">Return</div>
                  <div className="flight-route-display">
                    <div className="airport-info">
                      <span className="airport-code">{returnFlight?.from?.code}</span>
                      <span className="airport-city">{returnFlight?.from?.city}</span>
                    </div>
                    <div className="route-line">
                      <Plane size={16} />
                    </div>
                    <div className="airport-info">
                      <span className="airport-code">{returnFlight?.to?.code}</span>
                      <span className="airport-city">{returnFlight?.to?.city}</span>
                    </div>
                  </div>
                  <div className="flight-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{searchParams?.returnDate}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{returnFlight?.departure?.time} - {returnFlight?.arrival?.time}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Travelers Card */}
            <div className="summary-card travelers-card">
              <div className="summary-header">
                <Users size={20} />
                <h3>Travelers</h3>
              </div>
              <div className="travelers-list">
                {searchParams?.passengers?.adults > 0 && (
                  <div className="traveler-row">
                    <User size={16} />
                    <span>{searchParams.passengers.adults} Adult{searchParams.passengers.adults > 1 ? 's' : ''}</span>
                  </div>
                )}
                {searchParams?.passengers?.children > 0 && (
                  <div className="traveler-row">
                    <Users size={16} />
                    <span>{searchParams.passengers.children} Child{searchParams.passengers.children > 1 ? 'ren' : ''}</span>
                  </div>
                )}
                {searchParams?.passengers?.infants > 0 && (
                  <div className="traveler-row">
                    <Baby size={16} />
                    <span>{searchParams.passengers.infants} Infant{searchParams.passengers.infants > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Card */}
            <div className="summary-card price-card">
              <div className="summary-header">
                <Sparkles size={20} />
                <h3>Price Summary</h3>
              </div>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Fare × {totalPassengers}</span>
                  <span>${totalPrice?.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Taxes & Fees</span>
                  <span>${(totalPrice * 0.15).toFixed(2)}</span>
                </div>
                {getSeatExtras() > 0 && (
                  <div className="price-row">
                    <span>Seat Selection</span>
                    <span>${getSeatExtras().toFixed(2)}</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="price-row discount">
                    <span><Gift size={14} /> Promo Discount</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              {!promoApplied && (
                <div className="promo-section">
                  <div className="promo-input">
                    <Gift size={22} />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    />
                    <button onClick={applyPromoCode} disabled={!promoCode}>Apply</button>
                  </div>
                </div>
              )}

              <div className="price-total">
                <span>Total</span>
                <div className="total-amount">
                  <span className="currency">USD &nbsp;</span>
                  <span className="amount">${calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="price-note">
                <CheckCircle size={14} />
                <span>All taxes and fees included</span>
              </div>
            </div>

            
          </aside>
        </div>
      </div>

      {showSeatMap && (
        <SeatMap
          flight={currentSeatMapFlight === 'outbound' ? primaryFlight : returnFlight}
          passengers={searchParams?.passengers}
          onSeatsSelected={(seats) => {
            if (currentSeatMapFlight === 'outbound') {
              setSelectedSeats(seats);
            } else {
              setReturnSelectedSeats(seats);
            }
            setShowSeatMap(false);
          }}
          onClose={() => setShowSeatMap(false)}
        />
      )}
    </div>
  );
}

export default FlightOrder;
