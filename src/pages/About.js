import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Headphones, BadgeDollarSign, Plane, Users, Globe, Clock3, Star } from 'lucide-react';
import './About.css';

function About() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Secure Bookings',
      text: 'Checkout details are reviewed before payment and confirmation.'
    },
    {
      icon: Headphones,
      title: 'Travel Assistance',
      text: 'Advisors can help explain route options and provider conditions.'
    },
    {
      icon: BadgeDollarSign,
      title: 'Fare Review',
      text: 'Compare available fares, taxes, and service details before you book.'
    },
    {
      icon: Clock3,
      title: 'Practical Support',
      text: 'Get help with booking questions and itinerary updates when needed.'
    }
  ];

  const stats = [
    { icon: Globe, value: '500+', label: 'Global Routes' },
    { icon: Plane, value: '120+', label: 'Airline Partners' },
    { icon: Users, value: '2M+', label: 'Traveler Inquiries' },
    { icon: Star, value: '4.8/5', label: 'Published Feedback' }
  ];

  const commitments = [
    ['Transparency', 'Clear pricing, provider rules, and service information before confirmation.'],
    ['Independence', 'We identify ourselves as a third-party travel booking service.'],
    ['Accuracy', 'Offers and availability are subject to provider confirmation at booking.'],
    ['Support', 'We help explain options without representing ourselves as an airline.']
  ];

  return (
    <div className="about-page about-aof">
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div className="about-hero-copy">
            <span className="about-chip">About WegoFare</span>
            <h1>Independent Travel Booking Assistance</h1>
            <p>
              We help travelers compare flight, hotel, and package options with clear information before booking.
            </p>
            <div className="about-hero-actions">
              <Link to="/" className="about-cta-btn">Search Flights</Link>
              <Link to="/contact" className="about-secondary-btn">Talk to Support</Link>
            </div>
          </div>
          <div className="about-hero-panel" aria-label="WegoFare support snapshot">
            <div className="about-panel-orbit">
              <Plane size={34} />
            </div>
            <span>Independent Desk</span>
            <strong>24/7</strong>
            <p>Fare review, route comparison, and booking guidance.</p>
          </div>
        </div>
      </section>

      <section className="about-intro container">
        <div className="about-intro-card">
          <span className="section-kicker">Who We Are</span>
          <h2>Who We Are</h2>
          <p>
            WegoFare is an independent travel booking service. We are not an airline, hotel, or government agency.
            Our team helps travelers review route options, provider rules, fare details, and booking steps.
          </p>
          <p>
            From first-time flyers to frequent travelers, we provide practical assistance with itinerary selection,
            provider-policy guidance, and post-booking questions.
          </p>
        </div>
      </section>

      <section className="about-highlights container">
        <span className="section-kicker">What We Do</span>
          <h2>How We Help Travelers</h2>
        <div className="highlight-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.title}>
              <div className="highlight-icon">
                <item.icon size={24} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-stats container">
        <div className="stats-box">
          {stats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <stat.icon size={22} />
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-values container">
        <div className="values-card">
          <span className="section-kicker">Our Standard</span>
          <h2>Our Commitments</h2>
          <div className="commitment-list">
            {commitments.map(([title, text], index) => (
              <article className="commitment-item" key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta container">
        <div className="cta-card">
          <h2>Ready to Plan Your Next Trip?</h2>
          <p>Search options, review details, and confirm only when the itinerary fits your plans.</p>
          <Link to="/" className="about-cta-btn">Search Flights</Link>
        </div>
      </section>
    </div>
  );
}

export default About;
