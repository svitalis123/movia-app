import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

/**
 * Hook for authentication guard functionality
 * Provides authentication state and automatic redirects
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/sign-in',
    requireAuth = true,
    onAuthStateChange,
  } = options;

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const isAuthenticated = isLoaded && !!isSignedIn;
  const isLoading = !isLoaded;

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    const authState = !!isSignedIn;

    // Call the callback if provided
    onAuthStateChange?.(authState);

    // Handle redirects
    if (requireAuth && !authState) {
      navigate(redirectTo, { replace: true });
    }
  }, [
    isSignedIn,
    isLoaded,
    requireAuth,
    redirectTo,
    navigate,
    onAuthStateChange,
  ]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isLoaded,
  };
}

/**
 * Hook specifically for protecting routes that require authentication
 */
export function useRequireAuth(redirectTo = '/sign-in') {
  return useAuthGuard({
    requireAuth: true,
    redirectTo,
  });
}

/**
 * Hook for routes that should redirect authenticated users (like login page)
 */
export function useRedirectIfAuthenticated(redirectTo = '/') {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate(redirectTo, { replace: true });
    }
  }, [isSignedIn, isLoaded, redirectTo, navigate]);

  return {
    isLoading: !isLoaded,
    shouldRedirect: isLoaded && !!isSignedIn,
  };
}
