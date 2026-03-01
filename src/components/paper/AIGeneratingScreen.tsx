"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, CheckCircle } from "lucide-react";
import { getRandomQuestions } from "@/data";
import { usePaperStore } from "@/stores";
import { triggerHaptic } from "@/hooks";
import type { PaperTemplate } from "@/types/template";

interface AIGeneratingScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  minDuration?: number;
  template?: PaperTemplate | null;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  classId?: string;
  subject?: string;
  chapterIds?: string[];
}

const LOADING_MESSAGES = [
  'Analyzing requirements...',
  'Selecting chapters...',
  'Choosing questions...',
  'Finalizing paper...',
];

export function AIGeneratingScreen({
  isVisible,
  onComplete,
  minDuration = 4000,
  template,
  difficulty = 'mixed',
  classId,
  subject,
  chapterIds = []
}: AIGeneratingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const { setMcqs, setShorts, setLongs, selectAllChapters } = usePaperStore();

  const selectQuestions = useCallback(async () => {
    if (!template || !classId || !subject || chapterIds.length === 0) return;

    const mcqSection = template.sections.find(s => s.type === 'mcq');
    const shortSection = template.sections.find(s => s.type === 'short');
    const longSection = template.sections.find(s => s.type === 'long');

    const targetMcqs = mcqSection?.totalQuestions || 0;
    const targetShorts = shortSection?.totalQuestions || 0;
    const targetLongs = longSection?.totalQuestions || 0;

    selectAllChapters(chapterIds);

    if (targetMcqs > 0 || targetShorts > 0 || targetLongs > 0) {
      try {
        const result = await getRandomQuestions(
          classId as any,
          subject as any,
          chapterIds,
          targetMcqs,
          targetShorts,
          targetLongs,
          difficulty
        );

        setMcqs(result.mcqs.map((q: any) => q.id));
        setShorts(result.shorts.map((q: any) => q.id));
        setLongs(result.longs.map((q: any) => q.id));
      } catch (error) {
        console.error('Error selecting questions:', error);
      }
    }
  }, [template, classId, subject, chapterIds, difficulty, setMcqs, setShorts, setLongs, selectAllChapters]);

  useEffect(() => {
    if (!isVisible) return;

    triggerHaptic('medium');
    setCurrentStep(0);
    setIsComplete(false);

    const stepDuration = 1000;
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < LOADING_MESSAGES.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        
        if (stepIndex === 1) {
          selectQuestions();
        }
      } else {
        clearInterval(interval);
        setIsComplete(true);
        triggerHaptic('heavy');

        const elapsedTotal = Date.now() - startTime;
        const remaining = minDuration - elapsedTotal;
        if (remaining > 0) {
          setTimeout(() => onComplete(), remaining);
        } else {
          onComplete();
        }
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible, selectQuestions, onComplete, startTime, minDuration]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0A0A0A]/95 backdrop-blur-sm flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-[#2A2A2A]" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#B9FF66]"
          />
          <div className="absolute inset-2 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            {isComplete ? (
              <CheckCircle className="w-10 h-10 text-[#B9FF66]" />
            ) : (
              <FileText className="w-10 h-10 text-[#B9FF66]" />
            )}
          </div>
        </motion.div>

        <motion.h2
          className="text-xl font-bold text-white mb-2"
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isComplete ? 'Paper Ready!' : LOADING_MESSAGES[currentStep]}
        </motion.h2>

        {!isComplete && (
          <motion.p
            className="text-sm text-[#A0A0A0]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Please wait while we create your paper...
          </motion.p>
        )}

        <motion.div
          className="mt-6 flex justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#B9FF66]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
