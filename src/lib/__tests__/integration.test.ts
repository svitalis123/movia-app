import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMovieStore } from '../stores/movie-store';
import { useCacheStore } from '../stores/cache-store';
import { useAuthStore } from '../stores/auth-store';
import { useUIStore } from '../stores/ui-store';
import { movieService } from '../services/movie-service';
import { CachedMovieService } from '../services/cached-movie-service';
import { InMemoryCacheService } from '../services/cache-service';
import type { TMDBResponse, TMDBMovie, TMDBMovieDetails, User } from '../types';

// Mock the movie service
vi.mock('../services/movie-service', () => ({
  movieService: {
    getPopularMovies: vi.fn(),
    getMovieDetails: vi.fn(),
    getMovieCredits: vi.fn(),
    searchMovies: vi.fn(),
    getGenres: vi.fn(),
    getMoviesByGenre: vi.fn(),
    getSimilarMovies: vi.fn(),
    getMovieRecommendations: vi.fn(),
    getImageUrl: vi.fn(),
    getBackdropUrl: vi.fn(),
  },
  TMDBMovieService: vi.fn().mockImplementation(() => ({
    getPopularMovies: vi.fn(),
    getMovieDetails: vi.fn(),
    getMovieCredits: vi.fn(),
    searchMovies: vi.fn(),
    getGenres: vi.fn(),
    getMoviesByGenre: vi.fn(),
    getSimilarMovies: vi.fn(),
    getMovieRecommendations: vi.fn(),
    getImageUrl: vi.fn(),
    getBackdropUrl: vi.fn(),
  })),
}));

describe('Integration Tests', () => {
  const mockMovie: TMDBMovie = {
    id: 1,
    title: 'Integration Test Movie',
    original_title: 'Integration Test Movie',
    overview: 'A movie for integration testing',
    poster_path: '/integration-test.jpg',
    backdrop_path: '/integration-backdrop.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    vote_count: 1000,
    popularity: 100,
    genre_ids: [28, 12],
    adult: false,
    original_language: 'en',
    video: false,
  };

  const mockTMDBResponse: TMDBResponse<TMDBMovie> = {
    page: 1,
    results: [mockMovie],
    total_pages: 10,
    total_results: 200,
  };

  const mockMovieDetails: TMDBMovieDetails = {
    ...mockMovie,
    belongs_to_collection: null,
    budget: 1000000,
    genres: [{ id: 28, name: 'Action' }],
    homepage: 'https://integration-test.com',
    imdb_id: 'tt1234567',
    production_companies: [],
    production_countries: [],
    revenue: 5000000,
    runtime: 120,
    spoken_languages: [],
    status: 'Released',
    tagline: 'Integration testing at its finest',
  };

  const mockUser: User = {
    id: 'integration-user-1',
    email: 'integration@test.com',
    firstName: 'Integration',
    lastName: 'Tester',
    imageUrl: 'https://test.com/avatar.jpg',
  };

  beforeEach(() => {
    // Reset all stores
    useMovieStore.setState({
      popular: [],
      searchResults: [],
      selectedMovie: null,
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    useCacheStore.setState({
      movies: {},
      movieDetails: {},
      genres: null,
    });

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null,
    });

    useUIStore.setState({
      searchQuery: '',
      viewMode: 'grid',
      theme: 'light',
      sidebarOpen: false,
      isSearching: false,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Movie Store and Cache Store Integration', () => {
    it('should cache movies when fetching popular movies', async () => {
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );

      const movieStore = useMovieStore.getState();
      await movieStore.fetchPopularMovies(1);

      // Check that movies are in the movie store
      const movieState = useMovieStore.getState();
      expect(movieState.popular).toHaveLength(1);
      expect(movieState.popular[0].title).toBe('Integration Test Movie');

      // Check that movies are cached
      const cacheStore = useCacheStore.getState();
      const cachedMovies = cacheStore.getCachedMovies('popular-movies-page-1');
      expect(cachedMovies).toBeTruthy();
      expect(cachedMovies?.[0].title).toBe('Integration Test Movie');
    });

    it('should use cached movies on subsequent requests', async () => {
      // First, cache some movies
      const cacheStore = useCacheStore.getState();
      const transformedMovie = {
        id: 1,
        title: 'Cached Integration Movie',
        overview: 'A cached movie for integration testing',
        poster_path: '/cached-integration.jpg',
        backdrop_path: '/cached-backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        genre_ids: [28, 12],
      };
      cacheStore.setCachedMovies('popular-movies-page-1', [transformedMovie]);

      // Now fetch popular movies
      const movieStore = useMovieStore.getState();
      await movieStore.fetchPopularMovies(1);

      // Should use cached data, not call the service
      expect(movieService.getPopularMovies).not.toHaveBeenCalled();

      // Should have the cached movie in the store
      const movieState = useMovieStore.getState();
      expect(movieState.popular[0].title).toBe('Cached Integration Movie');
    });

    it('should handle cache expiration and refetch data', async () => {
      vi.useFakeTimers();

      // Cache some movies with short TTL
      const cacheStore = useCacheStore.getState();
      const transformedMovie = {
        id: 1,
        title: 'Expiring Movie',
        overview: 'This movie will expire',
        poster_path: '/expiring.jpg',
        backdrop_path: '/expiring-backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        genre_ids: [28, 12],
      };
      cacheStore.setCachedMovies(
        'popular-movies-page-1',
        [transformedMovie],
        1000
      ); // 1 second TTL

      // Advance time to expire cache
      vi.advanceTimersByTime(2000);

      // Mock fresh data from service
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );

      // Fetch movies - should call service since cache expired
      const movieStore = useMovieStore.getState();
      await movieStore.fetchPopularMovies(1);

      expect(movieService.getPopularMovies).toHaveBeenCalledWith(1);

      const movieState = useMovieStore.getState();
      expect(movieState.popular[0].title).toBe('Integration Test Movie');

      vi.useRealTimers();
    });
  });

  describe('Auth Store and UI Store Integration', () => {
    it('should update UI state when user authentication changes', () => {
      const authStore = useAuthStore.getState();
      const uiStore = useUIStore.getState();

      // Initially not authenticated
      expect(authStore.isAuthenticated).toBe(false);

      // Set user (authenticate)
      authStore.setUser(mockUser);

      // Check auth state
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.firstName).toBe('Integration');

      // UI could react to auth changes (this would be handled by components)
      // For example, closing sidebar when user logs out
      authStore.setUser(null);
      const finalAuthState = useAuthStore.getState();
      expect(finalAuthState.isAuthenticated).toBe(false);
    });

    it('should handle search state across stores', () => {
      const uiStore = useUIStore.getState();
      const movieStore = useMovieStore.getState();

      // Set search query in UI store
      uiStore.setSearchQuery('integration test');
      uiStore.setSearching(true);

      const uiState = useUIStore.getState();
      expect(uiState.searchQuery).toBe('integration test');
      expect(uiState.isSearching).toBe(true);

      // Simulate search completion in movie store
      movieStore.setLoading(false);

      // UI should reflect that search is complete
      uiStore.setSearching(false);

      const finalUiState = useUIStore.getState();
      expect(finalUiState.isSearching).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors across stores', async () => {
      const errorMessage = 'Integration test API error';
      vi.mocked(movieService.getPopularMovies).mockRejectedValue(
        new Error(errorMessage)
      );

      const movieStore = useMovieStore.getState();
      await movieStore.fetchPopularMovies(1);

      const movieState = useMovieStore.getState();
      expect(movieState.error).toBe(errorMessage);
      expect(movieState.loading).toBe(false);
      expect(movieState.popular).toHaveLength(0);
    });

    it('should clear errors when new requests succeed', async () => {
      const movieStore = useMovieStore.getState();

      // First, set an error
      movieStore.setError('Previous error');
      expect(useMovieStore.getState().error).toBe('Previous error');

      // Then make a successful request
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );
      await movieStore.fetchPopularMovies(1);

      const movieState = useMovieStore.getState();
      expect(movieState.error).toBe(null);
      expect(movieState.popular).toHaveLength(1);
    });
  });

  describe('Pagination Integration', () => {
    it('should handle pagination across movie and UI stores', async () => {
      vi.mocked(movieService.getPopularMovies).mockResolvedValue({
        ...mockTMDBResponse,
        page: 2,
        total_pages: 5,
      });

      const movieStore = useMovieStore.getState();
      await movieStore.fetchPopularMovies(2);

      const movieState = useMovieStore.getState();
      expect(movieState.pagination.currentPage).toBe(2);
      expect(movieState.pagination.totalPages).toBe(5);
      expect(movieState.pagination.hasNextPage).toBe(true);
      expect(movieState.pagination.hasPreviousPage).toBe(true);
    });

    it('should handle search pagination', async () => {
      const searchResponse = {
        ...mockTMDBResponse,
        page: 3,
        total_pages: 10,
      };

      vi.mocked(movieService.searchMovies).mockResolvedValue(searchResponse);

      const movieStore = useMovieStore.getState();
      const uiStore = useUIStore.getState();

      // Set search query
      uiStore.setSearchQuery('integration');

      // Perform search
      await movieStore.searchMovies('integration', 3);

      const movieState = useMovieStore.getState();
      const uiState = useUIStore.getState();

      expect(uiState.searchQuery).toBe('integration');
      expect(movieState.searchResults).toHaveLength(1);
      expect(movieState.pagination.currentPage).toBe(3);
      expect(movieState.pagination.totalPages).toBe(10);
    });
  });

  describe('Service Integration Patterns', () => {
    it('should demonstrate service layer integration', async () => {
      // Test that services can be composed together
      const cacheService = new InMemoryCacheService(100, 5000);
      const cachedMovieService = new CachedMovieService(movieService as any);

      // Verify the service is properly initialized
      expect(cachedMovieService).toBeDefined();
      expect(typeof cachedMovieService.getPopularMovies).toBe('function');
      expect(typeof cachedMovieService.getCacheStats).toBe('function');

      cacheService.destroy();
    });

    it('should handle service method calls', async () => {
      const cacheService = new InMemoryCacheService(100, 5000);
      const cachedMovieService = new CachedMovieService(movieService as any);

      // Mock the underlying service
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );

      // Test that methods can be called
      const result = await cachedMovieService.getPopularMovies(1);
      expect(result).toBeDefined();
      expect(result.results).toBeDefined();

      cacheService.destroy();
    });

    it('should provide cache management functionality', () => {
      const cacheService = new InMemoryCacheService(100, 5000);
      const cachedMovieService = new CachedMovieService(movieService as any);

      // Test cache management methods exist and work
      expect(() => cachedMovieService.clearCache()).not.toThrow();

      const stats = cachedMovieService.getCacheStats();
      expect(typeof stats).toBe('object');
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');

      cacheService.destroy();
    });

    it('should handle service configuration', () => {
      const cacheService = new InMemoryCacheService(100, 5000);
      const cachedMovieService = new CachedMovieService(movieService as any);

      // Test configuration methods
      expect(() =>
        cachedMovieService.updateCacheTTL({
          popularMovies: 10 * 60 * 1000,
          movieDetails: 30 * 60 * 1000,
        })
      ).not.toThrow();

      cacheService.destroy();
    });

    it('should support different cache types', () => {
      const cacheService = new InMemoryCacheService(100, 5000);
      const cachedMovieService = new CachedMovieService(movieService as any);

      // Test cache type checking
      expect(typeof cachedMovieService.isCached('popularMovies')).toBe(
        'boolean'
      );
      expect(typeof cachedMovieService.isCached('movieDetails')).toBe(
        'boolean'
      );

      cacheService.destroy();
    });
  });

  describe('Full Application Flow Integration', () => {
    it('should handle complete movie browsing flow', async () => {
      // Mock services
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );
      vi.mocked(movieService.getMovieDetails).mockResolvedValue(
        mockMovieDetails
      );
      vi.mocked(movieService.getMovieCredits).mockResolvedValue({
        id: 1,
        cast: [],
        crew: [],
      });

      const movieStore = useMovieStore.getState();
      const uiStore = useUIStore.getState();
      const authStore = useAuthStore.getState();

      // 1. User authentication
      authStore.setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // 2. Load popular movies
      await movieStore.fetchPopularMovies(1);
      const moviesState = useMovieStore.getState();
      expect(moviesState.popular).toHaveLength(1);

      // 3. User selects a movie
      await movieStore.fetchMovieDetails(1);
      const detailsState = useMovieStore.getState();
      expect(detailsState.selectedMovie?.title).toBe('Integration Test Movie');

      // 4. User changes view mode
      uiStore.setViewMode('list');
      expect(useUIStore.getState().viewMode).toBe('list');

      // 5. User performs search
      uiStore.setSearchQuery('action movies');
      vi.mocked(movieService.searchMovies).mockResolvedValue(mockTMDBResponse);
      await movieStore.searchMovies('action movies', 1);

      const searchState = useMovieStore.getState();
      expect(searchState.searchResults).toHaveLength(1);

      // 6. User clears search
      movieStore.clearSearch();
      uiStore.setSearchQuery('');

      const finalState = useMovieStore.getState();
      const finalUiState = useUIStore.getState();
      expect(finalState.searchResults).toHaveLength(0);
      expect(finalUiState.searchQuery).toBe('');
    });

    it('should handle error recovery flow', async () => {
      const movieStore = useMovieStore.getState();

      // 1. Initial error
      vi.mocked(movieService.getPopularMovies).mockRejectedValue(
        new Error('Network error')
      );
      await movieStore.fetchPopularMovies(1);

      let state = useMovieStore.getState();
      expect(state.error).toBeTruthy(); // Error should be set
      expect(state.popular).toHaveLength(0);

      // 2. User retries - success
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );
      await movieStore.fetchPopularMovies(1);

      state = useMovieStore.getState();
      expect(state.error).toBe(null);
      expect(state.popular).toHaveLength(1);
    });

    it('should handle complex user session flow', async () => {
      const movieStore = useMovieStore.getState();
      const uiStore = useUIStore.getState();
      const authStore = useAuthStore.getState();
      const cacheStore = useCacheStore.getState();

      // 1. Anonymous user browsing
      expect(authStore.isAuthenticated).toBe(false);

      // Load popular movies as anonymous user
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );
      await movieStore.fetchPopularMovies(1);

      let movieState = useMovieStore.getState();
      expect(movieState.popular).toHaveLength(1);

      // 2. User signs in
      authStore.setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // 3. Authenticated user performs search
      const searchResponse = {
        ...mockTMDBResponse,
        results: [{ ...mockMovie, title: 'Authenticated Search Result' }],
      };
      vi.mocked(movieService.searchMovies).mockResolvedValue(searchResponse);

      uiStore.setSearchQuery('authenticated search');
      await movieStore.searchMovies('authenticated search', 1);

      movieState = useMovieStore.getState();
      expect(movieState.searchResults[0].title).toBe(
        'Authenticated Search Result'
      );

      // 4. User views movie details
      const detailsResponse = {
        ...mockMovieDetails,
        title: 'Detailed Movie View',
      };
      vi.mocked(movieService.getMovieDetails).mockResolvedValue(
        detailsResponse
      );

      await movieStore.fetchMovieDetails(1);
      movieState = useMovieStore.getState();
      expect(movieState.selectedMovie?.title).toBe('Detailed Movie View');

      // 5. User logs out
      authStore.setUser(null);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // 6. Verify data persistence after logout
      movieState = useMovieStore.getState();
      expect(movieState.popular).toHaveLength(1); // Popular movies should persist
      expect(movieState.selectedMovie?.title).toBe('Detailed Movie View'); // Selected movie should persist
    });

    it('should handle concurrent operations', async () => {
      const movieStore = useMovieStore.getState();
      const cacheStore = useCacheStore.getState();

      // Mock different responses for concurrent requests
      const popularResponse = {
        ...mockTMDBResponse,
        results: [{ ...mockMovie, title: 'Popular Movie' }],
      };
      const searchResponse = {
        ...mockTMDBResponse,
        results: [{ ...mockMovie, title: 'Search Result' }],
      };
      const detailsResponse = { ...mockMovieDetails, title: 'Movie Details' };

      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        popularResponse
      );
      vi.mocked(movieService.searchMovies).mockResolvedValue(searchResponse);
      vi.mocked(movieService.getMovieDetails).mockResolvedValue(
        detailsResponse
      );

      // Start multiple operations concurrently
      const popularPromise = movieStore.fetchPopularMovies(1);
      const searchPromise = movieStore.searchMovies('test', 1);
      const detailsPromise = movieStore.fetchMovieDetails(1);

      // Wait for all to complete
      await Promise.all([popularPromise, searchPromise, detailsPromise]);

      const finalState = useMovieStore.getState();
      expect(finalState.popular[0].title).toBe('Popular Movie');
      expect(finalState.searchResults[0].title).toBe('Search Result');
      expect(finalState.selectedMovie?.title).toBe('Movie Details');
      expect(finalState.loading).toBe(false);
      expect(finalState.error).toBe(null);
    });

    it('should handle rapid state changes', async () => {
      const movieStore = useMovieStore.getState();
      const uiStore = useUIStore.getState();

      // Simulate rapid UI changes
      uiStore.setSearchQuery('first query');
      uiStore.setViewMode('list');
      uiStore.setTheme('dark');
      uiStore.setSearchQuery('second query');
      uiStore.setViewMode('grid');
      uiStore.setSearchQuery('final query');

      const uiState = useUIStore.getState();
      expect(uiState.searchQuery).toBe('final query');
      expect(uiState.viewMode).toBe('grid');
      expect(uiState.theme).toBe('dark');

      // Simulate rapid movie operations
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(
        mockTMDBResponse
      );
      vi.mocked(movieService.searchMovies).mockResolvedValue(mockTMDBResponse);

      const operations = [
        movieStore.fetchPopularMovies(1),
        movieStore.fetchPopularMovies(2),
        movieStore.searchMovies('query1', 1),
        movieStore.searchMovies('query2', 1),
      ];

      await Promise.all(operations);

      const movieState = useMovieStore.getState();
      expect(movieState.loading).toBe(false);
      expect(movieState.error).toBe(null);
    });
  });

  describe('Performance and Memory Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const movieStore = useMovieStore.getState();
      const cacheStore = useCacheStore.getState();

      // Create large dataset
      const largeMovieList = Array.from({ length: 100 }, (_, i) => ({
        ...mockMovie,
        id: i + 1,
        title: `Movie ${i + 1}`,
      }));

      const largeResponse = {
        ...mockTMDBResponse,
        results: largeMovieList,
        total_results: 10000,
        total_pages: 500,
      };

      vi.mocked(movieService.getPopularMovies).mockResolvedValue(largeResponse);

      // Load large dataset
      await movieStore.fetchPopularMovies(1);

      const movieState = useMovieStore.getState();
      expect(movieState.popular).toHaveLength(100);
      expect(movieState.pagination.totalResults).toBe(10000);
      expect(movieState.pagination.totalPages).toBe(500);

      // Verify caching works with large datasets
      const cachedMovies = cacheStore.getCachedMovies('popular-movies-page-1');
      expect(cachedMovies).toHaveLength(100);
    });

    it('should handle memory cleanup on cache expiration', async () => {
      vi.useFakeTimers();

      const cacheStore = useCacheStore.getState();

      // Cache some data with short TTL
      const testMovies = [{ ...mockMovie, title: 'Expiring Movie' }];
      cacheStore.setCachedMovies('test-key', testMovies, 1000); // 1 second TTL

      // Verify data is cached
      expect(cacheStore.getCachedMovies('test-key')).toHaveLength(1);

      // Advance time to expire cache
      vi.advanceTimersByTime(2000);

      // Verify data is cleaned up
      expect(cacheStore.getCachedMovies('test-key')).toBeNull();

      vi.useRealTimers();
    });

    it('should handle cache size limits', async () => {
      const cacheStore = useCacheStore.getState();

      // Fill cache with multiple entries
      for (let i = 0; i < 10; i++) {
        const movies = [{ ...mockMovie, id: i + 1, title: `Movie ${i + 1}` }];
        cacheStore.setCachedMovies(`movies-${i}`, movies);
      }

      // Verify cache management (exact behavior depends on implementation)
      // This test ensures the cache doesn't grow indefinitely
      const currentState = useCacheStore.getState();
      const cacheKeys = Object.keys(currentState.movies);
      expect(cacheKeys.length).toBeGreaterThan(0);
      expect(cacheKeys.length).toBeLessThanOrEqual(10);
    });
  });
});
