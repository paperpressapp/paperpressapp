/**
 * Simple User Store - MVP Version
 * 
 * No auth! Just simple localStorage for user name and institute.
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
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const useUserStore = create<UserState>()((set) => ({
  // Initial state
  name: '',
  instituteName: '',
  isLoading: true,

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
    const name = getStorageItem('paperpress_user_name') || '';
    const instituteName = getStorageItem('paperpress_user_institute') || '';
    set({ name, instituteName, isLoading: false });
  },

  clearUser: () => {
    removeStorageItem('paperpress_user_name');
    removeStorageItem('paperpress_user_institute');
    set({ name: '', instituteName: '' });
  },
}));
