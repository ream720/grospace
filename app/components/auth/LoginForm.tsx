import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '~/stores/authStore';
import { loginSchema, type LoginFormData } from '~/lib/validations/auth';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

export function LoginForm() {
  const navigate = useNavigate();
  const { user, signIn, signingIn, error, clearError } = useAuthStore();
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Navigate to dashboard when user is successfully authenticated
  useEffect(() => {
    if (user && !signingIn) {
      navigate('/dashboard');
    }
  }, [user, signingIn, navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await signIn(data.email, data.password);
      // Navigation will happen automatically via useEffect when user state updates
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={signingIn}>
            {signingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      <div className="space-y-4 text-center text-sm">
        <button
          type="button"
          onClick={() => setShowResetPassword(!showResetPassword)}
          className="text-primary hover:underline"
        >
          Forgot your password?
        </button>

        {showResetPassword && (
          <div className="text-muted-foreground">
            <Link to="/reset-password" className="text-primary hover:underline">
              Reset your password here
            </Link>
          </div>
        )}

        <div className="text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}