import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 h-12',
  };

  const variantStyles = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs focus-visible:ring-[#4F46E5] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus-visible:ring-slate-400',
    outline: 'border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200 focus-visible:ring-indigo-500',
    soft: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 focus-visible:ring-indigo-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500',
    ghost: 'hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 focus-visible:ring-slate-400',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-1 text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
