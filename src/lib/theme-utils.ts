import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Theme-aware class utilities
export function themeClasses(dark: string, light: string): string {
  if (typeof window === 'undefined') return dark;
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? dark : light;
}

// Get CSS variable value
export function getCSSVar(variable: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// Theme-aware component base classes
export const themeBase = {
  // Backgrounds
  bgPrimary: 'bg-[var(--bg-primary)]',
  bgSecondary: 'bg-[var(--bg-secondary)]',
  bgCard: 'bg-[var(--bg-card)]',
  bgElevated: 'bg-[var(--bg-elevated)]',
  
  // Text
  textPrimary: 'text-[var(--text-primary)]',
  textSecondary: 'text-[var(--text-secondary)]',
  textMuted: 'text-[var(--text-muted)]',
  textInverse: 'text-[var(--text-inverse)]',
  
  // Borders
  borderDefault: 'border-[var(--border-default)]',
  borderHover: 'border-[var(--border-hover)]',
  
  // Accents
  accentPrimary: 'text-[var(--accent-primary)]',
  accentSecondary: 'text-[var(--accent-secondary)]',
  accentBg: 'bg-[var(--accent-primary)]',
  
  // Status
  statusSuccess: 'text-[var(--status-success)]',
  statusWarning: 'text-[var(--status-warning)]',
  statusError: 'text-[var(--status-error)]',
  statusInfo: 'text-[var(--status-info)]',
}

// Common component patterns
export const cardStyle = cn(
  'rounded-[20px] border border-[var(--border-default)] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]',
  'bg-[var(--bg-card)]'
)

export const inputStyle = cn(
  'rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-secondary)]',
  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
  'focus:outline-none focus:border-[var(--accent-primary)]'
)

export const buttonPrimary = cn(
  'rounded-[40px] bg-[var(--accent-primary)] text-[var(--text-inverse)]',
  'font-semibold shadow-lg hover:opacity-90 transition-opacity'
)

export const buttonSecondary = cn(
  'rounded-[40px] border border-[var(--border-default)] bg-transparent',
  'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors'
)
