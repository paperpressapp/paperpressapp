/**
 * Simple User Store - MVP Version
 * 
 * No auth! Just simple localStorage for user name and institute.
 * Optimized for performance with minimal re-renders.
 */

import { create } from 'zustand';

interface UserState {
  // State
  name: string;
  instituteName: string;
  isLoading: boolean;

  // Actions
  setName: (name: string) => void;
  setInstituteName: (instituteName: string) => void;
  loadFromStorage: () => void;
  clearUser: () => void;
}

// Helper to safely access localStorage (for SSR)
const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
};

// Pre-load initial values at store creation time
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { name: '', instituteName: '', isLoading: true };
  }
  return {
    name: getStorageItem('paperpress_user_name') || '',
    instituteName: getStorageItem('paperpress_user_institute') || '',
    isLoading: false,
  };
};

export const useUserStore = create<UserState>()((set) => ({
  // Initial state - loaded synchronously once
  ...getInitialState(),

  // Actions
  setName: (name: string) => {
    setStorageItem('paperpress_user_name', name);
    set({ name });
  },

  setInstituteName: (instituteName: string) => {
    setStorageItem('paperpress_user_institute', instituteName);
    set({ instituteName });
  },

  loadFromStorage: () => {
    // Already loaded at init, just ensure isLoading is false
    set({ isLoading: false });
  },

  clearUser: () => {
    removeStorageItem('paperpress_user_name');
    removeStorageItem('paperpress_user_institute');
    set({ name: '', instituteName: '' });
  },
}));
