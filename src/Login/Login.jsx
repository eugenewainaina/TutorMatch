import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import '../styles/GlobalStyles.css'; 
import InputField from '../components/InputField'; 
import { SERVER_URL } from '../config';
import { requestFirebaseNotificationPermission as requestNotificationPermission } from '../notifications/firebase';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isTutor, setIsTutor] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in both email and password.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${SERVER_URL}/login`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    email: email.replace(/\s+/g, ''),
                    password: password.trim(),
                    role: isTutor ? 'tutor' : 'student'
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
            //     const data = await response.json();
            //     console.log("role: ", data.user_role);
            //     requestNotificationPermission();
            //     navigate('/profile', { replace: true });
            // }
             else {
                const err = await response.json();
                console.log("error", err);

                setError(`Login failed. ${err.error}`);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="global-main-container">
            <h1 className="global-title">Login</h1>
            <form className="global-form" onSubmit={handleSubmit}>
                <InputField
                    id="email"
                    label="Email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <InputField
                    id="password"
                    label="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type='password'
                />
                
                <div className="global-checkbox-group">
                    <input
                        type="checkbox"
                        id="tutor"
                        checked={isTutor}
                        onChange={(e) => setIsTutor(e.target.checked)}
                    />
                    <label htmlFor="tutor">I am a Tutor</label>
                </div>
                {error && <div className="global-error-message">{error}</div>}
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="signup-prompt">
                Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
            </p>
        </div>
    );
}

export default Login;