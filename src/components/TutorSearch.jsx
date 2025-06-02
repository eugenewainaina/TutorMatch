// filepath: /Users/mac/Desktop/Code/4th Year Project Stuff/4th_yr_frontend/src/components/TutorSearch.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../config';
import './TutorSearch.css';

const TutorSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimeoutRef = useRef(null);

  // Search for tutors
  const searchTutors = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/search_tutors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ skill: query.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to search for tutors');
      }

      // Try to parse JSON response, handle empty response
      let data;
      const responseText = await response.text();
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          setResults([]);
          return;
        }
      }
      
      // Check if data is empty or undefined
      if (!data || data.length === 0) {
        setResults([]);
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Error searching tutors:', error);
      setError('Failed to search for tutors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Debounced search function
  const debouncedSearch = useCallback((searchText) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (searchText.trim()) {
        searchTutors();
      }
    }, 500); // 500ms delay
  }, [searchTutors]);

  // Handle input changes with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    searchTutors();
  };

  // Navigate to tutor profile
  const navigateToTutorProfile = (tutorId) => {
    navigate(`/tutors/profile/${tutorId}`);
    onClose();
  };

  // Close search when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  // Clear debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="tutor-search-overlay">
      <div className="tutor-search-container" ref={searchContainerRef}>
        <div className="tutor-search-header">
          <form onSubmit={handleSubmit} className="tutor-search-form">
            <input
              type="text"
              className="tutor-search-input"
              placeholder="Search for Skills"
              value={query}
              onChange={handleInputChange}
              autoFocus
            />
            <button type="submit" className="tutor-search-button">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <button className="tutor-search-close" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="tutor-search-results">
          {loading ? (
            <div className="tutor-search-loading">Searching...</div>
          ) : error ? (
            <div className="tutor-search-error">{error}</div>
          ) : results.length > 0 ? (
            <ul className="tutor-results-list">
              {results.map((tutor) => (
                <li 
                  key={tutor.id} 
                  className="tutor-result-item"
                  onClick={() => navigateToTutorProfile(tutor.id)}
                >
                  <div className="tutor-result-name">{tutor.name}</div>
                  <div className="tutor-result-skill">{tutor.skill_name}</div>
                </li>
              ))}
            </ul>
          ) : query && !loading ? (
            <div className="tutor-search-no-results">No tutors found for "{query}"</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TutorSearch;
