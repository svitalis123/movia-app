import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation, useAsyncAction } from '../use-async-operation';

// Mock the stores
vi.mock('../../stores/toast-store', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

vi.mock('../../stores/ui-store', () => ({
  useUIActions: () => ({
    setLoadingState: vi.fn(),
    setGlobalLoading: vi.fn(),
  }),
}));

describe('useAsyncOperation', () => {
  const mockAsyncFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('should handle successful async operation', async () => {
    const testData = { id: 1, name: 'Test' };
    mockAsyncFunction.mockResolvedValue(testData);

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    let executePromise: Promise<any>;
    act(() => {
      executePromise = result.current.execute('test-arg');
    });

    // Should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      const returnedData = await executePromise;
      expect(returnedData).toEqual(testData);
    });

    // Should have completed successfully
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual(testData);
    expect(mockAsyncFunction).toHaveBeenCalledWith('test-arg');
  });

  it('should handle async operation error', async () => {
    const errorMessage = 'Test error';
    mockAsyncFunction.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    let executePromise: Promise<any>;
    act(() => {
      executePromise = result.current.execute();
    });

    await act(async () => {
      const returnedData = await executePromise;
      expect(returnedData).toBeUndefined();
    });

    // Should have error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.data).toBe(null);
  });

  it('should handle non-Error exceptions', async () => {
    mockAsyncFunction.mockRejectedValue('String error');

    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    let executePromise: Promise<any>;
    act(() => {
      executePromise = result.current.execute();
    });

    await act(async () => {
      await executePromise;
    });

    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useAsyncOperation(mockAsyncFunction));

    // Set some state
    act(() => {
      result.current.execute();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('should handle options correctly', async () => {
    const testData = { success: true };
    mockAsyncFunction.mockResolvedValue(testData);

    const options = {
      loadingKey: 'fetchingMovies' as const,
      showSuccessToast: true,
      successMessage: 'Success!',
      useGlobalLoading: true,
      globalLoadingMessage: 'Loading...',
    };

    const { result } = renderHook(() =>
      useAsyncOperation(mockAsyncFunction, options)
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(testData);
  });
});

describe('useAsyncAction', () => {
  const mockAsyncAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAsyncAction(mockAsyncAction));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful async action', async () => {
    mockAsyncAction.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAsyncAction(mockAsyncAction));

    let executePromise: Promise<boolean>;
    act(() => {
      executePromise = result.current.execute('test-arg');
    });

    // Should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      const success = await executePromise;
      expect(success).toBe(true);
    });

    // Should have completed successfully
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockAsyncAction).toHaveBeenCalledWith('test-arg');
  });

  it('should handle async action error', async () => {
    const errorMessage = 'Action failed';
    mockAsyncAction.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAsyncAction(mockAsyncAction));

    let executePromise: Promise<boolean>;
    act(() => {
      executePromise = result.current.execute();
    });

    await act(async () => {
      const success = await executePromise;
      expect(success).toBe(false);
    });

    // Should have error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useAsyncAction(mockAsyncAction));

    // Set some state
    act(() => {
      result.current.execute();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle options with global loading', async () => {
    mockAsyncAction.mockResolvedValue(undefined);

    const options = {
      loadingKey: 'authenticating' as const,
      showSuccessToast: true,
      successMessage: 'Action completed!',
      useGlobalLoading: true,
      globalLoadingMessage: 'Processing...',
    };

    const { result } = renderHook(() =>
      useAsyncAction(mockAsyncAction, options)
    );

    await act(async () => {
      const success = await result.current.execute();
      expect(success).toBe(true);
    });

    expect(result.current.error).toBe(null);
  });

  it('should handle custom error messages', async () => {
    mockAsyncAction.mockRejectedValue(new Error('Original error'));

    const options = {
      errorMessage: 'Custom error message',
    };

    const { result } = renderHook(() =>
      useAsyncAction(mockAsyncAction, options)
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Original error');
  });
});
