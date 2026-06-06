import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAirlineBySlug } from '../data/airlines';
import AirportAutocomplete from '../components/AirportAutocomplete';
import { 
  Plane, MapPin, Globe, Award, Star, Users, Calendar,
  CheckCircle, Phone, ExternalLink, Clock, DollarSign,
  Wifi, Coffee, Tv, Shield, TrendingUp, Tag, Search,
  ArrowRightLeft
} from 'lucide-react';
import './AirlinePage.css';

function AirlinePage() {
  const { airlineSlug } = useParams();
  const navigate = useNavigate();
  const [airline, setAirline] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const passengerDropdownRef = useRef(null);
  const departDateRef = useRef(null);
  const returnDateRef = useRef(null);
  
  // Flight search form state
  const [searchData, setSearchData] = useState({
    tripType: 'round-trip',
    from: '',
    fromDisplay: '',
    to: '',
    toDisplay: '',
    departDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    cabinClass: 'economy',
    preferredAirline: ''
  });

  // Close dropdown when clicking outside
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

  useEffect(() => {
    const airlineData = getAirlineBySlug(airlineSlug);
    if (airlineData) {
      setAirline(airlineData);
      // Pre-select this airline in the search form
      setSearchData(prev => ({
        ...prev,
        preferredAirline: airlineData.code
      }));
      document.title = `${airlineData.name} - Flight Deals & Information | WegoFare`;
    }
  }, [airlineSlug]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!searchData.from || !searchData.to || !searchData.departDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (searchData.tripType === 'round-trip' && !searchData.returnDate) {
      alert('Please select a return date');
      return;
    }

    // Build query parameters for FlightResults page
    const queryParams = new URLSearchParams({
      from: searchData.from,
      to: searchData.to,
      departDate: searchData.departDate,
      tripType: searchData.tripType,
      adults: searchData.passengers.adults,
      children: searchData.passengers.children,
      infants: searchData.passengers.infants,
      cabinClass: searchData.cabinClass,
      airline: airline.code // Filter by this airline
    });

    // Add return date for roundtrip
    if (searchData.tripType === 'round-trip' && searchData.returnDate) {
      queryParams.append('returnDate', searchData.returnDate);
    }
    
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Navigate to flight results with both query params and state
    navigate(`/flight-results?${queryParams.toString()}`, {
      state: {
        from: searchData.from,
        to: searchData.to,
        date: searchData.departDate,
        departDate: searchData.departDate,
        returnDate: searchData.tripType === 'round-trip' ? searchData.returnDate : null,
        tripType: searchData.tripType,
        passengers: {
          adults: searchData.passengers.adults,
          children: searchData.passengers.children,
          infants: searchData.passengers.infants
        },
        cabinClass: searchData.cabinClass,
        airline: airline.code,
        airlineName: airline.name
      }
    });
  };

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
      
      console.log(`Updating ${type}: ${currentValue} -> ${finalValue}`);
      
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

  if (!airline) {
    return (
      <div className="airline-not-found">
        <Plane size={64} />
        <h2>Airline Not Found</h2>
        <p>The airline you're looking for doesn't exist.</p>
        <Link to="/airlines" className="back-link">View All Airlines</Link>
      </div>
    );
  }

  return (
    <div className="airline-page">
      {/* Hero Section with Integrated Search */}
      <div className="airline-hero">
        <div className="airline-hero-content">
          <div className="airline-logo-section">
            <div className="airline-logo-placeholder">
              {airline.logo ? (
                <img 
                  src={airline.logo} 
                  alt={`${airline.name} logo`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <Plane size={64} style={{ display: airline.logo ? 'none' : 'block' }} />
            </div>
            <div className="airline-header-info">
              <h1>{airline.name}</h1>
              <div className="airline-meta">
                <span className="airline-code">{airline.code}</span>
                <span className="separator">•</span>
                <span className="airline-alliance">{airline.alliance}</span>
              </div>
            </div>
          </div>
          <p className="airline-description">{airline.description}</p>
          
          <div className="airline-quick-stats">
            <div className="quick-stat">
              <Globe size={24} />
              <div>
                <div className="stat-value">{airline.destinations}</div>
                <div className="stat-label">Destinations</div>
              </div>
            </div>
            <div className="quick-stat">
              <Plane size={24} />
              <div>
                <div className="stat-value">{airline.fleet}</div>
                <div className="stat-label">Aircraft</div>
              </div>
            </div>
            <div className="quick-stat">
              <MapPin size={24} />
              <div>
                <div className="stat-value">{airline.hubs.length}</div>
                <div className="stat-label">Hub Airports</div>
              </div>
            </div>
            <div className="quick-stat">
              <Calendar size={24} />
              <div>
                <div className="stat-value">{airline.founded}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {/* Integrated Flight Search Form */}
          <div className="airline-search-section">
            <h2 className="search-title">
              <Search size={24} /> 
              Search {airline.name} Flights
            </h2>
            <form onSubmit={handleSearchSubmit} className="airline-flight-search-form">
              {/* Trip Type */}
              <div className="trip-type-selector">
                <label className={searchData.tripType === 'round-trip' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="tripType"
                    value="round-trip"
                    checked={searchData.tripType === 'round-trip'}
                    onChange={(e) => setSearchData({...searchData, tripType: e.target.value})}
                  />
                  <span>Round Trip</span>
                </label>
                <label className={searchData.tripType === 'one-way' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={searchData.tripType === 'one-way'}
                    onChange={(e) => setSearchData({...searchData, tripType: e.target.value})}
                  />
                  <span>One Way</span>
                </label>
                <label className={searchData.tripType === 'multi-city' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="tripType"
                    value="multi-city"
                    checked={searchData.tripType === 'multi-city'}
                    onChange={(e) => setSearchData({...searchData, tripType: e.target.value})}
                  />
                  <span>Multi City</span>
                </label>
              </div>

              {/* Main Search Fields */}
              <div className="search-fields-grid">
                {/* From */}
                <div className="search-field">
                  <label>From</label>
                  <AirportAutocomplete
                    value={searchData.from}
                    onChange={(code, display) => setSearchData({
                      ...searchData,
                      from: code,
                      fromDisplay: display
                    })}
                    placeholder="Departure City or Airport"
                  />
                </div>

                {/* Swap Button */}
                <button 
                  type="button" 
                  className="swap-btn"
                  onClick={() => setSearchData({
                    ...searchData,
                    from: searchData.to,
                    to: searchData.from,
                    fromDisplay: searchData.toDisplay,
                    toDisplay: searchData.fromDisplay
                  })}
                >
                  <ArrowRightLeft size={20} />
                </button>

                {/* To */}
                <div className="search-field">
                  <label>To</label>
                  <AirportAutocomplete
                    value={searchData.to}
                    onChange={(code, display) => setSearchData({
                      ...searchData,
                      to: code,
                      toDisplay: display
                    })}
                    placeholder="Arrival City or Airport"
                  />
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
                        {searchData.passengers.adults + searchData.passengers.children + searchData.passengers.infants} Passenger
                        {(searchData.passengers.adults + searchData.passengers.children + searchData.passengers.infants) !== 1 ? 's' : ''}
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

              {/* Airline Badge */}
              <div className="selected-airline-badge">
                <Plane size={16} />
                <span>Searching {airline.name} flights only</span>
              </div>

              {/* Search Button */}
              <button type="submit" className="search-flights-btn">
                <Search size={20} />
                Search {airline.name} Flights
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="airline-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Star size={18} /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <Award size={18} /> Travel Classes
        </button>
        <button 
          className={`tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          <Tag size={18} /> Deals & Tips
        </button>
        <button 
          className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <Phone size={18} /> Contact
        </button>
      </div>

      {/* Tab Content */}
      <div className="airline-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="content-grid">
              {/* Airline Information */}
              <div className="info-card">
                <h2><Globe size={24} /> Airline Information</h2>
                <div className="info-list">
                  <div className="info-item">
                    <strong>Headquarters:</strong>
                    <span>{airline.headquarters}</span>
                  </div>
                  <div className="info-item">
                    <strong>Founded:</strong>
                    <span>{airline.founded}</span>
                  </div>
                  <div className="info-item">
                    <strong>Alliance:</strong>
                    <span>{airline.alliance}</span>
                  </div>
                  <div className="info-item">
                    <strong>Fleet Size:</strong>
                    <span>{airline.fleet} aircraft</span>
                  </div>
                  <div className="info-item">
                    <strong>Destinations:</strong>
                    <span>{airline.destinations} cities</span>
                  </div>
                  <div className="info-item">
                    <strong>Frequent Flyer:</strong>
                    <span>{airline.frequentFlyer}</span>
                  </div>
                </div>
              </div>

              {/* Hub Airports */}
              <div className="info-card">
                <h2><MapPin size={24} /> Hub Airports</h2>
                <div className="hubs-grid">
                  {airline.hubs.map((hub, index) => (
                    <div key={index} className="hub-item">
                      <MapPin size={16} />
                      <span>{hub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="info-card full-width">
                <h2><Award size={24} /> Key Features & Amenities</h2>
                <div className="features-grid">
                  {airline.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <CheckCircle size={20} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="classes-section">
            <h2><Award size={24} /> Travel Classes</h2>
            <div className="classes-grid">
              {airline.classes.map((className, index) => (
                <div key={index} className="class-card">
                  <div className="class-icon">
                    <Star size={32} />
                  </div>
                  <h3>{className}</h3>
                  <div className="class-features">
                    {index === 0 && (
                      <>
                        <div className="class-feature"><Wifi size={16} /> Premium WiFi</div>
                        <div className="class-feature"><Tv size={16} /> Premium Entertainment</div>
                        <div className="class-feature"><Coffee size={16} /> Gourmet Dining</div>
                        <div className="class-feature"><Users size={16} /> Priority Boarding</div>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <div className="class-feature"><Wifi size={16} /> Complimentary WiFi</div>
                        <div className="class-feature"><Tv size={16} /> Enhanced Entertainment</div>
                        <div className="class-feature"><Coffee size={16} /> Premium Meals</div>
                        <div className="class-feature"><Users size={16} /> Extra Legroom</div>
                      </>
                    )}
                    {index >= 2 && (
                      <>
                        <div className="class-feature"><Tv size={16} /> In-flight Entertainment</div>
                        <div className="class-feature"><Coffee size={16} /> Complimentary Snacks</div>
                        <div className="class-feature"><Users size={16} /> Standard Seating</div>
                        <div className="class-feature"><CheckCircle size={16} /> Affordable Fares</div>
                      </>
                    )}
                  </div>
                  <button className="book-class-btn">
                    Find {className} Deals
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="deals-section">
            <h2><Tag size={24} /> Booking Tips & Deals</h2>
            
            <div className="tips-grid">
              <div className="tips-card">
                <h3><TrendingUp size={24} /> Best Booking Tips</h3>
                <div className="tips-list">
                  {airline.bookingTips.map((tip, index) => (
                    <div key={index} className="tip-item">
                      <CheckCircle size={18} color="#0ea5e9" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="deals-card">
                <h3><DollarSign size={24} /> Current Deals</h3>
                <div className="deal-item">
                  <div className="deal-badge">Hot Deal</div>
                  <h4>Save up to 40% on {airline.name}</h4>
                  <p>Book your flights now and save on select routes</p>
                  <button className="deal-btn">View All Deals</button>
                </div>
                <div className="deal-item">
                  <div className="deal-badge">Limited Time</div>
                  <h4>{airline.frequentFlyer} Bonus Miles</h4>
                  <p>Earn double miles on qualifying flights this month</p>
                  <button className="deal-btn">Learn More</button>
                </div>
              </div>
            </div>

            <div className="search-flights-cta">
              <h3>Ready to Book?</h3>
              <p>Search for the best {airline.name} flight deals</p>
              <Link to="/" className="search-btn">
                <Plane size={20} /> Search Flights
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="contact-section">
            <h2><Phone size={24} /> Contact Information</h2>
            
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon">
                  <Phone size={32} />
                </div>
                <h3>Customer Service</h3>
                <p className="contact-value">{airline.contactInfo.phone}</p>
                <p className="contact-note">{airline.contactInfo.customerService}</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <Globe size={32} />
                </div>
                <h3>Official Website</h3>
                <a href={airline.contactInfo.website} target="_blank" rel="noopener noreferrer" className="website-link">
                  {airline.contactInfo.website}
                  <ExternalLink size={16} />
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <Clock size={32} />
                </div>
                <h3>Support Hours</h3>
                <p className="contact-value">24/7</p>
                <p className="contact-note">Round-the-clock assistance</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <Shield size={32} />
                </div>
                <h3>Travel Assistance</h3>
                <p className="contact-value">Booking Support</p>
                <p className="contact-note">We can help you book flights</p>
              </div>
            </div>

            <div className="help-center">
              <h3>Need Help Booking?</h3>
              <p>Our travel experts can help you find the best {airline.name} deals and assist with your booking.</p>
              <button className="help-btn">Contact Travel Expert</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="airline-footer-cta">
        <h2>Find the Best {airline.name} Deals</h2>
        <p>Compare prices across hundreds of travel sites and save on your next flight</p>
        <div className="cta-buttons">
          <Link to="/" className="cta-primary">
            <Plane size={20} /> Search Flights
          </Link>
          <Link to="/airlines" className="cta-secondary">
            View All Airlines
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AirlinePage;
