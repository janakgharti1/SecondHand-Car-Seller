import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "../UserDashboard/UserDashboard.css";
import { 
  Home, 
  Car, 
  Heart,  
  Settings, 
  User, 
  HelpCircle,
} from "lucide-react";

const UserDashboard = () => {
  const [userName, setUserName] = useState("Guest");
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeUser;

    const setupUserListener = async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserName(data.name || user.email || "User");
            if (data.role === "Admin") {
              navigate("/admindashboard");
            }
          } else {
            setUserName(user.email || "User");
          }
        }, (error) => {
          console.error('Error fetching user name:', error);
          setUserName(user.email || "User");
        });
      } else {
        setUserName("Guest");
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setupUserListener(user);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [navigate]);

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-left">
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
          <span className="username">{userName}</span>
        </div>
        
        <div className="menu-section">
          <div className="menu-item">
            <NavLink
              to="dashboard"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <Home size={20} /> Dashboard
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="uploaded-cars"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <Car size={20} /> My Uploaded Cars
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="favorites"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <Heart size={20} /> Favorites
            </NavLink>
          </div>
        </div>
        
        <div className="menu-section">
          <h3 className="section-title">Account</h3>
          <div className="menu-item">
            <NavLink
              to="profile"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <User size={20} /> Profile
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="settings"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <Settings size={20} /> Settings
            </NavLink>
          </div>
          <div className="menu-item">
            <NavLink
              to="help"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
            >
              <HelpCircle size={20} /> Help & Support
            </NavLink>
          </div>
        </div>
      </div>
        
      <div className="user-dashboard-right">
        <Outlet />
      </div>
    </div>
  );
};

export default UserDashboard;