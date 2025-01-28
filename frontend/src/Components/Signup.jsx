import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { db } from "../firebase"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation checks
    if (!name.trim()) {
      setError("Name cannot be empty.");
      setLoading(false);
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setError("Email must be a valid @gmail.com address.");
      setLoading(false);
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[@$!%*?&#]/.test(password)
    ) {
      setError(
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."
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

    if (!dob) {
      setError("Please enter your date of birth.");
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
    
      // Send email verification
      await sendEmailVerification(user);
    
      // Store user details in Firestore
      const userDoc = {
        name,
        email,
        gender,
        dob,
        createdAt: new Date().toISOString(),
      };
    
      await setDoc(doc(db, "users", user.uid), userDoc);
    
      // Save the user name to localStorage
      localStorage.setItem("userName", name);
    
      // Inform the user
      setPopupMessage(
        "A verification email has been sent to your email address. Please verify your email before logging in."
      );
    
      // Redirect to login page after a delay
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Error during sign up:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else {
        setError("Failed to sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
    
      // Store user details in Firestore for Google sign-up
      const userDoc = {
        name: user.displayName,
        email: user.email,
        gender: "Not specified",
        dob: "Not specified",
        createdAt: new Date().toISOString(),
      };
    
      await setDoc(doc(db, "users", user.uid), userDoc);
    
      // Save the Google user name to localStorage
      localStorage.setItem("userName", user.displayName);
    
      setPopupMessage("Sign up successful with Google!");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
      setError("Failed to sign up with Google. Please try again.");
    }    
  };

  return (
    <div className="container-signup">
      <div className="content-signup">
        <div className="form-signup">
          <h2>Sign Up</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Others</option>
          </select>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <button onClick={handleGoogleSignUp} className="google-signup">
            <img src="../Assests/google.png" alt="Google Icon" />
            <p>Sign Up with Google</p>
          </button>
        </div>
        {popupMessage && (
          <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
        )}
      </div>
    </div>
  );
};

export default SignUp;
