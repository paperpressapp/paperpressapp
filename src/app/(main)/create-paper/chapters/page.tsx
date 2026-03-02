"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, BookOpen, Layers, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { getChaptersForSubject } from "@/data";
import { triggerHaptic } from "@/hooks";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  name: string;
  number: number;
}

export default function CreatePaperChaptersPage() {
  const router = useRouter();
  const {
    selectedClass, selectedSubject, selectedChapters,
    toggleChapter, selectAllChapters, clearChapters,
    selectedTemplate, setStep
  } = usePaperStore();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      if (!selectedClass || !selectedSubject) {
        router.push('/create-paper/templates');
        return;
      }

      try {
        const data = await getChaptersForSubject(selectedClass, selectedSubject);
        setChapters(data.map(c => ({ id: c.id, name: c.name, number: c.number })));
      } catch (error) {
        console.error("Error loading chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [selectedClass, selectedSubject, router]);

  const handleSelectHalf = useCallback((half: 'first' | 'second') => {
    triggerHaptic('medium');
    const halfIndex = Math.ceil(chapters.length / 2);
    if (half === 'first') {
      selectAllChapters(chapters.slice(0, halfIndex).map(c => c.id));
    } else {
      selectAllChapters(chapters.slice(halfIndex).map(c => c.id));
    }
  }, [chapters, selectAllChapters]);

  const handleSelectAll = useCallback(() => {
    triggerHaptic('medium');
    selectAllChapters(chapters.map(c => c.id));
  }, [chapters, selectAllChapters]);

  const handleClearAll = useCallback(() => {
    triggerHaptic('light');
    clearChapters();
  }, [clearChapters]);

  const handleNext = useCallback(async () => {
    if (selectedChapters.length === 0) return;

    triggerHaptic('medium');
    
    // Check if we should auto-select questions (if coming from auto mode)
    // For now, just go to questions
    setStep('questions');
    router.push('/create-paper/questions');
  }, [selectedChapters, setStep, router]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    setStep('templates');
    router.push('/create-paper/templates');
  }, [setStep, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#B9FF66]/30 border-t-[#B9FF66] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={handleBack}
                className="text-[#6B7280] hover:text-white transition-colors text-sm font-medium"
              >
                ← Back
              </button>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span>Templates</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#B9FF66]">Chapters</span>
                <ChevronRight className="w-3 h-3" />
                <span>Questions</span>
                <ChevronRight className="w-3 h-3" />
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
                <span>Preview</span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-white mt-3">
              Select Chapters
            </h1>
            <p className="text-[#6B7280] text-sm mt-1">
              {selectedClass} • {selectedSubject}
              {selectedTemplate && <span className="ml-2 text-[#B9FF66]">• {selectedTemplate.name}</span>}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleSelectHalf('first')}
                className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#B9FF66]/30 text-xs font-medium text-white transition-all"
              >
                1st Half
              </button>
              <button
                onClick={() => handleSelectHalf('second')}
                className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#B9FF66]/30 text-xs font-medium text-white transition-all"
              >
                2nd Half
              </button>
              <button
                onClick={handleSelectAll}
                className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#B9FF66]/30 text-xs font-medium text-white transition-all"
              >
                All
              </button>
              <button
                onClick={handleClearAll}
                className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-2">
            {chapters.map((chapter) => {
              const isSelected = selectedChapters.includes(chapter.id);
              
              return (
                <motion.button
                  key={chapter.id}
                  onClick={() => {
                    triggerHaptic('light');
                    toggleChapter(chapter.id);
                  }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                    isSelected
                      ? "bg-[#B9FF66]/10 border-[#B9FF66]/30"
                      : "bg-[#1A1A1A] border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-[#B9FF66] text-[#0A0A0A]" : "bg-white/5 text-[#6B7280]"
                    )}>
                      <span className="text-sm font-bold">{chapter.number}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{chapter.name}</p>
                      <p className="text-xs text-[#6B7280]">Chapter {chapter.number}</p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#B9FF66] flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#0A0A0A]" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Count */}
          <div className="mt-6 p-4 rounded-xl bg-[#1A1A1A] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] text-sm">Selected Chapters</span>
              <span className="text-white font-bold">{selectedChapters.length} / {chapters.length}</span>
            </div>
            <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#B9FF66]"
                initial={{ width: 0 }}
                animate={{ width: `${(selectedChapters.length / chapters.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0A] to-transparent">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={handleNext}
              disabled={selectedChapters.length === 0}
              className={cn(
                "w-full h-14 rounded-2xl font-bold text-lg transition-all",
                selectedChapters.length > 0
                  ? "bg-[#B9FF66] text-[#0A0A0A] hover:bg-[#a3e659]"
                  : "bg-white/10 text-[#6B7280] cursor-not-allowed"
              )}
            >
              {selectedChapters.length > 0 ? (
                <span className="flex items-center gap-2">
                  Next: Select Questions
                  <ChevronRight className="w-5 h-5" />
                </span>
              ) : (
                "Select at least 1 chapter"
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
