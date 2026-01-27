import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { BaseService, type ServiceResult } from '../../lib/services/baseService';
import type { FirestoreDocument } from '../../lib/firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ path: 'test-collection' })),
  doc: vi.fn((db, collection, id) => ({ path: `${collection}/${id}` })),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date('2024-01-01') })),
  },
}));

vi.mock('../../lib/firebase/config', () => ({
  db: {},
}));

interface TestDocument extends FirestoreDocument {
  name: string;
  value: number;
}

class TestService extends BaseService<TestDocument> {
  constructor() {
    super('test-collection');
  }
}

describe('BaseService', () => {
  let service: TestService;
  let mockAddDoc: Mock;
  let mockGetDoc: Mock;
  let mockUpdateDoc: Mock;
  let mockDeleteDoc: Mock;
  let mockGetDocs: Mock;

  beforeEach(async () => {
    vi.clearAllMocks();
    service = new TestService();
    
    const firebase = await vi.importMock('firebase/firestore');
    mockAddDoc = firebase.addDoc as Mock;
    mockGetDoc = firebase.getDoc as Mock;
    mockUpdateDoc = firebase.updateDoc as Mock;
    mockDeleteDoc = firebase.deleteDoc as Mock;
    mockGetDocs = firebase.getDocs as Mock;
  });

  describe('create', () => {
    it('should create a document successfully', async () => {
      const mockDocRef = { id: 'test-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);
      
      const mockDoc = {
        id: 'test-id',
        name: 'Test Document',
        value: 42,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'test-id',
        data: () => ({
          name: 'Test Document',
          value: 42,
          createdAt: { toDate: () => new Date('2024-01-01') },
          updatedAt: { toDate: () => new Date('2024-01-01') },
        }),
      });

      const result = await service.create({
        name: 'Test Document',
        value: 42,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(mockDoc);
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Test Document',
          value: 42,
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        })
      );
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockAddDoc.mockRejectedValue(error);

      const result = await service.create({
        name: 'Test Document',
        value: 42,
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Creation failed',
        details: error,
      });
    });
  });

  describe('getById', () => {
    it('should get a document by ID successfully', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'test-id',
        data: () => ({
          name: 'Test Document',
          value: 42,
          createdAt: { toDate: () => new Date('2024-01-01') },
          updatedAt: { toDate: () => new Date('2024-01-01') },
        }),
      });

      const result = await service.getById('test-id');

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual({
        id: 'test-id',
        name: 'Test Document',
        value: 42,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });
    });

    it('should return NOT_FOUND when document does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await service.getById('non-existent-id');

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        code: 'NOT_FOUND',
        message: 'Document not found',
      });
    });

    it('should handle get errors', async () => {
      const error = new Error('Get failed');
      mockGetDoc.mockRejectedValue(error);

      const result = await service.getById('test-id');

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Get failed',
        details: error,
      });
    });
  });

  describe('update', () => {
    it('should update a document successfully', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const mockDoc = {
        id: 'test-id',
        name: 'Updated Document',
        value: 100,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'test-id',
        data: () => ({
          name: 'Updated Document',
          value: 100,
          createdAt: { toDate: () => new Date('2024-01-01') },
          updatedAt: { toDate: () => new Date('2024-01-01') },
        }),
      });

      const result = await service.update('test-id', {
        name: 'Updated Document',
        value: 100,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(mockDoc);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Updated Document',
          value: 100,
          updatedAt: expect.anything(),
        })
      );
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockUpdateDoc.mockRejectedValue(error);

      const result = await service.update('test-id', { name: 'Updated' });

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Update failed',
        details: error,
      });
    });
  });

  describe('delete', () => {
    it('should delete a document successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await service.delete('test-id');

      expect(result.error).toBeUndefined();
      expect(result.data).toBeUndefined();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockDeleteDoc.mockRejectedValue(error);

      const result = await service.delete('test-id');

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Delete failed',
        details: error,
      });
    });
  });

  describe('list', () => {
    it('should list documents successfully', async () => {
      const mockDocs = [
        {
          id: 'doc1',
          data: () => ({
            name: 'Document 1',
            value: 1,
            createdAt: { toDate: () => new Date('2024-01-01') },
            updatedAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
        {
          id: 'doc2',
          data: () => ({
            name: 'Document 2',
            value: 2,
            createdAt: { toDate: () => new Date('2024-01-02') },
            updatedAt: { toDate: () => new Date('2024-01-02') },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await service.list();

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toEqual({
        id: 'doc1',
        name: 'Document 1',
        value: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });
    });

    it('should handle list errors', async () => {
      const error = new Error('List failed');
      mockGetDocs.mockRejectedValue(error);

      const result = await service.list();

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'List failed',
        details: error,
      });
    });
  });

  describe('handleError', () => {
    it('should handle Firebase permission-denied error', () => {
      const firebaseError = {
        code: 'permission-denied',
        message: 'Permission denied',
      };

      const result = service['handleError'](firebaseError);

      expect(result).toEqual({
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this action',
        details: firebaseError,
      });
    });

    it('should handle Firebase not-found error', () => {
      const firebaseError = {
        code: 'not-found',
        message: 'Not found',
      };

      const result = service['handleError'](firebaseError);

      expect(result).toEqual({
        code: 'NOT_FOUND',
        message: 'The requested document was not found',
        details: firebaseError,
      });
    });

    it('should handle unknown Firebase error', () => {
      const firebaseError = {
        code: 'unknown-firebase-error',
        message: 'Unknown Firebase error',
      };

      const result = service['handleError'](firebaseError);

      expect(result).toEqual({
        code: 'UNKNOWN_FIREBASE_ERROR',
        message: 'Unknown Firebase error',
        details: firebaseError,
      });
    });

    it('should handle generic error', () => {
      const genericError = new Error('Generic error');

      const result = service['handleError'](genericError);

      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Generic error',
        details: genericError,
      });
    });
  });
});