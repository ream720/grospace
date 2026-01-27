import { useState } from 'react';
import { format, isAfter, startOfDay, isValid } from 'date-fns';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Repeat
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

import type { Task, GrowSpace, Plant } from '../../lib/types';
import { Checkbox } from '../ui/checkbox';

interface TaskCardProps {
  task: Task;
  spaces: GrowSpace[];
  plants: Plant[];
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCreateNote?: (task: Task) => void;
  className?: string;
}

export function TaskCard({
  task,
  spaces,
  plants,
  onComplete,
  onEdit,
  onDelete,
  onCreateNote,
  className
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  // Helper function to safely convert dates
  const safeDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return isValid(date) ? date : null;
    if (typeof date === 'object' && date.toDate) return date.toDate();
    if (typeof date === 'string' || typeof date === 'number') {
      const parsed = new Date(date);
      return isValid(parsed) ? parsed : null;
    }
    return null;
  };

  const dueDate = safeDate(task.dueDate);
  const completedAt = safeDate(task.completedAt);

  const today = startOfDay(new Date());
  const isOverdue = task.status === 'pending' && dueDate && isAfter(today, dueDate);
  const isCompleted = task.status === 'completed';

  // Find associated space and plant
  const associatedSpace = task.spaceId ? spaces.find(s => s.id === task.spaceId) : null;
  const associatedPlant = task.plantId ? plants.find(p => p.id === task.plantId) : null;

  const handleComplete = async () => {
    if (isCompleted) return;

    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return 'border-green-200 bg-green-50';
    if (isOverdue) return 'border-red-200 bg-red-50';
    return 'border-gray-200';
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      getStatusColor(),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleComplete}
                disabled={isCompleting}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-sm leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>

              {task.description && (
                <p className={cn(
                  "text-sm text-muted-foreground mt-1 line-clamp-2",
                  isCompleted && "line-through"
                )}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {onCreateNote && (
                <DropdownMenuItem onClick={() => onCreateNote(task)}>
                  <Circle className="mr-2 h-4 w-4" />
                  Add Note
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Due Date and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={cn(
                isOverdue && !isCompleted && "text-red-600 font-medium"
              )}>
                {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Invalid date'}
              </span>
              {isOverdue && !isCompleted && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>

            <div className="flex items-center space-x-2">
              {task.recurrence && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="mr-1 h-3 w-3" />
                  {task.recurrence.type}
                </Badge>
              )}
              <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                {task.priority}
              </Badge>
            </div>
          </div>

          {/* Associated Space/Plant */}
          {(associatedSpace || associatedPlant) && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
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
            </div>
          )}

          {/* Completion Info */}
          {isCompleted && completedAt && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Completed {format(completedAt, 'MMM d, yyyy')}</span>
            </div>
          )}

          {/* Overdue Warning */}
          {isOverdue && !isCompleted && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Overdue</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}