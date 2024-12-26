import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import myImage from '../Assests/google.png';
import "../Styles/Signup.css";
import Popup from "./Popup";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return email.endsWith("@gmail.com");
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[@$!%*?&#]/.test(password)
    );
  };

  const validateDOB = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age >= 18; // Ensure the user is at least 18 years old
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Email must be a valid @gmail.com address.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      setLoading(false);
      return;
    }

    if (!dob || !validateDOB(dob)) {
      setError("You must be at least 18 years old to sign up.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPopupMessage("New User Registered Successfully!");
      setLoading(false);
      setTimeout(() => navigate("/dashboard"), 2000); // Redirect to login page after 2 seconds
    } catch (err) {
      console.error("Error during sign up:", err);
      setError("Failed to sign up. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Sign-In result:", result);
      setPopupMessage("Sign up successful with Google!");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login page after 2 seconds
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  const handleAlreadyHaveAccount = () => {
    navigate("/Login");
  };

  return (
    <div className="container-signup">
      <div className="content-signup">
        <div className="form-signup">
          <h2>Sign Up SHCS</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <br />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Others</option>
          </select>
          <br />

          <input
            type="date"
            placeholder="Enter DOB"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <br />
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <button onClick={handleGoogleSignUp} className="google-signup">
          <img src={myImage} alt="" />
            <p>Sign Up with Google</p>
          </button>

          <br />
          <p className="switch-auth">
              Don't have an account?{" "}
              <span onClick={handleAlreadyHaveAccount} className="signup-link">
                Login
              </span>
            </p>
        </div>
      </div>
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </div>
  );
};

export default SignUp;
