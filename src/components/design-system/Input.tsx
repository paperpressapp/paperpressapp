"use client";

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, isPassword, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordVisible = isPassword && showPassword;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={isPasswordVisible ? 'text' : type}
            className={cn(
              `
              w-full h-12 px-4 py-2
              bg-[var(--bg-secondary)] text-[var(--text-primary)]
              border border-[var(--border-color)] rounded-[var(--radius-input)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
              transition-all duration-250
              disabled:opacity-50 disabled:cursor-not-allowed
            `,
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-[var(--status-error)]/20',
              className
            )}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-[var(--status-error)]">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
