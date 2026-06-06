import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VacationSearch.css';

const VacationSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchParams) {
      navigate('/');
      return;
    }
    searchPackages();
  }, []);

  const searchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        departureCityCode: searchParams.departureCityCode,
        destinationCode: searchParams.destinationCode,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: searchParams.adults || 1,
        children: searchParams.children || 0,
        rooms: searchParams.rooms || 1,
        packageType: searchParams.packageType || 'flight-hotel',
        flightClass: searchParams.flightClass || 'economy',
        provider: searchParams.provider || 'amadeus'
      });

      const response = await fetch(`/api/packages/search?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch packages');
      }

      const data = await response.json();
      setPackages(data.packages || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!searchParams) {
    return null;
  }

  return (
    <div className="vacation-search-page">
      <div className="search-summary">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Search
        </button>
        <div className="summary-details">
          <h2>Vacation Packages</h2>
          <p>
            {searchParams.departureCityCode} → {searchParams.destinationCode} • {formatDate(searchParams.checkIn)} - {formatDate(searchParams.checkOut)} • {searchParams.adults} {searchParams.adults === 1 ? 'Adult' : 'Adults'}
            {searchParams.children > 0 && `, ${searchParams.children} ${searchParams.children === 1 ? 'Child' : 'Children'}`} • {searchParams.rooms} {searchParams.rooms === 1 ? 'Room' : 'Rooms'}
          </p>
        </div>
      </div>

      <div className="results-container">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching for vacation packages...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={searchPackages} className="retry-button">Retry Search</button>
          </div>
        )}

        {!loading && !error && packages.length === 0 && (
          <div className="no-results">
            <h3>No packages found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}

        {!loading && !error && packages.length > 0 && (
          <div className="packages-grid">
            {packages.map((pkg, index) => (
              <div key={index} className="package-card">
                <div className="package-header">
                  <h3>{pkg.name || 'Vacation Package'}</h3>
                  <div className="package-price">
                    <span className="price">{formatPrice(pkg.price)}</span>
                    <span className="price-label">per person</span>
                  </div>
                </div>

                <div className="package-details">
                  {/* Flight Details */}
                  {pkg.flight && (
                    <div className="detail-section">
                      <h4>✈️ Flight</h4>
                      <div className="flight-info">
                        <div className="route">
                          <span className="airport">{pkg.flight.origin}</span>
                          <span className="arrow">→</span>
                          <span className="airport">{pkg.flight.destination}</span>
                        </div>
                        <p className="time-info">
                          Departs: {pkg.flight.departureTime || 'TBD'} • 
                          Arrives: {pkg.flight.arrivalTime || 'TBD'}
                        </p>
                        {pkg.flight.airline && (
                          <p className="airline">{pkg.flight.airline} • {pkg.flight.class || 'Economy'}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hotel Details */}
                  {pkg.hotel && (
                    <div className="detail-section">
                      <h4>🏨 Hotel</h4>
                      <div className="hotel-info">
                        <p className="hotel-name">{pkg.hotel.name}</p>
                        {pkg.hotel.rating && (
                          <p className="rating">
                            {'⭐'.repeat(Math.round(pkg.hotel.rating))} ({pkg.hotel.rating})
                          </p>
                        )}
                        <p className="location">{pkg.hotel.location || pkg.hotel.address}</p>
                        <p className="room-type">{pkg.hotel.roomType || 'Standard Room'}</p>
                      </div>
                    </div>
                  )}

                  {/* Package Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="detail-section">
                      <h4>📋 Included</h4>
                      <ul className="features-list">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button className="book-button">
                  Book Package
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VacationSearch;
