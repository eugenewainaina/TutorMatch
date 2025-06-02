import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../config';
import './Connections.css';
import '../styles/GlobalStyles.css';
import Loader from '../components/Loader';

const Connections = () => {
    const [connections, setConnections] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${SERVER_URL}/connections`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch connections: ${response.statusText}`);
            }

            const data = await response.json();
            
            // If we have an empty body, set empty connections
            if (!data || Object.keys(data).length === 0) {
                setConnections([]);
                setLoading(false);
                return;
            }
            
            setConnections(data.connections || []);
            setUserRole(data.role || '');
            
            // Fetch details for each connection
            await fetchConnectionProfiles(data.connections, data.role);
            
        } catch (err) {
            console.error('Error fetching connections:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchConnectionProfiles = async (connections, role) => {
        if (!connections || connections.length === 0) return;
        
        try {
            const profilePromises = connections.map(async (connection) => {
                // Determine which ID to use based on role
                const otherPersonId = role === 'student' ? connection.tutor_id : connection.student_id;
                const endpoint = role === 'student' 
                    ? `${SERVER_URL}/299720c5-1d18-40fe-894d-7a738be84814/tutors/${otherPersonId}`
                    : `${SERVER_URL}/299720c5-1d18-40fe-894d-7a738be84814/students/${otherPersonId}`;
                
                const response = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch profile: ${response.statusText}`);
                }
                
                const profile = await response.json();
                return {
                    ...profile,
                    connectionId: connection.id,
                    profileId: otherPersonId,
                    role: role === 'student' ? 'tutor' : 'student',
                    tutor_accepted: connection.tutor_accepted,
                    student_accepted: connection.student_accepted
                };
            });
            
            const resolvedProfiles = await Promise.all(profilePromises);
            setProfiles(resolvedProfiles);
        } catch (err) {
            console.error('Error fetching profiles:', err);
            setError(`Failed to load connection profiles: ${err.message}`);
        }
    };

    const handleProfileClick = (profileId, role) => {
        if (role === 'tutor') {
            navigate(`/tutors/profile/${profileId}`);
        } else {
            navigate(`/students/profile/${profileId}`);
        }
    };
    
    const handleAcceptConnection = async (profileId, e) => {
        // Prevent the click from propagating to the parent card
        e.stopPropagation();
        
        try {
            const response = await fetch(`${SERVER_URL}/connect`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    other_id: profileId,
                    connection: true 
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to accept connection: ${response.statusText}`);
            }

            // Refresh the connections list after accepting
            fetchConnections();
            
        } catch (err) {
            console.error('Error accepting connection:', err);
            setError(err.message);
        }
    };
    
    const handleRemoveConnection = async (profileId, e) => {
        // Prevent the click from propagating to the parent card
        e.stopPropagation();
        
        try {
            const response = await fetch(`${SERVER_URL}/connect`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    other_id: profileId,
                    connection: false 
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to remove connection: ${response.statusText}`);
            }

            // Refresh the connections list after removing
            fetchConnections();
            
        } catch (err) {
            console.error('Error removing connection:', err);
            setError(err.message);
        }
    };

    const getConnectionStatus = (profile) => {
        const { tutor_accepted, student_accepted } = profile;
        
        if (tutor_accepted && student_accepted) {
            return { text: 'Connected', className: 'status-connected' };
        } else if (
            (userRole === 'tutor' && tutor_accepted && !student_accepted) ||
            (userRole === 'student' && student_accepted && !tutor_accepted)
        ) {
            return { text: 'Waiting for acceptance', className: 'status-waiting' };
        } else {
            return { text: 'Pending your acceptance', className: 'status-pending' };
        }
    };

    if (loading) {
        return (
            <>
                <div className="connections-container">
                    <Loader />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="connections-container">
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="connections-container">
                <h1>Your Connections</h1>
                
                {profiles.length === 0 ? (
                    <div className="no-connections">
                        <p>You have no connections yet.</p>
                    </div>
                ) : (
                    <div className="connections-grid">
                        {profiles.map((profile) => (
                            <div 
                                key={profile.connectionId} 
                                className="connection-card"
                                onClick={() => handleProfileClick(profile.profileId, profile.role)}
                            >
                                <div className="connection-avatar">
                                    <img 
                                        src={profile.profile_picture || '/profile_icon.png'} 
                                        alt={`${profile.name}'s profile`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/profile_icon.png';
                                        }}
                                    />
                                </div>
                                <div className="connection-info">
                                    <h3>{profile.name}</h3>
                                    <p className="connection-location">{profile.location}</p>
                                    {profile.languages_spoken && profile.languages_spoken.length > 0 && (
                                        <p className="connection-languages">
                                            <span>Languages:</span> {profile.languages_spoken.join(', ')}
                                        </p>
                                    )}
                                    <div className="connection-actions">
                                        <div className={`connection-status ${getConnectionStatus(profile).className}`}>
                                            {getConnectionStatus(profile).text}
                                        </div>
                                        
                                        {((userRole === 'tutor' && !profile.tutor_accepted) || 
                                          (userRole === 'student' && !profile.student_accepted)) && (
                                            <button 
                                                className="accept-button"
                                                onClick={(e) => handleAcceptConnection(profile.profileId, e)}
                                            >
                                                Accept
                                            </button>
                                        )}

                                        {/* Show Remove Connection button only for fully connected users or when current user has accepted */}
                                        {(profile.tutor_accepted && profile.student_accepted) || 
                                         ((userRole === 'tutor' && profile.tutor_accepted) || 
                                          (userRole === 'student' && profile.student_accepted)) ? (
                                            <button 
                                                className="remove-button"
                                                onClick={(e) => handleRemoveConnection(profile.profileId, e)}
                                            >
                                                Remove Connection
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Connections;
