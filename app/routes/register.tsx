import type { Route } from "./+types/register";
import { AuthLayout } from "~/components/layout/AuthLayout";
import { RegisterForm } from "~/components/auth/RegisterForm";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Create Account - Grospace" },
        { name: "description", content: "Create your Grospace account to start managing your garden" },
    ];
}

export default function Register() {
    return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Start your gardening journey with Grospace"
        >
            <RegisterForm />
        </AuthLayout>
    );
}