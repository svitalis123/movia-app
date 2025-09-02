import { SignUp } from '../components/auth';

/**
 * Sign-up page component
 * Renders the Clerk SignUp component with proper routing
 */
export function SignUpPage() {
  return <SignUp redirectUrl="/" />;
}

export default SignUpPage;
