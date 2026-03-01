import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Sprout, Building2, StickyNote, CheckSquare } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grospace — Garden Management" },
    { name: "description", content: "Track your plants, manage grow spaces, and stay on top of your garden with Grospace." },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
          Welcome to Grospace
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Your personal garden management app. Track plants from seed to harvest,
          organize grow spaces, log observations, and never miss a task.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/register"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="border border-input px-8 py-3 rounded-md hover:bg-accent transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-6 rounded-xl border bg-card">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-1">Track Plants</h3>
            <p className="text-sm text-muted-foreground">
              Monitor every plant from seedling to harvest with detailed records.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-1">Manage Spaces</h3>
            <p className="text-sm text-muted-foreground">
              Organize indoor tents, outdoor beds, greenhouses, and more.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <StickyNote className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-semibold mb-1">Log Notes</h3>
            <p className="text-sm text-muted-foreground">
              Record observations, feedings, issues, and milestones with photos.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <CheckSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-1">Stay on Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Create tasks with priorities, due dates, and recurring schedules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
