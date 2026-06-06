import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ship, User, Mail, Phone, CreditCard, Calendar, MapPin, Users, Lock, Check } from 'lucide-react';
import './CruiseBooking.css';

function CruiseBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cruise, selectedCabin, passengers } = location.state || {};

  const [step, setStep] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!cruise || !selectedCabin) {
      navigate('/cruises');
      return;
    }

    // Initialize passenger details
    const initialPassengers = Array.from({ length: passengers || 2 }, (_, i) => ({
      id: i + 1,
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
      dietary: ''
    }));
    setPassengerDetails(initialPassengers);
  }, [cruise, selectedCabin, passengers, navigate]);

  const updatePassenger = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const updateContactInfo = (field, value) => {
    setContactInfo({ ...contactInfo, [field]: value });
  };

  const updatePaymentInfo = (field, value) => {
    setPaymentInfo({ ...paymentInfo, [field]: value });
  };

  const validateStep1 = () => {
    return passengerDetails.every(p => 
      p.title && p.firstName && p.lastName && p.dateOfBirth && p.nationality
    );
  };

  const validateStep2 = () => {
    return contactInfo.email && contactInfo.phone && contactInfo.address && 
           contactInfo.city && contactInfo.country && contactInfo.zipCode;
  };

  const validateStep3 = () => {
    return paymentInfo.cardNumber.length === 16 && 
           paymentInfo.cardName && 
           paymentInfo.expiryDate && 
           paymentInfo.cvv.length === 3 &&
           agreedToTerms;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      alert('Please fill in all passenger details');
      return;
    }
    if (step === 2 && !validateStep2()) {
      alert('Please fill in all contact information');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      alert('Please complete all payment details and agree to terms');
      return;
    }

    setProcessing(true);

    try {
      const bookingData = {
        cruiseId: cruise.cruiseId,
        cabinType: selectedCabin.type,
        passengers: passengerDetails,
        contactInfo,
        paymentInfo: {
          ...paymentInfo,
          cardNumber: paymentInfo.cardNumber.slice(-4) // Only last 4 digits
        },
        specialRequests,
        totalAmount: calculateTotal()
      };

      const response = await fetch('/api/cruises/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (data.success) {
        navigate('/cruise-confirmation', { 
          state: { 
            booking: data.data,
            cruise,
            selectedCabin,
            passengers: passengerDetails
          } 
        });
      } else {
        alert('Booking failed: ' + data.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to process booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedCabin) return 0;
    const cabinPrice = selectedCabin.price.amount;
    const totalPassengers = passengerDetails.length;
    const subtotal = cabinPrice * totalPassengers;
    const taxes = subtotal * 0.12;
    const serviceFee = 50;
    return subtotal + taxes + serviceFee;
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!cruise || !selectedCabin) {
    return null;
  }

  return (
    <div className="cruise-booking-page">
      <div className="booking-container">
        {/* Progress Steps */}
        <div className="booking-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">{step > 1 ? <Check size={20} /> : '1'}</div>
            <span>Passenger Details</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">{step > 2 ? <Check size={20} /> : '2'}</div>
            <span>Contact Info</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className="booking-content">
          {/* Left Side - Form */}
          <div className="booking-form-section">
            <h1>
              <Ship size={32} />
              Complete Your Cruise Booking
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Passenger Details */}
              {step === 1 && (
                <div className="form-step">
                  <h2><Users size={24} /> Passenger Information</h2>
                  {passengerDetails.map((passenger, index) => (
                    <div key={passenger.id} className="passenger-section">
                      <h3>Passenger {index + 1} {index === 0 && '(Lead Passenger)'}</h3>
                      
                      <div className="form-row">
                        <div className="form-group small">
                          <label>Title</label>
                          <select
                            value={passenger.title}
                            onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                            required
                          >
                            <option value="">Select</option>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Ms">Ms</option>
                            <option value="Dr">Dr</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Date of Birth</label>
                          <input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Nationality</label>
                          <input
                            type="text"
                            value={passenger.nationality}
                            onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                            placeholder="e.g., American"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Passport Number</label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                            placeholder="Optional for domestic cruises"
                          />
                        </div>
                        <div className="form-group">
                          <label>Passport Expiry</label>
                          <input
                            type="date"
                            value={passenger.passportExpiry}
                            onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Dietary Requirements (Optional)</label>
                          <select
                            value={passenger.dietary}
                            onChange={(e) => updatePassenger(index, 'dietary', e.target.value)}
                          >
                            <option value="">None</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="gluten-free">Gluten Free</option>
                            <option value="halal">Halal</option>
                            <option value="kosher">Kosher</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="next-btn" onClick={handleNext}>
                    Continue to Contact Info
                  </button>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div className="form-step">
                  <h2><Mail size={24} /> Contact Information</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label><Mail size={16} /> Email Address</label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => updateContactInfo('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label><Phone size={16} /> Phone Number</label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => updateContactInfo('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label><MapPin size={16} /> Street Address</label>
                    <input
                      type="text"
                      value={contactInfo.address}
                      onChange={(e) => updateContactInfo('address', e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={contactInfo.city}
                        onChange={(e) => updateContactInfo('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={contactInfo.country}
                        onChange={(e) => updateContactInfo('country', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP / Postal Code</label>
                      <input
                        type="text"
                        value={contactInfo.zipCode}
                        onChange={(e) => updateContactInfo('zipCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Requests (Optional)</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements, celebrations, or accessibility needs..."
                      rows="4"
                    />
                  </div>

                  <div className="step-buttons">
                    <button type="button" className="back-btn" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="button" className="next-btn" onClick={handleNext}>
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="form-step">
                  <h2><CreditCard size={24} /> Payment Details</h2>
                  
                  <div className="secure-badge">
                    <Lock size={16} />
                    <span>Secure Payment - Your information is encrypted</span>
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      value={paymentInfo.cardName}
                      onChange={(e) => updatePaymentInfo('cardName', e.target.value)}
                      placeholder="Name as on card"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        updatePaymentInfo('cardNumber', value);
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength="16"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          updatePaymentInfo('expiryDate', value);
                        }}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                          updatePaymentInfo('cvv', value);
                        }}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={paymentInfo.saveCard}
                      onChange={(e) => updatePaymentInfo('saveCard', e.target.checked)}
                    />
                    <label htmlFor="saveCard">Save card for future bookings</label>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      required
                    />
                    <label htmlFor="terms">
                      I agree to the <a href="#">terms and conditions</a> and <a href="#">cancellation policy</a>
                    </label>
                  </div>

                  <div className="step-buttons">
                    <button type="button" className="back-btn" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button type="submit" className="submit-btn" disabled={processing}>
                      {processing ? 'Processing...' : `Pay ${formatPrice(calculateTotal())}`}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Side - Booking Summary */}
          <div className="booking-summary">
            <h2>Booking Summary</h2>
            
            <div className="summary-cruise">
              <img src={cruise.images[0]} alt={cruise.shipName} />
              <div className="cruise-info">
                <h3>{cruise.shipName}</h3>
                <p className="cruise-line">{cruise.cruiseLine}</p>
                <p className="destination">
                  <MapPin size={14} />
                  {cruise.destination}
                </p>
              </div>
            </div>

            <div className="summary-details">
              <div className="detail-row">
                <span>Departure</span>
                <strong>{new Date(cruise.departureDate).toLocaleDateString()}</strong>
              </div>
              <div className="detail-row">
                <span>Return</span>
                <strong>{new Date(cruise.returnDate).toLocaleDateString()}</strong>
              </div>
              <div className="detail-row">
                <span>Duration</span>
                <strong>{cruise.duration} nights</strong>
              </div>
              <div className="detail-row">
                <span>Cabin Type</span>
                <strong>{selectedCabin.type}</strong>
              </div>
              <div className="detail-row">
                <span>Passengers</span>
                <strong>{passengerDetails.length}</strong>
              </div>
            </div>

            <div className="price-breakdown">
              <h3>Price Breakdown</h3>
              <div className="price-row">
                <span>Cabin Price × {passengerDetails.length}</span>
                <span>{formatPrice(selectedCabin.price.amount * passengerDetails.length)}</span>
              </div>
              <div className="price-row">
                <span>Taxes & Fees (12%)</span>
                <span>{formatPrice(selectedCabin.price.amount * passengerDetails.length * 0.12)}</span>
              </div>
              <div className="price-row">
                <span>Service Fee</span>
                <span>{formatPrice(50)}</span>
              </div>
              <div className="price-total">
                <span>Total Amount</span>
                <strong>{formatPrice(calculateTotal())}</strong>
              </div>
            </div>

            <div className="payment-note">
              <Lock size={16} />
              <span>Secure payment. Deposit of 20% required now, balance due 60 days before departure.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CruiseBooking;
