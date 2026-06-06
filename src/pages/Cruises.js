import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Calendar, Users, MapPin, Anchor, Search } from 'lucide-react';
import AirportAutocomplete from '../components/AirportAutocomplete';
import './Cruises.css';

function Cruises() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    destination: '',
    departurePort: '',
    departurePortCode: '',
    departureDate: '',
    duration: '',
    passengers: 2
  });

  const popularDestinations = [
    {
      name: 'Caribbean',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      cruises: '50+ cruises',
      startingPrice: '$599'
    },
    {
      name: 'Mediterranean',
      image: 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=800',
      cruises: '40+ cruises',
      startingPrice: '$899'
    },
    {
      name: 'Alaska',
      image: 'https://images.unsplash.com/photo-1560800452-f2d475982b96?w=800',
      cruises: '25+ cruises',
      startingPrice: '$1,299'
    },
    {
      name: 'Hawaii',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      cruises: '15+ cruises',
      startingPrice: '$1,499'
    }
  ];

  const cruiseLines = [
    { name: 'Royal Caribbean', logo: '🚢' },
    { name: 'Carnival', logo: '⚓' },
    { name: 'Norwegian', logo: '🛳️' },
    { name: 'MSC Cruises', logo: '🚢' },
    { name: 'Princess Cruises', logo: '⛴️' },
    { name: 'Celebrity Cruises', logo: '🛥️' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/cruise-results', { state: searchParams });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="cruises-page">
      {/* Hero Section */}
      <div className="cruise-hero">
        <div className="cruise-hero-content">
          <h1><Ship className="hero-icon" /> Discover Your Dream Cruise</h1>
          <p>Explore the world's most beautiful destinations from the comfort of luxury cruise ships</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="cruise-search-container">
        <div className="cruise-search-box">
          <h2>Find Your Perfect Cruise</h2>
          <form onSubmit={handleSearch} className="cruise-search-form">
            <div className="cruise-form-row">
              <div className="cruise-form-group">
                <label><MapPin size={18} /> Destination</label>
                <select
                  name="destination"
                  value={searchParams.destination}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select destination</option>
                  <option value="caribbean">Caribbean</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="alaska">Alaska</option>
                  <option value="hawaii">Hawaii</option>
                  <option value="bahamas">Bahamas</option>
                  <option value="mexico">Mexico</option>
                  <option value="europe">Europe</option>
                  <option value="asia">Asia</option>
                </select>
              </div>

              <AirportAutocomplete
                value={searchParams.departurePort}
                onChange={(code, formatted) => {
                  setSearchParams({
                    ...searchParams,
                    departurePort: formatted,
                    departurePortCode: code
                  });
                }}
                placeholder="e.g., Miami, Fort Lauderdale, Barcelona..."
                label="Departure Port"
                icon={Anchor}
              />
            </div>

            <div className="cruise-form-row">
              <div className="cruise-form-group">
                <label><Calendar size={18} /> Departure Date</label>
                <input
                  type="date"
                  name="departureDate"
                  value={searchParams.departureDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="cruise-form-group">
                <label><Calendar size={18} /> Duration</label>
                <select
                  name="duration"
                  value={searchParams.duration}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select duration</option>
                  <option value="3-5">3-5 nights</option>
                  <option value="6-8">6-8 nights</option>
                  <option value="9-12">9-12 nights</option>
                  <option value="13+">13+ nights</option>
                </select>
              </div>

              <div className="cruise-form-group">
                <label><Users size={18} /> Passengers</label>
                <select
                  name="passengers"
                  value={searchParams.passengers}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="cruise-search-btn">
              <Search size={20} />
              Search Cruises
            </button>
          </form>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="cruise-destinations-section">
        <h2>Popular Cruise Destinations</h2>
        <div className="cruise-destinations-grid">
          {popularDestinations.map((destination, index) => (
            <div key={index} className="cruise-destination-card">
              <div className="cruise-destination-image">
                <img src={destination.image} alt={destination.name} />
                <div className="cruise-destination-overlay">
                  <h3>{destination.name}</h3>
                  <p>{destination.cruises}</p>
                </div>
              </div>
              <div className="cruise-destination-info">
                <div className="cruise-destination-price">
                  <span className="price-label">Starting from</span>
                  <span className="price-value">{destination.startingPrice}</span>
                  <span className="price-unit">per person</span>
                </div>
                <button className="cruise-explore-btn">Explore Cruises</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cruise Lines */}
      <div className="cruise-lines-section">
        <h2>Featured Cruise Lines</h2>
        <div className="cruise-lines-grid">
          {cruiseLines.map((line, index) => (
            <div key={index} className="cruise-line-card">
              <div className="cruise-line-logo">{line.logo}</div>
              <h3>{line.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Cruises */}
      <div className="cruise-benefits-section">
        <h2>Why Choose a Cruise Vacation?</h2>
        <div className="cruise-benefits-grid">
          <div className="cruise-benefit-card">
            <div className="benefit-icon">🌊</div>
            <h3>Multiple Destinations</h3>
            <p>Visit multiple cities and countries in one trip without the hassle of packing and unpacking</p>
          </div>
          <div className="cruise-benefit-card">
            <div className="benefit-icon">🍽️</div>
            <h3>All-Inclusive Dining</h3>
            <p>Enjoy unlimited gourmet meals and snacks at various restaurants and venues</p>
          </div>
          <div className="cruise-benefit-card">
            <div className="benefit-icon">🎭</div>
            <h3>Entertainment</h3>
            <p>World-class shows, casinos, pools, spas, and activities for all ages</p>
          </div>
          <div className="cruise-benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Great Value</h3>
            <p>Accommodation, meals, and entertainment all included in one price</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cruises;
