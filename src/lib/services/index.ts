// HTTP Client
export { httpClient, HttpClient } from './http-client';
export type { HttpClientConfig } from './http-client';

// Movie Services
export { movieService, TMDBMovieService } from './movie-service';
export { cachedMovieService, CachedMovieService } from './cached-movie-service';
export { optimizedMovieService } from './optimized-movie-service';
export { enhancedMovieService, EnhancedMovieService } from './enhanced-movie-service';

// Cache Service
export { cacheService, InMemoryCacheService, CacheKeyGenerator } from './cache-service';

// Authentication Service
export { authService, useClerkAuthService, authUtils } from './auth-service';

// Default export - the main service to use in the application
export { cachedMovieService as default } from './cached-movie-service';