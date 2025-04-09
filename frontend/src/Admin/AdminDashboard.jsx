import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "../Admin/AdminDashboard.css"; // Import the specific AdminDashboard CSS

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        onSnapshot(userRef, (doc) => {
          if (doc.exists() && doc.data().role !== "Admin") {
            navigate("/userdashboard");
          }
        }, (error) => {
          console.error("Error fetching user role:", error);
          navigate("/userdashboard");
        });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-left">
        {/* Adding a header similar to UserDashboard */}
        <div className="dashboard-username-logo">
          <svg
            className="profile-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="username">Admin</span>
        </div>

        {/* Menu Section */}
        <div className="menu-section">
          <div className="menu-item">
            <NavLink
              to="user-management"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <i className="fa fa-users"></i> User Management
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="car-listings"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <i className="fa fa-car"></i> Car Listings Management
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="auction-management"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <i className="fa fa-gavel"></i> Auction Management
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="comparison-insights"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <i className="fa fa-exchange-alt"></i> Car Comparison Insights
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="reports-analytics"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <i className="fa fa-chart-line"></i> Reports & Analytics
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="contactwithuser"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <i className="fa fa-comments"></i> Chat With User
            </NavLink>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-right">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;