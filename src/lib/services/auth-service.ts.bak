import { useAuth, useUser } from '@clerk/clerk-react';
import type { User, AuthService } from '../types';

/**
 * Authentication service implementation using Clerk
 * Provides methods for authentication state management and user operations
 */
class ClerkAuthService implements AuthService {
  private authStateCallbacks: Set<(user: User | null) => void> = new Set();

  /**
   * Initiates the login process
   * Note: With Clerk, login is handled by their components/hooks
   */
  async login(): Promise<User> {
    throw new Error('Login should be handled by Clerk components (SignIn, SignUp)');
  }

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    // This will be implemented in the hook-based service
    throw new Error('Logout should be called through useAuth hook');
  }

  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): User | null {
    // This will be implemented in the hook-based service
    throw new Error('getCurrentUser should be called through useUser hook');
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    // This will be implemented in the hook-based service
    throw new Error('isAuthenticated should be called through useAuth hook');
  }

  /**
   * Refreshes the authentication token
   */
  async refreshToken(): Promise<string> {
    // Clerk handles token refresh automatically
    throw new Error('Token refresh is handled automatically by Clerk');
  }

  /**
   * Registers a callback for authentication state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateCallbacks.add(callback);
    
    return () => {
      this.authStateCallbacks.delete(callback);
    };
  }

  /**
   * Notifies all registered callbacks of auth state changes
   */
  private notifyAuthStateChange(user: User | null): void {
    this.authStateCallbacks.forEach(callback => callback(user));
  }
}

/**
 * Hook-based authentication service that integrates with Clerk
 * This provides the actual implementation using Clerk's React hooks
 */
export function useClerkAuthService() {
  const { isSignedIn, signOut, isLoaded } = useAuth();
  const { user } = useUser();

  /**
   * Transforms Clerk user to our User type
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

  /**
   * Gets the current authenticated user
   */
  const getCurrentUser = (): User | null => {
    return transformClerkUser(user);
  };

  /**
   * Checks if user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return isLoaded && !!isSignedIn;
  };

  /**
   * Logs out the current user
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  };

  /**
   * Login method - redirects to Clerk's sign-in
   * In practice, this should trigger navigation to sign-in page/modal
   */
  const login = async (): Promise<User> => {
    throw new Error('Login should be handled by navigating to Clerk SignIn component');
  };

  /**
   * Refresh token - handled automatically by Clerk
   */
  const refreshToken = async (): Promise<string> => {
    throw new Error('Token refresh is handled automatically by Clerk');
  };

  return {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    refreshToken,
    isLoaded,
    user: getCurrentUser(),
  };
}

/**
 * Utility functions for authentication
 */
export const authUtils = {
  /**
   * Checks if a user has a complete profile
   */
  hasCompleteProfile: (user: User | null): boolean => {
    return !!(user?.firstName && user?.lastName && user?.email);
  },

  /**
   * Gets user display name
   */
  getUserDisplayName: (user: User | null): string => {
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
  },

  /**
   * Gets user initials for avatar
   */
  getUserInitials: (user: User | null): string => {
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
  },
};

// Export singleton instance (though we'll primarily use the hook)
export const authService = new ClerkAuthService();