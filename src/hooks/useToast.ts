"use client";

/**
 * useToast Hook
 * 
 * Custom hook for displaying toast notifications.
 */

import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  /** Toast duration in milliseconds */
  duration?: number;
  /** Toast position */
  position?: "top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left";
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: "top-center",
};

export function useToast() {
  const toast = {
    /**
     * Show success toast
     */
    success: (message: string, options?: ToastOptions) => {
      sonnerToast.success(message, { ...defaultOptions, ...options });
    },

    /**
     * Show error toast
     */
    error: (message: string, options?: ToastOptions) => {
      sonnerToast.error(message, { ...defaultOptions, ...options });
    },

    /**
     * Show warning toast
     */
    warning: (message: string, options?: ToastOptions) => {
      sonnerToast.warning(message, { ...defaultOptions, ...options });
    },

    /**
     * Show info toast
     */
    info: (message: string, options?: ToastOptions) => {
      sonnerToast.info(message, { ...defaultOptions, ...options });
    },

    /**
     * Show loading toast
     */
    loading: (message: string, options?: ToastOptions) => {
      return sonnerToast.loading(message, { ...defaultOptions, ...options });
    },

    /**
     * Dismiss a specific toast or all toasts
     */
    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },

    /**
     * Update a loading toast
     */
    successFromLoading: (toastId: string | number, message: string) => {
      sonnerToast.success(message, { id: toastId });
    },

    /**
     * Update a loading toast to error
     */
    errorFromLoading: (toastId: string | number, message: string) => {
      sonnerToast.error(message, { id: toastId });
    },
  };

  return { toast };
}

// Standalone toast functions for use outside of components
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, { ...defaultOptions, ...options });
  },
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, { ...defaultOptions, ...options });
  },
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  },
};
