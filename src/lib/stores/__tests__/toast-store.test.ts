import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastStore, useToast } from '../toast-store';

// Mock timers
vi.useFakeTimers();

describe('Toast Store', () => {
  beforeEach(() => {
    // Clear the store before each test
    useToastStore.getState().clearAllToasts();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useToastStore', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts).toEqual([]);
    });

    it('should add a toast with generated id', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.addToast({
          type: 'success',
          message: 'Test message',
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'success',
        message: 'Test message',
        duration: 5000,
        dismissible: true,
      });
      expect(result.current.toasts[0].id).toBeDefined();
    });

    it('should remove a toast by id', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.addToast({
          type: 'info',
          message: 'Test message',
        });
      });

      const toastId = result.current.toasts[0].id;

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should clear all toasts', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.addToast({ type: 'success', message: 'Toast 1' });
        result.current.addToast({ type: 'error', message: 'Toast 2' });
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should auto-remove toast after duration', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.addToast({
          type: 'success',
          message: 'Auto-dismiss toast',
          duration: 1000,
        });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not auto-remove toast with duration 0', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.addToast({
          type: 'error',
          message: 'Persistent toast',
          duration: 0,
        });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('Convenience methods', () => {
    it('should show success toast', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showSuccess('Success message', 'Success Title');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'success',
        message: 'Success message',
        title: 'Success Title',
        duration: 5000,
      });
    });

    it('should show error toast with no auto-dismiss', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showError('Error message', 'Error Title');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'error',
        message: 'Error message',
        title: 'Error Title',
        duration: 0,
      });
    });

    it('should show warning toast', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showWarning('Warning message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'warning',
        message: 'Warning message',
        duration: 5000,
      });
    });

    it('should show info toast', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showInfo('Info message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'info',
        message: 'Info message',
        duration: 5000,
      });
    });

    it('should allow overriding default options', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showError('Error message', 'Error Title', {
          duration: 3000,
          dismissible: false,
        });
      });

      expect(result.current.toasts[0]).toMatchObject({
        type: 'error',
        message: 'Error message',
        title: 'Error Title',
        duration: 3000,
        dismissible: false,
      });
    });
  });

  describe('useToast hook', () => {
    it('should provide toast actions', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('showSuccess');
      expect(result.current).toHaveProperty('showError');
      expect(result.current).toHaveProperty('showWarning');
      expect(result.current).toHaveProperty('showInfo');
      expect(result.current).toHaveProperty('clearAllToasts');
    });

    it('should work with toast actions', () => {
      const { result: toastResult } = renderHook(() => useToast());
      const { result: storeResult } = renderHook(() => useToastStore());

      act(() => {
        toastResult.current.showSuccess('Test success');
      });

      expect(storeResult.current.toasts).toHaveLength(1);
      expect(storeResult.current.toasts[0].type).toBe('success');

      act(() => {
        toastResult.current.clearAllToasts();
      });

      expect(storeResult.current.toasts).toHaveLength(0);
    });
  });

  describe('Multiple toasts', () => {
    it('should handle multiple toasts correctly', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showSuccess('Toast 1');
        result.current.showError('Toast 2');
        result.current.showWarning('Toast 3');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts.map((t) => t.type)).toEqual([
        'success',
        'error',
        'warning',
      ]);
    });

    it('should remove specific toasts while keeping others', () => {
      const { result } = renderHook(() => useToastStore());

      act(() => {
        result.current.showSuccess('Toast 1');
        result.current.showError('Toast 2');
        result.current.showWarning('Toast 3');
      });

      const middleToastId = result.current.toasts[1].id;

      act(() => {
        result.current.removeToast(middleToastId);
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts.map((t) => t.message)).toEqual([
        'Toast 1',
        'Toast 3',
      ]);
    });
  });
});
