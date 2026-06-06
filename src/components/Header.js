import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Clock3, Mail, Menu, ShieldCheck, X } from "lucide-react";
import { useContact } from "../context/ContactContext";
import Logo from "./Logo";
import "./Header.css";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { contactSettings } = useContact();

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/hotels", label: "Hotels" },
    { to: "/contact", label: "Contact" },
    { to: "/packages", label: "Packages" },
    { to: "/airlines", label: "Airlines" }
  ];

  return (
    <header className="header">
      <div className="header-topline">
        <div className="header-topline-inner">
          <span className="topline-item">
            <Clock3 size={15} />
            {contactSettings.workingHours || "24/7 Customer Support"}
          </span>
          <a href={`mailto:${contactSettings.email}`} className="topline-item">
            <Mail size={15} />
            {contactSettings.email}
          </a>
          <span className="topline-item trust-note">
            <ShieldCheck size={15} />
            Secure travel booking desk
          </span>
        </div>
      </div>
      <div className="header-shell">
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <Logo />
        </Link>

        <button
          className="mobile-menu-tog"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <a
            href={`tel:${(contactSettings.tfn || "").replace(/[^0-9+]/g, "")}`}
            className="call-pill"
            title="Call now"
          >
            <Phone size={18} />
            <span className="call-text">
              <span className="call-number">{contactSettings.tfn}</span>
            </span>
          </a>
        </div>
      </div>

      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? "open" : ""}`} onClick={closeMobileMenu} />
      <nav className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`} aria-label="Mobile navigation">
        <div className="mobile-menu-head">
          <span>Menu</span>
          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            <X size={24} />
          </button>
        </div>
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="mobile-link" onClick={closeMobileMenu}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default Header;
