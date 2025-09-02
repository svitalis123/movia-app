import { SignIn } from '../components/auth';

/**
 * Sign-in page component
 * Renders the Clerk SignIn component with proper routing
 */
export function SignInPage() {
  return <SignIn redirectUrl="/" />;
}

export default SignInPage;
