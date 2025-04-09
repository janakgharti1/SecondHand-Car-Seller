import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, requiredRole, userRole }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (userRole && userRole !== requiredRole) {
    return <Navigate to={userRole === "Admin" ? "/admindashboard" : "/userdashboard"} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;