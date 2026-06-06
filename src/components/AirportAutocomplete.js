import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Plane, X } from 'lucide-react';
import { searchAirports, getAirportByCode } from '../data/airports';
import './AirportAutocomplete.css';

function AirportAutocomplete({ value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const airport = getAirportByCode(value);
      if (airport) {
        setSelectedAirport(airport);
        setInputValue(`${airport.city} (${airport.code})`);
      }
    } else {
      setSelectedAirport(null);
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.length >= 2) {
      const results = searchAirports(val);
      console.log('Search query:', val, 'Results:', results);
      setSuggestions(results);
      setShowSuggestions(true);

      const trimmed = val.trim().toUpperCase();
      if (trimmed.length === 3) {
        const match = results.find((airport) => airport.code.toUpperCase() === trimmed);
        if (match) {
          handleSelectAirport(match);
          return;
        }
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    if (!val) {
      setSelectedAirport(null);
      onChange('', '');
    }
  };

  const handleSelectAirport = (airport) => {
    setSelectedAirport(airport);
    const formatted = `${airport.city} (${airport.code})`;
    setInputValue(formatted);
    onChange(airport.code, formatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedAirport(null);
    onChange('', '');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="airport-autocomplete" ref={wrapperRef}>
      <div className="airport-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="airport-input"
          autoComplete="off"
        />
        {inputValue && (
          <X 
            size={18} 
            className="clear-icon" 
            onClick={handleClear}
          />
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((airport) => (
            <div
              key={airport.code}
              className="suggestion-item"
              onClick={() => handleSelectAirport(airport)}
            >
              <div className="suggestion-main">
                <div className="airport-icon-circle">
                  <Plane size={18} />
                </div>
                <div className="airport-text">
                  <span className="airport-name">{airport.name}</span>
                  <span className="airport-city">
                    <MapPin size={14} /> {airport.city},
                  </span>
                </div>
                <span className="airport-code">{airport.code}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && inputValue.length >= 2 && suggestions.length === 0 && (
        <div className="suggestions-dropdown">
          <div className="no-results">No airports found</div>
        </div>
      )}
    </div>
  );
}

export default AirportAutocomplete;
