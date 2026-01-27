import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore, initializeAuth } from '../stores/authStore';

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

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      loading: true,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set user', () => {
    const testUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    useAuthStore.getState().setUser(testUser);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(testUser);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(false);
    
    const state = useAuthStore.getState();
    expect(state.loading).toBe(false);
  });

  it('should set error', () => {
    const errorMessage = 'Test error';
    useAuthStore.getState().setError(errorMessage);
    
    const state = useAuthStore.getState();
    expect(state.error).toBe(errorMessage);
  });

  it('should clear error', () => {
    useAuthStore.getState().setError('Test error');
    useAuthStore.getState().clearError();
    
    const state = useAuthStore.getState();
    expect(state.error).toBeNull();
  });

  it('should initialize auth listener', async () => {
    const mockOnAuthStateChanged = vi.mocked(await import('firebase/auth')).onAuthStateChanged;
    
    initializeAuth();
    
    expect(mockOnAuthStateChanged).toHaveBeenCalled();
  });
});