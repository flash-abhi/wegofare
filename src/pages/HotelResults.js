import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Wifi, Coffee, Dumbbell, Wine, 
  Car, Waves, ChevronDown, ChevronUp, Loader2,
  BedDouble, Users, Calendar, Check, X
} from 'lucide-react';
import './HotelResults.css';

function HotelResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (!searchParams) {
      navigate('/hotels');
      return;
    }
    fetchHotels();
  }, [searchParams]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        cityCode: searchParams.cityCode,
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults.toString(),
        roomQuantity: searchParams.roomQuantity.toString()
      });

      const response = await fetch(`/api/hotels?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setHotels(data.data);
      } else {
        setError(data.message || 'Failed to fetch hotels');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortHotels = (hotelsToSort) => {
    const sorted = [...hotelsToSort];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price.perNight - b.price.perNight);
      case 'price-high':
        return sorted.sort((a, b) => b.price.perNight - a.price.perNight);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  const filterHotels = (hotelsToFilter) => {
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);

    return hotelsToFilter.filter((hotel) => {
      const hotelPrice = hotel?.price?.perNight ?? hotel?.price?.total ?? 0;

      if (min !== null && hotelPrice < min) {
        return false;
      }

      if (max !== null && hotelPrice > max) {
        return false;
      }

      return true;
    });
  };

  const formatNights = () => {
    const checkIn = new Date(searchParams.checkInDate);
    const checkOut = new Date(searchParams.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const amenityIcons = {
    'WIFI': <Wifi size={16} />,
    'RESTAURANT': <Coffee size={16} />,
    'FITNESS_CENTER': <Dumbbell size={16} />,
    'BAR': <Wine size={16} />,
    'PARKING': <Car size={16} />,
    'POOL': <Waves size={16} />
  };

  // Generate hotel image based on index or chain
  const getHotelImage = (hotel, index) => {
    // Array of high-quality hotel images
    const hotelImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80'
    ];
    
    // Use media if available, otherwise use rotating images
    if (hotel.media && hotel.media.length > 0 && hotel.media[0].uri) {
      return hotel.media[0].uri;
    }
    
    return hotelImages[index % hotelImages.length];
  };

  if (!searchParams) {
    return null;
  }

  return (
    <div className="hotel-results-page">
      {/* Search Summary Header */}
      <div className="hr-search-summary">
        <div className="container">
          <div className="hr-summary-content">
            <div className="hr-summary-info">
              <h1>{searchParams.cityCode}</h1>
              <div className="hr-summary-details">
                <span className="hr-detail-item">
                  <Calendar size={16} />
                  {formatDate(searchParams.checkInDate)} - {formatDate(searchParams.checkOutDate)}
                </span>
                <span className="hr-detail-item">
                  <BedDouble size={16} />
                  {formatNights()} night{formatNights() > 1 ? 's' : ''}
                </span>
                <span className="hr-detail-item">
                  <Users size={16} />
                  {searchParams.adults} guest{searchParams.adults > 1 ? 's' : ''}, {searchParams.roomQuantity} room{searchParams.roomQuantity > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="hr-summary-actions">
              <button className="hr-modify-search-btn" onClick={() => navigate('/hotels')}>
                Modify Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="results-container">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showMobileFilters ? 'open' : ''}`}>
            <h3>Filter by</h3>
            
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-section">
              <h4>Star Rating</h4>
              <div className="rating-filters">
                {[5, 4, 3, 2, 1].map(stars => (
                  <label key={stars} className="rating-option">
                    <input type="checkbox" />
                    <div className="stars">
                      {Array(stars).fill(0).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span>& up</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Amenities</h4>
              <div className="amenity-filters">
                {['Free WiFi', 'Pool', 'Parking', 'Restaurant', 'Fitness Center', 'Bar'].map(amenity => (
                  <label key={amenity} className="amenity-option">
                    <input type="checkbox" />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results List */}
          <main className="results-main">
            <div className="hr-results-header">
              <h2>{loading ? 'Searching...' : `${filterHotels(hotels).length} hotels found`}</h2>
              <div className="hr-results-controls">
                <button
                  className="hr-mobile-filter-toggle"
                  type="button"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                >
                  {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                  {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="loading-state">
                <Loader2 size={48} className="spinner" />
                <p>Finding the best hotels for you...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <X size={48} />
                <h3>Oops! Something went wrong</h3>
                <p>{error}</p>
                <button onClick={fetchHotels} className="retry-btn">Try Again</button>
              </div>
            )}

            {!loading && !error && hotels.length === 0 && (
              <div className="empty-state">
                <MapPin size={64} />
                <h3>No hotels found</h3>
                <p>Try adjusting your search criteria</p>
                <button onClick={() => navigate('/hotels')} className="back-btn">
                  Modify Search
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="hotels-list">
                {sortHotels(filterHotels(hotels)).map((hotel, index) => (
                  <div key={hotel.id} className="hotel-card">
                    <div className="hotel-image">
                      <img 
                        src={getHotelImage(hotel, index)} 
                        alt={hotel.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
                        }}
                      />
                      {hotel.rating && hotel.rating > 0 && (
                        <div className="rating-badge">
                          <Star size={14} fill="currentColor" />
                          <span>{hotel.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="hotel-info">
                      <div className="hotel-header">
                        <div>
                          <h3>{hotel.name}</h3>
                          <div className="hotel-location">
                            <MapPin size={14} />
                            <span>{hotel.location.cityName || hotel.location.city}</span>
                            {hotel.distance && (
                              <span className="distance">
                                • {hotel.distance.value} {hotel.distance.unit} from center
                              </span>
                            )}
                          </div>
                          {hotel.location.address && (
                            <p className="hotel-address">{hotel.location.address}</p>
                          )}
                        </div>
                      </div>

                      <div className="hotel-amenities">
                        {hotel.amenities?.slice(0, 6).map((amenity, idx) => (
                          <span key={idx} className="amenity-tag">
                            {amenityIcons[amenity] || <Check size={14} />}
                            {amenity.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>

                      <div className="hotel-room-info">
                        <div className="room-details">
                          <BedDouble size={16} />
                          <span>{hotel.room?.typeEstimated || hotel.room?.type || 'Standard Room'}</span>
                          <span className="sleeps">• Sleeps {hotel.room?.sleeps || searchParams.adults}</span>
                        </div>
                      </div>

                      {expandedHotel === hotel.id && (
                        <div className="hotel-expanded">
                          <div className="policies-section">
                            <h4>Hotel Information</h4>
                            
                            <div className="expanded-details">
                              <div className="detail-section">
                                <h5>Room Details</h5>
                                <div className="detail-list">
                                  <div className="detail-row">
                                    <span className="label">Room Type:</span>
                                    <span className="value">{hotel.room?.typeEstimated?.replace(/_/g, ' ') || 'Standard Room'}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="label">Bed Type:</span>
                                    <span className="value">{hotel.room?.bedType || 1} Bed(s)</span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="label">Capacity:</span>
                                    <span className="value">{hotel.room?.sleeps || searchParams.adults} Guest(s)</span>
                                  </div>
                                  {hotel.room?.type && (
                                    <div className="detail-row">
                                      <span className="label">Room Code:</span>
                                      <span className="value">{hotel.room.type}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="detail-section">
                                <h5>Check-in & Check-out</h5>
                                <div className="detail-list">
                                  <div className="detail-row">
                                    <span className="label">Check-in Time:</span>
                                    <span className="value">{hotel.policies?.checkInTime || '15:00'}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="label">Check-out Time:</span>
                                    <span className="value">{hotel.policies?.checkOutTime || '11:00'}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="label">Duration:</span>
                                    <span className="value">{formatNights()} Night{formatNights() > 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h5>Policies</h5>
                                <div className="detail-list">
                                  <div className="detail-row">
                                    <span className="label">Payment Type:</span>
                                    <span className="value">{hotel.policies?.paymentType?.replace(/_/g, ' ').toUpperCase() || 'CREDIT CARD'}</span>
                                  </div>
                                  <div className="detail-row full-width">
                                    <span className="label">Cancellation Policy:</span>
                                    <span className="value">{hotel.policies?.cancellation || 'Please check with hotel for cancellation policy'}</span>
                                  </div>
                                  {hotel.policies?.guarantee && (
                                    <div className="detail-row full-width">
                                      <span className="label">Guarantee Policy:</span>
                                      <span className="value">{hotel.policies.guarantee}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="detail-section">
                                <h5>Location Details</h5>
                                <div className="detail-list">
                                  {hotel.location.address && (
                                    <div className="detail-row full-width">
                                      <span className="label">Address:</span>
                                      <span className="value">{hotel.location.address}</span>
                                    </div>
                                  )}
                                  <div className="detail-row">
                                    <span className="label">City:</span>
                                    <span className="value">{hotel.location.cityName || hotel.location.city}</span>
                                  </div>
                                  {hotel.location.countryCode && (
                                    <div className="detail-row">
                                      <span className="label">Country:</span>
                                      <span className="value">{hotel.location.countryCode}</span>
                                    </div>
                                  )}
                                  {hotel.distance && (
                                    <div className="detail-row">
                                      <span className="label">Distance from Center:</span>
                                      <span className="value">{hotel.distance.value} {hotel.distance.unit}</span>
                                    </div>
                                  )}
                                  {hotel.location.coordinates && (
                                    <div className="detail-row">
                                      <span className="label">Coordinates:</span>
                                      <span className="value">{hotel.location.coordinates.lat.toFixed(4)}, {hotel.location.coordinates.lng.toFixed(4)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="detail-section">
                                <h5>Price Breakdown</h5>
                                <div className="detail-list">
                                  <div className="detail-row">
                                    <span className="label">Price per Night:</span>
                                    <span className="value price-highlight">${hotel.price.perNight.toFixed(2)}</span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="label">Number of Nights:</span>
                                    <span className="value">{formatNights()}</span>
                                  </div>
                                  <div className="detail-row total-row">
                                    <span className="label">Total Price:</span>
                                    <span className="value price-highlight">${hotel.price.total.toFixed(2)} USD</span>
                                  </div>
                                  {hotel.price.originalCurrency !== 'USD' && (
                                    <div className="detail-row">
                                      <span className="label">Original Price:</span>
                                      <span className="value">{hotel.price.originalPrice.toFixed(2)} {hotel.price.originalCurrency}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {hotel.chainCode && (
                                <div className="detail-section">
                                  <h5>Hotel Information</h5>
                                  <div className="detail-list">
                                    <div className="detail-row">
                                      <span className="label">Hotel ID:</span>
                                      <span className="value">{hotel.hotelId}</span>
                                    </div>
                                    <div className="detail-row">
                                      <span className="label">Chain Code:</span>
                                      <span className="value">{hotel.chainCode}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hotel-pricing">
                      <div className="price-info">
                        <div className="price-label">Total for {formatNights()} night{formatNights() > 1 ? 's' : ''}</div>
                        <div className="price-amount">${hotel.price.total.toFixed(2)}</div>
                        <div className="price-per-night">${hotel.price.perNight.toFixed(2)} per night</div>
                      </div>
                      <button 
                        className="view-details-btn"
                        onClick={() => {
                          const url = window.location.origin + '/hotel-details';
                          const hotelData = encodeURIComponent(JSON.stringify({
                            hotel,
                            searchParams,
                            nights: formatNights()
                          }));
                          window.open(`${url}?data=${hotelData}`, '_blank');
                        }}
                      >
                        View Details <ChevronDown size={16} />
                      </button>
                      <button
                        className="book-btn"
                        onClick={() => navigate('/hotel-booking', {
                          state: {
                            hotel,
                            searchParams,
                            roomType: hotel.room?.typeEstimated || hotel.room?.type || 'Standard Room',
                            includeBreakfast: false,
                            totalPrice: {
                              perNight: hotel.price.perNight,
                              total: hotel.price.total
                            }
                          }
                        })}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default HotelResults;
