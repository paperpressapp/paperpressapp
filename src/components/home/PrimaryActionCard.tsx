"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface PrimaryActionCardProps {
  onPress: () => void;
}

export function PrimaryActionCard({ onPress }: PrimaryActionCardProps) {
  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] shadow-md border-l-4 border-l-[#B9FF66] p-5 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#B9FF66]/5 opacity-50 -translate-y-8 translate-x-8 pointer-events-none" />

      {/* Icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#B9FF66]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#B9FF66]" />
        </div>
        <span className="text-xs font-semibold text-[#B9FF66] uppercase tracking-wider">
          AI-Powered
        </span>
      </div>

      <h2 className="text-lg font-bold text-white leading-snug mb-1">
        Create Exam Paper
      </h2>
      <p className="text-sm text-[#A0A0A0] mb-4">
        Physics, Chemistry, Math and more
      </p>

      <button
        onClick={onPress}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#B9FF66]/25 active:scale-[0.98] transition-transform"
      >
        Start Creating
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
