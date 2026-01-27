import { useEffect } from 'react';
import { Navigate } from 'react-router';
import type { Route } from "./+types/tasks";
import { TasksPage } from '../components/tasks/TasksPage';
import { useAuthStore } from '../stores/authStore';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks - Grospace" },
        { name: "description", content: "Manage your garden tasks and schedules" },
    ];
}

export default function Tasks() {
    const { user, loading: authLoading, error: authError } = useAuthStore();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h2>
                    <p className="text-muted-foreground mb-4">{authError}</p>
                    <button 
                        onClick={() => window.location.href = '/login'}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Tasks</h1>
                <p className="text-muted-foreground">
                    Manage your garden tasks and stay on top of your schedule.
                </p>
            </div>

            <TasksPage />
        </div>
    );
}