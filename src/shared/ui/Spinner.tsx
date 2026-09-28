import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
