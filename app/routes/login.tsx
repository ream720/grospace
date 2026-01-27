import { useEffect } from "react";
import { Navigate } from "react-router";
import type { Route } from "./+types/login";
import { AuthLayout } from "~/components/layout/AuthLayout";
import { LoginForm } from "~/components/auth/LoginForm";
import { useAuthStore } from "~/stores/authStore";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Sign In - Grospace" },
        { name: "description", content: "Sign in to your Grospace account" },
    ];
}

export default function Login() {
    const { user, loading } = useAuthStore();

    // If user is already authenticated, redirect to dashboard
    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthLayout 
            title="Sign In" 
            subtitle="Welcome back to Grospace"
        >
            <LoginForm />
        </AuthLayout>
    );
}