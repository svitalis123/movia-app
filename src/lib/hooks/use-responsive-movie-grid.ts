import { useCallback } from 'react';

/**
 * Hook for responsive virtual movie list dimensions
 */
export function useResponsiveMovieGrid(
  containerRef: React.RefObject<HTMLElement>
) {
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) {
      return {
        containerWidth: 1200,
        containerHeight: 600,
        itemWidth: 280,
        itemHeight: 420,
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
      itemHeight,
    };
  }, [containerRef]);

  return { calculateDimensions };
}
