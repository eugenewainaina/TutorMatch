import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          TutorMatch
        </Link>
        <div className="navbar-links">
          <Link to="/recommendation-chatbot" className="navbar-link">
            Find a Tutor
          </Link>
          <Link to="/profile" className="navbar-link">
            My Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
