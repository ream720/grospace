import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../lib/contexts/AuthContext';

// Mock Firebase
vi.mock('../lib/firebase/config', () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock('../lib/firebase/auth', () => ({
  createUser: vi.fn(),
  signIn: vi.fn(),
  signOutUser: vi.fn(),
  resetPassword: vi.fn(),
  formatAuthUser: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user initially
    callback(null);
    return vi.fn(); // unsubscribe function
  }),
}));

// Test component that uses auth
const TestComponent = () => {
  const { user, loading, error } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (user) return <div>User: {user.displayName}</div>;
  return <div>No user</div>;
};

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide auth context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should show loading initially, then no user
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});