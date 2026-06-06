import React from 'react';
import { useContact } from '../context/ContactContext';
import './LegalPage.css';

function Privacy() {
  const { contactSettings } = useContact();
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>Last Updated: April 9, 2026</p>
        </div>
      </div>

      <div className="container">
        <div className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>At wegofare.com, we collect the following types of information:</p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, phone number, billing address, and payment information.</li>
              <li><strong>Travel Information:</strong> Passport details, travel dates, preferences, and booking history.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies.</li>
              <li><strong>Communication:</strong> Records of customer service interactions and feedback.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul>
              <li>Processing and managing your travel bookings</li>
              <li>Sending booking confirmations and travel updates</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Personalizing your experience and recommendations</li>
              <li>Sending promotional offers and newsletters (with your consent)</li>
              <li>Improving our services and website functionality</li>
              <li>Complying with legal obligations and preventing fraud</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Travel Partners:</strong> Airlines, hotels, cruise lines, and other service providers necessary to fulfill your booking.</li>
              <li><strong>Payment Processors:</strong> Secure third-party payment gateways to process transactions.</li>
              <li><strong>Service Providers:</strong> Companies that help us operate our business (marketing, analytics, customer service).</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and safety.</li>
            </ul>
            <p>We never sell your personal information to third parties.</p>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul>
              <li>SSL encryption for all data transmission</li>
              <li>Secure servers and encrypted databases</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information by authorized personnel only</li>
              <li>PCI DSS compliance for payment processing</li>
            </ul>
          </section>

          <section>
            <h2>5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and user behavior</li>
              <li>Provide personalized content and advertisements</li>
              <li>Improve website performance and functionality</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your information (subject to legal requirements)</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain data processing activities</li>
              <li>Request data portability</li>
            </ul>
            <p>To exercise these rights, contact us at privacy@wegofare.com</p>
          </section>

          <section>
            <h2>7. Children's Privacy</h2>
            <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>
          </section>

          <section>
            <h2>8. International Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.</p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or website notice. Continued use of our services constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>For privacy-related questions or concerns:</p>
            <ul>
              <li>Email: privacy@wegofare.com</li>
              <li>Phone: {contactSettings.tfn}</li>
              <li>Mail: Privacy Department, wegofare.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
