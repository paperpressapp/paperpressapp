"use client";

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isPremium?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', isPremium, ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const premiumFrameSizes = {
      xs: 'w-7 h-7 -m-0.5',
      sm: 'w-9 h-9 -m-0.5',
      md: 'w-11 h-11 -m-0.5',
      lg: 'w-13 h-13 -m-0.5',
      xl: 'w-17 h-17 -m-0.5',
    };

    const initials = fallback || '?';

    return (
      <div className="relative inline-flex" ref={ref}>
        <div
          className={cn(
            'relative rounded-full overflow-hidden flex items-center justify-center',
            'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]',
            'text-[var(--text-inverse)] font-semibold',
            sizes[size],
            isPremium && premiumFrameSizes[size],
            className
          )}
          {...props}
        >
          {isPremium && (
            <div className="absolute inset-0 rounded-full ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]" />
          )}
          
          {src ? (
            <img
              src={src}
              alt={alt || 'Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            initials.charAt(0).toUpperCase()
          )}
        </div>
        
        {isPremium && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <div className="w-4 h-4 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-[var(--text-inverse)]" />
            </div>
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
