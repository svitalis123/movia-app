import { create } from 'zustand';

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

interface MovieDetails extends Movie {
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

interface CacheState {
  movies: Record<string, { data: Movie[]; timestamp: number; ttl: number }>;
  movieDetails: Record<number, { data: MovieDetails; timestamp: number; ttl: number }>;
  genres: { data: Genre[]; timestamp: number; ttl: number } | null;
}

interface CacheActions {
  setCachedMovies: (key: string, movies: Movie[], ttl?: number) => void;
  getCachedMovies: (key: string) => Movie[] | null;
  setCachedMovieDetails: (movieId: number, details: MovieDetails, ttl?: number) => void;
  getCachedMovieDetails: (movieId: number) => MovieDetails | null;
  setCachedGenres: (genres: Genre[], ttl?: number) => void;
  getCachedGenres: () => Genre[] | null;
  clearCache: (type?: 'movies' | 'movieDetails' | 'genres') => void;
}

interface CacheStore extends CacheState, CacheActions {}

// Default TTL values (in milliseconds)
const DEFAULT_TTL = {
  MOVIES: 5 * 60 * 1000, // 5 minutes
  MOVIE_DETAILS: 15 * 60 * 1000, // 15 minutes
  GENRES: 60 * 60 * 1000, // 1 hour
};

/**
 * Cache store using Zustand
 * Manages in-memory caching for API responses to improve performance
 * Implements TTL (Time To Live) for cache invalidation
 */
export const useCacheStore = create<CacheStore>()((set, get) => ({
  // Initial state
  movies: {},
  movieDetails: {},
  genres: null,

  // Actions
  setCachedMovies: (key: string, movies: Movie[], ttl = DEFAULT_TTL.MOVIES) => {
    const timestamp = Date.now();
    set((state) => ({
      movies: {
        ...state.movies,
        [key]: {
          data: movies,
          timestamp,
          ttl,
        },
      },
    }));
  },

  getCachedMovies: (key: string): Movie[] | null => {
    const cached = get().movies[key];
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      // Remove expired cache entry
      set((state) => {
        const { [key]: _removed, ...rest } = state.movies;
        return { movies: rest };
      });
      return null;
    }

    return cached.data;
  },

  setCachedMovieDetails: (movieId: number, details: MovieDetails, ttl = DEFAULT_TTL.MOVIE_DETAILS) => {
    const timestamp = Date.now();
    set((state) => ({
      movieDetails: {
        ...state.movieDetails,
        [movieId]: {
          data: details,
          timestamp,
          ttl,
        },
      },
    }));
  },

  getCachedMovieDetails: (movieId: number): MovieDetails | null => {
    const cached = get().movieDetails[movieId];
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      // Remove expired cache entry
      set((state) => {
        const { [movieId]: _removed, ...rest } = state.movieDetails;
        return { movieDetails: rest };
      });
      return null;
    }

    return cached.data;
  },

  setCachedGenres: (genres: Genre[], ttl = DEFAULT_TTL.GENRES) => {
    const timestamp = Date.now();
    set({
      genres: {
        data: genres,
        timestamp,
        ttl,
      },
    });
  },

  getCachedGenres: (): Genre[] | null => {
    const cached = get().genres;
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      // Remove expired cache entry
      set({ genres: null });
      return null;
    }

    return cached.data;
  },

  clearCache: (type?: 'movies' | 'movieDetails' | 'genres') => {
    if (!type) {
      // Clear all cache
      set({
        movies: {},
        movieDetails: {},
        genres: null,
      });
      return;
    }

    switch (type) {
      case 'movies':
        set({ movies: {} });
        break;
      case 'movieDetails':
        set({ movieDetails: {} });
        break;
      case 'genres':
        set({ genres: null });
        break;
    }
  },
}));

/**
 * Selector hooks for cache state
 */
export const useCachedMovies = (key: string) => {
  const getCachedMovies = useCacheStore((state) => state.getCachedMovies);
  return getCachedMovies(key);
};

export const useCachedMovieDetails = (movieId: number) => {
  const getCachedMovieDetails = useCacheStore((state) => state.getCachedMovieDetails);
  return getCachedMovieDetails(movieId);
};

export const useCachedGenres = () => {
  const getCachedGenres = useCacheStore((state) => state.getCachedGenres);
  return getCachedGenres();
};

/**
 * Action hooks for cache operations
 */
export const useCacheActions = () => useCacheStore((state) => ({
  setCachedMovies: state.setCachedMovies,
  getCachedMovies: state.getCachedMovies,
  setCachedMovieDetails: state.setCachedMovieDetails,
  getCachedMovieDetails: state.getCachedMovieDetails,
  setCachedGenres: state.setCachedGenres,
  getCachedGenres: state.getCachedGenres,
  clearCache: state.clearCache,
}));

/**
 * Utility hook to check if cache is available for a specific key
 */
export const useIsCached = (type: 'movies' | 'movieDetails' | 'genres', key?: string | number) => {
  return useCacheStore((state) => {
    switch (type) {
      case 'movies':
        if (typeof key !== 'string') return false;
        const movieCache = state.movies[key];
        if (!movieCache) return false;
        return Date.now() - movieCache.timestamp <= movieCache.ttl;
      
      case 'movieDetails':
        if (typeof key !== 'number') return false;
        const detailsCache = state.movieDetails[key];
        if (!detailsCache) return false;
        return Date.now() - detailsCache.timestamp <= detailsCache.ttl;
      
      case 'genres':
        if (!state.genres) return false;
        return Date.now() - state.genres.timestamp <= state.genres.ttl;
      
      default:
        return false;
    }
  });
};
