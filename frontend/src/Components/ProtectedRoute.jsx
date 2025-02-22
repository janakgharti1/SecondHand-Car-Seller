import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, requiredRole }) => {
  const userRole = localStorage.getItem("userRole"); // Get role from localStorage

  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Redirect if not logged in
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />; // Redirect to home if role mismatch
  }

  return <Outlet />;
};

export default ProtectedRoute;
