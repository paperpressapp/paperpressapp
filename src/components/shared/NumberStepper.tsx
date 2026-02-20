"use client";

/**
 * NumberStepper Component
 * 
 * Stepper for incrementing/decrementing numeric values.
 */

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Optional label */
  label?: string;
  /** Additional class names */
  className?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = "",
}: NumberStepperProps) {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleDecrease}
          disabled={isMin}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-[60px] h-9 flex items-center justify-center rounded-md border bg-background px-3">
          <span className="text-base font-semibold tabular-nums">{value}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleIncrease}
          disabled={isMax}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
