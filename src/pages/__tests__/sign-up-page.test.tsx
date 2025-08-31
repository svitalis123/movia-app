import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignUpPage } from '../sign-up-page';

// Mock the SignUp component
vi.mock('../../components/auth', () => ({
  SignUp: vi.fn(({ redirectUrl }) => (
    <div data-testid="sign-up-component">
      <div data-testid="redirect-url">{redirectUrl}</div>
    </div>
  )),
}));

describe('SignUpPage', () => {
  it('renders SignUp component with correct redirect URL', () => {
    render(<SignUpPage />);
    
    expect(screen.getByTestId('sign-up-component')).toBeInTheDocument();
    expect(screen.getByTestId('redirect-url')).toHaveTextContent('/');
  });
});