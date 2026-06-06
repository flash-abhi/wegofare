import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Users, Plane, Hotel, Utensils, Sun, ChevronDown } from 'lucide-react';
import './PackageResults.css';

function PackageResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;
  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({
    maxPrice: 5000,
    minRating: 0,
    stars: 'all'
  });

  useEffect(() => {
    if (!searchParams) {
      navigate('/packages');
      return;
    }
    fetchPackages();
  }, [searchParams]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const queryParams = {
        destination: searchParams.destination,
        destinationCode: searchParams.destinationCode || searchParams.destination,
        departureCity: searchParams.departureCity,
        departureCityCode: searchParams.departureCityCode || searchParams.departureCity,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: searchParams.adults,
        children: searchParams.children,
        packageType: searchParams.packageType,
        flightClass: searchParams.flightClass || 'economy',
        rooms: searchParams.rooms || 1
      };

      const response = await fetch(`/api/packages/search?` + new URLSearchParams(queryParams));
      
      const data = await response.json();
      if (data.success) {
        setPackages(data.data);
        console.log(`Loaded ${data.data.length} packages from ${data.source || 'unknown'} source`);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    if (pkg.pricePerPerson > filters.maxPrice) return false;
    if (pkg.rating < filters.minRating) return false;
    if (filters.stars !== 'all' && pkg.hotelStars !== parseInt(filters.stars)) return false;
    return true;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerPerson - b.pricePerPerson;
      case 'price-high':
        return b.pricePerPerson - a.pricePerPerson;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const calculateNights = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) return 0;
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = (pkg) => {
    const totalGuests = parseInt(searchParams.adults) + parseInt(searchParams.children);
    return pkg.pricePerPerson * totalGuests;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Finding the perfect vacation packages for you...</p>
      </div>
    );
  }

  return (
    <div className="package-results-page">
      <div className="results-container">
        <div className="results-sidebar">
          <h3>Filter Packages</h3>
          
          <div className="filter-section">
            <h4>Price Range</h4>
            <input
              type="range"
              min="0"
              max="10000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
            />
            <span>${filters.maxPrice} per person</span>
          </div>

          <div className="filter-section">
            <h4>Minimum Rating</h4>
            <div className="rating-filter">
              {[0, 3, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  className={filters.minRating === rating ? 'active' : ''}
                  onClick={() => setFilters({ ...filters, minRating: rating })}
                >
                  {rating > 0 ? `${rating}+ ⭐` : 'Any'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Hotel Stars</h4>
            <select
              value={filters.stars}
              onChange={(e) => setFilters({ ...filters, stars: e.target.value })}
            >
              <option value="all">All Hotels</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="search-summary">
            <h4>Your Search</h4>
            <p><MapPin size={16} /> {searchParams.destination}</p>
            <p><Calendar size={16} /> {calculateNights()} nights</p>
            <p><Users size={16} /> {searchParams.adults} Adults, {searchParams.children} Children</p>
          </div>
        </div>

        <div className="results-main">
          <div className="results-header">
            <div>
              <h2>{sortedPackages.length} Packages Found</h2>
              <p>Showing all-inclusive vacation packages to {searchParams.destination}</p>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {sortedPackages.length === 0 ? (
            <div className="no-results">
              <p>No packages found matching your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="packages-list">
              {sortedPackages.map((pkg, index) => (
                <div key={index} className="package-card">
                  <div className="package-images">
                    <img src={pkg.images[0]} alt={pkg.hotelName} className="main-image" />
                    <div className="image-badges">
                      <span className="badge-inclusive">All-Inclusive</span>
                      {pkg.discount && <span className="badge-discount">Save {pkg.discount}%</span>}
                    </div>
                  </div>

                  <div className="package-details">
                    <div className="package-header">
                      <div>
                        <h3>{pkg.hotelName}</h3>
                        <p className="location">
                          <MapPin size={16} />
                          {pkg.location}
                        </p>
                        <div className="rating">
                          <Star size={16} fill="gold" color="gold" />
                          <span>{pkg.rating}</span>
                          <span className="reviews">({pkg.reviews} reviews)</span>
                          <span className="stars">{'⭐'.repeat(pkg.hotelStars)}</span>
                        </div>
                      </div>
                      <div className="package-price">
                        <span className="from">From</span>
                        <span className="price">${pkg.pricePerPerson}</span>
                        <span className="per">per person</span>
                        <div className="total-price">
                          Total: ${calculateTotalPrice(pkg)}
                        </div>
                      </div>
                    </div>

                    <div className="package-highlights">
                      <div className="highlight flight-highlight">
                        <Plane size={18} />
                        <div className="flight-info">
                          <strong>Outbound:</strong> {pkg.flightDetails?.outbound?.airlineCode}{pkg.flightDetails?.outbound?.flightNumber} • 
                          {pkg.flightDetails?.outbound?.departTime} - {pkg.flightDetails?.outbound?.arrivalTime} • 
                          {pkg.flightDetails?.outbound?.duration} • {pkg.flightDetails?.outbound?.stops === 0 ? 'Nonstop' : '1 Stop'}
                        </div>
                      </div>
                      <div className="highlight flight-highlight">
                        <Plane size={18} style={{ transform: 'scaleX(-1)' }} />
                        <div className="flight-info">
                          <strong>Return:</strong> {pkg.flightDetails?.return?.airlineCode}{pkg.flightDetails?.return?.flightNumber} • 
                          {pkg.flightDetails?.return?.departTime} - {pkg.flightDetails?.return?.arrivalTime} • 
                          {pkg.flightDetails?.return?.duration} • {pkg.flightDetails?.return?.stops === 0 ? 'Nonstop' : '1 Stop'}
                        </div>
                      </div>
                      <div className="highlight">
                        <Hotel size={18} />
                        <span>{calculateNights()} nights at {pkg.hotelStars}-star resort</span>
                      </div>
                      <div className="highlight">
                        <Utensils size={18} />
                        <span>All meals & drinks included</span>
                      </div>
                      <div className="highlight">
                        <Sun size={18} />
                        <span>{pkg.activities.length}+ activities</span>
                      </div>
                    </div>

                    <div className="package-actions">
                      <button
                        className="details-btn"
                        onClick={() => {
                          // Open package details in new tab
                          const detailsUrl = `/package-details?id=${pkg.packageId}`;
                          const packageData = {
                            package: pkg,
                            searchParams
                          };
                          // Store data in sessionStorage for the new tab to access
                          sessionStorage.setItem(`package_${pkg.packageId}`, JSON.stringify(packageData));
                          window.open(detailsUrl, '_blank');
                        }}
                      >
                        View Details <ChevronDown size={18} />
                      </button>
                      <button
                        className="book-btn"
                        onClick={() => navigate('/package-booking', {
                          state: {
                            package: pkg,
                            searchParams
                          }
                        })}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackageResults;
