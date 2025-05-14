export const validateFullName = (fullName) => {
    if (!fullName.trim()) return "Full Name is required";
    if (fullName.trim().length < 3) return "Full Name must be at least 3 characters";
    return null;
};

export const validatePhoneNumber = (phone) => {
    const trimmed = phone.replace(/\s+/g, '');
    if (!trimmed) return "Phone number is required";
    if (!/^\+\d{10,}$/.test(trimmed)) return "Phone number must start with + and have at least 10 digits";
    return null;
};

export const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return "Invalid email address";
    return null;
};

export const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
    return null;
};

export const validateDateOfBirth = (dob, userType) => {
    if (!dob) return "Date of Birth is required";
    const dobDate = new Date(dob);
    const today = new Date();
    if (dobDate > today) return "Date of birth cannot be in the future";
    if (userType === 'tutor') {
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }
        if (age < 16) return "Tutors must be at least 16 years old";
    }
    return null;
};