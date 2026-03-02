"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronDown, ChevronUp, Plus, Minus, Check, 
  Layers, Wand2, GripVertical, Trash2, Pencil, Eye, X, Search, Filter
} from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { getMcqsByChapterIds, getShortsByChapterIds, getLongsByChapterIds, getSubjectData, getRandomQuestions } from "@/data";
import { triggerHaptic } from "@/hooks";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion, Difficulty } from "@/types";
import { LivePaperPreview } from "@/components/paper/LivePaperPreview";
import { ReorderQuestions } from "@/components/paper/ReorderQuestions";

interface Chapter {
  id: string;
  name: string;
  number: number;
}

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string }> = {
  easy: { bg: "bg-green-500/20", text: "text-green-400" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-400" },
  hard: { bg: "bg-red-500/20", text: "text-red-400" },
};

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export default function CreatePaperQuestionsPage() {
  const router = useRouter();
  const {
    selectedClass, selectedSubject, selectedChapters,
    selectedMcqIds, selectedShortIds, selectedLongIds,
    setMcqs, setShorts, setLongs, toggleMcq, toggleShort, toggleLong,
    selectedTemplate, paperSettings, updateSettings,
    setStep, prevStep, questionOrder, setQuestionOrder,
    editQuestion, editedQuestions
  } = usePaperStore();

  const [allMcqs, setAllMcqs] = useState<MCQQuestion[]>([]);
  const [allShorts, setAllShorts] = useState<ShortQuestion[]>([]);
  const [allLongs, setAllLongs] = useState<LongQuestion[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"mcq" | "short" | "long">("mcq");
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [expandingReorder, setExpandingReorder] = useState<'mcq' | 'short' | 'long' | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Question picker state
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Custom marks (local state for this page)
  const [customMcqMarks, setCustomMcqMarks] = useState(paperSettings.customMarks?.mcq || 1);
  const [customShortMarks, setCustomShortMarks] = useState(paperSettings.customMarks?.short || 2);
  const [customLongMarks, setCustomLongMarks] = useState(paperSettings.customMarks?.long || 5);

  // Load questions
  useEffect(() => {
    const loadData = async () => {
      if (!selectedClass || !selectedSubject) {
        router.push('/create-paper/templates');
        return;
      }

      if (selectedChapters.length === 0) {
        router.push('/create-paper/chapters');
        return;
      }

      try {
        const [mcqs, shorts, longs] = await Promise.all([
          getMcqsByChapterIds(selectedClass, selectedSubject, selectedChapters),
          getShortsByChapterIds(selectedClass, selectedSubject, selectedChapters),
          getLongsByChapterIds(selectedClass, selectedSubject, selectedChapters)
        ]);

        setAllMcqs(mcqs);
        setAllShorts(shorts);
        setAllLongs(longs);

        // Get chapter details
        const subjectData = await getSubjectData(selectedClass, selectedSubject);
        if (subjectData) {
          const chaptersData = subjectData.chapters
            .filter(ch => selectedChapters.includes(ch.id))
            .map(ch => ({ id: ch.id, name: ch.name, number: ch.number }));
          setChapters(chaptersData);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClass, selectedSubject, selectedChapters, router]);

  // Get current questions based on tab
  const currentQuestions = useMemo(() => {
    if (activeTab === 'mcq') return allMcqs;
    if (activeTab === 'short') return allShorts;
    return allLongs;
  }, [activeTab, allMcqs, allShorts, allLongs]);

  const currentSelectedIds = useMemo(() => {
    if (activeTab === 'mcq') return selectedMcqIds;
    if (activeTab === 'short') return selectedShortIds;
    return selectedLongIds;
  }, [activeTab, selectedMcqIds, selectedShortIds, selectedLongIds]);

  const currentSetter = useMemo(() => {
    if (activeTab === 'mcq') return setMcqs;
    if (activeTab === 'short') return setShorts;
    return setLongs;
  }, [activeTab, setMcqs, setShorts, setLongs]);

  // Filter questions
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof currentQuestions> = {};
    currentQuestions.forEach(q => {
      const chapterId = q.chapterNumber ? `ch_${selectedClass}_${selectedSubject}_ch${q.chapterNumber}` : 'custom';
      if (!groups[chapterId]) groups[chapterId] = [];
      groups[chapterId].push(q);
    });
    return groups;
  }, [currentQuestions, selectedClass, selectedSubject]);

  const filteredQuestions = useMemo(() => {
    const result: Record<string, typeof currentQuestions> = {};
    Object.entries(groupedQuestions).forEach(([chapterId, questions]) => {
      let filtered = questions;
      if (difficultyFilter !== "all") {
        filtered = filtered.filter(q => q.difficulty === difficultyFilter);
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(q => typeof q.questionText === 'string' && q.questionText.toLowerCase().includes(query));
      }
      if (filtered.length > 0) result[chapterId] = filtered;
    });
    return result;
  }, [groupedQuestions, difficultyFilter, searchQuery]);

  // Quick Fill
  const handleAutoFill = useCallback(async (difficulty: DifficultyLevel) => {
    if (!selectedClass || !selectedSubject) return;

    triggerHaptic('medium');
    
    const pattern = selectedTemplate;
    const targetMcqs = pattern?.sections.find(s => s.type === 'mcq')?.totalQuestions || 15;
    const targetShorts = pattern?.sections.filter(s => s.type === 'short').reduce((sum, s) => sum + s.totalQuestions, 0) || 10;
    const targetLongs = pattern?.sections.filter(s => s.type === 'long').reduce((sum, s) => sum + s.totalQuestions, 0) || 3;

    try {
      const result = await getRandomQuestions(
        selectedClass, selectedSubject, selectedChapters,
        targetMcqs, targetShorts, targetLongs, difficulty
      );

      setMcqs(result.mcqs.map(q => q.id));
      setShorts(result.shorts.map(q => q.id));
      setLongs(result.longs.map(q => q.id));
      setShowQuickFill(false);
    } catch (error) {
      console.error("Error auto-filling:", error);
    }
  }, [selectedClass, selectedSubject, selectedChapters, selectedTemplate, setMcqs, setShorts, setLongs]);

  const toggleQuestion = useCallback((questionId: string) => {
    triggerHaptic('light');
    if (activeTab === 'mcq') toggleMcq(questionId);
    else if (activeTab === 'short') toggleShort(questionId);
    else toggleLong(questionId);
  }, [activeTab, toggleMcq, toggleShort, toggleLong]);

  const handleAddQuestion = useCallback(() => {
    if (currentQuestions.length > currentSelectedIds.length) {
      const unselected = currentQuestions.filter(q => !currentSelectedIds.includes(q.id));
      currentSetter([...currentSelectedIds, unselected[0].id]);
    }
  }, [currentQuestions, currentSelectedIds, currentSetter]);

  const handleRemoveQuestion = useCallback(() => {
    if (currentSelectedIds.length > 0) {
      currentSetter(currentSelectedIds.slice(0, -1));
    }
  }, [currentSelectedIds, currentSetter]);

  const handleNext = useCallback(() => {
    triggerHaptic('medium');
    // Update custom marks in settings
    updateSettings({
      customMarks: {
        mcq: customMcqMarks,
        short: customShortMarks,
        long: customLongMarks
      }
    });
    setStep('details');
    router.push('/create-paper/details');
  }, [customMcqMarks, customShortMarks, customLongMarks, updateSettings, setStep, router]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    setStep('chapters');
    router.push('/create-paper/chapters');
  }, [setStep, router]);

  // Calculate totals
  const totalQuestions = selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length;
  const totalMarks = (selectedMcqIds.length * customMcqMarks) + 
    (selectedShortIds.length * customShortMarks) + 
    (selectedLongIds.length * customLongMarks);

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
            <div className="flex items-center justify-between mb-2">
              <button onClick={handleBack} className="text-[#6B7280] hover:text-white text-sm font-medium">
                ← Back
              </button>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span>Templates</span>
                <ChevronRight className="w-3 h-3" />
                <span>Chapters</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#B9FF66]">Questions</span>
                <ChevronRight className="w-3 h-3" />
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
                <span>Preview</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Select Questions</h1>
                <p className="text-[#6B7280] text-sm">
                  {chapters.length} chapters • {currentQuestions.length} questions available
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
                  showPreview ? "bg-[#B9FF66] text-[#0A0A0A]" : "bg-white/5 text-white border border-white/10"
                )}
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1 p-3 rounded-xl bg-[#1A1A1A] border border-white/5">
                <p className="text-xs text-[#6B7280]">Questions</p>
                <p className="text-lg font-bold text-white">{totalQuestions}</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-[#1A1A1A] border border-white/5">
                <p className="text-xs text-[#6B7280]">Total Marks</p>
                <p className="text-lg font-bold text-[#B9FF66]">{totalMarks}</p>
              </div>
            </div>

            {/* Quick Fill */}
            <button
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="w-full mt-4 p-4 rounded-xl bg-gradient-to-r from-[#8B5CF6]/10 to-[#B9FF66]/10 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#B9FF66] flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white">Magic Quick Fill</span>
                  <span className="text-xs text-[#6B7280] block">Auto-select by difficulty</span>
                </div>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-[#6B7280]", showQuickFill && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showQuickFill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      { key: 'easy', label: 'Easy', color: 'text-green-400', bg: 'bg-green-400/10' },
                      { key: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                      { key: 'hard', label: 'Hard', color: 'text-red-400', bg: 'bg-red-400/10' },
                      { key: 'mixed', label: 'Mixed', color: 'text-[#B9FF66]', bg: 'bg-[#B9FF66]/10' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleAutoFill(item.key as DifficultyLevel)}
                        className={cn("py-3 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all", item.bg)}
                      >
                        <span className={cn("text-xs font-bold uppercase", item.color)}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Question Tabs & Controls */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {([
              { key: 'mcq', label: 'MCQs', count: selectedMcqIds.length, color: 'text-[#B9FF66]' },
              { key: 'short', label: 'Short', count: selectedShortIds.length, color: 'text-emerald-400' },
              { key: 'long', label: 'Long', count: selectedLongIds.length, color: 'text-violet-400' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { triggerHaptic('light'); setActiveTab(tab.key); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === tab.key
                    ? "bg-white text-black"
                    : "bg-white/5 text-[#6B7280] border border-white/10"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* ± Controls */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleRemoveQuestion}
              disabled={currentSelectedIds.length === 0}
              className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 disabled:opacity-50"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center font-bold text-white text-lg">
              {currentSelectedIds.length}
            </div>
            <button
              onClick={handleAddQuestion}
              disabled={currentQuestions.length <= currentSelectedIds.length}
              className="w-10 h-10 rounded-lg bg-[#B9FF66]/10 flex items-center justify-center text-[#B9FF66] disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowQuestionPicker(true)}
              className="px-4 py-2 rounded-lg bg-[#B9FF66] text-[#0A0A0A] text-sm font-bold"
            >
              Add
            </button>
          </div>

          {/* Reorder Button */}
          {currentSelectedIds.length > 1 && (
            <button
              onClick={() => setExpandingReorder(expandingReorder === activeTab ? null : activeTab)}
              className="w-full mt-3 py-2 rounded-lg border border-dashed border-[#2A2A2A] hover:border-[#B9FF66]/30 text-xs font-bold text-[#6B7280] hover:text-[#B9FF66] transition-all flex items-center justify-center gap-2"
            >
              <GripVertical className="w-4 h-4" />
              {expandingReorder === activeTab ? 'Hide Reorder' : 'Reorder Questions'}
            </button>
          )}
        </div>

        {/* Questions List */}
        <div className="max-w-4xl mx-auto px-4 pb-32">
          {expandingReorder === activeTab ? (
            <ReorderQuestions
              type={activeTab}
              items={currentSelectedIds.map(id => currentQuestions.find(q => q.id === id)).filter(Boolean) as any}
              onOrderChange={(newOrder) => {
                setQuestionOrder(activeTab, newOrder);
                currentSetter(newOrder);
              }}
              onRemove={(id) => {
                currentSetter(currentSelectedIds.filter(sid => sid !== id));
              }}
              editedQuestions={editedQuestions}
              onEditQuestion={(questionId, newText) => {
                editQuestion(questionId, { questionText: newText });
              }}
            />
          ) : (
            <div className="space-y-2">
              {Object.entries(filteredQuestions).map(([chapterId, questions]) => {
                const chapter = chapters.find(c => `ch_${selectedClass}_${selectedSubject}_ch${c.number}` === chapterId);
                const isExpanded = expandedChapters.has(chapterId);

                return (
                  <div key={chapterId} className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedChapters);
                        if (isExpanded) newExpanded.delete(chapterId);
                        else newExpanded.add(chapterId);
                        setExpandedChapters(newExpanded);
                      }}
                      className="w-full p-4 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-white">
                        {chapter?.name || `Chapter ${chapterId.replace('ch_', '')}`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2">
                            {questions.map((q) => {
                              const isSelected = currentSelectedIds.includes(q.id);
                              const diff = DIFFICULTY_COLORS[q.difficulty];
                              
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => toggleQuestion(q.id)}
                                  className={cn(
                                    "w-full p-3 rounded-lg flex items-center gap-3 text-left transition-all",
                                    isSelected
                                      ? "bg-[#B9FF66]/10 border border-[#B9FF66]/30"
                                      : "bg-white/5 border border-transparent hover:border-white/10"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                                    isSelected ? "bg-[#B9FF66] border-[#B9FF66]" : "border-white/20"
                                  )}>
                                    {isSelected && <Check className="w-3 h-3 text-black" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white line-clamp-2">{q.questionText}</p>
                                    <span className={cn("text-xs px-2 py-0.5 rounded mt-1 inline-block", diff.bg, diff.text)}>
                                      {q.difficulty}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/80" onClick={() => setShowPreview(false)} />
              <motion.div
                className="relative bg-white w-full max-w-2xl h-[80vh] rounded-2xl overflow-hidden"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-full overflow-y-auto">
                  <LivePaperPreview
                    paperTitle={paperSettings.title || `${selectedClass} ${selectedSubject} Paper`}
                    instituteName={paperSettings.instituteName || "Institute"}
                    date={paperSettings.date || new Date().toISOString().split('T')[0]}
                    timeAllowed={paperSettings.timeAllowed || "2 Hours"}
                    totalMarks={totalMarks}
                    mcqs={selectedMcqIds.map(id => allMcqs.find(q => q.id === id)).filter(Boolean) as MCQQuestion[]}
                    shorts={selectedShortIds.map(id => allShorts.find(q => q.id === id)).filter(Boolean) as ShortQuestion[]}
                    longs={selectedLongIds.map(id => allLongs.find(q => q.id === id)).filter(Boolean) as LongQuestion[]}
                    editedQuestions={editedQuestions}
                    questionOrder={questionOrder}
                    settings={paperSettings}
                    fontSize={12}
                    logoPreview={null}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0A] to-transparent">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-[#B9FF66] text-[#0A0A0A] font-bold text-lg hover:bg-[#a3e659]"
            >
              <span className="flex items-center gap-2">
                Next: Paper Details
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
