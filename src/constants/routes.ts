/**
 * Routes Constants
 * 
 * All route paths used throughout the application.
 * Use these instead of hardcoded strings for consistency.
 */

export const ROUTES = {
  /** Home page after login */
  HOME: '/home',
  
  /** Welcome/splash screen */
  WELCOME: '/welcome',
  
  /** Authentication routes */
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  VERIFY_EMAIL: '/auth/verify',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  /** Onboarding flow */
  ONBOARDING: '/onboarding',
  
  /** Subject selection - append /[classId] */
  SUBJECTS: '/subjects',
  
  /** Chapter selection - append /[classId]/[subjectId] */
  CHAPTERS: '/chapters',
  
  /** Paper creation page */
  CREATE_PAPER: '/create-paper',
  
  /** Paper preview - append /[paperId] */
  PAPER_PREVIEW: '/paper',
  
  /** User's generated papers */
  MY_PAPERS: '/my-papers',
  
  /** Settings page */
  SETTINGS: '/settings',
} as const;

/** Type for route values */
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
