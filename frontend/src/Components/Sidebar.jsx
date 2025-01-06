import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Menu</h3>
      <ul className="sidebar-list">
        <li>
          <NavLink to="/" className="sidebar-link" activeclassname="active">
            Welcome
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/my-uploaded-car"
            className="sidebar-link"
            activeclassname="active"
          >
            My Uploaded Car
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className="sidebar-link" activeclassname="active">
            Profile
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
