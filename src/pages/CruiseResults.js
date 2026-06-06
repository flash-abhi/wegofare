import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ship, Calendar, Users, MapPin, Star, ChevronDown, ChevronUp, Anchor } from 'lucide-react';
import './CruiseResults.css';

function CruiseResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;
  
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCruise, setExpandedCruise] = useState(null);
  const [sortBy, setSortBy] = useState('price-low');
  const [filters, setFilters] = useState({
    maxPrice: 10000,
    minRating: 0,
    cruiseLine: 'all',
    cabinType: 'all'
  });

  useEffect(() => {
    if (!searchParams) {
      navigate('/cruises');
      return;
    }
    fetchCruises();
  }, [searchParams]);

  const fetchCruises = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        destination: searchParams.destination,
        departurePort: searchParams.departurePort,
        departureDate: searchParams.departureDate,
        duration: searchParams.duration,
        passengers: searchParams.passengers
      });

      const response = await fetch(`/api/cruises?${query}`);
      const data = await response.json();

      if (data.success) {
        setCruises(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch cruises. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLowestPrice = (cruise) => {
    const prices = cruise.cabinTypes.map(cabin => cabin.price.amount);
    return Math.min(...prices);
  };

  const sortCruises = (cruiseList) => {
    const sorted = [...cruiseList];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      case 'price-high':
        return sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      case 'duration':
        return sorted.sort((a, b) => a.duration - b.duration);
      default:
        return sorted;
    }
  };

  const filterCruises = (cruiseList) => {
    return cruiseList.filter(cruise => {
      const lowestPrice = getLowestPrice(cruise);
      const matchesPrice = lowestPrice <= filters.maxPrice;
      const matchesRating = parseFloat(cruise.rating) >= filters.minRating;
      const matchesCruiseLine = filters.cruiseLine === 'all' || cruise.cruiseLine === filters.cruiseLine;
      
      return matchesPrice && matchesRating && matchesCruiseLine;
    });
  };

  const displayedCruises = sortCruises(filterCruises(cruises));

  const toggleExpand = (cruiseId) => {
    setExpandedCruise(expandedCruise === cruiseId ? null : cruiseId);
  };

  const getCruiseLines = () => {
    const lines = [...new Set(cruises.map(c => c.cruiseLine))];
    return lines;
  };

  if (loading) {
    return (
      <div className="cruise-results-page">
        <div className="loading-container">
          <Ship className="loading-icon" size={48} />
          <h2>Searching for cruises...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cruise-results-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/cruises')} className="back-btn">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cruise-results-page">
      {/* Search Summary */}
      <div className="search-summary">
        <div className="summary-content">
          <h1>
            <Ship size={32} />
            {displayedCruises.length} Cruises Found
          </h1>
          <div className="search-details">
            <span><MapPin size={16} /> {searchParams.destination}</span>
            <span><Anchor size={16} /> {searchParams.departurePort}</span>
            <span><Calendar size={16} /> {new Date(searchParams.departureDate).toLocaleDateString()}</span>
            <span><Users size={16} /> {searchParams.passengers} passengers</span>
          </div>
        </div>
      </div>

      <div className="results-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3>Filter Results</h3>
          
          <div className="filter-group">
            <label>Max Price (per person)</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
            />
            <span className="filter-value">${filters.maxPrice}</span>
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <div className="rating-filter">
              {[0, 3, 3.5, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  className={`rating-btn ${filters.minRating === rating ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, minRating: rating })}
                >
                  {rating > 0 ? `${rating}+` : 'Any'} <Star size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Cruise Line</label>
            <select
              value={filters.cruiseLine}
              onChange={(e) => setFilters({ ...filters, cruiseLine: e.target.value })}
            >
              <option value="all">All Cruise Lines</option>
              {getCruiseLines().map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </aside>

        {/* Results List */}
        <main className="results-main">
          {displayedCruises.length === 0 ? (
            <div className="no-results">
              <Ship size={64} />
              <h2>No cruises found</h2>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className="cruise-list">
              {displayedCruises.map((cruise) => (
                <div key={cruise.cruiseId} className="cruise-card">
                  <div className="cruise-header">
                    <div className="cruise-image">
                      <img src={cruise.images[0]} alt={cruise.shipName} />
                      <div className="cruise-line-badge">{cruise.cruiseLine}</div>
                    </div>
                    <div className="cruise-main-info">
                      <h2>{cruise.shipName}</h2>
                      <p className="destination-label">
                        <MapPin size={16} />
                        {cruise.destination}
                      </p>
                      <div className="cruise-details-row">
                        <span><Calendar size={14} /> {cruise.duration} nights</span>
                        <span><Anchor size={14} /> {cruise.departurePort}</span>
                        <span className="rating">
                          <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                          {cruise.rating} ({cruise.reviews} reviews)
                        </span>
                      </div>
                      <div className="itinerary-preview">
                        <strong>Ports:</strong> {cruise.itinerary.slice(0, 3).map(i => i.port).join(' → ')}
                        {cruise.itinerary.length > 3 && ' ...'}
                      </div>
                    </div>
                    <div className="cruise-pricing">
                      <div className="price-section">
                        <span className="from-label">From</span>
                        <span className="price">${getLowestPrice(cruise)}</span>
                        <span className="per-person">per person</span>
                      </div>
                      <button 
                        className="expand-btn"
                        onClick={() => toggleExpand(cruise.cruiseId)}
                      >
                        {expandedCruise === cruise.cruiseId ? (
                          <>Less Details <ChevronUp size={18} /></>
                        ) : (
                          <>View Details <ChevronDown size={18} /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedCruise === cruise.cruiseId && (
                    <div className="cruise-expanded">
                      <div className="expanded-section">
                        <h3>📅 Itinerary</h3>
                        <div className="itinerary-timeline">
                          {cruise.itinerary.map((day, idx) => (
                            <div key={idx} className="itinerary-day">
                              <div className="day-number">Day {day.day}</div>
                              <div className="day-details">
                                <h4>{day.port}</h4>
                                <p>{day.arrival} - {day.departure}</p>
                                <span>{day.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="expanded-section">
                        <h3>🛏️ Cabin Options</h3>
                        <div className="cabin-grid">
                          {cruise.cabinTypes.map((cabin, idx) => (
                            <div key={idx} className="cabin-option">
                              <h4>{cabin.type}</h4>
                              <p className="cabin-price">${cabin.price.amount}</p>
                              <p className="availability">
                                {cabin.available} cabins available
                              </p>
                              <ul className="amenities-list">
                                {cabin.amenities.slice(0, 4).map((amenity, i) => (
                                  <li key={i}>{amenity}</li>
                                ))}
                              </ul>
                              <button 
                                className="select-cabin-btn"
                                onClick={() => navigate('/cruise-booking', {
                                  state: {
                                    cruise,
                                    selectedCabin: cabin,
                                    passengers: searchParams?.passengers || 2
                                  }
                                })}
                              >
                                Book Now
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="expanded-grid">
                        <div className="expanded-section">
                          <h3>✨ Amenities</h3>
                          <ul className="feature-list">
                            {cruise.amenities.slice(0, 6).map((amenity, idx) => (
                              <li key={idx}>{amenity}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="expanded-section">
                          <h3>🍽️ Dining</h3>
                          <ul className="feature-list">
                            {cruise.dining.map((option, idx) => (
                              <li key={idx}>{option}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="expanded-section">
                          <h3>🎭 Entertainment</h3>
                          <ul className="feature-list">
                            {cruise.entertainment.map((show, idx) => (
                              <li key={idx}>{show}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="expanded-section">
                          <h3>📋 Policies</h3>
                          <p><strong>Cancellation:</strong> {cruise.policies.cancellation}</p>
                          <p><strong>Deposit:</strong> {cruise.policies.deposit}</p>
                          <p><strong>Payment:</strong> {cruise.policies.payment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CruiseResults;
