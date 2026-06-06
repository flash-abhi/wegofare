import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, CreditCard, Mail, Phone, User } from 'lucide-react';
import { API_URL } from '../config/api';
import './HotelBooking.css';

function HotelBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotel, searchParams, roomType = 'Standard Room', includeBreakfast = false, totalPrice } = location.state || {};

  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!hotel || !searchParams) navigate('/hotels');
  }, [hotel, searchParams, navigate]);

  const nights = useMemo(() => {
    if (!searchParams?.checkInDate || !searchParams?.checkOutDate) return 0;
    const inDate = new Date(searchParams.checkInDate);
    const outDate = new Date(searchParams.checkOutDate);
    return Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  }, [searchParams]);

  const finalTotal = useMemo(() => {
    if (totalPrice?.total) return Number(totalPrice.total);
    return Number(hotel?.price?.total || 0);
  }, [hotel, totalPrice]);

  const validate = () => {
    if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) return false;
    if (!payment.cardName || payment.cardNumber.length < 16 || payment.cvv.length < 3 || !payment.expiry) return false;
    return agreed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return alert('Please complete all required fields.');

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'hotel',
          hotelData: hotel,
          checkInDate: searchParams.checkInDate,
          checkOutDate: searchParams.checkOutDate,
          roomType,
          roomQuantity: searchParams.roomQuantity,
          adults: searchParams.adults,
          passengers: [{ firstName: contact.firstName, lastName: contact.lastName, type: 'adult' }],
          contactInfo: { email: contact.email, phone: contact.phone },
          totalPrice: finalTotal,
          searchParams: { ...searchParams, includeBreakfast }
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!data.success) return alert(data.error ? `${data.message}: ${data.error}` : (data.message || 'Booking failed.'));
      setConfirmation({ reference: data.data.referenceNumber, total: data.data.totalPrice });
    } catch (error) {
      console.error(error);
      alert('Unable to complete hotel booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotel || !searchParams) return null;

  if (confirmation) {
    return (
      <div className="hotel-booking-page">
        <div className="hotel-booking-wrap">
          <div className="hotel-booking-success">
            <CheckCircle2 size={54} />
            <h1>Hotel Booking Confirmed</h1>
            <p>Reference: <strong>{confirmation.reference}</strong></p>
            <p>Total Paid: <strong>${Number(confirmation.total).toFixed(2)}</strong></p>
            <button onClick={() => navigate('/hotels')}>Back to Hotels</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-booking-page">
      <div className="hotel-booking-wrap">
        <div className="hotel-booking-form">
          <h1>Complete Hotel Booking</h1>
          <form onSubmit={handleSubmit}>
            <section>
              <h2><User size={18} /> Contact</h2>
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
              <h2><CreditCard size={18} /> Payment</h2>
              <div className="grid two">
                <input placeholder="Cardholder Name" value={payment.cardName} onChange={(e) => setPayment({ ...payment, cardName: e.target.value })} />
                <input placeholder="Card Number" value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })} />
              </div>
              <div className="grid two">
                <input placeholder="MM/YY" value={payment.expiry} onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPayment({ ...payment, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                }} />
                <input placeholder="CVV" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
              </div>
            </section>

            <label className="agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I agree to the terms and cancellation policy.</span>
            </label>

            <button type="submit" disabled={isSubmitting} className="submit-booking-btn">
              {isSubmitting ? 'Booking...' : 'Confirm Hotel Booking'}
            </button>
          </form>
        </div>

        <aside className="hotel-booking-summary">
          <h2>{hotel.name}</h2>
          <p>{hotel.location?.cityName || hotel.location?.city}</p>
          <div className="summary-item"><Calendar size={16} /><span>{nights} nights</span></div>
          <div className="summary-item"><span>Room Type:</span><strong>{roomType}</strong></div>
          <div className="summary-item"><span>Rooms:</span><strong>{searchParams.roomQuantity}</strong></div>
          <div className="summary-item"><span>Guests:</span><strong>{searchParams.adults}</strong></div>
          <div className="summary-item"><span>Breakfast:</span><strong>{includeBreakfast ? 'Included' : 'Not included'}</strong></div>
          <div className="total-box">
            <span>Total Price</span>
            <strong>${finalTotal.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HotelBooking;
