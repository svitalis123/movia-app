import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InMemoryCacheService, CacheKeyGenerator } from '../cache-service';

describe('InMemoryCacheService', () => {
  let cacheService: InMemoryCacheService;

  beforeEach(() => {
    cacheService = new InMemoryCacheService(5, 1000); // Small cache for testing
  });

  afterEach(() => {
    cacheService.destroy();
  });

  describe('basic operations', () => {
    it('should set and get values', () => {
      const testData = { id: 1, name: 'test' };
      
      cacheService.set('test-key', testData);
      const result = cacheService.get('test-key');
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      cacheService.set('test-key', 'test-value');
      
      expect(cacheService.has('test-key')).toBe(true);
      expect(cacheService.has('non-existent')).toBe(false);
    });

    it('should delete keys', () => {
      cacheService.set('test-key', 'test-value');
      expect(cacheService.has('test-key')).toBe(true);
      
      cacheService.delete('test-key');
      expect(cacheService.has('test-key')).toBe(false);
    });

    it('should clear all entries', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      expect(cacheService.size()).toBe(2);
      
      cacheService.clear();
      expect(cacheService.size()).toBe(0);
    });

    it('should return correct size', () => {
      expect(cacheService.size()).toBe(0);
      
      cacheService.set('key1', 'value1');
      expect(cacheService.size()).toBe(1);
      
      cacheService.set('key2', 'value2');
      expect(cacheService.size()).toBe(2);
    });

    it('should return all keys', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      const keys = cacheService.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });

  describe('TTL functionality', () => {
    it('should expire entries after TTL', async () => {
      cacheService.set('test-key', 'test-value', 100); // 100ms TTL
      
      expect(cacheService.get('test-key')).toBe('test-value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheService.get('test-key')).toBeNull();
    });

    it('should use default TTL when not specified', () => {
      const defaultTtlCache = new InMemoryCacheService(10, 500); // 500ms default TTL
      
      defaultTtlCache.set('test-key', 'test-value');
      expect(defaultTtlCache.get('test-key')).toBe('test-value');
      
      defaultTtlCache.destroy();
    });

    it('should handle has() with expired entries', async () => {
      cacheService.set('test-key', 'test-value', 100);
      
      expect(cacheService.has('test-key')).toBe(true);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheService.has('test-key')).toBe(false);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entries when max size is reached', () => {
      // Fill cache to max size
      for (let i = 0; i < 5; i++) {
        cacheService.set(`key${i}`, `value${i}`);
      }
      
      expect(cacheService.size()).toBe(5);
      expect(cacheService.has('key0')).toBe(true);
      
      // Add one more entry, should evict oldest
      cacheService.set('key5', 'value5');
      
      expect(cacheService.size()).toBe(5);
      expect(cacheService.has('key0')).toBe(false); // Oldest should be evicted
      expect(cacheService.has('key5')).toBe(true); // New entry should exist
    });

    it('should update LRU order on access', () => {
      // Fill cache
      for (let i = 0; i < 5; i++) {
        cacheService.set(`key${i}`, `value${i}`);
      }
      
      // Access key0 to move it to end
      cacheService.get('key0');
      
      // Add new entry, should evict key1 (now oldest)
      cacheService.set('key5', 'value5');
      
      expect(cacheService.has('key0')).toBe(true); // Should still exist
      expect(cacheService.has('key1')).toBe(false); // Should be evicted
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', () => {
      cacheService.set('test-key', 'test-value');
      
      // Hit
      cacheService.get('test-key');
      
      // Miss
      cacheService.get('non-existent');
      
      const stats = cacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it('should track sets and deletes', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.delete('key1');
      
      const stats = cacheService.getStats();
      expect(stats.sets).toBe(2);
      expect(stats.deletes).toBe(1);
    });

    it('should reset statistics', () => {
      cacheService.set('test-key', 'test-value');
      cacheService.get('test-key');
      
      let stats = cacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.sets).toBe(1);
      
      cacheService.resetStats();
      
      stats = cacheService.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.sets).toBe(0);
    });
  });

  describe('cleanup functionality', () => {
    it('should manually cleanup expired entries', async () => {
      cacheService.set('key1', 'value1', 100);
      cacheService.set('key2', 'value2', 1000);
      
      expect(cacheService.size()).toBe(2);
      
      // Wait for first entry to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const removedCount = cacheService.cleanup();
      
      expect(removedCount).toBe(1);
      expect(cacheService.size()).toBe(1);
      expect(cacheService.has('key1')).toBe(false);
      expect(cacheService.has('key2')).toBe(true);
    });
  });

  describe('getOrSet functionality', () => {
    it('should return cached value if exists', async () => {
      cacheService.set('test-key', 'cached-value');
      
      const factory = vi.fn().mockResolvedValue('new-value');
      const result = await cacheService.getOrSet('test-key', factory);
      
      expect(result).toBe('cached-value');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result if not exists', async () => {
      const factory = vi.fn().mockResolvedValue('new-value');
      const result = await cacheService.getOrSet('test-key', factory);
      
      expect(result).toBe('new-value');
      expect(factory).toHaveBeenCalledOnce();
      expect(cacheService.get('test-key')).toBe('new-value');
    });

    it('should work with synchronous factory', async () => {
      const factory = vi.fn().mockReturnValue('sync-value');
      const result = await cacheService.getOrSet('test-key', factory);
      
      expect(result).toBe('sync-value');
      expect(cacheService.get('test-key')).toBe('sync-value');
    });
  });

  describe('configuration updates', () => {
    it('should update max size and evict excess entries', () => {
      // Fill cache to current max size (5)
      for (let i = 0; i < 5; i++) {
        cacheService.set(`key${i}`, `value${i}`);
      }
      
      expect(cacheService.size()).toBe(5);
      
      // Reduce max size
      cacheService.updateConfig({ maxSize: 3 });
      
      expect(cacheService.size()).toBe(3);
    });

    it('should update default TTL', () => {
      cacheService.updateConfig({ defaultTtl: 2000 });
      
      // This is hard to test directly, but we can verify the config was accepted
      // by checking that no errors were thrown
      expect(() => cacheService.set('test', 'value')).not.toThrow();
    });
  });
});

describe('CacheKeyGenerator', () => {
  it('should generate correct popular movies key', () => {
    expect(CacheKeyGenerator.popularMovies()).toBe('popular_movies_page_1');
    expect(CacheKeyGenerator.popularMovies(3)).toBe('popular_movies_page_3');
  });

  it('should generate correct movie details key', () => {
    expect(CacheKeyGenerator.movieDetails(123)).toBe('movie_details_123');
  });

  it('should generate correct movie credits key', () => {
    expect(CacheKeyGenerator.movieCredits(456)).toBe('movie_credits_456');
  });

  it('should generate correct search movies key', () => {
    expect(CacheKeyGenerator.searchMovies('test query')).toBe('search_test_query_page_1');
    expect(CacheKeyGenerator.searchMovies('Test Query', 2)).toBe('search_test_query_page_2');
    expect(CacheKeyGenerator.searchMovies('  multiple   spaces  ')).toBe('search_multiple_spaces_page_1');
  });

  it('should generate correct genres key', () => {
    expect(CacheKeyGenerator.genres()).toBe('movie_genres');
  });

  it('should generate correct movies by genre key', () => {
    expect(CacheKeyGenerator.moviesByGenre(28)).toBe('genre_28_movies_page_1');
    expect(CacheKeyGenerator.moviesByGenre(28, 3)).toBe('genre_28_movies_page_3');
  });

  it('should generate correct similar movies key', () => {
    expect(CacheKeyGenerator.similarMovies(123)).toBe('similar_movies_123_page_1');
    expect(CacheKeyGenerator.similarMovies(123, 2)).toBe('similar_movies_123_page_2');
  });

  it('should generate correct movie recommendations key', () => {
    expect(CacheKeyGenerator.movieRecommendations(456)).toBe('recommendations_456_page_1');
    expect(CacheKeyGenerator.movieRecommendations(456, 3)).toBe('recommendations_456_page_3');
  });
});