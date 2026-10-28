import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data?.success && data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
        localStorage.removeItem('campusx_token');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  /**
   * Log in existing student
   */
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data?.token) {
        localStorage.setItem('campusx_token', data.token);
      }
      setUser(data.user);
      toast.success(data.message || `Welcome back, ${data.user.name}!`);
      return { success: true, user: data.user };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Register a new student
   * IMPORTANT: Does NOT log the student in automatically.
   * Student must explicitly log in afterwards.
   */
  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      // NOTE: Explicitly DO NOT set user or token!
      // Must prompt user to log in on the login page.
      toast.success(
        data.message || 'Account created successfully! Please log in with your credentials.',
        { duration: 5000 }
      );
      return {
        success: true,
        requiresLogin: true,
        message: data.message,
        user: data.user,
      };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Log out student
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue cleanup even if server route fails
    } finally {
      localStorage.removeItem('campusx_token');
      setUser(null);
      toast.success('You have been logged out.');
    }
  };

  /**
   * Update student profile
   */
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.patch('/auth/profile', profileData);
      setUser(data.user);
      toast.success('Profile updated successfully!');
      return { success: true, user: data.user };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

