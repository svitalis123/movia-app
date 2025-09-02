export { SignIn } from './sign-in';
export { SignUp } from './sign-up';
export { UserButton } from './user-button';
export { ProtectedRoute } from './protected-route';

// Re-export Clerk components for convenience
export {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
  useUser,
  useClerk,
} from '@clerk/clerk-react';
