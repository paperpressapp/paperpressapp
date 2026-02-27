/**
 * Design Tokens - Unified Design System
 * 
 * This file contains all the design tokens for the app.
 * Use these tokens instead of hardcoded values for consistency.
 */

export const tokens = {
  // Colors
  colors: {
    primary: {
      DEFAULT: '#1E88E5',
      dark: '#1565C0',
      light: '#64B5F6',
      subtle: '#E3F2FD',
      foreground: '#FFFFFF',
    },
    success: {
      DEFAULT: '#22C55E',
      light: '#DCFCE7',
    },
    warning: {
      DEFAULT: '#F59E0B',
      light: '#FEF3C7',
    },
    error: {
      DEFAULT: '#EF4444',
      light: '#FEE2E2',
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    background: '#FFFFFF',
    foreground: '#111827',
    muted: '#F3F4F6',
    'muted-foreground': '#6B7280',
    border: '#E5E7EB',
    ring: '#1E88E5',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Spacing
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.375rem',
    DEFAULT: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-out',
    DEFAULT: '200ms ease-out',
    slow: '300ms ease-out',
  },
  
  // Layout
  layout: {
    headerHeight: '56px',
    bottomNavHeight: '72px',
    maxWidth: '428px',
  },
} as const;

// Utility function to get color with opacity
export function getColor(color: string, opacity?: number): string {
  if (opacity !== undefined) {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  }
  return color;
}

// CSS variable generator
export function toCssVariables(): Record<string, string> {
  return {
    '--color-primary': tokens.colors.primary.DEFAULT,
    '--color-primary-dark': tokens.colors.primary.dark,
    '--color-primary-light': tokens.colors.primary.light,
    '--color-primary-subtle': tokens.colors.primary.subtle,
    '--color-success': tokens.colors.success.DEFAULT,
    '--color-success-light': tokens.colors.success.light,
    '--color-warning': tokens.colors.warning.DEFAULT,
    '--color-warning-light': tokens.colors.warning.light,
    '--color-error': tokens.colors.error.DEFAULT,
    '--color-error-light': tokens.colors.error.light,
    '--color-background': tokens.colors.background,
    '--color-foreground': tokens.colors.foreground,
    '--color-muted': tokens.colors.muted,
    '--color-muted-foreground': tokens.colors['muted-foreground'],
    '--color-border': tokens.colors.border,
    '--color-ring': tokens.colors.ring,
    '--header-height': tokens.layout.headerHeight,
    '--bottom-nav-height': tokens.layout.bottomNavHeight,
  };
}

export default tokens;
