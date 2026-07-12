import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col gap-4 items-center justify-center bg-slate-50 dark:bg-dark-950">
        <Loader size="lg" />
        <span className="text-sm font-medium text-slate-500">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
