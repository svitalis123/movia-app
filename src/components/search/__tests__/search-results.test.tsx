import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SearchResults } from '../search-results';
import { useMovieStore } from '../../../lib/stores/movie-store';
import { useUIStore, useUIActions } from '../../../lib/stores/ui-store';

// Mock the stores
vi.mock('../../../lib/stores/movie-store');
vi.mock('../../../lib/stores/ui-store', () => ({
  useUIStore: vi.fn(),
  useUIActions: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

// Mock components
vi.mock('../search-input', () => ({
  SearchInput: ({ onSearch, onClear, value, loading }: unknown) => (
    <div data-testid="search-input">
      <input
        data-testid="search-input-field"
        value={value}
        onChange={(e) => onSearch?.(e.target.value)}
        disabled={loading}
      />
      <button data-testid="clear-button" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
}));

vi.mock('../../movie/movie-list', () => ({
  MovieList: ({
    movies,
    onMovieSelect,
    onPageChange,
    currentPage,
    totalPages,
  }: unknown) => (
    <div data-testid="movie-list">
      <div data-testid="movie-count">{movies.length} movies</div>
      <div data-testid="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      {movies.map((movie: unknown) => (
        <button
          key={movie.id}
          data-testid={`movie-${movie.id}`}
          onClick={() => onMovieSelect(movie.id)}
        >
          {movie.title}
        </button>
      ))}
      <button
        data-testid="page-change"
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next Page
      </button>
    </div>
  ),
}));

vi.mock('../../ui/loading-spinner', () => ({
  LoadingSpinner: ({ message }: unknown) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

vi.mock('../../ui/error-message', () => ({
  ErrorMessage: ({ message, onRetry }: unknown) => (
    <div data-testid="error-message">
      <span>{message}</span>
      <button data-testid="retry-button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ),
}));

const mockMovies = [
  {
    id: 1,
    title: 'Test Movie 1',
    overview: 'Test overview 1',
    poster_path: '/test1.jpg',
    backdrop_path: '/backdrop1.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    vote_count: 1000,
    genre_ids: [1, 2],
    popularity: 100,
    original_language: 'en',
  },
  {
    id: 2,
    title: 'Test Movie 2',
    overview: 'Test overview 2',
    poster_path: '/test2.jpg',
    backdrop_path: '/backdrop2.jpg',
    release_date: '2022-01-01',
    vote_average: 7.5,
    vote_count: 800,
    genre_ids: [2, 3],
    popularity: 80,
    original_language: 'en',
  },
];

describe('SearchResults', () => {
  const mockSearchMovies = vi.fn();
  const mockClearSearch = vi.fn();
  const mockGoToNextPage = vi.fn();
  const mockGoToPreviousPage = vi.fn();
  const mockGoToPage = vi.fn();
  const mockSetSearchQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('q');
    mockSearchParams.delete('page');

    // Mock movie store
    (useMovieStore as unknown).mockReturnValue({
      searchResults: mockMovies,
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalResults: 100,
        hasNextPage: true,
        hasPreviousPage: false,
      },
      searchMovies: mockSearchMovies,
      clearSearch: mockClearSearch,
      goToNextPage: mockGoToNextPage,
      goToPreviousPage: mockGoToPreviousPage,
      goToPage: mockGoToPage,
    });

    // Mock UI store
    (useUIStore as unknown).mockReturnValue({
      searchQuery: '',
      viewMode: 'grid',
    });

    // Mock UI actions
    (useUIActions as unknown).mockReturnValue({
      setSearchQuery: mockSetSearchQuery,
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders search input and empty state when no query', () => {
    renderWithRouter(<SearchResults />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByText('Search for Movies')).toBeInTheDocument();
    expect(screen.getByText('Browse Popular Movies')).toBeInTheDocument();
  });

  it('displays search results when query is present', () => {
    mockSearchParams.set('q', 'test movie');

    renderWithRouter(<SearchResults />);

    expect(screen.getByTestId('movie-list')).toBeInTheDocument();
    expect(screen.getByText('2 movies')).toBeInTheDocument();
    expect(screen.getByTestId('movie-1')).toBeInTheDocument();
    expect(screen.getByTestId('movie-2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useMovieStore as unknown).mockReturnValue({
      searchResults: [],
      loading: true,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      searchMovies: mockSearchMovies,
      clearSearch: mockClearSearch,
      goToNextPage: mockGoToNextPage,
      goToPreviousPage: mockGoToPreviousPage,
      goToPage: mockGoToPage,
    });

    renderWithRouter(<SearchResults />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Searching movies...')).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    const user = userEvent.setup();

    (useMovieStore as unknown).mockReturnValue({
      searchResults: [],
      loading: false,
      error: 'Failed to search movies',
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      searchMovies: mockSearchMovies,
      clearSearch: mockClearSearch,
      goToNextPage: mockGoToNextPage,
      goToPreviousPage: mockGoToPreviousPage,
      goToPage: mockGoToPage,
    });

    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Failed to search movies')).toBeInTheDocument();

    await user.click(screen.getByTestId('retry-button'));
    expect(mockSearchMovies).toHaveBeenCalledWith('test', 1);
  });

  it('shows no results state when search returns empty', () => {
    (useMovieStore as unknown).mockReturnValue({
      searchResults: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      searchMovies: mockSearchMovies,
      clearSearch: mockClearSearch,
      goToNextPage: mockGoToNextPage,
      goToPreviousPage: mockGoToPreviousPage,
      goToPage: mockGoToPage,
    });

    mockSearchParams.set('q', 'nonexistent movie');

    renderWithRouter(<SearchResults />);

    expect(screen.getByText('No movies found')).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't find any movies matching/)
    ).toBeInTheDocument();
    expect(screen.getByText('Browse Popular Movies')).toBeInTheDocument();
  });

  it('handles movie selection', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    await user.click(screen.getByTestId('movie-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/movie/1');
  });

  it('handles search input changes', async () => {
    const user = userEvent.setup();

    renderWithRouter(<SearchResults />);

    const searchInput = screen.getByTestId('search-input-field');
    await user.type(searchInput, 'new search');

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('handles search clear', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    await user.click(screen.getByTestId('clear-button'));

    expect(mockSetSearchParams).toHaveBeenCalledWith({});
    expect(mockClearSearch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles page changes', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    await user.click(screen.getByTestId('page-change'));
    expect(mockSetSearchParams).toHaveBeenCalledWith({ q: 'test', page: '2' });
  });

  it('shows and hides filters panel', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    const filterButton = screen.getByText('Filters');
    await user.click(filterButton);

    expect(screen.getByText('Sort By')).toBeInTheDocument();
    expect(screen.getByText('Release Year')).toBeInTheDocument();
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
  });

  it('applies sorting filters', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    // Open filters
    await user.click(screen.getByText('Filters'));

    // Change sort order
    const sortSelect = screen.getByDisplayValue('Popularity (High to Low)');
    await user.selectOptions(sortSelect, 'vote_average.desc');

    // Movies should be reordered (Test Movie 1 has higher rating)
    const movieList = screen.getByTestId('movie-list');
    expect(movieList).toBeInTheDocument();
  });

  it('applies year range filters', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    // Open filters
    await user.click(screen.getByText('Filters'));

    // Set year range to filter out 2022 movies
    const minYearInput = screen.getByPlaceholderText('From');
    await user.type(minYearInput, '2023');

    // Should show filtered count
    await waitFor(() => {
      expect(screen.getByText('(1 after filtering)')).toBeInTheDocument();
    });
  });

  it('applies minimum rating filter', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    // Open filters
    await user.click(screen.getByText('Filters'));

    // Set minimum rating to filter out lower rated movies
    const ratingSelect = screen.getByDisplayValue('Any Rating');
    await user.selectOptions(ratingSelect, '8');

    // Should show filtered count
    await waitFor(() => {
      expect(screen.getByText('(1 after filtering)')).toBeInTheDocument();
    });
  });

  it('resets filters', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    // Open filters
    await user.click(screen.getByText('Filters'));

    // Apply some filters
    const minYearInput = screen.getByPlaceholderText('From');
    await user.type(minYearInput, '2023');

    // Reset filters
    await user.click(screen.getByText('Reset'));

    // Filters should be reset - check that the input is empty
    expect(minYearInput).toHaveValue(null);
  });

  it('shows pagination controls', () => {
    mockSearchParams.set('q', 'test');

    renderWithRouter(<SearchResults />);

    expect(screen.getAllByText('Page 1 of 5')).toHaveLength(2); // One in movie list, one in pagination
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('shows search results info', () => {
    mockSearchParams.set('q', 'test movie');

    renderWithRouter(<SearchResults />);

    expect(
      screen.getByText(/Showing 1-20 of 100 results for "test movie"/)
    ).toBeInTheDocument();
  });

  it('initializes search from URL params', () => {
    mockSearchParams.set('q', 'test query');
    mockSearchParams.set('page', '2');

    renderWithRouter(<SearchResults />);

    expect(mockSetSearchQuery).toHaveBeenCalledWith('test query');
    expect(mockSearchMovies).toHaveBeenCalledWith('test query', 2);
  });

  it('clears search when no query in URL', () => {
    renderWithRouter(<SearchResults />);

    expect(mockClearSearch).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <SearchResults className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
