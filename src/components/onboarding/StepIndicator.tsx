"use client";

/**
 * StepIndicator Component
 * 
 * Shows progress through onboarding steps.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  /** Current active step (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Additional class names */
  className?: string;
}

export function StepIndicator({ 
  currentStep, 
  totalSteps = 3,
  className = "" 
}: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isPending = step > currentStep;

        return (
          <div key={step} className="flex items-center">
            <motion.div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                isPending && "border-2 border-muted-foreground/30 text-muted-foreground"
              )}
              initial={false}
              animate={{
                scale: isCurrent ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                step
              )}
            </motion.div>

            {/* Connector line */}
            {step < totalSteps && (
              <div 
                className={cn(
                  "w-12 h-0.5 mx-2 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
