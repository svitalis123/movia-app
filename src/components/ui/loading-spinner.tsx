import { Loader2 } from 'lucide-react';
import type { LoadingSpinnerProps } from '../../lib/types';

/**
 * Loading spinner component with different sizes and styles
 * Supports full-screen overlay and custom messages
 */
export function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary', 
  message, 
  fullScreen = false,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-muted-foreground',
    inherit: 'text-current'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className || ''}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
      {message && (
        <p className={`text-sm ${colorClasses[color]} text-center`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-background border rounded-lg p-6 shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

/**
 * Inline loading spinner for smaller components
 */
export function InlineSpinner({ size = 'small', className }: { size?: 'small' | 'medium'; className?: string }) {
  return (
    <Loader2 className={`animate-spin ${size === 'small' ? 'h-4 w-4' : 'h-6 w-6'} ${className || ''}`} />
  );
}

/**
 * Loading overlay for content areas
 */
export function LoadingOverlay({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md ${className || ''}`}>
      <LoadingSpinner message={message} />
    </div>
  );
}

export default LoadingSpinner;