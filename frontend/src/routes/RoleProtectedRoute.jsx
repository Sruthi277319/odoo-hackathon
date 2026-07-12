import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      toast.error(`Access Denied: Required roles: [${allowedRoles.join(', ')}]. Current role: [${user.role}]`);
    }
  }, [user, allowedRoles]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to home dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
