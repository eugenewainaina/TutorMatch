import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import "../styles/GlobalStyles.css";
import InputField from "../components/InputField";
import { SERVER_URL } from "../config";
import { requestFirebaseNotificationPermission as requestNotificationPermission } from "../notifications/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.replace(/\s+/g, ""),
          password: password.trim(),
          role: isParent ? "parent" : isTutor ? "tutor" : "student",
        }),
      });

      if (response.redirected) {
        console.log("url", response.url);
        let nextPage = response.url.split("/").pop();

        // Check if the user is a parent and redirect to the parent profile
        if (isParent) {
          navigate("/parent_homepage", { replace: true });
        } else {
          navigate(`/${nextPage}`, { replace: true });
        }

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
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-main-container" data-oid="b979c.0">
      <h1 className="global-title" data-oid="rqi9-6r">
        Login
      </h1>
      <form className="global-form" onSubmit={handleSubmit} data-oid="r45iejo">
        <InputField
          id="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-oid="vap0mzh"
        />

        <InputField
          id="password"
          label="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          data-oid="s3y2ejb"
        />

        <div className="global-checkbox-group" data-oid="cna0hra">
          <input
            type="checkbox"
            id="tutor"
            checked={isTutor}
            onChange={(e) => {
              setIsTutor(e.target.checked);
              if (e.target.checked) setIsParent(false); // Can't be both tutor and parent
            }}
            data-oid="k:kmw2x"
          />

          <label htmlFor="tutor" data-oid="tumwjdj">
            I am a Tutor
          </label>
        </div>
        <div className="global-checkbox-group" data-oid="fy4o9zu">
          <input
            type="checkbox"
            id="parent"
            checked={isParent}
            onChange={(e) => {
              setIsParent(e.target.checked);
              if (e.target.checked) setIsTutor(false); // Can't be both parent and tutor
            }}
            data-oid="j__yk6g"
          />

          <label htmlFor="parent" data-oid="w.gkgg2">
            I am a Parent
          </label>
        </div>
        {error && (
          <div className="global-error-message" data-oid="c8bukvq">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="login-button"
          disabled={loading}
          data-oid="8ha8zrm"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="signup-prompt" data-oid="7kmh72d">
        Don't have an account?{" "}
        <Link to="/signup" className="signup-link" data-oid="n02z9y7">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default Login;
