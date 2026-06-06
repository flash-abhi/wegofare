import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useContact, useSiteSettings } from '../context/ContactContext';
import Logo from './Logo';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  const { contactSettings } = useContact();
  const { siteSettings } = useSiteSettings();

  return (
    <footer
      className="footer"
      style={{
        background:
          "linear-gradient(145deg, #0e2337 0%, #153d5a 52%, #102332 100%)",
        color: "#e2e8f0",
      }}
    >
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-column footer-about">
            <Link to="/" className="footer-logo-link" aria-label="WegoFare home">
              <Logo size="medium" />
            </Link>
            <p className="footer-description">
              WegoFare is an independent travel booking service for flights,
              hotels, cruises, and vacation packages. We help travelers review
              options before booking.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/hotels">Hotels</Link>
              </li>
              <li>
                <Link to="/packages">Vacation Packages</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li>
                <Link to="/help">Help Center</Link>
              </li>
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-contact-list">
              <li>
                <Phone size={18} />
                <div>
                  <a
                    href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, "")}`}
                    className="contact-link"
                  >
                    {contactSettings.tfn}
                  </a>
                  <span className="contact-label">
                    {contactSettings.workingHours || "Travel booking assistance"}
                  </span>
                </div>
              </li>
              <li>
                <Mail size={18} />
                <div>
                  <a
                    href={`mailto:${contactSettings.email}`}
                    className="contact-link"
                  >
                    {contactSettings.email}
                  </a>
                  <span className="contact-label">Email Support</span>
                </div>
              </li>
              <li>
                <MapPin size={18} />
                <div>
                  <span className="contact-text">
                    {contactSettings.address.split(",")[0]}
                  </span>
                  <span className="contact-label">
                    {contactSettings.address
                      .split(",")
                      .slice(1)
                      .join(",")
                      .trim()}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Trust & Payment Badges */}
        <div className="footer-trust-bar">
          <div className="trust-badges-row">
            <a
              href="https://www.iatan.org/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="trust-badge"
              title="IATAN"
            >
              <svg viewBox="0 0 80 40" fill="none">
                <rect width="80" height="40" rx="5" fill="#1a3c6e" />
                <text
                  x="40"
                  y="17"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill="#fff"
                  fontFamily="Arial,sans-serif"
                  letterSpacing="2"
                >
                  IATAN
                </text>
                <rect
                  x="12"
                  y="22"
                  width="56"
                  height="1"
                  fill="rgba(255,255,255,0.3)"
                />
                <text
                  x="40"
                  y="33"
                  textAnchor="middle"
                  fontSize="6"
                  fill="rgba(255,255,255,0.7)"
                  fontFamily="Arial,sans-serif"
                >
                  Travel Industry
                </text>
              </svg>
            </a>
            <div className="trust-badge" title="ARC Accredited Agency">
              <svg viewBox="0 0 80 40" fill="none">
                <rect width="80" height="40" rx="5" fill="#c41e3a" />
                <text
                  x="40"
                  y="18"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill="#fff"
                  fontFamily="Arial,sans-serif"
                >
                  ARC
                </text>
                <text
                  x="40"
                  y="30"
                  textAnchor="middle"
                  fontSize="6"
                  fill="rgba(255,255,255,0.8)"
                  fontFamily="Arial,sans-serif"
                >
                  accredited agency
                </text>
              </svg>
            </div>
            <div className="trust-badge" title="Norton Secured">
              <svg viewBox="0 0 90 40" fill="none">
                <rect width="90" height="40" rx="5" fill="#fff" />
                <circle cx="20" cy="20" r="13" fill="#FBBA00" />
                <path
                  d="M14 20l4 4 8-8"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <text
                  x="58"
                  y="18"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="#333"
                  fontFamily="Arial,sans-serif"
                >
                  Norton
                </text>
                <text
                  x="58"
                  y="28"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="600"
                  fill="#666"
                  fontFamily="Arial,sans-serif"
                >
                  SECURED
                </text>
              </svg>
            </div>
            <div className="trust-badge-separator"></div>
            <div className="trust-badge" title="MasterCard">
              <svg viewBox="0 0 62 40" fill="none">
                <rect width="62" height="40" rx="5" fill="#1a1f36" />
                <circle cx="23" cy="20" r="12" fill="#EB001B" opacity="0.9" />
                <circle cx="39" cy="20" r="12" fill="#F79E1B" opacity="0.9" />
                <ellipse cx="31" cy="20" rx="5.5" ry="10" fill="#FF5F00" />
              </svg>
            </div>
            <div className="trust-badge" title="Visa">
              <svg viewBox="0 0 72 40" fill="none">
                <rect width="72" height="40" rx="5" fill="#fff" />
                <text
                  x="36"
                  y="27"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="800"
                  fontStyle="italic"
                  fill="#1A1F71"
                  fontFamily="Arial,sans-serif"
                >
                  VISA
                </text>
              </svg>
            </div>
            <div className="trust-badge" title="UnionPay">
              <svg viewBox="0 0 72 40" fill="none">
                <rect width="72" height="40" rx="5" fill="#fff" />
                <rect
                  x="8"
                  y="6"
                  width="19"
                  height="28"
                  rx="4"
                  fill="#e21836"
                />
                <rect
                  x="27"
                  y="6"
                  width="19"
                  height="28"
                  rx="4"
                  fill="#00447c"
                />
                <rect
                  x="46"
                  y="6"
                  width="19"
                  height="28"
                  rx="4"
                  fill="#007b84"
                />
                <text
                  x="36"
                  y="24"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="700"
                  fill="#fff"
                  fontFamily="Arial,sans-serif"
                >
                  UnionPay
                </text>
              </svg>
            </div>
            <div className="trust-badge" title="Discover">
              <svg viewBox="0 0 84 40" fill="none">
                <rect width="84" height="40" rx="5" fill="#fff" />
                <text
                  x="30"
                  y="24"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#333"
                  fontFamily="Arial,sans-serif"
                >
                  DISC
                </text>
                <circle cx="52" cy="20" r="8" fill="#F47216" />
                <text
                  x="68"
                  y="24"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#333"
                  fontFamily="Arial,sans-serif"
                >
                  VER
                </text>
              </svg>
            </div>
            <div className="trust-badge" title="American Express">
              <svg viewBox="0 0 72 40" fill="none">
                <rect width="72" height="40" rx="5" fill="#006FCF" />
                <text
                  x="36"
                  y="17"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="800"
                  fill="#fff"
                  fontFamily="Arial,sans-serif"
                  letterSpacing="0.5"
                >
                  AMERICAN
                </text>
                <text
                  x="36"
                  y="29"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="800"
                  fill="#fff"
                  fontFamily="Arial,sans-serif"
                  letterSpacing="0.5"
                >
                  EXPRESS
                </text>
              </svg>
            </div>
            <div className="trust-badge" title="Diners Club">
              <svg viewBox="0 0 72 40" fill="none">
                <rect width="72" height="40" rx="5" fill="#fff" />
                <circle
                  cx="36"
                  cy="18"
                  r="13"
                  stroke="#0066A1"
                  strokeWidth="2"
                  fill="none"
                />
                <text
                  x="36"
                  y="36"
                  textAnchor="middle"
                  fontSize="5"
                  fontWeight="700"
                  fill="#0066A1"
                  fontFamily="Arial,sans-serif"
                >
                  DINERS CLUB
                </text>
              </svg>
            </div>
            <div className="trust-badge" title="PayPal">
              <svg viewBox="0 0 72 40" fill="none">
                <rect width="72" height="40" rx="5" fill="#fff" />
                <text
                  x="24"
                  y="26"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="800"
                  fill="#003087"
                  fontFamily="Arial,sans-serif"
                >
                  Pay
                </text>
                <text
                  x="50"
                  y="26"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="800"
                  fill="#009cde"
                  fontFamily="Arial,sans-serif"
                >
                  Pal
                </text>
              </svg>
            </div>
          </div>
        </div>
        {/* disclaimer */}
        <div className='container'>
            <h3 className='dis-title'>Disclaimer*</h3>
            <p>wegofare.com is an independent travel booking service and is not an airline, hotel, cruise line, or government agency. We act as an intermediary between travelers and third-party travel providers. Availability, fares, schedules, baggage rules, cancellations, refunds, and changes are governed by the applicable provider terms shown during booking. Travelers are responsible for reviewing itinerary details and carrying valid travel documents.</p>
        </div>


        {/* Bottom Legal Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright-legal">
              {siteSettings.copyrightText ||
                `© 2018-${currentYear} WegoFare. All rights reserved.`}{" "}
              <Link to="/privacy">Privacy Policy</Link> and agree to our{" "}
              <Link to="/terms">Terms and Conditions</Link>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
