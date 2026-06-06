import React from 'react';
import { Link } from 'react-router-dom';
import { useContact } from '../context/ContactContext';

function FloatingCallBanner() {
  const { contactSettings } = useContact();

  const handleClose = () => {
    const banner = document.getElementById('footerCallBanner');
    if (banner) {
      banner.style.display = 'none';
    }
  };

  return (
    <div className="footer-call-banner" id="footerCallBanner">
      <div className="call-banner-content">
        <div className="call-banner-avatar">📞</div>
        <div className="call-banner-info">
          <span className="call-banner-headline">
            <strong>Call our Travel Experts</strong> 24/7.
          </span>
          <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="call-banner-phone">
            {contactSettings.tfn}
          </a>
          <Link to="/deals" className="call-learn-more">Learn more</Link>
        </div>
        <button className="call-banner-close" onClick={handleClose} aria-label="Close">✕</button>
      </div>
    </div>
  );
}

export default FloatingCallBanner;
