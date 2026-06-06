import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Calendar, Users, Plane, Hotel, Utensils, Sun, ArrowLeft, ExternalLink } from 'lucide-react';
import './PackageDetails.css';

function PackageDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const packageId = searchParams.get('id');
    if (packageId) {
      // Retrieve package data from sessionStorage
      const storedData = sessionStorage.getItem(`package_${packageId}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setPackageData(data);
      }
    }
    setLoading(false);
  }, [searchParams]);

  const calculateNights = () => {
    if (!packageData?.package?.checkIn || !packageData?.package?.checkOut) return 0;
    const checkIn = new Date(packageData.package.checkIn);
    const checkOut = new Date(packageData.package.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!packageData) return 0;
    const totalGuests = parseInt(packageData.searchParams?.adults || 2) + parseInt(packageData.searchParams?.children || 0);
    return packageData.package.pricePerPerson * totalGuests;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading package details...</p>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="error-container">
        <h2>Package not found</h2>
        <p>The package you're looking for could not be loaded.</p>
        <button onClick={() => window.close()}>Close Window</button>
      </div>
    );
  }

  const pkg = packageData.package;
  const search = packageData.searchParams;

  return (
    <div className="package-details-page">
      {/* Header */}
      <div className="details-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => window.close()}>
            <ArrowLeft size={20} />
            Close Window
          </button>
          <h1>{pkg.hotelName}</h1>
          <div className="header-meta">
            <div className="rating">
              <Star size={18} fill="gold" color="gold" />
              <span>{pkg.rating}</span>
              <span className="reviews">({pkg.reviews} reviews)</span>
              <span className="stars">{'⭐'.repeat(pkg.hotelStars)}</span>
            </div>
            <div className="location">
              <MapPin size={18} />
              {pkg.location}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="image-gallery">
        <div className="main-image">
          <img src={pkg.images[0]} alt={pkg.hotelName} />
        </div>
        <div className="thumbnail-images">
          {pkg.images.slice(1, 5).map((img, idx) => (
            <img key={idx} src={img} alt={`${pkg.hotelName} ${idx + 2}`} />
          ))}
        </div>
      </div>

      <div className="details-container">
        <div className="details-main">
          {/* Flight Details */}
          <section className="details-section">
            <h2>✈️ Flight Details</h2>
            <div className="flight-details-box">
              <div className="flight-segment">
                <div className="flight-segment-header">
                  <strong>Outbound Flight</strong>
                  <span className="flight-date">
                    {new Date(pkg.flightDetails?.outbound?.departDate).toLocaleDateString('en-US', { 
                      weekday: 'short', month: 'short', day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flight-route">
                  <div className="flight-time">
                    <span className="time">{pkg.flightDetails?.outbound?.departTime}</span>
                    <span className="airport">{pkg.flightDetails?.outbound?.from}</span>
                  </div>
                  <div className="flight-duration">
                    <div className="flight-line">
                      <Plane size={16} />
                    </div>
                    <span>{pkg.flightDetails?.outbound?.duration}</span>
                    <span className="stops">
                      {pkg.flightDetails?.outbound?.stops === 0 ? 'Nonstop' : '1 Stop'}
                    </span>
                  </div>
                  <div className="flight-time">
                    <span className="time">{pkg.flightDetails?.outbound?.arrivalTime}</span>
                    <span className="airport">{pkg.flightDetails?.outbound?.to}</span>
                  </div>
                </div>
                <div className="flight-meta">
                  <span>{pkg.flightDetails?.outbound?.airline} • {pkg.flightDetails?.outbound?.flightNumber}</span>
                  <span>{pkg.flightDetails?.outbound?.aircraft}</span>
                  <span className="flight-class">
                    {pkg.flightDetails?.outbound?.class?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Class
                  </span>
                </div>
              </div>

              {pkg.flightDetails?.return && (
                <div className="flight-segment">
                  <div className="flight-segment-header">
                    <strong>Return Flight</strong>
                    <span className="flight-date">
                      {new Date(pkg.flightDetails.return.departDate).toLocaleDateString('en-US', { 
                        weekday: 'short', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flight-route">
                    <div className="flight-time">
                      <span className="time">{pkg.flightDetails.return.departTime}</span>
                      <span className="airport">{pkg.flightDetails.return.from}</span>
                    </div>
                    <div className="flight-duration">
                      <div className="flight-line">
                        <Plane size={16} style={{ transform: 'scaleX(-1)' }} />
                      </div>
                      <span>{pkg.flightDetails.return.duration}</span>
                      <span className="stops">
                        {pkg.flightDetails.return.stops === 0 ? 'Nonstop' : '1 Stop'}
                      </span>
                    </div>
                    <div className="flight-time">
                      <span className="time">{pkg.flightDetails.return.arrivalTime}</span>
                      <span className="airport">{pkg.flightDetails.return.to}</span>
                    </div>
                  </div>
                  <div className="flight-meta">
                    <span>{pkg.flightDetails.return.airline} • {pkg.flightDetails.return.flightNumber}</span>
                    <span>{pkg.flightDetails.return.aircraft}</span>
                    <span className="flight-class">
                      {pkg.flightDetails.return.class?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Class
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* About the Resort */}
          <section className="details-section">
            <h2>🏨 About the Resort</h2>
            <p className="description">{pkg.description}</p>
          </section>

          {/* Dining Options */}
          <section className="details-section">
            <h2>🍽️ Dining Options</h2>
            <ul className="features-list">
              {pkg.dining.map((option, idx) => (
                <li key={idx}>{option}</li>
              ))}
            </ul>
          </section>

          {/* Activities & Entertainment */}
          <section className="details-section">
            <h2>🎯 Activities & Entertainment</h2>
            <ul className="features-grid">
              {pkg.activities.map((activity, idx) => (
                <li key={idx}>{activity}</li>
              ))}
            </ul>
          </section>

          {/* Resort Amenities */}
          <section className="details-section">
            <h2>✨ Resort Amenities</h2>
            <ul className="features-grid">
              {pkg.amenities.map((amenity, idx) => (
                <li key={idx}>{amenity}</li>
              ))}
            </ul>
          </section>

          {/* Cancellation Policy */}
          <section className="details-section">
            <h2>📋 Cancellation Policy</h2>
            <p className="policy">{pkg.cancellationPolicy}</p>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="booking-sidebar">
          <div className="booking-card">
            <div className="price-section">
              <div className="price-label">Price per person</div>
              <div className="price">
                <span className="amount">${pkg.pricePerPerson}</span>
                {pkg.originalPrice && (
                  <span className="original-price">${pkg.originalPrice}</span>
                )}
              </div>
              {pkg.discount && (
                <div className="discount-badge">Save {pkg.discount}%</div>
              )}
            </div>

            <div className="trip-summary">
              <h3>Trip Summary</h3>
              <div className="summary-item">
                <Calendar size={18} />
                <div>
                  <div className="summary-label">Dates</div>
                  <div className="summary-value">
                    {new Date(pkg.checkIn).toLocaleDateString()} - {new Date(pkg.checkOut).toLocaleDateString()}
                  </div>
                  <div className="summary-meta">{calculateNights()} nights</div>
                </div>
              </div>
              <div className="summary-item">
                <Users size={18} />
                <div>
                  <div className="summary-label">Travelers</div>
                  <div className="summary-value">
                    {search.adults} Adults, {search.children} Children
                  </div>
                </div>
              </div>
              <div className="summary-item">
                <Hotel size={18} />
                <div>
                  <div className="summary-label">Rooms</div>
                  <div className="summary-value">{search.rooms || 1} Room(s)</div>
                </div>
              </div>
            </div>

            <div className="total-price">
              <span>Total Price</span>
              <span className="total-amount">${calculateTotalPrice()}</span>
            </div>

            <button 
              className="book-now-btn"
              onClick={() => {
                // Open booking in the parent window
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'BOOK_PACKAGE',
                    package: pkg,
                    searchParams: search
                  }, window.location.origin);
                  window.close();
                }
              }}
            >
              Book This Package
            </button>

            <div className="info-items">
              <div className="info-item">✓ Free cancellation up to 30 days</div>
              <div className="info-item">✓ Best price guarantee</div>
              <div className="info-item">✓ 24/7 customer support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackageDetails;
