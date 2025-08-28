// Environment configuration
export const env = {
  // TMDB API Configuration
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY || '',
  TMDB_BASE_URL:
    import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL:
    import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',

  // Authentication Configuration
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',

  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Movie Recommendation App',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Development flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validation function to ensure required environment variables are set
export const validateEnv = () => {
  const requiredVars = {
    TMDB_API_KEY: env.TMDB_API_KEY,
    CLERK_PUBLISHABLE_KEY: env.CLERK_PUBLISHABLE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return missingVars.length === 0;
};
