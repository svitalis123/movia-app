// Auth Store
export {
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useAuthActions,
} from './auth-store';

// Movie Store
export {
  useMovieStore,
  usePopularMovies,
  useSearchResults,
  useSelectedMovie,
  useMovieLoading,
  useMovieError,
  useMoviePagination,
  useMovieActions,
  usePaginationActions,
} from './movie-store';

// UI Store
export {
  useUIStore,
  useSearchQuery,
  useViewMode,
  useTheme,
  useSidebarOpen,
  useIsSearching,
  useLoadingStates,
  useGlobalLoading,
  useUIActions,
} from './ui-store';

// Toast Store
export { useToastStore, useToast } from './toast-store';

// Cache Store
export {
  useCacheStore,
  useCachedMovies,
  useCachedMovieDetails,
  useCachedGenres,
  useCacheActions,
  useIsCached,
} from './cache-store';
