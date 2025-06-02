import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SERVER_URL } from "../config";
import "./TutorProfile.css";
import "../styles/GlobalStyles.css";
import Loader from "../components/Loader";

const TutorProfile = () => {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionExists, setConnectionExists] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // TODO: investigate
  // Extract tutor ID from URL params or location state (when coming from recommendation)
  const tutorId = id || (location.state && location.state.tutorId);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);

      const apiUrl = `${SERVER_URL}/299720c5-1d18-40fe-894d-7a738be84814/tutors/${tutorId}`;
      console.log("Fetching tutor profile from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `Server responded with status: ${response.status} ${response.statusText}`,
        );
        throw new Error(
          `Failed to fetch tutor profile: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Successfully fetched tutor data:", data);
      setTutor(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tutor profile:", err);
      // console.log("Using fallback mock data after API error");
      // // Fallback to mock data if API fails
      // setTutor(mockTutorData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/check_connection`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ other_id: tutorId }),
      });

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        return;
      }

      const data = await response.json();

      // Check if a connection exists (response has content)
      const hasConnection = Object.keys(data).length > 0;
      setConnectionExists(hasConnection);

      if (hasConnection) {
        // Store the full connection details
        setConnectionStatus({
          id: data.id,
          tutor_accepted: data.tutor_accepted,
          student_accepted: data.student_accepted,
          role: data.role || null,
        });
        console.log("Connection details:", data);
        console.log("Connection status values:", {
          role: data.role,
          tutor_accepted: data.tutor_accepted,
          student_accepted: data.student_accepted,
          showAcceptButton:
            (data.role === "student" &&
              !data.student_accepted &&
              data.tutor_accepted) ||
            (data.role === "tutor" &&
              !data.tutor_accepted &&
              data.student_accepted),
        });
      } else {
        setConnectionStatus(null);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await fetch(`${SERVER_URL}/connect`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          other_id: tutorId,
          connection: true,
        }),
      });

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        return;
      }

      // Connection successful - refresh connection status
      checkConnection();
    } catch (err) {
      console.error("Error connecting:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleAcceptConnection = async () => {
    try {
      setConnecting(true);
      const response = await fetch(`${SERVER_URL}/connect`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          other_id: tutorId,
          connection: true,
        }),
      });

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        return;
      }

      // Acceptance successful - refresh connection status
      checkConnection();
    } catch (err) {
      console.error("Error accepting connection:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      setConnecting(true);
      const response = await fetch(`${SERVER_URL}/connect`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          other_id: tutorId,
          connection: false,
        }),
      });

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        return;
      }

      // Removal successful - refresh connection status
      checkConnection();
    } catch (err) {
      console.error("Error removing connection:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = () => {
    navigate(`/chats/${tutorId}`);
  };

  useEffect(() => {
    if (tutorId) {
      fetchTutorProfile();
      checkConnection();
    } else {
      setError("No tutor ID provided");
      setLoading(false);
    }
  }, [tutorId]);

  if (loading) {
    return (
      <>
        <Loader data-oid="1vgir.n" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="profile-error" data-oid="kdwf_cb">
          {error}
        </div>
      </>
    );
  }

  if (!tutor) {
    return (
      <>
        <div className="profile-error" data-oid="-9h.gp:">
          No tutor information available
        </div>
      </>
    );
  }

  const renderSkills = () => {
    return Object.entries(tutor.skills || {}).map(([skill, details]) => (
      <div key={skill} className="skill-item" data-oid="b9srgz7">
        <div className="skill-header" data-oid="ly8h8u.">
          <h4 data-oid="tqfdcsi">{skill}</h4>
        </div>
        <div className="skill-details" data-oid="-wmtw-o">
          <p data-oid="pkjxfm3">
            <span data-oid="34vd:3x">Teaching Mode:</span>{" "}
            {details["mode of teaching"]}
          </p>
          {details["online hourly charge"] && (
            <p data-oid=":.cgkqr">
              <span data-oid="615-pcq">Online Rate:</span> $
              {details["online hourly charge"]}/hour
            </p>
          )}
          {details["physical hourly charge"] && (
            <p data-oid="o1iynuz">
              <span data-oid="a0vj4li">In-Person Rate:</span> $
              {details["physical hourly charge"]}
              /hour
            </p>
          )}
        </div>
      </div>
    ));
  };

  const renderEducation = () => {
    return Object.entries(tutor.education || {}).map(([degree, details]) => (
      <div key={degree} className="education-item" data-oid="ex_sgc5">
        <h4 data-oid="ggdvlg9">{degree}</h4>
        <p data-oid="5yr33p6">{details.institution}</p>
        <p data-oid="j2rpomh">Completed: {details["end year"]}</p>
      </div>
    ));
  };

  const renderWorkExperience = () => {
    return Object.entries(tutor.work_experience || {}).map(
      ([position, details]) => (
        <div key={position} className="experience-item" data-oid="7feyeqc">
          <h4 data-oid="9.:5dn:">{position}</h4>
          <p data-oid="yta-0xq">
            <strong data-oid="75nwjk0">{details.company}</strong> •{" "}
            {details["employment type"]}
          </p>
          <p data-oid="asqcd1q">
            {details["start year"]} - {details["end year"] || "Present"}
          </p>
        </div>
      ),
    );
  };

  const renderCertifications = () => {
    return Object.entries(tutor.certifications || {}).map(
      ([certification, details]) => (
        <div
          key={certification}
          className="certification-item"
          data-oid="pd_q_tu"
        >
          <h4 data-oid="34k0mx5">{certification}</h4>
          <p data-oid="thaarhm">
            Issued by {details["certification body"]} • {details.year}
          </p>
        </div>
      ),
    );
  };

  return (
    <>
      <div className="tutor-profile-container" data-oid="5p16fu8">
        <div className="profile-header" data-oid="6cg3ynb">
          <div className="profile-cover" data-oid="03ouglq"></div>
          <div className="profile-info" data-oid="d4ey:b:">
            <div className="profile-image" data-oid="wik.x_z">
              <img
                src={tutor.profile_picture || "/profile_icon.png"}
                alt={`${tutor.name}'s profile`}
                onError={(e) => {
                  e.target.onerror = null; // prevent infinite loop
                  e.target.src = "/profile_icon.png"; // fallback image
                }}
                data-oid="869w_ph"
              />
            </div>
            <div className="profile-headline" data-oid="-ng2:nj">
              <h1 data-oid="-cht0y7">{tutor.name}</h1>
              <p className="location" data-oid="2_ae9rw">
                {tutor.location}
              </p>
              {/* <p className="contact-info">{tutor.email}</p> */}
              <div className="languages" data-oid="1bo28kz">
                <strong data-oid="m0n7ebc">Languages:</strong>{" "}
                {tutor.languages_spoken?.join(", ")}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-body" data-oid="xe6i2a2">
          <div className="profile-main" data-oid="jki5h9.">
            <section className="about-section" data-oid="piq5v68">
              <h2 data-oid="0j8d439">About</h2>
              <p data-oid="dji1ymc">{tutor.bio}</p>
            </section>

            <section className="skills-section" data-oid="-99.5rv">
              <h2 data-oid="68mrg.w">Skills & Pricing</h2>
              <div className="skills-container" data-oid="d342pos">
                {renderSkills()}
              </div>
            </section>

            <section className="experience-section" data-oid="b:xpfrx">
              <h2 data-oid="i8an.f_">Experience</h2>
              <div className="experience-container" data-oid="t2rhtpt">
                {renderWorkExperience()}
              </div>
            </section>

            <section className="education-section" data-oid="1js70yf">
              <h2 data-oid="oiayyzd">Education</h2>
              <div className="education-container" data-oid="ssy-h_8">
                {renderEducation()}
              </div>
            </section>

            <section className="certifications-section" data-oid="wp4mg4f">
              <h2 data-oid="oslvheh">Certifications</h2>
              <div className="certifications-container" data-oid="geefu8c">
                {renderCertifications()}
              </div>
            </section>
          </div>

          <div className="profile-sidebar" data-oid="4q2qjdq">
            <div className="contact-card" data-oid="432a6vc">
              <h3 data-oid="0xgp8i.">Contact Information</h3>
              <p data-oid="q3uu03w">
                <strong data-oid="g.allxb">Email:</strong> {tutor.email}
              </p>
              <p data-oid="o85l7b0">
                <strong data-oid="f0lo4zv">Location:</strong> {tutor.location}
              </p>

              {!connectionExists ? (
                // No connection exists - show Connect button
                <button
                  className="action-button connect-button"
                  onClick={handleConnect}
                  disabled={connecting}
                  data-oid="o1rr5i-"
                >
                  {connecting ? "Connecting..." : "Connect"}
                </button>
              ) : connectionStatus?.tutor_accepted &&
                connectionStatus?.student_accepted ? (
                // Both have accepted - show message button
                <div className="action-buttons-container" data-oid="_4.eh79">
                  <button
                    className="action-button message-button"
                    onClick={handleMessage}
                    data-oid="bti1gtw"
                  >
                    Message
                  </button>
                  <button
                    className="action-button remove-button"
                    onClick={handleRemoveConnection}
                    disabled={connecting}
                    data-oid="lqpg4nl"
                  >
                    {connecting ? "Removing..." : "Remove Connection"}
                  </button>
                </div>
              ) : connectionStatus?.role === "student" &&
                !connectionStatus?.student_accepted &&
                connectionStatus?.tutor_accepted ? (
                // Student viewing tutor profile, tutor accepted but student hasn't
                <button
                  className="action-button accept-button"
                  onClick={handleAcceptConnection}
                  disabled={connecting}
                  data-oid="a2dilul"
                >
                  {connecting ? "Accepting..." : "Accept Connection"}
                </button>
              ) : connectionStatus?.role === "tutor" &&
                !connectionStatus?.tutor_accepted &&
                connectionStatus?.student_accepted ? (
                // Tutor viewing their own profile, student accepted but tutor hasn't
                <button
                  className="action-button accept-button"
                  onClick={handleAcceptConnection}
                  disabled={connecting}
                  data-oid="gtmx29n"
                >
                  {connecting ? "Accepting..." : "Accept Connection"}
                </button>
              ) : connectionStatus?.role === "student" &&
                connectionStatus?.student_accepted &&
                !connectionStatus?.tutor_accepted ? (
                // Student has accepted but tutor hasn't - show waiting message
                <div className="action-buttons-container" data-oid="j-2oyyi">
                  <div
                    className="connection-status-text waiting"
                    data-oid="bh7v0um"
                  >
                    Waiting for acceptance
                  </div>
                  <button
                    className="action-button remove-button"
                    onClick={handleRemoveConnection}
                    disabled={connecting}
                    data-oid="q_lvvdr"
                  >
                    {connecting ? "Removing..." : "Remove Connection"}
                  </button>
                </div>
              ) : connectionStatus?.role === "tutor" &&
                connectionStatus?.tutor_accepted &&
                !connectionStatus?.student_accepted ? (
                // Tutor has accepted but student hasn't - show waiting message
                <div className="action-buttons-container" data-oid="zxeds7t">
                  <div
                    className="connection-status-text waiting"
                    data-oid="pwdlw13"
                  >
                    Waiting for acceptance
                  </div>
                  <button
                    className="action-button remove-button"
                    onClick={handleRemoveConnection}
                    disabled={connecting}
                    data-oid="k790_rx"
                  >
                    {connecting ? "Removing..." : "Remove Connection"}
                  </button>
                </div>
              ) : (
                // Default case - show remove connection button
                <button
                  className="action-button remove-button"
                  onClick={handleRemoveConnection}
                  disabled={connecting}
                  data-oid="kid8jyc"
                >
                  {connecting ? "Removing..." : "Remove Connection"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorProfile;
