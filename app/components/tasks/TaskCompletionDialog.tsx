import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CheckCircle2, FileText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

import type { Task, NoteCategory, GrowSpace, Plant } from '../../lib/types';
import { format } from 'date-fns';

interface CompletionFormData {
  createNote: boolean;
  noteContent?: string;
  noteCategory: NoteCategory;
}

interface TaskCompletionDialogProps {
  task: Task | null;
  spaces: GrowSpace[];
  plants: Plant[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (taskId: string, noteData?: {
    content: string;
    category: NoteCategory;
    plantId?: string;
    spaceId?: string;
  }) => Promise<void>;
}

export function TaskCompletionDialog({
  task,
  spaces,
  plants,
  open,
  onOpenChange,
  onComplete
}: TaskCompletionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CompletionFormData>({
    defaultValues: {
      createNote: false,
      noteContent: '',
      noteCategory: 'milestone',
    }
  });

  const watchCreateNote = watch('createNote');

  // Find associated space and plant
  const associatedSpace = task?.spaceId ? spaces.find(s => s.id === task.spaceId) : null;
  const associatedPlant = task?.plantId ? plants.find(p => p.id === task.plantId) : null;

  const handleFormSubmit = async (data: CompletionFormData) => {
    if (!task) return;

    setIsSubmitting(true);
    try {
      let noteData;
      
      if (data.createNote && data.noteContent?.trim()) {
        noteData = {
          content: data.noteContent.trim(),
          category: data.noteCategory || 'milestone',
          plantId: task.plantId,
          spaceId: task.spaceId,
        };
      }

      await onComplete(task.id, noteData);
      
      // Reset form and close dialog
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>Complete Task</span>
          </DialogTitle>
          <DialogDescription>
            Mark this task as completed and optionally add a note about the completion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Task Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Due: {format(task.dueDate, 'MMM d, yyyy')}
              </Badge>
              <Badge className="text-xs">
                {task.priority}
              </Badge>
            </div>
            
            {/* Associated Space/Plant */}
            {(associatedSpace || associatedPlant) && (
              <div className="flex items-center space-x-2 mt-2">
                {associatedSpace && (
                  <Badge variant="secondary" className="text-xs">
                    📍 {associatedSpace.name}
                  </Badge>
                )}
                {associatedPlant && (
                  <Badge variant="secondary" className="text-xs">
                    🌱 {associatedPlant.name}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Create Note Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="createNote"
                checked={watchCreateNote}
                onChange={(e) => setValue('createNote', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="createNote" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Add a completion note</span>
              </Label>
            </div>

            {watchCreateNote && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="noteCategory">Category</Label>
                  <Select
                    value={watch('noteCategory')}
                    onValueChange={(value: NoteCategory) => setValue('noteCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="feeding">Feeding</SelectItem>
                      <SelectItem value="pruning">Pruning</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noteContent">Note</Label>
                  <Textarea
                    id="noteContent"
                    {...register('noteContent')}
                    placeholder="Describe what you accomplished or any observations..."
                    rows={3}
                    className={errors.noteContent ? 'border-red-500' : ''}
                  />
                  {errors.noteContent && (
                    <p className="text-sm text-red-500">{errors.noteContent.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Completing...' : 'Complete Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}