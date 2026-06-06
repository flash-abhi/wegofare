import React from "react";
import { Helmet } from "react-helmet";
import { useContact } from '../context/ContactContext';
import "./AirlineSupport.css";

const AirlineSupport = () => {
  const { contactSettings } = useContact();
  const tfn = contactSettings.tfn || "+1-800-889-9279";
  const tfnClean = tfn.replace(/[^0-9+]/g, '');
  return (
    <>
      <Helmet>
        <title>Airline Customer Service | Call {tfn}</title>
        <meta
          name="description"
          content={`Get reliable general airline assistance, flight information, and travel support. Call our helpline at ${tfn} for quick help.`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "WegoFare Support",
            "url": "https://wegofare.com/",
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": tfn,
                "contactType": "customer support",
                "availableLanguage": ["English"],
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="airline-support-page">
      <div className="support-container support-card">
        <h1>Airline Customer Service & General Travel Assistance</h1>
        <p>
          For quick, reliable airline-related assistance, call our general
          support helpline at <strong>{tfn}</strong>. We provide helpful
          guidance for travelers looking for flight information, booking
          support, travel updates, and general airline-related queries.
        </p>

        <a
          href={`tel:${tfnClean}`}
          style={{
            display: "inline-block",
            background: "#0078ff",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "6px",
            marginTop: "20px",
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          📞 Call Now: {tfn}
        </a>

        <h2 style={{ marginTop: "40px" }}>What We Help With</h2>
        <ul>
          <li>General airline information & travel assistance</li>
          <li>Flight timing queries (arrival/departure basics)</li>
          <li>Reservation guidance and booking support</li>
          <li>Fare details & travel planning information</li>
          <li>Guidance on changes, cancellations, and updates</li>
        </ul>

        <h2 style={{ marginTop: "40px" }}>Why Travelers Contact Us</h2>
        <p>
          Travelers often need help comparing booking options, understanding
          fare rules, or reviewing itinerary details. Our team provides general
          travel assistance as an independent booking service.
        </p>

        <h2 style={{ marginTop: "40px" }}>We Are Not an Airline</h2>
        <p>
          We provide <strong>general travel assistance only</strong>. We do not
          claim to be an airline support line for any specific carrier. Our
          team provides independent guidance to help travelers understand
          options and make informed decisions.
        </p>

        <h2 style={{ marginTop: "40px" }}>Common Topics We Help With</h2>
        <ul>
          <li>flight booking guidance</li>
          <li>fare and itinerary questions</li>
          <li>provider policy information</li>
          <li>general flight assistance</li>
          <li>travel document reminders</li>
        </ul>

        <h2 style={{ marginTop: "40px" }}>Call Our Travel Assistance Desk</h2>
        <p>
          If you need general flight information or travel booking support, call
          <strong>{tfn}</strong> for assistance.
        </p>

        <a
          href={`tel:${tfnClean}`}
          style={{
            display: "inline-block",
            background: "#0078ff",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "6px",
            marginTop: "20px",
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          📞 Call {tfn}
        </a>
      </div>
      </div>
    </>
  );
};

export default AirlineSupport;
