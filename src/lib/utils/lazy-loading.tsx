import { lazy, Suspense } from 'react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorBoundary } from '../../components/ui/error-boundary';

/**
 * Options for lazy loading components
 */
interface LazyLoadOptions {
  fallback?: ReactNode;
  retryDelay?: number;
}

/**
 * Enhanced lazy loading utility with error handling and retry logic
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    retryDelay = 1000
  } = options;

  // Create lazy component with retry logic
  const LazyComponent = lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Failed to load component:', error);
      
      // Retry after delay
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      try {
        return await importFn();
      } catch (retryError) {
        console.error('Failed to load component after retry:', retryError);
        throw retryError;
      }
    }
  });

  return LazyComponent;
}

/**
 * Wrapper component that provides Suspense and ErrorBoundary for lazy components
 */
interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner size="large" message="Loading..." />
}: LazyWrapperProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Higher-order component for lazy loading with built-in Suspense and ErrorBoundary
 */
export function withLazyLoading<P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback = <LoadingSpinner size="large" message="Loading component..." />
  } = options;

  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

/**
 * Preload a lazy component to improve perceived performance
 */
export function preloadComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
}

/**
 * Utility to create route-based lazy components with consistent loading states
 */
export function createLazyRoute<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  routeName?: string
): LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    fallback: (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner 
          size="large" 
          message={routeName ? `Loading ${routeName}...` : "Loading page..."} 
        />
      </div>
    )
  });
}