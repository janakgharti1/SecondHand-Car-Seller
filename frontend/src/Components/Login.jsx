import React, { useState } from "react";
import "../Styles/Login.css";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebase"; // Firestore instance

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        setError("Your email is not verified. Please check your inbox and verify your email.");
        setLoading(false);
        return;
      }

      // Get and store auth token
      const token = await user.getIdToken();
      localStorage.setItem("authToken", token);

      // Fetch user's data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("userName", userData.name || "User"); // Store name in localStorage
        localStorage.setItem("userRole", userData.role || "user"); // Store role in localStorage

        // Redirect based on role
        if (userData.role === "Admin") {
          navigate("/admindashboard"); // Redirect to Admin Dashboard
        } else {
          navigate("/"); // Redirect to Home Page
        }
      } else {
        setError("User data not found. Please contact support.");
      }

      setLoading(false);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forget-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="container-login">
      <div className="content-login">
        <div className="form">
          <div className="login-container">
            <h2 id="login">Login SHCS</h2>
            {error && <p className="error-message">{error}</p>}
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
            <p onClick={handleForgotPassword} className="forgot-password">
              Forgot Password?
            </p>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="switch-auth">
              Don't have an account?{" "}
              <span onClick={handleSignUp} className="signup-link">
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
