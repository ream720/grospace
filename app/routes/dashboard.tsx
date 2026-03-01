import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Building2, Sprout, Plus, CheckCircle2, TrendingUp, AlertTriangle, Calendar, StickyNote, ShoppingBasket, StickyNote as NoteIcon } from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';
import type { Route } from "./+types/dashboard";
import { Button } from '~/components/ui/button';
import { ProtectedRoute } from '~/components/routing/ProtectedRoute';
import { useAuthStore } from '~/stores/authStore';
import { useSpaceStore } from '~/stores/spaceStore';
import { usePlantStore } from '~/stores/plantStore';
import { useTaskStore } from '~/stores/taskStore';
import { useNoteStore } from '~/stores/noteStore';
import { DashboardLayout } from '~/components/dashboard/DashboardLayout';
import { PlantStageDistribution } from '~/components/dashboard/PlantStageDistribution';
import { activityService } from '~/lib/services/activityService';
import { cn } from '~/lib/utils';

// Forms for Quick Action modals
import { PlantForm } from '~/components/plants/PlantForm';
import { SpaceForm } from '~/components/spaces/SpaceForm';
import { TaskForm } from '~/components/tasks/TaskForm';
import { NoteForm } from '~/components/notes/NoteForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '~/components/ui/dialog';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard - Grospace" },
        { name: "description", content: "Your garden management dashboard" },
    ];
}

function DashboardContent() {
    const { user } = useAuthStore();
    const { spaces, loadSpaces, createSpace, loading: spacesLoading } = useSpaceStore();
    const { plants, loadPlants, loading: plantsLoading } = usePlantStore();
    const { tasks, loadTasks, completeTask, loading: tasksLoading } = useTaskStore();
    const { notes, loadNotes, createNote, loading: notesLoading } = useNoteStore();

    // Quick Action modal states
    const [showAddPlant, setShowAddPlant] = useState(false);
    const [showAddSpace, setShowAddSpace] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);

    useEffect(() => {
        if (user) {
            loadSpaces();
            loadPlants();
            loadTasks();
            loadNotes(user.uid, { limit: 5 });
        }
    }, [user, loadSpaces, loadPlants, loadTasks, loadNotes]);

    const totalPlants = plants.length;
    const activePlants = plants.filter(p => p.status !== 'harvested' && p.status !== 'removed').length;
    const harvestedPlants = plants.filter(p => p.status === 'harvested').length;

    // "Open Issues" / High Priority Tasks
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status === 'pending');
    const overdueTasks = tasks.filter(t => t.status === 'pending' && isAfter(new Date(), t.dueDate));
    const openIssuesCount = new Set([
        ...highPriorityTasks.map((task) => task.id),
        ...overdueTasks.map((task) => task.id),
    ]).size;

    // Tasks Due (Next 24 Hours)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfWindow = new Date(startOfToday);
    endOfWindow.setDate(endOfWindow.getDate() + 1);
    const tasksDueSoon = tasks.filter((task) => {
        if (task.status !== 'pending') {
            return false;
        }

        const dueDate = new Date(task.dueDate);
        return dueDate >= startOfToday && dueDate <= endOfWindow;
    });

    // Recent Activity with Description
    const activities = useMemo(() => {
        const rawActivities = activityService.generateActivities(
            notes,
            tasks,
            plants,
            spaces,
            { limit: 5 }
        );
        return rawActivities.map(activity => ({
            ...activity,
            description: activityService.formatActivityDescription(activity)
        }));
    }, [notes, tasks, plants, spaces]);

    // Recent Tasks for the list
    const recentTasks = tasks
        .filter(t => t.status === 'pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    const isLoading = spacesLoading || plantsLoading || tasksLoading || notesLoading;

    // Helper for generating activity icon based on type
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'note_created': return StickyNote;
            case 'task_completed': return CheckCircle2;
            case 'plant_added': return Sprout;
            case 'plant_harvested': return ShoppingBasket;
            case 'space_created': return Building2;
            default: return Sprout;
        }
    };

    // Helper for generating activity colors
    const getActivityColor = (type: string) => {
        switch (type) {
            case 'note_created': return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
            case 'task_completed': return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300";
            case 'plant_added': return "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300";
            case 'plant_harvested': return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300";
            default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
        }
    };

    // Handle marking a task as complete from dashboard
    const handleMarkComplete = async (taskId: string) => {
        try {
            await completeTask(taskId);
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    // Quick Action handlers
    const handleCreateSpace = async (data: { name: string; type: any; description?: string }) => {
        if (!user) return;
        try {
            await createSpace({ ...data, userId: user.uid });
            setShowAddSpace(false);
        } catch (error) {
            console.error('Failed to create space:', error);
        }
    };

    const handleCreateNote = async (data: any) => {
        if (!user) return;
        try {
            await createNote(data, user.uid);
            setShowAddNote(false);
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    // Loading skeleton
    if (isLoading && plants.length === 0 && tasks.length === 0) {
        return (
            <DashboardLayout title="Dashboard">
                <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm h-32 animate-pulse" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-64 animate-pulse" />
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-64 animate-pulse" />
                        </div>
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-48 animate-pulse" />
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-64 animate-pulse" />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard">
            <div className="flex-1 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Active Plants */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Plants</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{activePlants}</p>
                            <p className="mt-1 text-xs text-green-600 font-medium flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{plants.filter(p => differenceInDays(new Date(), new Date(p.plantedDate)) <= 7).length} this week
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Sprout className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    {/* Open Issues (High Priority Tasks) */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Issues</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{openIssuesCount}</p>
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400 font-medium">Needs Attention</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    {/* Tasks Due Soon */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Due</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{tasksDueSoon.length}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Next 24 Hours</p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>

                    {/* Total Harvests */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Harvests</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{harvestedPlants}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">All Time</p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <ShoppingBasket className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* Priority/Upcoming Tasks */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upcoming Tasks</h3>
                                <Link to="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium">View All</Link>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {recentTasks.length > 0 ? recentTasks.map(task => (
                                    <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-1 flex-shrink-0 h-4 w-4 rounded-full border-2",
                                                task.priority === 'high' ? "border-red-400 dark:border-red-500" :
                                                task.priority === 'medium' ? "border-yellow-400 dark:border-yellow-500" :
                                                "border-blue-400 dark:border-blue-500"
                                            )}></div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{task.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Due: {format(new Date(task.dueDate), 'MMM d')} •
                                                    <span className={cn("ml-1",
                                                        task.priority === 'high' ? "text-red-500" :
                                                        task.priority === 'medium' ? "text-yellow-500" : "text-blue-500"
                                                    )}>
                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-primary text-xs"
                                            onClick={() => handleMarkComplete(task.id)}
                                        >
                                            Mark Complete
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        <p>No upcoming tasks.</p>
                                        <Link to="/tasks" className="text-primary hover:text-primary/80 text-sm mt-1 inline-block">
                                            Create your first task →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                                    {activities.map((activity) => {
                                        const ActivityIcon = getActivityIcon(activity.type);
                                        return (
                                            <li key={activity.id} className="ml-6">
                                                <span className={cn(
                                                    "absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-8 ring-white dark:ring-slate-800",
                                                    getActivityColor(activity.type)
                                                )}>
                                                    <div className="rounded-full p-1.5">
                                                         <ActivityIcon className="h-4 w-4" />
                                                    </div>
                                                </span>
                                                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-slate-900/50 dark:border-gray-700">
                                                    <div className="items-center justify-between mb-2 sm:flex">
                                                        <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                                                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                                                        </time>
                                                        <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                                                            {activity.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {activities.length === 0 && (
                                        <li className="ml-6 text-gray-500">No recent activity.</li>
                                    )}
                                </ol>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-8">

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowAddPlant(true)}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Plant</span>
                                </button>
                                <button
                                    onClick={() => setShowAddSpace(true)}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                        <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Space</span>
                                </button>
                                <button
                                    onClick={() => setShowAddNote(true)}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                        <StickyNote className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Note</span>
                                </button>
                                <button
                                    onClick={() => setShowAddTask(true)}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Task</span>
                                </button>
                            </div>
                        </div>

                        {/* Plant Stage Distribution */}
                        <PlantStageDistribution plants={plants} isLoading={plantsLoading} />
                    </div>
                </div>
            </div>

            {/* Quick Action Modals */}

            {/* Add Plant Modal */}
            <Dialog open={showAddPlant} onOpenChange={setShowAddPlant}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Plant</DialogTitle>
                        <DialogDescription>Add a new plant to your garden.</DialogDescription>
                    </DialogHeader>
                    <PlantForm
                        spaces={spaces}
                        onSuccess={() => { setShowAddPlant(false); loadPlants(); }}
                        onCancel={() => setShowAddPlant(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Add Space Modal */}
            <Dialog open={showAddSpace} onOpenChange={setShowAddSpace}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Space</DialogTitle>
                        <DialogDescription>Add a new grow space to organize your plants.</DialogDescription>
                    </DialogHeader>
                    <SpaceForm
                        onSubmit={handleCreateSpace}
                        onCancel={() => setShowAddSpace(false)}
                        isLoading={spacesLoading}
                    />
                </DialogContent>
            </Dialog>

            {/* Add Task Modal */}
            <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <TaskForm
                        spaces={spaces}
                        plants={plants}
                        onSubmit={async (taskData) => {
                            try {
                                await useTaskStore.getState().createTask(taskData);
                                setShowAddTask(false);
                                loadTasks();
                            } catch (error) {
                                console.error('Failed to create task:', error);
                            }
                        }}
                        onCancel={() => setShowAddTask(false)}
                        isLoading={false}
                    />
                </DialogContent>
            </Dialog>

            {/* Add Note Modal */}
            <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>Record an observation or note about your garden.</DialogDescription>
                    </DialogHeader>
                    <NoteForm
                        onSubmit={async (data) => {
                            await handleCreateNote(data);
                        }}
                        onCancel={() => setShowAddNote(false)}
                    />
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
