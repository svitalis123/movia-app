// ============================================================================
// TMDB API Response Types (Raw API Data)
// ============================================================================

export interface TMDBMovie {
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

export interface TMDBMovieDetails extends TMDBMovie {
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

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
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

export interface TMDBCrewMember {
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

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponse<T> extends TMDBResponse<T> {
  total_pages: number;
  total_results: number;
}

export interface TMDBErrorResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

// ============================================================================
// Application Data Models (Transformed/Normalized)
// ============================================================================

export interface Movie {
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

export interface MovieDetails extends Movie {
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

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Application State Types (Zustand Store)
// ============================================================================

export interface MovieState {
  popular: Movie[];
  searchResults: Movie[];
  selectedMovie: MovieDetails | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UIState {
  searchQuery: string;
  viewMode: 'grid' | 'list';
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isSearching: boolean;
}

export interface CacheState {
  movies: Record<string, { data: Movie[]; timestamp: number; ttl: number }>;
  movieDetails: Record<number, { data: MovieDetails; timestamp: number; ttl: number }>;
  genres: { data: Genre[]; timestamp: number; ttl: number } | null;
}

export interface AppState {
  auth: AuthState;
  movies: MovieState;
  ui: UIState;
  cache: CacheState;
}

// ============================================================================
// Store Actions Types
// ============================================================================

export interface AuthActions {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface MovieActions {
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

export interface UIActions {
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSearching: (isSearching: boolean) => void;
}

export interface CacheActions {
  setCachedMovies: (key: string, movies: Movie[], ttl?: number) => void;
  getCachedMovies: (key: string) => Movie[] | null;
  setCachedMovieDetails: (movieId: number, details: MovieDetails, ttl?: number) => void;
  getCachedMovieDetails: (movieId: number) => MovieDetails | null;
  setCachedGenres: (genres: Genre[], ttl?: number) => void;
  getCachedGenres: () => Genre[] | null;
  clearCache: (type?: 'movies' | 'movieDetails' | 'genres') => void;
}

export interface StoreActions extends AuthActions, MovieActions, UIActions, CacheActions {}

// ============================================================================
// Component Props Interfaces
// ============================================================================

export interface MovieCardProps {
  movie: Movie;
  onClick: (movieId: number) => void;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showGenres?: boolean;
  className?: string;
}

export interface MovieListProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  onMovieSelect: (movieId: number) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  viewMode?: 'grid' | 'list';
  emptyMessage?: string;
  className?: string;
}

export interface MovieDetailsProps {
  movie: MovieDetails;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onRelatedMovieClick?: (movieId: number) => void;
  className?: string;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  className?: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface UserProfileProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface MovieService {
  getPopularMovies(page?: number): Promise<TMDBResponse<TMDBMovie>>;
  getMovieDetails(movieId: number): Promise<TMDBMovieDetails>;
  getMovieCredits(movieId: number): Promise<TMDBCredits>;
  searchMovies(query: string, page?: number): Promise<TMDBResponse<TMDBMovie>>;
  getGenres(): Promise<{ genres: TMDBGenre[] }>;
  getMoviesByGenre(genreId: number, page?: number): Promise<TMDBResponse<TMDBMovie>>;
  getSimilarMovies(movieId: number, page?: number): Promise<TMDBResponse<TMDBMovie>>;
  getMovieRecommendations(movieId: number, page?: number): Promise<TMDBResponse<TMDBMovie>>;
}

export interface AuthService {
  login(): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
  refreshToken(): Promise<string>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

export interface CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  size(): number;
  keys(): string[];
}

export interface StorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length(): number;
}

export interface HttpService {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
}

export interface ImageService {
  getImageUrl(path: string | null, size?: ImageSize): string;
  preloadImage(url: string): Promise<void>;
  getOptimizedImageUrl(path: string | null, width: number, quality?: number): string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export type ImageSize = 
  | 'w92' 
  | 'w154' 
  | 'w185' 
  | 'w342' 
  | 'w500' 
  | 'w780' 
  | 'original';

export type MovieSortBy = 
  | 'popularity.desc' 
  | 'popularity.asc' 
  | 'release_date.desc' 
  | 'release_date.asc' 
  | 'vote_average.desc' 
  | 'vote_average.asc' 
  | 'title.asc' 
  | 'title.desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SearchFilters {
  genre?: number;
  year?: number;
  sortBy?: MovieSortBy;
  minRating?: number;
  maxRating?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState;
}

// ============================================================================
// Custom Error Types
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Event Types
// ============================================================================

export interface MovieSelectEvent {
  movieId: number;
  movie: Movie;
  source: 'card' | 'search' | 'recommendation';
}

export interface SearchEvent {
  query: string;
  filters?: SearchFilters;
  timestamp: number;
}

export interface PaginationEvent {
  page: number;
  totalPages: number;
  source: 'popular' | 'search' | 'genre';
}

export interface AuthEvent {
  type: 'login' | 'logout' | 'session_expired' | 'token_refresh';
  user?: User;
  timestamp: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  api: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    retries: number;
  };
  auth: {
    provider: string;
    redirectUrl: string;
    sessionTimeout: number;
  };
  cache: {
    defaultTtl: number;
    maxSize: number;
    enabled: boolean;
  };
  ui: {
    defaultViewMode: 'grid' | 'list';
    defaultTheme: 'light' | 'dark';
    itemsPerPage: number;
    maxSearchHistory: number;
  };
}

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  VITE_TMDB_API_KEY: string;
  VITE_TMDB_BASE_URL: string;
  VITE_AUTH_PROVIDER: string;
  VITE_APP_URL: string;
}