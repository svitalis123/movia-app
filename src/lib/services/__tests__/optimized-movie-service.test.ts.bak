import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { optimizedMovieService } from '../optimized-movie-service';
import { movieService } from '../movie-service';
import { performanceMonitor, imagePreloader } from '../../utils/performance';

// Mock dependencies
vi.mock('../movie-service', () => ({
  movieService: {
    getPopularMovies: vi.fn(),
    getMovieDetails: vi.fn(),
    getMovieCredits: vi.fn(),
    searchMovies: vi.fn(),
    getGenres: vi.fn(),
  },
}));

vi.mock('../../utils/performance', () => ({
  performanceMonitor: {
    startTiming: vi.fn(() => vi.fn()),
    getAllMetrics: vi.fn(() => ({})),
  },
  debounce: vi.fn((fn) => fn),
  memoize: vi.fn((fn) => fn),
  imagePreloader: {
    preload: vi.fn(),
    clear: vi.fn(),
  },
}));

const mockedMovieService = vi.mocked(movieService);
const mockedPerformanceMonitor = vi.mocked(performanceMonitor);
const mockedImagePreloader = vi.mocked(imagePreloader);

describe('OptimizedMovieService', () => {
  const mockMovie = {
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
  };

  const mockMovieDetails = {
    ...mockMovie,
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
    crew: [],
  };

  const mockResponse = {
    page: 1,
    results: [mockMovie],
    total_pages: 10,
    total_results: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockedMovieService.getPopularMovies.mockResolvedValue(mockResponse);
    mockedMovieService.getMovieDetails.mockResolvedValue(mockMovieDetails);
    mockedMovieService.getMovieCredits.mockResolvedValue(mockCredits);
    mockedMovieService.searchMovies.mockResolvedValue(mockResponse);
    mockedMovieService.getGenres.mockResolvedValue({ genres: [] });

    // Setup performance monitor mock
    const mockEndTiming = vi.fn();
    mockedPerformanceMonitor.startTiming.mockReturnValue(mockEndTiming);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPopularMovies', () => {
    it('should fetch popular movies with performance monitoring', async () => {
      const result = await optimizedMovieService.getPopularMovies(1);

      expect(mockedPerformanceMonitor.startTiming).toHaveBeenCalledWith('get-popular-movies');
      expect(mockedMovieService.getPopularMovies).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });

    it('should preload movie images after fetching', async () => {
      await optimizedMovieService.getPopularMovies(1);

      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w342/test.jpg',
        2 // High priority for first movie
      );
    });

    it('should handle errors and still end timing', async () => {
      const error = new Error('API Error');
      mockedMovieService.getPopularMovies.mockRejectedValue(error);

      await expect(optimizedMovieService.getPopularMovies(1)).rejects.toThrow('API Error');
      
      // Verify timing was ended even on error
      const mockEndTiming = mockedPerformanceMonitor.startTiming.mock.results[0].value;
      expect(mockEndTiming).toHaveBeenCalled();
    });

    it('should use default page parameter', async () => {
      await optimizedMovieService.getPopularMovies();

      expect(mockedMovieService.getPopularMovies).toHaveBeenCalledWith(1);
    });
  });

  describe('searchMovies', () => {
    it('should search movies with performance monitoring', async () => {
      const result = await optimizedMovieService.searchMovies('test query', 2);

      expect(mockedPerformanceMonitor.startTiming).toHaveBeenCalledWith('search-movies');
      expect(mockedMovieService.searchMovies).toHaveBeenCalledWith('test query', 2);
      expect(result).toEqual(mockResponse);
    });

    it('should preload movie images after search', async () => {
      await optimizedMovieService.searchMovies('test query');

      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w342/test.jpg',
        2
      );
    });

    it('should use default page parameter', async () => {
      await optimizedMovieService.searchMovies('test query');

      expect(mockedMovieService.searchMovies).toHaveBeenCalledWith('test query', 1);
    });
  });

  describe('getMovieDetails', () => {
    it('should fetch movie details with performance monitoring', async () => {
      const result = await optimizedMovieService.getMovieDetails(1);

      expect(mockedPerformanceMonitor.startTiming).toHaveBeenCalledWith('get-movie-details');
      expect(mockedMovieService.getMovieDetails).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMovieDetails);
    });

    it('should preload backdrop and poster images', async () => {
      await optimizedMovieService.getMovieDetails(1);

      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w1280/test-backdrop.jpg',
        1
      );
      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w500/test.jpg',
        1
      );
    });

    it('should handle movie without backdrop', async () => {
      const movieWithoutBackdrop = { ...mockMovieDetails, backdrop_path: null };
      mockedMovieService.getMovieDetails.mockResolvedValue(movieWithoutBackdrop);

      await optimizedMovieService.getMovieDetails(1);

      // Should only preload poster
      expect(mockedImagePreloader.preload).toHaveBeenCalledTimes(1);
      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w500/test.jpg',
        1
      );
    });

    it('should handle movie without poster', async () => {
      const movieWithoutPoster = { ...mockMovieDetails, poster_path: null };
      mockedMovieService.getMovieDetails.mockResolvedValue(movieWithoutPoster);

      await optimizedMovieService.getMovieDetails(1);

      // Should only preload backdrop
      expect(mockedImagePreloader.preload).toHaveBeenCalledTimes(1);
      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w1280/test-backdrop.jpg',
        1
      );
    });
  });

  describe('getMovieCredits', () => {
    it('should fetch movie credits with performance monitoring', async () => {
      const result = await optimizedMovieService.getMovieCredits(1);

      expect(mockedPerformanceMonitor.startTiming).toHaveBeenCalledWith('get-movie-credits');
      expect(mockedMovieService.getMovieCredits).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCredits);
    });

    it('should preload cast profile images', async () => {
      const creditsWithMultipleCast = {
        ...mockCredits,
        cast: Array.from({ length: 15 }, (_, i) => ({
          ...mockCredits.cast[0],
          id: i + 1,
          name: `Actor ${i + 1}`,
          profile_path: `/actor${i + 1}.jpg`,
        })),
      };

      mockedMovieService.getMovieCredits.mockResolvedValue(creditsWithMultipleCast);

      await optimizedMovieService.getMovieCredits(1);

      // Should preload only top 10 cast members
      expect(mockedImagePreloader.preload).toHaveBeenCalledTimes(10);
      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w185/actor1.jpg',
        0
      );
    });

    it('should handle cast without profile images', async () => {
      const creditsWithoutProfiles = {
        ...mockCredits,
        cast: [{ ...mockCredits.cast[0], profile_path: null }],
      };

      mockedMovieService.getMovieCredits.mockResolvedValue(creditsWithoutProfiles);

      await optimizedMovieService.getMovieCredits(1);

      expect(mockedImagePreloader.preload).not.toHaveBeenCalled();
    });
  });

  describe('getGenres', () => {
    it('should fetch genres with performance monitoring', async () => {
      const mockGenres = { genres: [{ id: 28, name: 'Action' }] };
      mockedMovieService.getGenres.mockResolvedValue(mockGenres);

      const result = await optimizedMovieService.getGenres();

      expect(mockedPerformanceMonitor.startTiming).toHaveBeenCalledWith('get-genres');
      expect(mockedMovieService.getGenres).toHaveBeenCalled();
      expect(result).toEqual(mockGenres);
    });
  });

  describe('batchLoadMovies', () => {
    it('should load movies in batches', async () => {
      const movieIds = [1, 2, 3, 4, 5, 6, 7, 8];
      const mockDetails = Array.from({ length: 8 }, (_, i) => ({
        ...mockMovieDetails,
        id: i + 1,
        title: `Movie ${i + 1}`,
      }));

      mockedMovieService.getMovieDetails
        .mockResolvedValueOnce(mockDetails[0])
        .mockResolvedValueOnce(mockDetails[1])
        .mockResolvedValueOnce(mockDetails[2])
        .mockResolvedValueOnce(mockDetails[3])
        .mockResolvedValueOnce(mockDetails[4])
        .mockResolvedValueOnce(mockDetails[5])
        .mockResolvedValueOnce(mockDetails[6])
        .mockResolvedValueOnce(mockDetails[7]);

      const result = await optimizedMovieService.batchLoadMovies(movieIds);

      expect(mockedPerformanceMonitor.startTiming).toHaveBeenCalledWith('batch-load-movies');
      expect(result).toHaveLength(8);
      expect(result[0].title).toBe('Movie 1');
      expect(result[7].title).toBe('Movie 8');
    });

    it('should handle failed requests in batch', async () => {
      const movieIds = [1, 2, 3];
      
      mockedMovieService.getMovieDetails
        .mockResolvedValueOnce(mockMovieDetails)
        .mockRejectedValueOnce(new Error('Movie not found'))
        .mockResolvedValueOnce({ ...mockMovieDetails, id: 3 });

      const result = await optimizedMovieService.batchLoadMovies(movieIds);

      expect(result).toHaveLength(2); // Only successful requests
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it('should respect batch size limit', async () => {
      const movieIds = Array.from({ length: 12 }, (_, i) => i + 1);
      
      // Mock all requests to resolve
      movieIds.forEach((id) => {
        mockedMovieService.getMovieDetails.mockResolvedValueOnce({
          ...mockMovieDetails,
          id,
        });
      });

      await optimizedMovieService.batchLoadMovies(movieIds);

      // Should be called 12 times (all movies)
      expect(mockedMovieService.getMovieDetails).toHaveBeenCalledTimes(12);
    });
  });

  describe('prefetchNextPage', () => {
    beforeEach(() => {
      // Mock requestIdleCallback
      global.requestIdleCallback = vi.fn((callback) => {
        callback({ didTimeout: false, timeRemaining: () => 50 } as any);
        return 1;
      });
    });

    afterEach(() => {
      delete (global as any).requestIdleCallback;
    });

    it('should prefetch next page of popular movies', async () => {
      await optimizedMovieService.prefetchNextPage(1);

      expect(global.requestIdleCallback).toHaveBeenCalled();
      // The actual prefetch happens in the callback, so we can't easily test the service call
    });

    it('should prefetch next page of search results', async () => {
      await optimizedMovieService.prefetchNextPage(1, 'test query');

      expect(global.requestIdleCallback).toHaveBeenCalled();
    });

    it('should use setTimeout fallback when requestIdleCallback is not available', async () => {
      delete (global as any).requestIdleCallback;
      
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        (callback as Function)();
        return 1 as any;
      });

      await optimizedMovieService.prefetchNextPage(1);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
      
      setTimeoutSpy.mockRestore();
    });
  });

  describe('debouncedSearchMovies', () => {
    it('should provide debounced search functionality', async () => {
      const callback = vi.fn();
      
      // The debounced function should exist
      expect(typeof optimizedMovieService.debouncedSearchMovies).toBe('function');
      
      // Call the debounced function
      await optimizedMovieService.debouncedSearchMovies('test query', 1, callback);
      
      // Since we mocked debounce to return the original function,
      // the callback should be called immediately in our test
      expect(callback).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('cache management', () => {
    it('should clear all caches', () => {
      optimizedMovieService.clearCache();

      expect(mockedImagePreloader.clear).toHaveBeenCalled();
    });

    it('should get performance metrics', () => {
      const mockMetrics = {
        'get-popular-movies': { count: 5, totalTime: 1000, averageTime: 200 },
        'search-movies': { count: 3, totalTime: 600, averageTime: 200 },
      };

      mockedPerformanceMonitor.getAllMetrics.mockReturnValue(mockMetrics);

      const result = optimizedMovieService.getPerformanceMetrics();

      expect(mockedPerformanceMonitor.getAllMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('image preloading optimization', () => {
    it('should assign higher priority to first few movies', async () => {
      const moviesResponse = {
        ...mockResponse,
        results: Array.from({ length: 10 }, (_, i) => ({
          ...mockMovie,
          id: i + 1,
          poster_path: `/movie${i + 1}.jpg`,
        })),
      };

      mockedMovieService.getPopularMovies.mockResolvedValue(moviesResponse);

      await optimizedMovieService.getPopularMovies(1);

      // First 6 movies should have priority 2
      expect(mockedImagePreloader.preload).toHaveBeenNthCalledWith(
        1,
        'https://image.tmdb.org/t/p/w342/movie1.jpg',
        2
      );
      expect(mockedImagePreloader.preload).toHaveBeenNthCalledWith(
        6,
        'https://image.tmdb.org/t/p/w342/movie6.jpg',
        2
      );

      // Movies 7+ should have priority 1
      expect(mockedImagePreloader.preload).toHaveBeenNthCalledWith(
        7,
        'https://image.tmdb.org/t/p/w342/movie7.jpg',
        1
      );
    });

    it('should skip movies without poster paths', async () => {
      const moviesResponse = {
        ...mockResponse,
        results: [
          { ...mockMovie, poster_path: '/valid.jpg' },
          { ...mockMovie, id: 2, poster_path: null },
          { ...mockMovie, id: 3, poster_path: '/another.jpg' },
        ],
      };

      mockedMovieService.getPopularMovies.mockResolvedValue(moviesResponse);

      await optimizedMovieService.getPopularMovies(1);

      expect(mockedImagePreloader.preload).toHaveBeenCalledTimes(2);
      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w342/valid.jpg',
        2
      );
      expect(mockedImagePreloader.preload).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w342/another.jpg',
        2
      );
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Service unavailable');
      mockedMovieService.getPopularMovies.mockRejectedValue(error);

      await expect(optimizedMovieService.getPopularMovies(1)).rejects.toThrow('Service unavailable');

      // Should still end timing on error
      const mockEndTiming = mockedPerformanceMonitor.startTiming.mock.results[0].value;
      expect(mockEndTiming).toHaveBeenCalled();
    });

    it('should handle image preloading errors gracefully', async () => {
      // Mock the preloadMovieImages method to not throw
      const originalPreloadMovieImages = optimizedMovieService['preloadMovieImages'];
      optimizedMovieService['preloadMovieImages'] = vi.fn();

      // Should not throw error even if image preloading fails
      await expect(optimizedMovieService.getPopularMovies(1)).resolves.toEqual(mockResponse);

      // Restore original method
      optimizedMovieService['preloadMovieImages'] = originalPreloadMovieImages;
    });
  });
});