import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types locally to avoid import issues
interface UIState {
  searchQuery: string;
  viewMode: 'grid' | 'list';
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isSearching: boolean;
  // Loading states for async operations
  loadingStates: {
    fetchingMovies: boolean;
    fetchingMovieDetails: boolean;
    searching: boolean;
    authenticating: boolean;
  };
  // Global loading overlay
  globalLoading: {
    isLoading: boolean;
    message?: string;
  };
}

interface UIActions {
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSearching: (isSearching: boolean) => void;
  // Loading state actions
  setLoadingState: (operation: keyof UIState['loadingStates'], isLoading: boolean) => void;
  setGlobalLoading: (isLoading: boolean, message?: string) => void;
}

interface UIStore extends UIState, UIActions {}

/**
 * UI store using Zustand
 * Manages UI state including search query, view mode, theme, and other UI preferences
 * Persists user preferences across sessions
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      searchQuery: '',
      viewMode: 'grid',
      theme: 'light',
      sidebarOpen: false,
      isSearching: false,
      loadingStates: {
        fetchingMovies: false,
        fetchingMovieDetails: false,
        searching: false,
        authenticating: false,
      },
      globalLoading: {
        isLoading: false,
        message: undefined,
      },

      // Actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setViewMode: (mode: 'grid' | 'list') => {
        set({ viewMode: mode });
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSearching: (isSearching: boolean) => {
        set({ isSearching });
      },

      setLoadingState: (operation: keyof UIState['loadingStates'], isLoading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [operation]: isLoading,
          },
        }));
      },

      setGlobalLoading: (isLoading: boolean, message?: string) => {
        set({
          globalLoading: {
            isLoading,
            message,
          },
        });
      },
    }),
    {
      name: 'ui-store',
      // Persist all UI preferences except transient states
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        viewMode: state.viewMode,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // Don't persist transient states like loading states
      }),
    }
  )
);

/**
 * Selector hooks for specific UI state
 */
export const useSearchQuery = () => useUIStore((state) => state.searchQuery);
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useIsSearching = () => useUIStore((state) => state.isSearching);
export const useLoadingStates = () => useUIStore((state) => state.loadingStates);
export const useGlobalLoading = () => useUIStore((state) => state.globalLoading);

/**
 * Action hooks for UI operations
 */
export const useUIActions = () => useUIStore((state) => ({
  setSearchQuery: state.setSearchQuery,
  setViewMode: state.setViewMode,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSearching: state.setSearching,
  setLoadingState: state.setLoadingState,
  setGlobalLoading: state.setGlobalLoading,
}));