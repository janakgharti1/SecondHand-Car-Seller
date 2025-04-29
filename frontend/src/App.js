import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { auth, db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";

import Login from "./Components/Login";
import SignUp from "./Components/Signup";
import ForgetPassword from "./Components/ForgetPassword";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
import UserDashboard from "./UserDashboard/UserDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import ExploreUsedCar from "./Components/ExploreUsedCar";
import SellCar from "./Components/SellCar";
import CompareCar from "./Components/CompareCar";
import Footer from "./Components/Footer";
import UploadedCar from "./UserDashboard/UploadedCar";
import UserProfile from "./UserDashboard/UserProfile";
import MyFavourites from "./UserDashboard/MyFavourites";
import AdminDashboard from "./Admin/AdminDashboard";
import AuctionManagement from "./Admin/AuctionManagement";
import CarListingManagement from "./Admin/CarListingManagement";
import ComparisonInsights from "./Admin/ComparisonInsights";
import UserManagement from "./Admin/UserManagement";
import ReportsAnalytics from "./Admin/ReportsAnalytics";
import DashboardOverview from "./Admin/DashboardOverview";
import CarDetails from "./ExploreCars/CarDetails";
import AntiqueCarAuction from "./Auction/AntiqueCarAuction";
import AddCarAuction from "./Auction/AddCarAuction";
import ContactWithAdmin from "./ContactChat/ContactWithAdmin";
import ContactWithUser from "./Admin/ContactWithUser";
import Dashaboard from "./UserDashboard/Dashboard";

function App() {
  const [userRole, setUserRole] = useState(null);
  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role || "User");
          } else {
            setUserRole("User");
          }
        }, (error) => {
          console.error("Error fetching user role:", error);
          setUserRole("User");
        });
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/usedcar" element={<ExploreUsedCar />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/sellcar" element={<SellCar />} />
        <Route path="/comparecar" element={<CompareCar />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carauction" element={<AntiqueCarAuction />} />
        <Route path="/addcarauction" element={<AddCarAuction />} />
        <Route path="/contactwithadmin" element={<ContactWithAdmin />} />

        {/* Protected Routes for Users */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="User" userRole={userRole} />}>
          <Route path="/userdashboard" element={<UserDashboard />}>
            <Route index element={<Dashaboard />} />
            <Route path="dashboard" element={<Dashaboard />} />
            <Route path="uploaded-cars" element={<UploadedCar />} />
            <Route path="favorites" element={<MyFavourites />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin" userRole={userRole} />}>
          <Route path="/admindashboard" element={<AdminDashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="car-listings" element={<CarListingManagement />} />
            <Route path="auction-management" element={<AuctionManagement />} />
            <Route path="comparison-insights" element={<ComparisonInsights />} />
            <Route path="reports-analytics" element={<ReportsAnalytics />} />
            <Route path="contactwithuser" element={<ContactWithUser />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;