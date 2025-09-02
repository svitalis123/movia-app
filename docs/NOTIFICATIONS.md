# Notification System Documentation

## Overview

The Movie Recommendation App now includes a comprehensive notification system that provides users with immediate feedback for all actions and operations. This system includes toast notifications, loading states, and enhanced error handling.

## 🎯 Features

### Toast Notifications
- **4 Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Configurable duration (default: 5s for success/warning/info, persistent for errors)
- **Manual dismiss**: Click X button to close
- **Stacking**: Multiple toasts can be displayed simultaneously
- **Animations**: Smooth slide-in/slide-out transitions

### Loading States
- **Global Loading**: Full-screen overlay for long operations
- **Operation-specific**: Granular loading states for different async operations
- **Consistent UX**: All async operations provide loading feedback

### Enhanced Error Handling
- **User-friendly messages**: Technical errors converted to actionable messages
- **Contextual feedback**: Different error types get appropriate messaging
- **Recovery guidance**: Clear next steps for users when errors occur

## 🚀 Quick Start

### Basic Toast Usage

```typescript
import { useToast } from '../lib/stores/toast-store';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    showError('Something went wrong', 'Error Details');
  };

  const handleWarning = () => {
    showWarning('Please review your input');
  };

  const handleInfo = () => {
    showInfo('New feature available!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Async Operations with Automatic Notifications

```typescript
import { useAsyncOperation } from '../lib/hooks/use-async-operation';
import { movieService } from '../lib/services';

function MovieDetails({ movieId }: { movieId: string }) {
  const {
    execute: fetchMovie,
    loading,
    error,
    data: movie
  } = useAsyncOperation(
    (id: string) => movieService.getMovieDetails(parseInt(id)),
    {
      loadingKey: 'fetchingMovieDetails',
      showSuccessToast: true,
      successMessage: 'Movie details loaded!',
      showErrorToast: true,
    }
  );

  useEffect(() => {
    fetchMovie(movieId);
  }, [movieId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movie) return <div>No movie found</div>;

  return <div>{movie.title}</div>;
}
```

### Global Loading for Long Operations

```typescript
import { useUIActions } from '../lib/stores/ui-store';

function DataProcessor() {
  const { setGlobalLoading } = useUIActions();

  const handleLongOperation = async () => {
    setGlobalLoading(true, 'Processing your data...');
    
    try {
      await performLongOperation();
      showSuccess('Data processed successfully!');
    } catch (error) {
      showError('Failed to process data');
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <button onClick={handleLongOperation}>
      Start Processing
    </button>
  );
}
```

## 📚 API Reference

### Toast Store (`useToast`)

```typescript
interface ToastActions {
  showSuccess: (message: string, title?: string, options?: Partial<Toast>) => void;
  showError: (message: string, title?: string, options?: Partial<Toast>) => void;
  showWarning: (message: string, title?: string, options?: Partial<Toast>) => void;
  showInfo: (message: string, title?: string, options?: Partial<Toast>) => void;
  clearAllToasts: () => void;
}
```

### Toast Options

```typescript
interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;  // 0 = no auto-dismiss, >0 = auto-dismiss after ms
  dismissible?: boolean;  // Show/hide X button
}
```

### Async Operation Hook (`useAsyncOperation`)

```typescript
interface AsyncOperationOptions {
  loadingKey?: 'fetchingMovies' | 'fetchingMovieDetails' | 'searching' | 'authenticating';
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  useGlobalLoading?: boolean;
  globalLoadingMessage?: string;
}

interface AsyncOperationResult<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
}
```

### UI Store Loading States

```typescript
interface LoadingStates {
  fetchingMovies: boolean;
  fetchingMovieDetails: boolean;
  searching: boolean;
  authenticating: boolean;
}

interface GlobalLoading {
  isLoading: boolean;
  message?: string;
}
```

## 🎨 Customization

### Toast Appearance

Toasts automatically use the appropriate colors and icons based on type:

- **Success**: Green background, checkmark icon
- **Error**: Red background, alert circle icon
- **Warning**: Yellow background, warning triangle icon
- **Info**: Blue background, info circle icon

### Custom Toast Options

```typescript
// Custom duration
showSuccess('Message', 'Title', { duration: 10000 }); // 10 seconds

// Non-dismissible toast
showError('Critical Error', 'System', { dismissible: false });

// Persistent toast (no auto-dismiss)
showWarning('Important Notice', 'Alert', { duration: 0 });
```

### Loading State Customization

```typescript
// Custom global loading message
setGlobalLoading(true, 'Analyzing your preferences...');

// Operation-specific loading
setLoadingState('fetchingMovies', true);
```

## 🧪 Testing

### Testing Toast Functionality

```typescript
import { renderHook, act } from '@testing-library/react';
import { useToastStore } from '../toast-store';

test('should add and remove toasts', () => {
  const { result } = renderHook(() => useToastStore());
  
  act(() => {
    result.current.showSuccess('Test message');
  });
  
  expect(result.current.toasts).toHaveLength(1);
  expect(result.current.toasts[0].message).toBe('Test message');
  
  act(() => {
    result.current.clearAllToasts();
  });
  
  expect(result.current.toasts).toHaveLength(0);
});
```

### Testing Async Operations

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAsyncOperation } from '../use-async-operation';

test('should handle async operation success', async () => {
  const mockFn = vi.fn().mockResolvedValue('success');
  const { result } = renderHook(() => useAsyncOperation(mockFn));
  
  await act(async () => {
    const data = await result.current.execute();
    expect(data).toBe('success');
  });
  
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(null);
  expect(result.current.data).toBe('success');
});
```

## 🔧 Integration Guide

### Adding to Existing Components

1. **Import the hooks**:
```typescript
import { useToast } from '../lib/stores/toast-store';
import { useAsyncOperation } from '../lib/hooks/use-async-operation';
```

2. **Replace manual loading states**:
```typescript
// Before
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// After
const { execute, loading, error } = useAsyncOperation(apiCall, {
  showSuccessToast: true,
  successMessage: 'Operation completed!'
});
```

3. **Add user feedback**:
```typescript
// Before
try {
  await apiCall();
} catch (error) {
  console.error(error);
}

// After
const { showSuccess, showError } = useToast();
try {
  await apiCall();
  showSuccess('Operation completed successfully!');
} catch (error) {
  showError('Operation failed. Please try again.');
}
```

### Global Setup

The notification system is automatically available throughout the app via:

1. **ToastContainer**: Renders all active toasts (already added to App.tsx)
2. **GlobalLoading**: Shows global loading overlay (already added to App.tsx)
3. **Store Integration**: All stores are connected and ready to use

## 🎯 Best Practices

### When to Use Each Notification Type

- **Success**: Completed actions (save, delete, update)
- **Error**: Failed operations, validation errors, network issues
- **Warning**: Potentially destructive actions, important notices
- **Info**: General information, tips, feature announcements

### Loading State Guidelines

- **Global Loading**: Use for operations that block the entire UI (login, major data processing)
- **Operation Loading**: Use for specific actions (loading a movie, searching)
- **Always provide feedback**: Every async operation should have some loading indication

### Error Message Guidelines

- **Be specific**: "Failed to load movie details" vs "An error occurred"
- **Provide context**: Include what the user was trying to do
- **Offer solutions**: "Check your internet connection and try again"
- **Use friendly language**: Avoid technical jargon

## 🚨 Troubleshooting

### Common Issues

1. **Toasts not appearing**: Ensure ToastContainer is rendered in App.tsx
2. **Loading states not updating**: Check that the correct loadingKey is used
3. **TypeScript errors**: Ensure all new types are imported correctly

### Debug Mode

Enable debug logging for the notification system:

```typescript
// In development, log all toast actions
if (process.env.NODE_ENV === 'development') {
  console.log('Toast action:', { type, message, options });
}
```

## 📈 Performance Considerations

- **Toast cleanup**: Toasts are automatically cleaned up after dismissal
- **Loading state optimization**: Loading states are managed efficiently to prevent unnecessary re-renders
- **Memory management**: The toast store automatically manages memory by limiting the number of active toasts

---

*For more examples, see the `NotificationDemo` component in `src/components/ui/notification-demo.tsx`*