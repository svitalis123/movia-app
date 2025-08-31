import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

interface SignInProps {
  redirectUrl?: string;
  className?: string;
}

/**
 * Sign-in component using Clerk's SignIn component
 * Provides a complete sign-in flow with customizable styling
 */
export function SignIn({ redirectUrl = '/', className }: SignInProps) {
  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${className || ''}`}>
      <div className="w-full max-w-md">
        <ClerkSignIn
          redirectUrl={redirectUrl}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full shadow-xl border-0 bg-white rounded-lg',
              headerTitle: 'text-2xl font-bold text-gray-900 text-center',
              headerSubtitle: 'text-gray-600 text-center mt-2',
              socialButtonsBlockButton: 'w-full border border-gray-300 hover:bg-gray-50',
              formFieldInput: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              formButtonPrimary: 'w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
              footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
            },
          }}
        />
      </div>
    </div>
  );
}

export default SignIn;