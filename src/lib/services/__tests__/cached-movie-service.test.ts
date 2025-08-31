import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CachedMovieService } from '../cached-movie-service';
import { TMDBMovieService } from '../movie-service';
import { InMemoryCacheService } from '../cache-service';

describe('CachedMovieService', () => {
  let cachedMovieService: CachedMovieService;
  let mockMovieService: TMDBMovieService;
  let realCacheService: InMemoryCacheService;

  beforeEach(() => {
    // Create a real cache service for integration testing
    realCacheService = new InMemoryCacheService(100, 1000); // Small cache for testing
    
    // Create mock movie service
    mockMovieService = {
      getPopularMovies: vi.fn(),
      getMovieDetails: vi.fn(),
      getMovieCredits: vi.fn(),
      searchMovies: vi.fn(),
      getGenres: vi.fn(),
      getMoviesByGenre: vi.fn(),
      getSimilarMovies: vi.fn(),
      getMovieRecommendations: vi.fn(),
      getImageUrl: vi.fn().mockReturnValue('https://image.tmdb.org/t/p/w500/test.jpg'),
      getBackdropUrl: vi.fn().mockReturnValue('https://image.tmdb.org/t/p/w1280/backdrop.jpg'),
    } as any;

    cachedMovieService = new CachedMovieService(mockMovieService);
  });

  afterEach(() => {
    realCacheService.destroy();
    vi.restoreAllMocks();
  });

  describe('cached API methods', () => {
    it('should cache popular movies and return cached result on second call', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Test Movie' } as any],
        total_pages: 10,
        total_results: 200,
      };

      mockMovieService.getPopularMovies.mockResolvedValue(mockResponse);

      // First call should hit the service
      const result1 = await cachedMovieService.getPopularMovies(1);
      expect(mockMovieService.getPopularMovies).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockResponse);

      // Second call should use cache
      const result2 = await cachedMovieService.getPopularMovies(1);
      expect(mockMovieService.getPopularMovies).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(result2).toEqual(mockResponse);
    });

    it('should cache movie details', async () => {
      const mockDetails = {
        id: 1,
        title: 'Test Movie',
        overview: 'Test overview',
      } as any;

      mockMovieService.getMovieDetails.mockResolvedValue(mockDetails);

      const result1 = await cachedMovieService.getMovieDetails(1);
      expect(mockMovieService.getMovieDetails).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockDetails);

      // Second call should use cache
      const result2 = await cachedMovieService.getMovieDetails(1);
      expect(mockMovieService.getMovieDetails).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockDetails);
    });

    it('should cache search results', async () => {
      const mockSearchResults = {
        page: 1,
        results: [{ id: 1, title: 'Search Result' } as any],
        total_pages: 5,
        total_results: 100,
      };

      mockMovieService.searchMovies.mockResolvedValue(mockSearchResults);

      const result1 = await cachedMovieService.searchMovies('test query', 1);
      expect(mockMovieService.searchMovies).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockSearchResults);

      // Second call should use cache
      const result2 = await cachedMovieService.searchMovies('test query', 1);
      expect(mockMovieService.searchMovies).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(mockSearchResults);
    });
  });

  describe('utility methods', () => {
    it('should delegate image URL generation to movie service', () => {
      const mockUrl = 'https://image.tmdb.org/t/p/w500/test.jpg';
      mockMovieService.getImageUrl.mockReturnValue(mockUrl);

      const result = cachedMovieService.getImageUrl('/test.jpg', 'w500');

      expect(mockMovieService.getImageUrl).toHaveBeenCalledWith('/test.jpg', 'w500');
      expect(result).toBe(mockUrl);
    });

    it('should delegate backdrop URL generation to movie service', () => {
      const mockUrl = 'https://image.tmdb.org/t/p/w1280/backdrop.jpg';
      mockMovieService.getBackdropUrl.mockReturnValue(mockUrl);

      const result = cachedMovieService.getBackdropUrl('/backdrop.jpg', 'w1280');

      expect(mockMovieService.getBackdropUrl).toHaveBeenCalledWith('/backdrop.jpg', 'w1280');
      expect(result).toBe(mockUrl);
    });
  });

  describe('cache management', () => {
    it('should clear all cache', () => {
      // Add some data to cache first
      cachedMovieService.clearCache();
      expect(() => cachedMovieService.clearCache()).not.toThrow();
    });

    it('should get cache statistics', () => {
      const stats = cachedMovieService.getCacheStats();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
    });
  });

  describe('preloading methods', () => {
    it('should preload popular movies', async () => {
      mockMovieService.getPopularMovies.mockResolvedValue({
        page: 1,
        results: [],
        total_pages: 10,
        total_results: 200,
      });

      await cachedMovieService.preloadPopularMovies(2);

      expect(mockMovieService.getPopularMovies).toHaveBeenCalledTimes(2); // 2 pages
    });

    it('should preload genres', async () => {
      mockMovieService.getGenres.mockResolvedValue({ genres: [] });

      await cachedMovieService.preloadGenres();

      expect(mockMovieService.getGenres).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache checking', () => {
    it('should return false for invalid cache type', () => {
      const result = cachedMovieService.isCached('invalid' as any);
      expect(result).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should update cache TTL configuration', () => {
      const newConfig = {
        popularMovies: 20 * 60 * 1000, // 20 minutes
        movieDetails: 2 * 60 * 60 * 1000, // 2 hours
      };

      expect(() => cachedMovieService.updateCacheTTL(newConfig)).not.toThrow();
    });
  });
});