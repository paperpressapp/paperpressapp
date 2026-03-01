"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isSystem: boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      // Get system preference
      const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };

      return {
        theme: 'system',
        resolvedTheme: getSystemTheme(),
        
        toggleTheme: () => set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : state.theme === 'light' ? 'system' : 'dark';
          const systemTheme = getSystemTheme();
          return {
            theme: nextTheme,
            resolvedTheme: nextTheme === 'system' ? systemTheme : nextTheme,
            isDark: nextTheme === 'system' ? systemTheme === 'dark' : nextTheme === 'dark',
            isSystem: nextTheme === 'system',
          };
        }),
        
        setTheme: (theme: Theme) => set(() => {
          const systemTheme = getSystemTheme();
          return {
            theme,
            resolvedTheme: theme === 'system' ? systemTheme : theme,
            isDark: theme === 'system' ? systemTheme === 'dark' : theme === 'dark',
            isSystem: theme === 'system',
          };
        }),
        
        isDark: getSystemTheme() === 'dark',
        isSystem: true,
      };
    },
    {
      name: 'theme-storage',
    }
  )
);

// Sync with system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      useThemeStore.setState({
        resolvedTheme: e.matches ? 'dark' : 'light',
        isDark: e.matches,
      });
    }
  });
}
