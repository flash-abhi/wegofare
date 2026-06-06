import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, CreditCard, Mail, Phone, User, Users } from 'lucide-react';
import { API_URL } from '../config/api';
import './PackageBooking.css';

function PackageBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { package: selectedPackage, searchParams } = location.state || {};

  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [travellers, setTravellers] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const totalTravellers = useMemo(() => {
    const adults = Number(searchParams?.adults || 1);
    const children = Number(searchParams?.children || 0);
    return adults + children;
  }, [searchParams]);

  const nights = useMemo(() => {
    if (!searchParams?.checkIn || !searchParams?.checkOut) return 0;
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }, [searchParams]);

  const totalPrice = useMemo(() => {
    if (!selectedPackage) return 0;
    return selectedPackage.pricePerPerson * totalTravellers;
  }, [selectedPackage, totalTravellers]);

  useEffect(() => {
    if (!selectedPackage || !searchParams) {
      navigate('/packages');
      return;
    }

    const adults = Number(searchParams.adults || 1);
    const children = Number(searchParams.children || 0);
    const initial = [
      ...Array.from({ length: adults }, (_, i) => ({
        firstName: '',
        lastName: '',
        type: 'adult',
        index: i
      })),
      ...Array.from({ length: children }, (_, i) => ({
        firstName: '',
        lastName: '',
        type: 'child',
        index: i
      }))
    ];
    setTravellers(initial);
  }, [selectedPackage, searchParams, navigate]);

  const updateTraveller = (idx, field, value) => {
    setTravellers((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const validate = () => {
    if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) return false;
    if (!payment.cardName || payment.cardNumber.length < 16 || payment.cvv.length < 3 || !payment.expiry) return false;
    if (!agreed) return false;
    return travellers.every((t) => t.firstName && t.lastName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const safeTotalPrice = Number(totalPrice);
      if (!Number.isFinite(safeTotalPrice) || safeTotalPrice <= 0) {
        alert('Invalid package price. Please return to results and try again.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'package',
          packageData: selectedPackage,
          packageDetails: {
            passengers: {
              adults: Number(searchParams?.adults || 1),
              children: Number(searchParams?.children || 0),
              infants: 0
            }
          },
          passengers: travellers,
          contact: {
            email: contact.email,
            phone: contact.phone
          },
          contactInfo: {
            email: contact.email,
            phone: contact.phone
          },
          totalPrice: safeTotalPrice,
          searchParams
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!data.success) {
        const details = data.error ? `${data.message || 'Booking failed'}: ${data.error}` : (data.message || `Booking failed (${response.status}).`);
        alert(details);
        return;
      }

      setConfirmation({
        reference: data.data.referenceNumber,
        total: data.data.totalPrice
      });
    } catch (error) {
      console.error(error);
      alert('Unable to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPackage || !searchParams) return null;

  if (confirmation) {
    return (
      <div className="package-booking-page">
        <div className="package-booking-wrap">
          <div className="booking-success-card">
            <CheckCircle2 size={56} />
            <h1>Package Booking Confirmed</h1>
            <p>Your package has been saved successfully.</p>
            <div className="confirmation-lines">
              <div><span>Reference</span><strong>{confirmation.reference}</strong></div>
              <div><span>Total Paid</span><strong>${Number(confirmation.total).toFixed(2)}</strong></div>
            </div>
            <button onClick={() => navigate('/packages')}>Back to Packages</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="package-booking-page">
      <div className="package-booking-wrap">
        <div className="package-booking-form">
          <h1>Complete Package Booking</h1>

          <form onSubmit={handleSubmit}>
            <section>
              <h2><User size={18} /> Lead Contact</h2>
              <div className="grid two">
                <input placeholder="First Name" value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} />
                <input placeholder="Last Name" value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} />
              </div>
              <div className="grid two">
                <div className="icon-input"><Mail size={16} /><input type="email" placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
                <div className="icon-input"><Phone size={16} /><input placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
              </div>
            </section>

            <section>
              <h2><Users size={18} /> Traveller Details</h2>
              {travellers.map((traveller, idx) => (
                <div key={`${traveller.type}-${traveller.index}`} className="traveller-row">
                  <span>{traveller.type === 'adult' ? `Adult ${traveller.index + 1}` : `Child ${traveller.index + 1}`}</span>
                  <input placeholder="First Name" value={traveller.firstName} onChange={(e) => updateTraveller(idx, 'firstName', e.target.value)} />
                  <input placeholder="Last Name" value={traveller.lastName} onChange={(e) => updateTraveller(idx, 'lastName', e.target.value)} />
                </div>
              ))}
            </section>

            <section>
              <h2><CreditCard size={18} /> Payment</h2>
              <div className="grid two">
                <input placeholder="Cardholder Name" value={payment.cardName} onChange={(e) => setPayment({ ...payment, cardName: e.target.value })} />
                <input
                  placeholder="Card Number"
                  value={payment.cardNumber}
                  onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                />
              </div>
              <div className="grid two">
                <input
                  placeholder="MM/YY"
                  value={payment.expiry}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                    setPayment({ ...payment, expiry: formatted });
                  }}
                />
                <input
                  placeholder="CVV"
                  value={payment.cvv}
                  onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                />
              </div>
            </section>

            <label className="agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the terms and cancellation policy.</span>
            </label>

            <button type="submit" disabled={isSubmitting} className="submit-booking-btn">
              {isSubmitting ? 'Booking...' : 'Book Package'}
            </button>
          </form>
        </div>

        <aside className="package-booking-summary">
          <h2>{selectedPackage.hotelName}</h2>
          <p>{selectedPackage.location}</p>
          <div className="summary-item"><Calendar size={16} /><span>{nights} nights</span></div>
          <div className="summary-item"><Users size={16} /><span>{totalTravellers} travellers</span></div>
          <div className="summary-item"><span>Flight Class:</span><strong>{searchParams.flightClass}</strong></div>
          <div className="summary-item"><span>Package Type:</span><strong>{searchParams.packageType}</strong></div>
          <div className="total-box">
            <span>Total Price</span>
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PackageBooking;
