import { BaseService, type ServiceResult } from './baseService';
import type { Task } from '../types';
import { addDays, isAfter, startOfDay } from 'date-fns';
import { incrementRecurrenceDate } from '../utils/taskStatus';

export class TaskService extends BaseService<Task> {
  constructor() {
    super('tasks');
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string): Promise<ServiceResult<Task[]>> {
    const result = await this.list({
      where: [{ field: 'userId', operator: '==', value: userId }],
    });

    if (result.data) {
      result.data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return result;
  }

  /**
   * Get tasks for a specific space
   */
  async getSpaceTasks(spaceId: string, userId: string): Promise<ServiceResult<Task[]>> {
    const result = await this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'spaceId', operator: '==', value: spaceId }
      ],
    });

    if (result.data) {
      result.data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return result;
  }

  /**
   * Get tasks for a specific plant
   */
  async getPlantTasks(plantId: string, userId: string): Promise<ServiceResult<Task[]>> {
    const result = await this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'plantId', operator: '==', value: plantId }
      ],
    });

    if (result.data) {
      result.data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return result;
  }

  /**
   * Get overdue tasks for a user
   */
  async getOverdueTasks(userId: string): Promise<ServiceResult<Task[]>> {
    const today = startOfDay(new Date());
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: 'pending' },
        { field: 'dueDate', operator: '<', value: today }
      ],
      orderBy: [{ field: 'dueDate', direction: 'asc' }]
    });
  }

  /**
   * Get upcoming tasks for a user (next 7 days)
   */
  async getUpcomingTasks(userId: string, days: number = 7): Promise<ServiceResult<Task[]>> {
    const today = startOfDay(new Date());
    const futureDate = addDays(today, days);
    
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: 'pending' },
        { field: 'dueDate', operator: '>=', value: today },
        { field: 'dueDate', operator: '<=', value: futureDate }
      ],
      orderBy: [{ field: 'dueDate', direction: 'asc' }]
    });
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<Task>> {
    if (taskData.recurrence && !taskData.recurrenceStartDate) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Recurring tasks require a start date',
        },
      };
    }

    const normalizedTaskData = taskData.recurrence
      ? {
          ...taskData,
          recurrenceOccurrence: taskData.recurrenceOccurrence ?? 1,
          recurrenceStartDate: taskData.recurrenceStartDate,
        }
      : taskData;

    const result = await this.create(normalizedTaskData);

    if (!result.data?.recurrence) {
      return result;
    }

    const normalizedTask = this.normalizeRecurringTask(result.data);
    if (!normalizedTask) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Recurring tasks require a start date',
        },
      };
    }

    if (normalizedTask.recurrenceSeriesId === result.data.recurrenceSeriesId) {
      return { ...result, data: normalizedTask };
    }

    const backfilledResult = await this.update(result.data.id, {
      recurrenceSeriesId: normalizedTask.recurrenceSeriesId,
    });

    if (backfilledResult.data) {
      const normalizedBackfilledTask = this.normalizeRecurringTask(backfilledResult.data);
      if (!normalizedBackfilledTask) {
        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Recurring tasks require a start date',
          },
        };
      }

      return { data: normalizedBackfilledTask };
    }

    return { ...result, data: normalizedTask };
  }

  /**
   * Update a task
   */
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceResult<Task>> {
    if (updates.recurrence && !updates.recurrenceStartDate) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Recurring tasks require a start date',
        },
      };
    }

    return this.update(id, updates);
  }

  /**
   * Complete a task
   */
  async completeTask(id: string): Promise<ServiceResult<Task>> {
    const completedAt = new Date();
    const result = await this.update(id, { 
      status: 'completed',
      completedAt 
    });

    if (result.data && result.data.recurrence) {
      const normalizedCompletedTask = this.normalizeRecurringTask(result.data);
      if (!normalizedCompletedTask) {
        return result;
      }

      // Create next recurring task
      await this.createNextRecurringTask(normalizedCompletedTask);
      return { ...result, data: normalizedCompletedTask };
    }

    return result;
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<ServiceResult<void>> {
    return this.delete(id);
  }

  /**
   * Create the next instance of a recurring task
   */
  private async createNextRecurringTask(completedTask: Task): Promise<ServiceResult<Task> | null> {
    if (!completedTask.recurrence) {
      return null;
    }

    const normalizedCompletedTask = this.normalizeRecurringTask(completedTask);
    if (!normalizedCompletedTask) {
      return null;
    }
    const recurrence = normalizedCompletedTask.recurrence;
    if (!recurrence) {
      return null;
    }
    const nextDueDate = incrementRecurrenceDate(normalizedCompletedTask.dueDate, recurrence);

    // Check if we should create the next task (not past end date)
    if (recurrence.endDate && isAfter(nextDueDate, recurrence.endDate)) {
      return null;
    }

    // Create the next task
    const nextTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: normalizedCompletedTask.userId,
      plantId: normalizedCompletedTask.plantId,
      spaceId: normalizedCompletedTask.spaceId,
      title: normalizedCompletedTask.title,
      description: normalizedCompletedTask.description,
      dueDate: nextDueDate,
      priority: normalizedCompletedTask.priority,
      status: 'pending',
      recurrence: normalizedCompletedTask.recurrence,
      recurrenceSeriesId: normalizedCompletedTask.recurrenceSeriesId,
      recurrenceOccurrence: (normalizedCompletedTask.recurrenceOccurrence ?? 1) + 1,
      recurrenceStartDate: normalizedCompletedTask.recurrenceStartDate,
    };

    return this.createTask(nextTaskData);
  }

  private normalizeRecurringTask(task: Task): Task | null {
    if (!task.recurrence) {
      return task;
    }

    if (!task.recurrenceStartDate) {
      return null;
    }

    return {
      ...task,
      recurrenceSeriesId: task.recurrenceSeriesId ?? task.id,
      recurrenceOccurrence: task.recurrenceOccurrence ?? 1,
      recurrenceStartDate: task.recurrenceStartDate,
    };
  }

  /**
   * Subscribe to user tasks with real-time updates
   */
  subscribeToUserTasks(
    userId: string,
    callback: (result: ServiceResult<Task[]>) => void
  ): () => void {
    return this.subscribe(callback, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'dueDate', direction: 'asc' }]
    });
  }

  /**
   * Subscribe to space tasks with real-time updates
   */
  subscribeToSpaceTasks(
    spaceId: string,
    userId: string,
    callback: (result: ServiceResult<Task[]>) => void
  ): () => void {
    return this.subscribe(callback, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'spaceId', operator: '==', value: spaceId }
      ],
      orderBy: [{ field: 'dueDate', direction: 'asc' }]
    });
  }

  /**
   * Subscribe to plant tasks with real-time updates
   */
  subscribeToPlantTasks(
    plantId: string,
    userId: string,
    callback: (result: ServiceResult<Task[]>) => void
  ): () => void {
    return this.subscribe(callback, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'plantId', operator: '==', value: plantId }
      ],
      orderBy: [{ field: 'dueDate', direction: 'asc' }]
    });
  }
}

export const taskService = new TaskService();
