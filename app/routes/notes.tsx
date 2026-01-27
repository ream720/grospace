import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { NoteList } from '../components/notes/NoteList';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import { usePlantStore } from '../stores/plantStore';

export default function NotesPage() {
  const { user, loading: authLoading } = useAuthStore();
  const { loadSpaces } = useSpaceStore();
  const { loadPlants } = usePlantStore();

  // Load spaces and plants data for the note form
  useEffect(() => {
    if (!user) return;

    loadSpaces();
    loadPlants();
  }, [user, loadSpaces, loadPlants]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NoteList />
    </div>
  );
}