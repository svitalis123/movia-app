import { movieService } from './movie-service';
import type { TMDBResponse, TMDBMovie, TMDBMovieDetails, TMDBCredits, TMDBGenre } from '../types';

/**
 * Enhanced movie service that wraps the base movie service with user feedback
 * This service provides user-friendly error messages and success notifications
 */
export class EnhancedMovieService {
  /**
   * Fetch popular movies with user-friendly error handling
   */
  async getPopularMovies(page?: number): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const result = await movieService.getPopularMovies(page);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          error.message.includes('network') || error.message.includes('fetch')
            ? 'Unable to load movies. Please check your internet connection and try again.'
            : 'Failed to load popular movies. Please try again later.'
        );
      }
      throw new Error('Failed to load popular movies. Please try again later.');
    }
  }

  /**
   * Fetch movie details with enhanced error messages
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    try {
      const result = await movieService.getMovieDetails(movieId);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Movie not found. It may have been removed or the link is invalid.');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to load movie details. Please check your internet connection and try again.');
        }
      }
      throw new Error('Failed to load movie details. Please try again later.');
    }
  }

  /**
   * Search movies with user-friendly feedback
   */
  async searchMovies(query: string, page?: number): Promise<TMDBResponse<TMDBMovie>> {
    if (!query.trim()) {
      throw new Error('Please enter a search term to find movies.');
    }

    try {
      const result = await movieService.searchMovies(query, page);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to search movies. Please check your internet connection and try again.');
        }
      }
      throw new Error('Search failed. Please try again with a different search term.');
    }
  }

  /**
   * Fetch movie credits with error handling
   */
  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    try {
      const result = await movieService.getMovieCredits(movieId);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Cast and crew information not available for this movie.');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to load cast information. Please check your internet connection and try again.');
        }
      }
      throw new Error('Failed to load cast and crew information. Please try again later.');
    }
  }

  /**
   * Fetch genres with error handling
   */
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    try {
      const result = await movieService.getGenres();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to load movie genres. Please check your internet connection and try again.');
        }
      }
      throw new Error('Failed to load movie genres. Please try again later.');
    }
  }

  /**
   * Fetch movies by genre with error handling
   */
  async getMoviesByGenre(genreId: number, page?: number): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const result = await movieService.getMoviesByGenre(genreId, page);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to load movies for this genre. Please check your internet connection and try again.');
        }
      }
      throw new Error('Failed to load movies for this genre. Please try again later.');
    }
  }

  /**
   * Fetch similar movies with error handling
   */
  async getSimilarMovies(movieId: number, page?: number): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const result = await movieService.getSimilarMovies(movieId, page);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('No similar movies found for this title.');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to load similar movies. Please check your internet connection and try again.');
        }
      }
      throw new Error('Failed to load similar movies. Please try again later.');
    }
  }

  /**
   * Fetch movie recommendations with error handling
   */
  async getMovieRecommendations(movieId: number, page?: number): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const result = await movieService.getMovieRecommendations(movieId, page);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('No recommendations available for this movie.');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Unable to load movie recommendations. Please check your internet connection and try again.');
        }
      }
      throw new Error('Failed to load movie recommendations. Please try again later.');
    }
  }
}

// Export singleton instance
export const enhancedMovieService = new EnhancedMovieService();