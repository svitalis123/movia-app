import { movieService } from './movie-service';
import { performanceMonitor, debounce, memoize, imagePreloader } from '../utils/performance';

// Define types locally to avoid import issues
interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
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

interface TMDBMovieDetails extends TMDBMovie {
  belongs_to_collection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  imdb_id: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
}

interface TMDBCastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface TMDBCrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * Optimized movie service with performance enhancements
 */
class OptimizedMovieService {
  private movieService = movieService;
  
  // Memoized methods for caching expensive operations
  private memoizedGetPopularMovies = memoize(
    (page: number) => this.movieService.getPopularMovies(page),
    (page) => `popular-${page}`
  );

  private memoizedSearchMovies = memoize(
    (query: string, page: number) => this.movieService.searchMovies(query, page),
    (query, page) => `search-${query}-${page}`
  );

  private memoizedGetMovieDetails = memoize(
    (movieId: number) => this.movieService.getMovieDetails(movieId),
    (movieId) => `details-${movieId}`
  );

  // Debounced search to prevent excessive API calls
  public debouncedSearchMovies = debounce(
    async (query: string, page = 1, callback: (result: TMDBResponse<TMDBMovie>) => void) => {
      const endTiming = performanceMonitor.startTiming('search-movies');
      try {
        const result = await this.searchMovies(query, page);
        callback(result);
      } finally {
        endTiming();
      }
    },
    300
  );

  /**
   * Get popular movies with performance monitoring
   */
  async getPopularMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const endTiming = performanceMonitor.startTiming('get-popular-movies');
    
    try {
      const result = await this.memoizedGetPopularMovies(page);
      
      // Preload movie posters
      this.preloadMovieImages(result.results);
      
      return result;
    } finally {
      endTiming();
    }
  }

  /**
   * Search movies with performance monitoring
   */
  async searchMovies(query: string, page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const endTiming = performanceMonitor.startTiming('search-movies');
    
    try {
      const result = await this.memoizedSearchMovies(query, page);
      
      // Preload movie posters
      this.preloadMovieImages(result.results);
      
      return result;
    } finally {
      endTiming();
    }
  }

  /**
   * Get movie details with performance monitoring
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const endTiming = performanceMonitor.startTiming('get-movie-details');
    
    try {
      const result = await this.memoizedGetMovieDetails(movieId);
      
      // Preload backdrop and poster images
      if (result.backdrop_path) {
        imagePreloader.preload(`https://image.tmdb.org/t/p/w1280${result.backdrop_path}`, 1);
      }
      if (result.poster_path) {
        imagePreloader.preload(`https://image.tmdb.org/t/p/w500${result.poster_path}`, 1);
      }
      
      return result;
    } finally {
      endTiming();
    }
  }

  /**
   * Get movie credits with performance monitoring
   */
  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    const endTiming = performanceMonitor.startTiming('get-movie-credits');
    
    try {
      const result = await this.movieService.getMovieCredits(movieId);
      
      // Preload cast profile images (top 10)
      const topCast = result.cast.slice(0, 10);
      topCast.forEach(actor => {
        if (actor.profile_path) {
          imagePreloader.preload(`https://image.tmdb.org/t/p/w185${actor.profile_path}`, 0);
        }
      });
      
      return result;
    } finally {
      endTiming();
    }
  }

  /**
   * Get genres with caching
   */
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    const endTiming = performanceMonitor.startTiming('get-genres');
    
    try {
      return await this.movieService.getGenres();
    } finally {
      endTiming();
    }
  }

  /**
   * Preload movie poster images
   */
  private preloadMovieImages(movies: TMDBMovie[]): void {
    movies.forEach((movie, index) => {
      if (movie.poster_path) {
        // Higher priority for first few movies
        const priority = index < 6 ? 2 : 1;
        imagePreloader.preload(`https://image.tmdb.org/t/p/w342${movie.poster_path}`, priority);
      }
    });
  }

  /**
   * Batch load multiple movies with optimized requests
   */
  async batchLoadMovies(movieIds: number[]): Promise<TMDBMovieDetails[]> {
    const endTiming = performanceMonitor.startTiming('batch-load-movies');
    
    try {
      // Load movies in parallel with concurrency limit
      const batchSize = 5;
      const results: TMDBMovieDetails[] = [];
      
      for (let i = 0; i < movieIds.length; i += batchSize) {
        const batch = movieIds.slice(i, i + batchSize);
        const batchPromises = batch.map(id => this.getMovieDetails(id));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          }
        });
      }
      
      return results;
    } finally {
      endTiming();
    }
  }

  /**
   * Prefetch next page of results
   */
  async prefetchNextPage(currentPage: number, query?: string): Promise<void> {
    const nextPage = currentPage + 1;
    
    // Use requestIdleCallback if available
    const prefetch = () => {
      if (query) {
        this.searchMovies(query, nextPage).catch(() => {});
      } else {
        this.getPopularMovies(nextPage).catch(() => {});
      }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 100);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    // Clear memoization caches by recreating the memoized functions
    this.memoizedGetPopularMovies = memoize(
      (page: number) => this.movieService.getPopularMovies(page),
      (page) => `popular-${page}`
    );

    this.memoizedSearchMovies = memoize(
      (query: string, page: number) => this.movieService.searchMovies(query, page),
      (query, page) => `search-${query}-${page}`
    );

    this.memoizedGetMovieDetails = memoize(
      (movieId: number) => this.movieService.getMovieDetails(movieId),
      (movieId) => `details-${movieId}`
    );

    // Clear image preloader
    imagePreloader.clear();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return performanceMonitor.getAllMetrics();
  }
}

/**
 * Singleton instance of optimized movie service
 */
export const optimizedMovieService = new OptimizedMovieService();

export default optimizedMovieService;
