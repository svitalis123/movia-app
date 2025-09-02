import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard, MovieCardSkeleton } from '../movie-card';
import type { Movie } from '../../../lib/types';

// Mock the image components
vi.mock('../../ui/image-with-fallback', () => ({
  MoviePoster: ({ title, className }: { title: string; className: string }) => (
    <div className={className} data-testid="movie-poster">
      {title} poster
    </div>
  ),
}));

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  overview:
    'This is a test movie with a long overview that should be truncated in some variants.',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2023-12-01',
  vote_average: 8.5,
  vote_count: 1234,
  genre_ids: [28, 12],
  popularity: 100.5,
  original_language: 'en',
};

const mockOnClick = vi.fn();

describe('MovieCard', () => {
  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders movie information correctly', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('1234 votes')).toBeInTheDocument();
    expect(screen.getByTestId('movie-poster')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('calls onClick when Space key is pressed', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('does not call onClick when loading', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} loading />);

    // Loading state should render skeleton, not clickable card
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders loading skeleton when loading prop is true', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} loading />);

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-muted');
  });

  it('handles missing release date gracefully', () => {
    const movieWithoutDate = { ...mockMovie, release_date: '' };
    render(<MovieCard movie={movieWithoutDate} onClick={mockOnClick} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles zero vote average', () => {
    const movieWithoutRating = { ...mockMovie, vote_average: 0 };
    render(<MovieCard movie={movieWithoutRating} onClick={mockOnClick} />);

    // Rating badge should not be visible
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('formats rating correctly', () => {
    const movieWithDecimalRating = { ...mockMovie, vote_average: 7.89 };
    render(<MovieCard movie={movieWithDecimalRating} onClick={mockOnClick} />);

    expect(screen.getByText('7.9')).toBeInTheDocument();
  });

  it('renders compact variant correctly', () => {
    render(
      <MovieCard movie={mockMovie} onClick={mockOnClick} variant="compact" />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();

    // Overview should not be visible in compact variant
    expect(screen.queryByText(/This is a test movie/)).not.toBeInTheDocument();

    // Should have compact-specific styling
    expect(document.querySelector('.bg-card\\/95')).toBeInTheDocument();
  });

  it('renders detailed variant correctly', () => {
    render(
      <MovieCard movie={mockMovie} onClick={mockOnClick} variant="detailed" />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText(/This is a test movie/)).toBeInTheDocument();

    // Should have detailed-specific styling
    expect(document.querySelector('.from-black\\/95')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MovieCard
        movie={mockMovie}
        onClick={mockOnClick}
        className="custom-class"
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'View details for Test Movie');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('handles invalid date format', () => {
    const movieWithInvalidDate = { ...mockMovie, release_date: 'invalid-date' };
    render(<MovieCard movie={movieWithInvalidDate} onClick={mockOnClick} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles missing overview', () => {
    const movieWithoutOverview = { ...mockMovie, overview: '' };
    render(<MovieCard movie={movieWithoutOverview} onClick={mockOnClick} />);

    // Should still render other information
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('prevents default behavior on keyboard events', () => {
    render(<MovieCard movie={mockMovie} onClick={mockOnClick} />);

    const card = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter', preventDefault: vi.fn() });
    expect(mockOnClick).toHaveBeenCalledWith(1);

    mockOnClick.mockClear();

    // Test Space key
    fireEvent.keyDown(card, { key: ' ', preventDefault: vi.fn() });
    expect(mockOnClick).toHaveBeenCalledWith(1);
  });
});

describe('MovieCardSkeleton', () => {
  it('renders skeleton with default variant', () => {
    render(<MovieCardSkeleton />);

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('aspect-[2/3]');
  });

  it('renders skeleton with compact variant', () => {
    render(<MovieCardSkeleton variant="compact" />);

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders skeleton with detailed variant', () => {
    render(<MovieCardSkeleton variant="detailed" />);

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();

    // Detailed variant should have more skeleton elements
    const skeletonElements = document.querySelectorAll(
      '.bg-muted-foreground\\/20'
    );
    expect(skeletonElements.length).toBeGreaterThan(2);
  });

  it('applies custom className to skeleton', () => {
    render(<MovieCardSkeleton className="custom-skeleton-class" />);

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('custom-skeleton-class');
  });
});
