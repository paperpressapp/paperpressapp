"use client";

/**
 * AnimatedCounter Component
 * 
 * Number that animates smoothly when value changes.
 */

import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  /** Target value to display */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Optional suffix (e.g., "%", "+" ) */
  suffix?: string;
  /** Optional prefix (e.g., "$" ) */
  prefix?: string;
  /** Optional additional class names */
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 300,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
