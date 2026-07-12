import React, { createContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken('');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('hasSession');
      toast.success('Logged out successfully');
    }
  }, []);

  // Check session / refresh token on mount
  const checkSession = useCallback(async () => {
    // Only attempt refresh if we previously had a session to avoid unnecessary calls
    const hasSession = localStorage.getItem('hasSession') === 'true';
    if (!hasSession) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/refresh');
      if (res.data && res.data.accessToken) {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('Session check failed or expired');
      localStorage.removeItem('hasSession');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Event listener for expired token from axios interceptor
    const handleExpiredSession = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('hasSession');
      toast.error('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth-session-expired', handleExpiredSession);
    return () => {
      window.removeEventListener('auth-session-expired', handleExpiredSession);
    };
  }, [checkSession]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.accessToken) {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('hasSession', 'true');
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return res.data.user;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data && res.data.accessToken) {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('hasSession', 'true');
        toast.success(`Account created! Welcome, ${res.data.user.name}.`);
        return res.data.user;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed.';
      toast.error(errorMsg);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
