// src/components/routing/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/auth/authContext";
import Loading from "../common/Loading";

const PrivateRoute = ({ component: Component }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <Loading />;

  if (isAuthenticated) {
    return <Component />;
  }

  // Redirect to login if not authenticated
  return <Navigate to="/login" />;
};

export default PrivateRoute;
