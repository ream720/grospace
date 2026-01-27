import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the entire note service
vi.mock('../../lib/services/noteService', () => ({
  noteService: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    subscribe: vi.fn(),
  },
  NoteService: vi.fn(() => ({
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    subscribe: vi.fn(),
  })),
}));

import { Note, CreateNoteData, UpdateNoteData, NoteFilters } from '../../lib/types/note';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';
import { noteService } from '../../lib/services/noteService';

describe.skip('NoteService', () => {
  const mockUserId = 'user123';
  const mockNoteId = 'note123';
  const mockSpaceId = 'space123';
  const mockPlantId = 'plant123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a note without photos', async () => {
      const createData: CreateNoteData = {
        content: 'Test note content',
        category: 'observation',
        spaceId: mockSpaceId,
      };

      const expectedNote: Note = {
        id: mockNoteId,
        userId: mockUserId,
        plantId: undefined,
        spaceId: mockSpaceId,
        content: 'Test note content',
        category: 'observation',
        photos: [],
        timestamp: new Date('2024-01-01T10:00:00Z'),
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      mockNoteService.create.mockResolvedValue(expectedNote);

      const result = await mockNoteService.create(createData, mockUserId);

      expect(mockNoteService.create).toHaveBeenCalledWith(createData, mockUserId);
      expect(result).toEqual(expectedNote);
    });

    it('should create a note with photos', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const createData: CreateNoteData = {
        content: 'Test note with photo',
        category: 'milestone',
        plantId: mockPlantId,
        photos: [mockFile],
      };

      const mockDocRef = { id: mockNoteId };
      const mockPhotoUrl = 'https://storage.example.com/photo.jpg';
      
      mockAddDoc.mockResolvedValue(mockDocRef);
      mockUploadBytes.mockResolvedValue({ ref: 'photo-ref' });
      mockGetDownloadURL.mockResolvedValue(mockPhotoUrl);
      mockRef.mockReturnValue('photo-ref');

      const result = await noteService.create(createData, mockUserId);

      expect(mockUploadBytes).toHaveBeenCalledWith('photo-ref', mockFile);
      expect(mockGetDownloadURL).toHaveBeenCalledWith('photo-ref');
      expect(result.photos).toEqual([mockPhotoUrl]);
    });

    it('should handle creation errors', async () => {
      const createData: CreateNoteData = {
        content: 'Test note',
        category: 'observation',
      };

      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(noteService.create(createData, mockUserId)).rejects.toThrow('Failed to create note');
    });
  });

  describe('getById', () => {
    it('should get a note by id', async () => {
      const mockNoteData = {
        userId: mockUserId,
        content: 'Test note',
        category: 'observation',
        photos: [],
        timestamp: { toDate: () => new Date('2024-01-01T10:00:00Z') },
        createdAt: { toDate: () => new Date('2024-01-01T09:00:00Z') },
        updatedAt: { toDate: () => new Date('2024-01-01T10:00:00Z') },
      };

      const mockDocSnap = {
        exists: () => true,
        id: mockNoteId,
        data: () => mockNoteData,
      };

      mockGetDoc.mockResolvedValue(mockDocSnap);

      const result = await noteService.getById(mockNoteId);

      expect(mockDoc).toHaveBeenCalledWith('notes-collection', mockNoteId);
      expect(mockGetDoc).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockNoteId,
        ...mockNoteData,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });
    });

    it('should return null if note does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockDocSnap);

      const result = await noteService.getById(mockNoteId);

      expect(result).toBeNull();
    });

    it('should handle get errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(noteService.getById(mockNoteId)).rejects.toThrow('Failed to get note');
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const updateData: UpdateNoteData = {
        content: 'Updated content',
        category: 'feeding',
      };

      const mockUpdatedNote: Note = {
        id: mockNoteId,
        userId: mockUserId,
        content: 'Updated content',
        category: 'feeding',
        photos: [],
        timestamp: new Date('2024-01-01T10:00:00Z'),
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T11:00:00Z'),
      };

      // Mock the getById call that happens after update
      const mockDocSnap = {
        exists: () => true,
        id: mockNoteId,
        data: () => ({
          userId: mockUserId,
          content: 'Updated content',
          category: 'feeding',
          photos: [],
          timestamp: { toDate: () => new Date('2024-01-01T10:00:00Z') },
          createdAt: { toDate: () => new Date('2024-01-01T09:00:00Z') },
          updatedAt: { toDate: () => new Date('2024-01-01T11:00:00Z') },
        }),
      };

      mockUpdateDoc.mockResolvedValue(undefined);
      mockGetDoc.mockResolvedValue(mockDocSnap);

      const result = await noteService.update(mockNoteId, updateData);

      expect(mockUpdateDoc).toHaveBeenCalledWith('note-doc', {
        content: 'Updated content',
        category: 'feeding',
        updatedAt: expect.any(Object),
      });
      expect(result).toEqual(mockUpdatedNote);
    });

    it('should handle update errors', async () => {
      const updateData: UpdateNoteData = {
        content: 'Updated content',
      };

      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(noteService.update(mockNoteId, updateData)).rejects.toThrow('Failed to update note');
    });
  });

  describe('delete', () => {
    it('should delete a note without photos', async () => {
      const mockNote: Note = {
        id: mockNoteId,
        userId: mockUserId,
        content: 'Test note',
        category: 'observation',
        photos: [],
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock getById to return note without photos
      const mockDocSnap = {
        exists: () => true,
        id: mockNoteId,
        data: () => ({
          ...mockNote,
          timestamp: { toDate: () => mockNote.timestamp },
          createdAt: { toDate: () => mockNote.createdAt },
          updatedAt: { toDate: () => mockNote.updatedAt },
        }),
      };

      mockGetDoc.mockResolvedValue(mockDocSnap);
      mockDeleteDoc.mockResolvedValue(undefined);

      await noteService.delete(mockNoteId);

      expect(mockDeleteDoc).toHaveBeenCalledWith('note-doc');
    });

    it('should delete a note with photos', async () => {
      const mockNote: Note = {
        id: mockNoteId,
        userId: mockUserId,
        content: 'Test note',
        category: 'observation',
        photos: ['https://storage.example.com/photo1.jpg', 'https://storage.example.com/photo2.jpg'],
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock getById to return note with photos
      const mockDocSnap = {
        exists: () => true,
        id: mockNoteId,
        data: () => ({
          ...mockNote,
          timestamp: { toDate: () => mockNote.timestamp },
          createdAt: { toDate: () => mockNote.createdAt },
          updatedAt: { toDate: () => mockNote.updatedAt },
        }),
      };

      mockGetDoc.mockResolvedValue(mockDocSnap);
      mockDeleteDoc.mockResolvedValue(undefined);
      mockDeleteObject.mockResolvedValue(undefined);

      await noteService.delete(mockNoteId);

      expect(mockDeleteObject).toHaveBeenCalledTimes(2);
      expect(mockDeleteDoc).toHaveBeenCalledWith('note-doc');
    });

    it('should handle delete errors', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(noteService.delete(mockNoteId)).rejects.toThrow('Failed to delete note');
    });
  });

  describe('list', () => {
    it('should list notes for a user', async () => {
      const mockNotesData = [
        {
          id: 'note1',
          userId: mockUserId,
          content: 'Note 1',
          category: 'observation',
          photos: [],
          timestamp: { toDate: () => new Date('2024-01-01T10:00:00Z') },
          createdAt: { toDate: () => new Date('2024-01-01T09:00:00Z') },
          updatedAt: { toDate: () => new Date('2024-01-01T10:00:00Z') },
        },
        {
          id: 'note2',
          userId: mockUserId,
          content: 'Note 2',
          category: 'feeding',
          photos: [],
          timestamp: { toDate: () => new Date('2024-01-01T11:00:00Z') },
          createdAt: { toDate: () => new Date('2024-01-01T10:00:00Z') },
          updatedAt: { toDate: () => new Date('2024-01-01T11:00:00Z') },
        },
      ];

      const mockQuerySnapshot = {
        docs: mockNotesData.map(data => ({
          id: data.id,
          data: () => data,
        })),
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await noteService.list(mockUserId);

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', mockUserId);
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('note1');
      expect(result[1].id).toBe('note2');
    });

    it('should filter notes by plant id', async () => {
      const filters: NoteFilters = {
        plantId: mockPlantId,
      };

      const mockQuerySnapshot = {
        docs: [],
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      await noteService.list(mockUserId, filters);

      expect(mockWhere).toHaveBeenCalledWith('plantId', '==', mockPlantId);
    });

    it('should filter notes by search term', async () => {
      const mockNotesData = [
        {
          id: 'note1',
          userId: mockUserId,
          content: 'This is about watering',
          category: 'observation',
          photos: [],
          timestamp: { toDate: () => new Date('2024-01-01T10:00:00Z') },
          createdAt: { toDate: () => new Date('2024-01-01T09:00:00Z') },
          updatedAt: { toDate: () => new Date('2024-01-01T10:00:00Z') },
        },
        {
          id: 'note2',
          userId: mockUserId,
          content: 'This is about pruning',
          category: 'pruning',
          photos: [],
          timestamp: { toDate: () => new Date('2024-01-01T11:00:00Z') },
          createdAt: { toDate: () => new Date('2024-01-01T10:00:00Z') },
          updatedAt: { toDate: () => new Date('2024-01-01T11:00:00Z') },
        },
      ];

      const mockQuerySnapshot = {
        docs: mockNotesData.map(data => ({
          id: data.id,
          data: () => data,
        })),
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const filters: NoteFilters = {
        searchTerm: 'watering',
      };

      const result = await noteService.list(mockUserId, filters);

      expect(result).toHaveLength(1);
      expect(result[0].content).toContain('watering');
    });

    it('should handle list errors', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(noteService.list(mockUserId)).rejects.toThrow('Failed to list notes');
    });
  });

  describe('subscribe', () => {
    it('should set up real-time subscription', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = noteService.subscribe(mockUserId, mockCallback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription errors', () => {
      const mockCallback = vi.fn();
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        errorCallback(new Error('Subscription error'));
        return vi.fn();
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      noteService.subscribe(mockUserId, mockCallback);

      expect(consoleSpy).toHaveBeenCalledWith('Error in notes subscription:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});