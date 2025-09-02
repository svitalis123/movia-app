import { useGlobalLoading } from '../../lib/stores/ui-store';
import { LoadingSpinner } from './loading-spinner';

/**
 * Global loading overlay component
 * Shows a full-screen loading overlay when global loading is active
 */
export function GlobalLoading() {
  const { isLoading, message } = useGlobalLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background border rounded-lg p-6 shadow-lg min-w-64">
        <LoadingSpinner size="large" message={message || 'Loading...'} />
      </div>
    </div>
  );
}

export default GlobalLoading;
