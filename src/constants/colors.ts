/**
 * PaperPress Color System
 * 
 * Unified color palette for consistent UI across the app.
 * Primary: Blue (#1E88E5) with White theme
 */

export const COLORS = {
  primary: {
    DEFAULT: '#1E88E5',
    dark: '#1565C0',
    mid: '#1976D2',
    light: '#42A5F5',
    lighter: '#64B5F6',
    subtle: '#E3F2FD',
    ghost: '#F5F9FC',
  },
  
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  success: {
    DEFAULT: '#22C55E',
    dark: '#16A34A',
    light: '#86EFAC',
    subtle: '#DCFCE7',
  },
  
  warning: {
    DEFAULT: '#F59E0B',
    dark: '#D97706',
    light: '#FCD34D',
    subtle: '#FEF3C7',
  },
  
  error: {
    DEFAULT: '#EF4444',
    dark: '#DC2626',
    light: '#FCA5A5',
    subtle: '#FEE2E2',
  },
  
  premium: {
    DEFAULT: '#EAB308',
    dark: '#CA8A04',
    light: '#FDE047',
    subtle: '#FEF9C3',
    gradient: 'from-amber-400 to-orange-500',
  },
  
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#6B7280',
} as const;

export const GRADIENTS = {
  primary: 'bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]',
  primaryHorizontal: 'bg-gradient-to-r from-[#1E88E5] to-[#1565C0]',
  primaryLight: 'bg-gradient-to-br from-[#42A5F5] to-[#1E88E5]',
  premium: 'bg-gradient-to-r from-amber-400 to-orange-500',
  success: 'bg-gradient-to-r from-green-400 to-emerald-500',
  surface: 'bg-gradient-to-br from-[#1E88E5]/5 via-transparent to-[#1565C0]/5',
} as const;

export const SHADOWS = {
  sm: 'shadow-sm',
  DEFAULT: 'shadow-md',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  primary: 'shadow-lg shadow-[#1E88E5]/25',
  primaryLg: 'shadow-xl shadow-[#1E88E5]/30',
  premium: 'shadow-lg shadow-amber-500/25',
} as const;

export const CLASS_COLORS = {
  '9th': {
    bg: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-green-500',
    text: 'text-emerald-600',
    subtle: 'bg-emerald-50',
    border: 'border-emerald-200',
    hex: '#4CAF50',
  },
  '10th': {
    bg: 'bg-[#1E88E5]',
    gradient: 'from-[#1E88E5] to-[#1565C0]',
    text: 'text-[#1E88E5]',
    subtle: 'bg-[#E3F2FD]',
    border: 'border-[#BBDEFB]',
    hex: '#1E88E5',
  },
  '11th': {
    bg: 'bg-orange-500',
    gradient: 'from-amber-400 to-orange-500',
    text: 'text-orange-600',
    subtle: 'bg-orange-50',
    border: 'border-orange-200',
    hex: '#FF9800',
  },
  '12th': {
    bg: 'bg-purple-500',
    gradient: 'from-violet-500 to-purple-600',
    text: 'text-purple-600',
    subtle: 'bg-purple-50',
    border: 'border-purple-200',
    hex: '#9C27B0',
  },
} as const;

export const SUBJECT_COLORS = {
  Physics: {
    bg: 'bg-purple-500',
    gradient: 'from-purple-400 to-violet-600',
    text: 'text-purple-600',
    subtle: 'bg-purple-50',
    hex: '#9C27B0',
    icon: 'Atom',
  },
  Chemistry: {
    bg: 'bg-orange-500',
    gradient: 'from-orange-400 to-amber-600',
    text: 'text-orange-600',
    subtle: 'bg-orange-50',
    hex: '#FF9800',
    icon: 'FlaskConical',
  },
  Biology: {
    bg: 'bg-green-500',
    gradient: 'from-green-400 to-emerald-600',
    text: 'text-green-600',
    subtle: 'bg-green-50',
    hex: '#4CAF50',
    icon: 'Dna',
  },
  Mathematics: {
    bg: 'bg-[#1E88E5]',
    gradient: 'from-[#1E88E5] to-[#1565C0]',
    text: 'text-[#1E88E5]',
    subtle: 'bg-[#E3F2FD]',
    hex: '#1E88E5',
    icon: 'Calculator',
  },
  Computer: {
    bg: 'bg-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    text: 'text-slate-600',
    subtle: 'bg-slate-50',
    hex: '#607D8B',
    icon: 'Monitor',
  },
  English: {
    bg: 'bg-pink-500',
    gradient: 'from-pink-400 to-rose-600',
    text: 'text-pink-600',
    subtle: 'bg-pink-50',
    hex: '#E91E63',
    icon: 'BookOpen',
  },
} as const;

export const QUESTION_TYPE_COLORS = {
  mcq: {
    bg: 'bg-[#E3F2FD]',
    gradient: 'from-[#1E88E5] to-[#1565C0]',
    text: 'text-[#1E88E5]',
    border: 'border-[#BBDEFB]',
    hex: '#1E88E5',
  },
  short: {
    bg: 'bg-emerald-50',
    gradient: 'from-emerald-400 to-green-500',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    hex: '#22C55E',
  },
  long: {
    bg: 'bg-amber-50',
    gradient: 'from-amber-400 to-orange-500',
    text: 'text-amber-600',
    border: 'border-amber-200',
    hex: '#F59E0B',
  },
} as const;

export const DIFFICULTY_COLORS = {
  easy: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    hex: '#22C55E',
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    hex: '#F59E0B',
  },
  hard: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    hex: '#EF4444',
  },
} as const;

export type SubjectColor = typeof SUBJECT_COLORS[keyof typeof SUBJECT_COLORS];
export type ClassColor = typeof CLASS_COLORS[keyof typeof CLASS_COLORS];
export type DifficultyColor = typeof DIFFICULTY_COLORS[keyof typeof DIFFICULTY_COLORS];
