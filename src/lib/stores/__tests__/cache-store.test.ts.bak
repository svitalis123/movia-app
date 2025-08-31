import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useCacheStore } from '../cache-store';
import type { Movie, MovieDetails, Genre } from '../../types';

// Mock data
const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'A test movie',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2023-01-01',
  vote_average: 8.5,
  vote_count: 1000,
  genre_ids: [28, 12],
};

const mockMovieDetails: MovieDetails = {
  ...mockMovie,
  runtime: 120,
  genres: [{ id: 28, name: 'Action' }],
  production_companies: [],
  cast: [],
  crew: [],
  budget: 1000000,
  revenue: 5000000,
};

const mockGenres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
];

describe('Cache Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCacheStore.setState({
      movies: {},
      movieDetails: {},
      genres: null,
    });
    
    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('movie caching', () => {
    it('should cache and retrieve movies', () => {
      const store = useCacheStore.getState();
      const movies = [mockMovie];
      
      store.setCachedMovies('test-key', movies);
      const cachedMovies = store.getCachedMovies('test-key');
      
      expect(cachedMovies).toEqual(movies);
    });

    it('should return null for non-existent cache key', () => {
      const store = useCacheStore.getState();
      const cachedMovies = store.getCachedMovies('non-existent-key');
      
      expect(cachedMovies).toBe(null);
    });

    it('should expire cached movies after TTL', () => {
      const store = useCacheStore.getState();
      const movies = [mockMovie];
      const ttl = 5000; // 5 seconds
      
      store.setCachedMovies('test-key', movies, ttl);
      
      // Should be available immediately
      expect(store.getCachedMovies('test-key')).toEqual(movies);
      
      // Advance time beyond TTL
      vi.advanceTimersByTime(ttl + 1000);
      
      // Should be expired and return null
      expect(store.getCachedMovies('test-key')).toBe(null);
      
      // Cache entry should be removed
      const state = useCacheStore.getState();
      expect(state.movies['test-key']).toBeUndefined();
    });

    it('should use default TTL when not specified', () => {
      const store = useCacheStore.getState();
      const movies = [mockMovie];
      
      store.setCachedMovies('test-key', movies);
      
      // Should be available immediately
      expect(store.getCachedMovies('test-key')).toEqual(movies);
      
      // Advance time by default TTL (5 minutes)
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);
      
      // Should be expired
      expect(store.getCachedMovies('test-key')).toBe(null);
    });
  });

  describe('movie details caching', () => {
    it('should cache and retrieve movie details', () => {
      const store = useCacheStore.getState();
      
      store.setCachedMovieDetails(1, mockMovieDetails);
      const cachedDetails = store.getCachedMovieDetails(1);
      
      expect(cachedDetails).toEqual(mockMovieDetails);
    });

    it('should return null for non-existent movie ID', () => {
      const store = useCacheStore.getState();
      const cachedDetails = store.getCachedMovieDetails(999);
      
      expect(cachedDetails).toBe(null);
    });

    it('should expire cached movie details after TTL', () => {
      const store = useCacheStore.getState();
      const ttl = 10000; // 10 seconds
      
      store.setCachedMovieDetails(1, mockMovieDetails, ttl);
      
      // Should be available immediately
      expect(store.getCachedMovieDetails(1)).toEqual(mockMovieDetails);
      
      // Advance time beyond TTL
      vi.advanceTimersByTime(ttl + 1000);
      
      // Should be expired and return null
      expect(store.getCachedMovieDetails(1)).toBe(null);
      
      // Cache entry should be removed
      const state = useCacheStore.getState();
      expect(state.movieDetails[1]).toBeUndefined();
    });
  });

  describe('genres caching', () => {
    it('should cache and retrieve genres', () => {
      const store = useCacheStore.getState();
      
      store.setCachedGenres(mockGenres);
      const cachedGenres = store.getCachedGenres();
      
      expect(cachedGenres).toEqual(mockGenres);
    });

    it('should return null when no genres cached', () => {
      const store = useCacheStore.getState();
      const cachedGenres = store.getCachedGenres();
      
      expect(cachedGenres).toBe(null);
    });

    it('should expire cached genres after TTL', () => {
      const store = useCacheStore.getState();
      const ttl = 15000; // 15 seconds
      
      store.setCachedGenres(mockGenres, ttl);
      
      // Should be available immediately
      expect(store.getCachedGenres()).toEqual(mockGenres);
      
      // Advance time beyond TTL
      vi.advanceTimersByTime(ttl + 1000);
      
      // Should be expired and return null
      expect(store.getCachedGenres()).toBe(null);
      
      // Cache entry should be removed
      const state = useCacheStore.getState();
      expect(state.genres).toBe(null);
    });
  });

  describe('cache clearing', () => {
    beforeEach(() => {
      const store = useCacheStore.getState();
      
      // Set up some cached data
      store.setCachedMovies('popular-movies', [mockMovie]);
      store.setCachedMovies('search-results', [mockMovie]);
      store.setCachedMovieDetails(1, mockMovieDetails);
      store.setCachedGenres(mockGenres);
    });

    it('should clear all cache when no type specified', () => {
      const store = useCacheStore.getState();
      store.clearCache();
      
      const state = useCacheStore.getState();
      expect(state.movies).toEqual({});
      expect(state.movieDetails).toEqual({});
      expect(state.genres).toBe(null);
    });

    it('should clear only movies cache', () => {
      const store = useCacheStore.getState();
      store.clearCache('movies');
      
      const state = useCacheStore.getState();
      expect(state.movies).toEqual({});
      expect(state.movieDetails[1]).toBeTruthy(); // Should still exist
      expect(state.genres).toBeTruthy(); // Should still exist
    });

    it('should clear only movie details cache', () => {
      const store = useCacheStore.getState();
      store.clearCache('movieDetails');
      
      const state = useCacheStore.getState();
      expect(state.movieDetails).toEqual({});
      expect(state.movies['popular-movies']).toBeTruthy(); // Should still exist
      expect(state.genres).toBeTruthy(); // Should still exist
    });

    it('should clear only genres cache', () => {
      const store = useCacheStore.getState();
      store.clearCache('genres');
      
      const state = useCacheStore.getState();
      expect(state.genres).toBe(null);
      expect(state.movies['popular-movies']).toBeTruthy(); // Should still exist
      expect(state.movieDetails[1]).toBeTruthy(); // Should still exist
    });
  });

  describe('utility functions', () => {
    it('should check if movies are cached using state directly', () => {
      const store = useCacheStore.getState();
      store.setCachedMovies('test-key', [mockMovie]);
      
      const state = useCacheStore.getState();
      const cached = state.movies['test-key'];
      const isCached = cached && (Date.now() - cached.timestamp <= cached.ttl);
      
      expect(isCached).toBe(true);
    });

    it('should check if movie details are cached using state directly', () => {
      const store = useCacheStore.getState();
      store.setCachedMovieDetails(1, mockMovieDetails);
      
      const state = useCacheStore.getState();
      const cached = state.movieDetails[1];
      const isCached = cached && (Date.now() - cached.timestamp <= cached.ttl);
      
      expect(isCached).toBe(true);
    });

    it('should check if genres are cached using state directly', () => {
      const store = useCacheStore.getState();
      store.setCachedGenres(mockGenres);
      
      const state = useCacheStore.getState();
      const isCached = state.genres && (Date.now() - state.genres.timestamp <= state.genres.ttl);
      
      expect(isCached).toBe(true);
    });
  });

  describe('cache actions', () => {
    it('should provide all cache action methods via getState', () => {
      const store = useCacheStore.getState();

      expect(typeof store.setCachedMovies).toBe('function');
      expect(typeof store.getCachedMovies).toBe('function');
      expect(typeof store.setCachedMovieDetails).toBe('function');
      expect(typeof store.getCachedMovieDetails).toBe('function');
      expect(typeof store.setCachedGenres).toBe('function');
      expect(typeof store.getCachedGenres).toBe('function');
      expect(typeof store.clearCache).toBe('function');
    });
  });

  describe('multiple cache entries', () => {
    it('should handle multiple movie cache entries', () => {
      const store = useCacheStore.getState();
      
      store.setCachedMovies('popular-page-1', [mockMovie]);
      store.setCachedMovies('popular-page-2', [{ ...mockMovie, id: 2 }]);
      store.setCachedMovies('search-action', [{ ...mockMovie, id: 3 }]);
      
      expect(store.getCachedMovies('popular-page-1')).toHaveLength(1);
      expect(store.getCachedMovies('popular-page-2')).toHaveLength(1);
      expect(store.getCachedMovies('search-action')).toHaveLength(1);
      
      expect(store.getCachedMovies('popular-page-1')?.[0].id).toBe(1);
      expect(store.getCachedMovies('popular-page-2')?.[0].id).toBe(2);
      expect(store.getCachedMovies('search-action')?.[0].id).toBe(3);
    });

    it('should handle multiple movie details cache entries', () => {
      const store = useCacheStore.getState();
      
      store.setCachedMovieDetails(1, mockMovieDetails);
      store.setCachedMovieDetails(2, { ...mockMovieDetails, id: 2 });
      
      expect(store.getCachedMovieDetails(1)?.id).toBe(1);
      expect(store.getCachedMovieDetails(2)?.id).toBe(2);
      expect(store.getCachedMovieDetails(3)).toBe(null);
    });
  });
});