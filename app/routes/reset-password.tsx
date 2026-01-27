import type { Route } from "./+types/reset-password";
import { AuthLayout } from "~/components/layout/AuthLayout";
import { ResetPasswordForm } from "~/components/auth/ResetPasswordForm";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Reset Password - Grospace" },
        { name: "description", content: "Reset your Grospace account password" },
    ];
}

export default function ResetPassword() {
    return (
        <AuthLayout 
            title="Reset Password" 
            subtitle="We'll help you get back into your account"
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
}