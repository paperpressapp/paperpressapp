"use client";

import { useCallback, useRef } from "react";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({ 
  onRefresh, 
  threshold = 80,
  resistance = 2.5 
}: PullToRefreshOptions) {
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const isRefreshing = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing.current) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing.current) return;
    
    const scrollY = window.scrollY;
    if (scrollY > 0) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      isPulling.current = true;
      const pullDistance = Math.min(diff / resistance, threshold * 1.5);
      
      document.body.style.setProperty('--pull-distance', `${pullDistance}px`);
      document.body.style.setProperty('--pull-opacity', String(Math.min(pullDistance / threshold, 1)));
    }
  }, [resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (isRefreshing.current || !isPulling.current) {
      isPulling.current = false;
      document.body.style.removeProperty('--pull-distance');
      document.body.style.removeProperty('--pull-opacity');
      return;
    }

    const pullDistance = parseFloat(document.body.style.getPropertyValue('--pull-distance') || '0');
    
    if (pullDistance >= threshold) {
      isRefreshing.current = true;
      document.body.style.setProperty('--pull-distance', `${threshold}px`);
      
      try {
        await onRefresh();
      } finally {
        isRefreshing.current = false;
        isPulling.current = false;
        document.body.style.removeProperty('--pull-distance');
        document.body.style.removeProperty('--pull-opacity');
      }
    } else {
      isPulling.current = false;
      document.body.style.removeProperty('--pull-distance');
      document.body.style.removeProperty('--pull-opacity');
    }
  }, [onRefresh, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
