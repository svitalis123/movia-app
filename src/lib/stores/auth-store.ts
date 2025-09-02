import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types locally to avoid import issues
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

/**
 * Authentication store using Zustand
 * Manages authentication state and provides actions for auth operations
 * Integrates with Clerk authentication service
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      loading: true, // Start with loading true until Clerk initializes
      error: null,

      // Actions
      login: async () => {
        // Login is handled by Clerk components, this is just for state management
        set({ loading: true, error: null });
        // The actual login state will be updated by the Clerk integration
      },

      logout: async () => {
        set({ loading: true, error: null });
        try {
          // The actual logout will be handled by Clerk's signOut
          // This just clears the local state
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Logout failed',
          });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          loading: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error, loading: false });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      // Only persist user data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Selector hooks for specific auth state
 */
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);

/**
 * Action hooks for auth operations
 */
export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  }));
