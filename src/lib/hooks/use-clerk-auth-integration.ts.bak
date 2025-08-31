import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/auth-store';

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

/**
 * Hook that integrates Clerk authentication with Zustand store
 * Synchronizes Clerk's auth state with our application store
 */
export function useClerkAuthIntegration() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { setUser, setLoading, setError, clearError } = useAuthStore();

  /**
   * Transform Clerk user to our User type
   */
  const transformClerkUser = (clerkUser: any): User | null => {
    if (!clerkUser) return null;

    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      imageUrl: clerkUser.imageUrl || undefined,
      createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : undefined,
      lastLoginAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : undefined,
    };
  };

  // Sync Clerk auth state with Zustand store
  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    try {
      clearError();
      
      if (isSignedIn && clerkUser) {
        const transformedUser = transformClerkUser(clerkUser);
        setUser(transformedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error syncing auth state:', error);
      setError(error instanceof Error ? error.message : 'Authentication error');
      setLoading(false);
    }
  }, [isSignedIn, isLoaded, clerkUser, setUser, setLoading, setError, clearError]);

  /**
   * Enhanced logout function that updates both Clerk and store
   */
  const logout = async () => {
    try {
      setLoading(true);
      clearError();
      await signOut();
      // Store will be updated automatically via the useEffect above
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
      setLoading(false);
    }
  };

  return {
    isLoaded,
    logout,
  };
}

/**
 * Hook that provides authentication status checking utilities
 * Uses Clerk's session information for real-time auth status
 */
export function useAuthStatus() {
  const { isSignedIn, isLoaded, sessionId } = useAuth();
  const { user } = useUser();
  const authUser = useAuthStore((state) => state.user);

  /**
   * Check if user is currently authenticated
   */
  const isAuthenticated = (): boolean => {
    return isLoaded && !!isSignedIn && !!sessionId;
  };

  /**
   * Check if user has a valid session
   */
  const hasValidSession = (): boolean => {
    return isLoaded && !!sessionId;
  };

  /**
   * Check if authentication is still loading
   */
  const isAuthLoading = (): boolean => {
    return !isLoaded;
  };

  /**
   * Get current user with preference for Clerk user over store user
   */
  const getCurrentUser = (): User | null => {
    if (!isLoaded || !isSignedIn) return null;
    
    // Prefer the store user as it's already transformed
    if (authUser) return authUser;
    
    // Fallback to transforming Clerk user
    if (user) {
      return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        imageUrl: user.imageUrl || undefined,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
        lastLoginAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : undefined,
      };
    }
    
    return null;
  };

  /**
   * Check if user has completed their profile
   */
  const hasCompleteProfile = (): boolean => {
    const currentUser = getCurrentUser();
    return !!(currentUser?.firstName && currentUser?.lastName && currentUser?.email);
  };

  return {
    isAuthenticated,
    hasValidSession,
    isAuthLoading,
    getCurrentUser,
    hasCompleteProfile,
    isLoaded,
    sessionId,
  };
}

/**
 * Hook for components that need to react to authentication state changes
 */
export function useAuthStateListener(
  onAuthChange?: (isAuthenticated: boolean, user: User | null) => void
) {
  const { isSignedIn, isLoaded } = useAuth();
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isLoaded) return;

    const isAuth = !!isSignedIn;
    onAuthChange?.(isAuth, authUser);
  }, [isSignedIn, isLoaded, authUser, onAuthChange]);

  return {
    isLoaded,
    isAuthenticated: isLoaded && !!isSignedIn,
    user: authUser,
  };
}