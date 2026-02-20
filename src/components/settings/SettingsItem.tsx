"use client";

/**
 * SettingsItem Component
 * 
 * Reusable settings list item.
 */

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
  /** Item label */
  label: string;
  /** Current value (optional) */
  value?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether disabled */
  disabled?: boolean;
  /** Custom right element */
  rightElement?: React.ReactNode;
}

export function SettingsItem({
  label,
  value,
  onClick,
  disabled = false,
  rightElement,
}: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 bg-card",
        "border-b last:border-b-0",
        disabled && "opacity-50 cursor-not-allowed",
        onClick && !disabled && "active:bg-accent"
      )}
    >
      <span className="text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
        {rightElement}
        {onClick && !rightElement && (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}
