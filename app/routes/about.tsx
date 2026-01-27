import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Grospace" },
    { name: "description", content: "Learn more about Grospace" },
  ];
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Grospace</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-4">
          Welcome to Grospace - a modern web application built with the latest technologies.
        </p>
        <p className="mb-4">
          This project showcases the power of React Router v7, TypeScript, Tailwind CSS, 
          and other cutting-edge tools to create fast, scalable web applications.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Technologies Used</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>React Router v7 with SSR</li>
          <li>TypeScript for type safety</li>
          <li>Tailwind CSS for styling</li>
          <li>shadcn/ui for components</li>
          <li>Zustand for state management</li>
          <li>Vitest for testing</li>
        </ul>
      </div>
    </div>
  );
}