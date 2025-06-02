import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../config';
import './StudentLessons.css';

const StudentLessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedLessons, setGroupedLessons] = useState({});

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}/student_lessons`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch student lessons');
                }

                const data = await response.json();
                setLessons(data);

                // Group lessons by tutor for better organization
                const grouped = data.reduce((acc, lesson) => {
                    if (!acc[lesson.tutor_id]) {
                        acc[lesson.tutor_id] = {
                            tutorName: lesson.tutor_name,
                            lessons: []
                        };
                    }
                    acc[lesson.tutor_id].lessons.push(lesson);
                    return acc;
                }, {});

                setGroupedLessons(grouped);
            } catch (error) {
                console.error('Error fetching student lessons:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    // Format date and time for better display
    const formatDateTime = (dateTimeString) => {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleString('en-US', options);
    };

    // Calculate lesson duration in hours and minutes
    const calculateDuration = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (durationHours === 0) {
            return `${durationMinutes} minutes`;
        } else if (durationMinutes === 0) {
            return `${durationHours} hour${durationHours > 1 ? 's' : ''}`;
        } else {
            return `${durationHours} hour${durationHours > 1 ? 's' : ''} ${durationMinutes} minutes`;
        }
    };

    // Check if a lesson is in the past
    const isPastLesson = (endTime) => {
        return new Date(endTime) < new Date();
    };

    // Sort lessons - future lessons first, then by date
    const sortLessons = (lessons) => {
        return [...lessons].sort((a, b) => {
            const aIsPast = isPastLesson(a.end_time);
            const bIsPast = isPastLesson(b.end_time);
            
            // If one is past and one is future, future comes first
            if (aIsPast && !bIsPast) return 1;
            if (!aIsPast && bIsPast) return -1;
            
            // Otherwise sort by date (closest future date or most recent past date first)
            return new Date(a.start_time) - new Date(b.start_time);
        });
    };

    if (loading) {
        return <div className="loading-container">Loading student lessons...</div>;
    }

    if (error) {
        return <div className="error-container">Error: {error}</div>;
    }

    if (lessons.length === 0) {
        return <div className="no-lessons">No lessons found for your child.</div>;
    }

    return (
        <div className="student-lessons-container">
            <h1 className="lessons-title">Student Lessons</h1>
            <p className="lessons-subtitle">Monitor your child's learning sessions</p>

            {Object.entries(groupedLessons).map(([tutorId, { tutorName, lessons }]) => (
                <div key={tutorId} className="tutor-lesson-group">
                    <h2 className="tutor-name">Tutor: {tutorName}</h2>
                    <div className="lessons-list">
                        {sortLessons(lessons).map(lesson => (
                            <div 
                                key={lesson.lesson_id} 
                                className={`lesson-item ${isPastLesson(lesson.end_time) ? 'past-lesson' : 'upcoming-lesson'}`}
                            >
                                <div className="lesson-header">
                                    <span className="lesson-subject">{lesson.subject}</span>
                                    <span className="lesson-status">
                                        {isPastLesson(lesson.end_time) ? 'Completed' : 'Upcoming'}
                                    </span>
                                </div>
                                
                                <div className="lesson-details">
                                    <div className="lesson-time">
                                        <div><strong>Start:</strong> {formatDateTime(lesson.start_time)}</div>
                                        <div><strong>End:</strong> {formatDateTime(lesson.end_time)}</div>
                                        <div><strong>Duration:</strong> {calculateDuration(lesson.start_time, lesson.end_time)}</div>
                                    </div>
                                    
                                    <div className="lesson-info">
                                        <div>
                                            <strong>Format:</strong> {lesson.in_person ? 'In-Person' : 'Online'}
                                        </div>
                                        <div className="lesson-confirmation">
                                            <div>
                                                <strong>Student confirmed:</strong> 
                                                <span className={lesson.student_confirmed ? 'confirmed' : 'not-confirmed'}>
                                                    {lesson.student_confirmed ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div>
                                                <strong>Tutor confirmed:</strong> 
                                                <span className={lesson.tutor_confirmed ? 'confirmed' : 'not-confirmed'}>
                                                    {lesson.tutor_confirmed ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentLessons;
