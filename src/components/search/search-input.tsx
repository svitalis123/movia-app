import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { movieService } from '../../lib/services/movie-service';

// Define types locally to avoid import issues
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity?: number;
  original_language?: string;
}

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  showSuggestions?: boolean;
  showHistory?: boolean;
}

interface SearchSuggestion {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
}

/**
 * Advanced search input component with debouncing, suggestions, and search history
 * Implements requirements 5.1 and 7.2 for search functionality
 */
export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search movies...",
  loading = false,
  disabled = false,
  className = "",
  showSuggestions = true,
  showHistory = true,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(controlledValue || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Search history management (local state instead of store to avoid infinite loops)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('movie-search-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Popular search terms (could be fetched from API in real implementation)
  const popularSearches = [
    'Marvel',
    'Star Wars',
    'Batman',
    'Spider-Man',
    'Avengers',
    'Disney',
    'Horror',
    'Comedy'
  ];

  // Update input value when controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await movieService.searchMovies(query, 1);
      const suggestionData = response.results.slice(0, 5).map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
      }));
      setSuggestions(suggestionData);
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    // Call controlled onChange if provided
    onChange?.(newValue);

    // Clear existing debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Show dropdown when typing
    if (newValue.trim()) {
      setShowDropdown(true);
      
      // Debounce suggestions fetch
      if (showSuggestions) {
        debounceRef.current = setTimeout(() => {
          fetchSuggestions(newValue);
        }, 300);
      }
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearch = (query?: string) => {
    const searchTerm = query || inputValue.trim();
    
    if (!searchTerm) return;

    // Add to search history
    addToSearchHistory(searchTerm);
    
    // Call custom onSearch if provided
    onSearch?.(searchTerm);
    
    // Hide dropdown
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // Blur input on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onClear?.();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Add search term to history
  const addToSearchHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    
    try {
      localStorage.setItem('movie-search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Remove item from search history
  const removeFromHistory = (term: string) => {
    const newHistory = searchHistory.filter(h => h !== term);
    setSearchHistory(newHistory);
    
    try {
      localStorage.setItem('movie-search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to update search history:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length + 
      (showHistory && !inputValue.trim() ? searchHistory.length + popularSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (suggestions.length > 0 && selectedIndex < suggestions.length) {
            // Selected a suggestion
            const suggestion = suggestions[selectedIndex];
            handleSearch(suggestion.title);
          } else if (showHistory && !inputValue.trim()) {
            // Selected from history or popular searches
            const historyIndex = selectedIndex - suggestions.length;
            if (historyIndex < searchHistory.length) {
              handleSearch(searchHistory[historyIndex]);
            } else {
              const popularIndex = historyIndex - searchHistory.length;
              if (popularIndex < popularSearches.length) {
                handleSearch(popularSearches[popularIndex]);
              }
            }
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (inputRef.current) {
          inputRef.current.blur();
        }
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown on focus if there's content to show
  const handleFocus = () => {
    if (showHistory && (!inputValue.trim() && (searchHistory.length > 0 || popularSearches.length > 0))) {
      setShowDropdown(true);
    } else if (inputValue.trim() && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  // Render dropdown content
  const renderDropdownContent = () => {
    if (!inputValue.trim() && showHistory) {
      // Show search history and popular searches when input is empty
      return (
        <>
          {searchHistory.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent Searches
              </div>
              {searchHistory.map((term, index) => (
                <button
                  key={`history-${term}`}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between group ${
                    selectedIndex === suggestions.length + index ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSearch(term)}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{term}</span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(term);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          )}
          
          {popularSearches.length > 0 && (
            <div className="py-2 border-t">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Popular Searches
              </div>
              {popularSearches.map((term, index) => (
                <button
                  key={`popular-${term}`}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2 ${
                    selectedIndex === suggestions.length + searchHistory.length + index ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSearch(term)}
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          )}
        </>
      );
    }

    // Show search suggestions when typing
    if (suggestions.length > 0) {
      return (
        <div className="py-2">
          <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-3 ${
                selectedIndex === index ? 'bg-muted' : ''
              }`}
              onClick={() => handleSearch(suggestion.title)}
            >
              <div className="flex-shrink-0 w-8 h-12 bg-muted rounded overflow-hidden">
                {suggestion.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`}
                    alt={suggestion.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Search className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{suggestion.title}</div>
                {suggestion.release_date && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(suggestion.release_date).getFullYear()}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      );
    }

    // Show loading state
    if (isLoadingSuggestions) {
      return (
        <div className="py-4 px-3 text-center text-sm text-muted-foreground">
          Loading suggestions...
        </div>
      );
    }

    // Show no results message
    if (inputValue.trim() && !isLoadingSuggestions) {
      return (
        <div className="py-4 px-3 text-center text-sm text-muted-foreground">
          No suggestions found
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={disabled || loading}
          className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
        />
        
        {/* Loading spinner or clear button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
          ) : inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}

export default SearchInput;
