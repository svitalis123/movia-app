import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { MovieCard, MovieCardSkeleton } from './movie-card';
import { ErrorMessage } from '../ui/error-message';
import { cn } from '../../lib/utils';

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

interface MovieListProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  onMovieSelect: (movieId: number) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  viewMode?: 'grid' | 'list';
  emptyMessage?: string;
  className?: string;
}

/**
 * MovieList component displays a grid of movies with pagination controls
 * Handles loading states, empty states, and error conditions
 */
export function MovieList({
  movies,
  loading,
  error,
  onMovieSelect,
  onPageChange,
  currentPage,
  totalPages,
  viewMode = 'grid',
  emptyMessage = 'No movies found',
  className
}: MovieListProps) {
  // Generate skeleton items for loading state
  const renderSkeletons = () => {
    return Array.from({ length: 20 }, (_, index) => (
      <MovieCardSkeleton key={`skeleton-${index}`} />
    ));
  };

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const maxVisiblePages = 5;
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const paginationNumbers = generatePaginationNumbers();

  // Handle pagination click
  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Handle previous/next navigation
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <ErrorMessage 
          message={error}
          onRetry={() => onPageChange(currentPage)}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Movie Grid */}
      <div className={cn(
        'grid gap-4',
        viewMode === 'grid' 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}>
        {loading ? (
          renderSkeletons()
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieSelect}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground text-lg mb-2">
              {emptyMessage}
            </div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or browse popular movies.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && movies.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background'
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {paginationNumbers.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <div className="flex items-center justify-center w-10 h-10">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <button
                    onClick={() => handlePageClick(page as number)}
                    className={cn(
                      'w-10 h-10 text-sm font-medium rounded-md transition-colors',
                      'border border-input hover:bg-accent hover:text-accent-foreground',
                      page === currentPage
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                        : 'bg-background'
                    )}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background'
            )}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Info */}
      {!loading && movies.length > 0 && totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * MovieListSkeleton for loading states
 */
export function MovieListSkeleton({ 
  viewMode = 'grid',
  className 
}: { 
  viewMode?: 'grid' | 'list';
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className={cn(
        'grid gap-4',
        viewMode === 'grid' 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}>
        {Array.from({ length: 20 }, (_, index) => (
          <MovieCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center space-x-2">
        <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
        <div className="flex space-x-1">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-10 w-10 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-16 bg-muted rounded-md animate-pulse" />
      </div>
    </div>
  );
}

export default MovieList;