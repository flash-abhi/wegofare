import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useContact } from '../context/ContactContext';
import './StickyCallButton.css';

function StickyCallButton() {
  const { contactSettings } = useContact();

  return (
    <a 
      href={`tel:${(contactSettings.tfn || '+1-800-889-9279').replace(/[^0-9+]/g, '')}`} 
      className="sticky-call-button"
      aria-label="Call to book"
    >
      <div className="call-pulse"></div>
      <PhoneCall size={22} />
      <span className="call-text">
        <span className="call-label">Call to Book</span>
        <span className="call-number">{contactSettings.tfn || '+1-800-889-9279'}</span>
      </span>
    </a>
  );
}

export default StickyCallButton;
