import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ If no user is logged in, redirect to Auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Otherwise, show the requested page
  return children;
};

export default ProtectedRoute;
