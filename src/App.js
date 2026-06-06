import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import io from 'socket.io-client';
import { SOCKET_URL } from './config/api';
import { ContactProvider } from './context/ContactContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import StickyCallButton from './components/StickyCallButton';
import HomeNew from './pages/HomeNew';
import Flights from './pages/Flights';
import Booking from './pages/Booking';
import FlightOrder from './pages/FlightOrder';
import FlightResults from './pages/FlightResults';
import BookingConfirmation from './pages/BookingConfirmation';
import Hotels from './pages/Hotels';
import HotelResults from './pages/HotelResults';
import HotelDetails from './pages/HotelDetails';
import HotelBooking from './pages/HotelBooking';
import Cruises from './pages/Cruises';
import CruiseResults from './pages/CruiseResults';
import CruiseBooking from './pages/CruiseBooking';
import CruiseConfirmation from './pages/CruiseConfirmation';
import Packages from './pages/Packages';
import PackageResults from './pages/PackageResults';
import PackageDetails from './pages/PackageDetails';
import PackageBooking from './pages/PackageBooking';
import VacationSearch from './pages/VacationSearch';
import AirlinesDirectory from './pages/AirlinesDirectory';
import AirlinePage from './pages/AirlinePage';
import AirlineSupport from './pages/AirlineSupport';
import AirlineCustomerServiceNumber from './pages/AirlineCustomerServiceNumber';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Help from './pages/Help';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BlogPost from './pages/BlogPost';
import Blog from './pages/Blog';
import './App.css';
import './styles/Redesign.css';
import './styles/LightTheme.css';
import './styles/BlueOrangeTheme.css';

let socket = null;

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Connect to WebSocket for visitor tracking (only for non-admin pages)
    if (!isAdminRoute && !socket) {
      socket = io(SOCKET_URL);
      console.log('🔌 Connected to visitor tracking');
    }

    // Track page view
    if (!isAdminRoute && socket) {
      socket.emit('pageView', { page: location.pathname });
    }

    // Cleanup on unmount (app close)
    return () => {
      if (socket && isAdminRoute) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [location.pathname, isAdminRoute]);

  return (
    <div className="App">
      <Helmet>
        <title>WegoFare | Cheap Flights, Hotels & Travel Deals</title>
        <meta
          name="description"
          content="Book affordable flights, hotels, and vacation packages with WegoFare. Compare travel deals and get 24/7 booking support for your next trip."
        />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <link rel="canonical" href="https://wegofare.com/" />
        <meta property="og:site_name" content="WegoFare" />
        <meta property="og:title" content="WegoFare | Cheap Flights, Hotels & Travel Deals" />
        <meta
          property="og:description"
          content="Book affordable flights, hotels, and vacation packages with WegoFare. Compare travel deals and get 24/7 booking support for your next trip."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wegofare.com/" />
        <meta property="og:image" content="https://wegofare.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WegoFare | Cheap Flights, Hotels & Travel Deals" />
        <meta
          name="twitter:description"
          content="Book affordable flights, hotels, and vacation packages with WegoFare. Compare travel deals and get 24/7 booking support for your next trip."
        />
        <meta name="twitter:image" content="https://wegofare.com/logo.png" />
        <link rel="icon" href="/favicon.png" type="image/*" />
      </Helmet>
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<HomeNew />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/flight-results" element={<FlightResults />} />
        <Route path="/flight-order" element={<FlightOrder />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel-results" element={<HotelResults />} />
        <Route path="/hotel-details" element={<HotelDetails />} />
        <Route path="/hotel-booking" element={<HotelBooking />} />
        <Route path="/cruises" element={<Cruises />} />
        <Route path="/cruise-results" element={<CruiseResults />} />
        <Route path="/cruise-booking" element={<CruiseBooking />} />
        <Route path="/cruise-confirmation" element={<CruiseConfirmation />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/package-results" element={<PackageResults />} />
        <Route path="/package-details" element={<PackageDetails />} />
        <Route path="/package-booking" element={<PackageBooking />} />
        <Route path="/vacation-search" element={<VacationSearch />} />
        <Route path="/airlines" element={<AirlinesDirectory />} />
        <Route path="/airlines/:airlineSlug" element={<AirlinePage />} />
        <Route path="/airline-customer-service" element={<AirlineSupport />} />
        <Route
          path="/airline-customer-service-number"
          element={<AirlineCustomerServiceNumber />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
      {!isAdminRoute && <StickyCallButton />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ContactProvider>
        <AppContent />
      </ContactProvider>
    </Router>
  );
}

export default App;
