import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserButton } from '../user-button';

// Mock Clerk's UserButton component
vi.mock('@clerk/clerk-react', () => ({
  UserButton: vi.fn(({ appearance, showName, afterSignOutUrl }) => (
    <div data-testid="clerk-userbutton">
      <div data-testid="show-name">{showName ? 'true' : 'false'}</div>
      <div data-testid="after-signout-url">{afterSignOutUrl}</div>
      <div data-testid="appearance">{JSON.stringify(appearance)}</div>
    </div>
  )),
}));

describe('UserButton Component', () => {
  it('renders Clerk UserButton component with default props', () => {
    render(<UserButton />);
    
    expect(screen.getByTestId('clerk-userbutton')).toBeInTheDocument();
    expect(screen.getByTestId('show-name')).toHaveTextContent('false');
    expect(screen.getByTestId('after-signout-url')).toHaveTextContent('/sign-in');
  });

  it('renders with showName enabled', () => {
    render(<UserButton showName={true} />);
    
    expect(screen.getByTestId('show-name')).toHaveTextContent('true');
  });

  it('applies custom className', () => {
    const customClass = 'custom-userbutton-class';
    render(<UserButton className={customClass} />);
    
    const container = screen.getByTestId('clerk-userbutton').parentElement;
    expect(container).toHaveClass('flex', 'items-center', customClass);
  });

  it('has proper styling structure', () => {
    render(<UserButton />);
    
    const container = screen.getByTestId('clerk-userbutton').parentElement;
    expect(container).toHaveClass('flex', 'items-center');
  });

  it('configures Clerk appearance correctly', () => {
    render(<UserButton />);
    
    const appearanceElement = screen.getByTestId('appearance');
    const appearance = JSON.parse(appearanceElement.textContent || '{}');
    
    expect(appearance.elements).toBeDefined();
    expect(appearance.elements.avatarBox).toBe('w-8 h-8');
    expect(appearance.elements.userButtonPopoverCard).toContain('shadow-lg');
    expect(appearance.elements.userButtonPopoverFooter).toBe('hidden');
  });
});