import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMovieStore } from '../movie-store';
import { useCacheStore } from '../cache-store';
import { movieService } from '../../services/movie-service';
import type { TMDBResponse, TMDBMovie, TMDBMovieDetails, TMDBCredits } from '../../types';

// Mock the movie service
vi.mock('../../services/movie-service', () => ({
  movieService: {
    getPopularMovies: vi.fn(),
    getMovieDetails: vi.fn(),
    getMovieCredits: vi.fn(),
    searchMovies: vi.fn(),
    getMoviesByGenre: vi.fn(),
    getSimilarMovies: vi.fn(),
    getMovieRecommendations: vi.fn(),
  },
}));

// Mock data
const mockTMDBMovie: TMDBMovie = {
  id: 1,
  title: 'Test Movie',
  original_title: 'Test Movie',
  overview: 'A test movie',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
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
  results: [mockTMDBMovie],
  total_pages: 10,
  total_results: 200,
};

const mockTMDBMovieDetails: TMDBMovieDetails = {
  ...mockTMDBMovie,
  belongs_to_collection: null,
  budget: 1000000,
  genres: [{ id: 28, name: 'Action' }],
  homepage: 'https://test-movie.com',
  imdb_id: 'tt1234567',
  production_companies: [],
  production_countries: [],
  revenue: 5000000,
  runtime: 120,
  spoken_languages: [],
  status: 'Released',
  tagline: 'A test tagline',
};

const mockTMDBCredits: TMDBCredits = {
  id: 1,
  cast: [
    {
      adult: false,
      gender: 2,
      id: 1,
      known_for_department: 'Acting',
      name: 'Test Actor',
      original_name: 'Test Actor',
      popularity: 50,
      profile_path: '/test-actor.jpg',
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
      popularity: 30,
      profile_path: '/test-director.jpg',
      credit_id: 'credit2',
      department: 'Directing',
      job: 'Director',
    },
  ],
};

describe('Movie Store', () => {
  beforeEach(() => {
    // Reset stores before each test
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

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPopularMovies', () => {
    it('should fetch popular movies successfully', async () => {
      vi.mocked(movieService.getPopularMovies).mockResolvedValue(mockTMDBResponse);

      const store = useMovieStore.getState();
      await store.fetchPopularMovies(1);

      const state = useMovieStore.getState();
      expect(state.popular).toHaveLength(1);
      expect(state.popular[0].title).toBe('Test Movie');
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.pagination.currentPage).toBe(1);
      expect(state.pagination.totalPages).toBe(10);
    });

    it('should handle fetch popular movies error', async () => {
      const errorMessage = 'Network error';
      vi.mocked(movieService.getPopularMovies).mockRejectedValue(new Error(errorMessage));

      const store = useMovieStore.getState();
      await store.fetchPopularMovies(1);

      const state = useMovieStore.getState();
      expect(state.popular).toHaveLength(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should use cached data when available', async () => {
      // Set up cache
      const cacheStore = useCacheStore.getState();
      const transformedMovie = {
        id: 1,
        title: 'Cached Movie',
        overview: 'A cached movie',
        poster_path: '/cached-poster.jpg',
        backdrop_path: '/cached-backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        genre_ids: [28, 12],
      };
      cacheStore.setCachedMovies('popular-movies-page-1', [transformedMovie]);

      const store = useMovieStore.getState();
      await store.fetchPopularMovies(1);

      const state = useMovieStore.getState();
      expect(state.popular[0].title).toBe('Cached Movie');
      expect(movieService.getPopularMovies).not.toHaveBeenCalled();
    });
  });

  describe('fetchMovieDetails', () => {
    it('should fetch movie details successfully', async () => {
      vi.mocked(movieService.getMovieDetails).mockResolvedValue(mockTMDBMovieDetails);
      vi.mocked(movieService.getMovieCredits).mockResolvedValue(mockTMDBCredits);

      const store = useMovieStore.getState();
      await store.fetchMovieDetails(1);

      const state = useMovieStore.getState();
      expect(state.selectedMovie).toBeTruthy();
      expect(state.selectedMovie?.title).toBe('Test Movie');
      expect(state.selectedMovie?.cast).toHaveLength(1);
      expect(state.selectedMovie?.crew).toHaveLength(1);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetch movie details error', async () => {
      const errorMessage = 'Movie not found';
      vi.mocked(movieService.getMovieDetails).mockRejectedValue(new Error(errorMessage));

      const store = useMovieStore.getState();
      await store.fetchMovieDetails(1);

      const state = useMovieStore.getState();
      expect(state.selectedMovie).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('searchMovies', () => {
    it('should search movies successfully', async () => {
      vi.mocked(movieService.searchMovies).mockResolvedValue(mockTMDBResponse);

      const store = useMovieStore.getState();
      await store.searchMovies('test query', 1);

      const state = useMovieStore.getState();
      expect(state.searchResults).toHaveLength(1);
      expect(state.searchResults[0].title).toBe('Test Movie');
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should clear search when query is empty', async () => {
      // First set some search results
      useMovieStore.setState({
        searchResults: [mockTMDBMovie as any],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const store = useMovieStore.getState();
      await store.searchMovies('', 1);

      const state = useMovieStore.getState();
      expect(state.searchResults).toHaveLength(0);
      expect(state.pagination.totalResults).toBe(0);
    });

    it('should handle search error', async () => {
      const errorMessage = 'Search failed';
      vi.mocked(movieService.searchMovies).mockRejectedValue(new Error(errorMessage));

      const store = useMovieStore.getState();
      await store.searchMovies('test query', 1);

      const state = useMovieStore.getState();
      expect(state.searchResults).toHaveLength(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearSearch', () => {
    it('should clear search results and reset pagination', () => {
      // Set up some search state
      useMovieStore.setState({
        searchResults: [mockTMDBMovie as any],
        pagination: {
          currentPage: 2,
          totalPages: 5,
          totalResults: 100,
          hasNextPage: true,
          hasPreviousPage: true,
        },
        error: 'Some error',
      });

      const store = useMovieStore.getState();
      store.clearSearch();

      const state = useMovieStore.getState();
      expect(state.searchResults).toHaveLength(0);
      expect(state.pagination.currentPage).toBe(1);
      expect(state.pagination.totalPages).toBe(0);
      expect(state.pagination.totalResults).toBe(0);
      expect(state.error).toBe(null);
    });
  });

  describe('pagination actions', () => {
    beforeEach(() => {
      useMovieStore.setState({
        pagination: {
          currentPage: 2,
          totalPages: 5,
          totalResults: 100,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });

    it('should go to next page for popular movies', async () => {
      vi.mocked(movieService.getPopularMovies).mockResolvedValue({
        ...mockTMDBResponse,
        page: 3,
      });

      const store = useMovieStore.getState();
      await store.goToNextPage();

      expect(movieService.getPopularMovies).toHaveBeenCalledWith(3);
    });

    it('should go to next page for search results', async () => {
      vi.mocked(movieService.searchMovies).mockResolvedValue({
        ...mockTMDBResponse,
        page: 3,
      });

      const store = useMovieStore.getState();
      await store.goToNextPage('test query');

      expect(movieService.searchMovies).toHaveBeenCalledWith('test query', 3);
    });

    it('should go to previous page', async () => {
      vi.mocked(movieService.getPopularMovies).mockResolvedValue({
        ...mockTMDBResponse,
        page: 1,
      });

      const store = useMovieStore.getState();
      await store.goToPreviousPage();

      expect(movieService.getPopularMovies).toHaveBeenCalledWith(1);
    });

    it('should go to specific page', async () => {
      vi.mocked(movieService.getPopularMovies).mockResolvedValue({
        ...mockTMDBResponse,
        page: 4,
      });

      const store = useMovieStore.getState();
      await store.goToPage(4);

      expect(movieService.getPopularMovies).toHaveBeenCalledWith(4);
    });
  });

  describe('state setters', () => {
    it('should set selected movie', () => {
      const movie = mockTMDBMovieDetails as any;
      const store = useMovieStore.getState();
      store.setSelectedMovie(movie);

      const state = useMovieStore.getState();
      expect(state.selectedMovie).toBe(movie);
    });

    it('should set loading state', () => {
      const store = useMovieStore.getState();
      store.setLoading(true);

      const state = useMovieStore.getState();
      expect(state.loading).toBe(true);
    });

    it('should set error state', () => {
      const errorMessage = 'Test error';
      const store = useMovieStore.getState();
      store.setError(errorMessage);

      const state = useMovieStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.loading).toBe(false);
    });

    it('should clear error', () => {
      useMovieStore.setState({ error: 'Some error' });
      
      const store = useMovieStore.getState();
      store.clearError();

      const state = useMovieStore.getState();
      expect(state.error).toBe(null);
    });

    it('should update pagination', () => {
      const store = useMovieStore.getState();
      store.updatePagination({ currentPage: 5, hasNextPage: false });

      const state = useMovieStore.getState();
      expect(state.pagination.currentPage).toBe(5);
      expect(state.pagination.hasNextPage).toBe(false);
    });
  });
});