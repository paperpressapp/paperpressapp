"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, FileText, Sparkles, BookOpen, Layers, Crown, Plus, Minus } from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { ConfirmDialog, AppLoader } from "@/components/shared";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { PaperSettings, QuickFillCard } from "@/components/paper";
import { usePaperStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks";
import { getAvailableQuestionCounts, getRandomQuestions, getQuestionsByIds } from "@/data";
import { savePaper } from "@/lib/storage/papers";
import { generatePaperId } from "@/lib/utils/id";
import { canGeneratePaper, incrementPaperUsage, checkPremiumStatus } from "@/lib/premium";
import type { Difficulty } from "@/types";
import { QUESTION_MARKS } from "@/types/question";

export default function CreatePaperPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    selectedClass, selectedSubject, selectedChapters, paperSettings,
    selectedMcqIds, selectedShortIds, selectedLongIds,
    setMcqs, setShorts, setLongs, updateSettings, resetQuestions,
  } = usePaperStore();

  const [isValidating, setIsValidating] = useState(true);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Creating paper...");
  const [availableCounts, setAvailableCounts] = useState({ mcqs: 0, shorts: 0, longs: 0 });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, remaining: 0 });

  const hasUnsavedChanges = selectedMcqIds.length > 0 || selectedShortIds.length > 0 || selectedLongIds.length > 0;

  useEffect(() => {
    const status = checkPremiumStatus();
    const paperCheck = canGeneratePaper();
    setPremiumStatus({ isPremium: status.isPremium, remaining: paperCheck.remaining });
  }, []);

  useEffect(() => {
    const validate = () => {
      if (!selectedClass || !selectedSubject || selectedChapters.length === 0) {
        router.replace("/home");
        return;
      }

      if (!paperSettings.title) {
        const instituteName = localStorage.getItem("paperpress_user_institute") || "";
        const savedLogo = localStorage.getItem("paperpress_user_logo") || null;
        updateSettings({
          title: `${selectedClass} ${selectedSubject} Test Paper`,
          instituteName,
          instituteLogo: savedLogo,
          showLogo: !!savedLogo,
        });
      }

      const counts = getAvailableQuestionCounts(selectedClass, selectedSubject, selectedChapters);
      setAvailableCounts(counts);
      setIsValidating(false);
    };

    validate();
  }, [selectedClass, selectedSubject, selectedChapters]);

  const totalQuestions = selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length;
  const totalMarks = (selectedMcqIds.length * QUESTION_MARKS.mcq) + (selectedShortIds.length * QUESTION_MARKS.short) + (selectedLongIds.length * QUESTION_MARKS.long);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowBackConfirm(true);
    } else {
      router.push(`/chapters/${selectedClass}/${selectedSubject?.toLowerCase()}`);
    }
  }, [hasUnsavedChanges, router, selectedClass, selectedSubject]);

  const confirmBack = useCallback(() => {
    resetQuestions();
    setShowBackConfirm(false);
    router.push(`/chapters/${selectedClass}/${selectedSubject?.toLowerCase()}`);
  }, [resetQuestions, router, selectedClass, selectedSubject]);

  const handleReset = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowResetConfirm(true);
    } else {
      toast.info("Nothing to clear");
    }
  }, [hasUnsavedChanges, toast]);

  const confirmReset = useCallback(() => {
    resetQuestions();
    setShowResetConfirm(false);
    toast.success("Selections cleared");
  }, [resetQuestions, toast]);

  const handleAutoSelect = useCallback((mcqCount: number, shortCount: number, longCount: number, difficulty: string) => {
    if (!selectedClass || !selectedSubject) return;

    const diffMap: Record<string, Difficulty | "mixed"> = {
      mixed: "mixed", easy: "easy", medium: "medium", hard: "hard",
    };

    const result = getRandomQuestions(selectedClass, selectedSubject, selectedChapters, mcqCount, shortCount, longCount, diffMap[difficulty] || "mixed");

    setMcqs(result.mcqs.map((q) => q.id));
    setShorts(result.shorts.map((q) => q.id));
    setLongs(result.longs.map((q) => q.id));

    const totalSelected = result.mcqs.length + result.shorts.length + result.longs.length;
    toast.success(`Selected ${totalSelected} questions`);
  }, [selectedClass, selectedSubject, selectedChapters, setMcqs, setShorts, setLongs, toast]);

  const handleGenerate = useCallback(async () => {
    if (totalQuestions === 0) {
      toast.error("Please select at least one question");
      return;
    }

    if (!selectedClass || !selectedSubject) {
      toast.error("Missing class or subject");
      return;
    }

    if (!paperSettings.title.trim()) {
      toast.error("Please enter a paper title");
      return;
    }

    if (!paperSettings.instituteName.trim()) {
      toast.error("Please enter institute name");
      return;
    }

    const paperCheck = canGeneratePaper();
    if (!paperCheck.allowed) {
      setShowPremiumModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Creating paper...");

    try {
      const paperId = generatePaperId();
      const paper = {
        id: paperId,
        classId: selectedClass,
        subject: selectedSubject,
        title: paperSettings.title,
        examType: paperSettings.examType,
        date: paperSettings.date,
        timeAllowed: paperSettings.timeAllowed,
        totalMarks,
        questionCount: totalQuestions,
        mcqCount: selectedMcqIds.length,
        shortCount: selectedShortIds.length,
        longCount: selectedLongIds.length,
        mcqIds: selectedMcqIds,
        shortIds: selectedShortIds,
        longIds: selectedLongIds,
        createdAt: new Date().toISOString(),
        instituteName: paperSettings.instituteName,
        instituteLogo: paperSettings.instituteLogo,
        showLogo: paperSettings.showLogo && !!paperSettings.instituteLogo,
        customHeader: paperSettings.customHeader || '',
        customSubHeader: paperSettings.customSubHeader || '',
      };

      savePaper(paper);
      if (!paperCheck.isPremium) incrementPaperUsage();

      setStatusMessage("Redirecting...");
      router.push(`/paper?id=${paperId}`);
    } catch (error) {
      toast.error("Failed to create paper");
      setIsGenerating(false);
    }
  }, [totalQuestions, selectedClass, selectedSubject, selectedMcqIds, selectedShortIds, selectedLongIds, paperSettings, totalMarks, router, toast]);

  if (isValidating) return <AppLoader message="Preparing..." />;

  return (
    <MainLayout showBottomNav={false} className="bg-gradient-to-br from-[#1E40AF] via-[#1E56B8] to-[#2563EB]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40">
          <div className="mx-auto max-w-[428px]">
            <div className="glass-panel border-b border-white/10">
              <div className="px-3 h-12 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 text-white" />
                </Button>
                <h1 className="font-bold text-base text-white">Create Paper</h1>
                <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 ${hasUnsavedChanges ? 'text-red-300' : 'text-white/60'}`} onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <ScrollView className="pt-12 flex-1 pb-36">
          {/* Premium Banner */}
          {!premiumStatus.isPremium && (
            <div className="px-4 py-2">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-400/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-100">{premiumStatus.remaining} free papers left</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setShowPremiumModal(true)} className="h-8 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-xs">
                  Upgrade
                </Button>
              </div>
            </div>
          )}

          {/* Subject Card */}
          <div className="px-4 py-2">
            <div className="glass-panel rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center shadow">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Class {selectedClass}</p>
                    <p className="text-base font-bold text-gray-900">{selectedSubject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  <Layers className="w-3 h-3" />
                  <span className="text-xs font-medium">{selectedChapters.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="px-4 mb-3">
            <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] rounded-xl p-4 shadow-lg shadow-blue-500/20">
              <div className="flex items-center justify-between text-white">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Questions</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{totalMarks}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Marks</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{selectedChapters.length}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Chapters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Paper Settings */}
          <div className="px-4">
            <PaperSettings settings={paperSettings} onUpdate={updateSettings} defaultInstituteName={paperSettings.instituteName || ""} />
          </div>

          {/* Question Selection */}
          <div className="px-4 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center shadow">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Select Questions</h2>
            </div>

            <div className="space-y-2">
              {/* MCQ */}
              <div className="glass-panel rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">MCQs</p>
                    <p className="text-[10px] text-gray-500">{availableCounts.mcqs} available</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#1E40AF]">{selectedMcqIds.length}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setMcqs(selectedMcqIds.slice(0, -1))} className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center active:scale-95 transition-transform">
                        <Minus className="w-3.5 h-3.5 text-red-600" />
                      </button>
                      <button onClick={() => setMcqs([...selectedMcqIds, `mcq_${Date.now()}`])} className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center shadow active:scale-95 transition-transform">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Short */}
              <div className="glass-panel rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Short Questions</p>
                    <p className="text-[10px] text-gray-500">{availableCounts.shorts} available</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-emerald-600">{selectedShortIds.length}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShorts(selectedShortIds.slice(0, -1))} className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center active:scale-95 transition-transform">
                        <Minus className="w-3.5 h-3.5 text-red-600" />
                      </button>
                      <button onClick={() => setShorts([...selectedShortIds, `short_${Date.now()}`])} className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow active:scale-95 transition-transform">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Long */}
              <div className="glass-panel rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Long Questions</p>
                    <p className="text-[10px] text-gray-500">{availableCounts.longs} available</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-violet-600">{selectedLongIds.length}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setLongs(selectedLongIds.slice(0, -1))} className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center active:scale-95 transition-transform">
                        <Minus className="w-3.5 h-3.5 text-red-600" />
                      </button>
                      <button onClick={() => setLongs([...selectedLongIds, `long_${Date.now()}`])} className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow active:scale-95 transition-transform">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Fill */}
          <div className="px-4 mt-3">
            <QuickFillCard availableMcqs={availableCounts.mcqs} availableShorts={availableCounts.shorts} availableLongs={availableCounts.longs} onAutoSelect={handleAutoSelect} />
          </div>

          <div className="h-6" />
        </ScrollView>

        {/* Generate Button */}
        <AnimatePresence>
          {!isGenerating && (
            <motion.div
              className="fixed left-0 right-0 z-30 px-4"
              style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              <div className="mx-auto max-w-[428px]">
                <Button
                  onClick={handleGenerate}
                  disabled={totalQuestions === 0}
                  className="w-full h-12 rounded-xl font-semibold text-sm bg-gradient-to-r from-white to-gray-100 text-[#1E40AF] shadow-lg shadow-black/20 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Paper
                    {totalQuestions > 0 && (
                      <span className="bg-[#1E40AF] text-white px-2 py-0.5 rounded-md text-xs font-bold">
                        {totalQuestions}Q
                      </span>
                    )}
                  </span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog isOpen={showBackConfirm} onClose={() => setShowBackConfirm(false)} onConfirm={confirmBack} title="Discard Changes?" message="Your question selections will be lost." confirmText="Discard" variant="destructive" />
      <ConfirmDialog isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={confirmReset} title="Clear All?" message="Remove all selected questions?" confirmText="Clear" variant="destructive" />
      
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} onSuccess={(status) => setPremiumStatus({ isPremium: status.isPremium, remaining: -1 })} />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            </div>
            <div className="relative h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl mb-6">
                  <div className="w-10 h-10 border-4 border-[#1E88E5]/30 border-t-[#1E88E5] rounded-full animate-spin" />
                </div>
                <motion.p
                  className="text-white font-semibold text-lg"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {statusMessage}
                </motion.p>
                <div className="flex gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/60"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
