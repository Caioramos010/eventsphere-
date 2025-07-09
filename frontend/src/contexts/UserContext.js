import React, { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  const loadUserProfile = async () => {
    setLoading(true); 
    setError(null);
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const result = await UserService.fetchCurrentUserProfileAndSync();
      if (result.success) {
        setUser(result.user);
      } else {
        throw new Error(result.message || 'Erro ao carregar perfil');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil do usuário:', err);
      setError(err.message);
      setUser(null);
      if (err.message && (err.message.includes('Não autorizado') || err.message.includes('Token expired'))) {
        AuthService.logout();
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      AuthService.updateCurrentUser(userData);
    }
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        clearUser();
      } else if (e.key === 'token' && e.newValue && !user) {
        loadUserProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const value = {
    user,
    loading,
    error,
    loadUserProfile,
    updateUser,
    clearUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
