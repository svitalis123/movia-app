import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_TMDB_API_KEY: 'test-api-key',
    VITE_TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    VITE_TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock window.Image
global.Image = vi.fn().mockImplementation(() => ({
  onload: null,
  onerror: null,
  src: '',
}));

// Global test setup
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};