"use client";

/**
 * FilterChips Component
 * 
 * Horizontal scrollable filter chips for selecting options.
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterOption {
  /** Option value */
  value: string;
  /** Option display label */
  label: string;
}

interface FilterChipsProps {
  /** Available filter options */
  options: FilterOption[];
  /** Currently selected value */
  selected: string;
  /** Selection change handler */
  onChange: (value: string) => void;
  /** Optional additional class names */
  className?: string;
}

export function FilterChips({
  options,
  selected,
  onChange,
  className = "",
}: FilterChipsProps) {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex gap-2 pb-1">
        {options.map((option) => {
          const isSelected = option.value === selected;

          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                "border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              )}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
