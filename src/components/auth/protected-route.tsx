import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import type { ProtectedRouteProps } from '../../lib/types';

/**
 * Protected route component using Clerk's authentication state
 * Renders children only when user is authenticated, otherwise redirects to sign-in
 */
export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        {fallback || <RedirectToSignIn redirectUrl={redirectTo} />}
      </SignedOut>
    </>
  );
}

export default ProtectedRoute;
