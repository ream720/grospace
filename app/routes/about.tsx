import { Link } from "react-router";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About — Grospace" },
    { name: "description", content: "Learn about Grospace, the garden management app for home growers." },
  ];
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Grospace</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p className="text-lg">
            Grospace is a garden management app designed for home growers.
            Whether you're tending a small balcony garden or running multiple indoor grow spaces,
            Grospace helps you stay organized and on top of your plants.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What You Can Do</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Track Plants</strong> — Record every plant from seed to harvest, including variety, stage, planting date, and seed source.</li>
            <li><strong>Manage Grow Spaces</strong> — Organize your garden into indoor tents, outdoor beds, greenhouses, containers, and hydroponic systems.</li>
            <li><strong>Log Notes &amp; Observations</strong> — Capture observations, feedings, pruning sessions, issues, and milestones with photo uploads.</li>
            <li><strong>Create Tasks</strong> — Set up gardening tasks with priorities, due dates, and recurring schedules to never miss a watering or feeding.</li>
            <li><strong>Dashboard Overview</strong> — See your active plants, upcoming tasks, and recent activity at a glance.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Built for Gardeners</h2>
          <p>
            Grospace was built by gardeners, for gardeners. We know the frustration of losing track
            of what you planted, when you fed it, or which space needs attention. Our goal is to make
            garden management simple and enjoyable.
          </p>

          <div className="mt-10 pt-6 border-t">
            <p className="text-muted-foreground">
              Currently in beta. Have feedback or feature requests?{" "}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link> and let us know.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}