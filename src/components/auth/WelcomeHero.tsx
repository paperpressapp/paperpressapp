"use client";

/**
 * WelcomeHero Component
 * 
 * The top illustration section of the welcome page.
 */

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { APP_NAME } from "@/constants";

export function WelcomeHero() {
  return (
    <div className="relative flex-[0.55] bg-gradient-to-br from-[#1E88E5] to-[#1565C0] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0">
        <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute bottom-12 left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/10" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-8">
        <motion.div
          className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-2xl mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        >
          <FileText className="w-12 h-12 text-[#1E88E5]" strokeWidth={2} />
        </motion.div>

        <motion.h1
          className="text-white text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          className="text-white/70 text-sm text-center max-w-[260px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Create professional test papers instantly
        </motion.p>
      </div>

      {/* Wave bottom edge */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}
