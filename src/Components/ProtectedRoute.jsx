import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
