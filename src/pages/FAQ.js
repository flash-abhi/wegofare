import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useContact } from '../context/ContactContext';
import './FAQ.css';

function FAQ() {
  const { contactSettings } = useContact();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Booking & Payment",
      questions: [
        {
          q: "How do I book a flight on wegofare.com?",
          a: "Simply enter your travel details (origin, destination, dates, passengers) on our homepage, click 'Search Flights,' review available options, select your preferred flight, and complete the booking process with your payment information."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and PayPal. All transactions are processed securely with industry-standard encryption."
        },
        {
          q: "Is it safe to book through wegofare.com?",
          a: "Absolutely! We use SSL encryption and PCI DSS-compliant payment processing to ensure your personal and financial information is completely secure."
        },
        {
          q: "Will I receive a confirmation after booking?",
          a: "Yes, you'll receive an immediate email confirmation with your booking details, reference number, and e-tickets (for flights). Please check your spam folder if you don't see it within a few minutes."
        }
      ]
    },
    {
      category: "Cancellations & Changes",
      questions: [
        {
          q: "Can I cancel my booking?",
          a: `Cancellation policies vary by airline, hotel, or service provider. Most bookings can be cancelled, but fees may apply. Check your booking confirmation for specific cancellation terms or contact our support team at ${contactSettings.tfn}.`
        },
        {
          q: "How do I change my flight dates?",
          a: `Contact our customer support team at ${contactSettings.tfn} or email info@wegofare.com. Changes are subject to availability and may incur fare differences and change fees from the airline.`
        },
        {
          q: "What is your refund policy?",
          a: "Refunds depend on the fare rules of your booking. Refundable tickets will be processed within 7-14 business days. Non-refundable tickets may be eligible for airline credits minus any applicable fees."
        },
        {
          q: "Can I get a refund if the airline cancels my flight?",
          a: "Yes, if the airline cancels your flight, you're entitled to a full refund or rebooking at no additional cost. Contact us immediately for assistance."
        }
      ]
    },
    {
      category: "Travel Requirements",
      questions: [
        {
          q: "What documents do I need to travel?",
          a: "For domestic travel, a government-issued photo ID is required. For international travel, you need a valid passport (valid for at least 6 months beyond your return date) and any required visas for your destination."
        },
        {
          q: "Do I need a visa?",
          a: "Visa requirements vary by destination and your nationality. Check with the embassy or consulate of your destination country well in advance of travel. We recommend applying for visas at least 4-6 weeks before departure."
        },
        {
          q: "What are the current COVID-19 travel requirements?",
          a: "Requirements vary by destination and change frequently. Check with your airline and destination country for the latest requirements regarding vaccinations, testing, and quarantine."
        }
      ]
    },
    {
      category: "Pricing & Deals",
      questions: [
        {
          q: "Do you offer a best price guarantee?",
          a: "Yes! If you find a lower price for the same itinerary within 24 hours of booking, contact us and we'll match it or refund the difference (subject to verification and terms)."
        },
        {
          q: "Why do prices change?",
          a: "Flight and hotel prices fluctuate based on demand, availability, seasonality, and other factors. Prices are not guaranteed until booking is confirmed and payment is processed."
        },
        {
          q: "Are there any hidden fees?",
          a: "No! We believe in transparent pricing. All fees and taxes are displayed before you complete your booking. The final price you see is what you pay."
        },
        {
          q: "How can I find the best deals?",
          a: "Subscribe to our newsletter for exclusive deals, book in advance, be flexible with dates, consider alternative airports, and check our 'Special Deals' section regularly."
        }
      ]
    },
    {
      category: "Customer Support",
      questions: [
        {
          q: "How can I contact customer support?",
          a: `Our 24/7 customer support team is available at ${contactSettings.tfn} or email info@wegofare.com. We typically respond to emails within 2-4 hours.`
        },
        {
          q: "What if I have issues during my trip?",
          a: `Call our 24/7 emergency support line at ${contactSettings.tfn}. We're here to help with flight changes, hotel issues, or any travel emergencies.`
        },
        {
          q: "Can I manage my booking online?",
          a: "Yes! Log into your account on our website to view booking details, check flight status, and request changes. For major modifications, please contact our support team."
        }
      ]
    },
    {
      category: "Hotels & Cruises",
      questions: [
        {
          q: "What does the hotel price include?",
          a: "Hotel prices typically include the room rate and applicable taxes. Some may include breakfast or other amenities - check the hotel description for details. Resort fees and parking may be additional."
        },
        {
          q: "Can I choose my room type?",
          a: "Yes, during the booking process you can select from available room types. Room assignments are subject to availability at check-in."
        },
        {
          q: "What's included in a cruise package?",
          a: "Cruise packages typically include accommodation, meals, onboard entertainment, and certain activities. Alcoholic beverages, specialty dining, shore excursions, and spa services usually cost extra."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about booking, travel, and our services</p>
        </div>
      </div>

      <div className="container">
        <div className="faq-content">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq, qIndex) => {
                  const index = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === index;
                  
                  return (
                    <div key={qIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                      <button 
                        className="faq-question"
                        onClick={() => toggleQuestion(catIndex, qIndex)}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {isOpen && (
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>Still have questions?</h3>
          <p>Our customer support team is available 24/7 to help you.</p>
          <div className="contact-buttons">
            <a href="tel:+18008899279" className="btn-primary">Call: +1-800-889-9279</a>
            <a href="mailto:info@wegofare.com" className="btn-secondary">Email Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
