import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SERVER_URL } from '../config';
import './TutorProfile.css';
import '../styles/GlobalStyles.css';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const TutorProfile = () => {
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const location = useLocation();

    // TODO: investigate
    // Extract tutor ID from URL params or location state (when coming from recommendation)
    const tutorId = id || (location.state && location.state.tutorId);

    const fetchTutorProfile = async () => {
        try {
            setLoading(true);

            const apiUrl = `${SERVER_URL}/299720c5-1d18-40fe-894d-7a738be84814/tutors/${tutorId}`;
            console.log("Fetching tutor profile from:", apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Server responded with status: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch tutor profile: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Successfully fetched tutor data:', data);
            setTutor(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching tutor profile:', err);
            // console.log("Using fallback mock data after API error");
            // // Fallback to mock data if API fails
            // setTutor(mockTutorData);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {


        if (tutorId) {
            fetchTutorProfile();
        } else {
            setError('No tutor ID provided');
            setLoading(false);
        }
    }, [tutorId]);

    if (loading) {
        return (
            <>
                <Navbar />
                <Loader />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="profile-error">{error}</div>
            </>
        );
    }

    if (!tutor) {
        return (
            <>
                <Navbar />
                <div className="profile-error">No tutor information available</div>
            </>
        );
    }

    const renderSkills = () => {
        return Object.entries(tutor.skills || {}).map(([skill, details]) => (
            <div key={skill} className="skill-item">
                <div className="skill-header">
                    <h4>{skill}</h4>
                </div>
                <div className="skill-details">
                    <p><span>Teaching Mode:</span> {details["mode of teaching"]}</p>
                    {details["online hourly charge"] && (
                        <p><span>Online Rate:</span> ${details["online hourly charge"]}/hour</p>
                    )}
                    {details["physical hourly charge"] && (
                        <p><span>In-Person Rate:</span> ${details["physical hourly charge"]}/hour</p>
                    )}
                </div>
            </div>
        ));
    };

    const renderEducation = () => {
        return Object.entries(tutor.education || {}).map(([degree, details]) => (
            <div key={degree} className="education-item">
                <h4>{degree}</h4>
                <p>{details.institution}</p>
                <p>Completed: {details["end year"]}</p>
            </div>
        ));
    };

    const renderWorkExperience = () => {
        return Object.entries(tutor.work_experience || {}).map(([position, details]) => (
            <div key={position} className="experience-item">
                <h4>{position}</h4>
                <p><strong>{details.company}</strong> • {details["employment type"]}</p>
                <p>{details["start year"]} - {details["end year"] || "Present"}</p>
            </div>
        ));
    };

    const renderCertifications = () => {
        return Object.entries(tutor.certifications || {}).map(([certification, details]) => (
            <div key={certification} className="certification-item">
                <h4>{certification}</h4>
                <p>Issued by {details["certification body"]} • {details.year}</p>
            </div>
        ));
    };

    return (
        <>
            <Navbar />
            <div className="tutor-profile-container">
                <div className="profile-header">
                    <div className="profile-cover"></div>
                    <div className="profile-info">
                        <div className="profile-image">
                            <img
                                src={tutor.profile_picture || '/profile_icon.png'}
                                alt={`${tutor.name}'s profile`}
                                onError={(e) => {
                                    e.target.onerror = null; // prevent infinite loop
                                    e.target.src = '/profile_icon.png'; // fallback image
                                }}
                            />
                        </div>
                        <div className="profile-headline">
                            <h1>{tutor.name}</h1>
                            <p className="location">{tutor.location}</p>
                            {/* <p className="contact-info">{tutor.email}</p> */}
                            <div className="languages">
                                <strong>Languages:</strong> {tutor.languages_spoken?.join(', ')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-body">
                    <div className="profile-main">
                        <section className="about-section">
                            <h2>About</h2>
                            <p>{tutor.bio}</p>
                        </section>

                        <section className="skills-section">
                            <h2>Skills & Pricing</h2>
                            <div className="skills-container">
                                {renderSkills()}
                            </div>
                        </section>

                        <section className="experience-section">
                            <h2>Experience</h2>
                            <div className="experience-container">
                                {renderWorkExperience()}
                            </div>
                        </section>

                        <section className="education-section">
                            <h2>Education</h2>
                            <div className="education-container">
                                {renderEducation()}
                            </div>
                        </section>

                        <section className="certifications-section">
                            <h2>Certifications</h2>
                            <div className="certifications-container">
                                {renderCertifications()}
                            </div>
                        </section>
                    </div>

                    <div className="profile-sidebar">
                        <div className="contact-card">
                            <h3>Contact Information</h3>
                            <p><strong>Email:</strong> {tutor.email}</p>
                            <p><strong>Location:</strong> {tutor.location}</p>
                            <button className="request-button">Request Tutoring Session</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TutorProfile;
