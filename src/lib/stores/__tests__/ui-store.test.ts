import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui-store';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      searchQuery: '',
      viewMode: 'grid',
      theme: 'light',
      sidebarOpen: false,
      isSearching: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.viewMode).toBe('grid');
      expect(state.theme).toBe('light');
      expect(state.sidebarOpen).toBe(false);
      expect(state.isSearching).toBe(false);
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      const store = useUIStore.getState();
      store.setSearchQuery('test query');

      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('test query');
    });

    it('should handle empty search query', () => {
      // First set a query
      useUIStore.setState({ searchQuery: 'existing query' });
      
      const store = useUIStore.getState();
      store.setSearchQuery('');

      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('');
    });
  });

  describe('setViewMode', () => {
    it('should update view mode to list', () => {
      const store = useUIStore.getState();
      store.setViewMode('list');

      const state = useUIStore.getState();
      expect(state.viewMode).toBe('list');
    });

    it('should update view mode to grid', () => {
      // First set to list
      useUIStore.setState({ viewMode: 'list' });
      
      const store = useUIStore.getState();
      store.setViewMode('grid');

      const state = useUIStore.getState();
      expect(state.viewMode).toBe('grid');
    });
  });

  describe('setTheme', () => {
    it('should update theme to dark', () => {
      const store = useUIStore.getState();
      store.setTheme('dark');

      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should update theme to light', () => {
      // First set to dark
      useUIStore.setState({ theme: 'dark' });
      
      const store = useUIStore.getState();
      store.setTheme('light');

      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from closed to open', () => {
      const store = useUIStore.getState();
      store.toggleSidebar();

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it('should toggle sidebar from open to closed', () => {
      // First open the sidebar
      useUIStore.setState({ sidebarOpen: true });
      
      const store = useUIStore.getState();
      store.toggleSidebar();

      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
    });

    it('should toggle sidebar multiple times', () => {
      const store = useUIStore.getState();
      
      // Toggle to open
      store.toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      
      // Toggle to closed
      store.toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      
      // Toggle to open again
      store.toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setSearching', () => {
    it('should set searching to true', () => {
      const store = useUIStore.getState();
      store.setSearching(true);

      const state = useUIStore.getState();
      expect(state.isSearching).toBe(true);
    });

    it('should set searching to false', () => {
      // First set to true
      useUIStore.setState({ isSearching: true });
      
      const store = useUIStore.getState();
      store.setSearching(false);

      const state = useUIStore.getState();
      expect(state.isSearching).toBe(false);
    });
  });

  describe('state selectors', () => {
    it('should select search query correctly using getState', () => {
      useUIStore.setState({ searchQuery: 'test query' });
      
      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('test query');
    });

    it('should select view mode correctly using getState', () => {
      useUIStore.setState({ viewMode: 'list' });
      
      const state = useUIStore.getState();
      expect(state.viewMode).toBe('list');
    });

    it('should select theme correctly using getState', () => {
      useUIStore.setState({ theme: 'dark' });
      
      const state = useUIStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should select sidebar state correctly using getState', () => {
      useUIStore.setState({ sidebarOpen: true });
      
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it('should select searching state correctly using getState', () => {
      useUIStore.setState({ isSearching: true });
      
      const state = useUIStore.getState();
      expect(state.isSearching).toBe(true);
    });
  });

  describe('action methods', () => {
    it('should provide all action methods via getState', () => {
      const store = useUIStore.getState();

      expect(typeof store.setSearchQuery).toBe('function');
      expect(typeof store.setViewMode).toBe('function');
      expect(typeof store.setTheme).toBe('function');
      expect(typeof store.toggleSidebar).toBe('function');
      expect(typeof store.setSearching).toBe('function');
    });
  });

  describe('state persistence', () => {
    it('should persist UI preferences', () => {
      const store = useUIStore.getState();
      
      // Update various UI preferences
      store.setSearchQuery('persistent query');
      store.setViewMode('list');
      store.setTheme('dark');
      store.toggleSidebar(); // Open sidebar

      const state = useUIStore.getState();
      expect(state.searchQuery).toBe('persistent query');
      expect(state.viewMode).toBe('list');
      expect(state.theme).toBe('dark');
      expect(state.sidebarOpen).toBe(true);
    });
  });
});