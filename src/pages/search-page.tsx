import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MovieList } from '../components/movie';
import { SearchInput } from '../components/search';
import { LoadingSpinner } from '../components/ui';
import { useMovieStore } from '../lib/stores/movie-store';
import { useUIStore } from '../lib/stores/ui-store';
import {
  parseSearchParams,
  validateSearchQuery,
  validatePageNumber,
  createSearchUrl,
  createMovieUrl,
} from '../lib/utils';

/**
 * Search page component
 * Displays search results for movies
 */
export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { query, page } = parseSearchParams(searchParams);
  const validatedQuery = validateSearchQuery(query);
  const validatedPage = validatePageNumber(page.toString());

  const {
    searchResults: movies,
    loading,
    error,
    pagination,
    searchMovies,
    clearSearch,
  } = useMovieStore();

  const { searchQuery, setSearchQuery } = useUIStore();

  useEffect(() => {
    if (validatedQuery) {
      setSearchQuery(validatedQuery);
      searchMovies(validatedQuery, validatedPage);
    } else {
      // If no valid query, redirect to home
      navigate('/', { replace: true });
    }
  }, [validatedQuery, validatedPage, searchMovies, setSearchQuery, navigate]);

  const handleSearch = (newQuery: string) => {
    const trimmedQuery = newQuery.trim();
    if (trimmedQuery) {
      navigate(createSearchUrl(trimmedQuery, 1));
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleMovieSelect = (movieId: number) => {
    navigate(createMovieUrl(movieId));
  };

  const handlePageChange = (newPage: number) => {
    navigate(createSearchUrl(validatedQuery, newPage));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
    navigate('/', { replace: true });
  };

  if (loading && movies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" message="Searching movies..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Results for "{validatedQuery}"
        </h1>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder="Search for movies..."
          loading={loading}
        />
      </div>

      <MovieList
        movies={movies}
        loading={loading}
        error={error}
        onMovieSelect={handleMovieSelect}
        onPageChange={handlePageChange}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        emptyMessage={`No movies found for "${validatedQuery}"`}
      />
    </div>
  );
}

export default SearchPage;
