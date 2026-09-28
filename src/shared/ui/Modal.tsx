import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl w-full h-[95vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-[#131A2E] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-10 max-h-[94vh] animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="min-w-0 pr-2">
              {typeof title === 'string' ? (
                <h3
                  id={titleId}
                  className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white truncate"
                >
                  {title}
                </h3>
              ) : (
                <div id={titleId}>{title}</div>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{description}</p>
              )}
            </div>

            {showCloseButton && (
              <IconButton
                aria-label="Close dialog"
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              >
                <X className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50 dark:bg-[#0E1526]/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
