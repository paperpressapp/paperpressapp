/**
 * Design Tokens - Single Source of Truth for PaperPress
 * 
 * All styling must use these tokens. No hardcoded values.
 */

export const tokens = {
  // Colors - Dark Theme (Default)
  colors: {
    dark: {
      background: {
        primary: '#0A0A0A',
        secondary: '#1A1A1A',
        card: '#1A1A1A',
        elevated: '#252525',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        muted: '#6B6B6B',
        inverse: '#0A0A0A',
      },
      border: {
        default: '#2A2A2A',
        hover: '#3A3A3A',
      },
      accent: {
        primary: '#B9FF66',
        secondary: '#22C55E',
        tertiary: '#4ADE80',
      },
      status: {
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#FF4D4D',
        info: '#3B82F6',
      },
    },
    // Light Theme
    light: {
      background: {
        primary: '#FAFAFA',
        secondary: '#FFFFFF',
        card: '#FFFFFF',
        elevated: '#FFFFFF',
      },
      text: {
        primary: '#0A0A0A',
        secondary: '#6B6B6B',
        muted: '#9CA3AF',
        inverse: '#FFFFFF',
      },
      border: {
        default: '#E5E5E5',
        hover: '#D1D5DB',
      },
      accent: {
        primary: '#22C55E',
        secondary: '#16A34A',
        tertiary: '#4ADE80',
      },
      status: {
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
        info: '#2563EB',
      },
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing Scale (4px base)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
  },

  // Border Radius Scale
  radius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
    button: '40px',
    card: '20px',
    input: '12px',
    badge: '9999px',
  },

  // Shadow Tokens
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(185, 255, 102, 0.3)',
    'glow-sm': '0 0 10px rgba(185, 255, 102, 0.2)',
  },

  // Animation Timings
  transitions: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  // Easing Functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript
export type Colors = typeof tokens.colors;
export type Typography = typeof tokens.typography;
export type Spacing = typeof tokens.spacing;
export type Radius = typeof tokens.radius;
export type Shadows = typeof tokens.shadows;
export type Transitions = typeof tokens.transitions;
export type Easing = typeof tokens.easing;

// CSS Variable mappings for runtime theme switching
export const cssVariables = {
  dark: {
    '--bg-primary': tokens.colors.dark.background.primary,
    '--bg-secondary': tokens.colors.dark.background.secondary,
    '--bg-card': tokens.colors.dark.background.card,
    '--bg-elevated': tokens.colors.dark.background.elevated,
    '--text-primary': tokens.colors.dark.text.primary,
    '--text-secondary': tokens.colors.dark.text.secondary,
    '--text-muted': tokens.colors.dark.text.muted,
    '--text-inverse': tokens.colors.dark.text.inverse,
    '--border-default': tokens.colors.dark.border.default,
    '--border-hover': tokens.colors.dark.border.hover,
    '--accent-primary': tokens.colors.dark.accent.primary,
    '--accent-secondary': tokens.colors.dark.accent.secondary,
    '--accent-tertiary': tokens.colors.dark.accent.tertiary,
    '--status-success': tokens.colors.dark.status.success,
    '--status-warning': tokens.colors.dark.status.warning,
    '--status-error': tokens.colors.dark.status.error,
    '--status-info': tokens.colors.dark.status.info,
  },
  light: {
    '--bg-primary': tokens.colors.light.background.primary,
    '--bg-secondary': tokens.colors.light.background.secondary,
    '--bg-card': tokens.colors.light.background.card,
    '--bg-elevated': tokens.colors.light.background.elevated,
    '--text-primary': tokens.colors.light.text.primary,
    '--text-secondary': tokens.colors.light.text.secondary,
    '--text-muted': tokens.colors.light.text.muted,
    '--text-inverse': tokens.colors.light.text.inverse,
    '--border-default': tokens.colors.light.border.default,
    '--border-hover': tokens.colors.light.border.hover,
    '--accent-primary': tokens.colors.light.accent.primary,
    '--accent-secondary': tokens.colors.light.accent.secondary,
    '--accent-tertiary': tokens.colors.light.accent.tertiary,
    '--status-success': tokens.colors.light.status.success,
    '--status-warning': tokens.colors.light.status.warning,
    '--status-error': tokens.colors.light.status.error,
    '--status-info': tokens.colors.light.status.info,
  },
} as const;
