import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, debounce, throttle } from '../utils/performance';

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      performanceMonitor.recordMetric(
        `${componentName}-lifetime`,
        totalLifetime
      );
    };
  }, [componentName]);

  const startRenderTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderTiming = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.recordMetric(`${componentName}-render`, renderTime);
      renderStartTime.current = 0;
    }
  }, [componentName]);

  const recordCustomMetric = useCallback(
    (metricName: string, value: number) => {
      performanceMonitor.recordMetric(`${componentName}-${metricName}`, value);
    },
    [componentName]
  );

  return {
    startRenderTiming,
    endRenderTiming,
    recordCustomMetric,
  };
}

/**
 * Hook for debounced callbacks
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const debouncedCallback = useRef<T | null>(null);

  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay) as T;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, delay, ...deps]);

  return debouncedCallback.current || callback;
}

/**
 * Hook for throttled callbacks
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T {
  const throttledCallback = useRef<T | null>(null);

  useEffect(() => {
    throttledCallback.current = throttle(callback, limit) as T;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, limit, ...deps]);

  return throttledCallback.current || callback;
}

/**
 * Hook for intersection observer with performance monitoring
 */
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setElement = useCallback(
    (element: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      elementRef.current = element;

      if (element) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const startTime = performance.now();
              callback(entry);
              const duration = performance.now() - startTime;
              performanceMonitor.recordMetric(
                'intersection-callback',
                duration
              );
            });
          },
          {
            threshold: 0.1,
            rootMargin: '50px',
            ...options,
          }
        );

        observerRef.current.observe(element);
      }
    },
    [callback, options]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { setElement, element: elementRef.current };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string, enabled = true) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current++;
    const currentTime = performance.now();

    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = currentTime - lastRenderTime.current;
      performanceMonitor.recordMetric(
        `${componentName}-render-interval`,
        timeSinceLastRender
      );
    }

    lastRenderTime.current = currentTime;
    performanceMonitor.recordMetric(
      `${componentName}-render-count`,
      renderCount.current
    );
  });

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitor(componentName: string, interval = 5000) {
  useEffect(() => {
    if (!('memory' in performance)) {
      return; // Memory API not available
    }

    const checkMemory = () => {
      const memory = (
        performance as unknown as {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      if (memory) {
        performanceMonitor.recordMetric(
          `${componentName}-memory-used`,
          memory.usedJSHeapSize
        );
        performanceMonitor.recordMetric(
          `${componentName}-memory-total`,
          memory.totalJSHeapSize
        );
        performanceMonitor.recordMetric(
          `${componentName}-memory-limit`,
          memory.jsHeapSizeLimit
        );
      }
    };

    checkMemory(); // Initial check
    const intervalId = setInterval(checkMemory, interval);

    return () => clearInterval(intervalId);
  }, [componentName, interval]);
}

/**
 * Hook for network performance monitoring
 */
export function useNetworkMonitor() {
  const recordNetworkTiming = useCallback(
    (url: string, startTime: number, endTime: number) => {
      const duration = endTime - startTime;
      performanceMonitor.recordMetric('network-request', duration);
      performanceMonitor.recordMetric(`network-${url}`, duration);
    },
    []
  );

  const wrapFetch = useCallback(
    (url: string, options?: RequestInit) => {
      const startTime = performance.now();

      return fetch(url, options).finally(() => {
        const endTime = performance.now();
        recordNetworkTiming(url, startTime, endTime);
      });
    },
    [recordNetworkTiming]
  );

  return {
    wrapFetch,
    recordNetworkTiming,
  };
}

/**
 * Hook for bundle size monitoring
 */
export function useBundleMonitor() {
  const recordModuleLoad = useCallback(
    (moduleName: string, loadTime: number) => {
      performanceMonitor.recordMetric(`module-load-${moduleName}`, loadTime);
    },
    []
  );

  const wrapDynamicImport = useCallback(
    async <T>(importFn: () => Promise<T>, moduleName: string): Promise<T> => {
      const startTime = performance.now();

      try {
        const module = await importFn();
        const loadTime = performance.now() - startTime;
        recordModuleLoad(moduleName, loadTime);
        return module;
      } catch (error) {
        const loadTime = performance.now() - startTime;
        performanceMonitor.recordMetric(
          `module-load-error-${moduleName}`,
          loadTime
        );
        throw error;
      }
    },
    [recordModuleLoad]
  );

  return {
    wrapDynamicImport,
    recordModuleLoad,
  };
}

export default {
  usePerformanceMonitor,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useRenderPerformance,
  useMemoryMonitor,
  useNetworkMonitor,
  useBundleMonitor,
};
