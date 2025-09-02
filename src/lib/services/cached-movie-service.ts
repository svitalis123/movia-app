import { TMDBMovieService } from './movie-service';
import { cacheService, CacheKeyGenerator } from './cache-service';

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

// MovieService interface
interface MovieService {
  getPopularMovies(page?: number): Promise<TMDBResponse<TMDBMovie>>;
  getMovieDetails(movieId: number): Promise<TMDBMovieDetails>;
  getMovieCredits(movieId: number): Promise<TMDBCredits>;
  searchMovies(query: string, page?: number): Promise<TMDBResponse<TMDBMovie>>;
  getGenres(): Promise<{ genres: TMDBGenre[] }>;
  getMoviesByGenre(
    genreId: number,
    page?: number
  ): Promise<TMDBResponse<TMDBMovie>>;
  getSimilarMovies(
    movieId: number,
    page?: number
  ): Promise<TMDBResponse<TMDBMovie>>;
  getMovieRecommendations(
    movieId: number,
    page?: number
  ): Promise<TMDBResponse<TMDBMovie>>;
}

/**
 * Cached Movie Service
 *
 * This service wraps the TMDBMovieService with caching functionality.
 * It automatically caches API responses to improve performance and reduce
 * redundant API calls to TMDB.
 */
class CachedMovieService implements MovieService {
  private movieService: TMDBMovieService;

  // Cache TTL configurations (in milliseconds)
  private readonly cacheTTL = {
    popularMovies: 10 * 60 * 1000, // 10 minutes
    movieDetails: 60 * 60 * 1000, // 1 hour
    movieCredits: 60 * 60 * 1000, // 1 hour
    searchResults: 5 * 60 * 1000, // 5 minutes
    genres: 24 * 60 * 60 * 1000, // 24 hours
    moviesByGenre: 15 * 60 * 1000, // 15 minutes
    similarMovies: 30 * 60 * 1000, // 30 minutes
    recommendations: 30 * 60 * 1000, // 30 minutes
  };

  constructor(movieService?: TMDBMovieService) {
    this.movieService = movieService || new TMDBMovieService();
  }

  /**
   * Fetches popular movies with caching
   */
  async getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = CacheKeyGenerator.popularMovies(page);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getPopularMovies(page),
      this.cacheTTL.popularMovies
    );
  }

  /**
   * Fetches movie details with caching
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const cacheKey = CacheKeyGenerator.movieDetails(movieId);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getMovieDetails(movieId),
      this.cacheTTL.movieDetails
    );
  }

  /**
   * Fetches movie credits with caching
   */
  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    const cacheKey = CacheKeyGenerator.movieCredits(movieId);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getMovieCredits(movieId),
      this.cacheTTL.movieCredits
    );
  }

  /**
   * Searches movies with caching
   */
  async searchMovies(
    query: string,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = CacheKeyGenerator.searchMovies(query, page);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.searchMovies(query, page),
      this.cacheTTL.searchResults
    );
  }

  /**
   * Fetches genres with caching
   */
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    const cacheKey = CacheKeyGenerator.genres();

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getGenres(),
      this.cacheTTL.genres
    );
  }

  /**
   * Fetches movies by genre with caching
   */
  async getMoviesByGenre(
    genreId: number,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = CacheKeyGenerator.moviesByGenre(genreId, page);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getMoviesByGenre(genreId, page),
      this.cacheTTL.moviesByGenre
    );
  }

  /**
   * Fetches similar movies with caching
   */
  async getSimilarMovies(
    movieId: number,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = CacheKeyGenerator.similarMovies(movieId, page);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getSimilarMovies(movieId, page),
      this.cacheTTL.similarMovies
    );
  }

  /**
   * Fetches movie recommendations with caching
   */
  async getMovieRecommendations(
    movieId: number,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = CacheKeyGenerator.movieRecommendations(movieId, page);

    return cacheService.getOrSet(
      cacheKey,
      () => this.movieService.getMovieRecommendations(movieId, page),
      this.cacheTTL.recommendations
    );
  }

  /**
   * Utility method to get full image URL (delegated to movie service)
   */
  getImageUrl(imagePath: string | null, size: string = 'w500'): string | null {
    return this.movieService.getImageUrl(imagePath, size);
  }

  /**
   * Utility method to get backdrop image URL (delegated to movie service)
   */
  getBackdropUrl(
    backdropPath: string | null,
    size: string = 'w1280'
  ): string | null {
    return this.movieService.getBackdropUrl(backdropPath, size);
  }

  /**
   * Cache management methods
   */

  /**
   * Clears all cached movie data
   */
  clearCache(): void {
    cacheService.clear();
  }

  /**
   * Clears cache for a specific movie
   */
  clearMovieCache(movieId: number): void {
    const keysToDelete = [
      CacheKeyGenerator.movieDetails(movieId),
      CacheKeyGenerator.movieCredits(movieId),
      CacheKeyGenerator.similarMovies(movieId),
      CacheKeyGenerator.movieRecommendations(movieId),
    ];

    keysToDelete.forEach((key) => cacheService.delete(key));
  }

  /**
   * Clears search cache
   */
  clearSearchCache(): void {
    const allKeys = cacheService.keys();
    const searchKeys = allKeys.filter((key) => key.startsWith('search_'));
    searchKeys.forEach((key) => cacheService.delete(key));
  }

  /**
   * Clears popular movies cache
   */
  clearPopularMoviesCache(): void {
    const allKeys = cacheService.keys();
    const popularKeys = allKeys.filter((key) =>
      key.startsWith('popular_movies_')
    );
    popularKeys.forEach((key) => cacheService.delete(key));
  }

  /**
   * Clears genre-related cache
   */
  clearGenreCache(): void {
    const allKeys = cacheService.keys();
    const genreKeys = allKeys.filter(
      (key) => key.startsWith('genre_') || key === 'movie_genres'
    );
    genreKeys.forEach((key) => cacheService.delete(key));
  }

  /**
   * Gets cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Preloads popular movies into cache
   */
  async preloadPopularMovies(pages: number = 3): Promise<void> {
    const promises = [];

    for (let page = 1; page <= pages; page++) {
      promises.push(this.getPopularMovies(page));
    }

    await Promise.all(promises);
  }

  /**
   * Preloads genres into cache
   */
  async preloadGenres(): Promise<void> {
    await this.getGenres();
  }

  /**
   * Preloads movie details and credits for a list of movie IDs
   */
  async preloadMovieDetails(movieIds: number[]): Promise<void> {
    const promises = movieIds.flatMap((movieId) => [
      this.getMovieDetails(movieId),
      this.getMovieCredits(movieId),
    ]);

    await Promise.allSettled(promises); // Use allSettled to handle individual failures
  }

  /**
   * Updates cache TTL configuration
   */
  updateCacheTTL(config: Partial<typeof this.cacheTTL>): void {
    Object.assign(this.cacheTTL, config);
  }

  /**
   * Checks if data is cached for a specific key
   */
  isCached(type: keyof typeof this.cacheTTL, ...args: any[]): boolean {
    let key: string;

    switch (type) {
      case 'popularMovies':
        key = CacheKeyGenerator.popularMovies(args[0] || 1);
        break;
      case 'movieDetails':
        key = CacheKeyGenerator.movieDetails(args[0]);
        break;
      case 'movieCredits':
        key = CacheKeyGenerator.movieCredits(args[0]);
        break;
      case 'searchResults':
        key = CacheKeyGenerator.searchMovies(args[0], args[1] || 1);
        break;
      case 'genres':
        key = CacheKeyGenerator.genres();
        break;
      case 'moviesByGenre':
        key = CacheKeyGenerator.moviesByGenre(args[0], args[1] || 1);
        break;
      case 'similarMovies':
        key = CacheKeyGenerator.similarMovies(args[0], args[1] || 1);
        break;
      case 'recommendations':
        key = CacheKeyGenerator.movieRecommendations(args[0], args[1] || 1);
        break;
      default:
        return false;
    }

    return cacheService.has(key);
  }
}

// Create and export singleton instance
export const cachedMovieService = new CachedMovieService();

// Export class for testing and custom instances
export { CachedMovieService };
