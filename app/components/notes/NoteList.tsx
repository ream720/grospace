import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Search, Plus, Filter, StickyNote } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';
import { useNoteStore } from '../../stores/noteStore';
import { useSpaceStore } from '../../stores/spaceStore';
import { usePlantStore } from '../../stores/plantStore';
import { useAuthStore } from '../../stores/authStore';
import { NOTE_CATEGORIES, type Note, type NoteCategory } from '../../lib/types/note';
import { toast } from 'sonner';

interface NoteListProps {
  spaceId?: string;
  plantId?: string;
  showCreateButton?: boolean;
  title?: string;
}

export function NoteList({ 
  spaceId, 
  plantId, 
  showCreateButton = true,
  title = 'Notes & Observations'
}: NoteListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpace, setSelectedSpace] = useState<string>('all');
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [formLoading, setFormLoading] = useState(false);

  // Get filter values from URL params if not provided as props
  const effectiveSpaceId = spaceId || searchParams.get('spaceId') || undefined;
  const effectivePlantId = plantId || searchParams.get('plantId') || undefined;

  // Initialize filter state from URL params
  useEffect(() => {
    if (searchParams.get('spaceId') && !spaceId) {
      setSelectedSpace(searchParams.get('spaceId') || 'all');
    }
    if (searchParams.get('plantId') && !plantId) {
      setSelectedPlant(searchParams.get('plantId') || 'all');
    }
  }, [searchParams, spaceId, plantId]);

  const { user } = useAuthStore();
  const { 
    notes, 
    loading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote, 
    loadNotes,
    clearError 
  } = useNoteStore();
  const { spaces } = useSpaceStore();
  const { plants } = usePlantStore();

  // Function to update URL params when filters change
  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'all') {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    // Only update if there are changes
    const newSearch = current.toString();
    if (newSearch !== searchParams.toString()) {
      setSearchParams(current);
    }
  };

  // Load notes on mount (using loadNotes instead of subscribe for now)
  useEffect(() => {
    if (!user) return;

    const filters = {
      spaceId: effectiveSpaceId,
      plantId: effectivePlantId,
    };

    loadNotes(user.uid, filters);
  }, [user, effectiveSpaceId, effectivePlantId, loadNotes]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Filter notes based on search and filters
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.content.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Space filter (only if not already filtered by spaceId prop)
    if (!effectiveSpaceId && selectedSpace && selectedSpace !== 'all') {
      filtered = filtered.filter(note => note.spaceId === selectedSpace);
    }

    // Plant filter (only if not already filtered by plantId prop)
    if (!effectivePlantId && selectedPlant && selectedPlant !== 'all') {
      filtered = filtered.filter(note => note.plantId === selectedPlant);
    }

    return filtered;
  }, [notes, searchTerm, selectedCategory, selectedSpace, selectedPlant, spaceId, plantId]);

  const handleCreateNote = async (data: {
    content: string;
    category: NoteCategory;
    plantId?: string;
    spaceId?: string;
    timestamp?: Date;
    photos: File[];
  }) => {
    if (!user) return;

    setFormLoading(true);
    try {
      await createNote({
        content: data.content,
        category: data.category,
        plantId: data.plantId,
        spaceId: data.spaceId,
        timestamp: data.timestamp,
        photos: data.photos,
      }, user.uid);
      
      setShowCreateDialog(false);
      toast.success('Note created successfully');
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateNote = async (data: {
    content: string;
    category: NoteCategory;
    plantId?: string;
    spaceId?: string;
    timestamp?: Date;
    photos: File[];
  }) => {
    if (!editingNote) return;

    setFormLoading(true);
    try {
      await updateNote(editingNote.id, {
        content: data.content,
        category: data.category,
        timestamp: data.timestamp,
      });
      
      setEditingNote(null);
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const getSpaceName = (spaceId?: string) => {
    if (!spaceId) return undefined;
    return spaces.find(space => space.id === spaceId)?.name;
  };

  const getPlantName = (plantId?: string) => {
    if (!plantId) return undefined;
    const plant = plants.find(plant => plant.id === plantId);
    return plant ? `${plant.name} (${plant.variety})` : undefined;
  };

  // Available plants for filtering (filtered by selected space if any)
  const availablePlantsForFilter = (effectiveSpaceId || selectedSpace !== 'all') 
    ? plants.filter(plant => plant.spaceId === (effectiveSpaceId || selectedSpace))
    : plants;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          <h2 className="text-xl font-semibold">{title}</h2>
          <Badge variant="secondary">{filteredNotes.length}</Badge>
        </div>
        
        {showCreateButton && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <NoteForm
                onSubmit={handleCreateNote}
                onCancel={() => setShowCreateDialog(false)}
                initialSpaceId={effectiveSpaceId}
                initialPlantId={effectivePlantId}
                loading={formLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active filter indicators */}
          {(effectiveSpaceId || effectivePlantId) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              
              {effectiveSpaceId && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Space: {getSpaceName(effectiveSpaceId)}
                  <button 
                    onClick={() => {
                      setSelectedSpace('all');
                      updateUrlParams({ spaceId: null });
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5 text-xs"
                    title="Remove space filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {effectivePlantId && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Plant: {getPlantName(effectivePlantId)}
                  <button 
                    onClick={() => {
                      setSelectedPlant('all');
                      updateUrlParams({ plantId: null });
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5 text-xs"
                    title="Remove plant filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              updateUrlParams({ category: value });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {NOTE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Space Filter */}
            <Select 
              value={effectiveSpaceId || selectedSpace} 
              onValueChange={(value) => {
                setSelectedSpace(value);
                setSelectedPlant('all'); // Clear plant filter when space changes
                updateUrlParams({ spaceId: value, plantId: null });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All spaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All spaces</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Plant Filter */}
            <Select 
              value={effectivePlantId || selectedPlant} 
              onValueChange={(value) => {
                setSelectedPlant(value);
                updateUrlParams({ plantId: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All plants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plants</SelectItem>
                {availablePlantsForFilter.map((plant) => (
                  <SelectItem key={plant.id} value={plant.id}>
                    {plant.name} ({plant.variety})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedSpace !== 'all' || selectedPlant !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedSpace('all');
                setSelectedPlant('all');
                // Clear URL params
                setSearchParams(new URLSearchParams());
              }}
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {loading && notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <StickyNote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {notes.length === 0 
                ? "Start documenting your gardening journey by creating your first note."
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {showCreateButton && notes.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              spaceName={getSpaceName(note.spaceId)}
              plantName={getPlantName(note.plantId)}
              onEdit={setEditingNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <NoteForm
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(null)}
              loading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}