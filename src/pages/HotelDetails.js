import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Wifi, Coffee, Dumbbell, Wine, 
  Car, Waves, Check, Calendar, BedDouble, Users,
  ArrowLeft, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import './HotelDetails.css';

function HotelDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hotelData, setHotelData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState('standard');
  const [includeBreakfast, setIncludeBreakfast] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const data = params.get('data');
    
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setHotelData(parsed);
      } catch (error) {
        console.error('Error parsing hotel data:', error);
      }
    }
  }, [location]);

  const amenityIcons = {
    'WIFI': <Wifi size={16} />,
    'RESTAURANT': <Coffee size={16} />,
    'FITNESS_CENTER': <Dumbbell size={16} />,
    'BAR': <Wine size={16} />,
    'PARKING': <Car size={16} />,
    'POOL': <Waves size={16} />
  };

  const getHotelImages = (hotel) => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', // Luxury bedroom
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80', // Bathroom
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80', // Hotel pool
      'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=1200&q=80', // Gym/fitness
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80', // Restaurant
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', // Lobby
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80'  // Hotel exterior
    ];
    
    if (hotel.media && hotel.media.length > 0) {
      return hotel.media.map(m => m.uri).filter(Boolean);
    }
    
    return defaultImages;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!hotelData) {
    return (
      <div className="hotel-details-page">
        <div className="loading-state">
          <p>Loading hotel details...</p>
        </div>
      </div>
    );
  }

  const { hotel, searchParams, nights } = hotelData;
  const hotelImages = getHotelImages(hotel);

  const roomTypes = [
    { id: 'standard', name: 'Standard Room', price: 0, description: '1 Queen Bed, City View' },
    { id: 'deluxe', name: 'Deluxe Room', price: 50, description: '1 King Bed, Premium Amenities' },
    { id: 'suite', name: 'Executive Suite', price: 120, description: '2 Rooms, Living Area, Ocean View' },
    { id: 'family', name: 'Family Room', price: 80, description: '2 Queen Beds, Extra Space' }
  ];

  const breakfastPrice = 25; // per night

  const calculateTotalPrice = () => {
    const basePrice = hotel.price.perNight;
    const roomUpgrade = roomTypes.find(r => r.id === selectedRoomType)?.price || 0;
    const breakfastCost = includeBreakfast ? breakfastPrice : 0;
    const pricePerNight = basePrice + roomUpgrade + breakfastCost;
    return {
      perNight: pricePerNight,
      total: pricePerNight * nights
    };
  };

  const totalPrice = calculateTotalPrice();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length);
  };

  return (
    <div className="hotel-details-page">
      <div className="details-header">
        <div className="container">
          <button className="back-button" onClick={() => window.close()}>
            <ArrowLeft size={20} />
            Close
          </button>
          <h1>{hotel.name}</h1>
          <div className="header-location">
            <MapPin size={16} />
            <span>{hotel.location.cityName || hotel.location.city}</span>
            {hotel.rating && hotel.rating > 0 && (
              <div className="header-rating">
                <Star size={16} fill="currentColor" />
                <span>{hotel.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="details-content">
          <div className="main-content">
            {/* Hotel Images Gallery */}
            <div className="hotel-images">
              <div className="main-image-container">
                <img 
                  src={hotelImages[currentImageIndex]} 
                  alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                  className="main-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';
                  }}
                />
                {hotelImages.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={prevImage}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="image-nav next" onClick={nextImage}>
                      <ChevronRight size={24} />
                    </button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {hotelImages.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {hotelImages.length > 1 && (
                <div className="thumbnail-gallery">
                  {hotelImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="details-section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {hotel.amenities?.map((amenity, idx) => (
                  <div key={idx} className="amenity-item">
                    {amenityIcons[amenity] || <Check size={16} />}
                    <span>{amenity.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Details */}
            <div className="details-section">
              <h2>Room Details</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Room Type:</span>
                  <span className="value">{hotel.room?.typeEstimated?.replace(/_/g, ' ') || 'Standard Room'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Bed Type:</span>
                  <span className="value">{hotel.room?.bedType || 1} Bed(s)</span>
                </div>
                <div className="info-item">
                  <span className="label">Capacity:</span>
                  <span className="value">{hotel.room?.sleeps || searchParams.adults} Guest(s)</span>
                </div>
                {hotel.room?.type && (
                  <div className="info-item">
                    <span className="label">Room Code:</span>
                    <span className="value">{hotel.room.type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Check-in & Check-out */}
            <div className="details-section">
              <h2>Check-in & Check-out</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Check-in Date:</span>
                  <span className="value">{formatDate(searchParams.checkInDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Check-out Date:</span>
                  <span className="value">{formatDate(searchParams.checkOutDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Check-in Time:</span>
                  <span className="value">{hotel.policies?.checkInTime || '15:00'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Check-out Time:</span>
                  <span className="value">{hotel.policies?.checkOutTime || '11:00'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Duration:</span>
                  <span className="value">{nights} Night{nights > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="details-section">
              <h2>Hotel Policies</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Payment Type:</span>
                  <span className="value">{hotel.policies?.paymentType?.replace(/_/g, ' ').toUpperCase() || 'CREDIT CARD'}</span>
                </div>
                <div className="info-item full-width">
                  <span className="label">Cancellation Policy:</span>
                  <span className="value">{hotel.policies?.cancellation || 'Please check with hotel for cancellation policy'}</span>
                </div>
                {hotel.policies?.guarantee && (
                  <div className="info-item full-width">
                    <span className="label">Guarantee Policy:</span>
                    <span className="value">{hotel.policies.guarantee}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="details-section">
              <h2>Location</h2>
              <div className="info-grid">
                {hotel.location.address && (
                  <div className="info-item full-width">
                    <span className="label">Address:</span>
                    <span className="value">{hotel.location.address}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">City:</span>
                  <span className="value">{hotel.location.cityName || hotel.location.city}</span>
                </div>
                {hotel.location.countryCode && (
                  <div className="info-item">
                    <span className="label">Country:</span>
                    <span className="value">{hotel.location.countryCode}</span>
                  </div>
                )}
                {hotel.distance && (
                  <div className="info-item">
                    <span className="label">Distance from Center:</span>
                    <span className="value">{hotel.distance.value} {hotel.distance.unit}</span>
                  </div>
                )}
                {hotel.location.coordinates && (
                  <div className="info-item">
                    <span className="label">Coordinates:</span>
                    <span className="value">{hotel.location.coordinates.lat.toFixed(4)}, {hotel.location.coordinates.lng.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="booking-sidebar">
            {/* Room Selection */}
            <div className="price-card">
              <h3>Select Room Type</h3>
              <div className="room-options">
                {roomTypes.map((room) => (
                  <div 
                    key={room.id}
                    className={`room-option ${selectedRoomType === room.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRoomType(room.id)}
                  >
                    <div className="room-header">
                      <BedDouble size={18} />
                      <div className="room-info">
                        <div className="room-name">{room.name}</div>
                        <div className="room-description">{room.description}</div>
                      </div>
                    </div>
                    <div className="room-price">
                      {room.price > 0 ? `+$${room.price}` : 'Included'}
                    </div>
                    <div className="room-radio">
                      {selectedRoomType === room.id && <Check size={18} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakfast Option */}
            <div className="price-card">
              <h3>Additional Options</h3>
              <div 
                className={`breakfast-option ${includeBreakfast ? 'selected' : ''}`}
                onClick={() => setIncludeBreakfast(!includeBreakfast)}
              >
                <div className="option-header">
                  <Coffee size={20} />
                  <div className="option-info">
                    <div className="option-name">Breakfast Included</div>
                    <div className="option-description">Continental breakfast for {searchParams.adults} guest{searchParams.adults > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="option-price">
                  +${breakfastPrice}/night
                </div>
                <div className="option-checkbox">
                  <input 
                    type="checkbox" 
                    checked={includeBreakfast}
                    onChange={(e) => setIncludeBreakfast(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="price-card">
              <h3>Price Summary</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Price (per night):</span>
                  <span className="amount">${hotel.price.perNight.toFixed(2)}</span>
                </div>
                {roomTypes.find(r => r.id === selectedRoomType)?.price > 0 && (
                  <div className="price-row upgrade">
                    <span>Room Upgrade:</span>
                    <span className="amount">+${roomTypes.find(r => r.id === selectedRoomType)?.price.toFixed(2)}</span>
                  </div>
                )}
                {includeBreakfast && (
                  <div className="price-row upgrade">
                    <span>Breakfast:</span>
                    <span className="amount">+${breakfastPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Number of Nights:</span>
                  <span>{nights}</span>
                </div>
                <div className="price-row">
                  <span>Number of Rooms:</span>
                  <span>{searchParams.roomQuantity}</span>
                </div>
                <div className="price-row">
                  <span>Guests:</span>
                  <span>{searchParams.adults} Adult{searchParams.adults > 1 ? 's' : ''}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-row subtotal">
                  <span>Price per Night:</span>
                  <span className="amount">${totalPrice.perNight.toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total Price:</span>
                  <span className="amount">${totalPrice.total.toFixed(2)}</span>
                </div>
                {hotel.price.originalCurrency !== 'USD' && (
                  <div className="price-note">
                    Converted from {hotel.price.originalCurrency}
                  </div>
                )}
              </div>
              <button
                className="book-now-btn"
                onClick={() => navigate('/hotel-booking', {
                  state: {
                    hotel,
                    searchParams,
                    roomType: roomTypes.find((r) => r.id === selectedRoomType)?.name || 'Standard Room',
                    includeBreakfast,
                    totalPrice
                  }
                })}
              >
                Book Now
              </button>
            </div>

            <div className="hd-info-card">
              <h4>Good to Know</h4>
              <ul className="info-list">
                <li><Check size={16} /> Free cancellation available</li>
                <li><Check size={16} /> No prepayment needed</li>
                <li><Check size={16} /> Reserve now, pay later</li>
                <li><Check size={16} /> Best price guaranteed</li>
              </ul>
            </div>

            {hotel.chainCode && (
              <div className="hd-info-card">
                <h4>Hotel Information</h4>
                <div className="hotel-codes">
                  <div className="code-item">
                    <span className="code-label">Hotel ID:</span>
                    <span className="code-value">{hotel.hotelId}</span>
                  </div>
                  <div className="code-item">
                    <span className="code-label">Chain Code:</span>
                    <span className="code-value">{hotel.chainCode}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
