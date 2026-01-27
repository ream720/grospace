import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { PlantList } from '../components/plants';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';

export function meta() {
  return [
    { title: "Plants - Grospace" },
    { name: "description", content: "Manage your plants across all spaces" },
  ];
}

export default function PlantsPage() {
  const { user, loading, error } = useAuthStore();
  const { spaces, loadSpaces } = useSpaceStore();

  useEffect(() => {
    if (user) {
      loadSpaces();
    }
  }, [user, loadSpaces]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Plants</h1>
        <p className="text-muted-foreground">
          Manage all your plants across different growing spaces
        </p>
      </div>
      
      <PlantList spaces={spaces} />
    </div>
  );
}