"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[var(--z-index-tooltip)] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--status-error)]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--status-warning)]" />,
    info: <Info className="w-5 h-5 text-[var(--status-info)]" />,
  };

  const borderColors = {
    success: 'border-l-[var(--status-success)]',
    error: 'border-l-[var(--status-error)]',
    warning: 'border-l-[var(--status-warning)]',
    info: 'border-l-[var(--status-info)]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-[var(--bg-card)] rounded-[var(--radius-lg)]',
        'border border-[var(--border-color)] border-l-4',
        'shadow-lg p-4',
        borderColors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text-primary)]">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {toast.description}
            </p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Convenience functions
export function toastSuccess(title: string, description?: string) {
  return { type: 'success' as ToastType, title, description };
}

export function toastError(title: string, description?: string) {
  return { type: 'error' as ToastType, title, description };
}

export function toastWarning(title: string, description?: string) {
  return { type: 'warning' as ToastType, title, description };
}

export function toastInfo(title: string, description?: string) {
  return { type: 'info' as ToastType, title, description };
}
