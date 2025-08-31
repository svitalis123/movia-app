import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  ErrorMessage, 
  InlineErrorMessage, 
  EmptyState, 
  NetworkError, 
  APIError 
} from '../error-message';

describe('ErrorMessage', () => {
  it('renders with basic message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with title and message', () => {
    render(<ErrorMessage title="Error" message="Something went wrong" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders error variant by default', () => {
    render(<ErrorMessage message="Error message" />);
    
    const container = document.querySelector('.bg-destructive\\/10');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('border-destructive/20', 'text-destructive-foreground');
  });

  it('renders warning variant', () => {
    render(<ErrorMessage message="Warning message" variant="warning" />);
    
    const container = document.querySelector('.bg-yellow-50');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('border-yellow-200', 'text-yellow-800');
  });

  it('renders info variant', () => {
    render(<ErrorMessage message="Info message" variant="info" />);
    
    const container = document.querySelector('.bg-blue-50');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('border-blue-200', 'text-blue-800');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<ErrorMessage message="Test" size="small" />);
    
    let container = document.querySelector('.p-3.text-sm');
    expect(container).toBeInTheDocument();
    
    rerender(<ErrorMessage message="Test" size="large" />);
    container = document.querySelector('.p-6.text-base');
    expect(container).toBeInTheDocument();
  });

  it('shows icon by default', () => {
    render(<ErrorMessage message="Error with icon" />);
    
    // Should render XCircle icon for error variant
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<ErrorMessage message="Error without icon" showIcon={false} />);
    
    const icon = document.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders dismiss button when dismissible', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Error" dismissible onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<ErrorMessage message="Error" className="custom-error-class" />);
    
    const container = document.querySelector('.custom-error-class');
    expect(container).toBeInTheDocument();
  });

  it('renders with all props combined', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    
    render(
      <ErrorMessage
        title="Custom Error"
        message="This is a custom error message"
        variant="warning"
        size="large"
        dismissible
        onDismiss={onDismiss}
        onRetry={onRetry}
        className="custom-class"
      />
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('This is a custom error message')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

describe('InlineErrorMessage', () => {
  it('renders inline error message', () => {
    render(<InlineErrorMessage message="Field is required" />);
    
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<InlineErrorMessage message="Validation error" />);
    
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineErrorMessage message="Error" className="custom-inline-class" />);
    
    const container = screen.getByText('Error').closest('div');
    expect(container).toHaveClass('custom-inline-class');
  });

  it('has proper styling for inline display', () => {
    render(<InlineErrorMessage message="Inline error" />);
    
    const container = screen.getByText('Inline error').closest('div');
    expect(container).toHaveClass('flex', 'items-center', 'gap-1', 'text-destructive', 'text-sm');
  });
});

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText("There's nothing to show here yet.")).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <EmptyState
        title="No movies found"
        message="Try adjusting your search criteria"
      />
    );
    
    expect(screen.getByText('No movies found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const action = <button>Browse Movies</button>;
    render(<EmptyState action={action} />);
    
    expect(screen.getByText('Browse Movies')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const CustomIcon = ({ className }: { className?: string }) => (
      <div className={className} data-testid="custom-icon">Custom Icon</div>
    );
    
    render(<EmptyState icon={CustomIcon} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState className="custom-empty-class" />);
    
    const container = screen.getByText('No data available').closest('div');
    expect(container).toHaveClass('custom-empty-class');
  });

  it('has proper styling for centered layout', () => {
    render(<EmptyState />);
    
    const container = screen.getByText('No data available').closest('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'p-8', 'text-center');
  });
});

describe('NetworkError', () => {
  it('renders network error message', () => {
    render(<NetworkError />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
  });

  it('renders with retry button', () => {
    const onRetry = vi.fn();
    render(<NetworkError onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<NetworkError className="custom-network-class" />);
    
    const container = document.querySelector('.custom-network-class');
    expect(container).toBeInTheDocument();
  });
});

describe('APIError', () => {
  it('renders API error with generic message', () => {
    const error = { message: 'API request failed' };
    render(<APIError error={error} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('API request failed')).toBeInTheDocument();
  });

  it('renders 404 error message', () => {
    const error = { message: 'Not found', status: 404 };
    render(<APIError error={error} />);
    
    expect(screen.getByText('Error (404)')).toBeInTheDocument();
    expect(screen.getByText('The requested resource was not found.')).toBeInTheDocument();
  });

  it('renders 500 error message', () => {
    const error = { message: 'Internal server error', status: 500 };
    render(<APIError error={error} />);
    
    expect(screen.getByText('Error (500)')).toBeInTheDocument();
    expect(screen.getByText('Server error occurred. Please try again later.')).toBeInTheDocument();
  });

  it('renders 429 error message', () => {
    const error = { message: 'Too many requests', status: 429 };
    render(<APIError error={error} />);
    
    expect(screen.getByText('Error (429)')).toBeInTheDocument();
    expect(screen.getByText('Too many requests. Please wait a moment and try again.')).toBeInTheDocument();
  });

  it('renders with retry button', () => {
    const error = { message: 'API error' };
    const onRetry = vi.fn();
    
    render(<APIError error={error} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('handles error without message', () => {
    const error = { status: 400 };
    render(<APIError error={error} />);
    
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const error = { message: 'API error' };
    render(<APIError error={error} className="custom-api-class" />);
    
    const container = document.querySelector('.custom-api-class');
    expect(container).toBeInTheDocument();
  });
});