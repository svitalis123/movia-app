import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieList, MovieListSkeleton } from '../movie-list';
import type { Movie } from '../../../lib/types';

// Mock the MovieCard component
vi.mock('../movie-card', () => ({
  MovieCard: ({
    movie,
    onClick,
  }: {
    movie: Movie;
    onClick: (id: number) => void;
  }) => (
    <div
      data-testid={`movie-card-${movie.id}`}
      onClick={() => onClick(movie.id)}
    >
      {movie.title}
    </div>
  ),
  MovieCardSkeleton: () => (
    <div data-testid="movie-card-skeleton">Loading...</div>
  ),
}));

// Mock the ErrorMessage component
vi.mock('../../ui/error-message', () => ({
  ErrorMessage: ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry: () => void;
  }) => (
    <div data-testid="error-message">
      <span>{message}</span>
      <button onClick={onRetry} data-testid="retry-button">
        Retry
      </button>
    </div>
  ),
}));

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Movie 1',
    overview: 'Overview 1',
    poster_path: '/poster1.jpg',
    backdrop_path: '/backdrop1.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    vote_count: 1000,
    genre_ids: [28, 12],
  },
  {
    id: 2,
    title: 'Movie 2',
    overview: 'Overview 2',
    poster_path: '/poster2.jpg',
    backdrop_path: '/backdrop2.jpg',
    release_date: '2023-02-01',
    vote_average: 7.5,
    vote_count: 800,
    genre_ids: [35, 18],
  },
  {
    id: 3,
    title: 'Movie 3',
    overview: 'Overview 3',
    poster_path: '/poster3.jpg',
    backdrop_path: '/backdrop3.jpg',
    release_date: '2023-03-01',
    vote_average: 9.0,
    vote_count: 1200,
    genre_ids: [16, 10751],
  },
];

const mockProps = {
  movies: mockMovies,
  loading: false,
  error: null,
  onMovieSelect: vi.fn(),
  onPageChange: vi.fn(),
  currentPage: 1,
  totalPages: 5,
};

describe('MovieList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders movies correctly', () => {
    render(<MovieList {...mockProps} />);

    expect(screen.getByTestId('movie-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('movie-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('movie-card-3')).toBeInTheDocument();
    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Movie 3')).toBeInTheDocument();
  });

  it('calls onMovieSelect when a movie is clicked', () => {
    render(<MovieList {...mockProps} />);

    fireEvent.click(screen.getByTestId('movie-card-1'));
    expect(mockProps.onMovieSelect).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId('movie-card-2'));
    expect(mockProps.onMovieSelect).toHaveBeenCalledWith(2);
  });

  it('renders loading skeletons when loading', () => {
    render(<MovieList {...mockProps} loading={true} />);

    const skeletons = screen.getAllByTestId('movie-card-skeleton');
    expect(skeletons).toHaveLength(20);
    expect(screen.queryByText('Movie 1')).not.toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    const errorMessage = 'Failed to load movies';
    render(<MovieList {...mockProps} error={errorMessage} />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Movie 1')).not.toBeInTheDocument();
  });

  it('calls onPageChange when retry button is clicked in error state', () => {
    const errorMessage = 'Failed to load movies';
    render(<MovieList {...mockProps} error={errorMessage} />);

    fireEvent.click(screen.getByTestId('retry-button'));
    expect(mockProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('renders empty state when no movies are provided', () => {
    render(<MovieList {...mockProps} movies={[]} />);

    expect(screen.getByText('No movies found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search or browse popular movies.')
    ).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    const customMessage = 'Custom empty message';
    render(
      <MovieList {...mockProps} movies={[]} emptyMessage={customMessage} />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders pagination controls when there are multiple pages', () => {
    render(<MovieList {...mockProps} />);

    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();

    // Should show page numbers
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
  });

  it('does not render pagination when there is only one page', () => {
    render(<MovieList {...mockProps} totalPages={1} />);

    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
    expect(screen.queryByText('Page 1 of 1')).not.toBeInTheDocument();
  });

  it('does not render pagination when loading', () => {
    render(<MovieList {...mockProps} loading={true} />);

    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
  });

  it('handles previous page navigation', () => {
    render(<MovieList {...mockProps} currentPage={3} />);

    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles next page navigation', () => {
    render(<MovieList {...mockProps} currentPage={3} />);

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(mockProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous button on first page', () => {
    render(<MovieList {...mockProps} currentPage={1} />);

    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<MovieList {...mockProps} currentPage={5} totalPages={5} />);

    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('handles page number clicks', () => {
    render(<MovieList {...mockProps} currentPage={1} />);

    fireEvent.click(screen.getByLabelText('Go to page 3'));
    expect(mockProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('highlights current page', () => {
    render(<MovieList {...mockProps} currentPage={2} />);

    const currentPageButton = screen.getByLabelText('Go to page 2');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('renders correct pagination for large page counts', () => {
    render(<MovieList {...mockProps} currentPage={10} totalPages={20} />);

    // Should show first page, last page, and current page area
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 20')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 10')).toBeInTheDocument();

    // Should not show all pages (would be too many)
    expect(screen.queryByLabelText('Go to page 15')).not.toBeInTheDocument();
  });

  it('applies grid view mode correctly', () => {
    render(<MovieList {...mockProps} viewMode="grid" />);

    const gridContainer = document.querySelector('.grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('applies list view mode correctly', () => {
    render(<MovieList {...mockProps} viewMode="list" />);

    const listContainer = document.querySelector('.grid-cols-1');
    expect(listContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MovieList {...mockProps} className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('does not call onPageChange for invalid page numbers', () => {
    render(<MovieList {...mockProps} currentPage={1} />);

    // Try to go to page 0 (invalid)
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(mockProps.onPageChange).not.toHaveBeenCalledWith(0);
  });

  it('does not call onPageChange when clicking current page', () => {
    render(<MovieList {...mockProps} currentPage={2} />);

    fireEvent.click(screen.getByLabelText('Go to page 2'));
    expect(mockProps.onPageChange).not.toHaveBeenCalledWith(2);
  });
});

describe('MovieListSkeleton', () => {
  it('renders skeleton with grid view mode', () => {
    render(<MovieListSkeleton viewMode="grid" />);

    const skeletons = screen.getAllByTestId('movie-card-skeleton');
    expect(skeletons).toHaveLength(20);

    const gridContainer = document.querySelector('.grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders skeleton with list view mode', () => {
    render(<MovieListSkeleton viewMode="list" />);

    const skeletons = screen.getAllByTestId('movie-card-skeleton');
    expect(skeletons).toHaveLength(20);

    const listContainer = document.querySelector('.grid-cols-1');
    expect(listContainer).toBeInTheDocument();
  });

  it('renders pagination skeleton', () => {
    render(<MovieListSkeleton />);

    const paginationSkeletons = document.querySelectorAll('.animate-pulse');
    expect(paginationSkeletons.length).toBeGreaterThan(5); // Should have multiple skeleton elements
  });

  it('applies custom className', () => {
    render(<MovieListSkeleton className="custom-skeleton-class" />);

    const container = document.querySelector('.custom-skeleton-class');
    expect(container).toBeInTheDocument();
  });
});
