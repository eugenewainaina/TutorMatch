import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../config';
import './StudentMessages.css';

const StudentMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedMessages, setGroupedMessages] = useState({});

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}/student_messages`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch student messages');
                }

                const data = await response.json();
                setMessages(data);

                // Group messages by tutor
                const grouped = data.reduce((acc, message) => {
                    if (!acc[message.tutor_id]) {
                        acc[message.tutor_id] = {
                            tutorName: message.tutor_name,
                            messages: []
                        };
                    }
                    acc[message.tutor_id].messages.push(message);
                    return acc;
                }, {});

                setGroupedMessages(grouped);
            } catch (error) {
                console.error('Error fetching student messages:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    // Format timestamp to a readable date and time
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="loading-container">Loading student messages...</div>;
    }

    if (error) {
        return <div className="error-container">Error: {error}</div>;
    }

    if (messages.length === 0) {
        return <div className="no-messages">No messages found for your child.</div>;
    }

    return (
        <div className="student-messages-container">
            <h1 className="messages-title">Student Messages</h1>
            <p className="messages-subtitle">Monitoring your child's communications with tutors</p>

            {Object.entries(groupedMessages).map(([tutorId, { tutorName, messages }]) => (
                <div key={tutorId} className="tutor-message-group">
                    <h2 className="tutor-name">Tutor: {tutorName}</h2>
                    <div className="messages-list">
                        {messages.map(message => (
                            <div key={message.message_id} className="message-item">
                                <div className="message-header">
                                    <span className="message-sender">
                                        {message.sender_role === 'student' ? 'Your Child' : tutorName}
                                    </span>
                                    <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                                </div>
                                <div className="message-content">{message.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentMessages;
