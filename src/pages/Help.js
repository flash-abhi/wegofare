import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, Send } from 'lucide-react';
import { useContact } from '../context/ContactContext';
import './Help.css';

function Help() {
  const { contactSettings } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="help-page">
      <div className="help-hero">
        <div className="container">
          <h1>Help Center</h1>
          <p>We're here to help you 24/7</p>
        </div>
      </div>

      <div className="container">
        <div className="help-content">
          <section className="contact-methods">
            <h2>Contact Our Support Team</h2>
            <div className="methods-grid">
              <div className="method-card">
                <Phone size={40} />
                <h3>Call Us</h3>
                <p>Speak with our travel experts</p>
                <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="method-link">{contactSettings.tfn}</a>
                <span className="availability">24/7 Available</span>
              </div>

              <div className="method-card">
                <Mail size={40} />
                <h3>Email Support</h3>
                <p>Get help via email</p>
                <a href="mailto:info@wegofare.com" className="method-link">
                  info@wegofare.com
                </a>
                <span className="availability">Response within 2-4 hours</span>
              </div>

              <div className="method-card">
                <MessageCircle size={40} />
                <h3>Live Chat</h3>
                <p>Chat with us in real-time</p>
                <button className="method-link chat-btn">Start Chat</button>
                <span className="availability">Average wait: 2 minutes</span>
              </div>

              <div className="method-card">
                <Clock size={40} />
                <h3>Business Hours</h3>
                <p>We're always available</p>
                <span className="method-link">24/7/365</span>
                <span className="availability">Even on holidays!</span>
              </div>
            </div>
          </section>

          <section className="popular-topics">
            <h2>Popular Help Topics</h2>
            <div className="topics-grid">
              <div className="topic-card">
                <h3>✈️ Flight Bookings</h3>
                <ul>
                  <li>How to book a flight</li>
                  <li>Changing flight dates</li>
                  <li>Seat selection</li>
                  <li>Baggage allowance</li>
                </ul>
              </div>

              <div className="topic-card">
                <h3>🏨 Hotel Reservations</h3>
                <ul>
                  <li>Making a reservation</li>
                  <li>Room types explained</li>
                  <li>Check-in/check-out times</li>
                  <li>Hotel amenities</li>
                </ul>
              </div>

              <div className="topic-card">
                <h3>💳 Payments & Refunds</h3>
                <ul>
                  <li>Payment methods</li>
                  <li>Refund process</li>
                  <li>Cancellation fees</li>
                  <li>Price match guarantee</li>
                </ul>
              </div>

              <div className="topic-card">
                <h3>📋 Travel Documents</h3>
                <ul>
                  <li>Passport requirements</li>
                  <li>Visa information</li>
                  <li>COVID-19 guidelines</li>
                  <li>ID requirements</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="contact-form-section">
            <h2>Send Us a Message</h2>
            <p className="form-subtitle">Fill out the form below and we'll get back to you as soon as possible.</p>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="cancellation">Cancellation/Refund</option>
                  <option value="change">Change Booking</option>
                  <option value="payment">Payment Issue</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please describe your issue or question in detail..."
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <Send size={20} />
                Send Message
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Help;
