import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/GlobalStyles.css'; // Updated to use GlobalStyles
import './SignUp.css'; // Component-specific styles
import InputField from '../components/InputField'; // Import reusable InputField
import { SERVER_URL } from '../config';
import { requestFirebaseNotificationPermission as requestNotificationPermission } from '../notifications/firebase';
import {
    validateFullName,
    validatePhoneNumber,
    validateEmail,
    validatePassword,
    validateDateOfBirth
} from '../validation';

const SignUp = () => {
    const [form, setForm] = useState({
        fullName: '',
        dob: '',
        email: '',
        password: '',
        phone: '',
    });
    const [userType, setUserType] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Validate the field based on its name
        let error = null;
        switch (name) {
            case 'fullName':
                error = validateFullName(value);
                break;
            case 'phone':
                error = validatePhoneNumber(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'dob':
                error = validateDateOfBirth(value, userType); // Pass userType for DOB validation
                break;
            default:
                break;
        }

        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleUserTypeChange = (event) => {
        const newRole = event.target.value;
        setUserType(newRole);

        // Revalidate the dob field based on the new role
        const dobError = validateDateOfBirth(form.dob, newRole);
        setFormErrors(prev => ({
            ...prev,
            userType: null, // Clear any existing userType error
            dob: dobError,  // Update the dob error based on the new role
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const fullNameError = validateFullName(form.fullName);
        if (fullNameError) newErrors.fullName = fullNameError;

        const phoneError = validatePhoneNumber(form.phone);
        if (phoneError) newErrors.phone = phoneError;

        const emailError = validateEmail(form.email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validatePassword(form.password);
        if (passwordError) newErrors.password = passwordError;

        if (!userType) newErrors.userType = "Please select whether you are a Student, Tutor, or Parent";

        const dobError = validateDateOfBirth(form.dob, userType);
        if (dobError) newErrors.dob = dobError;

        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const trimmedPhone = form.phone.replace(/\s+/g, '');
            const response = await fetch(`${SERVER_URL}/sign_up`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.fullName.trim(),
                    phone: trimmedPhone,
                    email: form.email.replace(/\s+/g, ''),
                    password: form.password.trim(),
                    role: userType,
                    date_of_birth: form.dob
                })
            });

            if (response.redirected) {
                console.log("url", response.url);
                let nextPage = response.url.split('/').pop();
                navigate(`/${nextPage}`, { replace: true });

                requestNotificationPermission();
                return;
            }

            // if (response.status === 200) {
            //     // navigate('/login');
            //     console.log('Sign up successful');
            //     console.log("response", response);
            // } 
            else {
                const err = await response.json();
                console.log("error", err);

                setError(`Sign up failed. ${err.error}`);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="global-main-container">
            <h1 className="global-title">Sign Up</h1>
            <form className="global-form" onSubmit={handleSubmit} noValidate>
                <InputField
                    id="fullName"
                    label="Full Name"
                    name="fullName"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    error={formErrors.fullName}
                />
                <InputField
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    placeholder="+254 722 123 456"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    error={formErrors.phone}
                />
                <InputField
                    id="dob"
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                    required
                    error={formErrors.dob}
                />
                <InputField
                    id="email"
                    label="Email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    error={formErrors.email}
                />
                <InputField
                    id="password"
                    label="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    type='password'
                    error={formErrors.password}
                />
                <div className="global-form-group">
                    <label className="user-type-label">I am a: <span className="global-required">*</span></label>
                    <div className="global-radio-group">
                        <div className="global-radio-option">
                            <input
                                type="radio"
                                id="student"
                                name="userType"
                                value="student"
                                checked={userType === 'student'}
                                onChange={handleUserTypeChange}
                                required
                            />
                            <label htmlFor="student">Student</label>
                        </div>
                        <div className="global-radio-option">
                            <input
                                type="radio"
                                id="tutor"
                                name="userType"
                                value="tutor"
                                checked={userType === 'tutor'}
                                onChange={handleUserTypeChange}
                                required
                            />
                            <label htmlFor="tutor">Tutor</label>
                        </div>
                        <div className="global-radio-option">
                            <input
                                type="radio"
                                id="parent"
                                name="userType"
                                value="parent"
                                checked={userType === 'parent'}
                                onChange={handleUserTypeChange}
                                required
                            />
                            <label htmlFor="parent">Parent</label>
                        </div>
                    </div>
                    {formErrors.userType && <p className="global-error-message">{formErrors.userType}</p>}
                </div>

                {error && <div className="global-error-message">{error}</div>}

                <button type="submit" className="signup-button" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            <p className="login-prompt">
                Already have an account? <Link to="/login" className="login-link">Login</Link>
            </p>
        </div>
    );
};

export default SignUp;