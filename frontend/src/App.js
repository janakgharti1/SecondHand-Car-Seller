import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Components/Login";
import SignUp from "./Components/Signup";
import ForgetPassword from "./Components/ForgetPassword";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
import UserDashboard from "./UserDashboard/UserDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import ExploreUsedCar from "./Components/ExploreUsedCar";
import SellCar from "./Components/SellCar";
import About from "./Components/About";
import Footer from "./Components/Footer";
import UploadedCar from "./UserDashboard/UploadedCar";
import UserProfile from "./UserDashboard/UserProfile";
import Welcome from "./UserDashboard/Welcome";

function App() {
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/usedcar" element={<ExploreUsedCar />} />
        <Route path="/sellcar" element={<SellCar />} />
        <Route path="/about" element={<About />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
        >
          <Route path="/userdashboard" element={<UserDashboard />}>
            {/* Nested Routes for Dashboard */}
            <Route path="dashboard" element={<Welcome />} />
            <Route path="uploaded-cars" element={<UploadedCar />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
