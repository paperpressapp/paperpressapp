"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  strokeWidth?: number;
}

const sizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Icon({ icon: IconComponent, size = 'md', className, strokeWidth = 2 }: IconProps) {
  return (
    <IconComponent
      size={sizes[size]}
      strokeWidth={strokeWidth}
      className={cn('text-[var(--text-primary)]', className)}
    />
  );
}

// Convenience component for icon buttons
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function IconButton({
  icon: IconComponent,
  variant = 'default',
  size = 'md',
  label,
  className,
  ...props
}: IconButtonProps) {
  const variants = {
    default: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-color)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
    outline: 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      aria-label={label}
      {...props}
    >
      <IconComponent size={iconSizes[size]} />
    </button>
  );
}
