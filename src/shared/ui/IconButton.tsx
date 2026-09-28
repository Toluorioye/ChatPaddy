import React from 'react';
import { Spinner } from './Spinner';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'soft';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer shrink-0';

  const sizeStyles = {
    xs: 'w-7 h-7 rounded-md p-1',
    sm: 'w-8 h-8 rounded-lg p-1.5',
    md: 'w-10 h-10 rounded-xl p-2',
    lg: 'w-12 h-12 rounded-xl p-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs focus-visible:ring-[#4F46E5] dark:bg-[#6366F1]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
    outline: 'border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200',
    soft: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/50',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800',
  };

  return (
    <button
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? <Spinner size="sm" className="text-current" /> : children}
    </button>
  );
};
