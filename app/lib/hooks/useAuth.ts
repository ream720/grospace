import { useAuth as useAuthContext } from '../contexts/AuthContext';
import type { AuthUser } from '../types/auth';

// Re-export the context hook for convenience
export const useAuth = useAuthContext;

// Additional auth-related hooks
export const useAuthUser = (): AuthUser | null => {
  const { user } = useAuthContext();
  return user;
};

export const useAuthLoading = (): boolean => {
  const { loading } = useAuthContext();
  return loading;
};

export const useAuthError = (): string | null => {
  const { error } = useAuthContext();
  return error;
};

export const useIsAuthenticated = (): boolean => {
  const { user, loading } = useAuthContext();
  return !loading && user !== null;
};

export const useRequireAuth = (): AuthUser => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    throw new Error('Authentication is still loading');
  }
  
  if (!user) {
    throw new Error('User must be authenticated to access this resource');
  }
  
  return user;
};