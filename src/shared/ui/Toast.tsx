import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ duration = 4000, ...rest }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, duration, ...rest };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-[#131A2E] rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in slide-in-from-bottom-5 duration-200"
          >
            <span className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />}
            </span>

            <div className="flex-1 text-xs">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {t.message}
              </div>
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="mt-2 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
