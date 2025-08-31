import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TMDBMovieService } from '../movie-service';
import { httpClient } from '../http-client';
import { APIError } from '../../types';

// Mock the http client
vi.mock('../http-client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

const mockedHttpClient = vi.mocked(httpClient);

describe('TMDBMovieService', () => {
  let movieService: TMDBMovieService;

  beforeEach(() => {
    vi.clearAllMocks();
    movieService = new TMDBMovieService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPopularMovies', () => {
    const mockPopularMoviesResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/test-backdrop.jpg',
          release_date: '2023-01-01',
          vote_average: 8.5,
          vote_count: 1000,
          popularity: 100,
          genre_ids: [28, 12],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ],
      total_pages: 10,
      total_results: 200,
    };

    it('should fetch popular movies successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockPopularMoviesResponse);

      const result = await movieService.getPopularMovies();

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/popular', {
        params: {
          page: 1,
          language: 'en-US',
        },
      });
      expect(result).toEqual(mockPopularMoviesResponse);
    });

    it('should fetch popular movies with specific page', async () => {
      mockedHttpClient.get.mockResolvedValue(mockPopularMoviesResponse);

      await movieService.getPopularMovies(5);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/popular', {
        params: {
          page: 5,
          language: 'en-US',
        },
      });
    });

    it('should limit page number to valid range', async () => {
      mockedHttpClient.get.mockResolvedValue(mockPopularMoviesResponse);

      // Test page too low
      await movieService.getPopularMovies(0);
      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/popular', {
        params: {
          page: 1,
          language: 'en-US',
        },
      });

      // Test page too high
      await movieService.getPopularMovies(2000);
      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/popular', {
        params: {
          page: 1000,
          language: 'en-US',
        },
      });
    });

    it('should handle API errors', async () => {
      const apiError = new APIError('API Error', 500, 'getPopularMovies');
      mockedHttpClient.get.mockRejectedValue(apiError);

      await expect(movieService.getPopularMovies()).rejects.toThrow(APIError);
    });
  });

  describe('getMovieDetails', () => {
    const mockMovieDetails = {
      id: 1,
      title: 'Test Movie',
      original_title: 'Test Movie',
      overview: 'Test overview',
      poster_path: '/test.jpg',
      backdrop_path: '/test-backdrop.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      vote_count: 1000,
      popularity: 100,
      genre_ids: [28, 12],
      adult: false,
      original_language: 'en',
      video: false,
      belongs_to_collection: null,
      budget: 100000000,
      genres: [{ id: 28, name: 'Action' }],
      homepage: 'https://example.com',
      imdb_id: 'tt1234567',
      production_companies: [],
      production_countries: [],
      revenue: 200000000,
      runtime: 120,
      spoken_languages: [],
      status: 'Released',
      tagline: 'Test tagline',
    };

    it('should fetch movie details successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockMovieDetails);

      const result = await movieService.getMovieDetails(1);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/1', {
        params: {
          language: 'en-US',
          append_to_response: 'videos,images',
        },
      });
      expect(result).toEqual(mockMovieDetails);
    });

    it('should throw error for invalid movie ID', async () => {
      await expect(movieService.getMovieDetails(0)).rejects.toThrow(APIError);
      await expect(movieService.getMovieDetails(-1)).rejects.toThrow(APIError);
    });
  });

  describe('getMovieCredits', () => {
    const mockCredits = {
      id: 1,
      cast: [
        {
          adult: false,
          gender: 2,
          id: 1,
          known_for_department: 'Acting',
          name: 'Test Actor',
          original_name: 'Test Actor',
          popularity: 10,
          profile_path: '/actor.jpg',
          cast_id: 1,
          character: 'Hero',
          credit_id: 'credit1',
          order: 0,
        },
      ],
      crew: [
        {
          adult: false,
          gender: 2,
          id: 2,
          known_for_department: 'Directing',
          name: 'Test Director',
          original_name: 'Test Director',
          popularity: 5,
          profile_path: '/director.jpg',
          credit_id: 'credit2',
          department: 'Directing',
          job: 'Director',
        },
      ],
    };

    it('should fetch movie credits successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockCredits);

      const result = await movieService.getMovieCredits(1);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/1/credits', {
        params: {
          language: 'en-US',
        },
      });
      expect(result).toEqual(mockCredits);
    });

    it('should throw error for invalid movie ID', async () => {
      await expect(movieService.getMovieCredits(0)).rejects.toThrow(APIError);
      await expect(movieService.getMovieCredits(-1)).rejects.toThrow(APIError);
    });
  });

  describe('searchMovies', () => {
    const mockSearchResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Search Result Movie',
          overview: 'Search result overview',
          poster_path: '/search.jpg',
          backdrop_path: '/search-backdrop.jpg',
          release_date: '2023-01-01',
          vote_average: 7.5,
          vote_count: 500,
          popularity: 50,
          genre_ids: [35],
          adult: false,
          original_language: 'en',
          original_title: 'Search Result Movie',
          video: false,
        },
      ],
      total_pages: 5,
      total_results: 100,
    };

    it('should search movies successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockSearchResponse);

      const result = await movieService.searchMovies('test query');

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/search/movie', {
        params: {
          query: 'test query',
          page: 1,
          language: 'en-US',
          include_adult: false,
        },
      });
      expect(result).toEqual(mockSearchResponse);
    });

    it('should search movies with specific page', async () => {
      mockedHttpClient.get.mockResolvedValue(mockSearchResponse);

      await movieService.searchMovies('test query', 3);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/search/movie', {
        params: {
          query: 'test query',
          page: 3,
          language: 'en-US',
          include_adult: false,
        },
      });
    });

    it('should throw error for empty query', async () => {
      await expect(movieService.searchMovies('')).rejects.toThrow(APIError);
      await expect(movieService.searchMovies('   ')).rejects.toThrow(APIError);
    });

    it('should throw error for query too short', async () => {
      await expect(movieService.searchMovies('a')).rejects.toThrow(APIError);
    });

    it('should trim query string', async () => {
      mockedHttpClient.get.mockResolvedValue(mockSearchResponse);

      await movieService.searchMovies('  test query  ');

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/search/movie', {
        params: {
          query: 'test query',
          page: 1,
          language: 'en-US',
          include_adult: false,
        },
      });
    });
  });

  describe('getGenres', () => {
    const mockGenresResponse = {
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 35, name: 'Comedy' },
      ],
    };

    it('should fetch genres successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockGenresResponse);

      const result = await movieService.getGenres();

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/genre/movie/list', {
        params: {
          language: 'en-US',
        },
      });
      expect(result).toEqual(mockGenresResponse);
    });
  });

  describe('getMoviesByGenre', () => {
    const mockGenreMoviesResponse = {
      page: 1,
      results: [
        {
          id: 1,
          title: 'Action Movie',
          overview: 'Action overview',
          poster_path: '/action.jpg',
          backdrop_path: '/action-backdrop.jpg',
          release_date: '2023-01-01',
          vote_average: 8.0,
          vote_count: 800,
          popularity: 80,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Action Movie',
          video: false,
        },
      ],
      total_pages: 8,
      total_results: 160,
    };

    it('should fetch movies by genre successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockGenreMoviesResponse);

      const result = await movieService.getMoviesByGenre(28);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/discover/movie', {
        params: {
          with_genres: 28,
          page: 1,
          language: 'en-US',
          sort_by: 'popularity.desc',
          include_adult: false,
        },
      });
      expect(result).toEqual(mockGenreMoviesResponse);
    });

    it('should throw error for invalid genre ID', async () => {
      await expect(movieService.getMoviesByGenre(0)).rejects.toThrow(APIError);
      await expect(movieService.getMoviesByGenre(-1)).rejects.toThrow(APIError);
    });
  });

  describe('getSimilarMovies', () => {
    const mockSimilarMoviesResponse = {
      page: 1,
      results: [
        {
          id: 2,
          title: 'Similar Movie',
          overview: 'Similar movie overview',
          poster_path: '/similar.jpg',
          backdrop_path: '/similar-backdrop.jpg',
          release_date: '2023-02-01',
          vote_average: 7.8,
          vote_count: 800,
          popularity: 80,
          genre_ids: [28, 12],
          adult: false,
          original_language: 'en',
          original_title: 'Similar Movie',
          video: false,
        },
      ],
      total_pages: 5,
      total_results: 100,
    };

    it('should fetch similar movies successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockSimilarMoviesResponse);

      const result = await movieService.getSimilarMovies(1);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/1/similar', {
        params: {
          page: 1,
          language: 'en-US',
        },
      });
      expect(result).toEqual(mockSimilarMoviesResponse);
    });

    it('should fetch similar movies with specific page', async () => {
      mockedHttpClient.get.mockResolvedValue(mockSimilarMoviesResponse);

      await movieService.getSimilarMovies(1, 3);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/1/similar', {
        params: {
          page: 3,
          language: 'en-US',
        },
      });
    });

    it('should throw error for invalid movie ID', async () => {
      await expect(movieService.getSimilarMovies(0)).rejects.toThrow(APIError);
      await expect(movieService.getSimilarMovies(-1)).rejects.toThrow(APIError);
    });
  });

  describe('getMovieRecommendations', () => {
    const mockRecommendationsResponse = {
      page: 1,
      results: [
        {
          id: 3,
          title: 'Recommended Movie',
          overview: 'Recommended movie overview',
          poster_path: '/recommended.jpg',
          backdrop_path: '/recommended-backdrop.jpg',
          release_date: '2023-03-01',
          vote_average: 8.2,
          vote_count: 1200,
          popularity: 90,
          genre_ids: [28, 12],
          adult: false,
          original_language: 'en',
          original_title: 'Recommended Movie',
          video: false,
        },
      ],
      total_pages: 8,
      total_results: 160,
    };

    it('should fetch movie recommendations successfully', async () => {
      mockedHttpClient.get.mockResolvedValue(mockRecommendationsResponse);

      const result = await movieService.getMovieRecommendations(1);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/1/recommendations', {
        params: {
          page: 1,
          language: 'en-US',
        },
      });
      expect(result).toEqual(mockRecommendationsResponse);
    });

    it('should fetch recommendations with specific page', async () => {
      mockedHttpClient.get.mockResolvedValue(mockRecommendationsResponse);

      await movieService.getMovieRecommendations(1, 2);

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/movie/1/recommendations', {
        params: {
          page: 2,
          language: 'en-US',
        },
      });
    });

    it('should throw error for invalid movie ID', async () => {
      await expect(movieService.getMovieRecommendations(0)).rejects.toThrow(APIError);
      await expect(movieService.getMovieRecommendations(-1)).rejects.toThrow(APIError);
    });
  });

  describe('error handling and retries', () => {
    it('should handle rate limiting errors', async () => {
      const rateLimitError = new APIError('Rate limit exceeded', 429, 'getPopularMovies');
      mockedHttpClient.get.mockRejectedValue(rateLimitError);

      await expect(movieService.getPopularMovies()).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle server errors', async () => {
      const serverError = new APIError('Internal server error', 500, 'getPopularMovies');
      mockedHttpClient.get.mockRejectedValue(serverError);

      await expect(movieService.getPopularMovies()).rejects.toThrow('Internal server error');
    });

    it('should handle malformed responses', async () => {
      mockedHttpClient.get.mockResolvedValue(null);

      await expect(movieService.getPopularMovies()).rejects.toThrow('Invalid response format');
    });

    it('should handle empty response arrays', async () => {
      const emptyResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };

      mockedHttpClient.get.mockResolvedValue(emptyResponse);

      const result = await movieService.getPopularMovies();
      expect(result.results).toHaveLength(0);
      expect(result.total_results).toBe(0);
    });
  });

  describe('input validation', () => {
    it('should validate page numbers for all paginated endpoints', async () => {
      // Test all paginated methods with invalid page numbers
      const invalidPages = [-1, 0, 1001, NaN, Infinity];

      for (const page of invalidPages) {
        if (page <= 0 || page > 1000 || !Number.isFinite(page)) {
          // These should be normalized to valid ranges
          mockedHttpClient.get.mockResolvedValue({ page: 1, results: [], total_pages: 1, total_results: 0 });
          
          await movieService.getPopularMovies(page);
          await movieService.searchMovies('test', page);
          await movieService.getMoviesByGenre(28, page);
          await movieService.getSimilarMovies(1, page);
          await movieService.getMovieRecommendations(1, page);
        }
      }
    });

    it('should validate search query length and content', async () => {
      const invalidQueries = ['', '   ', 'a', '  b  '];

      for (const query of invalidQueries) {
        if (query.trim().length < 2) {
          await expect(movieService.searchMovies(query)).rejects.toThrow(APIError);
        }
      }
    });

    it('should validate movie IDs', async () => {
      const invalidIds = [0, -1, NaN, Infinity, -Infinity];

      for (const id of invalidIds) {
        await expect(movieService.getMovieDetails(id)).rejects.toThrow(APIError);
        await expect(movieService.getMovieCredits(id)).rejects.toThrow(APIError);
        await expect(movieService.getSimilarMovies(id)).rejects.toThrow(APIError);
        await expect(movieService.getMovieRecommendations(id)).rejects.toThrow(APIError);
      }
    });

    it('should validate genre IDs', async () => {
      const invalidGenreIds = [0, -1, NaN, Infinity];

      for (const genreId of invalidGenreIds) {
        await expect(movieService.getMoviesByGenre(genreId)).rejects.toThrow(APIError);
      }
    });
  });

  describe('utility methods', () => {
    it('should generate correct image URLs', () => {
      const imagePath = '/test-image.jpg';
      const result = movieService.getImageUrl(imagePath);
      expect(result).toBe('https://image.tmdb.org/t/p/w500/test-image.jpg');
    });

    it('should generate correct image URLs with custom size', () => {
      const imagePath = '/test-image.jpg';
      const result = movieService.getImageUrl(imagePath, 'w300');
      expect(result).toBe('https://image.tmdb.org/t/p/w300/test-image.jpg');
    });

    it('should return null for null image path', () => {
      const result = movieService.getImageUrl(null);
      expect(result).toBeNull();
    });

    it('should return null for empty image path', () => {
      const result = movieService.getImageUrl('');
      expect(result).toBeNull();
    });

    it('should generate correct backdrop URLs', () => {
      const backdropPath = '/test-backdrop.jpg';
      const result = movieService.getBackdropUrl(backdropPath);
      expect(result).toBe('https://image.tmdb.org/t/p/w1280/test-backdrop.jpg');
    });

    it('should generate backdrop URLs with custom size', () => {
      const backdropPath = '/test-backdrop.jpg';
      const result = movieService.getBackdropUrl(backdropPath, 'original');
      expect(result).toBe('https://image.tmdb.org/t/p/original/test-backdrop.jpg');
    });

    it('should return null for null backdrop path', () => {
      const result = movieService.getBackdropUrl(null);
      expect(result).toBeNull();
    });

    it('should return null for empty backdrop path', () => {
      const result = movieService.getBackdropUrl('');
      expect(result).toBeNull();
    });

    it('should handle image paths without leading slash', () => {
      const imagePath = 'test-image.jpg';
      const result = movieService.getImageUrl(imagePath);
      expect(result).toBe('https://image.tmdb.org/t/p/w500test-image.jpg');
    });
  });

  describe('response data transformation', () => {
    it('should handle missing optional fields in movie data', async () => {
      const incompleteMovie = {
        id: 1,
        title: 'Incomplete Movie',
        overview: null,
        poster_path: null,
        backdrop_path: null,
        release_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        original_title: 'Incomplete Movie',
        video: false,
      };

      const incompleteResponse = {
        page: 1,
        results: [incompleteMovie],
        total_pages: 1,
        total_results: 1,
      };

      mockedHttpClient.get.mockResolvedValue(incompleteResponse);

      const result = await movieService.getPopularMovies();
      expect(result.results[0]).toEqual(incompleteMovie);
    });

    it('should handle missing optional fields in movie details', async () => {
      const incompleteDetails = {
        id: 1,
        title: 'Incomplete Details',
        original_title: 'Incomplete Details',
        overview: null,
        poster_path: null,
        backdrop_path: null,
        release_date: '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        video: false,
        belongs_to_collection: null,
        budget: 0,
        genres: [],
        homepage: null,
        imdb_id: null,
        production_companies: [],
        production_countries: [],
        revenue: 0,
        runtime: null,
        spoken_languages: [],
        status: 'Unknown',
        tagline: null,
      };

      mockedHttpClient.get.mockResolvedValue(incompleteDetails);

      const result = await movieService.getMovieDetails(1);
      expect(result).toEqual(incompleteDetails);
    });
  });
});