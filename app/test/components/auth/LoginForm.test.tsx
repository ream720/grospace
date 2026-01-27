import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { LoginForm } from '~/components/auth/LoginForm';
import { useAuthStore } from '~/stores/authStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the auth store
vi.mock('~/stores/authStore');

// Mock React Router navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  const mockSignIn = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the auth store implementation
    (useAuthStore as any).mockReturnValue({
      signIn: mockSignIn,
      signingIn: false,
      error: null,
      clearError: mockClearError,
    });
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  it('renders login form with email and password fields', () => {
    renderLoginForm();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginForm();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('prevents submission with invalid email', async () => {
    renderLoginForm();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Should not call signIn with invalid email
    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it('calls signIn with correct credentials on form submission', async () => {
    renderLoginForm();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message when authentication fails', () => {
    (useAuthStore as any).mockReturnValue({
      signIn: mockSignIn,
      signingIn: false,
      error: 'Invalid credentials',
      clearError: mockClearError,
    });

    renderLoginForm();
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('shows loading state during authentication', () => {
    (useAuthStore as any).mockReturnValue({
      signIn: mockSignIn,
      signingIn: true,
      error: null,
      clearError: mockClearError,
    });

    renderLoginForm();
    
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in.../i })).toBeDisabled();
  });

  it('contains links to register and reset password', () => {
    renderLoginForm();
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
    
    const forgotPasswordButton = screen.getByText(/forgot your password/i);
    fireEvent.click(forgotPasswordButton);
    
    expect(screen.getByRole('link', { name: /reset your password here/i })).toHaveAttribute('href', '/reset-password');
  });
});