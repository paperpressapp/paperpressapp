/**
 * Stores Index
 * 
 * This file exports all Zustand stores from the stores directory.
 * Import stores from here: import { usePaperStore, useUserStore } from '@/stores';
 */

// Paper Store - Manages paper creation state with localStorage persistence
export { usePaperStore } from './paperStore';

// User Store - Simple localStorage-based user info (no auth!)
export { useUserStore } from './userStore';

// Auth Store - Supabase authentication
export { useAuthStore, initializeAuth, cleanupAuth } from './authStore';
export type { Profile, UserRole } from './authStore';
