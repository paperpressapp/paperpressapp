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
    <div className={cn("w-full flex justify-center", className)}>
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="flex items-center">
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <motion.div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                    // Default Variant
                    !isHero && step.status === "completed" && "bg-green-500 text-white",
                    !isHero && step.status === "current" && "bg-primary text-primary-foreground",
                    !isHero && step.status === "pending" && "border border-[#A0A0A0]/30 text-[#A0A0A0]",

                    // Hero Variant
                    isHero && step.status === "completed" && "bg-[#B9FF66] text-[#0A0A0A]",
                    isHero && step.status === "current" && "bg-[#B9FF66] text-[#0A0A0A]",
                    isHero && step.status === "pending" && "bg-[#2A2A2A] text-[#A0A0A0] border border-[#3A3A3A]"
                  )}
                  initial={false}
                  animate={{
                    scale: step.status === "current" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {step.status === "completed" ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    index + 1
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    "mt-1 text-[9px] font-medium whitespace-nowrap transition-colors",
                    // Default Variant
                    !isHero && step.status === "completed" && "text-green-600",
                    !isHero && step.status === "current" && "text-primary",
                    !isHero && step.status === "pending" && "text-[#A0A0A0]",

                    // Hero Variant
                    isHero && step.status === "completed" && "text-[#A0A0A0]",
                    isHero && step.status === "current" && "text-white font-semibold",
                    isHero && step.status === "pending" && "text-[#A0A0A0]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="w-4 h-0.5 mx-1 bg-[#3A3A3A] rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
