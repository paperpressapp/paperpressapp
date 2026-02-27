"use client";

import { useCallback, useRef } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isSwiping.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;
    
    if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
      isSwiping.current = true;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (diffX < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        if (diffY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (diffY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  const handleTouchEnd = useCallback(() => {
    isSwiping.current = false;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
