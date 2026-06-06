import React from 'react';
import { useContact } from '../context/ContactContext';
import './LegalPage.css';

function Terms() {
  const { contactSettings } = useContact();
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="container">
          <h1>Terms & Conditions</h1>
          <p>Last Updated: April 9, 2026</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using wegofare.com, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.</p>
          </section>

          <section>
            <h2>2. Booking and Reservations</h2>
            <h3>2.1 Booking Process</h3>
            <ul>
              <li>All bookings are subject to availability and confirmation.</li>
              <li>Prices are quoted in USD and may change without notice until booking is confirmed.</li>
              <li>You must provide accurate and complete information during booking.</li>
              <li>You are responsible for verifying all booking details before confirmation.</li>
            </ul>
            
            <h3>2.2 Payment</h3>
            <ul>
              <li>Full payment is required at the time of booking unless otherwise stated.</li>
              <li>We accept major credit cards and other payment methods as indicated.</li>
              <li>All payments are processed securely through certified payment gateways.</li>
              <li>Additional fees may apply for certain payment methods.</li>
            </ul>
          </section>

          <section>
            <h2>3. Cancellations and Refunds</h2>
            <h3>3.1 Cancellation Policy</h3>
            <ul>
              <li>Cancellation terms vary by service provider (airline, hotel, cruise line).</li>
              <li>Some bookings may be non-refundable or subject to cancellation fees.</li>
              <li>Cancellation requests must be submitted in writing to info@wegofare.com</li>
              <li>Processing time for refunds may take 7-14 business days.</li>
            </ul>
            
            <h3>3.2 Changes to Bookings</h3>
            <ul>
              <li>Changes to existing bookings may incur fees from service providers.</li>
              <li>Name changes on airline tickets are generally not permitted.</li>
              <li>Date and destination changes are subject to availability and fare differences.</li>
            </ul>
          </section>

          <section>
            <h2>4. Travel Documents and Requirements</h2>
            <ul>
              <li>You are responsible for obtaining valid passports, visas, and travel documents.</li>
              <li>Check entry requirements for your destination country well in advance.</li>
              <li>Ensure your passport is valid for at least 6 months beyond your return date.</li>
              <li>Verify COVID-19 or other health requirements for travel.</li>
              <li>wegofare.com is not responsible for denied boarding due to invalid documents.</li>
            </ul>
          </section>

          <section>
            <h2>5. Liability and Disclaimers</h2>
            <h3>5.1 Service Provider Responsibility</h3>
            <p>We act as an intermediary between you and travel service providers (airlines, hotels, etc.). We are not liable for:</p>
            <ul>
              <li>Flight delays, cancellations, or schedule changes</li>
              <li>Lost or damaged baggage</li>
              <li>Hotel service quality or amenities</li>
              <li>Acts of God, natural disasters, or force majeure events</li>
              <li>Political unrest, terrorism, or travel restrictions</li>
            </ul>

            <h3>5.2 Limitation of Liability</h3>
            <p>Our liability is limited to the amount paid for the booking. We are not responsible for indirect, consequential, or punitive damages.</p>
          </section>

          <section>
            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Provide false or misleading information</li>
              <li>Use our services for fraudulent purposes</li>
              <li>Violate any laws or regulations</li>
              <li>Interfere with our website's operation or security</li>
              <li>Resell our services without authorization</li>
            </ul>
          </section>

            <section>
              <h2>7. Intellectual Property</h2>
              <p>All content on wegofare.com, including text, graphics, logos, and software, is our property or licensed to us. You may not reproduce, distribute, or create derivative works without written permission.</p>
            </section>

          <section>
            <h2>8. Pricing and Availability</h2>
            <p>Prices, availability, taxes, fees, schedules, room details, and package inclusions are subject to change until the booking is confirmed by the applicable travel provider. We do not guarantee that every displayed fare or offer will remain available.</p>
          </section>

          <section>
            <h2>9. Customer Support</h2>
            <p>For booking questions, itinerary assistance, or service requests, contact us at:</p>
            <ul>
              <li>Phone: {contactSettings.tfn}</li>
              <li>Email: info@wegofare.com</li>
            </ul>
          </section>

          <section>
            <h2>10. Governing Law</h2>
            <p>These terms are governed by the laws of the United States. Any disputes will be resolved in accordance with applicable federal and state laws.</p>
          </section>

          <section>
            <h2>11. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes become effective upon posting. Continued use of our services constitutes acceptance of updated terms.</p>
          </section>

          <section>
            <h2>12. Contact Information</h2>
            <p>For questions about these terms:</p>
            <ul>
              <li>Email: legal@wegofare.com</li>
              <li>Phone: {contactSettings.tfn}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
