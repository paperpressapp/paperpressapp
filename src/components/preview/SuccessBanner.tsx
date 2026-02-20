"use client";

/**
 * SuccessBanner Component
 * 
 * Animated success notification banner.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface SuccessBannerProps {
  /** Whether to show banner */
  show: boolean;
  /** Dismiss handler */
  onDismiss: () => void;
  /** Auto dismiss delay in ms */
  autoDismissDelay?: number;
}

export function SuccessBanner({
  show,
  onDismiss,
  autoDismissDelay = 3000,
}: SuccessBannerProps) {
  // Auto dismiss
  useEffect(() => {
    if (show && autoDismissDelay > 0) {
      const timer = setTimeout(() => onDismiss(), autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoDismissDelay, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="bg-green-500 mx-4 mt-4 rounded-xl p-4 flex items-center gap-3 shadow-lg"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 100 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y < -50) {
              onDismiss();
            }
          }}
        >
          {/* Checkmark */}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="text-white font-semibold">Paper Created Successfully!</p>
            <p className="text-white/80 text-sm">Your exam paper is ready</p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
