import { AlertTriangle, AlertCircle, XCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error message component for displaying various types of error states
 * Supports different variants, sizes, and interactive actions
 */
export function ErrorMessage({
  title,
  message,
  variant = 'error',
  size = 'medium',
  showIcon = true,
  dismissible = false,
  onDismiss,
  onRetry,
  className
}: ErrorMessageProps) {
  const variantStyles = {
    error: {
      container: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
      icon: XCircle,
      iconColor: 'text-destructive'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  };

  const sizeStyles = {
    small: {
      container: 'p-3 text-sm',
      icon: 'h-4 w-4',
      title: 'text-sm font-medium',
      message: 'text-xs',
      button: 'px-2 py-1 text-xs'
    },
    medium: {
      container: 'p-4 text-sm',
      icon: 'h-5 w-5',
      title: 'text-base font-medium',
      message: 'text-sm',
      button: 'px-3 py-1.5 text-sm'
    },
    large: {
      container: 'p-6 text-base',
      icon: 'h-6 w-6',
      title: 'text-lg font-semibold',
      message: 'text-base',
      button: 'px-4 py-2 text-sm'
    }
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const IconComponent = styles.icon;

  return (
    <div className={`
      border rounded-lg ${styles.container} ${sizes.container} ${className || ''}
    `}>
      <div className="flex items-start">
        {showIcon && (
          <IconComponent className={`${sizes.icon} ${styles.iconColor} mt-0.5 flex-shrink-0`} />
        )}
        
        <div className={`flex-1 ${showIcon ? 'ml-3' : ''}`}>
          {title && (
            <h3 className={`${sizes.title} mb-1`}>
              {title}
            </h3>
          )}
          <p className={sizes.message}>
            {message}
          </p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className={`
                mt-3 inline-flex items-center gap-1 ${sizes.button}
                bg-primary text-primary-foreground rounded hover:bg-primary/90 
                transition-colors focus:outline-none focus:ring-2 focus:ring-ring
              `}
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </button>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`
              ${styles.iconColor} hover:opacity-70 transition-opacity 
              focus:outline-none focus:ring-2 focus:ring-ring rounded
            `}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error message for form fields and small components
 */
export function InlineErrorMessage({ 
  message, 
  className 
}: { 
  message: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center gap-1 text-destructive text-sm ${className || ''}`}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Empty state component for when no data is available
 */
export function EmptyState({
  title = "No data available",
  message = "There's nothing to show here yet.",
  icon: IconComponent = AlertCircle,
  action,
  className
}: {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className || ''}`}>
      <IconComponent className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        {message}
      </p>
      {action}
    </div>
  );
}

/**
 * Network error component with retry functionality
 */
export function NetworkError({ 
  onRetry, 
  className 
}: { 
  onRetry?: () => void; 
  className?: string; 
}) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      variant="error"
      onRetry={onRetry}
      className={className}
    />
  );
}

/**
 * API error component for handling API-specific errors
 */
export function APIError({ 
  error, 
  onRetry, 
  className 
}: { 
  error: { message: string; status?: number }; 
  onRetry?: () => void; 
  className?: string; 
}) {
  const getErrorMessage = () => {
    if (error.status === 404) {
      return "The requested resource was not found.";
    }
    if (error.status === 500) {
      return "Server error occurred. Please try again later.";
    }
    if (error.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }
    return error.message || "An unexpected error occurred.";
  };

  return (
    <ErrorMessage
      title={`Error ${error.status ? `(${error.status})` : ''}`}
      message={getErrorMessage()}
      variant="error"
      onRetry={onRetry}
      className={className}
    />
  );
}

export default ErrorMessage;