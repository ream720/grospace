import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PlantDetails } from '../components/plants/PlantDetails';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import { usePlantStore } from '../stores/plantStore';
import { useNoteStore } from '../stores/noteStore';
import { useTaskStore } from '../stores/taskStore';
import { activityService } from '../lib/services/activityService';

export function meta({ params }: { params: { plantId: string } }) {
  return [
    { title: `Plant Details - Grospace` },
    { name: "description", content: "View plant details and history" },
  ];
}

function PlantDetailPageContent() {
  const { plantId } = useParams();
  const { user } = useAuthStore();
  const { spaces, loadSpaces } = useSpaceStore();
  const { plants, loadPlants, loading: plantsLoading } = usePlantStore();
  const { notes, loadNotes } = useNoteStore();
  const { tasks, loadTasks } = useTaskStore();

  useEffect(() => {
    if (user) {
      loadSpaces();
      loadPlants();
      loadNotes(user.uid);
      loadTasks();
    }
  }, [user, loadSpaces, loadPlants, loadNotes, loadTasks]);

  const plant = plants.find(p => p.id === plantId);

  const plantActivities = useMemo(() => {
    if (!plant || !user) return [];

    return activityService.generateActivities(
      notes,
      tasks,
      [plant], // Only pass this plant to ensure we generate activities for it
      spaces,
      { plantId: plant.id, limit: 50 }
    );
  }, [plant, user, notes, tasks, spaces]);

  if (plantsLoading && !plant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plant...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Plant Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The plant you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/plants">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
       <PlantDetails
        plant={plant}
        spaces={spaces}
        onBack={() => window.history.back()}
        onUpdate={() => loadPlants()}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">History</h2>
        <ActivityFeed
          activities={plantActivities}
          title="Plant History"
          description={`Timeline of events for ${plant.name}`}
          emptyMessage="No history available for this plant yet."
        />
      </div>
    </div>
  );
}

export default function PlantDetailPage() {
  return (
    <ProtectedRoute>
      <PlantDetailPageContent />
    </ProtectedRoute>
  );
}
