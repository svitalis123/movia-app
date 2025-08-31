import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { movieService } from '../services/movie-service';
import { useCacheStore } from './cache-store';

// Define all types locally to avoid import issues
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity?: number;
  original_language?: string;
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

interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  cast: CastMember[];
  crew: CrewMember[];
  budget: number;
  revenue: number;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  status?: string;
  collection?: Collection;
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MovieState {
  popular: Movie[];
  searchResults: Movie[];
  selectedMovie: MovieDetails | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
}

interface MovieActions {
  fetchPopularMovies: (page?: number) => Promise<void>;
  fetchMovieDetails: (movieId: number) => Promise<void>;
  searchMovies: (query: string, page?: number) => Promise<void>;
  clearSearch: () => void;
  setSelectedMovie: (movie: MovieDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updatePagination: (pagination: Partial<PaginationState>) => void;
  fetchMoviesByGenre: (genreId: number, page?: number) => Promise<void>;
  fetchSimilarMovies: (movieId: number, page?: number) => Promise<Movie[]>;
  fetchMovieRecommendations: (movieId: number, page?: number) => Promise<Movie[]>;
  goToNextPage: (searchQuery?: string) => Promise<void>;
  goToPreviousPage: (searchQuery?: string) => Promise<void>;
  goToPage: (page: number, searchQuery?: string) => Promise<void>;
}

// TMDB API types (needed for transformations)
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

interface MovieStore extends MovieState, MovieActions {}

/**
 * Movie store using Zustand
 * Manages movie data, search results, and pagination state
 * Integrates with TMDB API service for data fetching
 */
export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Actions
      fetchPopularMovies: async (page = 1) => {
        const cacheKey = `popular-movies-page-${page}`;
        
        // Check cache first
        const cachedMovies = useCacheStore.getState().getCachedMovies(cacheKey);
        if (cachedMovies) {
          const pagination: PaginationState = {
            currentPage: page,
            totalPages: Math.ceil(cachedMovies.length / 20), // Estimate based on typical TMDB response
            totalResults: cachedMovies.length,
            hasNextPage: page < Math.ceil(cachedMovies.length / 20),
            hasPreviousPage: page > 1,
          };
          
          set({ 
            popular: cachedMovies,
            pagination,
            loading: false,
            error: null 
          });
          return;
        }

        set({ loading: true, error: null });
        
        try {
          const response = await movieService.getPopularMovies(page);
          const transformedMovies = response.results.map(transformTMDBMovie);
          
          // Cache the results
          useCacheStore.getState().setCachedMovies(cacheKey, transformedMovies);
          
          const pagination: PaginationState = {
            currentPage: response.page,
            totalPages: response.total_pages,
            totalResults: response.total_results,
            hasNextPage: response.page < response.total_pages,
            hasPreviousPage: response.page > 1,
          };

          set({ 
            popular: transformedMovies,
            pagination,
            loading: false,
            error: null 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch popular movies';
          set({ 
            loading: false, 
            error: errorMessage,
            popular: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalResults: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          });
        }
      },

      fetchMovieDetails: async (movieId: number) => {
        // Check cache first
        const cachedDetails = useCacheStore.getState().getCachedMovieDetails(movieId);
        if (cachedDetails) {
          set({ 
            selectedMovie: cachedDetails,
            loading: false,
            error: null 
          });
          return;
        }

        set({ loading: true, error: null });
        
        try {
          const [movieDetails, credits] = await Promise.all([
            movieService.getMovieDetails(movieId),
            movieService.getMovieCredits(movieId)
          ]);
          
          const transformedMovie = transformTMDBMovieDetails(movieDetails, credits);
          
          // Cache the movie details
          useCacheStore.getState().setCachedMovieDetails(movieId, transformedMovie);
          
          set({ 
            selectedMovie: transformedMovie,
            loading: false,
            error: null 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch movie details';
          set({ 
            loading: false, 
            error: errorMessage,
            selectedMovie: null 
          });
        }
      },

      searchMovies: async (query: string, page = 1) => {
        if (!query.trim()) {
          get().clearSearch();
          return;
        }

        const cacheKey = `search-${query.toLowerCase()}-page-${page}`;
        
        // Check cache first
        const cachedResults = useCacheStore.getState().getCachedMovies(cacheKey);
        if (cachedResults) {
          const pagination: PaginationState = {
            currentPage: page,
            totalPages: Math.ceil(cachedResults.length / 20), // Estimate
            totalResults: cachedResults.length,
            hasNextPage: page < Math.ceil(cachedResults.length / 20),
            hasPreviousPage: page > 1,
          };
          
          set({ 
            searchResults: cachedResults,
            pagination,
            loading: false,
            error: null 
          });
          return;
        }

        set({ loading: true, error: null });
        
        try {
          const response = await movieService.searchMovies(query, page);
          const transformedMovies = response.results.map(transformTMDBMovie);
          
          // Cache the search results
          useCacheStore.getState().setCachedMovies(cacheKey, transformedMovies);
          
          const pagination: PaginationState = {
            currentPage: response.page,
            totalPages: response.total_pages,
            totalResults: response.total_results,
            hasNextPage: response.page < response.total_pages,
            hasPreviousPage: response.page > 1,
          };

          set({ 
            searchResults: transformedMovies,
            pagination,
            loading: false,
            error: null 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to search movies';
          set({ 
            loading: false, 
            error: errorMessage,
            searchResults: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalResults: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          });
        }
      },

      clearSearch: () => {
        set({ 
          searchResults: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalResults: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          error: null 
        });
      },

      setSelectedMovie: (movie: MovieDetails | null) => {
        set({ selectedMovie: movie });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error, loading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      updatePagination: (pagination: Partial<PaginationState>) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        }));
      },

      // Additional movie state management methods
      fetchMoviesByGenre: async (genreId: number, page = 1) => {
        const cacheKey = `genre-${genreId}-page-${page}`;
        
        // Check cache first
        const cachedMovies = useCacheStore.getState().getCachedMovies(cacheKey);
        if (cachedMovies) {
          const pagination: PaginationState = {
            currentPage: page,
            totalPages: Math.ceil(cachedMovies.length / 20),
            totalResults: cachedMovies.length,
            hasNextPage: page < Math.ceil(cachedMovies.length / 20),
            hasPreviousPage: page > 1,
          };
          
          set({ 
            popular: cachedMovies,
            pagination,
            loading: false,
            error: null 
          });
          return;
        }

        set({ loading: true, error: null });
        
        try {
          const response = await movieService.getMoviesByGenre(genreId, page);
          const transformedMovies = response.results.map(transformTMDBMovie);
          
          // Cache the results
          useCacheStore.getState().setCachedMovies(cacheKey, transformedMovies);
          
          const pagination: PaginationState = {
            currentPage: response.page,
            totalPages: response.total_pages,
            totalResults: response.total_results,
            hasNextPage: response.page < response.total_pages,
            hasPreviousPage: response.page > 1,
          };

          set({ 
            popular: transformedMovies,
            pagination,
            loading: false,
            error: null 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch movies by genre';
          set({ 
            loading: false, 
            error: errorMessage,
            popular: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalResults: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          });
        }
      },

      fetchSimilarMovies: async (movieId: number, page = 1) => {
        const cacheKey = `similar-${movieId}-page-${page}`;
        
        // Check cache first
        const cachedMovies = useCacheStore.getState().getCachedMovies(cacheKey);
        if (cachedMovies) {
          return cachedMovies;
        }

        try {
          const response = await movieService.getSimilarMovies(movieId, page);
          const transformedMovies = response.results.map(transformTMDBMovie);
          
          // Cache the results
          useCacheStore.getState().setCachedMovies(cacheKey, transformedMovies);
          
          return transformedMovies;
        } catch (error) {
          console.error('Failed to fetch similar movies:', error);
          return [];
        }
      },

      fetchMovieRecommendations: async (movieId: number, page = 1) => {
        const cacheKey = `recommendations-${movieId}-page-${page}`;
        
        // Check cache first
        const cachedMovies = useCacheStore.getState().getCachedMovies(cacheKey);
        if (cachedMovies) {
          return cachedMovies;
        }

        try {
          const response = await movieService.getMovieRecommendations(movieId, page);
          const transformedMovies = response.results.map(transformTMDBMovie);
          
          // Cache the results
          useCacheStore.getState().setCachedMovies(cacheKey, transformedMovies);
          
          return transformedMovies;
        } catch (error) {
          console.error('Failed to fetch movie recommendations:', error);
          return [];
        }
      },

      // Pagination helpers - these will be used by components that have access to search context
      goToNextPage: async (searchQuery?: string) => {
        const { pagination } = get();
        if (pagination.hasNextPage) {
          const nextPage = pagination.currentPage + 1;
          
          if (searchQuery) {
            await get().searchMovies(searchQuery, nextPage);
          } else {
            await get().fetchPopularMovies(nextPage);
          }
        }
      },

      goToPreviousPage: async (searchQuery?: string) => {
        const { pagination } = get();
        if (pagination.hasPreviousPage) {
          const prevPage = pagination.currentPage - 1;
          
          if (searchQuery) {
            await get().searchMovies(searchQuery, prevPage);
          } else {
            await get().fetchPopularMovies(prevPage);
          }
        }
      },

      goToPage: async (page: number, searchQuery?: string) => {
        if (searchQuery) {
          await get().searchMovies(searchQuery, page);
        } else {
          await get().fetchPopularMovies(page);
        }
      },
    }),
    {
      name: 'movie-store',
      // Only persist selected movie and search results for better UX
      partialize: (state) => ({
        selectedMovie: state.selectedMovie,
        searchResults: state.searchResults,
      }),
    }
  )
);

/**
 * Transform TMDB movie data to application movie format
 */
function transformTMDBMovie(tmdbMovie: TMDBMovie): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    release_date: tmdbMovie.release_date,
    vote_average: tmdbMovie.vote_average,
    vote_count: tmdbMovie.vote_count,
    genre_ids: tmdbMovie.genre_ids,
    popularity: tmdbMovie.popularity,
    original_language: tmdbMovie.original_language,
  };
}

/**
 * Transform TMDB movie details and credits to application movie details format
 */
function transformTMDBMovieDetails(
  tmdbDetails: TMDBMovieDetails, 
  tmdbCredits: TMDBCredits
): MovieDetails {
  return {
    id: tmdbDetails.id,
    title: tmdbDetails.title,
    overview: tmdbDetails.overview,
    poster_path: tmdbDetails.poster_path,
    backdrop_path: tmdbDetails.backdrop_path,
    release_date: tmdbDetails.release_date,
    vote_average: tmdbDetails.vote_average,
    vote_count: tmdbDetails.vote_count,
    genre_ids: tmdbDetails.genres.map(g => g.id),
    popularity: tmdbDetails.popularity,
    original_language: tmdbDetails.original_language,
    runtime: tmdbDetails.runtime,
    genres: tmdbDetails.genres,
    production_companies: tmdbDetails.production_companies,
    cast: tmdbCredits.cast.map(member => ({
      id: member.id,
      name: member.name,
      character: member.character,
      profile_path: member.profile_path,
      order: member.order,
    })),
    crew: tmdbCredits.crew.map(member => ({
      id: member.id,
      name: member.name,
      job: member.job,
      department: member.department,
      profile_path: member.profile_path,
    })),
    budget: tmdbDetails.budget,
    revenue: tmdbDetails.revenue,
    tagline: tmdbDetails.tagline,
    homepage: tmdbDetails.homepage,
    imdb_id: tmdbDetails.imdb_id,
    status: tmdbDetails.status,
    collection: tmdbDetails.belongs_to_collection || undefined,
    production_countries: tmdbDetails.production_countries,
    spoken_languages: tmdbDetails.spoken_languages,
  };
}

/**
 * Selector hooks for specific movie state
 */
export const usePopularMovies = () => useMovieStore((state) => state.popular);
export const useSearchResults = () => useMovieStore((state) => state.searchResults);
export const useSelectedMovie = () => useMovieStore((state) => state.selectedMovie);
export const useMovieLoading = () => useMovieStore((state) => state.loading);
export const useMovieError = () => useMovieStore((state) => state.error);
export const useMoviePagination = () => useMovieStore((state) => state.pagination);

/**
 * Action hooks for movie operations
 */
export const useMovieActions = () => useMovieStore((state) => ({
  fetchPopularMovies: state.fetchPopularMovies,
  fetchMovieDetails: state.fetchMovieDetails,
  searchMovies: state.searchMovies,
  clearSearch: state.clearSearch,
  setSelectedMovie: state.setSelectedMovie,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  updatePagination: state.updatePagination,
  fetchMoviesByGenre: state.fetchMoviesByGenre,
  fetchSimilarMovies: state.fetchSimilarMovies,
  fetchMovieRecommendations: state.fetchMovieRecommendations,
  goToNextPage: state.goToNextPage,
  goToPreviousPage: state.goToPreviousPage,
  goToPage: state.goToPage,
}));

/**
 * Pagination action hooks
 */
export const usePaginationActions = () => useMovieStore((state) => ({
  goToNextPage: state.goToNextPage,
  goToPreviousPage: state.goToPreviousPage,
  goToPage: state.goToPage,
  updatePagination: state.updatePagination,
}));
