import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerPage from './pages/CustomerPage';
import EventDetails from './pages/EventDetails';
import BookTickets from './pages/BookTickets';
import CustomerProfile from './pages/CustomerProfile';
import Navbar from './pages/Navbar'; // Import your Navbar component
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './adminpages/AdminPage';
import AdminEventDetailsPage from './adminpages/AdminEventDetailsPage';
import AnalyticsPage from './adminpages/AnalyticsPage';
import CreateEventPage from './adminpages/CreateEventPage';
import AdminNavBar from './adminpages/AdminNavbar';

// Create a component to conditionally render the Navbar
function NavbarWrapper() {
  const location = useLocation(); // Hook to get the current location

  // Define arrays for customer and admin paths where the navbar should not appear
  const customerExclusions = ['/', '/signup', '/admin','/admin-page','/admin/analytics','/admin/create-event','/admin/event/title/:title'];
  const adminExclusions = [
    '/',
    '/signup',
    '/admin',
    '/customer',
    '/book-tickets/:title',
    '/profile',
    '/events/:title'
  ];

  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <>
      {/* Conditionally render Navbar based on the current route */}
      {!customerExclusions.includes(location.pathname) && !isAdminPage && <Navbar />}
      {/* Conditionally render AdminNavBar for admin pages */}
      {isAdminPage && !adminExclusions.includes(location.pathname) && <AdminNavBar />}
    </>
  );
}

function App() {
  return (
    <Router>
      <NavbarWrapper /> {/* Navbar will be conditionally rendered here */}
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Login page route */}
        <Route path="/signup" element={<SignupPage />} /> {/* Signup page route */}
        <Route path="/customer" element={<CustomerPage />} /> {/* Customer page route */}
        <Route path="/events/:title" element={<EventDetails />} /> {/* Event details route */}
        <Route path="/book-tickets/:title" element={<BookTickets />} /> {/* Book tickets route */}
        <Route path="/profile" element={<CustomerProfile />} /> {/* Customer profile page */}
        <Route path="/admin" element={<AdminLoginPage />} /> {/* Admin login route */}
        <Route path="/admin-page" element={<AdminPage />} /> {/* Admin page route */}
        <Route path="/admin/analytics" element={<AnalyticsPage />} /> {/* Analytics page */}
        <Route path="/admin/create-event" element={<CreateEventPage />} /> {/* Create event page */}
        <Route path="/admin/event/title/:title" element={<AdminEventDetailsPage />} /> {/* Admin event details */}
      </Routes>
    </Router>
  );
}

export default App;
