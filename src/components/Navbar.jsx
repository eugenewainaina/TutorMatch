import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import TutorSearch from './TutorSearch';

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

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
          <Link to="/lessons" className="navbar-link">
            Lessons
          </Link>
          <Link to="/connections" className="navbar-link">
            Connections
          </Link>
          <Link to="/chats" className="navbar-link">
            Messages
          </Link>
          <div onClick={toggleSearch} className="navbar-link search-icon">
            <i className="fas fa-search"></i>
          </div>
        </div>
      </div>
      {showSearch && <TutorSearch onClose={() => setShowSearch(false)} />}
    </nav>
  );
};

export default Navbar;
