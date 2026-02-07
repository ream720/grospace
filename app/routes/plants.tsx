import { useEffect } from 'react';
import { PlantList } from '../components/plants';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';

export function meta() {
  return [
    { title: "Plants - Grospace" },
    { name: "description", content: "Manage your plants across all spaces" },
  ];
}

function PlantsContent() {
  const { user } = useAuthStore();
  const { spaces, loadSpaces } = useSpaceStore();

  useEffect(() => {
    if (user) {
      loadSpaces();
    }
  }, [user, loadSpaces]);

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

export default function PlantsPage() {
  return (
    <ProtectedRoute>
      <PlantsContent />
    </ProtectedRoute>
  );
}