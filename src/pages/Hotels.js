import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, BedDouble, Star, ArrowRight, Sparkles } from 'lucide-react';
import { cityCodes } from '../data/cityCodes';
import './Hotels.css';

function Hotels() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    cityCode: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    roomQuantity: 1
  });
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const filteredCities = cityCodes.filter(city =>
    citySearch.length > 0 && (
      city.city.toLowerCase().includes(citySearch.toLowerCase()) ||
      city.code.toLowerCase().includes(citySearch.toLowerCase()) ||
      city.country.toLowerCase().includes(citySearch.toLowerCase())
    )
  );

  const handleCitySelect = (code) => {
    setSearchData({ ...searchData, cityCode: code });
    setCitySearch(code);
    setShowCityDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchData.cityCode) {
      alert('Please enter a city code (e.g., NYC, PAR, LON)');
      return;
    }
    if (!searchData.checkInDate || !searchData.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // Navigate to hotel results
    navigate('/hotel-results', { state: searchData });
  };

  const hotels = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      title: 'The Plaza Hotel',
      description: 'Iconic luxury hotel on Fifth Avenue with elegant rooms and world-class service',
      price: '$650/night',
      rating: 4.8,
      location: 'New York, USA'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      title: 'Burj Al Arab Jumeirah',
      description: 'Iconic sail-shaped luxury hotel with private beach and butler service',
      price: '$1,200/night',
      rating: 5.0,
      location: 'Dubai, UAE'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      title: 'Park Hyatt Tokyo',
      description: 'Sophisticated high-rise hotel with panoramic city views and spa',
      price: '$450/night',
      rating: 4.7,
      location: 'Tokyo, Japan'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      title: 'Hotel Ritz Paris',
      description: 'Historic palace hotel with lavish suites, Michelin-starred dining',
      price: '$1,500/night',
      rating: 4.9,
      location: 'Paris, France'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      title: 'The Savoy',
      description: 'Legendary hotel on the River Thames with Art Deco elegance',
      price: '$800/night',
      rating: 4.8,
      location: 'London, UK'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      title: 'Atlantis The Palm',
      description: 'Ocean-themed resort with waterpark, aquarium, and private beach',
      price: '$550/night',
      rating: 4.6,
      location: 'Dubai, UAE'
    },
    {
      id: 7,
      image: 'https://i.ibb.co/hRbNjh3V/swapnil-bapat-s-J7p-Yy-JFyu-A-unsplash.jpg',
      title: 'Marina Bay Sands',
      description: 'Iconic hotel with rooftop infinity pool and stunning city views',
      price: '$420/night',
      rating: 4.7,
      location: 'Singapore'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
      title: 'Bellagio Las Vegas',
      description: 'Luxury resort with famous fountains, casino, and fine dining',
      price: '$280/night',
      rating: 4.5,
      location: 'Las Vegas, USA'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      title: 'Four Seasons Bangkok',
      description: 'Riverside luxury hotel with Thai hospitality and spa sanctuary',
      price: '$320/night',
      rating: 4.8,
      location: 'Bangkok, Thailand'
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
      title: 'Copacabana Palace',
      description: 'Historic beachfront hotel with Art Deco style and ocean views',
      price: '$480/night',
      rating: 4.7,
      location: 'Rio de Janeiro, Brazil'
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&q=80',
      title: 'Aman Tokyo',
      description: 'Minimalist luxury hotel combining traditional Japanese design',
      price: '$950/night',
      rating: 4.9,
      location: 'Tokyo, Japan'
    },
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
      title: 'The Peninsula Hong Kong',
      description: 'Colonial-era grand hotel with harbor views and Rolls-Royce fleet',
      price: '$580/night',
      rating: 4.8,
      location: 'Hong Kong'
    },
    {
      id: 13,
      image: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&q=80',
      title: 'Hotel Arts Barcelona',
      description: 'Contemporary beachfront hotel with two Michelin-starred restaurants',
      price: '$390/night',
      rating: 4.6,
      location: 'Barcelona, Spain'
    },
    {
      id: 14,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      title: 'Raffles Singapore',
      description: 'Colonial landmark hotel with suites, tropical gardens, and history',
      price: '$680/night',
      rating: 4.7,
      location: 'Singapore'
    },
    {
      id: 15,
      image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80',
      title: 'St. Regis Rome',
      description: 'Palatial hotel near Spanish Steps with butler service',
      price: '$720/night',
      rating: 4.8,
      location: 'Rome, Italy'
    },
    {
      id: 16,
      image: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80',
      title: 'Mandarin Oriental Bangkok',
      description: 'Riverside retreat with Thai elegance and legendary service',
      price: '$340/night',
      rating: 4.7,
      location: 'Bangkok, Thailand'
    },
    {
      id: 17,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      title: 'Waldorf Astoria Amsterdam',
      description: 'Grand canal-side palace with Michelin-starred dining',
      price: '$620/night',
      rating: 4.8,
      location: 'Amsterdam, Netherlands'
    },
    {
      id: 18,
      image: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800&q=80',
      title: 'Park Hyatt Sydney',
      description: 'Harbourfront luxury hotel with Opera House and bridge views',
      price: '$520/night',
      rating: 4.7,
      location: 'Sydney, Australia'
    }
  ];

  const buildBookingState = (hotel) => {
    const perNight = Number(String(hotel.price || '').replace(/[^0-9.]/g, '')) || 0;
    const checkInDate = searchData.checkInDate || new Date().toISOString().split('T')[0];
    const fallbackCheckOut = new Date(checkInDate);
    fallbackCheckOut.setDate(fallbackCheckOut.getDate() + 1);
    const checkOutDate = searchData.checkOutDate || fallbackCheckOut.toISOString().split('T')[0];

    const normalizedHotel = {
      ...hotel,
      location: {
        cityName: hotel.location,
        city: hotel.location
      },
      room: {
        typeEstimated: 'STANDARD_ROOM',
        sleeps: searchData.adults || 1
      },
      price: {
        perNight,
        total: perNight,
        originalCurrency: 'USD'
      }
    };

    return {
      hotel: normalizedHotel,
      searchParams: {
        cityCode: searchData.cityCode || hotel.location,
        checkInDate,
        checkOutDate,
        adults: searchData.adults || 1,
        roomQuantity: searchData.roomQuantity || 1
      },
      roomType: 'Standard Room',
      includeBreakfast: false,
      totalPrice: {
        perNight,
        total: perNight
      }
    };
  };

  return (
    <div className="hotels-page hotels-aof">
      <section className="hotels-hero">
        <div className="hotels-hero-inner">
          <span className="hotels-hero-badge">
            <BedDouble size={17} />
            Curated hotel finder
          </span>
          <h1>Compare Hotel Options</h1>
          <p>Review hotel availability, rates, and property details before booking</p>
          <div className="hotels-hero-stats">
            <span><strong>18</strong> featured stays</span>
            <span><strong>24/7</strong> booking support</span>
            <span><strong>Blue</strong> verified picks</span>
          </div>
        </div>
      </section>

      <div className="container hotels-content">
        {/* Hotel Search Box */}
        <div className="hotel-search-box">
          <div className="hotel-search-intro">
            <span>Hotel finder</span>
            <h2>Search stays by city, dates, guests, and rooms</h2>
          </div>
          <form onSubmit={handleSearch} className="hotel-search-form">
            <div className="search-fields-flex">
              <div className="search-field city-search-field">
                <label>
                  <MapPin size={18} />
                  <span>Destination City</span>
                </label>
                <input
                  type="text"
                  placeholder="Search city or code (e.g., New York, NYC)"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="city-dropdown">
                    {filteredCities.slice(0, 10).map((city) => (
                      <div
                        key={city.code}
                        className="city-option"
                        onClick={() => handleCitySelect(city.code)}
                      >
                        <div className="city-code">{city.code}</div>
                        <div className="city-info">
                          <div className="city-name">{city.city}</div>
                          <div className="city-country">{city.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="search-field">
                <label>
                  <Calendar size={18} />
                  <span>Check-in</span>
                </label>
                <input
                  type="date"
                  value={searchData.checkInDate}
                  onChange={(e) => setSearchData({ ...searchData, checkInDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="search-field">
                <label>
                  <Calendar size={18} />
                  <span>Check-out</span>
                </label>
                <input
                  type="date"
                  value={searchData.checkOutDate}
                  onChange={(e) => setSearchData({ ...searchData, checkOutDate: e.target.value })}
                  min={searchData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="search-field">
                <label>
                  <Users size={18} />
                  <span>Guests</span>
                </label>
                <select
                  value={searchData.adults}
                  onChange={(e) => setSearchData({ ...searchData, adults: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label>
                  <BedDouble size={18} />
                  <span>Rooms</span>
                </label>
                <select
                  value={searchData.roomQuantity}
                  onChange={(e) => setSearchData({ ...searchData, roomQuantity: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="hotel-search-btn">
                <Search size={20} />
                <span>Search Hotels</span>
              </button>
            </div>
          </form>
        </div>

        <div className="results-header hotels-results-header">
          <h2>Featured Hotels</h2>
          <select className="sort-select hotels-sort-select">
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating: High to Low</option>
          </select>
        </div>

        <div className="hotels-grid">
          {hotels.map(hotel => (
            <article key={hotel.id} className="hotel-showcase-card">
              <div className="hotel-showcase-media">
                <img src={hotel.image} alt={hotel.title} loading="lazy" />
                <span className="hotel-showcase-price">{hotel.price}</span>
              </div>
              <div className="hotel-showcase-body">
                <div className="hotel-showcase-meta">
                  <span>
                    <MapPin size={14} />
                    {hotel.location}
                  </span>
                  <span>
                    <Star size={14} fill="currentColor" />
                    {hotel.rating}
                  </span>
                </div>
                <h3>{hotel.title}</h3>
                <p>{hotel.description}</p>
                <div className="hotel-showcase-footer">
                  <span className="hotel-showcase-note">
                    <Sparkles size={14} />
                    Curated stay
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/hotel-booking', { state: buildBookingState(hotel) })}
                  >
                    View Stay <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hotels;
