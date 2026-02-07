import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Building2, Sprout, Plus, CheckSquare, StickyNote, BarChart3, Calendar, FlaskConical } from 'lucide-react';
import { isAfter, differenceInDays } from 'date-fns';
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
import { generateMockData, type MockDataResult } from '../lib/services/mockDataService';

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

    // DEV ONLY: Mock data state (remove before production)
    const [mockData, setMockData] = useState<MockDataResult | null>(null);
    const [useMockData, setUseMockData] = useState(false);

    useEffect(() => {
        if (user) {
            loadSpaces();
            loadPlants();
            loadTasks();
            loadNotes(user.uid, { limit: 5 }); // Load recent 5 notes
        }
    }, [user, loadSpaces, loadPlants, loadTasks, loadNotes]);

    // Determine which data to use (real or mock)
    const displaySpaces = useMockData && mockData ? mockData.spaces : spaces;
    const displayPlants = useMockData && mockData ? mockData.plants : plants;
    const displayTasks = useMockData && mockData ? mockData.tasks : tasks;
    const displayNotes = useMockData && mockData ? mockData.notes : notes;

    const totalPlants = displayPlants.length;
    const activePlants = displayPlants.filter(p => p.status !== 'harvested' && p.status !== 'removed').length;
    const harvestedPlants = displayPlants.filter(p => p.status === 'harvested').length;
    const removedPlants = displayPlants.filter(p => p.status === 'removed').length;

    // Calculate enhanced stats
    const enhancedStats = useMemo(() => {
        const completedPlants = harvestedPlants + removedPlants;
        const successRate = completedPlants > 0
            ? Math.round((harvestedPlants / completedPlants) * 100)
            : 0;

        // Calculate average days to harvest
        const harvestedWithDates = displayPlants.filter(
            p => p.status === 'harvested' && p.actualHarvestDate
        );
        const avgDaysToHarvest = harvestedWithDates.length > 0
            ? Math.round(
                harvestedWithDates.reduce((sum, plant) => {
                    const days = differenceInDays(
                        plant.actualHarvestDate!,
                        plant.plantedDate
                    );
                    return sum + days;
                }, 0) / harvestedWithDates.length
            )
            : 0;

        return { successRate, avgDaysToHarvest, completedPlants };
    }, [displayPlants, harvestedPlants, removedPlants]);

    // Recent activity data (use real tasks for upcoming/overdue since mock tasks don't sync with store)
    const upcomingTasks = getUpcomingTasks(7); // Next 7 days
    const overdueTasks = getOverdueTasks();

    // Generate activity feed
    const activities = useMemo(() => {
        return activityService.generateActivities(
            displayNotes,
            displayTasks,
            displayPlants,
            displaySpaces,
            { limit: 10 }
        );
    }, [displayNotes, displayTasks, displayPlants, displaySpaces]);

    const isLoading = spacesLoading || plantsLoading || tasksLoading || notesLoading;

    // DEV ONLY: Handle mock data toggle (remove before production)
    const handleToggleMockData = () => {
        if (!useMockData && user) {
            // Generate mock data if not already generated
            if (!mockData) {
                setMockData(generateMockData(user.uid));
            }
            setUseMockData(true);
        } else {
            setUseMockData(false);
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's an overview of your garden.
                </p>
            </div>

            {/* DEV ONLY: Mock Data Toggle (remove before production) */}
            <div className="mb-4 flex items-center gap-2">
                <Button
                    variant={useMockData ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleToggleMockData}
                    className="gap-2"
                >
                    <FlaskConical className="h-4 w-4" />
                    {useMockData ? "Using Demo Data" : "Load Demo Data"}
                </Button>
                {useMockData && (
                    <span className="text-xs text-muted-foreground">
                        (Development only - showing mock garden data)
                    </span>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard
                    title="Total Spaces"
                    value={displaySpaces.length}
                    description="Growing environments"
                    icon={Building2}
                    isLoading={isLoading && !useMockData}
                />
                <StatCard
                    title="Total Plants"
                    value={totalPlants}
                    description="All plants tracked"
                    icon={Sprout}
                    isLoading={isLoading && !useMockData}
                />
                <StatCard
                    title="Active Plants"
                    value={activePlants}
                    description="Currently growing"
                    icon={Sprout}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-green-600"
                />
                <StatCard
                    title="Harvested"
                    value={harvestedPlants}
                    description="Successfully harvested"
                    icon={Sprout}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-orange-600"
                />
                <StatCard
                    title="Success Rate"
                    value={enhancedStats.completedPlants > 0 ? `${enhancedStats.successRate}%` : 'N/A'}
                    description={`${enhancedStats.completedPlants} completed grows`}
                    icon={BarChart3}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-emerald-600"
                />
                <StatCard
                    title="Avg. Harvest Time"
                    value={enhancedStats.avgDaysToHarvest > 0 ? `${enhancedStats.avgDaysToHarvest}d` : 'N/A'}
                    description="Days from plant to harvest"
                    icon={Calendar}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-blue-600"
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
                        isLoading={isLoading && !useMockData}
                        title="Recent Activity"
                        description="Your latest garden activities"
                        emptyMessage="No recent activity. Start adding plants, notes, or tasks!"
                        showFilters={true}
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
