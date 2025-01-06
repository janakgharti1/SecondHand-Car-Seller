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
import ExploreUsedCar from "./Components/ExploreUsedCar";
import SellCar from "./Components/SellCar";
import About from "./Components/About";
import Contact from "./Components/Contact";

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
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login" element={<Login />} />


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
