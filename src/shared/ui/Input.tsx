import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-white dark:bg-[#131A2E] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm transition-colors py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5] dark:focus:ring-[#6366F1]/40 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-slate-400 dark:text-slate-500 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <span className="text-xs text-rose-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
