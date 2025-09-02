import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Clerk authentication provider wrapper
 * Configures Clerk with the application settings for development
 */
export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#ffffff',
          colorInputBackground: '#f9fafb',
          colorInputText: '#111827',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg border border-gray-200',
          headerTitle: 'text-gray-900 font-semibold',
          headerSubtitle: 'text-gray-600',
        },
      }}
      localization={{
        signIn: {
          start: {
            title: 'Sign in to Movie App',
            subtitle: 'Welcome back! Please sign in to continue',
          },
        },
        signUp: {
          start: {
            title: 'Create your account',
            subtitle: 'Welcome! Please fill in the details to get started',
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export default ClerkAuthProvider;
