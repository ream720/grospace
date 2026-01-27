import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

import type { Task, TaskPriority, GrowSpace, Plant } from '../../lib/types';
import { useAuthStore } from '../../stores/authStore';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.date(),
  priority: z.enum(['low', 'medium', 'high']),
  spaceId: z.string().optional(),
  plantId: z.string().optional(),
  hasRecurrence: z.boolean(),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurrenceInterval: z.number().min(1).max(365).optional(),
  recurrenceEndDate: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  spaces: GrowSpace[];
  plants: Plant[];
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({
  task,
  spaces,
  plants,
  onSubmit,
  onCancel,
  isLoading = false
}: TaskFormProps) {
  const { user } = useAuthStore();
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate || new Date(),
      priority: task?.priority || 'medium',
      spaceId: task?.spaceId || undefined,
      plantId: task?.plantId || undefined,
      hasRecurrence: !!task?.recurrence,
      recurrenceType: task?.recurrence?.type || 'weekly',
      recurrenceInterval: task?.recurrence?.interval || 1,
      recurrenceEndDate: task?.recurrence?.endDate,
    }
  });

  const watchedSpaceId = watch('spaceId');
  const watchedHasRecurrence = watch('hasRecurrence');
  const watchedDueDate = watch('dueDate');
  const watchedEndDate = watch('recurrenceEndDate');

  // Filter plants by selected space
  const filteredPlants = watchedSpaceId
    ? plants.filter(plant => plant.spaceId === watchedSpaceId)
    : plants;

  const handleFormSubmit = async (data: TaskFormData) => {
    if (!user) return;

    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        title: data.title,
        description: data.description || undefined,
        dueDate: data.dueDate,
        priority: data.priority,
        status: task?.status || 'pending',
        spaceId: data.spaceId || undefined,
        plantId: data.plantId || undefined,
        recurrence: data.hasRecurrence ? {
          type: data.recurrenceType!,
          interval: data.recurrenceInterval!,
          endDate: data.recurrenceEndDate,
        } : undefined,
        completedAt: task?.completedAt,
      };

      await onSubmit(taskData);
    } catch (error) {
      console.error('Failed to submit task form:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter task title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedDueDate && "text-muted-foreground",
                    errors.dueDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDueDate ? format(watchedDueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedDueDate}
                  onSelect={(date) => {
                    if (date) {
                      setValue('dueDate', date);
                      setDueDateOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className="text-sm text-red-500">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={watch('priority')}
              onValueChange={(value: TaskPriority) => setValue('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Space Selection */}
          <div className="space-y-2">
            <Label>Grow Space (Optional)</Label>
            <Select
              value={watchedSpaceId || 'none'}
              onValueChange={(value) => {
                setValue('spaceId', value === 'none' ? undefined : value);
                // Clear plant selection when space changes
                setValue('plantId', undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a grow space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific space</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name} ({space.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plant Selection */}
          <div className="space-y-2">
            <Label>Plant (Optional)</Label>
            <Select
              value={watch('plantId') || 'none'}
              onValueChange={(value) => setValue('plantId', value === 'none' ? undefined : value)}
              disabled={!watchedSpaceId && plants.length > 10} // Disable if no space selected and too many plants
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific plant</SelectItem>
                {filteredPlants.map((plant) => (
                  <SelectItem key={plant.id} value={plant.id}>
                    {plant.name} ({plant.variety})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!watchedSpaceId && plants.length > 10 && (
              <p className="text-sm text-muted-foreground">
                Select a grow space first to filter plants
              </p>
            )}
          </div>

          {/* Recurrence */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasRecurrence"
                checked={watchedHasRecurrence}
                onChange={(e) => setValue('hasRecurrence', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="hasRecurrence">Recurring Task</Label>
            </div>

            {watchedHasRecurrence && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Repeat Every</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        {...register('recurrenceInterval', { valueAsNumber: true })}
                        className="w-20"
                      />
                      <Select
                        value={watch('recurrenceType')}
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                          setValue('recurrenceType', value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Day(s)</SelectItem>
                          <SelectItem value="weekly">Week(s)</SelectItem>
                          <SelectItem value="monthly">Month(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watchedEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedEndDate ? format(watchedEndDate, "PPP") : "No end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watchedEndDate}
                        onSelect={(date) => {
                          setValue('recurrenceEndDate', date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) => date < watchedDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}