import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log('[Auth] Checking for existing session...');
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
          console.log('[Auth] User loaded:', res.data.email);
        } catch (err) {
          console.error('[Auth] Failed to load user:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    console.log('[Auth] Logging in:', email);
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    console.log('[Auth] Login successful');
    return userData;
  };

  const signup = async (name, email, password) => {
    console.log('[Auth] Signing up:', email);
    const res = await authAPI.signup({ name, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    console.log('[Auth] Signup successful');
    return userData;
  };

  const logout = () => {
    console.log('[Auth] Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
