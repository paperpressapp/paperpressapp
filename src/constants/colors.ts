/**
 * Colors Constants
 * 
 * All color values used throughout the application.
 * These ensure consistent theming and branding.
 */

/** Primary brand colors */
export const COLORS = {
  /** Main primary color */
  primary: '#1E88E5',
  /** Darker primary for hover states */
  primaryDark: '#1565C0',
  /** Lighter primary for backgrounds */
  primaryLight: '#64B5F6',
  /** Subtle primary for light backgrounds */
  primarySubtle: '#E3F2FD',
  
  /** Success/green color */
  success: '#22C55E',
  /** Light success background */
  successLight: '#DCFCE7',
  
  /** Warning/amber color */
  warning: '#F59E0B',
  /** Light warning background */
  warningLight: '#FEF3C7',
  
  /** Error/red color */
  error: '#EF4444',
  /** Light error background */
  errorLight: '#FEE2E2',
  
  /** Pure white */
  white: '#FFFFFF',
  /** Pure black */
  black: '#000000',
  
  /** Page background */
  background: '#F8FAFC',
  /** Card/elevated background */
  card: '#FFFFFF',
  /** Border color */
  border: '#E2E8F0',
  
  /** Primary text color */
  textPrimary: '#1E293B',
  /** Secondary text color */
  textSecondary: '#64748B',
  /** Muted/disabled text */
  textMuted: '#94A3B8',
} as const;

/** Subject-specific colors for visual differentiation */
export const SUBJECT_COLORS = {
  Physics: '#9C27B0',
  Chemistry: '#FF9800',
  Biology: '#4CAF50',
  Mathematics: '#2196F3',
  Computer: '#607D8B',
  English: '#E91E63',
} as const;

/** Class-specific colors for visual differentiation */
export const CLASS_COLORS = {
  '9th': '#4CAF50',
  '10th': '#2196F3',
  '11th': '#FF9800',
  '12th': '#9C27B0',
} as const;

/** Difficulty level colors */
export const DIFFICULTY_COLORS = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
} as const;

/** Type helpers */
export type SubjectColor = typeof SUBJECT_COLORS[keyof typeof SUBJECT_COLORS];
export type ClassColor = typeof CLASS_COLORS[keyof typeof CLASS_COLORS];
export type DifficultyColor = typeof DIFFICULTY_COLORS[keyof typeof DIFFICULTY_COLORS];
