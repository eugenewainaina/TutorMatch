import React, { useState, useEffect } from "react";
import { SERVER_URL } from "../config";
import "./StudentLessons.css";

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
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student lessons");
        }

        const data = await response.json();
        setLessons(data);

        // Group lessons by tutor for better organization
        const grouped = data.reduce((acc, lesson) => {
          if (!acc[lesson.tutor_id]) {
            acc[lesson.tutor_id] = {
              tutorName: lesson.tutor_name,
              lessons: [],
            };
          }
          acc[lesson.tutor_id].lessons.push(lesson);
          return acc;
        }, {});

        setGroupedLessons(grouped);
      } catch (error) {
        console.error("Error fetching student lessons:", error);
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
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateTimeString).toLocaleString("en-US", options);
  };

  // Calculate lesson duration in hours and minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
      (durationMs % (1000 * 60 * 60)) / (1000 * 60),
    );

    if (durationHours === 0) {
      return `${durationMinutes} minutes`;
    } else if (durationMinutes === 0) {
      return `${durationHours} hour${durationHours > 1 ? "s" : ""}`;
    } else {
      return `${durationHours} hour${durationHours > 1 ? "s" : ""} ${durationMinutes} minutes`;
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
    return (
      <div className="loading-container" data-oid="0m.xfi6">
        Loading student lessons...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" data-oid="7ftov-3">
        Error: {error}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="no-lessons" data-oid="kz.utw0">
        No lessons found for your child.
      </div>
    );
  }

  return (
    <div className="student-lessons-container" data-oid="xg5msxk">
      <h1 className="lessons-title" data-oid="my090r6">
        Student Lessons
      </h1>
      <p className="lessons-subtitle" data-oid="udyymf8">
        Monitor your child's learning sessions
      </p>

      {Object.entries(groupedLessons).map(
        ([tutorId, { tutorName, lessons }]) => (
          <div key={tutorId} className="tutor-lesson-group" data-oid="kse.ema">
            <h2 className="tutor-name" data-oid="0tqhxdb">
              Tutor: {tutorName}
            </h2>
            <div className="lessons-list" data-oid="5afapiq">
              {sortLessons(lessons).map((lesson) => (
                <div
                  key={lesson.lesson_id}
                  className={`lesson-item ${isPastLesson(lesson.end_time) ? "past-lesson" : "upcoming-lesson"}`}
                  data-oid="9xjap:-"
                >
                  <div className="lesson-header" data-oid="0eww1.z">
                    <span className="lesson-subject" data-oid=".agdze5">
                      {lesson.subject}
                    </span>
                    <span className="lesson-status" data-oid="7on54zu">
                      {isPastLesson(lesson.end_time) ? "Completed" : "Upcoming"}
                    </span>
                  </div>

                  <div className="lesson-details" data-oid="ctr4j.o">
                    <div className="lesson-time" data-oid="v:zu4hh">
                      <div data-oid="sn-v5td">
                        <strong data-oid="-3ek.o.">Start:</strong>{" "}
                        {formatDateTime(lesson.start_time)}
                      </div>
                      <div data-oid="hz1o1u:">
                        <strong data-oid="gyytnbz">End:</strong>{" "}
                        {formatDateTime(lesson.end_time)}
                      </div>
                      <div data-oid="kcy7eb9">
                        <strong data-oid="8d07xfy">Duration:</strong>{" "}
                        {calculateDuration(lesson.start_time, lesson.end_time)}
                      </div>
                    </div>

                    <div className="lesson-info" data-oid="x2wnroj">
                      <div data-oid="5cf:0_m">
                        <strong data-oid="as.i9-x">Format:</strong>{" "}
                        {lesson.in_person ? "In-Person" : "Online"}
                      </div>
                      <div className="lesson-confirmation" data-oid="6m09znl">
                        <div data-oid="v7:fytk">
                          <strong data-oid="7qzy5du">Student confirmed:</strong>
                          <span
                            className={
                              lesson.student_confirmed
                                ? "confirmed"
                                : "not-confirmed"
                            }
                            data-oid="i00s04k"
                          >
                            {lesson.student_confirmed ? "Yes" : "No"}
                          </span>
                        </div>
                        <div data-oid="zkl0hee">
                          <strong data-oid="h_lvl:o">Tutor confirmed:</strong>
                          <span
                            className={
                              lesson.tutor_confirmed
                                ? "confirmed"
                                : "not-confirmed"
                            }
                            data-oid="ppr3x0n"
                          >
                            {lesson.tutor_confirmed ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default StudentLessons;
