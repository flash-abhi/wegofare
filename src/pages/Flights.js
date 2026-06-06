import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, MapPin, Users, Search, ArrowRightLeft, Star, TrendingDown, Quote } from 'lucide-react';
import AirportAutocomplete from '../components/AirportAutocomplete';
import './Flights.css';

function Flights() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    tripType: 'round-trip',
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    cabinClass: 'economy',
    directFlights: false
  });
  
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const passengerDropdownRef = useRef(null);
  const departDateRef = useRef(null);
  const returnDateRef = useRef(null);

  // Popular routes with live prices
  const popularRoutes = [
    {
      from: 'New York (JFK)',
      to: 'London (LHR)',
      fromCode: 'JFK',
      toCode: 'LHR',
      price: 450,
      airline: 'British Airways',
      airlineLogo: 'https://i.ibb.co/B58HfmrD/british-ariway.png',
      trend: 'down'
    },
    {
      from: 'Los Angeles (LAX)',
      to: 'Tokyo (NRT)',
      fromCode: 'LAX',
      toCode: 'NRT',
      price: 680,
      airline: 'Japan Airlines',
      airlineLogo: 'https://i.ibb.co/Rpvyz9xg/japan-airlinees.png',
      trend: 'up'
    },
    {
      from: 'Dubai (DXB)',
      to: 'Mumbai (BOM)',
      fromCode: 'DXB',
      toCode: 'BOM',
      price: 320,
      airline: 'Emirates',
      airlineLogo: 'https://i.ibb.co/W72nbhd/emarites.jpg',
      trend: 'down'
    },
    {
      from: 'Paris (CDG)',
      to: 'New York (JFK)',
      fromCode: 'CDG',
      toCode: 'JFK',
      price: 520,
      airline: 'Air France',
      airlineLogo: 'https://i.ibb.co/3LNQH9y/airfrance.png',
      trend: 'stable'
    },
    {
      from: 'Singapore (SIN)',
      to: 'Sydney (SYD)',
      fromCode: 'SIN',
      toCode: 'SYD',
      price: 420,
      airline: 'Singapore Airlines',
      airlineLogo: 'https://i.ibb.co/QvnsxTb7/singapore.jpg',
      trend: 'down'
    },
    {
      from: 'London (LHR)',
      to: 'Dubai (DXB)',
      fromCode: 'LHR',
      toCode: 'DXB',
      price: 380,
      airline: 'Emirates',
      airlineLogo: 'https://i.ibb.co/W72nbhd/emarites.jpg',
      trend: 'up'
    }
  ];

  // Customer reviews
  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'New York, USA',
      rating: 5,
      comment: 'Amazing service! Found the perfect flight to London at an unbeatable price. The booking process was smooth and customer support was excellent.',
      date: 'November 2025',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'Singapore',
      rating: 5,
      comment: 'Best flight booking experience ever. The interface is intuitive and I saved over $200 compared to other sites. Highly recommended!',
      date: 'October 2025',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emma Williams',
      location: 'London, UK',
      rating: 4,
      comment: 'Great platform for comparing flights. I appreciate the transparent pricing and no hidden fees. Will definitely use again for my next trip.',
      date: 'November 2025',
      avatar: 'EW'
    },
    {
      id: 4,
      name: 'Raj Patel',
      location: 'Mumbai, India',
      rating: 5,
      comment: 'Excellent deals on international flights! Booked my family trip to Dubai and the entire process was hassle-free. Customer service is top-notch.',
      date: 'October 2025',
      avatar: 'RP'
    },
    {
      id: 5,
      name: 'Sophie Martin',
      location: 'Paris, France',
      rating: 5,
      comment: 'I love how easy it is to find and compare flights. The live price updates helped me book at the right time. Saved me both time and money!',
      date: 'November 2025',
      avatar: 'SM'
    },
    {
      id: 6,
      name: 'David Kim',
      location: 'Seoul, South Korea',
      rating: 4,
      comment: 'Very reliable platform with competitive prices. The mobile experience is great too. Only suggestion would be to add more filter options.',
      date: 'October 2025',
      avatar: 'DK'
    }
  ];

  // Close passenger dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target)) {
        setShowPassengerDropdown(false);
      }
    };

    if (showPassengerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPassengerDropdown]);

  const updatePassengers = (type, increment, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    setSearchData(prev => {
      const currentValue = prev.passengers[type];
      const newValue = currentValue + increment;
      const minValue = type === 'adults' ? 1 : 0;
      const finalValue = Math.max(minValue, newValue);
      
      return {
        ...prev,
        passengers: {
          ...prev.passengers,
          [type]: finalValue
        }
      };
    });
  };

  const getTotalPassengers = () => {
    return searchData.passengers.adults + searchData.passengers.children + searchData.passengers.infants;
  };

  const swapAirports = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchData.from || !searchData.to || !searchData.departDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (searchData.tripType === 'round-trip' && !searchData.returnDate) {
      alert('Please select a return date for roundtrip flights');
      return;
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      from: searchData.from,
      to: searchData.to,
      departDate: searchData.departDate,
      tripType: searchData.tripType,
      adults: searchData.passengers.adults,
      children: searchData.passengers.children,
      infants: searchData.passengers.infants,
      cabinClass: searchData.cabinClass
    });

    if (searchData.tripType === 'round-trip' && searchData.returnDate) {
      queryParams.append('returnDate', searchData.returnDate);
    }
    if (searchData.directFlights) {
      queryParams.append('directFlights', 'true');
    }

    navigate(`/flight-results?${queryParams.toString()}`, {
      state: {
        from: searchData.from,
        to: searchData.to,
        date: searchData.departDate,
        departDate: searchData.departDate,
        returnDate: searchData.tripType === 'round-trip' ? searchData.returnDate : null,
        tripType: searchData.tripType,
        passengers: searchData.passengers,
        cabinClass: searchData.cabinClass
      }
    });
  };

  const handleRouteClick = (route) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const departDate = tomorrow.toISOString().split('T')[0];
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);
    const returnDate = nextWeek.toISOString().split('T')[0];

    const queryParams = new URLSearchParams({
      from: route.fromCode,
      to: route.toCode,
      departDate: departDate,
      returnDate: returnDate,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy'
    });

    navigate(`/flight-results?${queryParams.toString()}`, {
      state: {
        from: route.fromCode,
        to: route.toCode,
        departDate: departDate,
        returnDate: returnDate,
        tripType: 'round-trip',
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'economy'
      }
    });
  };

  return (
    <div className="flights-page">
      
      <div className="hero-section">
        <div className="container">
          <h1><Plane size={40} /> Find Your Perfect Flight</h1>
          <p>Search and compare flights from hundreds of airlines</p>
        </div>
      </div>

      <div className="search-container">
        <div className="container">
          <div className="search-card">
            {/* Trip Type Selector */}
            <div className="trip-type-selector">
              <label>
                <input
                  type="radio"
                  value="round-trip"
                  checked={searchData.tripType === 'round-trip'}
                  onChange={(e) => setSearchData({...searchData, tripType: e.target.value})}
                />
                <span>Round Trip</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="one-way"
                  checked={searchData.tripType === 'one-way'}
                  onChange={(e) => setSearchData({...searchData, tripType: e.target.value})}
                />
                <span>One Way</span>
              </label>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              <div className="search-fields-grid">
                {/* From */}
                <div className="search-field">
                  <label>From</label>
                  <div className="input-with-icon">
                    <AirportAutocomplete
                      value={searchData.from}
                      onChange={(code) => setSearchData({...searchData, from: code})}
                      placeholder="Departure City or Airport"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <button type="button" className="swap-btn" onClick={swapAirports}>
                  <ArrowRightLeft size={20} />
                </button>

                {/* To */}
                <div className="search-field">
                  <label>To</label>
                  <div className="input-with-icon">
                    <AirportAutocomplete
                      value={searchData.to}
                      onChange={(code) => setSearchData({...searchData, to: code})}
                      placeholder="Arrival City or Airport"
                    />
                  </div>
                </div>

                {/* Depart Date */}
                <div className="search-field">
                  <label>Depart</label>
                  <div className="input-with-icon" onClick={() => departDateRef.current?.showPicker?.()}>
                    <Calendar size={18} />
                    <input
                      ref={departDateRef}
                      type="date"
                      value={searchData.departDate}
                      onChange={(e) => setSearchData({...searchData, departDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Return Date */}
                {searchData.tripType === 'round-trip' && (
                  <div className="search-field">
                    <label>Return</label>
                    <div className="input-with-icon" onClick={() => returnDateRef.current?.showPicker?.()}>
                      <Calendar size={18} />
                      <input
                        ref={returnDateRef}
                        type="date"
                        value={searchData.returnDate}
                        onChange={(e) => setSearchData({...searchData, returnDate: e.target.value})}
                        min={searchData.departDate || new Date().toISOString().split('T')[0]}
                        required={searchData.tripType === 'round-trip'}
                      />
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div className="search-field passengers-field" ref={passengerDropdownRef}>
                  <label>Passengers</label>
                  <div className="passengers-dropdown">
                    <div 
                      className="passengers-summary"
                      onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                    >
                      {/* <Users size={18} /> */}
                      <span>
                        {getTotalPassengers()} Passenger{getTotalPassengers() !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {showPassengerDropdown && (
                      <div className="passengers-detail" onClick={(e) => e.stopPropagation()}>
                        <div className="passenger-row">
                          <div className="passenger-info">
                            <span className="passenger-type">Adults</span>
                            <span className="passenger-age">12+ years</span>
                          </div>
                          <div className="passenger-controls">
                            <button type="button" onClick={(e) => updatePassengers('adults', -1, e)} disabled={searchData.passengers.adults <= 1}>-</button>
                            <span>{searchData.passengers.adults}</span>
                            <button type="button" onClick={(e) => updatePassengers('adults', 1, e)}>+</button>
                          </div>
                        </div>
                        <div className="passenger-row">
                          <div className="passenger-info">
                            <span className="passenger-type">Children</span>
                            <span className="passenger-age">2-11 years</span>
                          </div>
                          <div className="passenger-controls">
                            <button type="button" onClick={(e) => updatePassengers('children', -1, e)} disabled={searchData.passengers.children <= 0}>-</button>
                            <span>{searchData.passengers.children}</span>
                            <button type="button" onClick={(e) => updatePassengers('children', 1, e)}>+</button>
                          </div>
                        </div>
                        <div className="passenger-row">
                          <div className="passenger-info">
                            <span className="passenger-type">Infants</span>
                            <span className="passenger-age">Under 2</span>
                          </div>
                          <div className="passenger-controls">
                            <button type="button" onClick={(e) => updatePassengers('infants', -1, e)} disabled={searchData.passengers.infants <= 0}>-</button>
                            <span>{searchData.passengers.infants}</span>
                            <button type="button" onClick={(e) => updatePassengers('infants', 1, e)}>+</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cabin Class */}
                <div className="search-field">
                  <label>Cabin Class</label>
                  <div className="input-with-icon">
                    <Star size={18} />
                    <select
                      value={searchData.cabinClass}
                      onChange={(e) => setSearchData({...searchData, cabinClass: e.target.value})}
                    >
                      <option value="economy">Economy</option>
                      <option value="premium-economy">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Direct Flights Checkbox */}
              <div className="direct-flights-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={searchData.directFlights}
                    onChange={(e) => setSearchData({...searchData, directFlights: e.target.checked})}
                  />
                  <span>Direct Flights Only</span>
                </label>
              </div>

              {/* Search Button */}
              <button type="submit" className="search-flights-btn">
                <Search size={20} /> Search Flights
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="trust-badges-section">
        <div className="container">
          <div className="trust-badges-grid">
            <div className="trust-badge">
              <div className="badge-icon">💰</div>
              <div className="badge-content">
                <h4>Price Match Promise</h4>
                <p>Find great flight deals to destinations worldwide</p>
              </div>
            </div>
            <div className="trust-badge">
              <div className="badge-icon">🎧</div>
              <div className="badge-content">
                <h4>24/7 Customer Support</h4>
                <p>Speak to our travel experts: anytime, anywhere</p>
              </div>
            </div>
            <div className="trust-badge">
              <div className="badge-icon">🎁</div>
              <div className="badge-content">
                <h4>Best Price Guarantee</h4>
                <p>Earn points and maximize your rewards</p>
              </div>
            </div>
            <div className="trust-badge">
              <div className="badge-icon">✅</div>
              <div className="badge-content">
                <h4>Easy Cancellations</h4>
                <p>Convenient options online and 24/7 support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="popular-routes-section">
        <div className="container">
          <div className="section-header">
            <h2><TrendingDown size={32} /> Popular Routes & Live Prices</h2>
            <p>Book your next trip at the best available prices</p>
          </div>
          
          <div className="routes-grid">
            {popularRoutes.map((route, index) => (
              <div 
                key={index} 
                className="route-card"
                onClick={() => handleRouteClick(route)}
              >
                <div className="route-header">
                  <div className="route-cities">
                    <span className="city-from">{route.from}</span>
                    <Plane size={20} className="route-icon" />
                    <span className="city-to">{route.to}</span>
                  </div>
                  <div className={`price-trend ${route.trend}`}>
                    {route.trend === 'down' && <TrendingDown size={16} />}
                    {route.trend === 'up' && '↗'}
                    {route.trend === 'stable' && '→'}
                  </div>
                </div>
                
                <div className="route-details">
                  <div className="airline-info">
                    <img 
                      src={`${route.airlineLogo}`} 
                      alt={route.airline}
                      className="airline-logo"
                      onError={(e) => {
                        e.target.src = '/airlines/default.svg';
                      }}
                    />
                    <span className="airline-name">{route.airline}</span>
                  </div>
                  <div className="price-tag">
                    <span className="price">${route.price}</span>
                    <span className="price-label">round trip</span>
                  </div>
                </div>
                
                <button className="view-flights-btn">
                  View Flights
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2><Star size={32} /> What Our Customers Say</h2>
            <p>Join thousands of satisfied travelers worldwide</p>
          </div>
          
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="avatar">{review.avatar}</div>
                    <div className="reviewer-details">
                      <h4 className="reviewer-name">{review.name}</h4>
                      <p className="reviewer-location">{review.location}</p>
                    </div>
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        fill={index < review.rating ? '#fbbf24' : 'none'}
                        color={index < review.rating ? '#fbbf24' : '#cbd5e0'}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="review-content">
                  <Quote size={24} className="quote-icon" />
                  <p className="review-text">{review.comment}</p>
                </div>
                
                <div className="review-footer">
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flights;
