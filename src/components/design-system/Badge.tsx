"use client";

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: `
        bg-[var(--bg-elevated)] text-[var(--text-secondary)]
      `,
      success: `
        bg-[var(--status-success)]/20 text-[var(--status-success)]
      `,
      warning: `
        bg-[var(--status-warning)]/20 text-[var(--status-warning)]
      `,
      error: `
        bg-[var(--status-error)]/20 text-[var(--status-error)]
      `,
      info: `
        bg-[var(--status-info)]/20 text-[var(--status-info)]
      `,
      premium: `
        bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]
      `,
      outline: `
        bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)]
      `,
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {variant === 'premium' && <Crown className="w-3 h-3" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
