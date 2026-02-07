import { formatDistanceToNow } from 'date-fns';
import {
  StickyNote,
  CheckCircle2,
  Sprout,
  Sparkles,
  TrendingUp,
  Building2,
} from 'lucide-react';

import type { Activity } from '../../lib/types/activity';
import { activityService } from '../../lib/services/activityService';
import { cn } from '../../lib/utils';

interface ActivityItemProps {
  activity: Activity;
  className?: string;
}

const iconMap = {
  StickyNote,
  CheckCircle2,
  Sprout,
  Sparkles,
  TrendingUp,
  Building2,
};

export function ActivityItem({ activity, className }: ActivityItemProps) {
  const description = activityService.formatActivityDescription(activity);
  const iconName = activityService.getActivityIcon(activity.type);
  const Icon = iconMap[iconName as keyof typeof iconMap] || StickyNote;

  const getIconColor = (type: Activity['type']) => {
    switch (type) {
      case 'note_created':
        return 'text-blue-600 bg-blue-50';
      case 'task_completed':
        return 'text-green-600 bg-green-50';
      case 'plant_added':
        return 'text-emerald-600 bg-emerald-50';
      case 'plant_harvested':
        return 'text-orange-600 bg-orange-50';
      case 'plant_status_changed':
        return 'text-purple-600 bg-purple-50';
      case 'space_created':
        return 'text-slate-600 bg-slate-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={cn('flex gap-3 py-3', className)}>
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        getIconColor(activity.type)
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {description}
        </p>

        {/* Additional context based on activity type */}
        {activity.type === 'note_created' && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {activity.data.content}
          </p>
        )}

        {activity.type === 'plant_harvested' && activity.data.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {activity.data.notes}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
