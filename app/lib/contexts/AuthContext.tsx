import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAuthStore, initializeAuth } from '../../stores/authStore';
import type { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Initialize the auth listener
    initializeAuth();
  }, []);

  const contextValue: AuthContextType = {
    user: authStore.user,
    loading: authStore.loading,
    error: authStore.error,
    signUp: authStore.signUp,
    signIn: authStore.signIn,
    signOut: authStore.signOut,
    resetPassword: authStore.resetPassword,
    updateProfile: authStore.updateProfile,
    clearError: authStore.clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};