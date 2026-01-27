import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home - Grospace" },
    { name: "description", content: "Welcome to Grospace" },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to Grospace
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A modern web application built with React Router v7, TypeScript, and Tailwind CSS.
          Explore our features and get started with your journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/about"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Learn More
          </a>
          <a
            href="/login"
            className="border border-input px-6 py-3 rounded-md hover:bg-accent transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
