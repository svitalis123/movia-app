import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignIn } from '../sign-in';

// Mock Clerk's SignIn component
vi.mock('@clerk/clerk-react', () => ({
  SignIn: vi.fn(
    ({
      afterSignInUrl,
      forceRedirectUrl,
      routing,
      path,
      signUpUrl,
      appearance,
    }) => (
      <div data-testid="clerk-signin">
        <div data-testid="redirect-url">
          {afterSignInUrl || forceRedirectUrl}
        </div>
        <div data-testid="routing">{routing}</div>
        <div data-testid="path">{path}</div>
        <div data-testid="signup-url">{signUpUrl}</div>
        <div data-testid="appearance">{JSON.stringify(appearance)}</div>
      </div>
    )
  ),
}));

describe('SignIn Component', () => {
  it('renders Clerk SignIn component with default props', () => {
    render(<SignIn />);

    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-url')).toHaveTextContent('/');
    expect(screen.getByTestId('routing')).toHaveTextContent('path');
    expect(screen.getByTestId('path')).toHaveTextContent('/sign-in');
    expect(screen.getByTestId('signup-url')).toHaveTextContent('/sign-up');
  });

  it('renders with custom redirect URL', () => {
    const customRedirectUrl = '/dashboard';
    render(<SignIn redirectUrl={customRedirectUrl} />);

    expect(screen.getByTestId('redirect-url')).toHaveTextContent(
      customRedirectUrl
    );
  });

  it('applies custom className', () => {
    const customClass = 'custom-signin-class';
    render(<SignIn className={customClass} />);

    const container =
      screen.getByTestId('clerk-signin').parentElement?.parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('has proper styling structure', () => {
    render(<SignIn />);

    const container =
      screen.getByTestId('clerk-signin').parentElement?.parentElement;
    expect(container).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',
      'bg-gray-50'
    );

    const wrapper = screen.getByTestId('clerk-signin').parentElement;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });

  it('configures Clerk appearance correctly', () => {
    render(<SignIn />);

    const appearanceElement = screen.getByTestId('appearance');
    const appearance = JSON.parse(appearanceElement.textContent || '{}');

    expect(appearance.elements).toBeDefined();
    expect(appearance.elements.rootBox).toBe('w-full');
    expect(appearance.elements.card).toContain('shadow-xl');
    expect(appearance.elements.formButtonPrimary).toContain('bg-blue-600');
  });
});
