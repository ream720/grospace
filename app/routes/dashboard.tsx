import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Building2, Sprout, Plus, CheckSquare, StickyNote } from 'lucide-react';
import { isAfter } from 'date-fns';
import type { Route } from "./+types/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { useSpaceStore } from '../stores/spaceStore';
import { usePlantStore } from '../stores/plantStore';
import { useTaskStore } from '../stores/taskStore';
import { useNoteStore } from '../stores/noteStore';

// Dashboard Components
import { StatCard } from '../components/dashboard/StatCard';
import { UpcomingTasks } from '../components/dashboard/UpcomingTasks';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { activityService } from '../lib/services/activityService';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard - Grospace" },
        { name: "description", content: "Your garden management dashboard" },
    ];
}

function DashboardContent() {
    const { user } = useAuthStore();
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

    const totalPlants = plants.length;
    const activePlants = plants.filter(p => p.status !== 'harvested' && p.status !== 'removed').length;
    const harvestedPlants = plants.filter(p => p.status === 'harvested').length;

    // Recent activity data
    const upcomingTasks = getUpcomingTasks(7); // Next 7 days
    const overdueTasks = getOverdueTasks();

    // Generate activity feed
    const activities = useMemo(() => {
        return activityService.generateActivities(
            notes,
            tasks,
            plants,
            spaces,
            { limit: 10 }
        );
    }, [notes, tasks, plants, spaces]);

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
                <StatCard
                    title="Total Spaces"
                    value={spaces.length}
                    description="Growing environments"
                    icon={Building2}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Plants"
                    value={totalPlants}
                    description="All plants tracked"
                    icon={Sprout}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Active Plants"
                    value={activePlants}
                    description="Currently growing"
                    icon={Sprout}
                    isLoading={isLoading}
                    iconClassName="text-green-600"
                />
                <StatCard
                    title="Harvested"
                    value={harvestedPlants}
                    description="Successfully harvested"
                    icon={Sprout}
                    isLoading={isLoading}
                    iconClassName="text-orange-600"
                />
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
                    <UpcomingTasks
                        upcomingTasks={upcomingTasks}
                        overdueTasks={overdueTasks}
                        isLoading={isLoading}
                    />
                </div>

                {/* Right Column - Recent Activity */}
                <div className="space-y-6">
                    <ActivityFeed
                        activities={activities}
                        isLoading={isLoading}
                        title="Recent Activity"
                        description="Your latest garden activities"
                        emptyMessage="No recent activity. Start adding plants, notes, or tasks!"
                    />
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
