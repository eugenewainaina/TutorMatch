import React, { useState } from "react";
import "../styles/GlobalStyles.css";

const InputField = ({
  id,
  label,
  value,
  onChange,
  name,
  readOnly = false,
  type = "text",
  error,
  required = false,
  placeholder,
  onBlur,
  onFocus,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Determine the input type: for password, toggle between "text" and "password"; otherwise, use provided type
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="global-form-group" data-oid="58rs:dn">
      <label htmlFor={id} data-oid=".nrzbt.">
        {required && (
          <span className="global-required" data-oid="0rxhn:2">
            *{" "}
          </span>
        )}
        {label}
      </label>
      <div
        className={`${type === "password" ? "global-password-container" : ""}`}
        data-oid="snxsl_7"
      >
        <input
          type={inputType}
          id={id}
          name={name}
          placeholder={
            placeholder || (type === "password" ? "••••••••" : undefined)
          }
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          className={`${readOnly ? "global-input-readonly" : ""} ${error ? "global-error-input" : ""}`}
          onBlur={onBlur}
          onFocus={onFocus}
          data-oid="anyenx1"
        />

        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="global-toggle-password"
            data-oid="vthkey1"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p className="global-error-message" data-oid="lrqis4v">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
