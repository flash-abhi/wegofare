import React from 'react';
import { Star } from 'lucide-react';
import './Card.css';

function Card({ image, title, description, price, rating, location, onBookNow }) {
  return (
    <div className="card">
      <div className="card-image" style={{ backgroundImage: `url(${image})` }}>
        <div className="card-badge">{price}</div>
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        {location && <p className="card-location">{location}</p>}
        <p className="card-description">{description}</p>
        <div className="card-footer">
          <div className="rating">
            <Star size={16} fill="#ffd700" color="#ffd700" />
            <span>{rating}</span>
          </div>
          <button
            className="book-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookNow) onBookNow();
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
