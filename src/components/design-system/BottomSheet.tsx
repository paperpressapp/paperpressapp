"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  defaultSnap?: number;
  enableDrag?: boolean;
  closeOnOverlayClick?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.75, 1],
  defaultSnap = 0.5,
  enableDrag = true,
  closeOnOverlayClick = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enableDrag) return;
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    },
    [enableDrag]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !enableDrag) return;
      currentY.current = e.touches[0].clientY;
    },
    [isDragging, enableDrag]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const diff = currentY.current - startY.current;
    const threshold = 50;

    if (diff > threshold) {
      onClose();
    }

    setIsDragging(false);
  }, [isDragging, onClose]);

  const sheetHeight = `${snapPoints[Math.floor(currentSnap * (snapPoints.length - 1))] * 100}%`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-index-modal)]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'bg-[var(--bg-card)] rounded-t-[var(--radius-xl)]',
              'border-t border-[var(--border-color)] shadow-xl',
              'max-h-[calc(100vh-4rem)]'
            )}
            style={{ height: sheetHeight }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle */}
            {enableDrag && (
              <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-[var(--border-color)]" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="px-4 pb-2">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
              </div>
            )}

            {/* Content */}
            <div className="px-4 pb-8 overflow-y-auto h-full">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
