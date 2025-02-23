import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

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
import AdminDashboard from "./Admin/AdminDashboard";
import AuctionManagement from "./Admin/AuctionManagement";
import CarListingManagement from "./Admin/CarListingManagement";
import ComparisonInsights from "./Admin/ComparisonInsights";
import UserManagement from "./Admin/UserManagement";
import ReportsAnalytics from "./Admin/ReportsAnalytics";
import DashboardOverview from "./Admin/DashboardOverview";
import CarDetails from "./ExploreCars/CarDetails";

function App() {
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/usedcar" element={<ExploreUsedCar />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/sellcar" element={<SellCar />} />
        <Route path="/about" element={<About />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes for Users */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="User" />}>
          <Route path="/userdashboard" element={<UserDashboard />}>
            {/* Nested Routes for Dashboard */}
            <Route index element={<Welcome />} />
            <Route path="uploaded-cars" element={<UploadedCar />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin" />}>
          <Route path="/admindashboard" element={<AdminDashboard />}>
            {/* Nested Routes for Admin Dashboard */}
            <Route index element={<DashboardOverview />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="car-listings" element={<CarListingManagement />} />
            <Route path="auction-management" element={<AuctionManagement />} />
            <Route path="comparison-insights" element={<ComparisonInsights />} />
            <Route path="reports-analytics" element={<ReportsAnalytics />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
