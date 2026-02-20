"use client";

/**
 * DifficultyBadge Component
 * 
 * Colored badge showing question difficulty.
 */

import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  /** Difficulty level */
  difficulty: "easy" | "medium" | "hard";
  /** Size variant */
  size?: "sm" | "md";
}

const difficultyConfig = {
  easy: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Easy",
  },
  medium: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Medium",
  },
  hard: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Hard",
  },
};

export function DifficultyBadge({ difficulty, size = "sm" }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.bg,
        config.text,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      )}
    >
      {config.label}
    </span>
  );
}
