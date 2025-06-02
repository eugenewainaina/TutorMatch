import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/GlobalStyles.css";
import "../Profile.css";
import "./ParentProfile.css";
import { SERVER_URL } from "../config";
import InputField from "../components/InputField";
import {
  validateFullName,
  validatePhoneNumber,
  validateEmail,
  validatePassword,
} from "../validation";

const ParentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    // profilePicture: "",
    studentName: "",
    studentId: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  const fetchProfileData = async () => {
    try {
      const apiUrl = `${SERVER_URL}/profile`;
      console.log("Fetching parent profile from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      const data = await response.json();

      // Format data for parent profile
      const formattedData = {
        fullName: data.name || "",
        phoneNumber: data.phone || "",
        email: data.email || "",
        password: data.password || "",
        // profilePicture: data.profile_picture || "/profile_icon.png",
        studentName: data.student_name || "",
        studentId: data.student_id || "",
      };

      setOriginalData(formattedData);
      setFormData(formattedData);
    } catch (error) {
      console.error("Error fetching parent profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate fields
    let error = null;
    if (name === "fullName") error = validateFullName(value);
    if (name === "phoneNumber") error = validatePhoneNumber(value);
    if (name === "email") error = validateEmail(value);
    if (name === "password") error = validatePassword(value);

    setFormErrors({ ...formErrors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const errors = {};
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    if (formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) errors.password = passwordError;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log("Validation errors:", errors);
      return;
    }

    // Create request body
    const requestBody = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phoneNumber,
      student_id: formData.studentId,
      student_name: formData.studentName,
    };

    // Only include password if changed
    if (formData.password && formData.password !== originalData.password) {
      requestBody.password = formData.password;
    }

    console.log("Submitting parent profile data:", requestBody);

    try {
      // Send data to server
      const response = await fetch(`${SERVER_URL}/edit_profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Profile update successful:", result);

      // Update original data
      setOriginalData({ ...formData });

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setFormData(originalData);
    setIsEditing(false);
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="loading-container" data-oid="vqe_nje">
        Loading...
      </div>
    );
  }

  return (
    <div className="global-main-container" data-oid="2-:ovwi">
      <h1 className="global-title" data-oid=".mle6s0">
        Parent Profile
      </h1>
      <form
        className="global-form"
        onSubmit={handleSubmit}
        noValidate
        style={{ paddingBottom: "80px" }}
        data-oid=".1qqz0b"
      >
        {/* <div className="global-profile-picture-container">
                <img
                    className="global-profile-picture"
                    src={formData.profilePicture}
                    alt="profile pic icon"
                />
             </div> */}

        <InputField
          label="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          name="fullName"
          readOnly={!isEditing}
          error={formErrors.fullName}
          data-oid="70hvarz"
        />

        <InputField
          label="Email"
          value={formData.email}
          onChange={handleInputChange}
          name="email"
          readOnly={!isEditing}
          error={formErrors.email}
          data-oid="mmpq1pd"
        />

        <InputField
          label="Password"
          value={formData.password}
          onChange={handleInputChange}
          name="password"
          type="password"
          placeholder="Reset Password"
          readOnly={!isEditing}
          error={formErrors.password}
          data-oid="mnazash"
        />

        <InputField
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          name="phoneNumber"
          readOnly={!isEditing}
          error={formErrors.phoneNumber}
          data-oid="4b8curh"
        />

        {/* Child's Information Section */}
        <div className="child-info-section" data-oid="vozzi-p">
          <hr data-oid=".f.bl04" />
          <h3 data-oid="lzsz8ut">Child's Information</h3>

          <InputField
            label="Child's Name"
            value={formData.studentName}
            readOnly={true}
            name="studentName"
            data-oid="u30o2:_"
          />

          <div className="global-form-group" data-oid="fhqchyc">
            <label data-oid="9nr1f7o">Child's Profile</label>
            <div className="student-profile-link" data-oid="jlv-zy4">
              <Link
                to={`/students/profile/${formData.studentId}`}
                className="view-student-link"
                data-oid="dilayvy"
              >
                View Student's Profile
              </Link>
            </div>
          </div>

          <div className="global-form-group" data-oid="xk1thj_">
            <label data-oid="e.fuqta">Child's Messages</label>
            <div className="student-messages-link" data-oid="8gc9bih">
              <Link
                to="/parent/student_messages"
                className="view-messages-link"
                data-oid="m6j8zbt"
              >
                View Student Messages
              </Link>
            </div>
          </div>

          <div className="global-form-group" data-oid="xq_pcji">
            <label data-oid="1vv6e_n">Child's Lessons</label>
            <div className="student-lessons-link" data-oid="q:.trx1">
              <Link
                to="/parent/student_lessons"
                className="view-lessons-link"
                data-oid=":vuvecc"
              >
                View Student Lessons
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions" data-oid="a-u2u:i">
          {!isEditing ? (
            <button
              type="button"
              className="profile-button edit-button"
              onClick={() => setIsEditing(true)}
              data-oid="rsns03k"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                className="profile-button cancel-button"
                onClick={cancelEdit}
                data-oid="zfo9.y1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-button submit-button"
                data-oid="v.jtssj"
              >
                Submit
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ParentProfile;
