import React, { createContext, useContext } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/auth-store';
import { useClerkAuthIntegration } from '../hooks/use-clerk-auth-integration';

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

interface AuthContextValue {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Clerk-specific data
  isLoaded: boolean;
  sessionId: string | null;

  // Actions
  logout: () => Promise<void>;
  clearError: () => void;

  // Utilities
  hasCompleteProfile: () => boolean;
  getUserDisplayName: () => string;
  getUserInitials: () => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider that integrates Clerk with Zustand store
 * Provides a unified authentication context for the entire application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { sessionId } = useAuth();
  const { isLoaded, logout } = useClerkAuthIntegration();

  // Get state from Zustand store
  const { user, isAuthenticated, loading, error, clearError } = useAuthStore();

  /**
   * Utility functions
   */
  const hasCompleteProfile = (): boolean => {
    return !!(user?.firstName && user?.lastName && user?.email);
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Guest';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.email) {
      return user.email.split('@')[0];
    }

    return 'User';
  };

  const getUserInitials = (): string => {
    if (!user) return 'G';

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }

    if (user.email) {
      return user.email[0].toUpperCase();
    }

    return 'U';
  };

  const contextValue: AuthContextValue = {
    // User data
    user,
    isAuthenticated,
    isLoading: loading,
    error,

    // Clerk-specific data
    isLoaded,
    sessionId: sessionId || null,

    // Actions
    logout,
    clearError,

    // Utilities
    hasCompleteProfile,
    getUserDisplayName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use the authentication context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook for components that only need user data
 */
export function useCurrentUser(): User | null {
  const { user } = useAuthContext();
  return user;
}

/**
 * Hook for components that only need authentication status
 */
export function useIsUserAuthenticated(): boolean {
  const { isAuthenticated, isLoaded } = useAuthContext();
  return isLoaded && isAuthenticated;
}

/**
 * Hook for components that need loading state
 */
export function useAuthLoadingState(): {
  isLoading: boolean;
  isLoaded: boolean;
} {
  const { isLoading, isLoaded } = useAuthContext();
  return { isLoading, isLoaded };
}

/**
 * Hook for authentication actions
 */
export function useAuthContextActions() {
  const { logout, clearError } = useAuthContext();
  return { logout, clearError };
}

/**
 * Hook for user utility functions
 */
export function useUserUtils() {
  const { hasCompleteProfile, getUserDisplayName, getUserInitials } =
    useAuthContext();
  return { hasCompleteProfile, getUserDisplayName, getUserInitials };
}
