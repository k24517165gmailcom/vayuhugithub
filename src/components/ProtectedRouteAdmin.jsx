import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRouteAdmin = ({ children }) => {
  // ✅ Get admin data from localStorage
  const admin = JSON.parse(localStorage.getItem("admin"));

  // If not logged in, redirect to /admin-login
  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }

  // ✅ If logged in, show the requested page
  return children;
};

export default ProtectedRouteAdmin;
