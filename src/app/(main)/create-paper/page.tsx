"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, RotateCcw, FileText, Sparkles, BookOpen, Layers, Crown,
  CheckCircle2, AlertCircle, Clock, Hash, ChevronRight
} from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { ConfirmDialog, AppLoader } from "@/components/shared";
import { PremiumModal } from "@/components/premium/PremiumModal";
import {
  PaperSettings,
  QuestionTypeCard,
  QuickFillCard,
  QuestionModal,
} from "@/components/paper";
import { usePaperStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks";
import {
  getAvailableQuestionCounts,
  getRandomQuestions,
} from "@/data";
import { savePaper } from "@/lib/storage/papers";
import { generatePaperId } from "@/lib/utils/id";
import { canGeneratePaper, incrementPaperUsage, checkPremiumStatus } from "@/lib/premium";
import type { Difficulty } from "@/types";
import { QUESTION_MARKS } from "@/types/question";

export default function CreatePaperPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    selectedClass,
    selectedSubject,
    selectedChapters,
    paperSettings,
    selectedMcqIds,
    selectedShortIds,
    selectedLongIds,
    setMcqs,
    setShorts,
    setLongs,
    updateSettings,
    resetQuestions,
  } = usePaperStore();

  const [isValidating, setIsValidating] = useState(true);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Creating paper...");
  const [activeModal, setActiveModal] = useState<"mcq" | "short" | "long" | null>(null);
  const [availableCounts, setAvailableCounts] = useState({ mcqs: 0, shorts: 0, longs: 0 });
  
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, remaining: 0 });
  
  const hasUnsavedChanges = selectedMcqIds.length > 0 || selectedShortIds.length > 0 || selectedLongIds.length > 0;

  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }, []);

  useEffect(() => {
    const status = checkPremiumStatus();
    const paperCheck = canGeneratePaper();
    setPremiumStatus({
      isPremium: status.isPremium,
      remaining: paperCheck.remaining,
    });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isGenerating) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isGenerating]);

  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges && !isGenerating) {
        if (window.confirm("You have unsaved changes. Are you sure you want to go back?")) {
          resetQuestions();
        } else {
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasUnsavedChanges, isGenerating, resetQuestions]);

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
          instituteName: instituteName,
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

  useEffect(() => {
    if (hasUnsavedChanges && !isGenerating) {
      window.history.pushState(null, "", window.location.href);
    }
  }, [hasUnsavedChanges, isGenerating]);

  const totalQuestions = selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length;
  const totalMarks = (selectedMcqIds.length * QUESTION_MARKS.mcq) + (selectedShortIds.length * QUESTION_MARKS.short) + (selectedLongIds.length * QUESTION_MARKS.long);

  const questionBreakdown = useMemo(() => [
    { type: "MCQ", count: selectedMcqIds.length, marks: selectedMcqIds.length * QUESTION_MARKS.mcq, color: "bg-blue-500" },
    { type: "Short", count: selectedShortIds.length, marks: selectedShortIds.length * QUESTION_MARKS.short, color: "bg-green-500" },
    { type: "Long", count: selectedLongIds.length, marks: selectedLongIds.length * QUESTION_MARKS.long, color: "bg-purple-500" },
  ], [selectedMcqIds.length, selectedShortIds.length, selectedLongIds.length]);

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

  const handleModalSave = useCallback((type: "mcq" | "short" | "long", ids: string[]) => {
    switch (type) {
      case "mcq": setMcqs(ids); break;
      case "short": setShorts(ids); break;
      case "long": setLongs(ids); break;
    }
    setActiveModal(null);
  }, [setMcqs, setShorts, setLongs]);

  const handleAutoSelect = useCallback((
    mcqCount: number,
    shortCount: number,
    longCount: number,
    difficulty: string
  ) => {
    if (!selectedClass || !selectedSubject) return;

    const diffMap: Record<string, Difficulty | "mixed"> = {
      mixed: "mixed", easy: "easy", medium: "medium", hard: "hard",
    };

    const result = getRandomQuestions(
      selectedClass, selectedSubject, selectedChapters,
      mcqCount, shortCount, longCount, diffMap[difficulty] || "mixed"
    );

    setMcqs(result.mcqs.map((q) => q.id));
    setShorts(result.shorts.map((q) => q.id));
    setLongs(result.longs.map((q) => q.id));

    const totalSelected = result.mcqs.length + result.shorts.length + result.longs.length;
    
    if (totalSelected === 0) {
      toast.warning("No questions available in selected chapters");
    } else if (totalSelected < mcqCount + shortCount + longCount) {
      toast.success(`Selected ${totalSelected} questions (some unavailable)`);
    } else {
      toast.success(`Auto-selected ${totalSelected} questions`);
    }
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
        totalMarks: totalMarks,
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
      
      if (!paperCheck.isPremium) {
        incrementPaperUsage();
      }

      setStatusMessage("Redirecting...");
      router.push(`/paper?id=${paperId}`);
    } catch (error) {
      console.error("Paper creation error:", error);
      toast.error("Failed to create paper. Please try again.");
      setIsGenerating(false);
    }
  }, [totalQuestions, selectedClass, selectedSubject, selectedMcqIds, selectedShortIds, selectedLongIds, paperSettings, totalMarks, router, toast]);

  if (isValidating) {
    return <AppLoader message="Preparing..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <MainLayout showBottomNav={!activeModal}>
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="fixed top-0 left-0 right-0 z-40 pt-safe">
            <div className="mx-auto max-w-[428px]">
              <div className="glass-panel border-b border-gray-100/50">
                <div className="px-4 h-14 flex items-center justify-between">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl active:bg-gray-100" onClick={handleBack}>
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </Button>
                  <div className="text-center">
                    <h1 className="font-bold text-lg text-gray-900">Create Paper</h1>
                    <p className="text-[10px] text-gray-400">{currentTime}</p>
                  </div>
                  <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-xl ${hasUnsavedChanges ? 'text-red-500 active:bg-red-50' : 'text-gray-400'}`} onClick={handleReset}>
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <ScrollView className="pt-[56px] pt-safe flex-1 pb-32">
            {!premiumStatus.isPremium && (
              <div className="px-5 py-3">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        {premiumStatus.remaining} free papers left
                      </p>
                      <p className="text-xs text-amber-600">Upgrade for unlimited access</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowPremiumModal(true)}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold"
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            )}

            <div className="px-5 py-4">
              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Class {selectedClass}</p>
                      <p className="text-lg font-bold text-gray-900">{selectedSubject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm font-medium">{selectedChapters.length} chapters</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 mb-4">
              <div 
                className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] rounded-2xl p-5 shadow-xl shadow-[#1E88E5]/30"
              >
                <div className="flex items-center justify-between text-white mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {totalQuestions}
                    </p>
                    <p className="text-xs opacity-80">Questions</p>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {totalMarks}
                    </p>
                    <p className="text-xs opacity-80">Total Marks</p>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div className="text-center">
                    <p className="text-lg font-bold">{selectedChapters.length}</p>
                    <p className="text-xs opacity-80">Chapters</p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    {questionBreakdown.map((item) => (
                      <div key={item.type} className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-white/80 text-xs">{item.type}</span>
                        </div>
                        <p className="text-white font-semibold text-sm mt-1">
                          {item.count} ({item.marks}m)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 mb-4">
              <PaperSettings 
                settings={paperSettings} 
                onUpdate={updateSettings} 
                defaultInstituteName={paperSettings.instituteName || ""} 
              />
            </div>

            <div className="px-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-gray-800">Select Questions</h2>
              </div>

              <div className="space-y-3">
                <QuestionTypeCard 
                  type="mcq" 
                  selectedCount={selectedMcqIds.length} 
                  availableCount={availableCounts.mcqs} 
                  marksPerQuestion={QUESTION_MARKS.mcq} 
                  onAddClick={() => setActiveModal("mcq")} 
                />
                <QuestionTypeCard 
                  type="short" 
                  selectedCount={selectedShortIds.length} 
                  availableCount={availableCounts.shorts} 
                  marksPerQuestion={QUESTION_MARKS.short} 
                  onAddClick={() => setActiveModal("short")} 
                />
                <QuestionTypeCard 
                  type="long" 
                  selectedCount={selectedLongIds.length} 
                  availableCount={availableCounts.longs} 
                  marksPerQuestion={QUESTION_MARKS.long} 
                  onAddClick={() => setActiveModal("long")} 
                />
              </div>
            </div>

            <div className="px-5 mb-4">
              <QuickFillCard 
                availableMcqs={availableCounts.mcqs} 
                availableShorts={availableCounts.shorts} 
                availableLongs={availableCounts.longs} 
                onAutoSelect={handleAutoSelect} 
              />
            </div>

            {totalQuestions === 0 && (
              <div className="px-5 mb-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">No questions selected</p>
                    <p className="text-xs text-amber-600 mt-1">Add questions from the options above or use Quick Fill</p>
                  </div>
                </div>
              </div>
            )}

            <div className="h-24" />
          </ScrollView>

          <AnimatePresence>
            {!activeModal && (
              <div
                className="fixed left-0 right-0 z-30 px-5 bottom-safe"
                style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="mx-auto max-w-[428px]">
                  <div className="glass-panel rounded-2xl p-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={totalQuestions === 0 || isGenerating}
                      className="w-full h-14 rounded-xl font-semibold text-base bg-gradient-to-r from-[#1E88E5] to-[#1565C0] active:opacity-90 shadow-lg shadow-[#1E88E5]/30 disabled:opacity-50 transition-opacity"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {statusMessage}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Generate Paper
                          {totalQuestions > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
                              {totalQuestions}Q / {totalMarks}M
                            </span>
                          )}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {activeModal && selectedClass && selectedSubject && (
              <QuestionModal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                type={activeModal}
                classId={selectedClass}
                subject={selectedSubject}
                chapterIds={selectedChapters}
                selectedIds={activeModal === "mcq" ? selectedMcqIds : activeModal === "short" ? selectedShortIds : selectedLongIds}
                onSave={(ids) => handleModalSave(activeModal, ids)}
              />
            )}
          </AnimatePresence>

          <ConfirmDialog 
            isOpen={showBackConfirm} 
            onClose={() => setShowBackConfirm(false)} 
            onConfirm={confirmBack} 
            title="Discard Changes?" 
            message="Your question selections will be lost if you go back." 
            confirmText="Discard" 
            cancelText="Keep Editing" 
            variant="destructive" 
          />
          <ConfirmDialog 
            isOpen={showResetConfirm} 
            onClose={() => setShowResetConfirm(false)} 
            onConfirm={confirmReset} 
            title="Clear All Questions?" 
            message="This will remove all selected questions from your paper." 
            confirmText="Clear All" 
            cancelText="Cancel" 
            variant="destructive" 
          />
           
          <AnimatePresence>
            {isGenerating && (
              <div className="fixed inset-0 z-50">
                <AppLoader message={statusMessage} fullScreen />
              </div>
            )}
          </AnimatePresence>
           
          <PremiumModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            onSuccess={(status) => {
              setPremiumStatus({ isPremium: status.isPremium, remaining: -1 });
            }}
          />
        </div>
      </MainLayout>
    </div>
  );
}
