"use client";

/**
 * Breadcrumb Component
 * 
 * Horizontal stepper showing progress through multiple steps.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  /** Step label */
  label: string;
  /** Step status */
  status: "completed" | "current" | "pending";
}

interface BreadcrumbProps {
  /** Array of steps */
  steps: Step[];
  /** Additional class names */
  className?: string;
  /** Visual variant */
  variant?: "default" | "hero";
}

export function Breadcrumb({ steps, className = "", variant = "default" }: BreadcrumbProps) {
  const isHero = variant === "hero";

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex items-center min-w-max px-2 py-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="flex items-center">
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    // Default Variant
                    !isHero && step.status === "completed" && "bg-green-500 text-white",
                    !isHero && step.status === "current" && "bg-primary text-primary-foreground",
                    !isHero && step.status === "pending" && "border-2 border-muted-foreground/30 text-muted-foreground bg-background",

                    // Hero Variant
                    isHero && step.status === "completed" && "bg-white text-[#1E88E5]",
                    isHero && step.status === "current" && "bg-white text-[#1E88E5] shadow-lg",
                    isHero && step.status === "pending" && "bg-white/20 text-white/50 border border-white/30"
                  )}
                  initial={false}
                  animate={{
                    scale: step.status === "current" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {step.status === "completed" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium whitespace-nowrap transition-colors",
                    // Default Variant
                    !isHero && step.status === "completed" && "text-green-600",
                    !isHero && step.status === "current" && "text-primary",
                    !isHero && step.status === "pending" && "text-muted-foreground",

                    // Hero Variant
                    isHero && step.status === "completed" && "text-white/90",
                    isHero && step.status === "current" && "text-white font-bold",
                    isHero && step.status === "pending" && "text-white/50"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex items-center mx-2 mb-6">
                  <div
                    className={cn(
                      "w-8 sm:w-12 h-0.5 rounded-full transition-colors",
                      // Default Variant
                      !isHero && step.status === "completed" ? "bg-green-500" : !isHero && "bg-muted-foreground/30",

                      // Hero Variant
                      isHero && step.status === "completed" ? "bg-white" : isHero && "bg-white/20"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
