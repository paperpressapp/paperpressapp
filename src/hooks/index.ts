/**
 * Hooks Index
 * 
 * This file exports all custom React hooks.
 */

// Toast notifications
export { useToast, toast } from "./useToast";

// Debouncing
export { useDebounce } from "./useDebounce";

// LocalStorage persistence
export { useLocalStorage } from "./useLocalStorage";

// Mobile detection
export { useMobile, useWindowWidth } from "./useMobile";

// PDF Generation
export { usePDFGenerator, downloadPDF, openPDFInNewTab } from "./usePDFGenerator";

// Pull to refresh
export { usePullToRefresh } from "./usePullToRefresh";

// Haptics
export { triggerHaptic, useHaptic } from "./useHaptics";

// Swipe gestures
export { useSwipeGesture } from "./useSwipeGesture";
