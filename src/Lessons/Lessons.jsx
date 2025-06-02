// filepath: /Users/mac/Desktop/Code/4th Year Project Stuff/4th_yr_frontend/src/Lessons/Lessons.jsx
import React, { useState, useEffect } from "react";
import {
  format,
  isToday,
  isTomorrow,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import "./Lessons.css";
import { SERVER_URL } from "../config";

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [expandedLessons, setExpandedLessons] = useState([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("");
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
    subject: "",
    customSubject: "",
    isCustomSubject: false,
    description: "",
    start_time: "",
    end_time: "",
    in_person: false,
    location: "",
    student_id: "",
  });

  // Suggestion form states
  const [showSuggestionForm, setShowSuggestionForm] = useState(null); // Stores lesson ID or null
  const [suggestionForm, setSuggestionForm] = useState({
    start_time: "",
    end_time: "",
    in_person: null,
    location: "",
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SERVER_URL}/lessons`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch lessons");
        }

        const data = await response.json();
        console.log(data.lessons);

        setLessons(data.lessons || []);
        setRole(data.role || "");

        // Log the total number of lessons received
        console.log(
          `Total lessons received from API: ${(data.lessons || []).length}`,
        );

        // If lessons exist, fetch suggestions
        if (data.lessons && data.lessons.length > 0) {
          const lessonIds = data.lessons.map((lesson) => lesson.id);
          fetchLessonSuggestions(lessonIds);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setError("Failed to load lessons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const fetchLessonSuggestions = async (lessonIds) => {
    try {
      const response = await fetch(`${SERVER_URL}/lesson_suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ lessons: lessonIds }),
      });

      if (response.ok) {
        const suggestionsData = await response.json();
        if (suggestionsData && suggestionsData.length > 0) {
          // Convert suggestions array to an object with lesson_id as keys
          const suggestionsMap = {};
          suggestionsData.forEach((suggestion) => {
            if (!suggestionsMap[suggestion.lesson_id]) {
              suggestionsMap[suggestion.lesson_id] = [];
            }
            suggestionsMap[suggestion.lesson_id].push(suggestion);
          });
          setSuggestions(suggestionsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching lesson suggestions:", error);
    }
  };

  const fetchAdditionalDetails = async (lessonId) => {
    if (additionalDetails[lessonId]) {
      return; // Already fetched
    }

    try {
      const response = await fetch(
        `${SERVER_URL}/b7c880a1-d79d-46f3-a5fb-867f87f49713/lessons/additional/${lessonId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lesson details");
      }

      const data = await response.json();
      setAdditionalDetails((prev) => ({
        ...prev,
        [lessonId]: data,
      }));
    } catch (error) {
      console.error("Error fetching lesson details:", error);
    }
  };

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons((prev) => {
      if (prev.includes(lessonId)) {
        // If already expanded, remove it from the array
        return prev.filter((id) => id !== lessonId);
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
    setExpandedSuggestion(
      expandedSuggestion === suggestionId ? null : suggestionId,
    );
  };

  const acceptSuggestion = async (suggestionId) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/accept_suggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          suggestion_id: suggestionId,
        }),
      });

      if (response.ok) {
        alert("Suggestion accepted successfully!");
        window.location.reload();
      } else {
        console.error("Failed to accept suggestion");
        alert("Failed to accept suggestion. Please try again.");
      }
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      alert(
        "An error occurred while accepting the suggestion. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLessonConfirmation = async (lessonId, isConfirmed) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          lesson_id: lessonId,
          reason: "confirmation",
          confirmation: !isConfirmed, // Toggle current confirmation status
        }),
      });

      if (response.ok) {
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        console.error("Failed to update lesson confirmation status");
        alert("Failed to update lesson confirmation. Please try again.");
      }
    } catch (error) {
      console.error("Error updating lesson confirmation:", error);
      alert("An error occurred while updating the lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingDescription = (lessonId, currentDescription) => {
    setEditingDescription(lessonId);
    setEditedDescription(currentDescription || "");
  };

  const cancelEditingDescription = () => {
    setEditingDescription(null);
    setEditedDescription("");
  };

  const saveEditedDescription = async (lessonId) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          lesson_id: lessonId,
          reason: "edit",
          description: editedDescription,
        }),
      });

      if (response.ok) {
        // Update the local state to avoid a full page reload
        setAdditionalDetails((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            description: editedDescription,
          },
        }));
        setEditingDescription(null);
      } else {
        console.error("Failed to update lesson description");
        alert("Failed to update description. Please try again.");
      }
    } catch (error) {
      console.error("Error updating lesson description:", error);
      alert(
        "An error occurred while updating the description. Please try again.",
      );
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
      formData.append("file", file);

      // Upload the file
      const uploadResponse = await fetch(`${SERVER_URL}/upload_material`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      // Get the URL of the uploaded material
      const materialData = await uploadResponse.json();
      const materialUrl = materialData.material_url;

      // Update the lesson with the material URL
      const updateResponse = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          lesson_id: lessonId,
          reason: "edit",
          learning_materials_url: materialUrl,
        }),
      });

      if (updateResponse.ok) {
        // Update the local state
        setAdditionalDetails((prev) => {
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
              learning_materials_url: updatedMaterials,
            },
          };
        });

        alert("Learning material uploaded successfully!");
      } else {
        console.error("Failed to update lesson with material URL");
        alert(
          "Failed to link the uploaded material to the lesson. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error uploading learning material:", error);
      alert("Error: " + (error.message || "Failed to upload material"));
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
      start_time: lesson.start_time
        ? new Date(lesson.start_time).toISOString().slice(0, 16)
        : "",
      end_time: lesson.end_time
        ? new Date(lesson.end_time).toISOString().slice(0, 16)
        : "",
      in_person: isInPerson,
      location: isInPerson
        ? lessonDetails.location || lesson.location || ""
        : "",
    });

    console.log("Opening suggestion form with values:", {
      in_person: isInPerson,
      location: isInPerson
        ? lessonDetails.location || lesson.location || ""
        : "",
    });

    setShowSuggestionForm(lessonId);
  };

  const closeSuggestionForm = () => {
    setShowSuggestionForm(null);
    setSuggestionForm({
      start_time: "",
      end_time: "",
      in_person: null,
      location: "",
    });
  };

  const handleSuggestionFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for checkbox
    if (type === "checkbox") {
      // For in_person checkbox, handle special case
      if (name === "in_person") {
        // If changing to online (false), clear the location
        if (!checked) {
          setSuggestionForm((prev) => ({
            ...prev,
            in_person: checked, // false for online
            location: "", // clear location
          }));
        } else {
          // Changing to in-person (true)
          setSuggestionForm((prev) => ({
            ...prev,
            in_person: checked, // true for in-person
          }));
        }
      } else {
        // For other checkboxes (if any)
        setSuggestionForm((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      // For non-checkbox inputs
      setSuggestionForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Debug
    console.log(
      `Field ${name} updated to:`,
      type === "checkbox" ? checked : value,
    );
  };

  const submitSuggestion = async (lessonId) => {
    // Validate form
    const hasChanges = Object.entries(suggestionForm).some(([key, value]) => {
      if (value === "" || value === null) return false;
      return true;
    });

    if (!hasChanges) {
      alert("Please make at least one suggestion before submitting.");
      return;
    }

    // Check if in-person is selected but no location is provided
    if (suggestionForm.in_person === true && !suggestionForm.location) {
      alert("Please specify a location for in-person lessons.");
      return;
    }

    // Build request payload
    const payload = {
      lesson_id: lessonId,
      reason: "suggestion",
      suggester: role,
    };

    // Only include fields that have values
    if (suggestionForm.start_time)
      payload.start_time = new Date(suggestionForm.start_time).toISOString();
    if (suggestionForm.end_time)
      payload.end_time = new Date(suggestionForm.end_time).toISOString();
    if (suggestionForm.in_person !== null)
      payload.in_person = suggestionForm.in_person;
    if (suggestionForm.location) payload.location = suggestionForm.location;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${SERVER_URL}/edit_lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Your suggestion has been submitted successfully!");
        window.location.reload();
      } else {
        console.error("Failed to submit suggestion");
        alert("Failed to submit suggestion. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert(
        "An error occurred while submitting your suggestion. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      closeSuggestionForm();
    }
  };

  const formatLessonTime = (startTime) => {
    const date = parseISO(startTime);

    if (isToday(date)) {
      return `Today ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow ${format(date, "h:mm a")}`;
    } else {
      return `${format(date, "do MMM yyyy h:mm a")}`;
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
        <div className="lesson-day" data-oid="5y:tnt9">
          {dayPart}
        </div>
        <div className="lesson-time" data-oid="elrcy9x">
          {timePart}
        </div>
      </>
    );
  };

  const getConfirmationStatus = (lesson) => {
    const { student_confirmed, tutor_confirmed } = lesson;

    if (!student_confirmed && !tutor_confirmed) {
      return "Pending";
    } else if (student_confirmed && tutor_confirmed) {
      return "Confirmed";
    } else if (
      (role === "tutor" && !tutor_confirmed) ||
      (role === "student" && !student_confirmed)
    ) {
      return "Unconfirmed";
    }
    return "Pending Confirmation";
  };

  const categorizeByDate = (lessons) => {
    const now = new Date();
    console.log("Current date for categorization:", now);

    // Check for lessons with invalid date values
    const lessonsWithInvalidDates = lessons.filter((lesson) => {
      if (!lesson.start_time) {
        console.log("Lesson missing start_time:", lesson);
        return true;
      }
      try {
        // Try to parse the date and check if it's valid
        const date = parseISO(lesson.start_time);
        const isValid = !isNaN(date.getTime());
        if (!isValid) {
          console.log("Lesson with invalid date format:", lesson);
          return true;
        }
        return false;
      } catch (e) {
        console.log("Error parsing lesson date:", e, lesson);
        return true;
      }
    });

    // Fix or exclude lessons with invalid dates
    const validLessons = lessons.filter(
      (lesson) => !lessonsWithInvalidDates.find((l) => l.id === lesson.id),
    );

    // Today's lessons - regardless of whether they're in the past or future
    const today = validLessons.filter((lesson) => {
      const startTime = parseISO(lesson.start_time);
      return isToday(startTime);
    });

    // Future lessons that are not today
    const upcoming = validLessons.filter((lesson) => {
      const startTime = parseISO(lesson.start_time);
      return isAfter(startTime, now) && !isToday(startTime);
    });

    // Past lessons that are not today
    const past = validLessons.filter((lesson) => {
      const startTime = parseISO(lesson.start_time);
      return isBefore(startTime, now) && !isToday(startTime);
    });

    // Create an "other" category for lessons with invalid dates
    const other = lessonsWithInvalidDates;

    // Verify that all lessons are accounted for (debugging)
    const totalCategorized =
      today.length + upcoming.length + past.length + other.length;
    if (totalCategorized !== lessons.length) {
      console.log(
        `Warning: ${lessons.length - totalCategorized} lessons not categorized correctly`,
      );

      // Find and log the uncategorized lessons
      const categorizedIds = [...today, ...upcoming, ...past, ...other].map(
        (l) => l.id,
      );
      const uncategorized = lessons.filter(
        (l) => !categorizedIds.includes(l.id),
      );
      console.log("Uncategorized lessons:", uncategorized);

      // Add any remaining uncategorized lessons to the "other" category
      other.push(...uncategorized);
    }

    return { today, upcoming, past, other };
  };

  const categorizeByConfirmationStatus = (lessons) => {
    const pending = lessons.filter(
      (lesson) => !lesson.student_confirmed && !lesson.tutor_confirmed,
    );

    const confirmed = lessons.filter(
      (lesson) => lesson.student_confirmed && lesson.tutor_confirmed,
    );

    const unconfirmed = lessons.filter((lesson) => {
      if (role === "tutor") {
        return !lesson.tutor_confirmed && lesson.student_confirmed;
      } else if (role === "student") {
        return !lesson.student_confirmed && lesson.tutor_confirmed;
      }
      return false;
    });

    // Identify any lessons that might not fit into these categories
    const categorizedLessons = [...pending, ...confirmed, ...unconfirmed];
    const categorizedIds = categorizedLessons.map((l) => l.id);
    const uncategorizedByStatus = lessons.filter(
      (l) => !categorizedIds.includes(l.id),
    );

    // Log any lessons that don't fit into our categories
    if (uncategorizedByStatus.length > 0) {
      console.log(
        `Warning: ${uncategorizedByStatus.length} lessons not categorized by confirmation status`,
      );
      console.log("Lessons not categorized by status:", uncategorizedByStatus);

      // Add uncategorized lessons to pending for now, to ensure all lessons are displayed
      return {
        pending: [...pending, ...uncategorizedByStatus],
        confirmed,
        unconfirmed,
      };
    }

    return { pending, confirmed, unconfirmed };
  };

  const renderLessonCard = (lesson) => {
    const isExpanded = expandedLessons.includes(lesson.id);
    const lessonDetails = additionalDetails[lesson.id] || {};
    const lessonSuggestions = suggestions[lesson.id] || [];

    return (
      <div key={lesson.id} className="lesson-card-container" data-oid="n5_mq4-">
        <div
          className={`lesson-card ${isExpanded ? "expanded" : ""} ${
            lesson.student_confirmed && lesson.tutor_confirmed
              ? "fully-confirmed"
              : (role === "tutor" && lesson.tutor_confirmed) ||
                  (role === "student" && lesson.student_confirmed)
                ? "user-confirmed"
                : ""
          }`}
          onClick={() => toggleLessonExpand(lesson.id)}
          data-oid="lkkaf_7"
        >
          <div className="lesson-info" data-oid="9jgbmic">
            {role === "tutor" ? (
              <>
                <div className="lesson-subject" data-oid="e:0nsgh">
                  {lesson.subject}
                </div>
                <div className="lesson-other-name" data-oid="xcuddtv">
                  {lesson.other_name}
                </div>
              </>
            ) : (
              <>
                <div className="lesson-other-name" data-oid="od04q4u">
                  {lesson.other_name}
                </div>
                <div className="lesson-subject" data-oid="xpp5rex">
                  {lesson.subject}
                </div>
              </>
            )}
            <div className="lesson-mode" data-oid="1krx5rc">
              {lesson.in_person ? "In-person" : "Online"}
            </div>
            <div className="lesson-confirmation-status" data-oid="1:ct9uz">
              {getConfirmationStatus(lesson)}
            </div>
          </div>

          <div className="lesson-time-container" data-oid="miiqns3">
            {formatTimeRange(lesson.start_time, lesson.end_time)}
          </div>
        </div>

        {isExpanded && (
          <div className="lesson-details" data-oid="x11cr6g">
            {/* Display confirmation button based on role and confirmation status */}
            <div className="lesson-actions" data-oid="zlvc4sf">
              <div className="lesson-confirmation" data-oid="g:f-4i9">
                {role === "tutor" ? (
                  !lesson.tutor_confirmed ? (
                    <button
                      className="confirm-lesson-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, false);
                      }}
                      disabled={isSubmitting}
                      data-oid="dhvk5ah"
                    >
                      {isSubmitting ? "Confirming..." : "Confirm Lesson"}
                    </button>
                  ) : (
                    <button
                      className="unconfirm-lesson-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, true);
                      }}
                      disabled={isSubmitting}
                      data-oid="o1_2sb7"
                    >
                      {isSubmitting ? "Updating..." : "Unconfirm Lesson"}
                    </button>
                  )
                ) : role === "student" ? (
                  !lesson.student_confirmed ? (
                    <button
                      className="confirm-lesson-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, false);
                      }}
                      disabled={isSubmitting}
                      data-oid="adksnn_"
                    >
                      {isSubmitting ? "Confirming..." : "Confirm Lesson"}
                    </button>
                  ) : (
                    <button
                      className="unconfirm-lesson-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonConfirmation(lesson.id, true);
                      }}
                      disabled={isSubmitting}
                      data-oid="4qzqznx"
                    >
                      {isSubmitting ? "Updating..." : "Unconfirm Lesson"}
                    </button>
                  )
                ) : null}
              </div>

              {/* Show the suggest button unless this user already has a suggestion */}
              {!lessonSuggestions.some(
                (s) => s.suggester && s.suggester === role,
              ) && (
                <button
                  className="suggest-lesson-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSuggestionForm(lesson.id, lesson);
                  }}
                  data-oid="axd01_f"
                >
                  Suggest Changes
                </button>
              )}
            </div>

            {/* Suggestion Form */}
            {showSuggestionForm === lesson.id && (
              <div className="suggestion-form-container" data-oid="alymr98">
                <h4 data-oid="fid82kx">Suggest Changes</h4>
                <div className="suggestion-form" data-oid="urhuipn">
                  <div className="form-group" data-oid="n_-jz4_">
                    <label htmlFor="start-time" data-oid="wknl347">
                      Suggest Start Time:
                    </label>
                    <input
                      type="datetime-local"
                      id="start-time"
                      name="start_time"
                      value={suggestionForm.start_time}
                      onChange={handleSuggestionFormChange}
                      data-oid="jhbxp8o"
                    />
                  </div>

                  <div className="form-group" data-oid="p6p93yx">
                    <label htmlFor="end-time" data-oid="t6r.8s4">
                      Suggest End Time:
                    </label>
                    <input
                      type="datetime-local"
                      id="end-time"
                      name="end_time"
                      value={suggestionForm.end_time}
                      onChange={handleSuggestionFormChange}
                      data-oid="u-.:qad"
                    />
                  </div>

                  <div className="form-group checkbox-group" data-oid="14_500n">
                    <label data-oid="4q5:xry">
                      <input
                        type="checkbox"
                        name="in_person"
                        checked={suggestionForm.in_person === true}
                        onChange={(e) => {
                          handleSuggestionFormChange(e);
                        }}
                        data-oid="lc87151"
                      />
                      In-person lesson
                    </label>
                  </div>

                  {suggestionForm.in_person && (
                    <div className="form-group" data-oid="fl_vdbm">
                      <label htmlFor="location" data-oid="onnv99_">
                        Suggest Location:
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={suggestionForm.location}
                        onChange={handleSuggestionFormChange}
                        placeholder="Enter location"
                        data-oid="jr.0.gm"
                      />
                    </div>
                  )}

                  <div className="suggestion-form-buttons" data-oid="lv_.pvc">
                    <button
                      className="submit-suggestion-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        submitSuggestion(lesson.id);
                      }}
                      disabled={isSubmitting}
                      data-oid="4:g9x_m"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                    </button>
                    <button
                      className="cancel-suggestion-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeSuggestionForm();
                      }}
                      data-oid="wf_cyd1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="lesson-description" data-oid="2aekool">
              <strong data-oid="d70n7ns">Description:</strong>
              {editingDescription === lesson.id ? (
                <div className="description-edit-container" data-oid="ehpnbb4">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="description-edit-textarea"
                    rows={4}
                    placeholder="Enter lesson description..."
                    data-oid="2bqpdwr"
                  />

                  <div className="description-edit-buttons" data-oid="4fmtli7">
                    <button
                      className="save-description-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEditedDescription(lesson.id);
                      }}
                      disabled={isSubmitting}
                      data-oid="72ke4tq"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="cancel-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditingDescription();
                      }}
                      data-oid="nawucmc"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="description-content" data-oid="erd79dp">
                  {lessonDetails.description || "No description provided"}
                  {role === "tutor" && (
                    <button
                      className="edit-description-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingDescription(
                          lesson.id,
                          lessonDetails.description || "",
                        );
                      }}
                      data-oid="t:641qx"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Upload Learning Materials Section */}
            {role === "tutor" && (
              <div className="lesson-materials-upload" data-oid="8uqv:s-">
                <input
                  type="file"
                  id={`file-upload-${lesson.id}`}
                  className="file-input"
                  onChange={(e) => handleFileInputChange(e, lesson.id)}
                  style={{ display: "none" }}
                  data-oid="fcegtzj"
                />

                <button
                  className="upload-materials-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById(`file-upload-${lesson.id}`).click();
                  }}
                  disabled={uploadingMaterials}
                  data-oid="66y1:bq"
                >
                  {uploadingMaterials && uploadMaterialsLessonId === lesson.id
                    ? "Uploading..."
                    : "Upload Learning Materials"}
                </button>
              </div>
            )}

            {lessonDetails.meeting_link && (
              <div className="lesson-meeting-link" data-oid="_cbsmkd">
                <strong data-oid="l2p:k-k">Meeting Link:</strong>{" "}
                <a
                  href={lessonDetails.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-oid="thm5aer"
                >
                  {lessonDetails.meeting_link}
                </a>
              </div>
            )}

            {lessonDetails.learning_materials_url && (
              <div className="lesson-materials" data-oid="hdnqx1j">
                <strong data-oid="usym4ej">Learning Materials:</strong>
                <ul data-oid="ya9gh5q">
                  {Array.isArray(lessonDetails.learning_materials_url) ? (
                    lessonDetails.learning_materials_url.map((url, index) => (
                      <li key={index} data-oid="c.i31by">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-oid="9jg3.f:"
                        >
                          Material {index + 1}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li data-oid="_xvkhe3">
                      <a
                        href={lessonDetails.learning_materials_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-oid="t7yari4"
                      >
                        Material
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {lessonDetails.location && (
              <div className="lesson-location" data-oid="78zfodi">
                <strong data-oid="g_xxag3">Location:</strong>{" "}
                {lessonDetails.location}
              </div>
            )}

            {lessonDetails.post_lesson_notes && (
              <div className="lesson-notes" data-oid="3vfmmsf">
                <strong data-oid="ygc1hc2">Notes:</strong>{" "}
                {lessonDetails.post_lesson_notes}
              </div>
            )}
          </div>
        )}

        {lessonSuggestions.length > 0 && (
          <div className="lesson-suggestions" data-oid="0fbdii9">
            {lessonSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="suggestion-container"
                data-oid="ueu8sgs"
              >
                <div
                  className="suggestion-header"
                  onClick={() => toggleSuggestionExpand(suggestion.id)}
                  data-oid="mxiqzdh"
                >
                  <span className="suggestion-indicator" data-oid="ekl.pd.">
                    Suggestion Available
                  </span>
                </div>

                {expandedSuggestion === suggestion.id && (
                  <div className="suggestion-details" data-oid="8dqhf9q">
                    {suggestion.start_time && (
                      <div data-oid="w_r-rvx">
                        <strong data-oid="ctk4yte">Suggested Start:</strong>{" "}
                        {formatLessonTime(suggestion.start_time)}
                      </div>
                    )}

                    {suggestion.end_time && (
                      <div data-oid="c98yhad">
                        <strong data-oid="dwl2:wd">Suggested End:</strong>{" "}
                        {formatLessonTime(suggestion.end_time)}
                      </div>
                    )}

                    {suggestion["in_person"] !== null && (
                      <div data-oid="xhcym7_">
                        <strong data-oid="5etl6jh">Suggested Mode:</strong>{" "}
                        {suggestion["in_person"] ? "In-person" : "Online"}
                      </div>
                    )}

                    {suggestion.location && (
                      <div data-oid="oh0dfra">
                        <strong data-oid=".myyouo">Suggested Location:</strong>{" "}
                        {suggestion.location}
                      </div>
                    )}

                    {suggestion.suggester !== role && (
                      <button
                        className="accept-suggestion-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptSuggestion(suggestion.id);
                        }}
                        data-oid="jjrujyv"
                      >
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
    console.log(
      `${title} section: ${lessons.length} lessons before categorizing by status`,
    );

    const { pending, confirmed, unconfirmed } =
      categorizeByConfirmationStatus(lessons);

    // Check if all lessons are accounted for after status categorization
    const totalDisplayed =
      pending.length + confirmed.length + unconfirmed.length;
    if (totalDisplayed !== lessons.length) {
      console.log(
        `Warning: ${lessons.length - totalDisplayed} lessons missing in ${title} section after status categorization`,
      );
    }

    // Ensure we have the option to show all lessons if needed
    const showAllOption = (
      <div className="status-section" data-oid="s6:n.eq">
        <h3 className="status-title" data-oid="lm..wle">
          All {title} Lessons
        </h3>
        <div className="lesson-cards" data-oid=".dhrfwf">
          {lessons.map((lesson) => renderLessonCard(lesson))}
        </div>
      </div>
    );

    return (
      <section className="lessons-section" data-oid="eosnw99">
        <h2 className="section-title" data-oid="30jr9t3">
          {title} ({lessons.length})
        </h2>

        {pending.length > 0 && (
          <div className="status-section" data-oid="174turn">
            <h3 className="status-title" data-oid="nj6p9m1">
              Pending ({pending.length})
            </h3>
            <div className="lesson-cards" data-oid=":u_ox11">
              {pending.map((lesson) => renderLessonCard(lesson))}
            </div>
          </div>
        )}

        {confirmed.length > 0 && (
          <div className="status-section" data-oid=".9-ynha">
            <h3 className="status-title" data-oid="7c.7a5r">
              Confirmed ({confirmed.length})
            </h3>
            <div className="lesson-cards" data-oid="ms8akqi">
              {confirmed.map((lesson) => renderLessonCard(lesson))}
            </div>
          </div>
        )}

        {unconfirmed.length > 0 && (
          <div className="status-section" data-oid="b_58s0g">
            <h3 className="status-title" data-oid="xv.jnc0">
              Unconfirmed ({unconfirmed.length})
            </h3>
            <div className="lesson-cards" data-oid="zz5w.30">
              {unconfirmed.map((lesson) => renderLessonCard(lesson))}
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
      subject: "",
      customSubject: "",
      isCustomSubject: false,
      description: "",
      start_time: "",
      end_time: "",
      in_person: false,
      location: "",
      student_id: "",
    });

    setShowCreateModal(true);

    // Fetch subjects
    try {
      setLoadingSubjects(true);
      const subjectResponse = await fetch(`${SERVER_URL}/subjects_list`, {
        credentials: "include",
      });

      if (subjectResponse.ok) {
        const subjectData = await subjectResponse.json();
        console.log("Subjects fetched:", subjectData);
        setSubjectList(subjectData || []);
      } else {
        console.error("Failed to fetch subjects");
        setSubjectList([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjectList([]);
    } finally {
      setLoadingSubjects(false);
    }

    // Fetch students
    try {
      setLoadingStudents(true);
      const studentsResponse = await fetch(`${SERVER_URL}/students_list`, {
        credentials: "include",
      });

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudentsList(studentsData || []);
      } else {
        console.error("Failed to fetch students");
        setStudentsList([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateLessonClose = () => {
    setShowCreateModal(false);
    setLessonForm({
      subject: "",
      customSubject: "",
      isCustomSubject: false,
      description: "",
      start_time: "",
      end_time: "",
      in_person: false,
      location: "",
      student_id: "",
    });
    setCreateLessonError(null);
  };

  // These specific handlers have been merged into handleCreateLessonFormChange

  const handleCreateLessonFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "subject") {
      if (value === "other") {
        // When "Other subject" is selected
        setLessonForm((prev) => ({
          ...prev,
          subject: "other",
          isCustomSubject: true,
        }));
      } else {
        // When any other subject is selected from the dropdown
        setLessonForm((prev) => ({
          ...prev,
          subject: value,
          isCustomSubject: false,
          customSubject: "", // Clear the custom subject field
        }));
      }
    } else if (type === "checkbox") {
      setLessonForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setLessonForm((prev) => ({
        ...prev,
        [name]: value,
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
        subject: lessonForm.isCustomSubject
          ? lessonForm.customSubject
          : lessonForm.subject,
        in_person: lessonForm.in_person,
      };

      // Add location if in-person
      if (lessonForm.in_person) {
        requestBody.location = lessonForm.location;
      }

      const response = await fetch(`${SERVER_URL}/create_lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Show success message
        alert("Lesson created successfully!");

        // Close modal and refresh lessons
        setShowCreateModal(false);

        // Refresh lessons without full page reload
        try {
          const lessonsResponse = await fetch(`${SERVER_URL}/lessons`, {
            credentials: "include",
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
          setCreateLessonError(
            errorData.message || "Failed to create lesson. Please try again.",
          );
        } catch (parseError) {
          setCreateLessonError("Failed to create lesson. Please try again.");
        }
      }
    } catch (apiError) {
      console.error("Error creating lesson:", apiError);
      setCreateLessonError("An error occurred while creating the lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const {
      subject,
      customSubject,
      isCustomSubject,
      start_time,
      end_time,
      student_id,
      in_person,
      location,
    } = lessonForm;

    // Check required fields
    if (
      !subject ||
      (isCustomSubject && !customSubject) ||
      !start_time ||
      !end_time ||
      !student_id
    ) {
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
    const {
      subject,
      customSubject,
      isCustomSubject,
      start_time,
      end_time,
      student_id,
      in_person,
      location,
    } = lessonForm;

    if (!subject || (isCustomSubject && !customSubject)) {
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
    <div className="lessons-container" data-oid="1dfo.t_">
      {role === "tutor" && (
        <button
          className="create-lesson-btn"
          onClick={handleCreateLessonOpen}
          aria-label="Create new lesson"
          data-oid="e2ifuii"
        >
          <span data-oid="ibaoph3">+</span> Create Lesson
        </button>
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="modal-overlay" data-oid="n6_0y-v">
          <div className="modal-content" data-oid="y.bt9kv">
            <div className="modal-header" data-oid="rpd3qup">
              <h2 data-oid="99e4ook">Create New Lesson</h2>
              <button
                className="modal-close-btn"
                onClick={handleCreateLessonClose}
                data-oid="y_hfu8b"
              >
                ×
              </button>
            </div>

            <div className="modal-body" data-oid="efesq11">
              {loadingSubjects || loadingStudents ? (
                <div className="modal-loading" data-oid="6cr9rcr">
                  Loading form data...
                </div>
              ) : studentsList.length === 0 ? (
                <div className="modal-error" data-oid=".yg8595">
                  You don't have any students yet. You need to connect with
                  students before creating lessons.
                </div>
              ) : (
                <form className="create-lesson-form" data-oid="ijm43rq">
                  <div className="form-group" data-oid="5pp.f3j">
                    <label htmlFor="subject" data-oid="a42-ses">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={lessonForm.subject}
                      onChange={handleCreateLessonFormChange}
                      required
                      data-oid="2na7fx_"
                    >
                      <option value="" data-oid="kuedi-g">
                        Select a subject
                      </option>
                      {subjectList.map((subject, index) => {
                        // Handle different possible response formats
                        const subjectValue =
                          typeof subject === "string"
                            ? subject
                            : subject.skill_name ||
                              subject.name ||
                              subject.subject ||
                              "";
                        return (
                          <option
                            key={index}
                            value={subjectValue}
                            data-oid="zp__h0."
                          >
                            {subjectValue}
                          </option>
                        );
                      })}
                      <option value="other" data-oid="besv04s">
                        Other subject
                      </option>
                    </select>
                  </div>

                  {lessonForm.isCustomSubject && (
                    <div className="form-group" data-oid="zt2q9ji">
                      <label htmlFor="customSubject" data-oid="tpbbrk5">
                        Custom Subject *
                      </label>
                      <input
                        type="text"
                        id="customSubject"
                        name="customSubject"
                        value={lessonForm.customSubject}
                        onChange={handleCreateLessonFormChange}
                        placeholder="Enter custom subject"
                        required
                        data-oid="khdd2x."
                      />
                    </div>
                  )}

                  <div className="form-group" data-oid="ek3rg3i">
                    <label htmlFor="description" data-oid="4gf5dlq">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={lessonForm.description}
                      onChange={handleCreateLessonFormChange}
                      placeholder="Describe what you'll cover in this lesson"
                      rows={4}
                      data-oid="mmx.0jh"
                    />
                  </div>

                  <div className="time-inputs" data-oid="2p1009k">
                    <div className="form-group" data-oid="mcz.3xf">
                      <label htmlFor="start_time" data-oid=":wattf5">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="start_time"
                        name="start_time"
                        value={lessonForm.start_time}
                        onChange={handleCreateLessonFormChange}
                        required
                        data-oid="hlgqcdq"
                      />
                    </div>

                    <div className="form-group" data-oid="3-c2q2:">
                      <label htmlFor="end_time" data-oid="zgo.ncq">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="end_time"
                        name="end_time"
                        value={lessonForm.end_time}
                        onChange={handleCreateLessonFormChange}
                        required
                        data-oid="vcy:o9e"
                      />
                    </div>
                  </div>

                  <div className="form-group checkbox-group" data-oid="y3fwuc4">
                    <label data-oid="5g-9bfh">
                      <input
                        type="checkbox"
                        name="in_person"
                        checked={lessonForm.in_person}
                        onChange={handleCreateLessonFormChange}
                        data-oid="ibnzl91"
                      />
                      In-person lesson
                    </label>
                  </div>

                  {lessonForm.in_person && (
                    <div className="form-group" data-oid="2wkse5_">
                      <label htmlFor="location" data-oid="_1vymfu">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={lessonForm.location}
                        onChange={handleCreateLessonFormChange}
                        placeholder="Enter the lesson location"
                        required
                        data-oid="wm-ip68"
                      />
                    </div>
                  )}

                  <div className="form-group" data-oid=".o4w.a_">
                    <label htmlFor="student_id" data-oid="1qw1w5a">
                      Student *
                    </label>
                    <select
                      id="student_id"
                      name="student_id"
                      value={lessonForm.student_id}
                      onChange={handleCreateLessonFormChange}
                      required
                      data-oid="_0hn-je"
                    >
                      <option value="" data-oid="kfw:s1o">
                        Select a student
                      </option>
                      {studentsList.map((student) => (
                        <option
                          key={student.student_id || student.id}
                          value={student.student_id || student.id}
                          data-oid="xlb7kep"
                        >
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {createLessonError && (
                    <div className="form-error" data-oid="qtog:w2">
                      {createLessonError}
                    </div>
                  )}

                  <div className="modal-footer" data-oid="0j3:.3-">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCreateLessonClose}
                      data-oid="c4.r9dl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="create-btn"
                      onClick={handleCreateLesson}
                      disabled={isSubmitting || !isFormValid()}
                      data-oid="3mi51ys"
                    >
                      {isSubmitting ? "Creating..." : "Create Lesson"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="lessons-content" data-oid="n94xe-h">
        <h1 className="lessons-title" data-oid="klo5_rr">
          My Lessons
        </h1>

        {loading ? (
          <div className="loading-message" data-oid="31cf7z6">
            Loading lessons...
          </div>
        ) : error ? (
          <div className="error-message" data-oid="bzopgdi">
            {error}
          </div>
        ) : lessons.length === 0 ? (
          <div className="no-lessons-message" data-oid="qn6invr">
            {role === "tutor" ? (
              <>
                {
                  'You don\'t have any lessons yet. Create your first lesson by clicking the "Create Lesson" button above.'
                }
              </>
            ) : (
              "You don't have any lessons yet. Connect with a tutor to schedule lessons."
            )}
          </div>
        ) : (
          <>
            {renderLessonSection("Today", categorizedLessons.today)}
            {renderLessonSection("Upcoming", categorizedLessons.upcoming)}
            {renderLessonSection("Past", categorizedLessons.past)}
            {categorizedLessons.other &&
              categorizedLessons.other.length > 0 &&
              renderLessonSection("Other", categorizedLessons.other)}
          </>
        )}
      </div>
    </div>
  );
};

export default Lessons;
