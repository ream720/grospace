import { SpaceList } from '../components/spaces';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';

export default function SpacesPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Grow Spaces</h1>
          <p className="text-muted-foreground">
            Manage your growing environments
          </p>
        </div>
        <SpaceList />
      </div>
    </ProtectedRoute>
  );
}