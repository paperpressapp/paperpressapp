"use client";

/**
 * Skeleton Loader Components
 * 
 * Animated placeholder components for loading states.
 */

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  animate = true,
}: SkeletonProps) {
  const baseClasses = animate ? "animate-pulse bg-gray-200" : "bg-gray-200";

  const variantClasses = {
    text: "rounded",
    circle: "rounded-full",
    rect: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  if (!width) {
    if (variant === "text") style.width = "100%";
    if (variant === "circle") style.width = "40px";
  }
  if (!height) {
    if (variant === "text") style.height = "1rem";
    if (variant === "circle") style.height = "40px";
    if (variant === "rect") style.height = "100px";
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

export function TextSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-panel rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circle" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <TextSkeleton lines={2} />
    </div>
  );
}

export function QuestionCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Skeleton variant="rect" width={32} height={32} className="rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Skeleton className="h-6 rounded-md" />
            <Skeleton className="h-6 rounded-md" />
            <Skeleton className="h-6 rounded-md" />
            <Skeleton className="h-6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaperPreviewSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-[428px] space-y-4"
      >
        <Skeleton variant="rect" height={56} className="rounded-xl" />
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <TextSkeleton lines={4} />
          <div className="flex gap-3 mt-4">
            <Skeleton variant="rect" height={56} className="flex-1 rounded-xl" />
            <Skeleton variant="rect" height={56} className="flex-1 rounded-xl" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ChapterListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3 px-5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-panel rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="rect" width={40} height={40} className="rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton variant="rect" width={24} height={24} className="rounded-md" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function SubjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass-panel rounded-2xl p-4 aspect-square"
        >
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Skeleton variant="rect" width={48} height={48} className="rounded-xl" />
            <Skeleton className="h-4 w-16" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col items-center text-center">
      <Skeleton variant="circle" width={96} height={96} className="mb-4" />
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-40 mb-1" />
      <Skeleton className="h-3 w-28 mb-4" />
      <Skeleton variant="rect" height={40} className="w-36 rounded-xl" />
    </div>
  );
}

export function PageLoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"
      />
      <p className="text-white/70 text-sm">{message}</p>
    </div>
  );
}

export function InlineLoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(
        'border-gray-300 border-t-[#1E88E5] rounded-full',
        sizeMap[size]
      )}
    />
  );
}
