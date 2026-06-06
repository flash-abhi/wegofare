import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Sun, Palmtree, Mountain, Globe, Plane, Hotel, Utensils, Star, ArrowRight, BadgeCheck } from 'lucide-react';
import AirportAutocomplete from '../components/AirportAutocomplete';
import './Packages.css';

function Packages() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    destinationType: 'city', // 'city' or 'airport'
    destination: '',
    destinationCode: '',
    departureCity: '',
    departureCityCode: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    packageType: 'all-inclusive',
    flightClass: 'economy',
    rooms: 1
  });

  const handleInputChange = (field, value) => {
    setSearchForm({ ...searchForm, [field]: value });
  };

  const handleDepartureChange = (code, formatted) => {
    setSearchForm({ 
      ...searchForm, 
      departureCity: formatted,
      departureCityCode: code
    });
  };

  const handleDestinationChange = (code, formatted) => {
    setSearchForm({ 
      ...searchForm, 
      destination: formatted,
      destinationCode: code
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/package-results', { state: searchForm });
  };

  const popularDestinations = [
    {
      name: 'Cancun, Mexico',
      image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800',
      price: 899,
      nights: 7,
      rating: 4.8
    },
    {
      name: 'Punta Cana, Dominican Republic',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      price: 1099,
      nights: 7,
      rating: 4.7
    },
    {
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      price: 1599,
      nights: 10,
      rating: 4.9
    },
    {
      name: 'Maldives',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      price: 2499,
      nights: 7,
      rating: 5.0
    },
    {
      name: 'Jamaica',
      image: 'https://i.ibb.co/hR0Z12L1/am-taufik-gd-K3a4t3vl-A-unsplash.jpg',
      price: 1199,
      nights: 7,
      rating: 4.6
    },
    {
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      price: 1899,
      nights: 7,
      rating: 4.8
    }
  ];

  const packageTypes = [
    {
      icon: <Sun size={32} />,
      title: 'Beach Resort',
      description: 'Oceanfront luxury with water sports',
      packages: 150
    },
    {
      icon: <Mountain size={32} />,
      title: 'Adventure',
      description: 'Hiking, rafting, and exploration',
      packages: 89
    },
    {
      icon: <Globe size={32} />,
      title: 'Cultural Tours',
      description: 'Historical sites and local culture',
      packages: 112
    },
    {
      icon: <Palmtree size={32} />,
      title: 'Tropical Paradise',
      description: 'Island getaways and relaxation',
      packages: 203
    }
  ];

  return (
    <div className="packages-page">
      {/* Hero Section */}
      <div className="packages-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="packages-hero-kicker">
            <Palmtree size={18} />
            Flight + hotel planner
          </span>
          <h1>
            Build a vacation package that fits your trip
          </h1>
          <p>Compare flight and hotel package options with clear provider details before booking</p>
          <div className="packages-hero-stats">
            <span><strong>150+</strong> beach resorts</span>
            <span><strong>24/7</strong> travel desk</span>
            <span><strong>Clear</strong> package terms</span>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="packages-search-container">
        <div className="packages-search-box">
          <div className="packages-search-intro">
            <span>Package planner</span>
            <h2>Build a flight and hotel package</h2>
            <p className="form-subtitle">Review available flights, hotels, dates, and package inclusions before confirmation</p>
            <div className="planner-mini-list">
              <p><Plane size={16} /> Flight options when available</p>
              <p><Hotel size={16} /> Hotel and room details</p>
              <p><BadgeCheck size={16} /> Provider terms before payment</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="packages-search-form">
            {/* Destination & Departure */}
            <div className="form-section">
              <h3 className="section-title">
                <MapPin size={20} />
                Where are you traveling?
              </h3>
              <div className="search-row">
                <div className="search-field full-width">
                  <label><MapPin size={18} /> Destination City or Airport</label>
                  <AirportAutocomplete
                    value={searchForm.destinationCode}
                    onChange={handleDestinationChange}
                    placeholder="e.g., Cancun, Paris, Bali, Tokyo..."
                  />
                </div>
              </div>
              <div className="search-row">
                <div className="search-field full-width">
                  <label><Plane size={18} /> Departure Airport</label>
                  <AirportAutocomplete
                    value={searchForm.departureCityCode}
                    onChange={handleDepartureChange}
                    placeholder="e.g., New York (JFK), Los Angeles (LAX)..."
                  />
                </div>
              </div>
            </div>

            {/* Travel Dates */}
            <div className="form-section">
              <h3 className="section-title">
                <Calendar size={20} />
                When do you want to travel?
              </h3>
              <div className="search-row">
                <div className="search-field">
                  <label><Calendar size={18} /> Check-in Date</label>
                  <input
                    type="date"
                    value={searchForm.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="search-field">
                  <label><Calendar size={18} /> Check-out Date</label>
                  <input
                    type="date"
                    value={searchForm.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    min={searchForm.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              {searchForm.checkIn && searchForm.checkOut && (
                <div className="nights-display">
                  🌙 {Math.ceil((new Date(searchForm.checkOut) - new Date(searchForm.checkIn)) / (1000 * 60 * 60 * 24))} nights
                </div>
              )}
            </div>

            {/* Travelers */}
            <div className="form-section">
              <h3 className="section-title">
                <Users size={20} />
                Who's traveling?
              </h3>
              <div className="search-row">
                <div className="search-field">
                  <label><Users size={18} /> Adults (18+)</label>
                  <select
                    value={searchForm.adults}
                    onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                    ))}
                  </select>
                </div>
                <div className="search-field">
                  <label><Users size={18} /> Children (0-17)</label>
                  <select
                    value={searchForm.children}
                    onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>
                <div className="search-field">
                  <label><Hotel size={18} /> Rooms</label>
                  <select
                    value={searchForm.rooms}
                    onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="travelers-summary">
                👥 {searchForm.adults + searchForm.children} {searchForm.adults + searchForm.children === 1 ? 'Traveler' : 'Travelers'} • 🛏️ {searchForm.rooms} {searchForm.rooms === 1 ? 'Room' : 'Rooms'}
              </div>
            </div>

            {/* Flight & Package Preferences */}
            <div className="form-section">
              <h3 className="section-title">
                <Plane size={20} />
                Flight & Package Preferences
              </h3>
              <div className="search-row">
                <div className="search-field">
                  <label><Plane size={18} /> Flight Class</label>
                  <select
                    value={searchForm.flightClass}
                    onChange={(e) => handleInputChange('flightClass', e.target.value)}
                  >
                    <option value="economy">Economy</option>
                    <option value="premium-economy">Premium Economy (+50%)</option>
                    <option value="business">Business Class (+150%)</option>
                    <option value="first">First Class (+300%)</option>
                  </select>
                </div>
                <div className="search-field">
                  <label><Utensils size={18} /> Package Type</label>
                  <select
                    value={searchForm.packageType}
                    onChange={(e) => handleInputChange('packageType', e.target.value)}
                  >
                    <option value="all-inclusive">All-Inclusive</option>
                    <option value="flight-hotel">Flight + Hotel Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Package Type Details */}
            <div className="package-info-box">
              {searchForm.packageType === 'all-inclusive' ? (
                <div className="package-details">
                  <strong>All-Inclusive Package May Include:</strong>
                  <ul>
                    <li>Round-trip flights when selected and available</li>
                    <li>{searchForm.rooms} {searchForm.rooms === 1 ? 'room' : 'rooms'} accommodation</li>
                    <li>Meal and beverage inclusions shown by the selected provider</li>
                    <li>Activities or entertainment when listed in package details</li>
                    <li>Transfers only when included by the selected package</li>
                  </ul>
                </div>
              ) : (
                <div className="package-details">
                  <strong>Flight + Hotel Package May Include:</strong>
                  <ul>
                    <li>Round-trip flights when selected and available</li>
                    <li>{searchForm.rooms} {searchForm.rooms === 1 ? 'room' : 'rooms'} accommodation</li>
                    <li>Meal inclusions only when shown in provider details</li>
                  </ul>
                </div>
              )}
            </div>

            <button type="submit" className="search-btn">
              <Search size={20} />
              Search Packages
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* What's Included */}
      <div className="whats-included-section">
        <div className="container">
          <span className="packages-section-kicker">Package basics</span>
          <h2>Common Package Inclusions</h2>
          <div className="included-grid">
            <div className="included-item">
              <span>01</span>
              <Plane size={40} />
              <h3>Round-trip Flights</h3>
              <p>Flight options are shown based on availability and selected dates</p>
            </div>
            <div className="included-item">
              <span>02</span>
              <Hotel size={40} />
              <h3>Accommodation</h3>
              <p>Hotel options vary by destination, dates, and selected provider</p>
            </div>
            <div className="included-item">
              <span>03</span>
              <Utensils size={40} />
              <h3>Meals & Drinks</h3>
              <p>Included meals and beverages depend on the package terms</p>
            </div>
            <div className="included-item">
              <span>04</span>
              <Sun size={40} />
              <h3>Activities & Entertainment</h3>
              <p>Activities are included only when listed in the selected offer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="popular-destinations-section">
        <div className="container">
          <span className="packages-section-kicker">Popular picks</span>
          <h2>Popular Package Destinations</h2>
          <div className="destinations-grid">
            {popularDestinations.map((dest, index) => (
              <article
                key={index} 
                className="destination-card package-slate-card"
                onClick={() => {
                  setSearchForm({ ...searchForm, destination: dest.name });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="package-slate-image">
                  <img src={dest.image} alt={dest.name} />
                  <span className="package-slate-tag">
                    <BadgeCheck size={14} />
                    Curated
                  </span>
                </div>
                <div className="package-slate-body">
                  <div>
                    <div className="destination-meta">
                      <span className="rating">
                        <Star size={16} fill="currentColor" />
                        {dest.rating}
                      </span>
                      <span className="nights">{dest.nights} nights</span>
                    </div>
                    <h3>{dest.name}</h3>
                  </div>
                  <div className="destination-price">
                    <span className="from">From</span>
                    <span className="price">${dest.price}</span>
                    <span className="per">per person</span>
                  </div>
                  <button type="button">
                    Plan trip <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Package Types */}
      <div className="package-types-section">
        <div className="container">
          <span className="packages-section-kicker">Trip style</span>
          <h2>Explore by Experience</h2>
          <div className="package-types-grid">
            {packageTypes.map((type, index) => (
              <div key={index} className="package-type-card">
                <div className="type-icon">{type.icon}</div>
                <h3>{type.title}</h3>
                <p>{type.description}</p>
                <span className="package-count">{type.packages} packages</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Book With Us */}
      <div className="why-book-section">
        <div className="container">
          <span className="packages-section-kicker light">Why WegoFare</span>
          <h2>Why Book Your Vacation Package With Us?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-number">01</div>
              <h3>Clear Pricing</h3>
              <p>Review taxes, fees, and package details before payment</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">02</div>
              <h3>Travel Assistance</h3>
              <p>Get guidance before booking and help with itinerary questions</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">03</div>
              <h3>Provider Policies</h3>
              <p>Cancellation and change rules are shown by each provider</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">04</div>
              <h3>Curated Experiences</h3>
              <p>Compare package details so you can choose what fits your trip</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Packages;
