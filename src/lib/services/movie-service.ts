import { httpClient } from './http-client';
import { APIError } from '../types';

// Define all types locally to avoid import issues
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

// Custom Error Classes

class _NetworkError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = '_NetworkError';
  }
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
 * TMDB API Service Implementation
 *
 * This service provides methods to interact with The Movie Database (TMDB) API.
 * It handles all movie-related API calls including fetching popular movies,
 * movie details, search functionality, and genre information.
 */
class TMDBMovieService implements MovieService {
  private readonly baseImageUrl: string;

  constructor() {
    this.baseImageUrl =
      import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';
  }

  /**
   * Fetches popular movies with pagination support
   * @param page - Page number (default: 1)
   * @returns Promise with paginated popular movies response
   */
  async getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const response = await httpClient.get<TMDBResponse<TMDBMovie>>(
        '/movie/popular',
        {
          params: {
            page: Math.max(1, Math.min(page, 1000)), // TMDB limits to 1000 pages
            language: 'en-US',
          },
        }
      );

      // Validate response structure
      this.validatePaginatedResponse(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getPopularMovies');
    }
  }

  /**
   * Fetches detailed information for a specific movie
   * @param movieId - The movie ID
   * @returns Promise with detailed movie information
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    try {
      if (!movieId || movieId <= 0) {
        throw new APIError('Invalid movie ID', 400, 'getMovieDetails');
      }

      const response = await httpClient.get<TMDBMovieDetails>(
        `/movie/${movieId}`,
        {
          params: {
            language: 'en-US',
            append_to_response: 'videos,images', // Get additional data in one request
          },
        }
      );

      // Validate response structure
      this.validateMovieDetails(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getMovieDetails');
    }
  }

  /**
   * Fetches cast and crew information for a specific movie
   * @param movieId - The movie ID
   * @returns Promise with movie credits (cast and crew)
   */
  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    try {
      if (!movieId || movieId <= 0) {
        throw new APIError('Invalid movie ID', 400, 'getMovieCredits');
      }

      const response = await httpClient.get<TMDBCredits>(
        `/movie/${movieId}/credits`,
        {
          params: {
            language: 'en-US',
          },
        }
      );

      // Validate response structure
      this.validateCredits(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getMovieCredits');
    }
  }

  /**
   * Searches for movies by title or keyword
   * @param query - Search query string
   * @param page - Page number (default: 1)
   * @returns Promise with paginated search results
   */
  async searchMovies(
    query: string,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    try {
      if (!query || query.trim().length === 0) {
        throw new APIError('Search query cannot be empty', 400, 'searchMovies');
      }

      if (query.trim().length < 2) {
        throw new APIError(
          'Search query must be at least 2 characters long',
          400,
          'searchMovies'
        );
      }

      const response = await httpClient.get<TMDBResponse<TMDBMovie>>(
        '/search/movie',
        {
          params: {
            query: query.trim(),
            page: Math.max(1, Math.min(page, 1000)), // TMDB limits to 1000 pages
            language: 'en-US',
            include_adult: false, // Filter out adult content
          },
        }
      );

      // Validate response structure
      this.validatePaginatedResponse(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'searchMovies');
    }
  }

  /**
   * Fetches all available movie genres
   * @returns Promise with list of genres
   */
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    try {
      const response = await httpClient.get<{ genres: TMDBGenre[] }>(
        '/genre/movie/list',
        {
          params: {
            language: 'en-US',
          },
        }
      );

      // Validate response structure
      this.validateGenres(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getGenres');
    }
  }

  /**
   * Fetches movies by specific genre with pagination
   * @param genreId - The genre ID
   * @param page - Page number (default: 1)
   * @returns Promise with paginated movies by genre
   */
  async getMoviesByGenre(
    genreId: number,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    try {
      if (!genreId || genreId <= 0) {
        throw new APIError('Invalid genre ID', 400, 'getMoviesByGenre');
      }

      const response = await httpClient.get<TMDBResponse<TMDBMovie>>(
        '/discover/movie',
        {
          params: {
            with_genres: genreId,
            page: Math.max(1, Math.min(page, 1000)),
            language: 'en-US',
            sort_by: 'popularity.desc',
            include_adult: false,
          },
        }
      );

      // Validate response structure
      this.validatePaginatedResponse(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getMoviesByGenre');
    }
  }

  /**
   * Fetches similar movies for a given movie
   * @param movieId - The movie ID
   * @param page - Page number (default: 1)
   * @returns Promise with paginated similar movies
   */
  async getSimilarMovies(
    movieId: number,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    try {
      if (!movieId || movieId <= 0) {
        throw new APIError('Invalid movie ID', 400, 'getSimilarMovies');
      }

      const response = await httpClient.get<TMDBResponse<TMDBMovie>>(
        `/movie/${movieId}/similar`,
        {
          params: {
            page: Math.max(1, Math.min(page, 1000)),
            language: 'en-US',
          },
        }
      );

      // Validate response structure
      this.validatePaginatedResponse(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getSimilarMovies');
    }
  }

  /**
   * Fetches movie recommendations based on a given movie
   * @param movieId - The movie ID
   * @param page - Page number (default: 1)
   * @returns Promise with paginated movie recommendations
   */
  async getMovieRecommendations(
    movieId: number,
    page: number = 1
  ): Promise<TMDBResponse<TMDBMovie>> {
    try {
      if (!movieId || movieId <= 0) {
        throw new APIError('Invalid movie ID', 400, 'getMovieRecommendations');
      }

      const response = await httpClient.get<TMDBResponse<TMDBMovie>>(
        `/movie/${movieId}/recommendations`,
        {
          params: {
            page: Math.max(1, Math.min(page, 1000)),
            language: 'en-US',
          },
        }
      );

      // Validate response structure
      this.validatePaginatedResponse(response);

      return response;
    } catch (error) {
      throw this.handleServiceError(error, 'getMovieRecommendations');
    }
  }

  /**
   * Utility method to get full image URL
   * @param imagePath - The image path from TMDB
   * @param size - Image size (default: 'w500')
   * @returns Full image URL or null if no path provided
   */
  getImageUrl(imagePath: string | null, size: string = 'w500'): string | null {
    if (!imagePath) return null;
    return `${this.baseImageUrl}/${size}${imagePath}`;
  }

  /**
   * Utility method to get backdrop image URL
   * @param backdropPath - The backdrop path from TMDB
   * @param size - Image size (default: 'w1280')
   * @returns Full backdrop URL or null if no path provided
   */
  getBackdropUrl(
    backdropPath: string | null,
    size: string = 'w1280'
  ): string | null {
    if (!backdropPath) return null;
    return `${this.baseImageUrl}/${size}${backdropPath}`;
  }

  // Private validation methods

  /**
   * Validates paginated response structure
   */
  private validatePaginatedResponse(response: TMDBResponse<TMDBMovie>): void {
    if (!response || typeof response !== 'object') {
      throw new APIError('Invalid response format', 500, 'validateResponse');
    }

    if (!Array.isArray(response.results)) {
      throw new APIError('Invalid results format', 500, 'validateResponse');
    }

    if (
      typeof response.page !== 'number' ||
      typeof response.total_pages !== 'number' ||
      typeof response.total_results !== 'number'
    ) {
      throw new APIError('Invalid pagination format', 500, 'validateResponse');
    }
  }

  /**
   * Validates movie details response structure
   */
  private validateMovieDetails(response: TMDBMovieDetails): void {
    if (!response || typeof response !== 'object') {
      throw new APIError(
        'Invalid movie details format',
        500,
        'validateMovieDetails'
      );
    }

    if (typeof response.id !== 'number' || !response.title) {
      throw new APIError(
        'Invalid movie details structure',
        500,
        'validateMovieDetails'
      );
    }
  }

  /**
   * Validates credits response structure
   */
  private validateCredits(response: TMDBCredits): void {
    if (!response || typeof response !== 'object') {
      throw new APIError('Invalid credits format', 500, 'validateCredits');
    }

    if (!Array.isArray(response.cast) || !Array.isArray(response.crew)) {
      throw new APIError('Invalid credits structure', 500, 'validateCredits');
    }
  }

  /**
   * Validates genres response structure
   */
  private validateGenres(response: { genres: TMDBGenre[] }): void {
    if (!response || typeof response !== 'object') {
      throw new APIError('Invalid genres format', 500, 'validateGenres');
    }

    if (!Array.isArray(response.genres)) {
      throw new APIError('Invalid genres structure', 500, 'validateGenres');
    }
  }

  /**
   * Handles and transforms service errors
   */
  private handleServiceError(error: unknown, method: string): Error {
    console.error(`[MovieService.${method}] Error:`, error);

    // If it's already our custom error, re-throw it
    if (error instanceof APIError) {
      return error;
    }

    // Handle network errors
    if (error instanceof Error && error.name === '_NetworkError') {
      return error;
    }

    // Handle unknown errors
    const errorObj = error as { message?: string; status?: number };
    return new APIError(
      errorObj.message || 'An unexpected error occurred',
      errorObj.status || 500,
      method
    );
  }
}

// Create and export singleton instance
export const movieService = new TMDBMovieService();

// Export class for testing and custom instances
export { TMDBMovieService };
