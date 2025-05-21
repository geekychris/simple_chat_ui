import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../services/axiosConfig';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/auth/register', {
        username,
        password
      });
      
      const { token, username: user, userId } = response.data;
      
      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify({ username: user, id: userId }));
      
      setCurrentUser({ username: user, id: userId });
      return { success: true };
    } catch (err) {
      let errorMessage = 'Registration failed';
      
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Log in a user
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/auth/login', {
        username,
        password
      });
      
      const { token, username: user, userId } = response.data;
      
      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify({ username: user, id: userId }));
      
      setCurrentUser({ username: user, id: userId });
      return { success: true };
    } catch (err) {
      let errorMessage = 'Login failed';
      
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Log out a user
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser && !!localStorage.getItem('auth_token');
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

