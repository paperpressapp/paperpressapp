"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Wand2, Pencil, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/hooks";

type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
type CreateMode = 'manual' | 'auto';

interface CreateModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: CreateMode, difficulty?: Difficulty) => void;
  templateName: string;
  showDifficulty?: boolean;
}

const difficulties: { key: Difficulty; label: string; color: string; bg: string }[] = [
  { key: 'easy', label: 'Easy', color: 'text-green-400', bg: 'bg-green-500/20' },
  { key: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { key: 'hard', label: 'Hard', color: 'text-red-400', bg: 'bg-red-500/20' },
  { key: 'mixed', label: 'Mixed', color: 'text-[#B9FF66]', bg: 'bg-[#B9FF66]/20' },
];

export function CreateModeSelector({ isOpen, onClose, onSelectMode, templateName, showDifficulty = true }: CreateModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<CreateMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('mixed');

  useEffect(() => {
    if (!isOpen) {
      setSelectedMode(null);
      setSelectedDifficulty('mixed');
    }
  }, [isOpen]);

  const handleModeSelect = (mode: CreateMode) => {
    triggerHaptic('light');
    if (mode === 'manual') {
      onSelectMode('manual');
      onClose();
    } else {
      setSelectedMode('auto');
    }
  };

  const handleAIStart = () => {
    triggerHaptic('medium');
    onSelectMode('auto', selectedDifficulty);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-md mx-auto bg-[#1A1A1A] rounded-t-xl overflow-hidden"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create Paper</h2>
                  <p className="text-xs text-[#9CA3AF]">{templateName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full bg-[#2A2A2A]">
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {!selectedMode ? (
              <>
                {/* Auto Generate Option */}
                <motion.button
                  onClick={() => handleModeSelect('auto')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#B9FF66]/10 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white flex items-center gap-2">
                        Auto Generate
                        <span className="px-1.5 py-0.5 bg-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] rounded-full">Smart</span>
                      </p>
                      <p className="text-xs text-[#9CA3AF]">Auto-select questions based on pattern</p>
                    </div>
                  </div>
                </motion.button>

                {/* Manual Option */}
                <motion.button
                  onClick={() => handleModeSelect('manual')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-xl bg-[#2A2A2A] border border-[#3A3A3A] hover:border-[#B9FF66]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#B9FF66]/20 flex items-center justify-center">
                      <Pencil className="w-6 h-6 text-[#B9FF66]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">Manual Create</p>
                      <p className="text-xs text-[#9CA3AF]">Select questions yourself</p>
                    </div>
                  </div>
                </motion.button>
              </>
            ) : (
              /* Difficulty Selection */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-[#9CA3AF]">Select difficulty for AI to balance questions</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {difficulties.map((diff) => (
                    <motion.button
                      key={diff.key}
                      onClick={() => { triggerHaptic('light'); setSelectedDifficulty(diff.key); }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedDifficulty === diff.key
                          ? 'border-[#B9FF66] bg-[#B9FF66]/10'
                          : 'border-[#3A3A3A] bg-[#2A2A2A] hover:border-[#6B7280]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${selectedDifficulty === diff.key ? 'text-[#B9FF66]' : 'text-white'}`}>
                          {diff.label}
                        </span>
                        {selectedDifficulty === diff.key && <Check className="w-4 h-4 text-[#B9FF66]" />}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <Button
                  onClick={handleAIStart}
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#B9FF66] text-white font-semibold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>

                <button
                  onClick={() => setSelectedMode(null)}
                  className="w-full text-center text-sm text-[#6B7280] hover:text-white"
                >
                  ← Back
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
