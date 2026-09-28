import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'spark';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-semibold rounded-md leading-none',
    md: 'text-xs px-2 py-0.5 font-medium rounded-full',
  };

  const variantStyles = {
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    spark: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <span className={`inline-flex items-center justify-center ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
