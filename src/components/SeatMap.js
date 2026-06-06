import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import './SeatMap.css';

function SeatMap({ flight, passengers, onSeatsSelected, onClose }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch seat map from API
  useEffect(() => {
    const fetchSeatMap = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/flights/seatmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flightOfferId: flight?.id })
        });

        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API response to seat map format
          setSeatMap(transformApiSeatMap(data.data));
        } else {
          // Fallback to generated seat map
          setSeatMap(generateSeatMap());
        }
      } catch (error) {
        console.error('Error fetching seat map:', error);
        // Fallback to generated seat map
        setSeatMap(generateSeatMap());
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [flight]);

  // Transform Amadeus API seat map to our format
  const transformApiSeatMap = (apiData) => {
    const sections = [
      { name: 'Business Class', rows: 4, columns: ['A', 'C', 'D', 'F'], price: 200 },
      { name: 'Premium Economy', rows: 6, columns: ['A', 'B', 'C', 'D', 'E', 'F'], price: 50 },
      { name: 'Economy', rows: 20, columns: ['A', 'B', 'C', 'D', 'E', 'F'], price: 0 }
    ];

    // If API provides seat data, use it
    if (apiData.decks && apiData.decks[0]?.seats) {
      const apiSeats = apiData.decks[0].seats;
      
      return sections.map(section => {
        const seats = [];
        let startRow = 1;
        
        if (section.name === 'Premium Economy') startRow = 5;
        if (section.name === 'Economy') startRow = 11;

        for (let row = startRow; row < startRow + section.rows; row++) {
          const rowSeats = section.columns.map(col => {
            const seatNumber = `${row}${col}`;
            const apiSeat = apiSeats.find(s => s.number === seatNumber);
            const isOccupied = apiSeat ? !apiSeat.available : Math.random() > 0.7;
            
            // Determine if it's an exit row
            const isExit = (section.name === 'Premium Economy' && row === 7) || 
                          (section.name === 'Economy' && (row === 15 || row === 25)) ||
                          (apiSeat?.characteristics?.legroom === 'extra');
            
            // Use airline pricing if available, otherwise use defaults
            let seatPrice = apiSeat?.price || section.price;
            if (isExit && !apiSeat?.price) {
              seatPrice = section.name === 'Economy' ? 25 : 75;
            }
            
            return {
              number: seatNumber,
              row,
              column: col,
              occupied: isOccupied,
              exit: isExit,
              type: apiSeat?.type || section.name,
              price: seatPrice,
              characteristics: apiSeat?.characteristics
            };
          });
          seats.push(rowSeats);
        }
        
        return { ...section, seats };
      });
    }
    
    return generateSeatMap();
  };
  
  // Generate seat map based on aircraft type
  const generateSeatMap = () => {
    const sections = [
      { name: 'Business Class', rows: 4, columns: ['A', 'C', 'D', 'F'], price: 200 },
      { name: 'Premium Economy', rows: 6, columns: ['A', 'B', 'C', 'D', 'E', 'F'], price: 50 },
      { name: 'Economy', rows: 20, columns: ['A', 'B', 'C', 'D', 'E', 'F'], price: 0 }
    ];

    return sections.map(section => {
      const seats = [];
      let startRow = 1;
      
      if (section.name === 'Premium Economy') startRow = 5;
      if (section.name === 'Economy') startRow = 11;

      for (let row = startRow; row < startRow + section.rows; row++) {
        const rowSeats = section.columns.map(col => {
          const seatNumber = `${row}${col}`;
          const isOccupied = Math.random() > 0.7; // 30% occupied
          
          // Determine if it's an exit row (specific rows with extra legroom)
          const isExit = (section.name === 'Premium Economy' && row === 7) || 
                        (section.name === 'Economy' && (row === 15 || row === 25));
          
          // Calculate seat price based on type
          let seatPrice = section.price;
          if (isExit && section.name === 'Economy') {
            seatPrice = 25; // Exit row in economy
          } else if (isExit && section.name === 'Premium Economy') {
            seatPrice = 75; // Exit row in premium economy (base + exit fee)
          }
          
          return {
            number: seatNumber,
            row,
            column: col,
            occupied: isOccupied,
            exit: isExit,
            type: section.name,
            price: seatPrice
          };
        });
        seats.push(rowSeats);
      }
      
      return { ...section, seats };
    });
  };

  const handleSeatClick = (seat) => {
    if (seat.occupied) return;

    const isSelected = selectedSeats.find(s => s.number === seat.number);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.number !== seat.number));
    } else {
      const totalPassengers = (passengers?.adults || 1) + (passengers?.children || 0);
      if (selectedSeats.length < totalPassengers) {
        setSelectedSeats([...selectedSeats, seat]);
      }
    }
  };

  const getTotalExtraPrice = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleConfirm = () => {
    if (selectedSeats.length === (passengers?.adults || 1) + (passengers?.children || 0)) {
      onSeatsSelected(selectedSeats);
      onClose();
    }
  };

  const getSeatClass = (seat) => {
    const classes = ['seat'];
    if (seat.occupied) classes.push('occupied');
    if (selectedSeats.find(s => s.number === seat.number)) classes.push('selected');
    if (seat.exit) classes.push('exit-row');
    return classes.join(' ');
  };

  const totalPassengers = (passengers?.adults || 1) + (passengers?.children || 0);

  if (loading) {
    return (
      <div className="seat-map-overlay">
        <div className="seat-map-container">
          <div className="seat-map-header">
            <div>
              <h2>Loading Seat Map...</h2>
              <p>Fetching available seats from airline</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div style={{padding: '40px', textAlign: 'center'}}>
            <div style={{fontSize: '16px', color: '#718096'}}>
              Please wait while we load the seat map...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seat-map-overlay">
      <div className="seat-map-container">
        <div className="seat-map-header">
          <div>
            <h2>Select Your Seats</h2>
            <p>Flight {flight.flightNumber} • {flight.from.code} → {flight.to.code}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="seat-selection-info">
          <div className="info-item">
            <div className="legend-box available"></div>
            <span>Available (Free)</span>
          </div>
          <div className="info-item">
            <div className="legend-box selected"></div>
            <span>Selected</span>
          </div>
          <div className="info-item">
            <div className="legend-box occupied"></div>
            <span>Occupied</span>
          </div>
          <div className="info-item">
            <div className="legend-box exit"></div>
            <span>Exit Row (+$25-$50)</span>
          </div>
          <div className="info-item">
            <div className="legend-box premium" style={{background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'}}></div>
            <span>Premium Economy (+$50)</span>
          </div>
          <div className="info-item">
            <div className="legend-box business" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}></div>
            <span>Business Class (+$200)</span>
          </div>
        </div>

        <div className="passengers-count">
          <User size={18} />
          <span>Selecting for {totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}</span>
          <span className="seats-selected">({selectedSeats.length}/{totalPassengers} selected)</span>
        </div>

        <div className="seat-map-body">
          <div className="aircraft-nose">
            <div className="cockpit">✈️ Front</div>
          </div>

          {seatMap.map((section, sectionIndex) => (
            <div key={sectionIndex} className="seat-section">
              <div className="section-header">
                <span className="section-name">{section.name}</span>
                {section.price > 0 && <span className="section-price">+${section.price}/seat</span>}
              </div>

              <div className="seats-grid">
                <div className="column-labels">
                  {section.columns.map(col => (
                    <div key={col} className="column-label">{col}</div>
                  ))}
                </div>

                {section.seats.map((row, rowIndex) => (
                  <div key={rowIndex} className="seat-row">
                    <div className="row-number">{row[0].row}</div>
                    <div className="seats">
                      {row.map((seat, seatIndex) => (
                        <React.Fragment key={seat.number}>
                          {seatIndex === 3 && <div className="aisle"></div>}
                          <div className="seat-wrapper">
                            <button
                              className={getSeatClass(seat)}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.occupied}
                              title={`Seat ${seat.number} - ${seat.type}${seat.price > 0 ? ` (+$${seat.price})` : ''}`}
                            >
                              {seat.occupied ? '✕' : String(seat.number)}
                              {!seat.occupied && seat.price > 0 && (
                                <span className="seat-price-badge">${seat.price}</span>
                              )}
                            </button>
                            {seat.exit && <div className="exit-label">EXIT</div>}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="row-number">{row[0].row}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="aircraft-tail">
            <div className="tail-section">✈️ Rear</div>
          </div>
        </div>

        <div className="seat-map-footer">
          <div className="selected-seats-summary">
            <h4>Selected Seats:</h4>
            {selectedSeats.length > 0 ? (
              <div className="selected-list">
                {selectedSeats.map(seat => (
                  <span key={seat.number} className="seat-tag">
                    {seat.number}
                    {seat.price > 0 && <small> (+${seat.price})</small>}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-selection">No seats selected yet</p>
            )}
          </div>

          <div className="footer-actions">
            <div className="price-summary">
              {getTotalExtraPrice() > 0 && (
                <div className="extra-charge">
                  <span>Seat Selection Fee:</span>
                  <span className="amount">+${getTotalExtraPrice()}</span>
                </div>
              )}
            </div>
            <button
              className="confirm-seats-btn"
              onClick={handleConfirm}
              disabled={selectedSeats.length !== totalPassengers}
            >
              Confirm Seats ({selectedSeats.length}/{totalPassengers})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatMap;
