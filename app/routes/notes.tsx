import { useEffect } from 'react';
import { NoteList } from '../components/notes/NoteList';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import { usePlantStore } from '../stores/plantStore';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export function meta() {
  return [
    { title: "Notes - Grospace" },
    { name: "description", content: "View and manage your garden notes" },
  ];
}

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
    <DashboardLayout title="Notes">
      <NoteList />
    </DashboardLayout>
  );
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesContent />
    </ProtectedRoute>
  );
}