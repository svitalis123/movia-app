import { useMemo, useCallback } from 'react';
import { VirtualGrid } from '../ui/virtual-scroll';
import { MovieCard, MovieCardSkeleton } from './movie-card';
import { ErrorMessage } from '../ui/error-message';
import { cn } from '../../lib/utils';
import type { Movie } from '../../lib/types';

interface VirtualMovieListProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  onMovieSelect: (movieId: number) => void;
  containerWidth?: number;
  containerHeight?: number;
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  className?: string;
  emptyMessage?: string;
}

/**
 * Virtualized movie list component for large datasets
 * Uses virtual scrolling to render only visible items for better performance
 */
export function VirtualMovieList({
  movies,
  loading,
  error,
  onMovieSelect,
  containerWidth = 1200,
  containerHeight = 600,
  itemWidth = 280,
  itemHeight = 420,
  gap = 16,
  className,
  emptyMessage = 'No movies found'
}: VirtualMovieListProps) {
  
  // Calculate how many skeleton items to show during loading
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsVisible = Math.ceil(containerHeight / (itemHeight + gap));
  const skeletonCount = columnsPerRow * rowsVisible;

  // Create skeleton items for loading state
  const skeletonItems = useMemo(() => 
    Array.from({ length: skeletonCount }, (_, index) => ({ id: `skeleton-${index}` })),
    [skeletonCount]
  );

  const renderMovieItem = useCallback((movie: Movie, _index: number) => (
    <MovieCard
      key={movie.id}
      movie={movie}
      onClick={() => onMovieSelect(movie.id)}
      className="w-full h-full"
    />
  ), [onMovieSelect]);

  const renderSkeletonItem = useCallback((item: { id: string }, _index: number) => (
    <MovieCardSkeleton key={item.id} className="w-full h-full" />
  ), []);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (loading && movies.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <VirtualGrid
          items={skeletonItems}
          itemWidth={itemWidth}
          itemHeight={itemHeight}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          renderItem={renderSkeletonItem}
          gap={gap}
          className="border rounded-lg"
        />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <VirtualGrid
        items={movies}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        renderItem={renderMovieItem}
        gap={gap}
        className="border rounded-lg"
      />
      
      {/* Loading overlay for additional items */}
      {loading && movies.length > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading more movies...
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for responsive virtual movie list dimensions
 */
export function useResponsiveMovieGrid(containerRef: React.RefObject<HTMLElement>) {
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) {
      return {
        containerWidth: 1200,
        containerHeight: 600,
        itemWidth: 280,
        itemHeight: 420
      };
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(container.clientHeight, 800); // Max height

    // Responsive item sizing
    let itemWidth = 280;
    let itemHeight = 420;

    if (containerWidth < 640) {
      // Mobile
      itemWidth = Math.floor((containerWidth - 32) / 2); // 2 columns with padding
      itemHeight = Math.floor(itemWidth * 1.5); // 3:2 aspect ratio
    } else if (containerWidth < 1024) {
      // Tablet
      itemWidth = Math.floor((containerWidth - 48) / 3); // 3 columns
      itemHeight = Math.floor(itemWidth * 1.5);
    } else {
      // Desktop - calculate based on available space
      const columns = Math.floor(containerWidth / 300); // Minimum 300px per column
      itemWidth = Math.floor((containerWidth - (columns + 1) * 16) / columns);
      itemHeight = Math.floor(itemWidth * 1.5);
    }

    return {
      containerWidth,
      containerHeight,
      itemWidth,
      itemHeight
    };
  }, [containerRef]);

  return { calculateDimensions };
}

/**
 * Optimized movie list with automatic virtualization threshold
 */
interface SmartMovieListProps extends Omit<VirtualMovieListProps, 'containerWidth' | 'containerHeight'> {
  virtualizationThreshold?: number;
  containerRef?: React.RefObject<HTMLElement>;
}

export function SmartMovieList({
  movies,
  virtualizationThreshold = 100,
  containerRef,
  ...props
}: SmartMovieListProps) {
  const { calculateDimensions } = useResponsiveMovieGrid(containerRef as React.RefObject<HTMLElement>);
  const dimensions = calculateDimensions();

  // Use virtual scrolling only for large lists
  if (movies.length > virtualizationThreshold) {
    return (
      <VirtualMovieList
        movies={movies}
        {...dimensions}
        {...props}
      />
    );
  }

  // For smaller lists, use regular grid layout
  return (
    <div className={cn('grid gap-4', props.className)}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={() => props.onMovieSelect(movie.id)}
        />
      ))}
    </div>
  );
}

export default VirtualMovieList;