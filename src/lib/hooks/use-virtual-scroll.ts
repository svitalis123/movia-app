import { useState, useRef, useCallback, useMemo } from 'react';

/**
 * Hook for virtual scrolling with dynamic item heights
 */
interface UseVirtualScrollOptions {
  itemCount: number;
  getItemHeight: (index: number) => number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll({
  itemCount,
  getItemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions = [];
    let totalHeight = 0;

    for (let i = 0; i < itemCount; i++) {
      positions.push({
        index: i,
        top: totalHeight,
        height: getItemHeight(i),
      });
      totalHeight += getItemHeight(i);
    }

    return { positions, totalHeight };
  }, [itemCount, getItemHeight]);

  // Find visible range
  const visibleRange = useMemo(() => {
    const { positions } = itemPositions;

    let start = 0;
    let end = positions.length - 1;

    // Binary search for start
    for (let i = 0; i < positions.length; i++) {
      if (positions[i].top + positions[i].height > scrollTop) {
        start = i;
        break;
      }
    }

    // Find end
    for (let i = start; i < positions.length; i++) {
      if (positions[i].top > scrollTop + containerHeight) {
        end = i - 1;
        break;
      }
    }

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(positions.length - 1, end + overscan),
    };
  }, [itemPositions, scrollTop, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollElementRef,
    visibleRange,
    totalHeight: itemPositions.totalHeight,
    getItemPosition: (index: number) => itemPositions.positions[index],
    handleScroll,
  };
}
