/**
 * Storage utilities for separating Guest and Auth user data
 */

const AUTH_PREFIX = 'paperpress_auth_';
const GUEST_PREFIX = 'paperpress_guest_';

/**
 * Get the appropriate storage key based on auth status
 */
const getStorageKey = (key: string, isAuth: boolean): string => {
  return isAuth ? `${AUTH_PREFIX}${key}` : `${GUEST_PREFIX}${key}`;
};

/**
 * Check if user is authenticated
 */
const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('paperpress_auth_user') === 'true';
};

/**
 * Storage interface for type-safe storage operations
 */
export const authStorage = {
  /**
   * Get item from storage (automatically uses correct prefix)
   */
  getItem: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const storageKey = getStorageKey(key, isAuthenticated());
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Set item in storage (automatically uses correct prefix)
   */
  setItem: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = getStorageKey(key, isAuthenticated());
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const authKey = `${AUTH_PREFIX}${key}`;
      const guestKey = `${GUEST_PREFIX}${key}`;
      localStorage.removeItem(authKey);
      localStorage.removeItem(guestKey);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  /**
   * Clear all auth data (used on logout)
   */
  clearAuthData: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Remove all auth-prefixed items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(AUTH_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Remove auth flag
      localStorage.removeItem('paperpress_auth_user');
    } catch (error) {
      console.error('Clear auth error:', error);
    }
  },

  /**
   * Get user name (works for both guest and auth)
   */
  getUserName: (): string => {
    if (typeof window === 'undefined') return 'Guest';
    
    const isAuth = isAuthenticated();
    const key = getStorageKey('user_name', isAuth);
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored.replace(/"/g, '');
      }
    }
    
    // Fallback for backward compatibility
    const legacyName = localStorage.getItem('paperpress_user_name');
    if (legacyName) {
      // Migrate to new format
      localStorage.setItem(key, legacyName);
      return legacyName.replace(/"/g, '');
    }
    
    return isAuth ? 'User' : 'Guest';
  },

  /**
   * Set user name
   */
  setUserName: (name: string): void => {
    if (typeof window === 'undefined') return;
    
    const key = getStorageKey('user_name', isAuthenticated());
    localStorage.setItem(key, JSON.stringify(name));
  },

  /**
   * Get user email
   */
  getUserEmail: (): string => {
    if (typeof window === 'undefined') return '';
    
    const isAuth = isAuthenticated();
    const key = getStorageKey('user_email', isAuth);
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored.replace(/"/g, '');
      }
    }
    
    // Fallback for backward compatibility
    const legacyEmail = localStorage.getItem('paperpress_user_email');
    if (legacyEmail) {
      localStorage.setItem(key, legacyEmail);
      return legacyEmail.replace(/"/g, '');
    }
    
    return '';
  },

  /**
   * Set user email
   */
  setUserEmail: (email: string): void => {
    if (typeof window === 'undefined') return;
    
    const key = getStorageKey('user_email', isAuthenticated());
    localStorage.setItem(key, JSON.stringify(email));
  },

  /**
   * Get papers count
   */
  getPapersCount: (): number => {
    return authStorage.getItem('papers_count', 0);
  },

  /**
   * Set papers count
   */
  setPapersCount: (count: number): void => {
    authStorage.setItem('papers_count', count);
  },

  /**
   * Check if authenticated
   */
  isAuthenticated,

  /**
   * Mark as authenticated user
   */
  setAuthenticated: (isAuth: boolean): void => {
    if (typeof window === 'undefined') return;
    
    if (isAuth) {
      localStorage.setItem('paperpress_auth_user', 'true');
    } else {
      localStorage.removeItem('paperpress_auth_user');
    }
  },
};

export default authStorage;
