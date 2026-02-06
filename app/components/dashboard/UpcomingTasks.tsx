import { Link } from 'react-router';
import { format } from 'date-fns';
import { Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import type { Task } from '../../lib/types';

interface UpcomingTasksProps {
    upcomingTasks: Task[];
    overdueTasks: Task[];
    isLoading?: boolean;
}

export function UpcomingTasks({ upcomingTasks, overdueTasks, isLoading }: UpcomingTasksProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Upcoming Tasks
                    </CardTitle>
                    <CardDescription>
                        Tasks due in the next 7 days
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : upcomingTasks.length > 0 ? (
                        <div className="space-y-2">
                            {upcomingTasks.slice(0, 3).map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due: {format(new Date(task.dueDate), 'MMM d')}
                                        </p>
                                    </div>
                                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                        {task.priority}
                                    </Badge>
                                </div>
                            ))}
                            {upcomingTasks.length > 3 && (
                                <Link to="/tasks">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        View all {upcomingTasks.length} upcoming tasks
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                    )}
                </CardContent>
            </Card>

            {overdueTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-destructive">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Overdue Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {overdueTasks.slice(0, 3).map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 border border-destructive/20 rounded">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due: {format(new Date(task.dueDate), 'MMM d')}
                                        </p>
                                    </div>
                                    <Badge variant="destructive">Overdue</Badge>
                                </div>
                            ))}
                            {overdueTasks.length > 3 && (
                                <Link to="/tasks">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        View all {overdueTasks.length} overdue tasks
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
