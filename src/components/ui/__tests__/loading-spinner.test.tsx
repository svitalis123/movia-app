import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, InlineSpinner, LoadingOverlay } from '../loading-spinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Should render the spinner icon
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8', 'w-8', 'text-primary');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="small" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="secondary" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('text-muted-foreground');
  });

  it('renders with inherit color', () => {
    render(<LoadingSpinner color="inherit" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('text-current');
  });

  it('renders with message', () => {
    render(<LoadingSpinner message="Loading movies..." />);
    
    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
    
    const messageElement = screen.getByText('Loading movies...');
    expect(messageElement).toHaveClass('text-sm', 'text-primary', 'text-center');
  });

  it('renders message with custom color', () => {
    render(<LoadingSpinner message="Loading..." color="secondary" />);
    
    const messageElement = screen.getByText('Loading...');
    expect(messageElement).toHaveClass('text-muted-foreground');
  });

  it('renders in fullscreen mode', () => {
    render(<LoadingSpinner fullScreen message="Loading application..." />);
    
    // Should render fullscreen overlay
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('z-50', 'flex', 'items-center', 'justify-center', 'bg-background/80', 'backdrop-blur-sm');
    
    // Should render card container
    const card = overlay?.querySelector('.bg-background.border.rounded-lg.p-6.shadow-lg');
    expect(card).toBeInTheDocument();
    
    expect(screen.getByText('Loading application...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner-class" />);
    
    const container = document.querySelector('.custom-spinner-class');
    expect(container).toBeInTheDocument();
  });

  it('renders without message when not provided', () => {
    render(<LoadingSpinner />);
    
    // Should only render spinner, no text
    const container = document.querySelector('.flex.flex-col.items-center.justify-center.space-y-2');
    expect(container).toBeInTheDocument();
    
    const spinner = container?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Should not have any text content
    expect(container?.textContent).toBe('');
  });

  it('combines size and color props correctly', () => {
    render(<LoadingSpinner size="large" color="inherit" message="Custom loading..." />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12', 'text-current');
    
    const message = screen.getByText('Custom loading...');
    expect(message).toHaveClass('text-current');
  });
});

describe('InlineSpinner', () => {
  it('renders with default small size', () => {
    render(<InlineSpinner />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with medium size', () => {
    render(<InlineSpinner size="medium" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('applies custom className', () => {
    render(<InlineSpinner className="custom-inline-class" />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('custom-inline-class');
  });

  it('renders without container wrapper', () => {
    render(<InlineSpinner />);
    
    // Should render just the spinner icon, not wrapped in flex container
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Should not have flex container classes
    expect(spinner?.parentElement).not.toHaveClass('flex', 'flex-col');
  });
});

describe('LoadingOverlay', () => {
  it('renders overlay with default props', () => {
    render(<LoadingOverlay />);
    
    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass(
      'flex', 
      'items-center', 
      'justify-center', 
      'bg-background/50', 
      'backdrop-blur-sm', 
      'rounded-md'
    );
  });

  it('renders with custom message', () => {
    render(<LoadingOverlay message="Processing..." />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingOverlay className="custom-overlay-class" />);
    
    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).toHaveClass('custom-overlay-class');
  });

  it('contains LoadingSpinner component', () => {
    render(<LoadingOverlay message="Loading data..." />);
    
    // Should contain the spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Should contain the message
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders without message when not provided', () => {
    render(<LoadingOverlay />);
    
    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper positioning for overlay', () => {
    render(<LoadingOverlay />);
    
    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).toHaveClass('absolute', 'inset-0');
    expect(overlay).toHaveClass('flex', 'items-center', 'justify-center');
  });
});