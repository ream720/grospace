import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Building2, Sprout, Plus, CheckSquare, StickyNote, BarChart3, Calendar, FlaskConical, ArrowRight } from 'lucide-react';
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
import { QuickActions } from '../components/dashboard/QuickActions';
import { PlantStageDistribution } from '../components/dashboard/PlantStageDistribution';
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

    // Greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Gardener'}! 🌿</h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening in your garden today.
                    </p>
                </div>

                {/* DEV ONLY: Mock Data Toggle */}
                <Button
                    variant={useMockData ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleToggleMockData}
                    className="gap-2 self-start md:self-auto"
                >
                    <FlaskConical className="h-4 w-4" />
                    {useMockData ? "Disable Demo Data" : "Load Demo Data"}
                </Button>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
                <StatCard
                    title="Active Plants"
                    value={activePlants}
                    description="Currently growing"
                    icon={Sprout}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-green-600"
                    trend={totalPlants > 0 ? "+2 this week" : undefined} // Placeholder trend
                />
                <StatCard
                    title="Spaces"
                    value={displaySpaces.length}
                    description="Active environments"
                    icon={Building2}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-blue-600"
                />
                <StatCard
                    title="Harvests"
                    value={harvestedPlants}
                    description="Total harvested"
                    icon={CheckSquare} // Using CheckSquare as a generic "done" icon
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-orange-600"
                />
                <StatCard
                    title="Success Rate"
                    value={enhancedStats.completedPlants > 0 ? `${enhancedStats.successRate}%` : 'N/A'}
                    description="From completed grows"
                    icon={BarChart3}
                    isLoading={isLoading && !useMockData}
                    iconClassName="text-emerald-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:gap-8 lg:grid-cols-12">
                {/* Left Column (Main Content) - Spans 7 cols */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Getting Started (Conditional) */}
                    {(spaces.length === 0 || totalPlants === 0) && !useMockData && (
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardHeader>
                                <CardTitle>Let's Get Growing!</CardTitle>
                                <CardDescription>
                                    Your garden is looking a bit empty. Follow these steps to get started.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4">
                                {spaces.length === 0 ? (
                                    <Link to="/spaces">
                                        <Button size="lg" className="w-full sm:w-auto">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create First Space
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link to="/plants">
                                        <Button size="lg" className="w-full sm:w-auto">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Plant
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming Tasks */}
                    <UpcomingTasks
                        upcomingTasks={upcomingTasks}
                        overdueTasks={overdueTasks}
                        isLoading={isLoading}
                    />

                    {/* Recent Notes or other "Main" content could go here */}
                    {/* Plant Stages Distribution */}
                    <PlantStageDistribution
                        plants={displayPlants}
                        isLoading={isLoading && !useMockData}
                    />

                    <div className="block lg:hidden">
                        <ActivityFeed
                            activities={activities}
                            isLoading={isLoading && !useMockData}
                            title="Recent Activity"
                        />
                    </div>
                </div>

                {/* Right Column (Sidebar) - Spans 5 cols */}
                <div className="lg:col-span-5 space-y-6 md:space-y-8 order-first lg:order-none">
                    {/* Quick Actions */}
                    <QuickActions />

                    {/* Activity Feed (Desktop) */}
                    <div className="hidden lg:block">
                        <ActivityFeed
                            activities={activities}
                            isLoading={isLoading && !useMockData}
                            title="Recent Activity"
                            description="Latest updates"
                            className="h-full"
                        />
                    </div>
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
