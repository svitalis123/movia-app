import { useState } from 'react';
import { useToast } from '../../lib/stores/toast-store';
import {
  useAsyncOperation,
  useAsyncAction,
} from '../../lib/hooks/use-async-operation';
import { enhancedMovieService } from '../../lib/services/enhanced-movie-service';
import { useUIActions } from '../../lib/stores/ui-store';

/**
 * Demo component showing how to use the notification system
 * This demonstrates all the notification patterns implemented in task 13.2
 */
export function NotificationDemo() {
  const [movieId, setMovieId] = useState('550'); // Fight Club as default
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { setGlobalLoading } = useUIActions();

  // Example of using async operation hook with notifications
  const {
    execute: fetchMovieDetails,
    loading: movieLoading,
    error: movieError,
    data: movieData,
  } = useAsyncOperation(
    (...args: unknown[]) =>
      enhancedMovieService.getMovieDetails(parseInt(args[0] as string)),
    {
      loadingKey: 'fetchingMovieDetails',
      showSuccessToast: true,
      successMessage: 'Movie details loaded successfully!',
      showErrorToast: true,
    }
  );

  // Example of using async action hook
  const {
    execute: performAction,
    loading: actionLoading,
    error: actionError,
  } = useAsyncAction(
    async () => {
      // Simulate an async action
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (Math.random() > 0.5) {
        throw new Error('Random action failed');
      }
    },
    {
      showSuccessToast: true,
      successMessage: 'Action completed successfully!',
      useGlobalLoading: true,
      globalLoadingMessage: 'Processing action...',
    }
  );

  const handleToastExamples = () => {
    showSuccess('This is a success message!', 'Success');

    setTimeout(() => {
      showInfo('This is an informational message', 'Info');
    }, 1000);

    setTimeout(() => {
      showWarning('This is a warning message', 'Warning');
    }, 2000);

    setTimeout(() => {
      showError('This is an error message that persists', 'Error');
    }, 3000);
  };

  const handleGlobalLoading = () => {
    setGlobalLoading(true, 'Simulating global loading...');
    setTimeout(() => {
      setGlobalLoading(false);
      showSuccess('Global loading completed!');
    }, 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Notification System Demo
      </h2>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Toast Notifications</h3>
          <button
            onClick={handleToastExamples}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Show Toast Examples
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Global Loading</h3>
          <button
            onClick={handleGlobalLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Show Global Loading
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">
            Async Operation with Notifications
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Movie ID:
              </label>
              <input
                type="text"
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                className="px-3 py-2 border rounded-md w-32"
                placeholder="Movie ID"
              />
            </div>
            <button
              onClick={() => fetchMovieDetails(movieId)}
              disabled={movieLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {movieLoading ? 'Loading...' : 'Fetch Movie Details'}
            </button>
            {movieError && <p className="text-red-600 text-sm">{movieError}</p>}
            {movieData && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Loaded: {movieData.title} (
                {movieData.release_date?.split('-')[0]})
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">
            Async Action with Global Loading
          </h3>
          <button
            onClick={() => performAction()}
            disabled={actionLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? 'Processing...' : 'Perform Random Action'}
          </button>
          {actionError && (
            <p className="text-red-600 text-sm mt-2">{actionError}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Features Implemented:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <li>
            Toast notifications for user actions (success, error, warning, info)
          </li>
          <li>Loading states for all async operations</li>
          <li>User-friendly error messages</li>
          <li>Global loading overlay for long operations</li>
          <li>Automatic toast dismissal with manual dismiss option</li>
          <li>Integration with async operation hooks</li>
          <li>Consistent UX patterns across the application</li>
        </ul>
      </div>
    </div>
  );
}

export default NotificationDemo;
