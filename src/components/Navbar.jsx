import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import TutorSearch from "./TutorSearch";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <nav className="navbar" data-oid="3gmic19">
      <div className="navbar-container" data-oid="i8ftrqm">
        <Link to="/" className="navbar-logo" data-oid="9bdrcox">
          TutorMatch
        </Link>
        <div className="navbar-links" data-oid="2sydwkg">
          <Link
            to="/recommendation-chatbot"
            className="navbar-link"
            data-oid="5ml-tih"
          >
            Find a Tutor
          </Link>
          <Link to="/profile" className="navbar-link" data-oid="wmv8l.w">
            My Profile
          </Link>
          <Link to="/lessons" className="navbar-link" data-oid="s-fo3r:">
            Lessons
          </Link>
          <Link to="/connections" className="navbar-link" data-oid="q.tz9l5">
            Connections
          </Link>
          <Link to="/chats" className="navbar-link" data-oid="r_hcerv">
            Messages
          </Link>
          <div
            onClick={toggleSearch}
            className="navbar-link search-icon"
            data-oid="w._h2ku"
          >
            <i className="fas fa-search" data-oid="dh0g8g1"></i>
          </div>
        </div>
      </div>
      {showSearch && (
        <TutorSearch onClose={() => setShowSearch(false)} data-oid="7wsnv70" />
      )}
    </nav>
  );
};

export default Navbar;
