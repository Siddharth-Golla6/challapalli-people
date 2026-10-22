import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!user) {
    return (
      <Navigate
        to={adminOnly ? "/admin-login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
