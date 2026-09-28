import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while loading this content.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
