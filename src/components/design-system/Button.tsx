"use client";

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { tokens } from '@/styles/tokens';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-250
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
        text-[var(--text-inverse)] shadow-glow-sm hover:brightness-110
      `,
      secondary: `
        bg-[var(--bg-elevated)] text-[var(--text-primary)]
        border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]
      `,
      outline: `
        bg-transparent text-[var(--text-primary)]
        border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]
      `,
      ghost: `
        bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]
      `,
      danger: `
        bg-[var(--status-error)] text-white hover:brightness-110
      `,
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-lg',
      md: 'h-11 px-5 text-base rounded-[var(--radius-button)]',
      lg: 'h-14 px-8 text-lg rounded-[var(--radius-button)]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
