import React, { useState, useEffect, useRef } from "react";
import "./styles/GlobalStyles.css";
import "./Profile.css";
import { SERVER_URL } from "./config";
import InputField from "./components/InputField";
import {
  validateFullName,
  validatePhoneNumber,
  validateDateOfBirth,
  validateEmail,
  validatePassword,
} from "./validation";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    languagesSpoken: "",
    location: "",
    dateOfBirth: "",
    profilePicture: "",
    education: null,
    bio: null,
    skills: null,
    workExperience: null,
    certifications: null,
    rating: null,
    preferences: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [educationList, setEducationList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [workExperienceList, setWorkExperienceList] = useState([]);
  const [certificationsList, setCertificationsList] = useState([]);
  const [preferencesList, setPreferencesList] = useState([]);
  const [allAvailableSkills, setAllAvailableSkills] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState({});
  const skillsSuggestionRefs = useRef({});
  const [allAvailableLanguages, setAllAvailableLanguages] = useState([]);
  const [languageSuggestions, setLanguageSuggestions] = useState({
    list: [],
    show: false,
  });
  const languageSuggestionsRef = useRef(null);
  const [allAvailableInstitutions, setAllAvailableInstitutions] = useState([]);
  const [institutionSuggestions, setInstitutionSuggestions] = useState({});
  const institutionSuggestionsRef = useRef({});

  const fetchProfileData = async () => {
    try {
      const apiUrl = `${SERVER_URL}/profile`;
      console.log("Fetching  profile from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      const data = await response.json();
      console.log("Profile API response:", data);
      console.log("Skills data from API:", data.skills);
      console.log("Work experience data from API:", data.work_experience);
      console.log("Certifications data from API:", data.certifications);

      const formattedData = {
        fullName: data.name || "",
        phoneNumber: data.phone || "",
        email: data.email || "",
        password: data.password || "",
        languagesSpoken: data.languages_spoken
          ? data.languages_spoken.join(", ")
          : "",
        location: data.location || "",
        dateOfBirth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
        profilePicture: data.profile_picture || `/profile_icon.png`,
        education: data.education || null,
        bio: data.bio || null,
        // Only include skills, work experience, and certifications if they exist in the response (to differentiate students from tutors)
        ...(Object.prototype.hasOwnProperty.call(data, "skills")
          ? { skills: data.skills }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "work_experience")
          ? { workExperience: data.work_experience }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "certifications")
          ? { certifications: data.certifications }
          : {}),
        rating: data.rating || null,
        preferences: data.preferences || null,
      };
      setOriginalData(formattedData);
      setFormData(formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch("/skills_list.txt");
      if (!response.ok) {
        throw new Error("Failed to fetch skills list");
      }
      const text = await response.text();
      const skillsArray = text
        .split("\n")
        .map((skill) => skill.trim())
        .filter((skill) => skill);
      setAllAvailableSkills(skillsArray);
    } catch (error) {
      console.error("Failed to fetch skills list:", error);
    }
  };

  const fetchAvailableLanguages = async () => {
    try {
      const response = await fetch("/languages_list.txt");
      if (!response.ok) {
        throw new Error("Failed to fetch languages list");
      }
      const text = await response.text();
      const languagesArray = text
        .split("\n")
        .map((lang) => lang.trim())
        .filter((lang) => lang);
      setAllAvailableLanguages(languagesArray);
    } catch (error) {
      console.error("Failed to fetch languages list:", error);
    }
  };

  const fetchAvailableInstitutions = async () => {
    try {
      const response = await fetch("/world-universities.csv");
      if (!response.ok) {
        throw new Error("Failed to fetch institutions list");
      }
      const text = await response.text();
      const institutionsArray = text
        .split("\n")
        .map((inst) => inst.trim())
        .filter((inst) => inst);
      setAllAvailableInstitutions(institutionsArray);
    } catch (error) {
      console.error("Failed to fetch institutions list:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchAvailableSkills();
    fetchAvailableLanguages();
    fetchAvailableInstitutions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      let shouldHide = true;
      Object.keys(skillsSuggestionRefs.current).forEach((index) => {
        const ref = skillsSuggestionRefs.current[index];
        if (ref && ref.contains(event.target)) {
          shouldHide = false;
        }
      });
      const inputs = document.querySelectorAll(".skill-input");
      inputs.forEach((input) => {
        if (input.contains(event.target)) {
          shouldHide = false;
        }
      });
      if (shouldHide) {
        setSkillSuggestions((prev) => {
          const newSuggestions = {};
          Object.keys(prev).forEach((key) => {
            newSuggestions[key] = { ...prev[key], show: false };
          });
          return newSuggestions;
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideLanguage = (event) => {
      if (
        languageSuggestionsRef.current &&
        !languageSuggestionsRef.current.contains(event.target) &&
        event.target.name !== "languagesSpoken"
      ) {
        setLanguageSuggestions({ ...languageSuggestions, show: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutsideLanguage);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLanguage);
    };
  }, [languageSuggestions]);

  // useEffect(() => {
  //     const handleClickOutsideInstitution = (event) => {
  //         let shouldHide = true;
  //         Object.keys(institutionSuggestionsRef.current).forEach((index) => {
  //             const ref = institutionSuggestionsRef.current[index];
  //             if (ref && ref.contains(event.target)) {
  //                 shouldHide = false;
  //             }
  //         });

  //         // Check if the click is inside any institution input
  //         const inputs = document.querySelectorAll('.institution-input');
  //         inputs.forEach((input) => {
  //             if (input.contains(event.target)) {
  //                 shouldHide = false;
  //             }
  //         });

  //         if (shouldHide) {
  //             setInstitutionSuggestions(prev => {
  //                 const newSuggestions = {};
  //                 Object.keys(prev).forEach(key => {
  //                     newSuggestions[key] = { ...prev[key], show: false };
  //                 });
  //                 return newSuggestions;
  //             });
  //         }
  //     };

  //     document.addEventListener('mousedown', handleClickOutsideInstitution);
  //     return () => {
  //         document.removeEventListener('mousedown', handleClickOutsideInstitution);
  //     };
  // }, []);

  useEffect(() => {
    if (formData.education && typeof formData.education === "object") {
      const formattedEducation = Object.entries(formData.education).map(
        ([degreeTitle, details]) => ({
          degreeTitle,
          endYear: details["end year"] || "",
          institution: details["institution"] || "",
        }),
      );
      setEducationList(formattedEducation);
    } else {
      setEducationList([]);
    }
  }, [formData.education]);

  useEffect(() => {
    // Always show the skills section but the content may be empty
    if (formData.skills && typeof formData.skills === "object") {
      // Skills exists and is an object - format and display
      const formattedSkills = Object.entries(formData.skills).map(
        ([skillName, details]) => {
          const mode = details["mode of teaching"] || "online";
          return {
            skillName,
            modeOfTeaching: mode,
            onlineHourlyCharge:
              details["online hourly charge"] != null
                ? String(details["online hourly charge"])
                : "",
            physicalHourlyCharge:
              details["physical hourly charge"] != null
                ? String(details["physical hourly charge"])
                : "",
          };
        },
      );
      setSkillsList(formattedSkills);
    } else {
      // Skills doesn't exist or is not an object - display empty list
      setSkillsList([]);
    }
  }, [formData.skills]);

  useEffect(() => {
    if (
      formData.workExperience &&
      typeof formData.workExperience === "object"
    ) {
      const formattedWorkExperience = Object.entries(
        formData.workExperience,
      ).map(([jobTitle, details]) => ({
        jobTitle,
        company: details.company || "",
        startYear: details["start year"] || "",
        endYear: details["end year"] || "",
        employmentType: details["employment type"] || "Full-time",
      }));
      setWorkExperienceList(formattedWorkExperience);
    } else {
      setWorkExperienceList([]);
    }
  }, [formData.workExperience]);

  useEffect(() => {
    if (
      formData.certifications &&
      typeof formData.certifications === "object"
    ) {
      const formattedCertifications = Object.entries(
        formData.certifications,
      ).map(([certificationName, details]) => ({
        certificationName,
        year: details.year || "",
        certificationBody: details["certification body"] || "",
      }));
      setCertificationsList(formattedCertifications);
    } else {
      setCertificationsList([]);
    }
  }, [formData.certifications]);

  useEffect(() => {
    if (formData.preferences && typeof formData.preferences === "object") {
      const formattedPreferences = Object.entries(formData.preferences).map(
        ([key, value]) => ({
          key,
          value: String(value),
        }),
      );
      setPreferencesList(formattedPreferences);
    } else {
      setPreferencesList([]);
    }
  }, [formData.preferences]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    let error = null;
    if (name === "fullName") error = validateFullName(value);
    if (name === "phoneNumber") error = validatePhoneNumber(value);
    if (name === "dateOfBirth") error = validateDateOfBirth(value);
    if (name === "email") error = validateEmail(value);
    if (name === "password") error = validatePassword(value);
    setFormErrors({ ...formErrors, [name]: error });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducationList = [...educationList];
    updatedEducationList[index][field] = value;

    // Only show suggestions for the institution field
    if (field === "institution" && isEditing) {
      if (value.trim().length > 0) {
        const inputValue = value.toLowerCase();
        const filteredSuggestions = allAvailableInstitutions
          .filter((inst) => inst.toLowerCase().includes(inputValue))
          .slice(0, 10);
        setInstitutionSuggestions((prev) => ({
          ...prev,
          [index]: {
            list: filteredSuggestions,
            show: filteredSuggestions.length > 0,
          },
        }));
      } else {
        setInstitutionSuggestions((prev) => ({
          ...prev,
          [index]: { list: [], show: false },
        }));
      }
    }

    setEducationList(updatedEducationList);
  };

  const addEducation = () => {
    setEducationList([
      ...educationList,
      { degreeTitle: "", endYear: "", institution: "" },
    ]);
  };

  const removeEducation = (index) => {
    const updatedEducationList = educationList.filter((_, i) => i !== index);
    setEducationList(updatedEducationList);

    // Also clean up the suggestions for the removed entry
    setInstitutionSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  const handleLanguageInputChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, languagesSpoken: value });

    // Generate language suggestions
    if (value.trim().length > 0 && isEditing) {
      // Find the last word being typed (after the last comma)
      const inputText = value;
      const lastCommaIndex = inputText.lastIndexOf(",");
      const currentWord =
        lastCommaIndex === -1
          ? inputText.trim()
          : inputText.substring(lastCommaIndex + 1).trim();

      if (currentWord.length > 0) {
        const filteredSuggestions = allAvailableLanguages
          .filter((lang) =>
            lang.toLowerCase().includes(currentWord.toLowerCase()),
          )
          .slice(0, 10);

        setLanguageSuggestions({
          list: filteredSuggestions,
          show: filteredSuggestions.length > 0,
        });
      } else {
        setLanguageSuggestions({ list: [], show: false });
      }
    } else {
      setLanguageSuggestions({ list: [], show: false });
    }
  };

  const handleLanguageSuggestionClick = (suggestion) => {
    // Replace the last word (after the last comma) with the selected suggestion
    const inputText = formData.languagesSpoken;
    const lastCommaIndex = inputText.lastIndexOf(",");

    const newValue =
      lastCommaIndex === -1
        ? suggestion
        : inputText.substring(0, lastCommaIndex + 1) + " " + suggestion;

    setFormData({ ...formData, languagesSpoken: newValue });
    setLanguageSuggestions({ list: [], show: false });
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkillsList = [...skillsList];
    updatedSkillsList[index][field] = value;

    if (field === "skillName") {
      if (value.trim().length > 0 && isEditing) {
        const inputValue = value.toLowerCase();
        const filteredSuggestions = allAvailableSkills
          .filter((s) => s.toLowerCase().includes(inputValue))
          .slice(0, 10);
        setSkillSuggestions((prev) => ({
          ...prev,
          [index]: { list: filteredSuggestions, show: true },
        }));
      } else {
        setSkillSuggestions((prev) => ({
          ...prev,
          [index]: { list: [], show: false },
        }));
      }
    } else if (field === "modeOfTeaching") {
      if (value === "online") {
        updatedSkillsList[index].physicalHourlyCharge = "";
      } else if (value === "physical") {
        updatedSkillsList[index].onlineHourlyCharge = "";
      }
      setSkillSuggestions((prev) => ({
        ...prev,
        [index]: { list: [], show: false },
      }));
    }
    setSkillsList(updatedSkillsList);
  };

  const handleSkillSuggestionClick = (skillIndex, suggestion) => {
    const updatedSkillsList = [...skillsList];
    updatedSkillsList[skillIndex].skillName = suggestion;
    setSkillsList(updatedSkillsList);
    setSkillSuggestions((prev) => ({
      ...prev,
      [skillIndex]: { list: [], show: false },
    }));
  };

  const handleInstitutionSuggestionClick = (educationIndex, suggestion) => {
    const updatedEducationList = [...educationList];
    updatedEducationList[educationIndex].institution = suggestion;
    setEducationList(updatedEducationList);

    // Hide suggestions for this education input
    setInstitutionSuggestions((prev) => ({
      ...prev,
      [educationIndex]: { list: [], show: false },
    }));
  };

  const addSkill = () => {
    setSkillsList([
      ...skillsList,
      {
        skillName: "",
        modeOfTeaching: "online",
        onlineHourlyCharge: "",
        physicalHourlyCharge: "",
      },
    ]);
  };

  const removeSkill = (index) => {
    const updatedSkillsList = skillsList.filter((_, i) => i !== index);
    setSkillsList(updatedSkillsList);
    setSkillSuggestions((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedWorkExperienceList = [...workExperienceList];
    updatedWorkExperienceList[index][field] = value;
    setWorkExperienceList(updatedWorkExperienceList);
  };

  const addWorkExperience = () => {
    setWorkExperienceList([
      ...workExperienceList,
      {
        jobTitle: "",
        company: "",
        startYear: "",
        endYear: "",
        employmentType: "Full-time",
      },
    ]);
  };

  const removeWorkExperience = (index) => {
    const updatedWorkExperienceList = workExperienceList.filter(
      (_, i) => i !== index,
    );
    setWorkExperienceList(updatedWorkExperienceList);
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertificationsList = [...certificationsList];
    updatedCertificationsList[index][field] = value;
    setCertificationsList(updatedCertificationsList);
  };

  const addCertification = () => {
    setCertificationsList([
      ...certificationsList,
      { certificationName: "", year: "", certificationBody: "" },
    ]);
  };

  const removeCertification = (index) => {
    const updatedCertificationsList = certificationsList.filter(
      (_, i) => i !== index,
    );
    setCertificationsList(updatedCertificationsList);
  };

  const handlePreferenceChange = (index, field, value) => {
    const updatedPreferencesList = [...preferencesList];
    updatedPreferencesList[index][field] = value;
    setPreferencesList(updatedPreferencesList);
  };

  const addPreference = () => {
    setPreferencesList([...preferencesList, { key: "", value: "" }]);
  };

  const removePreference = (index) => {
    const updatedPreferencesList = preferencesList.filter(
      (_, i) => i !== index,
    );
    setPreferencesList(updatedPreferencesList);
  };

  const handleSubmit = async (e) => {
    console.log("Form submission started");

    e.preventDefault();

    // Validate form data
    const errors = {};
    // Check each field and store error messages
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;

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

    // Format education data
    const educationObject = educationList.reduce((acc, edu) => {
      if (edu.degreeTitle) {
        acc[edu.degreeTitle] = {
          "end year": edu.endYear,
          institution: edu.institution,
        };
      }
      return acc;
    }, {});

    // Format skills data
    const skillsObject = skillsList.reduce((acc, skill) => {
      if (skill.skillName) {
        acc[skill.skillName] = {
          "mode of teaching": skill.modeOfTeaching,
          "online hourly charge":
            (skill.modeOfTeaching === "online" ||
              skill.modeOfTeaching === "hybrid") &&
            skill.onlineHourlyCharge !== ""
              ? parseFloat(skill.onlineHourlyCharge)
              : null,
          "physical hourly charge":
            (skill.modeOfTeaching === "physical" ||
              skill.modeOfTeaching === "hybrid") &&
            skill.physicalHourlyCharge !== ""
              ? parseFloat(skill.physicalHourlyCharge)
              : null,
        };
      }
      return acc;
    }, {});

    // Format work experience data
    const workExperienceObject = workExperienceList.reduce((acc, exp) => {
      if (exp.jobTitle) {
        acc[exp.jobTitle] = {
          company: exp.company,
          "start year": exp.startYear,
          "end year": exp.endYear === "" ? null : exp.endYear,
          "employment type": exp.employmentType,
        };
      }
      return acc;
    }, {});

    // Format certifications data
    const certificationsObject = certificationsList.reduce((acc, cert) => {
      if (cert.certificationName) {
        acc[cert.certificationName] = {
          year: cert.year !== "" ? parseInt(cert.year) : null,
          "certification body": cert.certificationBody,
        };
      }
      return acc;
    }, {});

    // Format preferences data
    const preferencesObject = preferencesList.reduce((acc, pref) => {
      if (pref.key) {
        let value = pref.value;
        if (pref.value.toLowerCase() === "true") {
          value = true;
        } else if (pref.value.toLowerCase() === "false") {
          value = false;
        } else if (!isNaN(pref.value) && pref.value.trim() !== "") {
          value = parseFloat(pref.value);
        }
        acc[pref.key] = value;
      }
      return acc;
    }, {});

    // Parse languages spoken
    const languagesSpokenArray = formData.languagesSpoken
      ? formData.languagesSpoken.split(",").map((lang) => lang.trim())
      : [];

    // Create the request body with required fields
    const requestBody = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phoneNumber,
      location: formData.location,
      date_of_birth: formData.dateOfBirth,
      languages_spoken: languagesSpokenArray,
    };

    // Handle optional fields - only include them if they have content

    // Bio field
    if (formData.bio) {
      requestBody.bio = formData.bio;
    }

    // Skills field - only include if there are skills
    if (Object.keys(skillsObject).length > 0) {
      requestBody.skills = skillsObject;
    }

    // Work experience field - only include if there's work experience
    if (Object.keys(workExperienceObject).length > 0) {
      requestBody.work_experience = workExperienceObject;
    }

    // Certifications field - only include if there are certifications
    if (Object.keys(certificationsObject).length > 0) {
      requestBody.certifications = certificationsObject;
    }

    // Education field - only include if there's education data
    if (Object.keys(educationObject).length > 0) {
      requestBody.education = educationObject;
    }

    // Preferences field - only include if there are preferences
    if (Object.keys(preferencesObject).length > 0) {
      requestBody.preferences = preferencesObject;
    }

    // Only include password if it was changed
    if (formData.password && formData.password !== originalData.password) {
      requestBody.password = formData.password;
    }

    console.log("Submitting data:", requestBody);

    try {
      // Send the data to the server
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

      // Update original data to reflect the new state
      setOriginalData({ ...formData });

      alert("Profile updated successfully!");
      setIsEditing(false);
      setSkillSuggestions({});
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setFormData(originalData);
    if (originalData.education && typeof originalData.education === "object") {
      const formattedEducation = Object.entries(originalData.education).map(
        ([degreeTitle, details]) => ({
          degreeTitle,
          endYear: details["end year"] || "",
          institution: details["institution"] || "",
        }),
      );
      setEducationList(formattedEducation);
    } else {
      setEducationList([]);
    }

    if (originalData.skills && typeof originalData.skills === "object") {
      const formattedSkills = Object.entries(originalData.skills).map(
        ([skillName, details]) => {
          const mode = details["mode of teaching"] || "online";
          return {
            skillName,
            modeOfTeaching: mode,
            onlineHourlyCharge:
              details["online hourly charge"] != null
                ? String(details["online hourly charge"])
                : "",
            physicalHourlyCharge:
              details["physical hourly charge"] != null
                ? String(details["physical hourly charge"])
                : "",
          };
        },
      );
      setSkillsList(formattedSkills);
    } else {
      setSkillsList([]);
    }

    if (
      originalData.workExperience &&
      typeof originalData.workExperience === "object"
    ) {
      const formattedWorkExperience = Object.entries(
        originalData.workExperience,
      ).map(([jobTitle, details]) => ({
        jobTitle,
        company: details.company || "",
        startYear: details["start year"] || "",
        endYear: details["end year"] || "",
        employmentType: details["employment type"] || "",
      }));
      setWorkExperienceList(formattedWorkExperience);
    } else {
      setWorkExperienceList([]);
    }

    if (
      originalData.certifications &&
      typeof originalData.certifications === "object"
    ) {
      const formattedCertifications = Object.entries(
        originalData.certifications,
      ).map(([certificationName, details]) => ({
        certificationName,
        year: details.year || "",
        certificationBody: details["certification body"] || "",
      }));
      setCertificationsList(formattedCertifications);
    } else {
      setCertificationsList([]);
    }

    if (
      originalData.preferences &&
      typeof originalData.preferences === "object"
    ) {
      const formattedPreferences = Object.entries(originalData.preferences).map(
        ([key, value]) => ({
          key,
          value: String(value),
        }),
      );
      setPreferencesList(formattedPreferences);
    } else {
      setPreferencesList([]);
    }

    setIsEditing(false);
    setFormErrors({});
    setSkillSuggestions({});
    setLanguageSuggestions({ list: [], show: false });
    setInstitutionSuggestions({});
  };

  if (loading) {
    return <div data-oid="97ts9h0">Loading...</div>;
  }

  return (
    <div className="global-main-container" data-oid=":wut6hd">
      <h1 className="global-title" data-oid="0e7zlb-">
        User Profile
      </h1>
      <form
        className="global-form"
        onSubmit={handleSubmit}
        noValidate
        style={{ paddingBottom: "80px" }}
        data-oid="ujv19a5"
      >
        <div className="global-profile-picture-container" data-oid="1-p2_x6">
          <img
            className="global-profile-picture"
            src={formData.profilePicture}
            alt="profile pic icon"
            data-oid="129l-qm"
          />
        </div>
        <InputField
          label="Full Name"
          value={formData.fullName}
          onChange={handleInputChange}
          name="fullName"
          readOnly={!isEditing}
          error={formErrors.fullName}
          data-oid="n0:6lnj"
        />

        <InputField
          label="Email"
          value={formData.email}
          onChange={handleInputChange}
          name="email"
          readOnly={!isEditing}
          error={formErrors.email}
          data-oid="g3rlmn4"
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
          data-oid="bbxl10j"
        />

        <InputField
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          name="phoneNumber"
          readOnly={!isEditing}
          error={formErrors.phoneNumber}
          data-oid=".l-iwkf"
        />

        <InputField
          label="Location"
          value={formData.location}
          onChange={handleInputChange}
          name="location"
          readOnly={!isEditing}
          data-oid="ec82x-l"
        />

        <InputField
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          name="dateOfBirth"
          type="date"
          readOnly={!isEditing}
          error={formErrors.dateOfBirth}
          data-oid="8xqgh2i"
        />

        <div className="language-name-container" data-oid="sjb0:vc">
          <InputField
            label="Languages Spoken"
            value={formData.languagesSpoken}
            onChange={handleLanguageInputChange}
            name="languagesSpoken"
            readOnly={!isEditing}
            placeholder="e.g., English, French, Spanish"
            onBlur={() => {
              setTimeout(() => {
                setLanguageSuggestions({ ...languageSuggestions, show: false });
              }, 100);
            }}
            onFocus={() => {
              if (formData.languagesSpoken.trim().length > 0 && isEditing) {
                const inputText = formData.languagesSpoken;
                const lastCommaIndex = inputText.lastIndexOf(",");
                const currentWord =
                  lastCommaIndex === -1
                    ? inputText.trim()
                    : inputText.substring(lastCommaIndex + 1).trim();

                if (currentWord.length > 0) {
                  const filteredSuggestions = allAvailableLanguages
                    .filter((lang) =>
                      lang.toLowerCase().includes(currentWord.toLowerCase()),
                    )
                    .slice(0, 10);

                  setLanguageSuggestions({
                    list: filteredSuggestions,
                    show: filteredSuggestions.length > 0,
                  });
                }
              }
            }}
            data-oid="v5on-o9"
          />

          {isEditing &&
            languageSuggestions.show &&
            languageSuggestions.list.length > 0 && (
              <div
                className="global-suggestions-container"
                ref={languageSuggestionsRef}
                data-oid="dplfrls"
              >
                {languageSuggestions.list.map((suggestion, index) => (
                  <div
                    key={index}
                    className="global-suggestion-item"
                    onMouseDown={() =>
                      handleLanguageSuggestionClick(suggestion)
                    }
                    data-oid="ogc4xpl"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
        </div>
        {formData.bio && (
          <div className="global-form-group" data-oid="jdkxcn7">
            <label data-oid="ongqq_1">Bio</label>
            <textarea
              value={formData.bio}
              name="bio"
              readOnly={!isEditing}
              onChange={handleInputChange}
              className={`${!isEditing ? "global-input-readonly" : ""}`}
              data-oid="k5jj:-i"
            />
          </div>
        )}
        <div className="education-section" data-oid="cwrxm:z">
          <hr data-oid="7.1axjd" />
          <h3 data-oid="lb7on1:">Education</h3>
          {educationList.map((education, index) => (
            <div key={index} className="education-entry" data-oid="yyaepr1">
              <hr style={{ width: "30%" }} data-oid="789.8fw" />
              <InputField
                label="Degree Title"
                value={education.degreeTitle}
                onChange={(e) =>
                  handleEducationChange(index, "degreeTitle", e.target.value)
                }
                name={`degreeTitle-${index}`}
                readOnly={!isEditing}
                data-oid="v8hyb9m"
              />

              <InputField
                label="End Year"
                value={education.endYear}
                onChange={(e) =>
                  handleEducationChange(index, "endYear", e.target.value)
                }
                name={`endYear-${index}`}
                readOnly={!isEditing}
                type="number"
                data-oid="g5kyj.3"
              />

              <div className="institution-name-container" data-oid="ls7xm-c">
                <InputField
                  label="Institution"
                  value={education.institution}
                  onChange={(e) =>
                    handleEducationChange(index, "institution", e.target.value)
                  }
                  name={`institution-${index}`}
                  readOnly={!isEditing}
                  className="institution-input"
                  onBlur={() => {
                    setTimeout(() => {
                      setInstitutionSuggestions((prev) => ({
                        ...prev,
                        [index]: { ...prev[index], show: false },
                      }));
                    }, 100);
                  }}
                  onFocus={() => {
                    if (
                      education.institution.trim().length > 0 &&
                      allAvailableInstitutions.length > 0
                    ) {
                      const inputValue = education.institution.toLowerCase();
                      const filteredSuggestions = allAvailableInstitutions
                        .filter((inst) =>
                          inst.toLowerCase().includes(inputValue),
                        )
                        .slice(0, 10);
                      if (filteredSuggestions.length > 0) {
                        setInstitutionSuggestions((prev) => ({
                          ...prev,
                          [index]: { list: filteredSuggestions, show: true },
                        }));
                      }
                    }
                  }}
                  data-oid="3tqkvh:"
                />

                {isEditing &&
                  institutionSuggestions[index]?.show &&
                  institutionSuggestions[index]?.list.length > 0 && (
                    <div
                      className="global-suggestions-container"
                      ref={(el) =>
                        (institutionSuggestionsRef.current[index] = el)
                      }
                      data-oid="4dis.v9"
                    >
                      {institutionSuggestions[index].list.map(
                        (suggestion, sIndex) => (
                          <div
                            key={sIndex}
                            className="global-suggestion-item"
                            onMouseDown={() =>
                              handleInstitutionSuggestionClick(
                                index,
                                suggestion,
                              )
                            }
                            data-oid="0rg5:i2"
                          >
                            {suggestion}
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  className="global-remove-button"
                  onClick={() => removeEducation(index)}
                  data-oid="le_crcj"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              type="button"
              className="global-add-button"
              onClick={addEducation}
              data-oid="rr26lnb"
            >
              Add Education
            </button>
          )}
        </div>

        {Object.prototype.hasOwnProperty.call(formData, "skills") && (
          <div className="skills-section" data-oid="q8sz_mq">
            <hr data-oid="rvfkkik" />
            <h3 data-oid="rf8vj_d">Skills</h3>
            {skillsList.length > 0 ? (
              skillsList.map((skill, index) => (
                <div key={index} className="skill-entry" data-oid="_nqqbro">
                  <hr style={{ width: "30%" }} data-oid="ncw0l7w" />
                  <div className="skill-name-container" data-oid="jx0l_92">
                    <InputField
                      label="Skill Name"
                      value={skill.skillName}
                      onChange={(e) =>
                        handleSkillChange(index, "skillName", e.target.value)
                      }
                      name={`skillName-${index}`}
                      readOnly={!isEditing}
                      className="skill-input"
                      onBlur={() => {
                        setTimeout(() => {
                          setSkillSuggestions((prev) => ({
                            ...prev,
                            [index]: { ...prev[index], show: false },
                          }));
                        }, 100);
                      }}
                      onFocus={() => {
                        if (
                          skill.skillName.trim().length > 0 &&
                          allAvailableSkills.length > 0
                        ) {
                          const inputValue = skill.skillName.toLowerCase();
                          const filteredSuggestions = allAvailableSkills
                            .filter((s) => s.toLowerCase().includes(inputValue))
                            .slice(0, 10);
                          if (filteredSuggestions.length > 0) {
                            setSkillSuggestions((prev) => ({
                              ...prev,
                              [index]: {
                                list: filteredSuggestions,
                                show: true,
                              },
                            }));
                          }
                        }
                      }}
                      data-oid="h.qhl4-"
                    />

                    {isEditing &&
                      skillSuggestions[index]?.show &&
                      skillSuggestions[index]?.list.length > 0 && (
                        <div
                          className="global-suggestions-container"
                          ref={(el) =>
                            (skillsSuggestionRefs.current[index] = el)
                          }
                          data-oid="y5o9x59"
                        >
                          {skillSuggestions[index].list.map(
                            (suggestion, sIndex) => (
                              <div
                                key={sIndex}
                                className="global-suggestion-item"
                                onMouseDown={() =>
                                  handleSkillSuggestionClick(index, suggestion)
                                }
                                data-oid="p0fcgb:"
                              >
                                {suggestion}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  <div className="global-form-group" data-oid="epg88ea">
                    <label
                      htmlFor={`modeOfTeaching-${index}`}
                      data-oid="6qi8xc4"
                    >
                      Mode of Teaching
                    </label>
                    <select
                      id={`modeOfTeaching-${index}`}
                      name={`modeOfTeaching-${index}`}
                      value={skill.modeOfTeaching}
                      onChange={(e) =>
                        handleSkillChange(
                          index,
                          "modeOfTeaching",
                          e.target.value,
                        )
                      }
                      disabled={!isEditing}
                      className="global-select"
                      data-oid="7jq6thq"
                    >
                      <option value="online" data-oid=":2naca4">
                        Online
                      </option>
                      <option value="physical" data-oid="i.49rzx">
                        Physical
                      </option>
                      <option value="hybrid" data-oid="_iqp213">
                        Hybrid
                      </option>
                    </select>
                  </div>

                  {(skill.modeOfTeaching === "online" ||
                    skill.modeOfTeaching === "hybrid") && (
                    <InputField
                      label="Online Hourly Charge"
                      type="number"
                      value={skill.onlineHourlyCharge}
                      onChange={(e) =>
                        handleSkillChange(
                          index,
                          "onlineHourlyCharge",
                          e.target.value,
                        )
                      }
                      name={`onlineHourlyCharge-${index}`}
                      readOnly={!isEditing}
                      placeholder="e.g., 50"
                      data-oid="bnmhaww"
                    />
                  )}
                  {(skill.modeOfTeaching === "physical" ||
                    skill.modeOfTeaching === "hybrid") && (
                    <InputField
                      label="Physical Hourly Charge"
                      type="number"
                      value={skill.physicalHourlyCharge}
                      onChange={(e) =>
                        handleSkillChange(
                          index,
                          "physicalHourlyCharge",
                          e.target.value,
                        )
                      }
                      name={`physicalHourlyCharge-${index}`}
                      readOnly={!isEditing}
                      placeholder="e.g., 70"
                      data-oid="_b5wu9h"
                    />
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      className="global-remove-button"
                      onClick={() => removeSkill(index)}
                      data-oid="kb-n:j7"
                    >
                      Remove Skill
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p data-oid="tn3ffwn">No skills added yet.</p>
            )}

            {isEditing && (
              <button
                type="button"
                className="global-add-button"
                onClick={addSkill}
                data-oid="a:hrs9g"
              >
                Add Skill
              </button>
            )}
          </div>
        )}

        {Object.prototype.hasOwnProperty.call(formData, "workExperience") && (
          <div className="work-experience-section" data-oid="gz1ndg4">
            <hr data-oid="w5pmj4_" />
            <h3 data-oid="qmu3bds">Work Experience</h3>
            {workExperienceList.map((exp, index) => (
              <div
                key={index}
                className="work-experience-entry"
                data-oid="elov6p4"
              >
                <hr style={{ width: "30%" }} data-oid="kkv32:j" />
                <InputField
                  label="Job Title"
                  value={exp.jobTitle}
                  onChange={(e) =>
                    handleWorkExperienceChange(
                      index,
                      "jobTitle",
                      e.target.value,
                    )
                  }
                  name={`jobTitle-${index}`}
                  readOnly={!isEditing}
                  data-oid="e9vglvy"
                />

                <InputField
                  label="Company"
                  value={exp.company}
                  onChange={(e) =>
                    handleWorkExperienceChange(index, "company", e.target.value)
                  }
                  name={`company-${index}`}
                  readOnly={!isEditing}
                  data-oid="mg3emoo"
                />

                <InputField
                  label="Start Year"
                  type="number"
                  value={exp.startYear}
                  onChange={(e) =>
                    handleWorkExperienceChange(
                      index,
                      "startYear",
                      e.target.value,
                    )
                  }
                  name={`startYear-${index}`}
                  readOnly={!isEditing}
                  placeholder="e.g., 2020"
                  data-oid="qruh9yt"
                />

                <InputField
                  label="End Year (leave blank if current)"
                  type="number"
                  value={exp.endYear}
                  onChange={(e) =>
                    handleWorkExperienceChange(index, "endYear", e.target.value)
                  }
                  name={`endYear-${index}`}
                  readOnly={!isEditing}
                  placeholder="e.g., 2022"
                  data-oid="0pu55qi"
                />

                <div className="global-form-group" data-oid="hz9.aqd">
                  <label htmlFor={`employmentType-${index}`} data-oid="5x3757f">
                    Employment Type
                  </label>
                  <select
                    id={`employmentType-${index}`}
                    name={`employmentType-${index}`}
                    value={exp.employmentType}
                    onChange={(e) =>
                      handleWorkExperienceChange(
                        index,
                        "employmentType",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                    className="global-select"
                    data-oid="5af0mdu"
                  >
                    <option value="Contract" data-oid="dlzqxnw">
                      Contract
                    </option>
                    <option value="Self-employed" data-oid="q.huqy7">
                      Self-employed
                    </option>
                    <option value="Part-time" data-oid="koh_4z4">
                      Part-time
                    </option>
                    <option value="Full-time" data-oid="8exf9d3">
                      Full-time
                    </option>
                    <option value="Internship" data-oid=".65t453">
                      Internship
                    </option>
                    <option value="Apprenticeship" data-oid="02kep12">
                      Apprenticeship
                    </option>
                    <option value="Freelance" data-oid="04szt1o">
                      Freelance
                    </option>
                  </select>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="global-remove-button"
                    onClick={() => removeWorkExperience(index)}
                    data-oid="-ko:ix3"
                  >
                    Remove Experience
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                type="button"
                className="global-add-button"
                onClick={addWorkExperience}
                data-oid="n7je3gr"
              >
                Add Work Experience
              </button>
            )}
          </div>
        )}

        {Object.prototype.hasOwnProperty.call(formData, "certifications") && (
          <div className="certifications-section" data-oid="3bknkkc">
            <hr data-oid="a-.:sdn" />
            <h3 data-oid="uffu2c-">Certifications</h3>
            {certificationsList.map((cert, index) => (
              <div
                key={index}
                className="certification-entry"
                data-oid="kfzi9u2"
              >
                <hr style={{ width: "30%" }} data-oid="04b-kys" />
                <InputField
                  label="Certification Name"
                  value={cert.certificationName}
                  onChange={(e) =>
                    handleCertificationChange(
                      index,
                      "certificationName",
                      e.target.value,
                    )
                  }
                  name={`certificationName-${index}`}
                  readOnly={!isEditing}
                  data-oid="6_1af72"
                />

                <InputField
                  label="Year"
                  type="number"
                  value={cert.year}
                  onChange={(e) =>
                    handleCertificationChange(index, "year", e.target.value)
                  }
                  name={`year-${index}`}
                  readOnly={!isEditing}
                  placeholder="e.g., 2021"
                  data-oid="i3167j9"
                />

                <InputField
                  label="Certification Body"
                  value={cert.certificationBody}
                  onChange={(e) =>
                    handleCertificationChange(
                      index,
                      "certificationBody",
                      e.target.value,
                    )
                  }
                  name={`certificationBody-${index}`}
                  readOnly={!isEditing}
                  placeholder="e.g., AWS, Google"
                  data-oid="4-9t9ge"
                />

                {isEditing && (
                  <button
                    type="button"
                    className="global-remove-button"
                    onClick={() => removeCertification(index)}
                    data-oid="-5g3tnf"
                  >
                    Remove Certification
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                type="button"
                className="global-add-button"
                onClick={addCertification}
                data-oid="mic390n"
              >
                Add Certification
              </button>
            )}
          </div>
        )}

        <div className="preferences-section" data-oid="nlguy.s">
          <hr data-oid="ub9c2fx" />
          <h3 data-oid="8oy69l_">Preferences</h3>
          {preferencesList.map((pref, index) => (
            <div key={index} className="preference-entry" data-oid="m3do3ys">
              <hr style={{ width: "30%" }} data-oid="l65ql2t" />
              <InputField
                label="Preference Key"
                value={pref.key}
                onChange={(e) =>
                  handlePreferenceChange(index, "key", e.target.value)
                }
                name={`prefKey-${index}`}
                readOnly={!isEditing}
                placeholder="e.g., theme"
                data-oid="h.c82z_"
              />

              <InputField
                label="Preference Value"
                value={pref.value}
                onChange={(e) =>
                  handlePreferenceChange(index, "value", e.target.value)
                }
                name={`prefValue-${index}`}
                readOnly={!isEditing}
                placeholder="e.g., dark, true, online"
                data-oid="txz9axu"
              />

              {isEditing && (
                <button
                  type="button"
                  className="global-remove-button"
                  onClick={() => removePreference(index)}
                  data-oid="j-w_jzz"
                >
                  Remove Preference
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              type="button"
              className="global-add-button"
              onClick={addPreference}
              data-oid="c_2kfq1"
            >
              Add Preference
            </button>
          )}
          {!isEditing &&
            preferencesList.length === 0 &&
            formData.preferences && (
              <pre className="global-pre" data-oid="7-048he">
                {JSON.stringify(formData.preferences, null, 2)}
              </pre>
            )}
        </div>

        {formData.rating && (
          <div className="global-form-group" data-oid="t1hip-s">
            <hr data-oid="t4ak505" />
            <h2 data-oid="32s-0kt">Rating</h2>
            <h4 data-oid="jlyo2dp">{formData.rating}</h4>
            <hr data-oid="y71xp-e" />
          </div>
        )}
        <div className="profile-actions" data-oid="narn0hp">
          {!isEditing ? (
            <button
              type="button"
              className="profile-button edit-button"
              onClick={() => setIsEditing(true)}
              data-oid="n9ksfe:"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                className="profile-button cancel-button"
                onClick={cancelEdit}
                data-oid="2s0o4_7"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-button submit-button"
                data-oid="gde_u44"
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

export default UserProfile;
