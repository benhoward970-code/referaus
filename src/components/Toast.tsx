'use client';
import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// Global singleton for use outside React components
let _globalShowToast: ((message: string, type?: ToastType) => void) | null = null;
export function showToast(message: string, type: ToastType = 'info') {
  if (_globalShowToast) _globalShowToast(message, type);
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500', text: 'text-green-800' },
  error:   { bg: 'bg-red-50',   border: 'border-red-200',   icon: 'bg-red-500',   text: 'text-red-800'   },
  info:    { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: 'bg-blue-500',  text: 'text-blue-800'  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToastFn = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(++idRef.current);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    _globalShowToast = showToastFn;
    return () => { _globalShowToast = null; };
  }, [showToastFn]);

  return (
    <ToastContext.Provider value={{ showToast: showToastFn }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-atomic="false">
        <AnimatePresence>
          {toasts.map(toast => {
            const c = COLORS[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[220px] max-w-xs ${c.bg} ${c.border}`}
                role="alert"
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${c.icon}`}>
                  {ICONS[toast.type]}
                </span>
                <p className={`text-sm font-medium ${c.text}`}>{toast.message}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
