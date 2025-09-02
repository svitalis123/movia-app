import { useState, useRef, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

/**
 * Virtual scrolling component for large lists
 * Only renders visible items to improve performance
 */
export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        item: items[i],
        offsetY: i * itemHeight
      });
    }
    return result;
  }, [items, visibleRange, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, offsetY }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetY,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Virtual grid component for grid layouts
 */
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 0,
  overscan = 5,
  className = ''
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate columns per row
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;
  const totalHeight = totalRows * rowHeight;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / rowHeight),
      totalRows - 1
    );

    return {
      start: Math.max(0, startRow - overscan),
      end: Math.min(totalRows - 1, endRow + overscan)
    };
  }, [scrollTop, rowHeight, containerHeight, totalRows, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result = [];
    
    for (let row = visibleRange.start; row <= visibleRange.end; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        if (index >= items.length) break;

        result.push({
          index,
          item: items[index],
          x: col * (itemWidth + gap),
          y: row * rowHeight
        });
      }
    }
    
    return result;
  }, [items, visibleRange, columnsPerRow, itemWidth, gap, rowHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, x, y }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

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
  overscan = 5
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
        height: getItemHeight(i)
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
      end: Math.min(positions.length - 1, end + overscan)
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
    handleScroll
  };
}

export default VirtualScroll;