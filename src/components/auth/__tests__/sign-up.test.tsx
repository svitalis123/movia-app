import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignUp } from '../sign-up';

// Mock Clerk's SignUp component
vi.mock('@clerk/clerk-react', () => ({
  SignUp: vi.fn(({ redirectUrl, routing, path, signInUrl, appearance }) => (
    <div data-testid="clerk-signup">
      <div data-testid="redirect-url">{redirectUrl}</div>
      <div data-testid="routing">{routing}</div>
      <div data-testid="path">{path}</div>
      <div data-testid="signin-url">{signInUrl}</div>
      <div data-testid="appearance">{JSON.stringify(appearance)}</div>
    </div>
  )),
}));

describe('SignUp Component', () => {
  it('renders Clerk SignUp component with default props', () => {
    render(<SignUp />);

    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-url')).toHaveTextContent('/');
    expect(screen.getByTestId('routing')).toHaveTextContent('path');
    expect(screen.getByTestId('path')).toHaveTextContent('/sign-up');
    expect(screen.getByTestId('signin-url')).toHaveTextContent('/sign-in');
  });

  it('renders with custom redirect URL', () => {
    const customRedirectUrl = '/welcome';
    render(<SignUp redirectUrl={customRedirectUrl} />);

    expect(screen.getByTestId('redirect-url')).toHaveTextContent(
      customRedirectUrl
    );
  });

  it('applies custom className', () => {
    const customClass = 'custom-signup-class';
    render(<SignUp className={customClass} />);

    const container =
      screen.getByTestId('clerk-signup').parentElement?.parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('has proper styling structure', () => {
    render(<SignUp />);

    const container =
      screen.getByTestId('clerk-signup').parentElement?.parentElement;
    expect(container).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',
      'bg-gray-50'
    );

    const wrapper = screen.getByTestId('clerk-signup').parentElement;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });

  it('configures Clerk appearance correctly', () => {
    render(<SignUp />);

    const appearanceElement = screen.getByTestId('appearance');
    const appearance = JSON.parse(appearanceElement.textContent || '{}');

    expect(appearance.elements).toBeDefined();
    expect(appearance.elements.rootBox).toBe('w-full');
    expect(appearance.elements.card).toContain('shadow-xl');
    expect(appearance.elements.formButtonPrimary).toContain('bg-blue-600');
  });
});
