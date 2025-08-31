import { Star, Calendar } from 'lucide-react';
import { MoviePoster } from '../ui/image-with-fallback';
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

interface MovieCardProps {
  movie: Movie;
  onClick: (movieId: number) => void;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showGenres?: boolean;
  className?: string;
}

/**
 * MovieCard component displays a movie with poster, title, and basic information
 * Supports hover effects, click handling, and responsive design
 */
export function MovieCard({
  movie,
  onClick,
  loading = false,
  variant = 'default',
  showGenres = false,
  className
}: MovieCardProps) {
  const handleClick = () => {
    if (!loading) {
      onClick(movie.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      return isNaN(year) ? 'N/A' : year.toString();
    } catch {
      return 'N/A';
    }
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  if (loading) {
    return (
      <div className={cn(
        'group relative overflow-hidden rounded-lg bg-muted animate-pulse',
        variant === 'compact' ? 'aspect-[2/3]' : 'aspect-[2/3]',
        className
      )}>
        <div className="w-full h-full bg-muted-foreground/10" />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
          <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:scale-105 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
        variant === 'compact' ? 'aspect-[2/3]' : 'aspect-[2/3]',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      {/* Movie Poster */}
      <div className="relative w-full h-full">
        <MoviePoster
          posterPath={movie.poster_path}
          title={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating badge - only show for default variant */}
        {variant === 'default' && movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{formatRating(movie.vote_average)}</span>
          </div>
        )}
      </div>

      {/* Movie Information Overlay - Default variant */}
      {variant === 'default' && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary-foreground">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatReleaseDate(movie.release_date)}</span>
            </div>
            
            {movie.vote_count > 0 && (
              <div className="flex items-center gap-1">
                <span>{movie.vote_count} votes</span>
              </div>
            )}
          </div>

          {/* Overview - only shown on hover for default variant */}
          {movie.overview && (
            <p className="text-xs text-white/70 mt-2 line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              {movie.overview}
            </p>
          )}
        </div>
      )}

      {/* Compact variant - information below poster */}
      {variant === 'compact' && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-card/95 backdrop-blur-sm border-t">
          <h3 className="font-medium text-sm line-clamp-1 text-foreground">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {formatReleaseDate(movie.release_date)}
            </span>
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{formatRating(movie.vote_average)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed variant - more information */}
      {variant === 'detailed' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent text-white">
          <h3 className="font-bold text-base line-clamp-2 mb-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-white/80 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatReleaseDate(movie.release_date)}</span>
            </div>
            
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{formatRating(movie.vote_average)}</span>
              </div>
            )}
          </div>

          {movie.overview && (
            <p className="text-sm text-white/70 line-clamp-4">
              {movie.overview}
            </p>
          )}
        </div>
      )}

      {/* Focus indicator */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-focus-within:ring-primary transition-all duration-200" />
    </div>
  );
}

/**
 * MovieCardSkeleton for loading states
 */
export function MovieCardSkeleton({ 
  variant = 'default',
  className 
}: { 
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg bg-muted animate-pulse',
      'aspect-[2/3]',
      className
    )}>
      <div className="w-full h-full bg-muted-foreground/10" />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-muted to-transparent">
        <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
        <div className="h-3 bg-muted-foreground/20 rounded w-2/3 mb-1" />
        {variant === 'detailed' && (
          <>
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted-foreground/20 rounded w-full mb-1" />
            <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
          </>
        )}
      </div>
    </div>
  );
}

export default MovieCard;