"use client";

/**
 * useMobile Hook
 * 
 * Detects if the screen is mobile-sized (<= 768px).
 */

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook that returns true if screen width is mobile (<= 768px)
 * @returns boolean indicating if screen is mobile
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Handle SSR - check if window exists
    if (typeof window === "undefined") {
      return;
    }

    // Check initial screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    // Set initial value
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook that returns the current window width
 * @returns number representing window width
 */
export function useWindowWidth(): number {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
