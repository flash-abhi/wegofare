import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plane, Clock, Filter, ChevronDown, ChevronUp, ArrowRight, Loader2, 
  AlertCircle, CheckCircle2, X, Briefcase, ShoppingBag, Wifi,
  Zap, Calendar, Users, ArrowLeftRight, Info, Star, TrendingDown,
  BarChart3, Check, Luggage, MapPin, Search, Edit3, RotateCcw, Phone, Headphones
} from 'lucide-react';
import { API_URL } from '../config/api';
import { useContact } from '../context/ContactContext';
import './FlightResults.css';

// Expandable Flight Card Component with fare breakdown
const FlightCard = memo(({ 
  flight, 
  isSelected,
  isComparing,
  onSelect,
  onCompare,
  onExpand,
  isExpanded,
  getDisplayTime, 
  getAirportCode, 
  formatDuration, 
  getStopsText,
  API_URL 
}) => {
  const stops = flight.stops || 0;
  const segments = flight.segments || [];
  const [selectedFareIndex, setSelectedFareIndex] = useState(null);
  
  // Generate comprehensive fare classes
  const fareClasses = flight.fareClasses || [
    { 
      name: 'Basic Economy', 
      code: 'BASIC',
      price: flight.price, 
      carryOn: false,
      bags: 0, 
      seatSelection: false,
      seatType: 'Assigned at gate',
      changeable: false, 
      changeableFee: null,
      refundable: false,
      priority: false,
      miles: 'Standard',
      wifi: false,
      meals: false,
      lounge: false,
      upgradeable: false
    },
    { 
      name: 'Economy', 
      code: 'ECONOMY',
      price: Math.round(flight.price * 1.15), 
      carryOn: true,
      bags: 1, 
      seatSelection: true,
      seatType: 'Standard seat',
      changeable: true, 
      changeableFee: '$99',
      refundable: false,
      priority: false,
      miles: 'Standard',
      wifi: false,
      meals: false,
      lounge: false,
      upgradeable: true
    },
    { 
      name: 'Premium Economy', 
      code: 'PREMIUM',
      price: Math.round(flight.price * 1.65), 
      carryOn: true,
      bags: 2, 
      seatSelection: true,
      seatType: 'Extra legroom',
      changeable: true, 
      changeableFee: 'Free',
      refundable: true,
      priority: true,
      miles: '50% bonus',
      wifi: true,
      meals: true,
      lounge: false,
      upgradeable: true
    },
    { 
      name: 'Business', 
      code: 'BUSINESS',
      price: Math.round(flight.price * 2.8), 
      carryOn: true,
      bags: 2, 
      seatSelection: true,
      seatType: 'Lie-flat seat',
      changeable: true, 
      changeableFee: 'Free',
      refundable: true,
      priority: true,
      miles: '100% bonus',
      wifi: true,
      meals: true,
      lounge: true,
      upgradeable: true
    },
    { 
      name: 'First Class', 
      code: 'FIRST',
      price: Math.round(flight.price * 4.5), 
      carryOn: true,
      bags: 3, 
      seatSelection: true,
      seatType: 'Private suite',
      changeable: true, 
      changeableFee: 'Free',
      refundable: true,
      priority: true,
      miles: '150% bonus',
      wifi: true,
      meals: true,
      lounge: true,
      upgradeable: false
    }
  ];

  const selectedFare = selectedFareIndex !== null ? fareClasses[selectedFareIndex] : null;

  const handleFareSelect = (index) => {
    setSelectedFareIndex(index);
  };

  const handleConfirmSelection = () => {
    if (selectedFare) {
      onSelect({ ...flight, selectedFare, price: selectedFare.price });
    }
  };

  return (
    <div className={`flight-card ${isSelected ? 'selected' : ''} ${isComparing ? 'comparing' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* Main Flight Info */}
      <div className="flight-card-main" onClick={() => onExpand(flight)}>
        {/* Airline Info */}
        <div className="airline-section">
          <div className="airline-logo">
            <img 
              src={flight.airlineLogo || `${API_URL}/airlines/${flight.airline || 'default'}.png`}
              alt={flight.airlineName || flight.airline}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${API_URL}/airlines/default.png`;
              }}
            />
          </div>
          <div className="airline-details">
            <span className="airline-name">{flight.airlineName || flight.airline}</span>
            <span className="flight-number">{flight.flightNumber}</span>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="flight-timeline">
          <div className="time-point departure">
            <span className="time">{getDisplayTime(flight.departure) || flight.departureTime}</span>
            <span className="airport-code">{getAirportCode(flight.from)}</span>
          </div>
          
          <div className="timeline-connector">
            <span className="duration">{formatDuration(flight.duration)}</span>
            <div className="connector-line">
              <div className="line"></div>
              {stops > 0 && (
                <div className="stops-dots">
                  {[...Array(Math.min(stops, 2))].map((_, i) => (
                    <div key={i} className="stop-dot"></div>
                  ))}
                </div>
              )}
              <Plane className="plane-icon" size={16} />
            </div>
            <span className={`stops-text ${stops === 0 ? 'nonstop' : ''}`}>
              {getStopsText(stops)}
            </span>
          </div>
          
          <div className="time-point arrival">
            <span className="time">
              {getDisplayTime(flight.arrival) || flight.arrivalTime}
              {flight.arrivalNextDay && <sup className="next-day">+1</sup>}
            </span>
            <span className="airport-code">{getAirportCode(flight.to)}</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flight-actions">
          <div className="price-block">
            <span className="price-from">from</span>
            <span className="price">${flight.price}</span>
            <span className="price-label">per person</span>
          </div>
          
          <div className="action-buttons">
            <button 
              className={`compare-btn ${isComparing ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onCompare(flight); }}
              title="Add to compare"
            >
              <BarChart3 size={16} />
            </button>
            <button 
              className="view-fares-btn"
              onClick={(e) => { e.stopPropagation(); onExpand(flight); }}
            >
              View Fares
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Expand Arrow */}
        <button className="expand-toggle" onClick={(e) => { e.stopPropagation(); onExpand(flight); }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Quick Info Tags */}
      <div className="flight-tags">
        {flight.cabinClass && (
          <span className="tag cabin">{flight.cabinClass}</span>
        )}
        {flight.aircraft && (
          <span className="tag aircraft">{flight.aircraft}</span>
        )}
        {stops === 0 && (
          <span className="tag nonstop">
            <Zap size={12} /> Nonstop
          </span>
        )}
        {flight.wifi && (
          <span className="tag amenity">
            <Wifi size={12} /> WiFi
          </span>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="flight-details-expanded">
          {/* Enhanced Fare Selection */}
          <div className="fare-selection-section">
            <div className="fare-selection-header">
              <h4>Choose your fare</h4>
              <p className="fare-selection-subtitle">Select a fare class to see what's included</p>
            </div>
            
            {/* Fare Comparison Table */}
            <div className="fare-comparison-container">
              <div className="fare-cards-scroll">
                {fareClasses.map((fare, idx) => (
                  <div 
                    key={idx} 
                    className={`fare-card-enhanced ${idx === 1 ? 'popular' : ''} ${idx === 3 ? 'premium' : ''} ${idx === 4 ? 'luxury' : ''} ${selectedFareIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleFareSelect(idx)}
                  >
                    {idx === 1 && <div className="fare-badge popular-badge">Most Popular</div>}
                    {idx === 2 && <div className="fare-badge value-badge">Best Value</div>}
                    {idx === 3 && <div className="fare-badge business-badge">Recommended</div>}
                    
                    <div className="fare-card-header">
                      <h5 className="fare-name">{fare.name}</h5>
                      <div className="fare-price-section">
                        <span className="fare-price">${fare.price}</span>
                        <span className="fare-price-label">per person</span>
                      </div>
                    </div>
                    
                    <div className="fare-features-grid">
                      {/* Bags */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <ShoppingBag size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Carry-on</span>
                          <span className={`feature-value ${fare.carryOn ? 'included' : 'not-included'}`}>
                            {fare.carryOn ? <><Check size={14} /> Included</> : <><X size={14} /> Not included</>}
                          </span>
                        </div>
                      </div>
                      
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <Luggage size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Checked bags</span>
                          <span className={`feature-value ${fare.bags > 0 ? 'included' : 'not-included'}`}>
                            {fare.bags > 0 ? <><Check size={14} /> {fare.bags} bag{fare.bags > 1 ? 's' : ''}</> : <><X size={14} /> None</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Seat */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <Users size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Seat selection</span>
                          <span className={`feature-value ${fare.seatSelection ? 'included' : 'not-included'}`}>
                            {fare.seatSelection ? <><Check size={14} /> {fare.seatType}</> : <><X size={14} /> {fare.seatType}</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Changes */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <ArrowLeftRight size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Flight changes</span>
                          <span className={`feature-value ${fare.changeable ? 'included' : 'not-included'}`}>
                            {fare.changeable ? <><Check size={14} /> {fare.changeableFee} fee</> : <><X size={14} /> Not allowed</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Refund */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Refundable</span>
                          <span className={`feature-value ${fare.refundable ? 'included' : 'not-included'}`}>
                            {fare.refundable ? <><Check size={14} /> Yes</> : <><X size={14} /> No</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Priority */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <Zap size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Priority boarding</span>
                          <span className={`feature-value ${fare.priority ? 'included' : 'not-included'}`}>
                            {fare.priority ? <><Check size={14} /> Included</> : <><X size={14} /> No</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* WiFi */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <Wifi size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">WiFi</span>
                          <span className={`feature-value ${fare.wifi ? 'included' : 'not-included'}`}>
                            {fare.wifi ? <><Check size={14} /> Free</> : <><X size={14} /> Purchase</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Meals */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <Briefcase size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Meals</span>
                          <span className={`feature-value ${fare.meals ? 'included' : 'not-included'}`}>
                            {fare.meals ? <><Check size={14} /> Included</> : <><X size={14} /> Purchase</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lounge */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <Star size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Lounge access</span>
                          <span className={`feature-value ${fare.lounge ? 'included' : 'not-included'}`}>
                            {fare.lounge ? <><Check size={14} /> Included</> : <><X size={14} /> No</>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Miles */}
                      <div className="fare-feature">
                        <div className="feature-icon">
                          <TrendingDown size={18} />
                        </div>
                        <div className="feature-details">
                          <span className="feature-label">Miles earned</span>
                          <span className="feature-value included">
                            <Check size={14} /> {fare.miles}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="fare-select-action">
                      {selectedFareIndex === idx ? (
                        <div className="fare-selected-indicator">
                          <CheckCircle2 size={20} />
                          <span>Selected</span>
                        </div>
                      ) : (
                        <button className="fare-choose-btn">
                          Select this fare
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Confirm Selection Bar */}
            {selectedFare && (
              <div className="fare-confirm-bar">
                <div className="confirm-summary">
                  <div className="confirm-fare-info">
                    <span className="confirm-fare-name">{selectedFare.name}</span>
                    <span className="confirm-flight-info">{flight.airlineName} • {getDisplayTime(flight.departure)} - {getDisplayTime(flight.arrival)}</span>
                  </div>
                  <div className="confirm-price">
                    <span className="confirm-price-value">${selectedFare.price}</span>
                    <span className="confirm-price-label">per person</span>
                  </div>
                </div>
                <button className="confirm-select-btn" onClick={handleConfirmSelection}>
                  <CheckCircle2 size={20} />
                  Select This Flight
                </button>
              </div>
            )}
          </div>

          {/* Flight Segments */}
          {segments.length > 0 && (
            <div className="flight-segments">
              <h4>Flight details</h4>
              {segments.map((segment, idx) => (
                <div key={idx} className="segment">
                  <div className="segment-header">
                    <img 
                      src={`${API_URL}/airlines/${segment.carrierCode || flight.airline || 'default'}.png`}
                      alt="" 
                      className="segment-airline-logo"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="segment-flight">{segment.flightNumber}</span>
                    <span className="segment-aircraft">{segment.aircraft || flight.aircraft || 'Aircraft TBD'}</span>
                  </div>
                  <div className="segment-timeline">
                    <div className="segment-point">
                      <span className="segment-time">{segment.departureTime || getDisplayTime(segment.departure)}</span>
                      <span className="segment-airport">{segment.from?.code || segment.from}</span>
                      <span className="segment-city">{segment.from?.city || ''}</span>
                    </div>
                    <div className="segment-duration">
                      <div className="duration-line-simple"></div>
                      <span>{segment.duration || formatDuration(segment.flightDuration)}</span>
                    </div>
                    <div className="segment-point">
                      <span className="segment-time">{segment.arrivalTime || getDisplayTime(segment.arrival)}</span>
                      <span className="segment-airport">{segment.to?.code || segment.to}</span>
                      <span className="segment-city">{segment.to?.city || ''}</span>
                    </div>
                  </div>
                  {idx < segments.length - 1 && (
                    <div className="layover-info">
                      <Clock size={14} />
                      <span>Layover in {segments[idx + 1]?.from?.city || segments[idx + 1]?.from?.code || ''}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Baggage Info */}
          <div className="baggage-info">
            <h4>Baggage</h4>
            <div className="baggage-items">
              <div className="baggage-item">
                <Briefcase size={20} />
                <div>
                  <span className="baggage-type">Personal item</span>
                  <span className="baggage-detail">Fits under seat</span>
                </div>
                <span className="baggage-status included">Included</span>
              </div>
              <div className="baggage-item">
                <ShoppingBag size={20} />
                <div>
                  <span className="baggage-type">Carry-on bag</span>
                  <span className="baggage-detail">Max 22 x 14 x 9 in</span>
                </div>
                <span className="baggage-status included">Included</span>
              </div>
              <div className="baggage-item">
                <Luggage size={20} />
                <div>
                  <span className="baggage-type">Checked bag</span>
                  <span className="baggage-detail">Max 50 lbs</span>
                </div>
                <span className="baggage-status extra">From $35</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FlightCard.displayName = 'FlightCard';

// Skeleton Loader
const FlightCardSkeleton = memo(() => (
  <div className="flight-card skeleton">
    <div className="flight-card-main">
      <div className="airline-section">
        <div className="skeleton-box skeleton-logo"></div>
        <div className="airline-details">
          <div className="skeleton-box skeleton-text-lg"></div>
          <div className="skeleton-box skeleton-text-sm"></div>
        </div>
      </div>
      <div className="flight-timeline skeleton-timeline">
        <div className="skeleton-box skeleton-time"></div>
        <div className="skeleton-box skeleton-connector"></div>
        <div className="skeleton-box skeleton-time"></div>
      </div>
      <div className="flight-actions">
        <div className="skeleton-box skeleton-price"></div>
        <div className="skeleton-box skeleton-btn"></div>
      </div>
    </div>
  </div>
));

FlightCardSkeleton.displayName = 'FlightCardSkeleton';

// Comparison Panel
const ComparisonPanel = memo(({ flights, onRemove, onClear, onSelect, onCompareNow, getDisplayTime, formatDuration }) => {
  if (flights.length === 0) return null;

  return (
    <div className="comparison-panel">
      <div className="comparison-header">
        <h3><BarChart3 size={18} /> Compare ({flights.length}/3)</h3>
        <div className="comparison-actions">
          {flights.length >= 2 && (
            <button className="compare-now-btn" onClick={onCompareNow}>
              <BarChart3 size={16} />
              Compare Now
            </button>
          )}
          <button className="clear-compare" onClick={onClear}>Clear</button>
        </div>
      </div>
      <div className="comparison-grid">
        {flights.map((flight, idx) => (
          <div key={flight._id || idx} className="comparison-card">
            <button className="remove-compare" onClick={() => onRemove(flight)}>
              <X size={14} />
            </button>
            <div className="compare-airline">{flight.airlineName || flight.airline}</div>
            <div className="compare-times">
              {getDisplayTime(flight.departure) || flight.departureTime} → {getDisplayTime(flight.arrival) || flight.arrivalTime}
            </div>
            <div className="compare-duration">{formatDuration(flight.duration)}</div>
            <div className="compare-price">${flight.price}</div>
            <button className="compare-select" onClick={() => onSelect(flight)}>Select</button>
          </div>
        ))}
      </div>
    </div>
  );
});

ComparisonPanel.displayName = 'ComparisonPanel';

// Compare Modal
const CompareModal = memo(({ flights, onClose, onSelect, getDisplayTime, formatDuration }) => {
  if (!flights || flights.length < 2) return null;

  const features = [
    { key: 'airline', label: 'Airline', getValue: (f) => f.airlineName || f.airline },
    { key: 'route', label: 'Route', getValue: (f) => `${f.origin || f.from} → ${f.destination || f.to}` },
    { key: 'departure', label: 'Departure', getValue: (f) => getDisplayTime(f.departure) || f.departureTime },
    { key: 'arrival', label: 'Arrival', getValue: (f) => getDisplayTime(f.arrival) || f.arrivalTime },
    { key: 'duration', label: 'Duration', getValue: (f) => formatDuration(f.duration) },
    { key: 'stops', label: 'Stops', getValue: (f) => f.stops === 0 ? 'Nonstop' : `${f.stops} stop${f.stops > 1 ? 's' : ''}` },
    { key: 'aircraft', label: 'Aircraft', getValue: (f) => f.aircraft || 'Standard' },
    { key: 'baggage', label: 'Baggage', getValue: (f) => f.baggage || 'Carry-on included' },
    { key: 'price', label: 'Price', getValue: (f) => `$${f.price}`, isPrice: true },
  ];

  const lowestPrice = Math.min(...flights.map(f => f.price));

  return (
    <div className="compare-modal-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <h2><BarChart3 size={22} /> Flight Comparison</h2>
          <button className="close-modal" onClick={onClose}><X size={24} /></button>
        </div>
        <div className="compare-modal-body">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="feature-col">Features</th>
                {flights.map((flight, idx) => (
                  <th key={flight._id || idx} className="flight-col">
                    <div className="compare-flight-header">
                      <span className="flight-num">Flight {idx + 1}</span>
                      {flight.price === lowestPrice && <span className="best-price-tag">Best Price</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map(feature => (
                <tr key={feature.key} className={feature.isPrice ? 'price-row' : ''}>
                  <td className="feature-label">{feature.label}</td>
                  {flights.map((flight, idx) => (
                    <td key={idx} className={`feature-value ${feature.isPrice && flight.price === lowestPrice ? 'best-value' : ''}`}>
                      {feature.getValue(flight)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="compare-modal-footer">
          {flights.map((flight, idx) => (
            <button 
              key={flight._id || idx}
              className={`select-flight-btn ${flight.price === lowestPrice ? 'recommended' : ''}`}
              onClick={() => { onSelect(flight); onClose(); }}
            >
              Select Flight {idx + 1} - ${flight.price}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

CompareModal.displayName = 'CompareModal';

// Date Flexibility
const DateFlexibility = memo(({ selectedDate, onDateChange }) => {
  const dates = useMemo(() => {
    const result = [];
    const baseDate = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      result.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        price: Math.round(80 + Math.random() * 150),
        isSelected: i === 0
      });
    }
    return result;
  }, [selectedDate]);

  const cheapestPrice = Math.min(...dates.map(d => d.price));

  return (
    <div className="date-flexibility">
      <div className="flex-header">
        <Calendar size={16} />
        <span>Flexible dates</span>
      </div>
      <div className="date-options">
        {dates.map((d, idx) => (
          <button 
            key={idx}
            className={`date-option ${d.isSelected ? 'selected' : ''} ${d.price === cheapestPrice ? 'cheapest' : ''}`}
            onClick={() => !d.isSelected && onDateChange(d.date)}
          >
            <span className="date-day">{d.dayName}</span>
            <span className="date-num">{d.month} {d.dayNum}</span>
            <span className="date-price">
              ${d.price}
              {d.price === cheapestPrice && <TrendingDown size={10} />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

DateFlexibility.displayName = 'DateFlexibility';

// Main Component
function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const flightListRef = useRef(null);
  const { contactSettings } = useContact();
  
  // Parse search params
  const urlParams = new URLSearchParams(location.search);
  const stateData = location.state?.searchParams || location.state;
  
  console.log('=== FlightResults Mount ===');
  console.log('location:', location);
  console.log('location.state:', location.state);
  console.log('stateData (extracted):', stateData);
  console.log('location.search:', location.search);
  console.log('urlParams:', Object.fromEntries(urlParams));
  
  const searchParams = useMemo(() => {
    // Normalize tripType (handle 'round-trip' vs 'roundtrip')
    const normalizeTripType = (type) => {
      if (!type) return 'oneway';
      const normalized = type.toLowerCase().replace('-', '');
      return normalized === 'roundtrip' ? 'roundtrip' : 'oneway';
    };
    
    // Calculate total passengers
    const calcTotal = (pax) => {
      if (!pax) return 1;
      if (pax.total) return pax.total;
      return (pax.adults || 1) + (pax.children || 0) + (pax.infants || 0);
    };

    if (stateData) {
      const passengers = stateData.passengers || { adults: 1, children: 0, infants: 0 };
      return {
        from: stateData.from || '',
        to: stateData.to || '',
        departDate: stateData.date || stateData.departDate || '',
        returnDate: stateData.returnDate || '',
        tripType: normalizeTripType(stateData.tripType),
        cabinClass: stateData.cabinClass || 'economy',
        passengers: { ...passengers, total: calcTotal(passengers) },
        directFlights: stateData.directFlights || false
      };
    }
    
    const passengers = {
      adults: parseInt(urlParams.get('adults')) || 1,
      children: parseInt(urlParams.get('children')) || 0,
      infants: parseInt(urlParams.get('infants')) || 0
    };
    
    return {
      from: urlParams.get('from') || '',
      to: urlParams.get('to') || '',
      departDate: urlParams.get('departDate') || urlParams.get('date') || '',
      returnDate: urlParams.get('returnDate') || '',
      tripType: normalizeTripType(urlParams.get('tripType')),
      cabinClass: urlParams.get('cabinClass') || 'economy',
      passengers: { ...passengers, total: calcTotal(passengers) },
      directFlights: urlParams.get('directFlights') === 'true'
    };
  }, [stateData, location.search]);
  
  // State
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectionStep, setSelectionStep] = useState('outbound');
  
  const [compareFlights, setCompareFlights] = useState([]);
  const [expandedFlight, setExpandedFlight] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stops: [],
    airlines: [],
    priceRange: [0, 10000]
  });
  
  const [sortBy, setSortBy] = useState('best');
  const [priceFilterValue, setPriceFilterValue] = useState(10000);
  const [expandedFilters, setExpandedFilters] = useState({
    stops: true,
    airlines: true,
    price: true
  });

  const [currentPage, setCurrentPage] = useState(1);
  const FLIGHTS_PER_PAGE = 10;
  
  // Modification state - initialize empty, will sync with useEffect
  const [showModifyPanel, setShowModifyPanel] = useState(false);
  const [modifyForm, setModifyForm] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    tripType: 'oneway',
    cabinClass: 'economy',
    passengers: 1
  });

  // Sync modifyForm with searchParams when they change
  useEffect(() => {
    setModifyForm({
      from: searchParams.from || '',
      to: searchParams.to || '',
      departDate: searchParams.departDate || '',
      returnDate: searchParams.returnDate || '',
      tripType: searchParams.tripType || 'oneway',
      cabinClass: searchParams.cabinClass || 'economy',
      passengers: searchParams.passengers?.total || 1
    });
  }, [searchParams]);

  const isRoundTrip = searchParams.tripType === 'roundtrip';

  // Debounce price filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, priceRange: [0, priceFilterValue] }));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [priceFilterValue]);

  // Fetch flights
  const fetchFlights = useCallback(async (date = null) => {
    console.log('FlightResults received searchParams:', searchParams);
    console.log('searchParams.from:', searchParams.from);
    console.log('searchParams.to:', searchParams.to);
    console.log('searchParams.departDate:', searchParams.departDate);
    
    if (!searchParams.from || !searchParams.to || (!searchParams.departDate && !date)) {
      console.error('Missing parameters - from:', searchParams.from, 'to:', searchParams.to, 'departDate:', searchParams.departDate);
      setError('Missing search parameters. Please search from the home page.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const outboundParams = new URLSearchParams({
        from: searchParams.from,
        to: searchParams.to,
        date: date || searchParams.departDate,
        tripType: searchParams.tripType || 'oneway',
        passengers: searchParams.passengers?.total || 1,
        cabinClass: searchParams.cabinClass || 'economy'
      });
      
      const outboundRes = await fetch(`${API_URL}/api/flights?${outboundParams}`);
      const outboundData = await outboundRes.json();
      
      if (outboundData.success) {
        setOutboundFlights(outboundData.data || []);
        setNote(outboundData.note || outboundData.amadeusNote || '');
        
        const maxPrice = Math.max(...(outboundData.data || []).map(f => f.price), 1000);
        setPriceFilterValue(maxPrice);
        setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
      } else {
        throw new Error(outboundData.message || 'Failed to fetch flights');
      }
      
      if (isRoundTrip && searchParams.returnDate) {
        const returnParams = new URLSearchParams({
          from: searchParams.to || '',
          to: searchParams.from || '',
          date: searchParams.returnDate || '',
          tripType: 'oneway',
          passengers: searchParams.passengers?.total || 1,
          cabinClass: searchParams.cabinClass || 'economy'
        });
        
        const returnRes = await fetch(`${API_URL}/api/flights?${returnParams}`);
        const returnData = await returnRes.json();
        
        if (returnData.success) {
          setReturnFlights(returnData.data || []);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams, isRoundTrip]);

  useEffect(() => {
    fetchFlights();
  }, []);

  // Filter options
  const filterOptions = useMemo(() => {
    const flights = selectionStep === 'outbound' ? outboundFlights : returnFlights;
    const airlines = [...new Set(flights.map(f => f.airlineName || f.airline))].filter(Boolean);
    const maxPrice = Math.max(...flights.map(f => f.price), 1000);
    return { airlines, maxPrice };
  }, [outboundFlights, returnFlights, selectionStep]);

  // Filtered flights
  const filteredFlights = useMemo(() => {
    let flights = selectionStep === 'outbound' ? [...outboundFlights] : [...returnFlights];
    
    if (filters.stops.length > 0) {
      flights = flights.filter(f => {
        const stops = f.stops || 0;
        if (filters.stops.includes('nonstop') && stops === 0) return true;
        if (filters.stops.includes('1stop') && stops === 1) return true;
        if (filters.stops.includes('2+stops') && stops >= 2) return true;
        return false;
      });
    }
    
    if (filters.airlines.length > 0) {
      flights = flights.filter(f => filters.airlines.includes(f.airlineName || f.airline));
    }
    
    flights = flights.filter(f => f.price >= filters.priceRange[0] && f.price <= filters.priceRange[1]);
    
    const parseDuration = (duration) => {
      if (!duration) return Infinity;
      const match = duration.match(/(\d+)h\s*(\d+)?m?/);
      return match ? parseInt(match[1]) * 60 + (parseInt(match[2]) || 0) : Infinity;
    };

    flights.sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'duration': return parseDuration(a.duration) - parseDuration(b.duration);
        case 'departure': return (a.departureTime || '').localeCompare(b.departureTime || '');
        case 'best':
        default:
          const scoreA = a.price * 0.7 + parseDuration(a.duration) * 0.3;
          const scoreB = b.price * 0.7 + parseDuration(b.duration) * 0.3;
          return scoreA - scoreB;
      }
    });
    
    return flights;
  }, [outboundFlights, returnFlights, filters, sortBy, selectionStep]);

  const totalPages = Math.ceil(filteredFlights.length / FLIGHTS_PER_PAGE);
  const visibleFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * FLIGHTS_PER_PAGE;
    return filteredFlights.slice(startIndex, startIndex + FLIGHTS_PER_PAGE);
  }, [filteredFlights, currentPage, FLIGHTS_PER_PAGE]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Helpers
  const formatDuration = useCallback((duration) => duration || 'N/A', []);
  const getStopsText = useCallback((stops) => {
    if (stops === 0) return 'Nonstop';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  }, []);

  const getAirportCode = useCallback((location) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    return location.code || location.city || '';
  }, []);

  const getDisplayTime = useCallback((timeData) => {
    if (!timeData) return '';
    if (typeof timeData === 'string') return timeData;
    return timeData.time || '';
  }, []);

  const toggleFilter = useCallback((category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ stops: [], airlines: [], priceRange: [0, filterOptions.maxPrice] });
    setPriceFilterValue(filterOptions.maxPrice);
  }, [filterOptions.maxPrice]);

  const handleFlightSelect = useCallback((flight) => {
    if (selectionStep === 'outbound') {
      setSelectedOutbound(flight);
      if (isRoundTrip) {
        setSelectionStep('return');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // For one-way, just select and show the booking bar - don't navigate immediately
        // User will click "Book Now" in the bottom bar to proceed
      }
    } else {
      // For return flight, just select it and stay on page
      // User will click "Book Now" in the bottom bar to proceed
      setSelectedReturn(flight);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [selectionStep, isRoundTrip]);

  const handleCompare = useCallback((flight) => {
    setCompareFlights(prev => {
      const isIn = prev.some(f => (f._id || f.id) === (flight._id || flight.id));
      if (isIn) return prev.filter(f => (f._id || f.id) !== (flight._id || flight.id));
      if (prev.length >= 3) return prev;
      return [...prev, flight];
    });
  }, []);

  const handleExpand = useCallback((flight) => {
    setExpandedFlight(prev => (prev?._id || prev?.id) === (flight._id || flight.id) ? null : flight);
  }, []);

  const goBackToOutbound = useCallback(() => {
    setSelectionStep('outbound');
    setSelectedReturn(null);
  }, []);

  const handleDateChange = useCallback((newDate) => {
    fetchFlights(newDate);
  }, [fetchFlights]);

  // Handle search modification
  const handleModifySearch = useCallback(() => {
    if (!modifyForm.from || !modifyForm.to || !modifyForm.departDate) {
      return;
    }
    
    // Reset selections
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setSelectionStep('outbound');
    setShowModifyPanel(false);
    
    // Navigate with new params
    navigate('/flight-results', {
      state: {
        from: modifyForm.from,
        to: modifyForm.to,
        departDate: modifyForm.departDate,
        returnDate: modifyForm.returnDate,
        tripType: modifyForm.tripType,
        cabinClass: modifyForm.cabinClass,
        passengers: { adults: modifyForm.passengers, children: 0, infants: 0, total: modifyForm.passengers }
      }
    });
    
    // Trigger refetch
    window.location.reload();
  }, [modifyForm, navigate]);

  const swapLocations = useCallback(() => {
    setModifyForm(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  }, []);

  // Stats
  const flightStats = useMemo(() => {
    if (filteredFlights.length === 0) return null;
    
    const parseDuration = (duration) => {
      if (!duration) return Infinity;
      const match = duration.match(/(\d+)h\s*(\d+)?m?/);
      return match ? parseInt(match[1]) * 60 + (parseInt(match[2]) || 0) : Infinity;
    };

    const minPrice = Math.min(...filteredFlights.map(f => f.price));
    const cheapest = filteredFlights.find(f => f.price === minPrice);
    const quickest = filteredFlights.reduce((min, f) => 
      parseDuration(f.duration) < parseDuration(min.duration) ? f : min, filteredFlights[0]);
    const best = filteredFlights.reduce((b, f) => {
      const bScore = b.price * 0.6 + parseDuration(b.duration) * 2;
      const fScore = f.price * 0.6 + parseDuration(f.duration) * 2;
      return fScore < bScore ? f : b;
    }, filteredFlights[0]);
    
    return { cheapest, quickest, best };
  }, [filteredFlights]);

  // Loading
  if (loading) {
    return (
      <div className="flight-results-page">
        <div className="search-summary">
          <div className="search-summary-content">
            <div className="route-info">
              <span className="city">{getAirportCode(searchParams.from) || '---'}</span>
              <ArrowLeftRight size={20} />
              <span className="city">{getAirportCode(searchParams.to) || '---'}</span>
            </div>
            <div className="search-meta">
              <span><Calendar size={14} /> {searchParams.departDate || 'Loading...'}</span>
            </div>
          </div>
        </div>
        
        <div className="results-container">
          <aside className="filters-sidebar">
            <div className="skeleton-box" style={{height: '100px', marginBottom: '16px'}}></div>
            <div className="skeleton-box" style={{height: '100px', marginBottom: '16px'}}></div>
            <div className="skeleton-box" style={{height: '100px'}}></div>
          </aside>
          <main className="flights-main" ref={flightListRef}>
            <div className="loading-banner">
              <Loader2 className="spinner" size={24} />
              <span>Searching for the best flights...</span>
            </div>
            <div className="flight-cards">
              {[1, 2, 3, 4, 5].map(i => <FlightCardSkeleton key={i} />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flight-results-page">
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Unable to load flights</h2>
          <p>{error}</p>
          <button onClick={() => fetchFlights()} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  const totalFlights = selectionStep === 'outbound' ? outboundFlights.length : returnFlights.length;

  return (
    <div className="flight-results-page">
      {/* Enhanced Search Modification Header */}
      <div className={`search-modification-header ${showModifyPanel ? 'expanded' : ''}`}>
        {/* Collapsed View - Current Search Summary */}
        <div className="search-summary-bar" onClick={() => setShowModifyPanel(!showModifyPanel)}>
          <div className="summary-left">
            <div className="route-display">
              <div className="location-badge from">
                <Plane size={16} className="plane-depart" />
                <span className="location-code">{searchParams.from || 'FROM'}</span>
              </div>
              <div className="route-arrow">
                {isRoundTrip ? <ArrowLeftRight size={20} /> : <ArrowRight size={20} />}
              </div>
              <div className="location-badge to">
                <MapPin size={16} />
                <span className="location-code">{searchParams.to || 'TO'}</span>
              </div>
            </div>
            <div className="search-details">
              <span className="detail-item">
                <Calendar size={24} />
                {searchParams.departDate || 'Select date'}
                {isRoundTrip && searchParams.returnDate && <> - {searchParams.returnDate}</>}
              </span>
              <span className="detail-divider">�</span>
              <span className="detail-item">
                <Users size={24} />
                {searchParams.passengers?.total || 1} traveler{(searchParams.passengers?.total || 1) > 1 ? 's' : ''}
              </span>
              <span className="detail-divider">•</span>
              <span className="detail-item cabin">{searchParams.cabinClass || 'Economy'}</span>
            </div>
          </div>
          <button className="modify-toggle-btn" type="button">
            <Edit3 size={16} />
            <span>Modify Search</span>
            <ChevronDown size={16} className={`chevron ${showModifyPanel ? 'rotated' : ''}`} />
          </button>
        </div>

        {/* Simple Modification Panel */}
        {showModifyPanel && (
          <div className="modification-panel simple">
            <div className="simple-modify-form">
              <div className="route-fields">
                <div className="modify-field">
                  <Plane size={16} />
                  <input
                    type="text"
                    value={modifyForm.from}
                    onChange={(e) => setModifyForm(prev => ({ ...prev, from: e.target.value.toUpperCase() }))}
                    placeholder="From"
                    maxLength={3}
                  />
                </div>
                
                <button className="swap-btn-simple" onClick={swapLocations} title="Swap">
                  <ArrowLeftRight size={16} />
                </button>
                
                <div className="modify-field">
                  <MapPin size={16} />
                  <input
                    type="text"
                    value={modifyForm.to}
                    onChange={(e) => setModifyForm(prev => ({ ...prev, to: e.target.value.toUpperCase() }))}
                    placeholder="To"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div className="modify-field date-field">
                <Calendar size={16} />
                <input
                  type="date"
                  value={modifyForm.departDate}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, departDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="Departure Date"
                />
              </div>
              
              {modifyForm.tripType === 'roundtrip' && (
                <div className="modify-field date-field">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={modifyForm.returnDate}
                    onChange={(e) => setModifyForm(prev => ({ ...prev, returnDate: e.target.value }))}
                    min={modifyForm.departDate || new Date().toISOString().split('T')[0]}
                    placeholder="Return Date"
                  />
                </div>
              )}
              
              <div className="modify-field travelers-field">
                <Users size={16} />
                <select
                  value={modifyForm.passengers}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              
              <button className="search-btn-simple" onClick={handleModifySearch}>
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Round Trip Progress */}
      {isRoundTrip && (
        <div className="selection-progress">
          <div 
            className={`progress-step clickable ${selectionStep === 'outbound' ? 'active' : selectedOutbound ? 'completed' : ''}`}
            onClick={() => setSelectionStep('outbound')}
            role="button"
            tabIndex={0}
          >
            <div className="step-indicator">
              {selectedOutbound ? <CheckCircle2 size={20} /> : <span>1</span>}
            </div>
            <div className="step-content">
              <span className="step-title">Departing</span>
              <span className="step-route">{getAirportCode(searchParams.from)} → {getAirportCode(searchParams.to)}</span>
              {selectedOutbound && (
                <span className="step-selected">
                  {selectedOutbound.airlineName} • ${selectedOutbound.price}
                </span>
              )}
            </div>
          </div>
          <div className="progress-connector"></div>
          <div 
            className={`progress-step clickable ${selectionStep === 'return' ? 'active' : ''}`}
            onClick={() => setSelectionStep('return')}
            role="button"
            tabIndex={0}
          >
            <div className="step-indicator"><span>2</span></div>
            <div className="step-content">
              <span className="step-title">Return</span>
              <span className="step-route">{getAirportCode(searchParams.to)} → {getAirportCode(searchParams.from)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      {note && (
        <div className="info-banner">
          <Info size={18} />
          <span>{note}</span>
        </div>
      )}

      {/* Comparison */}
      <ComparisonPanel 
        flights={compareFlights}
        onRemove={handleCompare}
        onClear={() => setCompareFlights([])}
        onSelect={handleFlightSelect}
        onCompareNow={() => setShowCompareModal(true)}
        getDisplayTime={getDisplayTime}
        formatDuration={formatDuration}
      />

      <div className="results-container">
        {/* Filters */}
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filters-header">
            <h3><Filter size={18} /> Filters</h3>
            <button className="clear-filters" onClick={clearFilters}>Reset</button>
            <button className="close-filters" onClick={() => setShowFilters(false)}><X size={20} /></button>
          </div>
          
          <div className="filter-section">
            <button className="filter-toggle" onClick={() => setExpandedFilters(p => ({ ...p, stops: !p.stops }))}>
              <span>Stops</span>
              {expandedFilters.stops ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedFilters.stops && (
              <div className="filter-options">
                {[
                  { value: 'nonstop', label: 'Nonstop', count: outboundFlights.filter(f => (f.stops || 0) === 0).length },
                  { value: '1stop', label: '1 stop', count: outboundFlights.filter(f => (f.stops || 0) === 1).length },
                  { value: '2+stops', label: '2+ stops', count: outboundFlights.filter(f => (f.stops || 0) >= 2).length }
                ].map(opt => (
                  <label key={opt.value} className="filter-option">
                    <input type="checkbox" checked={filters.stops.includes(opt.value)} onChange={() => toggleFilter('stops', opt.value)} />
                    <span className="option-label">{opt.label}</span>
                    <span className="option-count">{opt.count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-section">
            <button className="filter-toggle" onClick={() => setExpandedFilters(p => ({ ...p, airlines: !p.airlines }))}>
              <span>Airlines</span>
              {expandedFilters.airlines ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedFilters.airlines && (
              <div className="filter-options airlines-filter">
                {filterOptions.airlines.map(airline => (
                  <label key={airline} className="filter-option">
                    <input type="checkbox" checked={filters.airlines.includes(airline)} onChange={() => toggleFilter('airlines', airline)} />
                    <span className="option-label">{airline}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-section">
            <button className="filter-toggle" onClick={() => setExpandedFilters(p => ({ ...p, price: !p.price }))}>
              <span>Price</span>
              {expandedFilters.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedFilters.price && (
              <div className="filter-options price-filter">
                <div className="price-range-labels">
                  <span>$0</span>
                  <span>${priceFilterValue}</span>
                </div>
                <input type="range" min="0" max={filterOptions.maxPrice} value={priceFilterValue} onChange={(e) => setPriceFilterValue(parseInt(e.target.value))} className="price-slider" />
              </div>
            )}
          </div>
        </aside>

        {/* Results */}
        <main className="flights-main" ref={flightListRef}>
          {/* Date Flexibility - Right Side */}
          <DateFlexibility selectedDate={searchParams.departDate} onDateChange={handleDateChange} />
          
          <div className="results-header">
            <div className="results-info">
              <h2>{selectionStep === 'outbound' ? 'Departing flights' : 'Return flights'}</h2>
              <span className="results-count">{filteredFlights.length} of {totalFlights}</span>
            </div>
            
            <div className="results-controls">
              <button className="filter-toggle-mobile" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={18} /> Filters
              </button>
              <div className="sort-control">
                <label>Sort:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="best">Best</option>
                  <option value="price">Cheapest</option>
                  <option value="duration">Fastest</option>
                  <option value="departure">Departure</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          {flightStats && (
            <div className="quick-stats">
              <button className={`stat-card ${sortBy === 'best' ? 'active' : ''}`} onClick={() => setSortBy('best')}>
                <Star size={16} />
                <div className="stat-info">
                  <span className="stat-labels">Best</span>
                  <span className="stat-value">${flightStats.best?.price}</span>
                  <span className="stat-detail">{flightStats.best?.duration}</span>
                </div>
              </button>
              <button className={`stat-card ${sortBy === 'price' ? 'active' : ''}`} onClick={() => setSortBy('price')}>
                <TrendingDown size={16} />
                <div className="stat-info">
                  <span className="stat-labels">Cheapest</span>
                  <span className="stat-value">${flightStats.cheapest?.price}</span>
                </div>
              </button>
              <button className={`stat-card ${sortBy === 'duration' ? 'active' : ''}`} onClick={() => setSortBy('duration')}>
                <Zap size={16} />
                <div className="stat-info">
                  <span className="stat-labels">Fastest</span>
                  <span className="stat-value">{flightStats.quickest?.duration}</span>
                </div>
              </button>
            </div>
          )}

          {/* Flight Cards */}
          <div className="flight-cards">
            {visibleFlights.length === 0 ? (
              <div className="no-results">
                <Plane size={48} />
                <h3>No flights found</h3>
                <p>Try adjusting your filters</p>
                <button className="retry-btn" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              visibleFlights.map((flight, index) => (
                <React.Fragment key={flight._id || flight.id || index}>
                  <FlightCard
                    flight={flight}
                    isSelected={(selectedOutbound?._id || selectedOutbound?.id) === (flight._id || flight.id)}
                    isComparing={compareFlights.some(f => (f._id || f.id) === (flight._id || flight.id))}
                    isExpanded={(expandedFlight?._id || expandedFlight?.id) === (flight._id || flight.id)}
                    onSelect={handleFlightSelect}
                    onCompare={handleCompare}
                    onExpand={handleExpand}
                    getDisplayTime={getDisplayTime}
                    getAirportCode={getAirportCode}
                    formatDuration={formatDuration}
                    getStopsText={getStopsText}
                    API_URL={API_URL}
                  />
                  
                  {/* CTA Banner after 3rd flight */}
                  {index === 2 && (
                    <div className="cta-banner">
                      <div className="cta-content">
                        <div className="cta-icon">
                          <Headphones size={32} />
                        </div>
                        <div className="cta-text">
                          <h3>Need Help Booking?</h3>
                          <p>Our travel experts are available 24/7 to help you find the best deals</p>
                        </div>
                        <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="cta-phone-btn">
                          <Phone size={20} />
                          <span>Call Now: {contactSettings.tfn}</span>
                        </a>
                      </div>
                      <div className="cta-features">
                        <span><Check size={14} /> Best Price Guarantee</span>
                        <span><Check size={14} /> Free Cancellation</span>
                        <span><Check size={14} /> 24/7 Support</span>
                      </div>
                    </div>
                  )}
                  
                  {/* CTA Banner after 7th flight */}
                  {index === 6 && visibleFlights.length > 7 && (
                    <div className="cta-banner alt">
                      <div className="cta-content">
                        <div className="cta-icon pulse">
                          <Phone size={28} />
                        </div>
                        <div className="cta-text">
                          <h3>Exclusive Phone-Only Deals!</h3>
                          <p>Get up to $50 off when you book over the phone</p>
                        </div>
                        <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="cta-phone-btn">
                          <Phone size={20} />
                          <span>{contactSettings.tfn}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn prev"
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && <span className="pagination-ellipsis">...</span>}
                        <button
                          className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                          onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))
                  }
                </div>
                
                <button 
                  className="pagination-btn next"
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages} ({filteredFlights.length} flights)
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile filter overlay */}
      {showFilters && <div className="filter-overlay" onClick={() => setShowFilters(false)}></div>}

      {/* Bottom Bar */}
      {(selectedOutbound || selectedReturn) && (
        <div className="selection-bar">
          <div className="selection-bar-content">
            <div className="selected-flights-summary">
              {selectedOutbound && (
                <div className="selected-item">
                  <img 
                    src={selectedOutbound.airlineLogo || `${API_URL}/airlines/${selectedOutbound.airline || 'default'}.png`}
                    alt={selectedOutbound.airlineName || selectedOutbound.airline}
                    className="selected-airline-logo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_URL}/airlines/default.png`;
                    }}
                  />
                  <span className="item-label">Depart</span>
                  <span className="item-info">{getDisplayTime(selectedOutbound.departure)}</span>
                  <span className="item-price">${selectedOutbound.price}</span>
                </div>
              )}
              {selectedReturn && (
                <div className="selected-item">
                  <img 
                    src={selectedReturn.airlineLogo || `${API_URL}/airlines/${selectedReturn.airline || 'default'}.png`}
                    alt={selectedReturn.airlineName || selectedReturn.airline}
                    className="selected-airline-logo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_URL}/airlines/default.png`;
                    }}
                  />
                  <span className="item-label">Return</span>
                  <span className="item-info">{getDisplayTime(selectedReturn.departure)}</span>
                  <span className="item-price">${selectedReturn.price}</span>
                </div>
              )}
              {isRoundTrip && selectedOutbound && !selectedReturn && (
                <div className="selected-item pending">
                  <span className="item-label">Return:</span>
                  <span className="item-info">Select return flight</span>
                </div>
              )}
            </div>
            <div className="selection-total">
              <div className="total-amount">
                <span className="total-label">Total</span>
                <span className="total-value">${(selectedOutbound?.price || 0) + (selectedReturn?.price || 0)}</span>
                <span className="per-person">per person</span>
              </div>
              {/* Show Book Now button when:
                  - One-way: outbound is selected
                  - Round-trip: both outbound and return are selected */}
              {(!isRoundTrip && selectedOutbound) || (isRoundTrip && selectedOutbound && selectedReturn) ? (
                <button 
                  className="checkout-btn book-now"
                  onClick={() => navigate('/flight-order', {
                    state: {
                      outboundFlight: selectedOutbound,
                      returnFlight: selectedReturn,
                      searchParams,
                      totalPrice: (selectedOutbound?.price || 0) + (selectedReturn?.price || 0)
                    }
                  })}
                >
                  <CheckCircle2 size={20} />
                  Book Now
                </button>
              ) : (
                <div className="waiting-message">
                  <span>Select return flight to continue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <CompareModal
          flights={compareFlights}
          onClose={() => setShowCompareModal(false)}
          onSelect={handleFlightSelect}
          getDisplayTime={getDisplayTime}
          formatDuration={formatDuration}
        />
      )}
    </div>
  );
}

export default FlightResults;
