import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Components/Login";
import SignUp from "./Components/Signup";
import ForgetPassword from "./Components/ForgetPassword";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
import Dashboard from "./Components/Dashboard"
import ProtectedRoute from "./Components/ProtectedRoute";
import Explore from "./Components/Explore";

function App() {
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));

  return (
    <Router>
      <Navbar />
      <Routes>
        
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/explore" element={<Explore />} />

        {/* Protected Routes */}
        <Route
          element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
