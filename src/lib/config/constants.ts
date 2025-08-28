// API Constants
export const API_ENDPOINTS = {
  POPULAR_MOVIES: '/movie/popular',
  MOVIE_DETAILS: '/movie',
  SEARCH_MOVIES: '/search/movie',
  MOVIE_CREDITS: '/movie/{id}/credits',
  GENRES: '/genre/movie/list',
} as const;

// Image sizes for TMDB
export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    ORIGINAL: 'original',
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
  },
  PROFILE: {
    SMALL: 'w45',
    MEDIUM: 'w185',
    LARGE: 'h632',
    ORIGINAL: 'original',
  },
} as const;

// Application Constants
export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_SEARCH_RESULTS: 100,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  MOVIE_DETAILS: '/movie/:id',
  SEARCH: '/search',
  PROFILE: '/profile',
  LOGIN: '/login',
} as const;