import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieDetails, MovieDetailsSkeleton } from '../movie-details';
import type { MovieDetails as MovieDetailsType } from '../../../lib/types';
import { beforeEach } from 'node:test';

// Mock the image components
vi.mock('../../ui/image-with-fallback', () => ({
  MovieBackdrop: ({
    title,
    className,
  }: {
    title: string;
    className: string;
  }) => (
    <div className={className} data-testid="movie-backdrop">
      {title} backdrop
    </div>
  ),
  MoviePoster: ({ title, className }: { title: string; className: string }) => (
    <div className={className} data-testid="movie-poster">
      {title} poster
    </div>
  ),
  ProfileImage: ({ name, className }: { name: string; className: string }) => (
    <div
      className={className}
      data-testid={`profile-${name.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {name} profile
    </div>
  ),
}));

// Mock the UI components
vi.mock('../../ui/loading-spinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

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

const mockMovieDetails: MovieDetailsType = {
  id: 1,
  title: 'Test Movie',
  overview:
    'This is a comprehensive test movie with all the details we need to test.',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2023-12-01',
  vote_average: 8.5,
  vote_count: 1234,
  genre_ids: [28, 12],
  runtime: 142,
  genres: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
  ],
  production_companies: [
    {
      id: 1,
      name: 'Test Studios',
      logo_path: '/test-logo.jpg',
      origin_country: 'US',
    },
  ],
  cast: [
    {
      id: 1,
      name: 'John Doe',
      character: 'Hero',
      profile_path: '/john-doe.jpg',
      order: 0,
    },
    {
      id: 2,
      name: 'Jane Smith',
      character: 'Heroine',
      profile_path: '/jane-smith.jpg',
      order: 1,
    },
  ],
  crew: [
    {
      id: 3,
      name: 'Director Name',
      job: 'Director',
      department: 'Directing',
      profile_path: '/director.jpg',
    },
    {
      id: 4,
      name: 'Producer Name',
      job: 'Producer',
      department: 'Production',
      profile_path: '/producer.jpg',
    },
  ],
  budget: 50000000,
  revenue: 150000000,
  tagline: 'The ultimate test movie',
  homepage: 'https://testmovie.com',
  status: 'Released',
  production_countries: [{ iso_3166_1: 'US', name: 'United States' }],
  original_language: 'en',
};

const mockProps = {
  movie: mockMovieDetails,
  loading: false,
  error: null,
  onBack: vi.fn(),
  onRelatedMovieClick: vi.fn(),
};

describe('MovieDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders movie details correctly', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('The ultimate test movie')).toBeInTheDocument();
    expect(
      screen.getByText(/This is a comprehensive test movie/)
    ).toBeInTheDocument();
    expect(screen.getByTestId('movie-poster')).toBeInTheDocument();
    expect(screen.getByTestId('movie-backdrop')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<MovieDetails {...mockProps} />);

    const backButton = screen.getByLabelText('Go back to movie list');
    fireEvent.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('displays rating information correctly', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('(1234 votes)')).toBeInTheDocument();
  });

  it('displays release date correctly', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('December 1, 2023')).toBeInTheDocument();
  });

  it('displays runtime correctly', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('2h 22m')).toBeInTheDocument();
  });

  it('displays genres correctly', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();
  });

  it('displays director information', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('Directed by:')).toBeInTheDocument();
    expect(screen.getAllByText('Director Name')).toHaveLength(2); // Appears in director section and crew section
  });

  it('displays financial information correctly', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('$50,000,000')).toBeInTheDocument(); // Budget
    expect(screen.getByText('$150,000,000')).toBeInTheDocument(); // Revenue
    expect(screen.getByText('$100,000,000')).toBeInTheDocument(); // Profit
  });

  it('displays production companies', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('Test Studios')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  it('displays cast members', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Heroine')).toBeInTheDocument();
  });

  it('displays crew members', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('Producer Name')).toBeInTheDocument();
  });

  it('displays additional information', () => {
    render(<MovieDetails {...mockProps} />);

    expect(screen.getByText('Released')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument(); // Should be lowercase
    expect(screen.getByText('Visit Website')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(<MovieDetails {...mockProps} loading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading movie details...')).toBeInTheDocument();
    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to load movie details';
    render(<MovieDetails {...mockProps} error={errorMessage} />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  it('calls onBack when retry is clicked in error state', () => {
    const errorMessage = 'Failed to load movie details';
    render(<MovieDetails {...mockProps} error={errorMessage} />);

    fireEvent.click(screen.getByTestId('retry-button'));
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('renders error state when movie is null', () => {
    render(<MovieDetails {...mockProps} movie={null} />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Movie not found')).toBeInTheDocument();
  });

  it('handles missing optional data gracefully', () => {
    const minimalMovie = {
      ...mockMovieDetails,
      tagline: undefined,
      overview: '',
      backdrop_path: null,
      genres: [],
      cast: [],
      crew: [],
      production_companies: [],
      budget: 0,
      revenue: 0,
      homepage: undefined,
      status: undefined,
      production_countries: [],
    };

    render(<MovieDetails {...mockProps} movie={minimalMovie} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(3); // Budget, Revenue, and Status should show N/A
  });

  it('formats runtime correctly for movies under 1 hour', () => {
    const shortMovie = { ...mockMovieDetails, runtime: 45 };
    render(<MovieDetails {...mockProps} movie={shortMovie} />);

    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('handles zero runtime', () => {
    const noRuntimeMovie = { ...mockMovieDetails, runtime: 0 };
    render(<MovieDetails {...mockProps} movie={noRuntimeMovie} />);

    // Runtime section should not be rendered when runtime is 0
    expect(screen.queryByText('0m')).not.toBeInTheDocument();
    // Should still show other information
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('handles zero vote average', () => {
    const noRatingMovie = { ...mockMovieDetails, vote_average: 0 };
    render(<MovieDetails {...mockProps} movie={noRatingMovie} />);

    // Rating section should not be visible
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('shows profit in green when positive', () => {
    render(<MovieDetails {...mockProps} />);

    const profitElement = screen.getByText('$100,000,000');
    expect(profitElement).toHaveClass('text-green-600');
  });

  it('shows loss in red when negative', () => {
    const lossMovie = {
      ...mockMovieDetails,
      budget: 200000000,
      revenue: 50000000,
    };
    render(<MovieDetails {...mockProps} movie={lossMovie} />);

    const lossElement = screen.getByText('-$150,000,000');
    expect(lossElement).toHaveClass('text-red-600');
  });

  it('applies custom className', () => {
    render(<MovieDetails {...mockProps} className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('opens homepage link in new tab', () => {
    render(<MovieDetails {...mockProps} />);

    const homepageLink = screen.getByText('Visit Website');
    expect(homepageLink).toHaveAttribute('href', 'https://testmovie.com');
    expect(homepageLink).toHaveAttribute('target', '_blank');
    expect(homepageLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('MovieDetailsSkeleton', () => {
  it('renders skeleton correctly', () => {
    render(<MovieDetailsSkeleton />);

    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    render(<MovieDetailsSkeleton className="custom-skeleton-class" />);

    const container = document.querySelector('.custom-skeleton-class');
    expect(container).toBeInTheDocument();
  });

  it('renders all skeleton sections', () => {
    render(<MovieDetailsSkeleton />);

    // Should have multiple skeleton sections
    const skeletonElements = document.querySelectorAll('.bg-muted');
    expect(skeletonElements.length).toBeGreaterThan(5);
  });
});
