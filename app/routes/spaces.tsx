import { SpaceList } from '../components/spaces';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';

export default function SpacesPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <SpaceList />
      </div>
    </ProtectedRoute>
  );
}