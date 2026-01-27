import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../../lib/services/taskService';
import type { Task } from '../../lib/types';

// Mock Firebase
vi.mock('../../lib/firebase/config', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
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
    now: vi.fn(() => ({ toDate: () => new Date() }))
  }
}));

describe('TaskService', () => {
  const mockUserId = 'user123';
  const mockTaskId = 'task123';
  const mockSpaceId = 'space123';
  const mockPlantId = 'plant123';

  const mockTask: Task = {
    id: mockTaskId,
    userId: mockUserId,
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date('2024-01-15'),
    priority: 'medium',
    status: 'pending',
    spaceId: mockSpaceId,
    plantId: mockPlantId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserTasks', () => {
    it('should call list with correct filters', async () => {
      const listSpy = vi.spyOn(taskService, 'list').mockResolvedValue({
        data: [mockTask]
      });

      await taskService.getUserTasks(mockUserId);

      expect(listSpy).toHaveBeenCalledWith({
        where: [{ field: 'userId', operator: '==', value: mockUserId }],
        orderBy: [{ field: 'dueDate', direction: 'asc' }]
      });
    });
  });

  describe('getSpaceTasks', () => {
    it('should call list with space and user filters', async () => {
      const listSpy = vi.spyOn(taskService, 'list').mockResolvedValue({
        data: [mockTask]
      });

      await taskService.getSpaceTasks(mockSpaceId, mockUserId);

      expect(listSpy).toHaveBeenCalledWith({
        where: [
          { field: 'userId', operator: '==', value: mockUserId },
          { field: 'spaceId', operator: '==', value: mockSpaceId }
        ],
        orderBy: [{ field: 'dueDate', direction: 'asc' }]
      });
    });
  });

  describe('getPlantTasks', () => {
    it('should call list with plant and user filters', async () => {
      const listSpy = vi.spyOn(taskService, 'list').mockResolvedValue({
        data: [mockTask]
      });

      await taskService.getPlantTasks(mockPlantId, mockUserId);

      expect(listSpy).toHaveBeenCalledWith({
        where: [
          { field: 'userId', operator: '==', value: mockUserId },
          { field: 'plantId', operator: '==', value: mockPlantId }
        ],
        orderBy: [{ field: 'dueDate', direction: 'asc' }]
      });
    });
  });

  describe('createTask', () => {
    it('should call create with task data', async () => {
      const createSpy = vi.spyOn(taskService, 'create').mockResolvedValue({
        data: mockTask
      });

      const taskData = {
        userId: mockUserId,
        title: 'New Task',
        dueDate: new Date(),
        priority: 'high' as const,
        status: 'pending' as const
      };

      await taskService.createTask(taskData);

      expect(createSpy).toHaveBeenCalledWith(taskData);
    });
  });

  describe('completeTask', () => {
    it('should update task status to completed', async () => {
      const updateSpy = vi.spyOn(taskService, 'update').mockResolvedValue({
        data: { ...mockTask, status: 'completed', completedAt: new Date() }
      });

      await taskService.completeTask(mockTaskId);

      expect(updateSpy).toHaveBeenCalledWith(mockTaskId, expect.objectContaining({
        status: 'completed',
        completedAt: expect.any(Date)
      }));
    });
  });
});