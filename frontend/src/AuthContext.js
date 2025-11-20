import React, { createContext, useState, useContext } from 'react';
import { loginUser, signupUser } from './apiService';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Will store {username, role}
  // We must store the password for your backend's admin auth model
  const [password, setPassword] = useState(null);

  const login = async (username, pass) => {
    try {
      const response = await loginUser(username, pass);
      if (response.data.success) {
        setUser({
          username: response.data.username,
          role: response.data.role,
        });
        setPassword(pass); // Store password in state
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.detail);
      return false;
    }
  };

  const signup = async (username, pass) => {
     try {
      const response = await signupUser(username, pass);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.detail);
      return { success: false, message: error.response?.data?.detail };
    }
  };

  const logout = () => {
    setUser(null);
    setPassword(null);
  };
  
  // This object contains the user state AND the password,
  // required for your specific admin endpoints.
  const getAdminCredentials = () => {
      if (user?.role === 'admin' && password) {
          return { username: user.username, password: password };
      }
      return null;
  }

  // 3. Value provided to all child components
  const value = {
    user,
    isAdmin: user?.role === 'admin',
    isLoggedIn: !!user,
    login,
    signup,
    logout,
    getAdminCredentials // Function to safely get admin creds
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Custom hook to easily use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
