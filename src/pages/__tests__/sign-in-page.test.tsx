import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignInPage } from '../sign-in-page';

// Mock the SignIn component
vi.mock('../../components/auth', () => ({
  SignIn: vi.fn(({ redirectUrl }) => (
    <div data-testid="sign-in-component">
      <div data-testid="redirect-url">{redirectUrl}</div>
    </div>
  )),
}));

describe('SignInPage', () => {
  it('renders SignIn component with correct redirect URL', () => {
    render(<SignInPage />);
    
    expect(screen.getByTestId('sign-in-component')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-url')).toHaveTextContent('/');
  });
});