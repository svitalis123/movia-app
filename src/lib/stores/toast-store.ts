import { create } from 'zustand';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string, title?: string, options?: Partial<Toast>) => void;
  showError: (message: string, title?: string, options?: Partial<Toast>) => void;
  showWarning: (message: string, title?: string, options?: Partial<Toast>) => void;
  showInfo: (message: string, title?: string, options?: Partial<Toast>) => void;
}

interface ToastStore extends ToastState, ToastActions {}

/**
 * Toast store using Zustand
 * Manages toast notifications throughout the application
 */
export const useToastStore = create<ToastStore>((set, get) => ({
  // Initial state
  toasts: [],

  // Actions
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration if specified
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods for different toast types
  showSuccess: (message, title, options = {}) => {
    get().addToast({
      type: 'success',
      message,
      title,
      ...options,
    });
  },

  showError: (message, title, options = {}) => {
    get().addToast({
      type: 'error',
      message,
      title,
      duration: 0, // Error toasts don't auto-dismiss by default
      ...options,
    });
  },

  showWarning: (message, title, options = {}) => {
    get().addToast({
      type: 'warning',
      message,
      title,
      ...options,
    });
  },

  showInfo: (message, title, options = {}) => {
    get().addToast({
      type: 'info',
      message,
      title,
      ...options,
    });
  },
}));

/**
 * Hook to get toast actions
 */
export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAllToasts } = useToastStore();
  
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  };
};