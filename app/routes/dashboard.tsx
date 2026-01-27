import { useEffect } from 'react';
import { Navigate, Link } from 'react-router';
import { Building2, Sprout, Plus, CheckSquare, StickyNote, Calendar, AlertCircle } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import type { Route } from "./+types/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import { usePlantStore } from '../stores/plantStore';
import { useTaskStore } from '../stores/taskStore';
import { useNoteStore } from '../stores/noteStore';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard - Grospace" },
        { name: "description", content: "Your garden management dashboard" },
    ];
}

export default function Dashboard() {
    const { user, loading: authLoading, error: authError } = useAuthStore();
    const { spaces, loadSpaces, loading: spacesLoading } = useSpaceStore();
    const { plants, loadPlants, loading: plantsLoading } = usePlantStore();
    const { tasks, loadTasks, getUpcomingTasks, getOverdueTasks, loading: tasksLoading } = useTaskStore();
    const { notes, loadNotes, loading: notesLoading } = useNoteStore();

    useEffect(() => {
        if (user) {
            loadSpaces();
            loadPlants();
            loadTasks();
            loadNotes(user.uid, { limit: 5 }); // Load recent 5 notes
        }
    }, [user, loadSpaces, loadPlants, loadTasks, loadNotes]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {authError}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.location.href = '/login'}
                            className="ml-2"
                        >
                            Go to Login
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const totalPlants = plants.length;
    const activePlants = plants.filter(p => p.status !== 'harvested' && p.status !== 'removed').length;
    const harvestedPlants = plants.filter(p => p.status === 'harvested').length;
    
    // Recent activity data
    const upcomingTasks = getUpcomingTasks(7); // Next 7 days
    const overdueTasks = getOverdueTasks();
    const recentNotes = notes.slice(0, 3); // Show 3 most recent notes
    const recentPlantChanges = plants
        .filter(p => p.updatedAt && isAfter(new Date(p.updatedAt), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
        .slice(0, 3);
    
    const isLoading = spacesLoading || plantsLoading || tasksLoading || notesLoading;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's an overview of your garden.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mb-1" />
                        ) : (
                            <div className="text-2xl font-bold">{spaces.length}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Growing environments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mb-1" />
                        ) : (
                            <div className="text-2xl font-bold">{totalPlants}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            All plants tracked
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Plants</CardTitle>
                        <Sprout className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mb-1" />
                        ) : (
                            <div className="text-2xl font-bold">{activePlants}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Currently growing
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Harvested</CardTitle>
                        <Sprout className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mb-1" />
                        ) : (
                            <div className="text-2xl font-bold">{harvestedPlants}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Successfully harvested
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Quick Actions & Getting Started */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Get started with common tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link to="/spaces">
                                <Button variant="outline" className="w-full justify-start">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Manage Spaces
                                </Button>
                            </Link>
                            <Link to="/plants">
                                <Button variant="outline" className="w-full justify-start">
                                    <Sprout className="mr-2 h-4 w-4" />
                                    View All Plants
                                </Button>
                            </Link>
                            <Link to="/tasks">
                                <Button variant="outline" className="w-full justify-start">
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Manage Tasks
                                </Button>
                            </Link>
                            <Link to="/notes">
                                <Button variant="outline" className="w-full justify-start">
                                    <StickyNote className="mr-2 h-4 w-4" />
                                    View Notes
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>
                                {spaces.length === 0 
                                    ? "Create your first grow space to get started"
                                    : totalPlants === 0 
                                        ? "Add your first plant to start tracking"
                                        : "Your garden is set up! Keep tracking your plants."
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {spaces.length === 0 ? (
                                <Link to="/spaces">
                                    <Button className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create First Space
                                    </Button>
                                </Link>
                            ) : totalPlants === 0 ? (
                                <Link to="/plants">
                                    <Button className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Plant
                                    </Button>
                                </Link>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Great job! Your garden is growing. 🌱
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column - Tasks & Alerts */}
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

                {/* Right Column - Recent Activity */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <StickyNote className="mr-2 h-4 w-4" />
                                Recent Notes
                            </CardTitle>
                            <CardDescription>
                                Latest observations and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ) : recentNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {recentNotes.map((note) => (
                                        <div key={note.id} className="p-2 border rounded">
                                            <p className="text-sm font-medium line-clamp-2">{note.content}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {note.category}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(note.timestamp), 'MMM d')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <Link to="/notes">
                                        <Button variant="ghost" size="sm" className="w-full">
                                            View all notes
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent notes</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Sprout className="mr-2 h-4 w-4" />
                                Recent Plant Updates
                            </CardTitle>
                            <CardDescription>
                                Plants with recent changes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ) : recentPlantChanges.length > 0 ? (
                                <div className="space-y-2">
                                    {recentPlantChanges.map((plant) => (
                                        <div key={plant.id} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{plant.name}</p>
                                                <p className="text-xs text-muted-foreground">{plant.variety}</p>
                                            </div>
                                            <Badge variant={
                                                plant.status === 'harvested' ? 'default' : 
                                                plant.status === 'flowering' ? 'secondary' : 'outline'
                                            }>
                                                {plant.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent plant updates</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}