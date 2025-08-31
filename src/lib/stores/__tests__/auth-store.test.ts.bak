import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../auth-store';
import type { User } from '../../types';

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: vi.fn((fn) => fn),
}));

describe('AuthStore', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('Actions', () => {
    describe('setUser', () => {
      it('should set user and update authentication state', () => {
        const { setUser } = useAuthStore.getState();
        
        setUser(mockUser);
        
        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should clear user and update authentication state when user is null', () => {
        // First set a user
        const { setUser } = useAuthStore.getState();
        setUser(mockUser);
        
        // Then clear the user
        setUser(null);
        
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });
    });

    describe('setLoading', () => {
      it('should update loading state', () => {
        const { setLoading } = useAuthStore.getState();
        
        setLoading(false);
        
        const state = useAuthStore.getState();
        expect(state.loading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error and stop loading', () => {
        const { setError } = useAuthStore.getState();
        const errorMessage = 'Authentication failed';
        
        setError(errorMessage);
        
        const state = useAuthStore.getState();
        expect(state.error).toBe(errorMessage);
        expect(state.loading).toBe(false);
      });

      it('should clear error when set to null', () => {
        const { setError } = useAuthStore.getState();
        
        // First set an error
        setError('Some error');
        expect(useAuthStore.getState().error).toBe('Some error');
        
        // Then clear it
        setError(null);
        expect(useAuthStore.getState().error).toBeNull();
      });
    });

    describe('clearError', () => {
      it('should clear error state', () => {
        const { setError, clearError } = useAuthStore.getState();
        
        // First set an error
        setError('Some error');
        expect(useAuthStore.getState().error).toBe('Some error');
        
        // Then clear it
        clearError();
        expect(useAuthStore.getState().error).toBeNull();
      });
    });

    describe('login', () => {
      it('should set loading state and clear error', async () => {
        const { login, setError } = useAuthStore.getState();
        
        // Set an error first
        setError('Previous error');
        
        await login();
        
        const state = useAuthStore.getState();
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
      });
    });

    describe('logout', () => {
      it('should clear user state on successful logout', async () => {
        const { setUser, logout } = useAuthStore.getState();
        
        // First set a user
        setUser(mockUser);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        
        // Then logout
        await logout();
        
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });
    });
  });

  describe('Selector Hooks', () => {
    it('should provide correct selectors', () => {
      const { setUser } = useAuthStore.getState();
      setUser(mockUser);
      
      // Test individual selectors
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('State Transitions', () => {
    it('should handle complete authentication flow', () => {
      const { setLoading, setUser, setError, clearError } = useAuthStore.getState();
      
      // Start loading
      setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);
      
      // Set user (successful auth)
      setUser(mockUser);
      const authState = useAuthStore.getState();
      expect(authState.user).toEqual(mockUser);
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.loading).toBe(false);
      expect(authState.error).toBeNull();
      
      // Simulate error
      setError('Network error');
      const errorState = useAuthStore.getState();
      expect(errorState.error).toBe('Network error');
      expect(errorState.loading).toBe(false);
      
      // Clear error
      clearError();
      expect(useAuthStore.getState().error).toBeNull();
      
      // Logout
      setUser(null);
      const logoutState = useAuthStore.getState();
      expect(logoutState.user).toBeNull();
      expect(logoutState.isAuthenticated).toBe(false);
    });
  });
});