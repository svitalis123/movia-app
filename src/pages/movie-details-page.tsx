import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { useMovieStore } from '../lib/stores';
import { isValidMovieId, createMovieUrl } from '../lib/utils';
import { createLazyComponent, LazyWrapper } from '../lib/utils/lazy-loading';

// Lazy load the heavy MovieDetails component
const MovieDetails = createLazyComponent(
  () => import('../components/movie/movie-details'),
  {
    fallback: (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" message="Loading movie details..." />
      </div>
    )
  }
);

/**
 * Movie details page component
 * Displays detailed information about a specific movie
 */
export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedMovie,
    loading,
    error,
    fetchMovieDetails,
    setSelectedMovie,
  } = useMovieStore();

  const movieId = isValidMovieId(id) ? parseInt(id!, 10) : null;

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails(movieId);
    }
    
    // Cleanup when component unmounts
    return () => {
      setSelectedMovie(null);
    };
  }, [movieId, fetchMovieDetails, setSelectedMovie]);

  const handleBack = () => {
    navigate('/');
  };

  const handleRelatedMovieClick = (relatedMovieId: number) => {
    navigate(createMovieUrl(relatedMovieId));
  };

  if (!movieId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="Invalid movie ID" 
          onRetry={handleBack}
        />
      </div>
    );
  }

  if (loading && !selectedMovie) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" message="Loading movie details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message={error} 
          onRetry={() => fetchMovieDetails(movieId)}
        />
      </div>
    );
  }

  if (!selectedMovie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="Movie not found" 
          onRetry={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LazyWrapper
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="large" message="Loading movie details..." />
          </div>
        }
      >
        <MovieDetails
          movie={selectedMovie}
          loading={loading}
          error={error}
          onBack={handleBack}
          onRelatedMovieClick={handleRelatedMovieClick}
        />
      </LazyWrapper>
    </div>
  );
}

export default MovieDetailsPage;