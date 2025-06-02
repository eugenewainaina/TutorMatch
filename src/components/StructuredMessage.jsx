import React, { useState } from "react";
import "../Students/RecommendationChatbot.css";
import "./StructuredMessage.css";
import { useNavigate } from "react-router-dom";

const TutorCard = ({ tutor }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // TODO: investigate
  const navigateToTutorProfile = () => {
    // Open the tutor profile in a new tab
    window.open(`/tutors/profile/${tutor.id}`, "_blank");
  };

  return (
    <div className="tutor-card" data-oid="-:q0poa">
      <div
        className="tutor-card-header"
        onClick={toggleExpand}
        data-oid="e1.wzif"
      >
        <h3 data-oid="nq9b-n1">{tutor.name}</h3>
        <span
          className={`expand-icon ${expanded ? "expanded" : ""}`}
          data-oid="h2w-_9z"
        >
          ▼
        </span>
      </div>

      {expanded && (
        <div className="tutor-card-content" data-oid="w93v7xu">
          <p className="tutor-description" data-oid="mvv2nse">
            {tutor.description}
          </p>

          <div className="tutor-skills" data-oid="nshwi7j">
            <h4 data-oid="bp1v3w9">Skills:</h4>
            {Object.entries(tutor.skills).map(([skill, details]) => (
              <div key={skill} className="skill-item" data-oid="c1yfuuv">
                <h5 data-oid="x6egdln">{skill}</h5>
                <p data-oid="g.0ts-t">
                  Teaching mode: {details.mode_of_teaching}
                </p>
                {details.online_hourly_charge && (
                  <p data-oid=".04b230">
                    Online rate: ${details.online_hourly_charge}/hour
                  </p>
                )}
                {details.physical_hourly_charge && (
                  <p data-oid="ci6v7bw">
                    In-person rate: ${details.physical_hourly_charge}/hour
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            className="view-profile-btn"
            onClick={navigateToTutorProfile}
            title="Opens in a new tab"
            data-oid="j.87qla"
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
    const data = typeof message === "string" ? JSON.parse(message) : message;

    // Check if it has the expected structure
    if (data && (data.intro !== undefined || data.outro !== undefined)) {
      return (
        <div className="structured-message" data-oid="exj:508">
          {data.intro && (
            <p className="message-intro" data-oid="5_elwk:">
              {data.intro}
            </p>
          )}

          {data.profiles && data.profiles.length > 0 && (
            <div className="tutor-profiles" data-oid="_q8iod2">
              {data.profiles.map((profile, index) => (
                <TutorCard key={index} tutor={profile} data-oid="r4i0m59" />
              ))}
            </div>
          )}

          {data.outro && (
            <p className="message-outro" data-oid="kp.on9a">
              {data.outro}
            </p>
          )}
        </div>
      );
    } else {
      // Fallback to displaying as regular text
      return <p data-oid="a:lvbop">{message}</p>;
    }
  } catch (e) {
    // If it's not valid JSON, display as regular text
    return <p data-oid="fw6bsjh">{message}</p>;
  }
};

export default StructuredMessage;
