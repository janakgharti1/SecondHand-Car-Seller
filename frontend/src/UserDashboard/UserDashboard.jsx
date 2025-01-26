import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../UserDashboard/UserDashboard.css";

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      {/* Sidebar */}
      <div className="user-dashboard-left">
        <div className="menu-item">
          <NavLink
            to="dashboard"
            className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
          >
             Welcome
          </NavLink>
        </div>
        <div className="menu-item">
          <NavLink
            to="uploaded-cars"
            className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
          >
             My Uploaded Car
          </NavLink>
        </div>
        <div className="menu-item">
          <NavLink
            to="profile"
            className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
          >
             Profile
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="user-dashboard-right">
        <Outlet />
      </div>
    </div>
  );
};

export default UserDashboard;
