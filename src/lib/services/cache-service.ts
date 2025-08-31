import { CacheService } from '../types';

/**
 * Cache entry interface for storing cached data with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

/**
 * Cache statistics for monitoring and debugging
 */
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  clears: number;
  size: number;
  hitRate: number;
}

/**
 * In-memory cache service with TTL (Time To Live) support
 * 
 * Features:
 * - TTL-based expiration
 * - LRU eviction when max size is reached
 * - Cache statistics
 * - Automatic cleanup of expired entries
 * - Memory-efficient storage
 */
class InMemoryCacheService implements CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTtl: number;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(maxSize: number = 1000, defaultTtl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
      size: 0,
      hitRate: 0,
    };
    this.cleanupInterval = null;
    
    // Start automatic cleanup of expired entries
    this.startCleanupInterval();
  }

  /**
   * Retrieves a value from the cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      this.updateStats();
      return null;
    }

    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data;
  }

  /**
   * Stores a value in the cache with optional TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const actualTtl = ttl ?? this.defaultTtl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: actualTtl,
      key,
    };

    // If cache is at max size, remove oldest entry (LRU)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.deletes++;
      }
    }

    // Remove existing entry if updating
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, entry);
    this.stats.sets++;
    this.updateStats();
  }

  /**
   * Checks if a key exists in the cache (and is not expired)
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.updateStats();
      return false;
    }

    return true;
  }

  /**
   * Deletes a specific key from the cache
   * @param key - Cache key to delete
   */
  delete(key: string): void {
    if (this.cache.delete(key)) {
      this.stats.deletes++;
      this.updateStats();
    }
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.clears++;
    this.updateStats();
  }

  /**
   * Returns the current size of the cache
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Returns all keys in the cache
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Gets cache statistics
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Resets cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
      size: this.cache.size,
      hitRate: 0,
    };
  }

  /**
   * Manually triggers cleanup of expired entries
   * @returns Number of entries removed
   */
  cleanup(): number {
    const initialSize = this.cache.size;
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.stats.deletes++;
    });

    this.updateStats();
    return initialSize - this.cache.size;
  }

  /**
   * Gets or sets a value using a factory function
   * @param key - Cache key
   * @param factory - Function to generate value if not cached
   * @param ttl - Optional TTL override
   * @returns Cached or newly generated value
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T> | T, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Updates cache configuration
   * @param config - New configuration options
   */
  updateConfig(config: { maxSize?: number; defaultTtl?: number }): void {
    if (config.maxSize !== undefined) {
      this.maxSize = config.maxSize;
      
      // If new max size is smaller, remove excess entries
      while (this.cache.size > this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
          this.stats.deletes++;
        }
      }
    }

    if (config.defaultTtl !== undefined) {
      this.defaultTtl = config.defaultTtl;
    }

    this.updateStats();
  }

  /**
   * Destroys the cache service and cleans up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  // Private methods

  /**
   * Checks if a cache entry has expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Updates cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.updateHitRate();
  }

  /**
   * Updates hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Starts automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Run cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }
}

/**
 * Cache key generator utilities
 */
export class CacheKeyGenerator {
  /**
   * Generates a cache key for popular movies
   */
  static popularMovies(page: number = 1): string {
    return `popular_movies_page_${page}`;
  }

  /**
   * Generates a cache key for movie details
   */
  static movieDetails(movieId: number): string {
    return `movie_details_${movieId}`;
  }

  /**
   * Generates a cache key for movie credits
   */
  static movieCredits(movieId: number): string {
    return `movie_credits_${movieId}`;
  }

  /**
   * Generates a cache key for movie search
   */
  static searchMovies(query: string, page: number = 1): string {
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, '_');
    return `search_${normalizedQuery}_page_${page}`;
  }

  /**
   * Generates a cache key for genres
   */
  static genres(): string {
    return 'movie_genres';
  }

  /**
   * Generates a cache key for movies by genre
   */
  static moviesByGenre(genreId: number, page: number = 1): string {
    return `genre_${genreId}_movies_page_${page}`;
  }

  /**
   * Generates a cache key for similar movies
   */
  static similarMovies(movieId: number, page: number = 1): string {
    return `similar_movies_${movieId}_page_${page}`;
  }

  /**
   * Generates a cache key for movie recommendations
   */
  static movieRecommendations(movieId: number, page: number = 1): string {
    return `recommendations_${movieId}_page_${page}`;
  }
}

// Create and export singleton instance
export const cacheService = new InMemoryCacheService();

// Export class for testing and custom instances
export { InMemoryCacheService };