import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { useAuthStore } from '~/stores/authStore';
import { resetPasswordSchema, type ResetPasswordFormData } from '~/lib/validations/auth';
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

export function ResetPasswordForm() {
  const { resetPassword, resettingPassword, error, clearError } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearError();
      await resetPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the store
      console.error('Password reset failed:', error);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            Check your email
          </h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to your email address.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => {
              setEmailSent(false);
              form.reset();
            }}
            variant="outline"
            className="w-full"
          >
            Send another email
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

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

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={resettingPassword}>
            {resettingPassword ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}