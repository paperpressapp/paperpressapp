/**
 * Local Storage Utilities
 * 
 * SSR-safe functions for interacting with localStorage.
 */

/**
 * Check if we're running on the client side
 */
function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get a value from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 * @returns Stored value or default
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isClient()) {
    return defaultValue;
  }
  
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set a value to localStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export function setToLocalStorage<T>(key: string, value: T): void {
  if (!isClient()) {
    return;
  }
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Remove a value from localStorage
 * @param key - Storage key to remove
 */
export function removeFromLocalStorage(key: string): void {
  if (!isClient()) {
    return;
  }
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage data for the app
 */
export function clearLocalStorage(): void {
  if (!isClient()) {
    return;
  }
  
  try {
    window.localStorage.clear();
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
}

// Storage keys used throughout the app
export const STORAGE_KEYS = {
  USER: 'paperpress_user',
  PROFILE: 'paperpress_profile',
  PAPERS: 'paperpress_papers',
  SETTINGS: 'paperpress_settings',
  ONBOARDING: 'paperpress_onboarding_complete',
} as const;
