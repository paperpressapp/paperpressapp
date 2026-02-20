"use client";

/**
 * QuickFillCard Component - Premium Redesign
 * 
 * Card for auto-selecting questions randomly.
 * Better UI with properly working +/- buttons.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Minus, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickFillCardProps {
  /** Available MCQ count */
  availableMcqs: number;
  /** Available short question count */
  availableShorts: number;
  /** Available long question count */
  availableLongs: number;
  /** Auto select handler */
  onAutoSelect: (
    mcqCount: number,
    shortCount: number,
    longCount: number,
    difficulty: string
  ) => void;
}

const difficulties = [
  { value: "mixed", label: "Mixed", color: "from-purple-500 to-indigo-500" },
  { value: "easy", label: "Easy", color: "from-green-500 to-emerald-500" },
  { value: "medium", label: "Medium", color: "from-amber-500 to-orange-500" },
  { value: "hard", label: "Hard", color: "from-red-500 to-rose-500" },
];

export function QuickFillCard({
  availableMcqs,
  availableShorts,
  availableLongs,
  onAutoSelect,
}: QuickFillCardProps) {
  // Initialize with safe defaults when available counts are loaded
  const [mcqCount, setMcqCount] = useState(0);
  const [shortCount, setShortCount] = useState(0);
  const [longCount, setLongCount] = useState(0);
  const [difficulty, setDifficulty] = useState("mixed");

  // Update defaults when available counts change
  useEffect(() => {
    setMcqCount(Math.min(15, availableMcqs));
    setShortCount(Math.min(8, availableShorts));
    setLongCount(Math.min(3, availableLongs));
  }, [availableMcqs, availableShorts, availableLongs]);

  const handleDecrease = (type: 'mcq' | 'short' | 'long') => {
    if (type === 'mcq') setMcqCount(prev => Math.max(0, prev - 1));
    if (type === 'short') setShortCount(prev => Math.max(0, prev - 1));
    if (type === 'long') setLongCount(prev => Math.max(0, prev - 1));
  };

  const handleIncrease = (type: 'mcq' | 'short' | 'long') => {
    if (type === 'mcq') setMcqCount(prev => Math.min(availableMcqs, prev + 1));
    if (type === 'short') setShortCount(prev => Math.min(availableShorts, prev + 1));
    if (type === 'long') setLongCount(prev => Math.min(availableLongs, prev + 1));
  };

  const handleAutoSelect = () => {
    onAutoSelect(mcqCount, shortCount, longCount, difficulty);
  };

  const totalQuestions = mcqCount + shortCount + longCount;
  const totalMarks = mcqCount * 1 + shortCount * 2 + longCount * 9;

  return (
    <motion.div
      className="bg-gradient-to-br from-[#1E88E5]/5 to-[#1565C0]/5 rounded-2xl border border-[#1E88E5]/20 p-5 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg shadow-[#1E88E5]/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Quick Fill</h3>
          <p className="text-sm text-gray-500">Auto-select questions</p>
        </div>
      </div>

      {/* Question Type Steppers */}
      <div className="space-y-4 mb-5">
        {/* MCQ Stepper */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">MCQ</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">MCQs</p>
              <p className="text-xs text-gray-500">1 mark each</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecrease('mcq')}
              disabled={mcqCount <= 0}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                mcqCount <= 0 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#1E88E5] hover:text-[#1E88E5] shadow-sm"
              )}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-14 h-10 flex items-center justify-center bg-white rounded-xl border border-gray-200 font-bold text-gray-900">
              {mcqCount}
            </div>
            <button
              onClick={() => handleIncrease('mcq')}
              disabled={mcqCount >= availableMcqs}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                mcqCount >= availableMcqs 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#1E88E5] hover:text-[#1E88E5] shadow-sm"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Short Questions Stepper */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <span className="text-green-600 font-bold text-xs">SQ</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Short</p>
              <p className="text-xs text-gray-500">2 marks each</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecrease('short')}
              disabled={shortCount <= 0}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                shortCount <= 0 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#1E88E5] hover:text-[#1E88E5] shadow-sm"
              )}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-14 h-10 flex items-center justify-center bg-white rounded-xl border border-gray-200 font-bold text-gray-900">
              {shortCount}
            </div>
            <button
              onClick={() => handleIncrease('short')}
              disabled={shortCount >= availableShorts}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                shortCount >= availableShorts 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#1E88E5] hover:text-[#1E88E5] shadow-sm"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Long Questions Stepper */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xs">LQ</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Long</p>
              <p className="text-xs text-gray-500">9 marks each</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecrease('long')}
              disabled={longCount <= 0}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                longCount <= 0 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#1E88E5] hover:text-[#1E88E5] shadow-sm"
              )}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-14 h-10 flex items-center justify-center bg-white rounded-xl border border-gray-200 font-bold text-gray-900">
              {longCount}
            </div>
            <button
              onClick={() => handleIncrease('long')}
              disabled={longCount >= availableLongs}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                longCount >= availableLongs 
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                  : "bg-white border border-gray-200 text-gray-700 hover:border-[#1E88E5] hover:text-[#1E88E5] shadow-sm"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Difficulty Level</p>
        <div className="grid grid-cols-4 gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => setDifficulty(diff.value)}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-semibold transition-all",
                difficulty === diff.value
                  ? `bg-gradient-to-r ${diff.color} text-white shadow-md`
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {totalQuestions > 0 && (
        <div className="flex items-center justify-center gap-4 mb-4 py-3 bg-white/50 rounded-xl">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{totalQuestions}</p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
          <div className="w-px h-8 bg-gray-300" />
          <div className="text-center">
            <p className="text-lg font-bold text-[#1E88E5]">{totalMarks}</p>
            <p className="text-xs text-gray-500">Total Marks</p>
          </div>
        </div>
      )}

      {/* Auto Select Button */}
      <Button
        onClick={handleAutoSelect}
        disabled={totalQuestions === 0}
        className={cn(
          "w-full h-14 rounded-xl font-semibold text-base transition-all",
          totalQuestions > 0
            ? "bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-lg shadow-[#1E88E5]/30"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Auto Select {totalQuestions > 0 && `(${totalQuestions})`}
      </Button>
    </motion.div>
  );
}
