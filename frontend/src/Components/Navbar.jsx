import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import myImage from '../Assests/profile.png';


const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const isAuthenticated = !!localStorage.getItem("authToken");

  return (
    <div id="nav">
      <div id="left">
        <h3>SHCS</h3>
      </div>
      <div id="mid">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/service">Services</Link>
        <Link to="/about">About</Link>
        <Link to="contact">Contact</Link>
      </div>
      <div id="right">
        {isAuthenticated && <img src={myImage} alt="Logo"/>}
        {isAuthenticated ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
