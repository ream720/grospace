import { useEffect } from 'react';
import { NoteList } from '../components/notes/NoteList';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import { usePlantStore } from '../stores/plantStore';

function NotesContent() {
  const { user } = useAuthStore();
  const { loadSpaces } = useSpaceStore();
  const { loadPlants } = usePlantStore();

  // Load spaces and plants data for the note form
  useEffect(() => {
    if (!user) return;

    loadSpaces();
    loadPlants();
  }, [user, loadSpaces, loadPlants]);

  return (
    <div className="container mx-auto px-4 py-8">
      <NoteList />
    </div>
  );
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesContent />
    </ProtectedRoute>
  );
}