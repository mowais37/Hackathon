// src/components/common/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../context/auth/authContext';
import Loading from './Loading';

const PrivateRoute = ({ element }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext;

  if (loading) return <Loading />;
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;