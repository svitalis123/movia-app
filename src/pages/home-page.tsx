import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieList } from '../components/movie';
import { SearchInput } from '../components/search';
import { LoadingSpinner } from '../components/ui';
import { useMovieStore } from '../lib/stores/movie-store';

import { createSearchUrl, createMovieUrl } from '../lib/utils';

/**
 * Home page component
 * Displays popular movies and search functionality
 */
export function HomePage() {
  const navigate = useNavigate();
  const {
    popular: movies,
    loading,
    error,
    pagination,
    fetchPopularMovies,
    clearSearch,
    goToPage,
  } = useMovieStore();

  useEffect(() => {
    if (movies.length === 0) {
      fetchPopularMovies();
    }
  }, [movies.length, fetchPopularMovies]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(createSearchUrl(query.trim()));
    } else {
      clearSearch();
      fetchPopularMovies();
    }
  };

  const handleMovieSelect = (movieId: number) => {
    navigate(createMovieUrl(movieId));
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  if (loading && movies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" message="Loading movies..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Popular Movies
        </h1>
        
        <SearchInput
          value=""
          onChange={() => {}} // Controlled by search page
          onSearch={handleSearch}
          onClear={() => {}}
          placeholder="Search for movies..."
          loading={false}
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
        emptyMessage="No movies available"
      />
    </div>
  );
}

export default HomePage;