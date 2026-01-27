export interface Note {
  id: string;
  userId: string;
  plantId?: string;
  spaceId?: string;
  content: string;
  category: NoteCategory;
  photos: string[];
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteCategory = 'observation' | 'feeding' | 'pruning' | 'issue' | 'milestone' | 'general';

export interface CreateNoteData {
  plantId?: string;
  spaceId?: string;
  content: string;
  category: NoteCategory;
  photos?: File[];
  timestamp?: Date;
}

export interface UpdateNoteData {
  content?: string;
  category?: NoteCategory;
  timestamp?: Date;
}

export interface NoteFilters {
  plantId?: string;
  spaceId?: string;
  category?: NoteCategory;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  limit?: number;
}

export const NOTE_CATEGORIES: { value: NoteCategory; label: string }[] = [
  { value: 'observation', label: 'Observation' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'issue', label: 'Issue' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'general', label: 'General' },
];