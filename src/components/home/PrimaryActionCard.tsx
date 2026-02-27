"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface PrimaryActionCardProps {
  onPress: () => void;
}

export function PrimaryActionCard({ onPress }: PrimaryActionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-md border-l-4 border-l-[#1E88E5] p-5 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#EFF6FF] opacity-50 -translate-y-8 translate-x-8 pointer-events-none" />

      {/* Icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#1E88E5]" />
        </div>
        <span className="text-xs font-semibold text-[#1E88E5] uppercase tracking-wider">
          AI-Powered
        </span>
      </div>

      <h2 className="text-lg font-bold text-[#111827] leading-snug mb-1">
        Create Exam Paper
      </h2>
      <p className="text-sm text-[#6B7280] mb-4">
        Physics, Chemistry, Math and more
      </p>

      <button
        onClick={onPress}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition-transform"
      >
        Start Creating
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
