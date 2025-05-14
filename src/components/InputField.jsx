import React, { useState } from 'react';
import '../styles/GlobalStyles.css';

const InputField = ({ id, label, value, onChange, name, readOnly = false, type = "text", error, required = false, placeholder, onBlur, onFocus }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    // Determine the input type: for password, toggle between "text" and "password"; otherwise, use provided type
    const inputType = type === "password" && showPassword ? "text" : type;

    return (
        <div className="global-form-group">
            <label htmlFor={id}>
                {required && <span className="global-required">* </span>}
                {label}
            </label>
            <div className={`${type === "password" ? "global-password-container" : ""}`}>
                <input
                    type={inputType}
                    id={id}
                    name={name}
                    placeholder={placeholder || (type === "password" ? "••••••••" : undefined)}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    required={required}
                    className={`${readOnly ? 'global-input-readonly' : ''} ${error ? 'global-error-input' : ''}`}
                    onBlur={onBlur}
                    onFocus={onFocus}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="global-toggle-password"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>
            {error && <p className="global-error-message">{error}</p>}
        </div>
    );
};

export default InputField;