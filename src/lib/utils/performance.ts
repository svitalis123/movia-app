/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function to limit function calls to once per specified time period
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Image preloader with priority queue
 */
export class ImagePreloader {
  private queue: Array<{ url: string; priority: number }> = [];
  private loading = new Set<string>();
  private loaded = new Set<string>();
  private maxConcurrent = 3;
  private currentLoading = 0;

  preload(url: string, priority = 0): Promise<void> {
    if (this.loaded.has(url) || this.loading.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ url, priority });
      this.queue.sort((a, b) => b.priority - a.priority);
      
      this.processQueue();
      
      // Set up listeners for this specific URL
      const checkComplete = () => {
        if (this.loaded.has(url)) {
          resolve();
        } else if (!this.loading.has(url) && !this.queue.some(item => item.url === url)) {
          reject(new Error(`Failed to load image: ${url}`));
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      
      checkComplete();
    });
  }

  private processQueue(): void {
    while (this.currentLoading < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.loadImage(item.url);
    }
  }

  private loadImage(url: string): void {
    if (this.loading.has(url) || this.loaded.has(url)) {
      return;
    }

    this.loading.add(url);
    this.currentLoading++;

    const img = new Image();
    
    img.onload = () => {
      this.loading.delete(url);
      this.loaded.add(url);
      this.currentLoading--;
      this.processQueue();
    };
    
    img.onerror = () => {
      this.loading.delete(url);
      this.currentLoading--;
      this.processQueue();
    };
    
    img.src = url;
  }

  isLoaded(url: string): boolean {
    return this.loaded.has(url);
  }

  isLoading(url: string): boolean {
    return this.loading.has(url);
  }

  clear(): void {
    this.queue = [];
    this.loading.clear();
    this.loaded.clear();
    this.currentLoading = 0;
  }
}

/**
 * Global image preloader instance
 */
export const imagePreloader = new ImagePreloader();

/**
 * Intersection Observer utility for lazy loading
 */
export class LazyLoadObserver {
  private observer: IntersectionObserver;
  private callbacks = new Map<Element, () => void>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback();
            this.unobserve(entry.target);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
  }

  observe(element: Element, callback: () => void): void {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number[]>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return null;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllMetrics(): Record<string, ReturnType<PerformanceMonitor['getMetrics']>> {
    const result: Record<string, ReturnType<PerformanceMonitor['getMetrics']>> = {};
    
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    
    return result;
  }

  clear(label?: string): void {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  /**
   * Dynamically import modules to enable code splitting
   */
  async loadModule<T>(importFn: () => Promise<T>): Promise<T> {
    const endTiming = performanceMonitor.startTiming('module-load');
    
    try {
      const module = await importFn();
      endTiming();
      return module;
    } catch (error) {
      endTiming();
      throw error;
    }
  },

  /**
   * Preload critical modules
   */
  preloadModules(importFns: Array<() => Promise<unknown>>): void {
    importFns.forEach((importFn) => {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => importFn().catch(() => {}));
      } else {
        setTimeout(() => importFn().catch(() => {}), 0);
      }
    });
  },

  /**
   * Tree shaking helper - mark functions as side-effect free
   */
  pure<T extends (...args: unknown[]) => unknown>(fn: T): T {
    return fn;
  }
};

/**
 * Memory management utilities
 */
export const memoryManagement = {
  /**
   * Create a weak reference cache
   */
  createWeakCache<K extends object, V>(): {
    get: (key: K) => V | undefined;
    set: (key: K, value: V) => void;
    has: (key: K) => boolean;
    delete: (key: K) => boolean;
  } {
    const cache = new WeakMap<K, V>();
    
    return {
      get: (key: K) => cache.get(key),
      set: (key: K, value: V) => cache.set(key, value),
      has: (key: K) => cache.has(key),
      delete: (key: K) => cache.delete(key)
    };
  },

  /**
   * Create a size-limited cache with LRU eviction
   */
  createLRUCache<K, V>(maxSize: number): {
    get: (key: K) => V | undefined;
    set: (key: K, value: V) => void;
    has: (key: K) => boolean;
    delete: (key: K) => boolean;
    clear: () => void;
    size: number;
  } {
    const cache = new Map<K, V>();
    
    return {
      get(key: K): V | undefined {
        if (cache.has(key)) {
          const value = cache.get(key)!;
          // Move to end (most recently used)
          cache.delete(key);
          cache.set(key, value);
          return value;
        }
        return undefined;
      },
      
      set(key: K, value: V): void {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          // Remove least recently used (first item)
          const firstKey = cache.keys().next().value;
          if (firstKey !== undefined) cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      
      has: (key: K) => cache.has(key),
      delete: (key: K) => cache.delete(key),
      clear: () => cache.clear(),
      get size() { return cache.size; }
    };
  }
};

export default {
  debounce,
  throttle,
  memoize,
  imagePreloader,
  LazyLoadObserver,
  performanceMonitor,
  bundleOptimization,
  memoryManagement
};