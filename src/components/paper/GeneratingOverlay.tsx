"use client";

/**
 * GeneratingOverlay Component
 * 
 * Full screen overlay shown during PDF generation.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import { ProgressBar } from "@/components/shared";
import { Button } from "@/components/ui/button";

interface GeneratingOverlayProps {
  /** Whether overlay is visible */
  isVisible: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message to display */
  statusMessage: string;
  /** Cancel handler */
  onCancel?: () => void;
}

export function GeneratingOverlay({
  isVisible,
  progress,
  statusMessage,
  onCancel,
}: GeneratingOverlayProps) {
  const [showCancel, setShowCancel] = useState(false);

  // Show cancel button after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowCancel(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCancel(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1E88E5] to-[#1565C0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full bg-white/5" />
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center px-6 max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Animated icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center"
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <FileText className="w-10 h-10 text-[#1E88E5]" />
            </motion.div>

            {/* Title */}
            <h2 className="text-white text-2xl font-bold mb-2">
              Creating Your Paper
            </h2>

            {/* Progress bar */}
            <div className="w-[200px] mx-auto mb-4">
              <ProgressBar
                value={progress}
                color="#ffffff"
                height={8}
                showLabel={false}
              />
            </div>

            {/* Status message */}
            <motion.p
              key={statusMessage}
              className="text-white/80 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {statusMessage}
            </motion.p>

            {/* Cancel button */}
            {showCancel && onCancel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
