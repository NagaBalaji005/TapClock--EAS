import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If route requires specific role and user doesn't have it, redirect
  if (role && user?.role !== role) {
    if (user?.role === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If employee tries to access manager route, redirect to employee dashboard
  if (user?.role === 'employee' && window.location.pathname.startsWith('/manager')) {
    return <Navigate to="/dashboard" replace />;
  }

  // If manager tries to access employee route (without /manager prefix), allow mark-attendance and my-attendance
  // since managers are also employees
  const allowedManagerRoutes = ['/profile', '/mark-attendance', '/my-attendance'];
  if (user?.role === 'manager' && !window.location.pathname.startsWith('/manager') && !allowedManagerRoutes.includes(window.location.pathname)) {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;

