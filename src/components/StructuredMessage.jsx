import React, { useState } from 'react';
import '../Students/RecommendationChatbot.css';
import './StructuredMessage.css';
import { useNavigate } from 'react-router-dom';

const TutorCard = ({ tutor }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // TODO: investigate
const navigateToTutorProfile = () => {
    // Open the tutor profile in a new tab
    window.open(`/tutors/profile/${tutor.id}`, '_blank');
};

  return (
    <div className="tutor-card">
      <div className="tutor-card-header" onClick={toggleExpand}>
        <h3>{tutor.name}</h3>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>
      
      {expanded && (
        <div className="tutor-card-content">
          <p className="tutor-description">{tutor.description}</p>
          
          <div className="tutor-skills">
            <h4>Skills:</h4>
            {Object.entries(tutor.skills).map(([skill, details]) => (
              <div key={skill} className="skill-item">
                <h5>{skill}</h5>
                <p>Teaching mode: {details.mode_of_teaching}</p>
                {details.online_hourly_charge && (
                  <p>Online rate: ${details.online_hourly_charge}/hour</p>
                )}
                {details.physical_hourly_charge && (
                  <p>In-person rate: ${details.physical_hourly_charge}/hour</p>
                )}
              </div>
            ))}
          </div>
          
          <button 
            className="view-profile-btn" 
            onClick={navigateToTutorProfile}
            title="Opens in a new tab"
          >
            View Complete Profile ↗
          </button>
        </div>
      )}
    </div>
  );
};

const StructuredMessage = ({ message }) => {
  // Try to parse the message as JSON
  try {
    const data = typeof message === 'string' ? JSON.parse(message) : message;
    
    // Check if it has the expected structure
    if (data && (data.intro !== undefined || data.outro !== undefined)) {
      return (
        <div className="structured-message">
          {data.intro && <p className="message-intro">{data.intro}</p>}
          
          {data.profiles && data.profiles.length > 0 && (
            <div className="tutor-profiles">
              {data.profiles.map((profile, index) => (
                <TutorCard key={index} tutor={profile} />
              ))}
            </div>
          )}
          
          {data.outro && <p className="message-outro">{data.outro}</p>}
        </div>
      );
    } else {
      // Fallback to displaying as regular text
      return <p>{message}</p>;
    }
  } catch (e) {
    // If it's not valid JSON, display as regular text
    return <p>{message}</p>;
  }
};

export default StructuredMessage;
