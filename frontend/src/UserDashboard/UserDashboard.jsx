import React, { useState } from "react";
import "../UserDashboard/UserDashboard.css";
import Welcome from "./Welcome";
import UploadedCar from "./UploadedCar";
import UserProfile from "./UserProfile";

const UserDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <Welcome />;
      case "uploaded-cars":
        return <UploadedCar />;
      case "profile":
        return <UserProfile />;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-left">
        <div className={`menu-item ${activePage === "dashboard" ? "active" : ""}`} onClick={() => setActivePage("dashboard")}>
          <span className="menu-icon">⬛</span> Welcome
        </div>
        <div className={`menu-item ${activePage === "uploaded-cars" ? "active" : ""}`} onClick={() => setActivePage("uploaded-cars")}>
          <span className="menu-icon">👥</span> My Uploaded Car
        </div>
        <div className={`menu-item ${activePage === "profile" ? "active" : ""}`} onClick={() => setActivePage("profile")}>
          <span className="menu-icon">👤</span> Profile
        </div>
      </div>

      <div className="user-dashboard-right">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;
