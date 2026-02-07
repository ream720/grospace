import { Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import type { Activity as ActivityType } from '../../lib/types/activity';
import { ActivityItem } from './ActivityItem';

interface ActivityFeedProps {
  activities: ActivityType[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  emptyMessage?: string;
  className?: string;
}

export function ActivityFeed({
  activities,
  isLoading = false,
  title = 'Recent Activity',
  description = 'Your latest garden activities',
  emptyMessage = 'No recent activity',
  className,
}: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="divide-y">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
