import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchPage } from '../search-page';

// Mock the stores
const mockSearchMovies = vi.fn();
const mockClearSearch = vi.fn();
const mockGoToPage = vi.fn();
const mockSetSearchQuery = vi.fn();

vi.mock('../../lib/stores/movie-store', () => ({
  useMovieStore: () => ({
    searchResults: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
    searchMovies: mockSearchMovies,
    clearSearch: mockClearSearch,
    goToPage: mockGoToPage,
  }),
}));

vi.mock('../../lib/stores/ui-store', () => ({
  useUIStore: () => ({
    searchQuery: 'test query',
    setSearchQuery: mockSetSearchQuery,
  }),
}));

// Mock useNavigate and useSearchParams
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [
      new URLSearchParams('?q=test%20query&page=1'),
      mockSetSearchParams,
    ],
  };
});

// Mock components
vi.mock('../../components/movie', () => ({
  MovieList: ({ movies, emptyMessage }: any) => (
    <div data-testid="movie-list">
      {movies.length === 0 ? emptyMessage : 'Movies displayed'}
    </div>
  ),
}));

vi.mock('../../components/search', () => ({
  SearchInput: ({ value, onSearch, onClear }: any) => (
    <div data-testid="search-input">
      <input
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        data-testid="search-field"
      />
      <button onClick={onClear} data-testid="clear-button">
        Clear
      </button>
    </div>
  ),
}));

vi.mock('../../components/ui', () => ({
  LoadingSpinner: ({ message }: any) => (
    <div data-testid="loading">{message}</div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search page with query', () => {
    renderWithRouter(<SearchPage />);

    expect(
      screen.getByText('Search Results for "test query"')
    ).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('movie-list')).toBeInTheDocument();
  });

  it('calls searchMovies on mount with valid query', async () => {
    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith('test query', 1);
      expect(mockSetSearchQuery).toHaveBeenCalledWith('test query');
    });
  });

  it('displays empty message when no results found', () => {
    renderWithRouter(<SearchPage />);

    expect(
      screen.getByText('No movies found for "test query"')
    ).toBeInTheDocument();
  });

  it('handles clear search', () => {
    renderWithRouter(<SearchPage />);

    const clearButton = screen.getByTestId('clear-button');
    fireEvent.click(clearButton);

    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    expect(mockClearSearch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
