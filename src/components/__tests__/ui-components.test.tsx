import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { ImageWithFallback } from '../ui/image-with-fallback';

describe('UI Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      // Should render without crashing
    });

    it('renders with message', () => {
      render(<LoadingSpinner message="Loading movies..." />);
      expect(screen.getByText('Loading movies...')).toBeInTheDocument();
    });

    it('renders in fullscreen mode', () => {
      render(<LoadingSpinner fullScreen message="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('ErrorMessage', () => {
    it('renders error message', () => {
      render(<ErrorMessage message="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(<ErrorMessage title="Error" message="Something went wrong" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const onRetry = () => {};
      render(<ErrorMessage message="Error" onRetry={onRetry} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('ImageWithFallback', () => {
    it('renders with src', () => {
      render(<ImageWithFallback src="test.jpg" alt="Test image" />);
      // Should render without crashing
    });

    it('renders with null src', () => {
      render(<ImageWithFallback src={null} alt="Test image" />);
      // Should render without crashing
    });

    it('renders with fallback', () => {
      render(
        <ImageWithFallback
          src="invalid.jpg"
          alt="Test image"
          fallbackSrc="fallback.jpg"
        />
      );
      // Should render without crashing
    });
  });
});
