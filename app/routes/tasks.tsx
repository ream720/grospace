import type { Route } from "./+types/tasks";
import { TasksPage } from '../components/tasks/TasksPage';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks - Grospace" },
        { name: "description", content: "Manage your garden tasks and schedules" },
    ];
}

function TasksContent() {
    return (
        <DashboardLayout title="Tasks">
            <div className="mb-6">
                <p className="text-muted-foreground">
                    Manage your garden tasks and stay on top of your schedule.
                </p>
            </div>
            <TasksPage />
        </DashboardLayout>
    );
}

export default function Tasks() {
    return (
        <ProtectedRoute>
            <TasksContent />
        </ProtectedRoute>
    );
}
