// filepath: /Users/mac/Desktop/Code/4th Year Project Stuff/4th_yr_frontend/src/Lessons/Lessons.jsx
import React, { useState, useEffect } from 'react';
import { format, isToday, isTomorrow, isAfter, isBefore, parseISO } from 'date-fns';
import './Lessons.css';
import { SERVER_URL } from '../config';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [expandedLessons, setExpandedLessons] = useState([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDescription, setEditingDescription] = useState(null); // Stores the ID of lesson being edited or null
  const [editedDescription, setEditedDescription] = useState("");
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const [uploadMaterialsLessonId, setUploadMaterialsLessonId] = useState(null);
  
  // Create lesson modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subjectList, setSubjectList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [createLessonError, setCreateLessonError] = useState(null);
  
  // Form state
  const [lessonForm, setLessonForm] = useState({
    subject: '',
    customSubject: '',
    isCustomSubject: false,
    description: '',
    start_time: '',
    end_time: '',
    in_person: false,
    location: '',
    student_id: ''
  });
  
  // Suggestion form states
  const [showSuggestionForm, setShowSuggestionForm] = useState(null); // Stores lesson ID or null
  const [suggestionForm, setSuggestionForm] = useState({
    start_time: '',
    end_time: '',
    in_person: null,
    location: '',
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SERVER_URL}/lessons`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lessons');
        }

        const data = await response.json();
          console.log(data.lessons);

        setLessons(data.lessons || []);
        setRole(data.role || '');
        
        // Log the total number of lessons received
        console.log(`Total lessons received from API: ${(data.lessons || []).length}`);

        // If lessons exist, fetch suggestions
        if (data.lessons && data.lessons.length > 0) {
          const lessonIds = data.lessons.map(lesson => lesson.id);
          fetchLessonSuggestions(lessonIds);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setError('Failed to load lessons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const fetchLessonSuggestions = async (lessonIds) => {
    try {
      const response = await fetch(`${SERVER_URL}/lesson_suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ lessons: lessonIds }),
      });

      if (response.ok) {
        const suggestionsData = await response.json();
        if (suggestionsData && suggestionsData.length > 0) {
          // Convert suggestions array to an object with lesson_id as keys
          const suggestionsMap = {};
          suggestionsData.forEach(suggestion => {
            if (!suggestionsMap[suggestion.lesson_id]) {
              suggestionsMap[suggestion.lesson_id] = [];
            }
            suggestionsMap[suggestion.lesson_id].push(suggestion);
          });
          setSuggestions(suggestionsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson suggestions:', error);
    }
  };

  const fetchAdditionalDetails = async (lessonId) => {
    if (additionalDetails[lessonId]) {
      return; // Already fetched
    }

    try {
      const response = await fetch(`${SERVER_URL}/b7c880a1-d79d-46f3-a5fb-867f87f49713/lessons/additional/${lessonId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson details');
      }

      const data = await response.json();
      setAdditionalDetails(prev => ({
        ...prev,
        [lessonId]: data
      }));
    } catch (error) {
      console.error('Error fetching lesson details:', error);
    }
  };

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons(prev => {
      if (prev.includes(lessonId)) {
        // If already expanded, remove it from the array
        return prev.filter(id => id !== lessonId);
      } else {
        // If not expanded, add it to the array and fetch details
        fetchAdditionalDetails(lessonId);
        return [...prev, lessonId];
      }
    });
    // Reset expanded suggestion when toggling lesson
    setExpandedSuggestion(null);
  };

  const toggleSuggestionExpand = (suggestionId) => {
    setExpandedSuggestion(expandedSuggestion === suggestionId ? null : suggestionId);
  };
  
  const acceptSuggestion = async (suggestionId) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/accept_suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          suggestion_id: suggestionId
        }),
      });

      if (response.ok) {
        alert('Suggestion accepted successfully!');
        window.location.reload();
      } else {
        console.error('Failed to accept suggestion');
        alert('Failed to accept suggestion. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      alert('An error occurred while accepting the suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLessonConfirmation = async (lessonId, isConfirmed) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lesson_id: lessonId,
          reason: "confirmation",
          confirmation: !isConfirmed // Toggle current confirmation status
        }),
      });

      if (response.ok) {
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        console.error('Failed to update lesson confirmation status');
        alert('Failed to update lesson confirmation. Please try again.');
      }
    } catch (error) {
      console.error('Error updating lesson confirmation:', error);
      alert('An error occurred while updating the lesson. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startEditingDescription = (lessonId, currentDescription) => {
    setEditingDescription(lessonId);
    setEditedDescription(currentDescription || '');
  };
  
  const cancelEditingDescription = () => {
    setEditingDescription(null);
    setEditedDescription('');
  };
  
  const saveEditedDescription = async (lessonId) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lesson_id: lessonId,
          reason: "edit",
          description: editedDescription
        }),
      });

      if (response.ok) {
        // Update the local state to avoid a full page reload
        setAdditionalDetails(prev => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            description: editedDescription
          }
        }));
        setEditingDescription(null);
      } else {
        console.error('Failed to update lesson description');
        alert('Failed to update description. Please try again.');
      }
    } catch (error) {
      console.error('Error updating lesson description:', error);
      alert('An error occurred while updating the description. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileInputChange = async (event, lessonId) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0]; // For now, just handle one file
    
    try {
      setUploadingMaterials(true);
      setUploadMaterialsLessonId(lessonId);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      const uploadResponse = await fetch(`${SERVER_URL}/upload_material`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      // Get the URL of the uploaded material
      const materialData = await uploadResponse.json();
      const materialUrl = materialData.material_url;
      
      // Update the lesson with the material URL
      const updateResponse = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lesson_id: lessonId,
          reason: "edit",
          learning_materials_url: materialUrl
        }),
      });
      
      if (updateResponse.ok) {
        // Update the local state
        setAdditionalDetails(prev => {
          const currentMaterials = prev[lessonId]?.learning_materials_url;
          let updatedMaterials;
          
          if (!currentMaterials) {
            updatedMaterials = materialUrl;
          } else if (Array.isArray(currentMaterials)) {
            updatedMaterials = [...currentMaterials, materialUrl];
          } else {
            updatedMaterials = [currentMaterials, materialUrl];
          }
          
          return {
            ...prev,
            [lessonId]: {
              ...prev[lessonId],
              learning_materials_url: updatedMaterials
            }
          };
        });
        
        alert('Learning material uploaded successfully!');
      } else {
        console.error('Failed to update lesson with material URL');
        alert('Failed to link the uploaded material to the lesson. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading learning material:', error);
      alert('Error: ' + (error.message || 'Failed to upload material'));
    } finally {
      setUploadingMaterials(false);
      setUploadMaterialsLessonId(null);
      
      // Clear the file input
      event.target.value = "";
    }
  };
  
  const openSuggestionForm = (lessonId, lesson) => {
    // Get lesson details which contain the location
    const lessonDetails = additionalDetails[lessonId] || {};
    
    // Get the current in-person status (defaulting to false if undefined)
    const isInPerson = lesson.in_person === true;
    
    // Pre-fill form with current values
    setSuggestionForm({
      start_time: lesson.start_time ? new Date(lesson.start_time).toISOString().slice(0, 16) : '',
      end_time: lesson.end_time ? new Date(lesson.end_time).toISOString().slice(0, 16) : '',
      in_person: isInPerson,
      location: isInPerson ? (lessonDetails.location || lesson.location || '') : ''
    });
    
    console.log("Opening suggestion form with values:", {
      in_person: isInPerson,
      location: isInPerson ? (lessonDetails.location || lesson.location || '') : ''
    });
    
    setShowSuggestionForm(lessonId);
  };
  
  const closeSuggestionForm = () => {
    setShowSuggestionForm(null);
    setSuggestionForm({
      start_time: '',
      end_time: '',
      in_person: null,
      location: ''
    });
  };
  
  const handleSuggestionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for checkbox
    if (type === 'checkbox') {
      // For in_person checkbox, handle special case
      if (name === 'in_person') {
        // If changing to online (false), clear the location
        if (!checked) {
          setSuggestionForm(prev => ({
            ...prev,
            in_person: checked, // false for online
            location: ''        // clear location
          }));
        } else {
          // Changing to in-person (true)
          setSuggestionForm(prev => ({
            ...prev,
            in_person: checked  // true for in-person
          }));
        }
      } else {
        // For other checkboxes (if any)
        setSuggestionForm(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      // For non-checkbox inputs
      setSuggestionForm(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Debug
    console.log(`Field ${name} updated to:`, type === 'checkbox' ? checked : value);
  };
  
  const submitSuggestion = async (lessonId) => {
    // Validate form
    const hasChanges = Object.entries(suggestionForm).some(([key, value]) => {
      if (value === '' || value === null) return false;
      return true;
    });
    
    if (!hasChanges) {
      alert('Please make at least one suggestion before submitting.');
      return;
    }
    
    // Check if in-person is selected but no location is provided
    if (suggestionForm.in_person === true && !suggestionForm.location) {
      alert('Please specify a location for in-person lessons.');
      return;
    }
    
    // Build request payload
    const payload = {
      lesson_id: lessonId,
      reason: "suggestion",
      suggester: role
    };
    
    // Only include fields that have values
    if (suggestionForm.start_time) payload.start_time = new Date(suggestionForm.start_time).toISOString();
    if (suggestionForm.end_time) payload.end_time = new Date(suggestionForm.end_time).toISOString();
    if (suggestionForm.in_person !== null) payload.in_person = suggestionForm.in_person;
    if (suggestionForm.location) payload.location = suggestionForm.location;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Your suggestion has been submitted successfully!');
        window.location.reload();
      } else {
        console.error('Failed to submit suggestion');
        alert('Failed to submit suggestion. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('An error occurred while submitting your suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
      closeSuggestionForm();
    }
  };

  const formatLessonTime = (startTime) => {
    const date = parseISO(startTime);
    
    if (isToday(date)) {
      return `Today ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow ${format(date, 'h:mm a')}`;
    } else {
      return `${format(date, 'do MMM yyyy h:mm a')}`;
    }
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime) return "Time not specified";
    
    const start = parseISO(startTime);
    
    let dayPart;
    if (isToday(start)) {
      dayPart = "Today";
    } else if (isTomorrow(start)) {
      dayPart = "Tomorrow";
    } else {
      dayPart = format(start, "do MMM yyyy");
    }
    
    const timePart = endTime 
      ? `${format(start, "h:mm a")} - ${format(parseISO(endTime), "h:mm a")}`
      : format(start, "h:mm a");
    
    return (
      <>
        <div className="lesson-day">{dayPart}</div>
        <div className="lesson-time">{timePart}</div>
      </>
    );
  };

  const getConfirmationStatus = (lesson) => {
    const { student_confirmed, tutor_confirmed } = lesson;

    if (!student_confirmed && !tutor_confirmed) {
      return "Pending";
    } else if (student_confirmed && tutor_confirmed) {
      return "Confirmed";
    } else if ((role === 'tutor' && !tutor_confirmed) || 
               (role === 'student' && !student_confirmed)) {
      return "Unconfirmed";
    }
    return "Pending Confirmation";
  };

  const categorizeByDate = (lessons) => {
    const now = new Date();
    console.log('Current date for categorization:', now);
    
    // Check for lessons with invalid date values
    const lessonsWithInvalidDates = lessons.filter(lesson => {
      if (!lesson.start_time) {
        console.log('Lesson missing start_time:', lesson);
        return true;
      }
      try {
        // Try to parse the date and check if it's valid
        const date = parseISO(lesson.start_time);
        const isValid = !isNaN(date.getTime());
        if (!isValid) {
          console.log('Lesson with invalid date format:', lesson);
          return true;
        }
        return false;
      } catch (e) {
        console.log('Error parsing lesson date:', e, lesson);
        return true;
      }
    });
    
    // Fix or exclude lessons with invalid dates
    const validLessons = lessons.filter(lesson => !lessonsWithInvalidDates.find(l => l.id === lesson.id));
    
    // Today's lessons - regardless of whether they're in the past or future
    const today = validLessons.filter(lesson => {
      const startTime = parseISO(lesson.start_time);
      return isToday(startTime);
    });

    // Future lessons that are not today
    const upcoming = validLessons.filter(lesson => {
      const startTime = parseISO(lesson.start_time);
      return isAfter(startTime, now) && !isToday(startTime);
    });

    // Past lessons that are not today
    const past = validLessons.filter(lesson => {
      const startTime = parseISO(lesson.start_time);
      return isBefore(startTime, now) && !isToday(startTime);
    });
    
    // Create an "other" category for lessons with invalid dates
    const other = lessonsWithInvalidDates;
    
    // Verify that all lessons are accounted for (debugging)
    const totalCategorized = today.length + upcoming.length + past.length + other.length;
    if (totalCategorized !== lessons.length) {
      console.log(`Warning: ${lessons.length - totalCategorized} lessons not categorized correctly`);
      
      // Find and log the uncategorized lessons
      const categorizedIds = [...today, ...upcoming, ...past, ...other].map(l => l.id);
      const uncategorized = lessons.filter(l => !categorizedIds.includes(l.id));
      console.log('Uncategorized lessons:', uncategorized);
      
      // Add any remaining uncategorized lessons to the "other" category
      other.push(...uncategorized);
    }

    return { today, upcoming, past, other };
  };

  const categorizeByConfirmationStatus = (lessons) => {
    const pending = lessons.filter(lesson => 
      !lesson.student_confirmed && !lesson.tutor_confirmed
    );
    
    const confirmed = lessons.filter(lesson => 
      lesson.student_confirmed && lesson.tutor_confirmed
    );
    
    const unconfirmed = lessons.filter(lesson => {
      if (role === 'tutor') {
        return !lesson.tutor_confirmed && lesson.student_confirmed;
      } else if (role === 'student') {
        return !lesson.student_confirmed && lesson.tutor_confirmed;
      }
      return false;
    });
    
    // Identify any lessons that might not fit into these categories
    const categorizedLessons = [...pending, ...confirmed, ...unconfirmed];
    const categorizedIds = categorizedLessons.map(l => l.id);
    const uncategorizedByStatus = lessons.filter(l => !categorizedIds.includes(l.id));
    
    // Log any lessons that don't fit into our categories
    if (uncategorizedByStatus.length > 0) {
      console.log(`Warning: ${uncategorizedByStatus.length} lessons not categorized by confirmation status`);
      console.log('Lessons not categorized by status:', uncategorizedByStatus);
      
      // Add uncategorized lessons to pending for now, to ensure all lessons are displayed
      return { 
        pending: [...pending, ...uncategorizedByStatus], 
        confirmed, 
        unconfirmed 
      };
    }

    return { pending, confirmed, unconfirmed };
  };

  const renderLessonCard = (lesson) => {
    const isExpanded = expandedLessons.includes(lesson.id);
    const lessonDetails = additionalDetails[lesson.id] || {};
    const lessonSuggestions = suggestions[lesson.id] || [];
    
    return (
      <div key={lesson.id} className="lesson-card-container">
        <div 
          className={`lesson-card ${isExpanded ? 'expanded' : ''} ${
            lesson.student_confirmed && lesson.tutor_confirmed ? 'fully-confirmed' : 
            (role === 'tutor' && lesson.tutor_confirmed) || (role === 'student' && lesson.student_confirmed) ? 'user-confirmed' : ''
          }`}
          onClick={() => toggleLessonExpand(lesson.id)}
        >
          <div className="lesson-info">
            {role === 'tutor' ? (
              <>
                <div className="lesson-subject">{lesson.subject}</div>
                <div className="lesson-other-name">{lesson.other_name}</div>
              </>
            ) : (
              <>
                <div className="lesson-other-name">{lesson.other_name}</div>
                <div className="lesson-subject">{lesson.subject}</div>
              </>
            )}
            <div className="lesson-mode">
              {lesson.in_person ? 'In-person' : 'Online'}
            </div>
            <div className="lesson-confirmation-status">
              {getConfirmationStatus(lesson)}
            </div>
          </div>
          
          <div className="lesson-time-container">
            {formatTimeRange(lesson.start_time, lesson.end_time)}
          </div>
        </div>

        {isExpanded && (
          <div className="lesson-details">
            {/* Display confirmation button based on role and confirmation status */}
            <div className="lesson-actions">
              <div className="lesson-confirmation">
                {role === 'tutor' ? (
                  !lesson.tutor_confirmed ? (
                    <button 
                      className="confirm-lesson-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, false);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Confirming...' : 'Confirm Lesson'}
                    </button>
                  ) : (
                    <button 
                      className="unconfirm-lesson-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, true);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Unconfirm Lesson'}
                    </button>
                  )
                ) : role === 'student' ? (
                  !lesson.student_confirmed ? (
                    <button 
                      className="confirm-lesson-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, false);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Confirming...' : 'Confirm Lesson'}
                    </button>
                  ) : (
                    <button 
                      className="unconfirm-lesson-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, true);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Unconfirm Lesson'}
                    </button>
                  )
                ) : null}
              </div>
              
              {/* Show the suggest button unless this user already has a suggestion */}
              {(!lessonSuggestions.some(s => s.suggester && s.suggester === role)) && (
                <button 
                  className="suggest-lesson-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openSuggestionForm(lesson.id, lesson);
                  }}
                >
                  Suggest Changes
                </button>
              )}
            </div>
            
            {/* Suggestion Form */}
            {showSuggestionForm === lesson.id && (
              <div className="suggestion-form-container">
                <h4>Suggest Changes</h4>
                <div className="suggestion-form">
                  <div className="form-group">
                    <label htmlFor="start-time">Suggest Start Time:</label>
                    <input 
                      type="datetime-local" 
                      id="start-time" 
                      name="start_time" 
                      value={suggestionForm.start_time}
                      onChange={handleSuggestionFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="end-time">Suggest End Time:</label>
                    <input 
                      type="datetime-local" 
                      id="end-time" 
                      name="end_time" 
                      value={suggestionForm.end_time}
                      onChange={handleSuggestionFormChange}
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input 
                        type="checkbox" 
                        name="in_person" 
                        checked={suggestionForm.in_person === true}
                        onChange={(e) => {
                          handleSuggestionFormChange(e);
                        }}
                      />
                      In-person lesson
                    </label>
                  </div>
                  
                  {suggestionForm.in_person && (
                    <div className="form-group">
                      <label htmlFor="location">Suggest Location:</label>
                      <input 
                        type="text" 
                        id="location" 
                        name="location" 
                        value={suggestionForm.location}
                        onChange={handleSuggestionFormChange}
                        placeholder="Enter location"
                      />
                    </div>
                  )}
                  
                  <div className="suggestion-form-buttons">
                    <button 
                      className="submit-suggestion-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        submitSuggestion(lesson.id);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                    </button>
                    <button 
                      className="cancel-suggestion-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        closeSuggestionForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="lesson-description">
              <strong>Description:</strong> 
              {editingDescription === lesson.id ? (
                <div className="description-edit-container">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="description-edit-textarea"
                    rows={4}
                    placeholder="Enter lesson description..."
                  />
                  <div className="description-edit-buttons">
                    <button 
                      className="save-description-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEditedDescription(lesson.id);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className="cancel-edit-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditingDescription();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="description-content">
                  {lessonDetails.description || 'No description provided'}
                  {role === 'tutor' && (
                    <button 
                      className="edit-description-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingDescription(lesson.id, lessonDetails.description || '');
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Upload Learning Materials Section */}
            {role === 'tutor' && (
              <div className="lesson-materials-upload">
                <input
                  type="file"
                  id={`file-upload-${lesson.id}`}
                  className="file-input"
                  onChange={(e) => handleFileInputChange(e, lesson.id)}
                  style={{ display: 'none' }}
                />
                <button 
                  className="upload-materials-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById(`file-upload-${lesson.id}`).click();
                  }}
                  disabled={uploadingMaterials}
                >
                  {uploadingMaterials && uploadMaterialsLessonId === lesson.id 
                    ? 'Uploading...' 
                    : 'Upload Learning Materials'}
                </button>
              </div>
            )}
            
            {lessonDetails.meeting_link && (
              <div className="lesson-meeting-link">
                <strong>Meeting Link:</strong> <a href={lessonDetails.meeting_link} target="_blank" rel="noopener noreferrer">{lessonDetails.meeting_link}</a>
              </div>
            )}
            
            {lessonDetails.learning_materials_url && (
              <div className="lesson-materials">
                <strong>Learning Materials:</strong>
                <ul>
                  {Array.isArray(lessonDetails.learning_materials_url) 
                    ? lessonDetails.learning_materials_url.map((url, index) => (
                        <li key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer">Material {index + 1}</a>
                        </li>
                      ))
                    : (
                        <li>
                          <a href={lessonDetails.learning_materials_url} target="_blank" rel="noopener noreferrer">Material</a>
                        </li>
                      )
                  }
                </ul>
              </div>
            )}
            
            {lessonDetails.location && (
              <div className="lesson-location">
                <strong>Location:</strong> {lessonDetails.location}
              </div>
            )}
            
            {lessonDetails.post_lesson_notes && (
              <div className="lesson-notes">
                <strong>Notes:</strong> {lessonDetails.post_lesson_notes}
              </div>
            )}
          </div>
        )}

        {lessonSuggestions.length > 0 && (
          <div className="lesson-suggestions">
            {lessonSuggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-container">
                <div 
                  className="suggestion-header"
                  onClick={() => toggleSuggestionExpand(suggestion.id)}
                >
                  <span className="suggestion-indicator">Suggestion Available</span>
                </div>
                
                {expandedSuggestion === suggestion.id && (
                  <div className="suggestion-details">
                    {suggestion.start_time && (
                      <div>
                        <strong>Suggested Start:</strong> {formatLessonTime(suggestion.start_time)}
                      </div>
                    )}
                    
                    {suggestion.end_time && (
                      <div>
                        <strong>Suggested End:</strong> {formatLessonTime(suggestion.end_time)}
                      </div>
                    )}
                    
                    {suggestion['in_person'] !== null && (
                      <div>
                        <strong>Suggested Mode:</strong> {suggestion['in_person'] ? 'In-person' : 'Online'}
                      </div>
                    )}
                    
                    {suggestion.location && (
                      <div>
                        <strong>Suggested Location:</strong> {suggestion.location}
                      </div>
                    )}
                    
                    {suggestion.suggester !== role && (
                      <button className="accept-suggestion-btn" onClick={(e) => {
                        e.stopPropagation();
                        acceptSuggestion(suggestion.id);
                      }}>
                        Accept Suggestion
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLessonSection = (title, lessons) => {
    if (!lessons || lessons.length === 0) return null;
    
    // Log the number of lessons in this section before categorization
    console.log(`${title} section: ${lessons.length} lessons before categorizing by status`);
    
    const { pending, confirmed, unconfirmed } = categorizeByConfirmationStatus(lessons);
    
    // Check if all lessons are accounted for after status categorization
    const totalDisplayed = pending.length + confirmed.length + unconfirmed.length;
    if (totalDisplayed !== lessons.length) {
      console.log(`Warning: ${lessons.length - totalDisplayed} lessons missing in ${title} section after status categorization`);
    }
    
    // Ensure we have the option to show all lessons if needed
    const showAllOption = (
      <div className="status-section">
        <h3 className="status-title">All {title} Lessons</h3>
        <div className="lesson-cards">
          {lessons.map(lesson => renderLessonCard(lesson))}
        </div>
      </div>
    );
    
    return (
      <section className="lessons-section">
        <h2 className="section-title">{title} ({lessons.length})</h2>
        
        {pending.length > 0 && (
          <div className="status-section">
            <h3 className="status-title">Pending ({pending.length})</h3>
            <div className="lesson-cards">
              {pending.map(lesson => renderLessonCard(lesson))}
            </div>
          </div>
        )}
        
        {confirmed.length > 0 && (
          <div className="status-section">
            <h3 className="status-title">Confirmed ({confirmed.length})</h3>
            <div className="lesson-cards">
              {confirmed.map(lesson => renderLessonCard(lesson))}
            </div>
          </div>
        )}
        
        {unconfirmed.length > 0 && (
          <div className="status-section">
            <h3 className="status-title">Unconfirmed ({unconfirmed.length})</h3>
            <div className="lesson-cards">
              {unconfirmed.map(lesson => renderLessonCard(lesson))}
            </div>
          </div>
        )}
        
        {/* Only show this if there's a mismatch in the number of lessons */}
        {totalDisplayed !== lessons.length && showAllOption}
      </section>
    );
  };

  const handleCreateLessonOpen = async () => {
    setCreateLessonError(null);
    setLessonForm({
      subject: '',
      customSubject: '',
      isCustomSubject: false,
      description: '',
      start_time: '',
      end_time: '',
      in_person: false,
      location: '',
      student_id: ''
    });
    
    setShowCreateModal(true);
    
    // Fetch subjects
    try {
      setLoadingSubjects(true);
      const subjectResponse = await fetch(`${SERVER_URL}/subjects_list`, {
        credentials: 'include'
      });
      
      if (subjectResponse.ok) {
        const subjectData = await subjectResponse.json();
        console.log('Subjects fetched:', subjectData);
        setSubjectList(subjectData || []);
      } else {
        console.error('Failed to fetch subjects');
        setSubjectList([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjectList([]);
    } finally {
      setLoadingSubjects(false);
    }
    
    // Fetch students
    try {
      setLoadingStudents(true);
      const studentsResponse = await fetch(`${SERVER_URL}/students_list`, {
        credentials: 'include'
      });
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudentsList(studentsData || []);
      } else {
        console.error('Failed to fetch students');
        setStudentsList([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateLessonClose = () => {
    setShowCreateModal(false);
    setLessonForm({
      subject: '',
      customSubject: '',
      isCustomSubject: false,
      description: '',
      start_time: '',
      end_time: '',
      in_person: false,
      location: '',
      student_id: ''
    });
    setCreateLessonError(null);
  };

  // These specific handlers have been merged into handleCreateLessonFormChange

  const handleCreateLessonFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'subject') {
      if (value === 'other') {
        // When "Other subject" is selected
        setLessonForm(prev => ({
          ...prev,
          subject: 'other',
          isCustomSubject: true
        }));
      } else {
        // When any other subject is selected from the dropdown
        setLessonForm(prev => ({
          ...prev,
          subject: value,
          isCustomSubject: false,
          customSubject: '' // Clear the custom subject field
        }));
      }
    } else if (type === 'checkbox') {
      setLessonForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setLessonForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // These functions were removed as they're redundant with the fetching done in handleCreateLessonOpen

  // Submit create lesson form
  const handleCreateLesson = async () => {
    try {
      // Form validation
      const validationMessage = getValidationMessage();
      if (validationMessage) {
        setCreateLessonError(validationMessage);
        return;
      }
      
      setIsSubmitting(true);
      setCreateLessonError(null);
      
      // Prepare request body
      const requestBody = {
        student_id: lessonForm.student_id,
        start_time: new Date(lessonForm.start_time).toISOString(),
        end_time: new Date(lessonForm.end_time).toISOString(),
        description: lessonForm.description,
        subject: lessonForm.isCustomSubject ? lessonForm.customSubject : lessonForm.subject,
        in_person: lessonForm.in_person
      };
      
      // Add location if in-person
      if (lessonForm.in_person) {
        requestBody.location = lessonForm.location;
      }
      
      const response = await fetch(`${SERVER_URL}/create_lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        // Show success message
        alert('Lesson created successfully!');
        
        // Close modal and refresh lessons
        setShowCreateModal(false);
        
        // Refresh lessons without full page reload
        try {
          const lessonsResponse = await fetch(`${SERVER_URL}/lessons`, {
            credentials: 'include'
          });
          
          if (lessonsResponse.ok) {
            const data = await lessonsResponse.json();
            setLessons(data.lessons || []);
          } else {
            // If refresh fails, do a full page reload
            window.location.reload();
          }
        } catch (refreshError) {
          window.location.reload();
        }
      } else {
        // Handle specific error responses
        try {
          const errorData = await response.json();
          setCreateLessonError(errorData.message || 'Failed to create lesson. Please try again.');
        } catch (parseError) {
          setCreateLessonError('Failed to create lesson. Please try again.');
        }
      }
    } catch (apiError) {
      console.error('Error creating lesson:', apiError);
      setCreateLessonError('An error occurred while creating the lesson.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const { subject, customSubject, isCustomSubject, start_time, end_time, student_id, in_person, location } = lessonForm;
    
    // Check required fields
    if ((!subject) || (isCustomSubject && !customSubject) || !start_time || !end_time || !student_id) {
      return false;
    }
    
    // Check if location is provided when in-person is selected
    if (in_person && !location) {
      return false;
    }
    
    // Check if end time is after start time
    if (!isValidTimeRange()) {
      return false;
    }
    
    return true;
  };
  
  // Check if end time is after start time
  const isValidTimeRange = () => {
    const { start_time, end_time } = lessonForm;
    
    if (!start_time || !end_time) return true; // Let required field validation handle this
    
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    
    return endDate > startDate;
  };
  
  // Get validation message for form feedback
  const getValidationMessage = () => {
    const { subject, customSubject, isCustomSubject, start_time, end_time, student_id, in_person, location } = lessonForm;
    
    if ((!subject) || (isCustomSubject && !customSubject)) {
      return "Please enter a subject";
    }
    
    if (!student_id) {
      return "Please select a student";
    }
    
    if (!start_time) {
      return "Please select a start time";
    }
    
    if (!end_time) {
      return "Please select an end time";
    }
    
    if (!isValidTimeRange()) {
      return "End time must be after start time";
    }
    
    if (in_person && !location) {
      return "Please enter a location for in-person lesson";
    }
    
    return null;
  };
  
  // Categorize lessons by date for display
  const categorizedLessons = categorizeByDate(lessons);
  
  return (
    <div className="lessons-container">
      {role === 'tutor' && (
        <button className="create-lesson-btn" onClick={handleCreateLessonOpen} aria-label="Create new lesson">
          <span>+</span> Create Lesson
        </button>
      )}
      
      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Lesson</h2>
              <button className="modal-close-btn" onClick={handleCreateLessonClose}>×</button>
            </div>
            
            <div className="modal-body">
              {loadingSubjects || loadingStudents ? (
                <div className="modal-loading">Loading form data...</div>
              ) : studentsList.length === 0 ? (
                <div className="modal-error">
                  You don't have any students yet. You need to connect with students before creating lessons.
                </div>
              ) : (
                <form className="create-lesson-form">
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject" 
                      name="subject"
                      value={lessonForm.subject}
                      onChange={handleCreateLessonFormChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjectList.map((subject, index) => {
                        // Handle different possible response formats
                        const subjectValue = 
                          typeof subject === 'string' ? subject :
                          subject.skill_name || subject.name || subject.subject || '';
                        return <option key={index} value={subjectValue}>{subjectValue}</option>;
                      })}
                      <option value="other">Other subject</option>
                    </select>
                  </div>
                  
                  {lessonForm.isCustomSubject && (
                    <div className="form-group">
                      <label htmlFor="customSubject">Custom Subject *</label>
                      <input 
                        type="text" 
                        id="customSubject" 
                        name="customSubject"
                        value={lessonForm.customSubject}
                        onChange={handleCreateLessonFormChange}
                        placeholder="Enter custom subject"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={lessonForm.description}
                      onChange={handleCreateLessonFormChange}
                      placeholder="Describe what you'll cover in this lesson"
                      rows={4}
                    />
                  </div>
                  
                  <div className="time-inputs">
                    <div className="form-group">
                      <label htmlFor="start_time">Start Time *</label>
                      <input
                        type="datetime-local"
                        id="start_time"
                        name="start_time"
                        value={lessonForm.start_time}
                        onChange={handleCreateLessonFormChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="end_time">End Time *</label>
                      <input
                        type="datetime-local"
                        id="end_time"
                        name="end_time"
                        value={lessonForm.end_time}
                        onChange={handleCreateLessonFormChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="in_person"
                        checked={lessonForm.in_person}
                        onChange={handleCreateLessonFormChange}
                      />
                      In-person lesson
                    </label>
                  </div>
                  
                  {lessonForm.in_person && (
                    <div className="form-group">
                      <label htmlFor="location">Location *</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={lessonForm.location}
                        onChange={handleCreateLessonFormChange}
                        placeholder="Enter the lesson location"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="student_id">Student *</label>
                    <select
                      id="student_id"
                      name="student_id"
                      value={lessonForm.student_id}
                      onChange={handleCreateLessonFormChange}
                      required
                    >
                      <option value="">Select a student</option>
                      {studentsList.map(student => (
                        <option key={student.student_id || student.id} value={student.student_id || student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {createLessonError && (
                    <div className="form-error">{createLessonError}</div>
                  )}
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={handleCreateLessonClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="create-btn"
                      onClick={handleCreateLesson}
                      disabled={isSubmitting || !isFormValid()}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Lesson'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="lessons-content">
        <h1 className="lessons-title">My Lessons</h1>
        
        {loading ? (
          <div className="loading-message">Loading lessons...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : lessons.length === 0 ? (
          <div className="no-lessons-message">
            {role === 'tutor' ? (
              <>
                {'You don\'t have any lessons yet. Create your first lesson by clicking the "Create Lesson" button above.'}
              </>
            ) : (
              'You don\'t have any lessons yet. Connect with a tutor to schedule lessons.'
            )}
          </div>
        ) : (
          <>
            {renderLessonSection("Today", categorizedLessons.today)}
            {renderLessonSection("Upcoming", categorizedLessons.upcoming)}
            {renderLessonSection("Past", categorizedLessons.past)}
            {categorizedLessons.other && categorizedLessons.other.length > 0 && 
              renderLessonSection("Other", categorizedLessons.other)}
          </>
        )}
      </div>
    </div>
  );
};

export default Lessons;