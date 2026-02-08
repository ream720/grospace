import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Settings, StickyNote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PlantList } from '../components/plants';
import { SpaceForm } from '../components/spaces/SpaceForm';
import { NoteList } from '../components/notes/NoteList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import type { GrowSpace } from '../lib/types';

export function meta({ params }: { params: { spaceId: string } }) {
  return [
    { title: `Space Details - Grospace` },
    { name: "description", content: "View and manage plants in your grow space" },
  ];
}

const spaceTypeLabels = {
  'indoor-tent': 'Indoor Tent',
  'outdoor-bed': 'Outdoor Bed',
  'greenhouse': 'Greenhouse',
  'hydroponic': 'Hydro ponic',
  'container': 'Container',
};

function SpaceDetailContent() {
  const { spaceId } = useParams();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useAuthStore();
  const { spaces, loading, error, loadSpaces, updateSpace } = useSpaceStore();

  useEffect(() => {
    if (user) {
      loadSpaces();
    }
  }, [user, loadSpaces]);

  const space = spaces.find(s => s.id === spaceId);

  const handleUpdateSpace = async (data: { name: string; type: any; description?: string }) => {
    if (!space) return;

    try {
      await updateSpace(space.id, data);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update space:', error);
    }
  };

  if (loading && !space) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading space...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => loadSpaces()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Space Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The space you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/spaces">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Spaces
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/spaces" className="inline-block">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spaces
          </Button>
        </Link>
      </div>

      {/* Header Content */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{space.name}</h1>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Badge variant="secondary" className="font-medium">
                {spaceTypeLabels[space.type]}
              </Badge>
              <span className="text-sm">•</span>
              <span className="text-sm font-medium">
                {space.plantCount} {space.plantCount === 1 ? 'plant' : 'plants'}
              </span>
            </div>
          </div>

          <Button onClick={() => setShowEditDialog(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Edit Space
          </Button>
        </div>

        {space.description && (
          <div className="max-w-2xl">
            <p className="text-muted-foreground leading-relaxed">
              {space.description}
            </p>
          </div>
        )}
      </div>

      {/* Space Details */}
      {(space.dimensions || space.environment) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {space.dimensions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Length</span>
                    <span className="font-medium">{space.dimensions.length} {space.dimensions.unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Width</span>
                    <span className="font-medium">{space.dimensions.width} {space.dimensions.unit}</span>
                  </div>
                  {space.dimensions.height && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Height</span>
                      <span className="font-medium">{space.dimensions.height} {space.dimensions.unit}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {space.environment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {space.environment.temperature && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Temperature</span>
                      <span className="font-medium">
                        {space.environment.temperature.min}° - {space.environment.temperature.max}°
                        {space.environment.temperature.unit === 'celsius' ? 'C' : 'F'}
                      </span>
                    </div>
                  )}
                  {space.environment.humidity && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Humidity</span>
                      <span className="font-medium">{space.environment.humidity.min}% - {space.environment.humidity.max}%</span>
                    </div>
                  )}
                  {space.environment.lightSchedule && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block mb-1">Light Schedule</span>
                      <span className="font-medium">
                        {space.environment.lightSchedule.hoursOn}h on / {space.environment.lightSchedule.hoursOff}h off
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plants in this space */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Plants in this Space
          <Badge variant="outline" className="ml-2 font-normal">
            {space.plantCount}
          </Badge>
        </h2>
        <PlantList spaceId={space.id} spaces={spaces} />
      </div>

      {/* Notes & Observations */}
      <div className="mb-8">
        <NoteList
          spaceId={space.id}
          title="Space Notes & Observations"
          showCreateButton={true}
        />
      </div>

      {/* Edit Space Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
          </DialogHeader>
          <SpaceForm
            space={space}
            onSubmit={handleUpdateSpace}
            onCancel={() => setShowEditDialog(false)}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SpaceDetailPage() {
  return (
    <ProtectedRoute>
      <SpaceDetailContent />
    </ProtectedRoute>
  );
}