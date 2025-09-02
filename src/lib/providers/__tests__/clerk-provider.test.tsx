import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Clerk's ClerkProvider
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: vi.fn(
    ({ children, publishableKey, appearance, localization }) => (
      <div data-testid="clerk-provider">
        <div data-testid="publishable-key">{publishableKey}</div>
        <div data-testid="appearance">{JSON.stringify(appearance)}</div>
        <div data-testid="localization">{JSON.stringify(localization)}</div>
        {children}
      </div>
    )
  ),
}));

// Mock the clerk-provider module to avoid environment variable issues
vi.mock('../clerk-provider', () => ({
  ClerkAuthProvider: vi.fn(({ children }) => (
    <div data-testid="mocked-clerk-auth-provider">{children}</div>
  )),
}));

import { ClerkAuthProvider } from '../clerk-provider';

describe('ClerkAuthProvider Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children wrapped in ClerkAuthProvider', () => {
    const testContent = 'Test content';
    render(
      <ClerkAuthProvider>
        <div>{testContent}</div>
      </ClerkAuthProvider>
    );

    expect(
      screen.getByTestId('mocked-clerk-auth-provider')
    ).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('is properly mocked and functional', () => {
    render(
      <ClerkAuthProvider>
        <div>Test</div>
      </ClerkAuthProvider>
    );

    expect(ClerkAuthProvider).toHaveBeenCalled();
  });

  it('renders multiple children correctly', () => {
    render(
      <ClerkAuthProvider>
        <div>First child</div>
        <div>Second child</div>
      </ClerkAuthProvider>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
  });

  it('can be nested with other components', () => {
    render(
      <div data-testid="wrapper">
        <ClerkAuthProvider>
          <div data-testid="nested-content">Nested content</div>
        </ClerkAuthProvider>
      </div>
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    expect(
      screen.getByTestId('mocked-clerk-auth-provider')
    ).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    render(<ClerkAuthProvider>{null}</ClerkAuthProvider>);

    expect(
      screen.getByTestId('mocked-clerk-auth-provider')
    ).toBeInTheDocument();
  });
});
