import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute } from '../protected-route';

// Mock Clerk components
vi.mock('@clerk/clerk-react', () => ({
  SignedIn: vi.fn(({ children }) => <div data-testid="signed-in">{children}</div>),
  SignedOut: vi.fn(({ children }) => <div data-testid="signed-out">{children}</div>),
  RedirectToSignIn: vi.fn(({ redirectUrl }) => (
    <div data-testid="redirect-to-signin">
      <div data-testid="redirect-url">{redirectUrl}</div>
    </div>
  )),
}));

describe('ProtectedRoute Component', () => {
  it('renders children when user is signed in', () => {
    const testContent = 'Protected content';
    render(
      <ProtectedRoute>
        <div>{testContent}</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('signed-in')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('renders RedirectToSignIn when user is signed out and no fallback provided', () => {
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-to-signin')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-url')).toHaveTextContent('/sign-in');
  });

  it('renders custom fallback when user is signed out', () => {
    const fallbackContent = 'Please sign in to continue';
    render(
      <ProtectedRoute fallback={<div>{fallbackContent}</div>}>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByText(fallbackContent)).toBeInTheDocument();
    expect(screen.queryByTestId('redirect-to-signin')).not.toBeInTheDocument();
  });

  it('uses custom redirect URL', () => {
    const customRedirectTo = '/custom-login';
    render(
      <ProtectedRoute redirectTo={customRedirectTo}>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByTestId('redirect-url')).toHaveTextContent(customRedirectTo);
  });

  it('renders both SignedIn and SignedOut components', () => {
    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    
    // Both components should be rendered (Clerk handles the conditional logic)
    expect(screen.getByTestId('signed-in')).toBeInTheDocument();
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
  });
});