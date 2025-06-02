import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../config';
import './StudentProfile.css';
import '../styles/GlobalStyles.css';
import Loader from '../components/Loader';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionExists, setConnectionExists] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Extract student ID from URL params or location state
    const studentId = id || (location.state && location.state.studentId);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);

            const apiUrl = `${SERVER_URL}/299720c5-1d18-40fe-894d-7a738be84814/students/${studentId}`;
            console.log("Fetching student profile from:", apiUrl);

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
                throw new Error(`Failed to fetch student profile: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Successfully fetched student data:', data);
            // Process the refactored response (which only includes name, email, languages_spoken, profile_picture, location, education)
            setStudent(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching student profile:', err);
            setError(`Failed to load student profile: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const checkConnection = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/check_connection`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ other_id: studentId })
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
                    role: data.role || null
                });
                console.log("Connection details:", data);
                console.log("Connection status values:", {
                    role: data.role,
                    tutor_accepted: data.tutor_accepted,
                    student_accepted: data.student_accepted,
                    showAcceptButton: 
                        (data.role === 'student' && !data.student_accepted && data.tutor_accepted) || 
                        (data.role === 'tutor' && !data.tutor_accepted && data.student_accepted)
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
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    other_id: studentId,
                    connection: true 
                })
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
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    other_id: studentId,
                    connection: true 
                })
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
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    other_id: studentId,
                    connection: false 
                })
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
        navigate(`/chats/${studentId}`);
    };

    useEffect(() => {
        if (studentId) {
            fetchStudentProfile();
            checkConnection();
        } else {
            setError('No student ID provided');
            setLoading(false);
        }
    }, [studentId]);

    if (loading) {
        return (
            <>
                <Loader />
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="profile-error">{error}</div>
            </>
        );
    }

    if (!student) {
        return (
            <>
                <div className="profile-error">No student information available</div>
            </>
        );
    }

    return (
        <>
            <div className="student-profile-container">
                <div className="profile-header">
                    <div className="profile-cover"></div>
                    <div className="profile-info">
                        <div className="profile-image">
                            <img
                                src={student.profile_picture || '/profile_icon.png'}
                                alt={`${student.name}'s profile`}
                                onError={(e) => {
                                    e.target.onerror = null; // prevent infinite loop
                                    e.target.src = '/profile_icon.png'; // fallback image
                                }}
                            />
                        </div>
                        <div className="profile-headline">
                            <h1>{student.name}</h1>
                            {student.location && <p className="location">{student.location}</p>}
                            {student.languages_spoken && student.languages_spoken.length > 0 && (
                                <div className="languages">
                                    <strong>Languages:</strong> {student.languages_spoken.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-body">
                    <div className="profile-main">
                        <section className="education-section">
                            <h2>Education</h2>
                            {student.education ? (
                                <div className="education-container">
                                    {Object.entries(student.education).map(([degree, details]) => (
                                        <div key={degree} className="education-item">
                                            <h4>{degree}</h4>
                                            <p>{details.institution}</p>
                                            <p>Completed: {details["end year"]}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-info-message">No education information available</p>
                            )}
                        </section>

                        {/* Removed preferred learning mode section since it's not in the new API response */}
                    </div>

                    <div className="profile-sidebar">
                        <div className="contact-card">
                            <h3>Contact Information</h3>
                            <p><strong>Email:</strong> {student.email}</p>
                            {student.location && <p><strong>Location:</strong> {student.location}</p>}
                            
                            {!connectionExists ? (
                                // No connection exists - show Connect button
                                <button 
                                    className="action-button connect-button" 
                                    onClick={handleConnect}
                                    disabled={connecting}>
                                    {connecting ? 'Connecting...' : 'Connect'}
                                </button>
                            ) : connectionStatus?.tutor_accepted && connectionStatus?.student_accepted ? (
                                // Both have accepted - show message button
                                <div className="action-buttons-container">
                                    <button 
                                        className="action-button message-button" 
                                        onClick={handleMessage}>
                                        Message
                                    </button>
                                    <button 
                                        className="action-button remove-button" 
                                        onClick={handleRemoveConnection}
                                        disabled={connecting}>
                                        {connecting ? 'Removing...' : 'Remove Connection'}
                                    </button>
                                </div>
                            ) : connectionStatus?.role === 'student' && !connectionStatus?.student_accepted && connectionStatus?.tutor_accepted ? (
                                // Student viewing student profile, tutor accepted but student hasn't
                                <button 
                                    className="action-button accept-button" 
                                    onClick={handleAcceptConnection}
                                    disabled={connecting}>
                                    {connecting ? 'Accepting...' : 'Accept Connection'}
                                </button>
                            ) : connectionStatus?.role === 'tutor' && !connectionStatus?.tutor_accepted && connectionStatus?.student_accepted ? (
                                // Tutor viewing student profile, student accepted but tutor hasn't
                                <button 
                                    className="action-button accept-button" 
                                    onClick={handleAcceptConnection}
                                    disabled={connecting}>
                                    {connecting ? 'Accepting...' : 'Accept Connection'}
                                </button>
                            ) : connectionStatus?.role === 'student' && connectionStatus?.student_accepted && !connectionStatus?.tutor_accepted ? (
                                // Student has accepted but tutor hasn't - show waiting message
                                <div className="action-buttons-container">
                                    <div className="connection-status-text waiting">
                                        Waiting for acceptance
                                    </div>
                                    <button 
                                        className="action-button remove-button" 
                                        onClick={handleRemoveConnection}
                                        disabled={connecting}>
                                        {connecting ? 'Removing...' : 'Remove Connection'}
                                    </button>
                                </div>
                            ) : connectionStatus?.role === 'tutor' && connectionStatus?.tutor_accepted && !connectionStatus?.student_accepted ? (
                                // Tutor has accepted but student hasn't - show waiting message
                                <div className="action-buttons-container">
                                    <div className="connection-status-text waiting">
                                        Waiting for acceptance
                                    </div>
                                    <button 
                                        className="action-button remove-button" 
                                        onClick={handleRemoveConnection}
                                        disabled={connecting}>
                                        {connecting ? 'Removing...' : 'Remove Connection'}
                                    </button>
                                </div>
                            ) : (
                                // Default case - show remove connection button
                                <button 
                                    className="action-button remove-button" 
                                    onClick={handleRemoveConnection}
                                    disabled={connecting}>
                                    {connecting ? 'Removing...' : 'Remove Connection'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentProfile;