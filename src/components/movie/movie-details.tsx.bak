import { ArrowLeft, Star, Calendar, Clock, DollarSign, Users, Building2, Globe } from 'lucide-react';
import { MovieBackdrop, MoviePoster, ProfileImage } from '../ui/image-with-fallback';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { cn } from '../../lib/utils';

// Define types locally to avoid import issues
interface Genre {
  id: number;
  name: string;
}

interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

interface MovieDetails {
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
  runtime: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  cast: CastMember[];
  crew: CrewMember[];
  budget: number;
  revenue: number;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  status?: string;
  collection?: Collection;
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
}

interface MovieDetailsProps {
  movie: MovieDetails;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onRelatedMovieClick?: (movieId: number) => void;
  className?: string;
}

/**
 * MovieDetails component displays comprehensive movie information
 * Includes cast, crew, ratings, production details, and responsive layout
 */
export function MovieDetails({
  movie,
  loading,
  error,
  onBack,
  onRelatedMovieClick,
  className
}: MovieDetailsProps) {
  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getDirector = () => {
    return movie?.crew?.find(member => member.job === 'Director');
  };

  const getMainCast = () => {
    return movie?.cast?.slice(0, 10) || [];
  };

  const getKeyCrewMembers = () => {
    const keyJobs = ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer'];
    return movie?.crew?.filter(member => keyJobs.includes(member.job)).slice(0, 8) || [];
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <LoadingSpinner size="large" message="Loading movie details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
        <ErrorMessage 
          message={error}
          onRetry={onBack}
        />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
        <ErrorMessage 
          message="Movie not found"
          onRetry={onBack}
        />
      </div>
    );
  }

  const director = getDirector();
  const mainCast = getMainCast();
  const keyCrewMembers = getKeyCrewMembers();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Go back to movie list"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Movies
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-muted">
        {/* Backdrop Image */}
        {movie.backdrop_path && (
          <div className="relative h-64 md:h-80 lg:h-96">
            <MovieBackdrop
              backdropPath={movie.backdrop_path}
              title={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        )}

        {/* Movie Info Overlay */}
        <div className={cn(
          'p-6 md:p-8',
          movie.backdrop_path ? 'absolute bottom-0 left-0 right-0 text-white' : 'bg-card'
        )}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <MoviePoster
                posterPath={movie.poster_path}
                title={movie.title}
                className="w-48 h-72 md:w-56 md:h-84 rounded-lg shadow-lg"
              />
            </div>

            {/* Movie Information */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-lg italic opacity-90">{movie.tagline}</p>
                )}
              </div>

              {/* Rating and Basic Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{formatRating(movie.vote_average)}</span>
                    <span className="opacity-75">({movie.vote_count} votes)</span>
                  </div>
                )}

                {movie.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatReleaseDate(movie.release_date)}</span>
                  </div>
                )}

                {movie.runtime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Director */}
              {director && (
                <div>
                  <span className="font-medium">Directed by: </span>
                  <span>{director.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      {movie.overview && (
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
        </div>
      )}

      {/* Production Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Information */}
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">{formatCurrency(movie.budget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">{formatCurrency(movie.revenue)}</span>
            </div>
            {movie.budget > 0 && movie.revenue > 0 && (
              <div className="flex justify-between border-t pt-3">
                <span className="text-muted-foreground">Profit:</span>
                <span className={cn(
                  'font-medium',
                  movie.revenue - movie.budget > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatCurrency(movie.revenue - movie.budget)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Production Companies */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Production Companies
            </h3>
            <div className="space-y-2">
              {movie.production_companies.slice(0, 5).map((company) => (
                <div key={company.id} className="flex items-center gap-3">
                  {company.logo_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                      alt={`${company.name} logo`}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <div className="font-medium">{company.name}</div>
                    {company.origin_country && (
                      <div className="text-sm text-muted-foreground">{company.origin_country}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cast Section */}
      {mainCast.length > 0 && (
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cast
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mainCast.map((actor) => (
              <div key={actor.id} className="text-center">
                <ProfileImage
                  profilePath={actor.profile_path}
                  name={actor.name}
                  className="w-20 h-20 mx-auto mb-2"
                />
                <div className="text-sm font-medium">{actor.name}</div>
                <div className="text-xs text-muted-foreground">{actor.character}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crew Section */}
      {keyCrewMembers.length > 0 && (
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Key Crew Members</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {keyCrewMembers.map((member, index) => (
              <div key={`${member.id}-${index}`} className="flex items-center gap-3">
                <ProfileImage
                  profilePath={member.profile_path}
                  name={member.name}
                  className="w-12 h-12 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.job}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{movie.status || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Language:</span>
              <span className="font-medium">{movie.original_language || 'N/A'}</span>
            </div>
            {movie.homepage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Homepage:</span>
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
          
          {movie.production_countries && movie.production_countries.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-2">Production Countries:</div>
              <div className="flex flex-wrap gap-1">
                {movie.production_countries.map((country) => (
                  <span
                    key={country.iso_3166_1}
                    className="px-2 py-1 bg-muted rounded text-sm"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * MovieDetailsSkeleton for loading states
 */
export function MovieDetailsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Back Button Skeleton */}
      <div className="h-6 w-32 bg-muted rounded animate-pulse" />

      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden rounded-lg bg-muted animate-pulse">
        <div className="h-64 md:h-80 lg:h-96 bg-muted-foreground/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-48 h-72 md:w-56 md:h-84 bg-muted-foreground/20 rounded-lg" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-muted-foreground/20 rounded w-3/4" />
              <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
              <div className="flex gap-4">
                <div className="h-6 w-20 bg-muted-foreground/20 rounded-full" />
                <div className="h-6 w-24 bg-muted-foreground/20 rounded-full" />
                <div className="h-6 w-16 bg-muted-foreground/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Skeleton */}
      <div className="bg-card rounded-lg p-6">
        <div className="h-6 w-24 bg-muted rounded mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;