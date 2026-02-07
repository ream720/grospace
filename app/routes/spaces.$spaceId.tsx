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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/spaces">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Spaces
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{space.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                {spaceTypeLabels[space.type]}
              </Badge>
              <span className="text-muted-foreground">
                {space.plantCount} plants
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Edit Space
        </Button>
      </div>

      {/* Space Info */}
      {space.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{space.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Space Details */}
      {(space.dimensions || space.environment) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {space.dimensions && (
            <Card>
              <CardHeader>
                <CardTitle>Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Length:</span>
                    <span>{space.dimensions.length} {space.dimensions.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Width:</span>
                    <span>{space.dimensions.width} {space.dimensions.unit}</span>
                  </div>
                  {space.dimensions.height && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Height:</span>
                      <span>{space.dimensions.height} {space.dimensions.unit}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {space.environment && (
            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {space.environment.temperature && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature:</span>
                      <span>
                        {space.environment.temperature.min}° - {space.environment.temperature.max}°
                        {space.environment.temperature.unit === 'celsius' ? 'C' : 'F'}
                      </span>
                    </div>
                  )}
                  {space.environment.humidity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Humidity:</span>
                      <span>{space.environment.humidity.min}% - {space.environment.humidity.max}%</span>
                    </div>
                  )}
                  {space.environment.lightSchedule && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Light Schedule:</span>
                      <span>{space.environment.lightSchedule.hoursOn}h on / {space.environment.lightSchedule.hoursOff}h off</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Plants in this space */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Plants in this Space</h2>
        <PlantList spaceId={space.id} spaces={spaces} />
      </div>

      {/* Notes & Observations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Space Notes & Observations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NoteList
            spaceId={space.id}
            title="Space Notes"
            showCreateButton={true}
          />
        </CardContent>
      </Card>

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