import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { MovieList } from '../movie/movie-list';
import { SearchInput } from './search-input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { useMovieStore } from '../../lib/stores/movie-store';
import { useUIStore, useUIActions } from '../../lib/stores/ui-store';

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

type MovieSortBy =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'release_date.desc'
  | 'release_date.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'title.asc'
  | 'title.desc';

interface SearchResultsProps {
  className?: string;
}

interface SearchFilters {
  sortBy: MovieSortBy;
  minYear?: number;
  maxYear?: number;
  minRating?: number;
}

/**
 * Search results page component with movie grid, pagination, and filtering
 * Implements requirements 5.2, 5.3, 5.4, and 5.5 for search results handling
 */
export function SearchResults({ className = '' }: SearchResultsProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'popularity.desc',
  });

  const { searchResults, loading, error, pagination } = useMovieStore();
  const { searchQuery, viewMode } = useUIStore();
  const { setSearchQuery } = useUIActions();
  const {
    searchMovies,
    clearSearch,
    goToNextPage: _goToNextPage,
    goToPreviousPage: _goToPreviousPage,
    goToPage: _goToPage,
  } = useMovieStore();

  // Get query from URL params
  const queryParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Initialize search query from URL
  useEffect(() => {
    if (queryParam && queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [queryParam, searchQuery, setSearchQuery]);

  // Perform search when query or page changes
  useEffect(() => {
    if (queryParam) {
      searchMovies(queryParam, pageParam);
    } else {
      clearSearch();
    }
  }, [queryParam, pageParam, searchMovies, clearSearch]);

  // Handle new search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchParams({ q: query.trim(), page: '1' });
    } else {
      handleClearSearch();
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchParams({});
    clearSearch();
    navigate('/');
  };

  // Handle movie selection
  const handleMovieSelect = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (queryParam) {
      setSearchParams({ q: queryParam, page: page.toString() });
    }
  };

  // Handle pagination navigation
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  // Apply client-side filtering and sorting
  const getFilteredAndSortedResults = (): Movie[] => {
    let results = [...searchResults];

    // Apply year filters
    if (filters.minYear || filters.maxYear) {
      results = results.filter((movie) => {
        if (!movie.release_date) return false;
        const year = new Date(movie.release_date).getFullYear();
        if (filters.minYear && year < filters.minYear) return false;
        if (filters.maxYear && year > filters.maxYear) return false;
        return true;
      });
    }

    // Apply rating filter
    if (filters.minRating) {
      results = results.filter(
        (movie) => movie.vote_average >= (filters.minRating || 0)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popularity.desc':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'popularity.asc':
          return (a.popularity || 0) - (b.popularity || 0);
        case 'release_date.desc':
          return (
            new Date(b.release_date || 0).getTime() -
            new Date(a.release_date || 0).getTime()
          );
        case 'release_date.asc':
          return (
            new Date(a.release_date || 0).getTime() -
            new Date(b.release_date || 0).getTime()
          );
        case 'vote_average.desc':
          return b.vote_average - a.vote_average;
        case 'vote_average.asc':
          return a.vote_average - b.vote_average;
        case 'title.asc':
          return a.title.localeCompare(b.title);
        case 'title.desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return results;
  };

  const filteredResults = getFilteredAndSortedResults();

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      sortBy: 'popularity.desc',
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.minYear ||
    filters.maxYear ||
    filters.minRating ||
    filters.sortBy !== 'popularity.desc';

  return (
    <div className={`container mx-auto px-4 py-6 max-w-7xl ${className}`}>
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <SearchInput
              value={queryParam}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search for movies..."
              loading={loading}
              className="w-full"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-input hover:bg-muted'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-background text-primary px-1.5 py-0.5 rounded text-xs">
                {
                  [filters.minYear, filters.maxYear, filters.minRating].filter(
                    Boolean
                  ).length
                }
              </span>
            )}
          </button>
        </div>

        {/* Search Results Info */}
        {queryParam && !loading && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between text-sm text-muted-foreground">
            <div>
              {pagination.totalResults > 0 ? (
                <>
                  Showing {(pagination.currentPage - 1) * 20 + 1}-
                  {Math.min(
                    pagination.currentPage * 20,
                    pagination.totalResults
                  )}{' '}
                  of {pagination.totalResults} results for "{queryParam}"
                </>
              ) : (
                <>No results found for "{queryParam}"</>
              )}
            </div>

            {filteredResults.length !== searchResults.length && (
              <div className="text-xs">
                ({filteredResults.length} after filtering)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-muted rounded-lg border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange({ sortBy: e.target.value as MovieSortBy })
                }
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="popularity.desc">
                  Popularity (High to Low)
                </option>
                <option value="popularity.asc">Popularity (Low to High)</option>
                <option value="release_date.desc">
                  Release Date (Newest First)
                </option>
                <option value="release_date.asc">
                  Release Date (Oldest First)
                </option>
                <option value="vote_average.desc">Rating (High to Low)</option>
                <option value="vote_average.asc">Rating (Low to High)</option>
                <option value="title.asc">Title (A-Z)</option>
                <option value="title.desc">Title (Z-A)</option>
              </select>
            </div>

            {/* Year Range */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Release Year
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="From"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.minYear || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      minYear: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="number"
                  placeholder="To"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.maxYear || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      maxYear: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) =>
                  handleFilterChange({
                    minRating: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5+ Stars</option>
                <option value="6">6+ Stars</option>
                <option value="7">7+ Stars</option>
                <option value="8">8+ Stars</option>
                <option value="9">9+ Stars</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" message="Searching movies..." />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="py-12">
          <ErrorMessage
            message={error}
            onRetry={() => queryParam && searchMovies(queryParam, pageParam)}
          />
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && queryParam && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No movies found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchResults.length === 0
              ? `We couldn't find any movies matching "${queryParam}". Try different keywords or check your spelling.`
              : `No movies match your current filters. Try adjusting your filter criteria.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {searchResults.length > 0 && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors"
            >
              Browse Popular Movies
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && filteredResults.length > 0 && (
        <>
          <MovieList
            movies={filteredResults}
            loading={false}
            error={null}
            onMovieSelect={handleMovieSelect}
            onPageChange={handlePageChange}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            viewMode={viewMode}
            emptyMessage="No movies found"
            className="mb-6"
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            pageNum === pagination.currentPage
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-input hover:bg-muted'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State - No Query */}
      {!queryParam && !loading && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Search for Movies</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Enter a movie title, actor name, or keyword to find movies you're
            looking for.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Popular Movies
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
