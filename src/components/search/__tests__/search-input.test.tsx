import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SearchInput } from '../search-input';
import { movieService } from '../../../lib/services/movie-service';
import { useMovieStore } from '../../../lib/stores/movie-store';
import { useUIStore, useUIActions } from '../../../lib/stores/ui-store';

// Mock the stores
vi.mock('../../../lib/stores/movie-store');
vi.mock('../../../lib/stores/ui-store', () => ({
  useUIStore: vi.fn(),
  useUIActions: vi.fn(),
}));
vi.mock('../../../lib/services/movie-service');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SearchInput', () => {
  const mockSearchMovies = vi.fn();
  const mockClearSearch = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockMovieServiceSearch = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Mock store hooks
    (useMovieStore as unknown).mockReturnValue({
      searchMovies: mockSearchMovies,
      clearSearch: mockClearSearch,
    });

    (useUIStore as unknown).mockReturnValue({
      searchQuery: '',
    });

    // Mock UI actions
    (useUIActions as unknown).mockReturnValue({
      setSearchQuery: mockSetSearchQuery,
    });

    // Mock movie service
    (movieService.searchMovies as unknown) = mockMovieServiceSearch;
    mockMovieServiceSearch.mockResolvedValue({
      results: [
        {
          id: 1,
          title: 'Test Movie',
          release_date: '2023-01-01',
          poster_path: '/test.jpg',
        },
      ],
    });
  });



  it('renders search input with placeholder', () => {
    render(<SearchInput />);
    
    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput placeholder="Find your movie..." />);
    
    expect(screen.getByPlaceholderText('Find your movie...')).toBeInTheDocument();
  });

  it('handles controlled value', () => {
    const { rerender } = render(<SearchInput value="initial" />);
    
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
    
    rerender(<SearchInput value="updated" />);
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(<SearchInput onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    expect(mockOnChange).toHaveBeenCalledWith('t');
    expect(mockOnChange).toHaveBeenCalledWith('te');
    expect(mockOnChange).toHaveBeenCalledWith('tes');
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when input has value', async () => {
    const user = userEvent.setup();
    
    render(<SearchInput />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    // Look for the X button by its SVG content
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClear = vi.fn();
    
    render(<SearchInput onClear={mockOnClear} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockOnClear).toHaveBeenCalled();
    expect(mockClearSearch).toHaveBeenCalled();
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });

  it('submits search on form submission', async () => {
    const user = userEvent.setup();
    const mockOnSearch = vi.fn();
    
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test movie');
    await user.keyboard('{Enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test movie');
    expect(mockSearchMovies).toHaveBeenCalledWith('test movie');
    expect(mockSetSearchQuery).toHaveBeenCalledWith('test movie');
  });

  it('shows loading state', () => {
    render(<SearchInput loading />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
    // Loading spinner should be visible
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows disabled state', () => {
    render(<SearchInput disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('fetches suggestions with debouncing', async () => {
    render(<SearchInput showSuggestions />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Wait for debounced call
    await waitFor(() => {
      expect(mockMovieServiceSearch).toHaveBeenCalledWith('test', 1);
    }, { timeout: 1000 });
  });

  it('shows suggestions dropdown when typing', async () => {
    render(<SearchInput showSuggestions />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles keyboard navigation in suggestions', async () => {
    const _user = userEvent.setup();
    
    render(<SearchInput showSuggestions />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Navigate down and select
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockSearchMovies).toHaveBeenCalledWith('Test Movie');
  });

  it('shows search history when input is empty', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['previous search', 'another search']));
    
    render(<SearchInput showHistory />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('previous search')).toBeInTheDocument();
    expect(screen.getByText('another search')).toBeInTheDocument();
  });

  it('shows popular searches when no history', () => {
    render(<SearchInput showHistory />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(screen.getByText('Popular Searches')).toBeInTheDocument();
    expect(screen.getByText('Marvel')).toBeInTheDocument();
    expect(screen.getByText('Star Wars')).toBeInTheDocument();
  });

  it('adds search to history when searching', async () => {
    const user = userEvent.setup();
    
    render(<SearchInput />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'new search');
    fireEvent.submit(input.closest('form')!);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'movie-search-history',
      JSON.stringify(['new search'])
    );
  });

  it('handles API errors gracefully', async () => {
    mockMovieServiceSearch.mockRejectedValue(new Error('API Error'));
    
    render(<SearchInput showSuggestions />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Wait a bit and check that no suggestions are shown
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  it('does not fetch suggestions for queries less than 2 characters', async () => {
    render(<SearchInput showSuggestions />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'a' } });
    
    // Wait a bit and check that API was not called
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(mockMovieServiceSearch).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<SearchInput className="custom-class" />);
    
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });
});