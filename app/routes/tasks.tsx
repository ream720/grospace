import type { Route } from "./+types/tasks";
import { TasksPage } from '../components/tasks/TasksPage';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Tasks - Grospace" },
        { name: "description", content: "Manage your garden tasks and schedules" },
    ];
}

export default function Tasks() {
    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage your garden tasks and stay on top of your schedule.
                    </p>
                </div>

                <TasksPage />
            </div>
        </ProtectedRoute>
    );
}
