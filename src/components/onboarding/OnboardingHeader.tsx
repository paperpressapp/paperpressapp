"use client";

/**
 * OnboardingHeader Component
 * 
 * Header section for each onboarding step.
 */

import { motion } from "framer-motion";

interface OnboardingHeaderProps {
  /** Step number */
  step: number;
  /** Title text (can include emoji) */
  title: string;
  /** Subtitle text */
  subtitle: string;
}

export function OnboardingHeader({ step, title, subtitle }: OnboardingHeaderProps) {
  return (
    <motion.div
      className="text-center mb-8"
      key={step}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
    </motion.div>
  );
}
