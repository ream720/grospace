import { type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '~/stores/authStore';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that wraps routes requiring authentication.
 * Handles loading states, auth errors, and redirects unauthenticated users to login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, error: authError } = useAuthStore();

  // Show loading skeleton while checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>
    );
  }

  // Show error message if auth check failed
  if (authError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {authError}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/login'}
              className="ml-2"
            >
              Go to Login
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
