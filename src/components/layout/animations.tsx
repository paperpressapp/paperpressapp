"use client";

import { ReactNode, useEffect, useRef } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
  duration = 300,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.style.opacity = "0";
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    element.style.transitionDelay = `${delay}ms`;

    const transforms: Record<string, string> = {
      up: "translateY(20px)",
      down: "translateY(-20px)",
      left: "translateX(20px)",
      right: "translateX(-20px)",
      none: "none",
    };
    element.style.transform = transforms[direction];

    requestAnimationFrame(() => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });

    return () => {
      element.style.transition = "";
      element.style.transitionDelay = "";
    };
  }, [delay, duration, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface PressableProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  scale?: number;
}

export function Pressable({
  children,
  onClick,
  className = "",
  scale = 0.97,
}: PressableProps) {
  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.transform = `scale(${scale})`;
    element.style.transition = "transform 100ms ease-out";
  };

  const handleRelease = (e: React.MouseEvent | React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.transform = "scale(1)";
    element.style.transition = "transform 100ms ease-out";
    onClick?.();
  };

  return (
    <div
      onClick={handleRelease}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
