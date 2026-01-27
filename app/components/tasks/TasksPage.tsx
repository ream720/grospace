import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
// Simple toast implementation for now
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`Toast: ${title} - ${description}`);
    // In a real implementation, this would show a toast notification
  }
});

import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskCompletionDialog } from './TaskCompletionDialog';

import { useTaskStore } from '../../stores/taskStore';
import { useSpaceStore } from '../../stores/spaceStore';
import { usePlantStore } from '../../stores/plantStore';
import { useNoteStore } from '../../stores/noteStore';
import { useAuthStore } from '../../stores/authStore';

import type { Task } from '../../lib/types';
import type { NoteCategory } from '../../lib/types/note';

export function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  // Task store
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    loadTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    clearError: clearTasksError
  } = useTaskStore();

  // Space store
  const {
    spaces,
    loading: spacesLoading,
    loadSpaces
  } = useSpaceStore();

  // Plant store
  const {
    plants,
    loading: plantsLoading,
    loadPlants
  } = usePlantStore();

  // Note store
  const { createNote } = useNoteStore();

  // Dialog states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadTasks();
      loadSpaces();
      loadPlants();
    }
  }, [user, loadTasks, loadSpaces, loadPlants]);

  // Show error toast
  useEffect(() => {
    if (tasksError) {
      toast({
        title: 'Error',
        description: tasksError,
        variant: 'destructive',
      });
      clearTasksError();
    }
  }, [tasksError, toast, clearTasksError]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskFormSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      } else {
        await createTask(taskData);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save task',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCompletingTask(task);
    }
  };

  const handleTaskCompletion = async (
    taskId: string, 
    noteData?: {
      content: string;
      category: NoteCategory;
      plantId?: string;
      spaceId?: string;
    }
  ) => {
    try {
      await completeTask(taskId);
      
      // Create note if provided
      if (noteData && user) {
        await createNote({
          content: noteData.content,
          category: noteData.category,
          plantId: noteData.plantId,
          spaceId: noteData.spaceId,
          timestamp: new Date(),
        }, user.uid);
      }

      toast({
        title: 'Success',
        description: noteData 
          ? 'Task completed and note added successfully'
          : 'Task completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNoteFromTask = (task: Task) => {
    // This could open a note creation dialog
    // For now, we'll just show a toast
    toast({
      title: 'Feature Coming Soon',
      description: 'Direct note creation from tasks will be available soon',
    });
  };

  const isLoading = tasksLoading || spacesLoading || plantsLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TaskList
        tasks={tasks}
        spaces={spaces}
        plants={plants}
        loading={isLoading}
        onCreateTask={handleCreateTask}
        onEditTask={handleEditTask}
        onCompleteTask={handleCompleteTask}
        onDeleteTask={handleDeleteTask}
        onCreateNote={handleCreateNoteFromTask}
      />

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <TaskForm
            task={editingTask || undefined}
            spaces={spaces}
            plants={plants}
            onSubmit={handleTaskFormSubmit}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>

      {/* Task Completion Dialog */}
      <TaskCompletionDialog
        task={completingTask}
        spaces={spaces}
        plants={plants}
        open={!!completingTask}
        onOpenChange={(open) => !open && setCompletingTask(null)}
        onComplete={handleTaskCompletion}
      />
    </div>
  );
}