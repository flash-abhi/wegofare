import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useContact } from '../context/ContactContext';
import './Contact.css';

function Contact() {
  const { contactSettings } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Contact our independent travel booking team</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info-section contact-redesign-section">
            <span className="contact-kicker">Travel desk channels</span>
            <h2>Choose how you want to reach us</h2>
            <p className="contact-intro">
              Have questions about a booking, fare, hotel, or package? Our team can explain available options,
              provider rules, and next steps. We are an independent travel service and not an airline.
            </p>

            <div className="contact-cards">
              <div className="contact-card">
                <span className="contact-card-index">01</span>
                <div className="card-icon">
                  <Phone size={32} />
                </div>
                <div className="contact-card-copy">
                  <h3>Call Us</h3>
                  <p className="card-description">Speak with a travel advisor</p>
                </div>
                <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="contact-link-main">
                  {contactSettings.tfn}
                  <ArrowRight size={16} />
                </a>
                <p className="card-availability">{contactSettings.workingHours || 'Hours shown in site settings'}</p>
              </div>

              <div className="contact-card">
                <span className="contact-card-index">02</span>
                <div className="card-icon">
                  <Mail size={32} />
                </div>
                <div className="contact-card-copy">
                  <h3>Email Us</h3>
                  <p className="card-description">Send booking or service questions</p>
                </div>
                <a href={`mailto:${contactSettings.email}`} className="contact-link-main">
                  {contactSettings.email}
                  <ArrowRight size={16} />
                </a>
                <p className="card-availability">Response times may vary by request</p>
              </div>

              <div className="contact-card">
                <span className="contact-card-index">03</span>
                <div className="card-icon">
                  <MapPin size={32} />
                </div>
                <div className="contact-card-copy">
                  <h3>Visit Us</h3>
                  <p className="card-description">Our office location</p>
                </div>
                <address className="contact-address">
                  C 177(A) IND AREA
                  SECTOR 74,<br />
                  
                  Mohali, Punjab 160074, India<br />
        
                </address>
              </div>

              <div className="contact-card">
                <span className="contact-card-index">04</span>
                <div className="card-icon">
                  <Clock size={32} />
                </div>
                <div className="contact-card-copy">
                  <h3>Business Hours</h3>
                  <p className="card-description">Service availability</p>
                </div>
                <p className="contact-link-main">{contactSettings.workingHours || 'See contact details'}</p>
                <p className="card-availability">Urgent travel requests are prioritized</p>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <aside className="contact-form-aside">
              <MessageCircle size={34} />
              <h2>Send Us a Message</h2>
              <p>Share your request and we will review it as soon as possible.</p>
              <div className="contact-form-trust">
                <ShieldCheck size={18} />
                Independent booking assistance
              </div>
            </aside>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-field-grid">
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

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
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
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Assistance</option>
                    <option value="cancellation">Cancellation/Refund</option>
                    <option value="change">Change Booking</option>
                    <option value="payment">Payment Issue</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>
              </div>

              <div className="form-group message-field">
                <label htmlFor="message">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button type="submit" className="submit-button">
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>

          

          <div className="emergency-contact">
            <h3>Need Booking Assistance?</h3>
            <p>For time-sensitive itinerary questions, contact our travel desk directly:</p>
            <a href={`tel:${contactSettings.tfn.replace(/[^0-9+]/g, '')}`} className="emergency-button">
              <Phone size={24} />
              Call {contactSettings.tfn}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
