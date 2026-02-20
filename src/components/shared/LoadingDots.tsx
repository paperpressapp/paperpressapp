"use client";

/**
 * LoadingDots Component
 * 
 * Three bouncing dots animation for splash screens.
 */

import { motion } from "framer-motion";

interface LoadingDotsProps {
  /** Optional additional class names */
  className?: string;
}

export function LoadingDots({ className = "" }: LoadingDotsProps) {
const dotVariants = {
  bounce: {
    y: [0, -12, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <motion.div
      className={`flex items-center justify-center gap-2 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-primary"
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
}
