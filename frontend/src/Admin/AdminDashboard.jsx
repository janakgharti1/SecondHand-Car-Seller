import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../Admin/AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-dashboard-left">
        {/* later */}
        {/* <div className="menu-item">
          <NavLink
            to=""
            className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
          >
            <i className="fa fa-tachometer-alt"></i> Dashboard Overview
          </NavLink>
        </div> */} 

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
      </div>

      {/* Main Content */}
      <div className="admin-dashboard-right">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
