import React from "react";
import { Helmet } from "react-helmet";
import { Phone, Clock, CheckCircle, Shield, Headphones, Globe, Plane, Users, MessageCircle, Star } from "lucide-react";
import { useContact } from '../context/ContactContext';
import "./AirlineCustomerServiceNumber.css";

const AirlineCustomerServiceNumber = () => {
  const { contactSettings } = useContact();
  const tfn = contactSettings.tfn || "+1-800-889-9279";
  const tfnClean = tfn.replace(/[^0-9+]/g, '');

  const airlines = [
    { name: "American Airlines", code: "AA", color: "#0078D2" },
    { name: "Delta Air Lines", code: "DL", color: "#003A70" },
    { name: "United Airlines", code: "UA", color: "#002244" },
    { name: "Southwest Airlines", code: "WN", color: "#304CB2" },
    { name: "JetBlue Airways", code: "B6", color: "#003876" },
    { name: "Alaska Airlines", code: "AS", color: "#01426A" },
    { name: "Spirit Airlines", code: "NK", color: "#FFE600" },
    { name: "Frontier Airlines", code: "F9", color: "#004225" },
  ];

  const services = [
    {
      icon: <Plane size={32} />,
      title: "Flight Booking Guidance",
      description: "Review flight options, booking details, and provider rules before you confirm a reservation."
    },
    {
      icon: <Clock size={32} />,
      title: "Flight Status & Updates",
      description: "Review publicly available flight timing information and confirm details with the operating airline."
    },
    {
      icon: <Users size={32} />,
      title: "Booking Changes",
      description: "Understand change options, fare differences, and provider fees that may apply to your itinerary."
    },
    {
      icon: <Shield size={32} />,
      title: "Cancellation & Refunds",
      description: "Review cancellation, credit, and refund rules based on the applicable provider policy."
    },
    {
      icon: <Headphones size={32} />,
      title: "Baggage Assistance",
      description: "Find general baggage allowance and fee information. Lost baggage claims are handled by the airline."
    },
    {
      icon: <Globe size={32} />,
      title: "Travel Information",
      description: "Review general travel requirements and confirm official rules with airlines or government sources."
    }
  ];

  const faqs = [
    {
      question: "Who can I call for independent travel assistance?",
      answer: `For general travel booking assistance, you can call ${tfn}. We are an independent travel service and are not an official airline support line.`
    },
    {
      question: "Are you an official airline customer service department?",
      answer: "No. WegoFare is an independent travel booking service. Airline-specific requests may still need to be handled directly by the operating airline."
    },
    {
      question: "Can your team help me understand flight options?",
      answer: `Yes. You can call ${tfn} for general booking guidance, fare review, and provider-policy information.`
    },
    {
      question: "Can I change my flight over the phone?",
      answer: "Some flight changes may be possible depending on the airline fare rules and availability. Call " + tfn + " for guidance, or contact the operating airline directly for airline-controlled requests."
    },
    {
      question: "How do I get a refund for a cancelled flight?",
      answer: `For refund guidance, call ${tfn}. Refund eligibility and timing are controlled by the provider rules for your booking.`
    },
    {
      question: "What information do I need when calling airline customer service?",
      answer: "Have your booking confirmation number, flight details, passenger names, and payment information ready. This helps our agents at " + tfn + " assist you more quickly and efficiently."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Independent Airline Booking Assistance | WegoFare</title>
        <meta
          name="description"
          content={`Independent travel booking assistance from WegoFare. Call ${tfn} for help reviewing flight options, booking details, provider policies, and itinerary questions.`}
        />
        <meta name="keywords" content="independent travel assistance, flight booking help, airline booking guidance, travel assistance, itinerary help" />
        <link rel="canonical" href="https://wegofare.com/airline-customer-service-number" />
        <meta property="og:title" content={`Independent Travel Assistance | Call ${tfn}`} />
        <meta property="og:description" content="Review flight options, booking details, and provider policies with independent travel assistance." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "WegoFare - Independent Travel Assistance",
            "url": "https://wegofare.com/airline-customer-service-number",
            "logo": "https://wegofare.com/logo.svg",
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": tfn,
                "contactType": "customer support",
                "areaServed": "US",
                "availableLanguage": ["English", "Spanish"]
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>

      <div className="airline-service-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <img 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80" 
              alt="Airplane flying in the sky"
              className="hero-bg-image"
            />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <Headphones size={20} />
              <span>Independent Travel Assistance</span>
            </div>
            <h1>Independent Airline Booking Assistance</h1>
            <p className="hero-subtitle">
              Get help reviewing flight options, booking details, cancellations, refunds, and provider policies.
              WegoFare is an independent travel service and not an airline.
            </p>
            <a href={`tel:${tfnClean}`} className="hero-cta">
              <Phone size={24} />
              <span>Call {tfn}</span>
            </a>
            <div className="hero-features">
              <div className="feature">
                <CheckCircle size={18} />
                <span>Clear Guidance</span>
              </div>
              <div className="feature">
                <CheckCircle size={18} />
                <span>Travel Advisors</span>
              </div>
              <div className="feature">
                <CheckCircle size={18} />
                <span>Independent Service</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <section className="trust-banner">
          <div className="container">
            <div className="trust-stats">
              <div className="stat">
                <span className="stat-number">Clear</span>
                <span className="stat-label">Booking Details</span>
              </div>
              <div className="stat">
                <span className="stat-number">Provider</span>
                <span className="stat-label">Policy Guidance</span>
              </div>
              <div className="stat">
                <span className="stat-number">Secure</span>
                <span className="stat-label">Checkout Review</span>
              </div>
              <div className="stat">
                <span className="stat-number">Independent</span>
                <span className="stat-label">Travel Service</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="main-content">
          <div className="container">
            
            {/* Introduction */}
            <section className="content-section intro-section">
              <div className="section-content">
                <h2>Independent Help for Flight Booking Questions</h2>
                <p>
                  Travel plans can involve many details, including fare rules, baggage terms, schedule changes,
                  cancellation conditions, and provider fees. Travelers can call <strong>{tfn}</strong> for
                  independent assistance reviewing general flight booking options and service details.
                </p>
                <p>
                  We do not claim to be an official support line for any airline. Airline-controlled services,
                  loyalty accounts, lost baggage claims, and certain refunds may need to be handled directly
                  by the operating carrier.
                </p>
                <div className="cta-box">
                  <div className="cta-content">
                    <h3>Speak to a Travel Advisor</h3>
                    <p>Get help reviewing booking options and provider policies.</p>
                  </div>
                  <a href={`tel:${tfnClean}`} className="cta-button">
                    <Phone size={20} />
                    {tfn}
                  </a>
                </div>
              </div>
              <div className="section-image">
                <img 
                  src="https://images.unsplash.com/photo-1521727284390-39ca72a09ac2?w=600&q=80" 
                  alt="Customer service representative helping traveler"
                />
              </div>
            </section>

            {/* Services Section */}
            <section className="content-section services-section">
              <h2>How We Can Help You Today</h2>
              <p className="section-intro">
                Our independent travel team can help explain common booking topics.
                Call <strong>{tfn}</strong> for general assistance with:
              </p>
              <div className="services-grid">
                {services.map((service, index) => (
                  <div key={index} className="service-card">
                    <div className="service-icon">{service.icon}</div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Airlines Section */}
            <section className="content-section airlines-section">
              <div className="section-image airlines-image">
                <img 
                  src="https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=600&q=80" 
                  alt="Multiple airplanes at airport terminal"
                />
              </div>
              <div className="section-content">
                <h2>We Assist with All Major Airlines</h2>
                <p>
                  Reviewing airline options? Our travel specialists can help you understand booking information,
                  general flight details, and provider policies for many domestic and international carriers.
                  For official airline account or operational requests, contact the airline directly.
                </p>
                <div className="airlines-grid">
                  {airlines.map((airline, index) => (
                    <div key={index} className="airline-tag" style={{ borderColor: airline.color }}>
                      <img 
                        src={`https://images.kiwi.com/airlines/64/${airline.code}.png`}
                        alt={airline.name}
                        className="airline-logo"
                      />
                      <span>{airline.name}</span>
                    </div>
                  ))}
                </div>
                <p className="disclaimer-small">
                  * We are an independent travel service and are not owned by, operated by, or officially affiliated
                  with any airline. We provide general travel assistance and booking guidance.
                </p>
              </div>
            </section>

            {/* Step by Step Section */}
            <section className="content-section steps-section">
              <h2>How to Get Help in 3 Simple Steps</h2>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-icon">
                    <Phone size={40} />
                  </div>
                  <h3>Contact Our Travel Desk</h3>
                  <p>Dial <strong>{tfn}</strong> to discuss available booking options and general itinerary questions.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-icon">
                    <MessageCircle size={40} />
                  </div>
                  <h3>Describe Your Needs</h3>
                  <p>Tell us what you need help with – booking, changes, cancellations, refunds, or flight information.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-icon">
                    <CheckCircle size={40} />
                  </div>
                  <h3>Review Next Steps</h3>
                  <p>Our advisors will explain available options and when you may need to contact the travel provider directly.</p>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="content-section benefits-section">
              <div className="benefits-content">
                <h2>Benefits of Calling {tfn}</h2>
                <div className="benefits-list">
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <Star size={24} />
                    </div>
                    <div className="benefit-text">
                      <h4>Expert Travel Specialists</h4>
                      <p>Our team has years of experience helping travelers navigate airline bookings and policies.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <Clock size={24} />
                    </div>
                    <div className="benefit-text">
                      <h4>Service Availability</h4>
                      <p>Contact us using the phone number or email shown on this website for current assistance options.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <Globe size={24} />
                    </div>
                    <div className="benefit-text">
                      <h4>Multilingual Support</h4>
                      <p>Get assistance in English and Spanish from our diverse team of travel experts.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <Shield size={24} />
                    </div>
                    <div className="benefit-text">
                      <h4>Secure & Confidential</h4>
                      <p>Your personal and payment information is always protected with industry-standard security.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="benefits-image">
                <img 
                  src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80" 
                  alt="Happy travelers at airport"
                />
                <div className="image-cta">
                  <a href={`tel:${tfnClean}`} className="floating-cta">
                    <Phone size={20} />
                    Call {tfn}
                  </a>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="content-section faq-section">
              <h2>Frequently Asked Questions About Travel Assistance</h2>
              <div className="faq-grid">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Common Searches */}
            <section className="content-section searches-section">
              <h2>Common Travel Assistance Topics</h2>
              <p>
                Travelers often need help understanding booking options, provider policies, and itinerary details.
                If you need general travel assistance, call <strong>{tfn}</strong>:
              </p>
              <div className="search-tags">
                <span className="search-tag">flight booking guidance</span>
                <span className="search-tag">fare rule review</span>
                <span className="search-tag">itinerary assistance</span>
                <span className="search-tag">reservation questions</span>
                <span className="search-tag">provider policy guidance</span>
                <span className="search-tag">cancellation rule review</span>
                <span className="search-tag">refund eligibility guidance</span>
                <span className="search-tag">baggage fee information</span>
                <span className="search-tag">travel document reminders</span>
                <span className="search-tag">flight change assistance</span>
                <span className="search-tag">travel agent phone number</span>
                <span className="search-tag">airline ticket help</span>
              </div>
            </section>

            {/* Disclaimer Section */}
            <section className="content-section disclaimer-section">
              <div className="disclaimer-box">
                <h3>Important Disclaimer</h3>
                <p>
                  <strong>We are an independent travel assistance service.</strong> WegoFare is not the official
                  customer service line for any specific airline. We provide general travel guidance and booking
                  assistance to help travelers make informed decisions. For airline-controlled requests, contact the
                  operating airline directly through its official website.
                </p>
                <p>
                  Our goal is to help travelers understand booking options, provider terms, and next steps before
                  making travel decisions.
                </p>
              </div>
            </section>

          </div>
        </main>

        {/* Final CTA Section */}
        <section className="final-cta-section">
          <div className="container">
            <div className="final-cta-content">
              <h2>Need Help Reviewing Travel Options?</h2>
              <p>
                Contact our independent travel desk for help reviewing booking options, provider policies,
                and itinerary questions.
              </p>
              <a href={`tel:${tfnClean}`} className="final-cta-button">
                <Phone size={28} />
                <div className="cta-text">
                  <span className="cta-label">Call Travel Desk</span>
                  <span className="cta-number">{tfn}</span>
                </div>
              </a>
              <div className="final-features">
                <span>✓ No Wait Time</span>
                <span>✓ Live Agents</span>
                <span>✓ All Airlines</span>
                <span>✓ 24/7 Support</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AirlineCustomerServiceNumber;
