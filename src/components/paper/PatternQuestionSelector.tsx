"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, ChevronDown, ChevronUp, BookOpen, HelpCircle, 
  Target, FileText, Edit3, ArrowRight, Sparkles, Layers,
  Plus, Minus, RotateCcw, Eye, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getPattern, type PaperPattern, type QuestionSection } from "@/lib/pdf/patterns";
import type { MCQQuestion, ShortQuestion, LongQuestion, Difficulty } from "@/types";

interface PatternQuestionSelectorProps {
  classId: string;
  subject: string;
  selectedMcqIds: string[];
  selectedShortIds: string[];
  selectedLongIds: string[];
  onMcqChange: (ids: string[]) => void;
  onShortChange: (ids: string[]) => void;
  onLongChange: (ids: string[]) => void;
  availableMcqs: MCQQuestion[];
  availableShorts: ShortQuestion[];
  availableLongs: LongQuestion[];
  chapters: { id: string; name: string; number: number }[];
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string; dot: string }> = {
  easy: { label: "Easy", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  hard: { label: "Hard", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
};

export function PatternQuestionSelector({
  classId,
  subject,
  selectedMcqIds,
  selectedShortIds,
  selectedLongIds,
  onMcqChange,
  onShortChange,
  onLongChange,
  availableMcqs,
  availableShorts,
  availableLongs,
  chapters,
}: PatternQuestionSelectorProps) {
  const pattern = getPattern(classId, subject);
  const [activeTab, setActiveTab] = useState<"mcq" | "short" | "long">("mcq");
  const [showPicker, setShowPicker] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");

  const currentQuestions = useMemo(() => {
    switch (activeTab) {
      case "mcq": return availableMcqs;
      case "short": return availableShorts;
      case "long": return availableLongs;
    }
  }, [activeTab, availableMcqs, availableShorts, availableLongs]);

  const currentSelected = useMemo(() => {
    switch (activeTab) {
      case "mcq": return selectedMcqIds;
      case "short": return selectedShortIds;
      case "long": return selectedLongIds;
    }
  }, [activeTab, selectedMcqIds, selectedShortIds, selectedLongIds]);

  const currentOnChange = useCallback((ids: string[]) => {
    switch (activeTab) {
      case "mcq": onMcqChange(ids); break;
      case "short": onShortChange(ids); break;
      case "long": onLongChange(ids); break;
    }
  }, [activeTab, onMcqChange, onShortChange, onLongChange]);

  const patternSections: Record<"mcq" | "short" | "long", QuestionSection[]> = useMemo(() => {
    if (!pattern) return { mcq: [], short: [], long: [] };
    return {
      mcq: pattern.sections.filter(s => s.type === 'mcq'),
      short: pattern.sections.filter(s => s.type === 'short'),
      long: pattern.sections.filter(s => s.type === 'long'),
    };
  }, [pattern]);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof currentQuestions> = {};
    chapters.forEach((chapter) => {
      groups[chapter.id] = [];
    });
    currentQuestions.forEach((q: any) => {
      const parts = q.id.split("_");
      const chapterId = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : `ch_${q.chapterNumber || 1}`;
      if (!groups[chapterId]) groups[chapterId] = [];
      groups[chapterId].push(q);
    });
    return groups;
  }, [currentQuestions, chapters]);

  const filteredQuestions = useMemo(() => {
    const result: Record<string, typeof currentQuestions> = {};
    Object.entries(groupedQuestions).forEach(([chapterId, questions]) => {
      let filtered = questions;
      if (difficultyFilter !== "all") {
        filtered = filtered.filter((q: any) => q.difficulty === difficultyFilter);
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((q: any) => 
          q.questionText.toLowerCase().includes(query)
        );
      }
      if (filtered.length > 0) {
        result[chapterId] = filtered;
      }
    });
    return result;
  }, [groupedQuestions, difficultyFilter, searchQuery]);

  const toggleQuestion = useCallback((questionId: string) => {
    if (currentSelected.includes(questionId)) {
      currentOnChange(currentSelected.filter((id) => id !== questionId));
    } else {
      currentOnChange([...currentSelected, questionId]);
    }
  }, [currentSelected, currentOnChange]);

  const selectAllInChapter = useCallback((chapterId: string) => {
    const chapterQuestions = filteredQuestions[chapterId] || [];
    const chapterIds = chapterQuestions.map((q: any) => q.id);
    if (chapterQuestions.every((q: any) => currentSelected.includes(q.id))) {
      currentOnChange(currentSelected.filter((id) => !chapterIds.includes(id)));
    } else {
      currentOnChange([...new Set([...currentSelected, ...chapterIds])]);
    }
  }, [filteredQuestions, currentSelected, currentOnChange]);

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  }, []);

  const getChapterName = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter?.name || chapterId;
  };

  const getTotalRequired = (type: "mcq" | "short" | "long") => {
    const sections = patternSections[type];
    if (!sections.length) return 0;
    return sections.reduce((sum, s) => sum + s.totalQuestions, 0);
  };

  const getTotalSelected = (type: "mcq" | "short" | "long") => {
    switch (type) {
      case "mcq": return selectedMcqIds.length;
      case "short": return selectedShortIds.length;
      case "long": return selectedLongIds.length;
    }
  };

  const getTotalMarks = (type: "mcq" | "short" | "long") => {
    const sections = patternSections[type];
    if (!sections.length) return 0;
    return sections.reduce((sum, s) => sum + s.totalMarks, 0);
  };

  if (!pattern) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-700 text-sm">
          No pattern defined for {subject} (Class {classId}). 
          Please contact support or use manual question selection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pattern Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{subject}</h3>
            <p className="text-blue-100 text-sm">Class {classId} • {pattern.timeAllowed}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{pattern.totalMarks}</p>
            <p className="text-blue-100 text-xs">Total Marks</p>
          </div>
        </div>
        
        {/* Pattern Sections Summary */}
        <div className="mt-3 pt-3 border-t border-blue-500/30">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pattern.sections.map((section, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 bg-white/10 rounded-lg px-3 py-2 min-w-[80px]"
              >
                <p className="text-xs text-blue-100">Q{section.qNumber}</p>
                <p className="text-sm font-semibold">{section.totalMarks} marks</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Type Tabs */}
      <div className="flex gap-2">
        {(['mcq', 'short', 'long'] as const).map((type) => {
          const required = getTotalRequired(type);
          const selected = getTotalSelected(type);
          const marks = getTotalMarks(type);
          const isComplete = selected >= required;

          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={cn(
                "flex-1 rounded-xl p-3 text-left transition-all",
                activeTab === type 
                  ? "bg-blue-50 border-2 border-blue-500" 
                  : "bg-white border border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-semibold text-sm capitalize",
                  activeTab === type ? "text-blue-700" : "text-gray-700"
                )}>
                  {type === 'mcq' ? 'MCQs' : type === 'short' ? 'Short' : 'Long'}
                </span>
                {isComplete ? (
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-gray-200" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selected}/{required} questions
              </p>
              <p className="text-xs font-medium text-gray-700">{marks} marks</p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(true)}
          className="flex-1 h-10"
        >
          <Eye className="w-4 h-4 mr-2" />
          View/Edit Questions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const type = activeTab;
            const questions = type === "mcq" ? availableMcqs : type === "short" ? availableShorts : availableLongs;
            const required = getTotalRequired(type);
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, required).map((q: any) => q.id);
            if (type === "mcq") onMcqChange(selected);
            else if (type === "short") onShortChange(selected);
            else onLongChange(selected);
          }}
          className="flex-1 h-10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Auto-Fill
        </Button>
      </div>

      {/* Question Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-bold text-lg">Select {activeTab === 'mcq' ? 'MCQs' : activeTab === 'short' ? 'Short' : 'Long'} Questions</h3>
                  <p className="text-sm text-gray-500">
                    Required: {getTotalRequired(activeTab)} • Selected: {currentSelected.length} • Marks: {getTotalMarks(activeTab)}
                  </p>
                </div>
                <button 
                  onClick={() => setShowPicker(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters */}
              <div className="p-3 border-b bg-gray-50">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
                <div className="flex gap-2 mt-2">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium capitalize",
                        difficultyFilter === diff 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {Object.entries(filteredQuestions).map(([chapterId, questions]) => {
                  const chapterSelected = (questions as any[]).filter(q => 
                    currentSelected.includes(q.id)
                  ).length;
                  const isExpanded = expandedChapters.has(chapterId);

                  return (
                    <div key={chapterId} className="border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleChapter(chapterId)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">{getChapterName(chapterId)}</span>
                          <span className="text-xs text-gray-400">({(questions as any[]).length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{chapterSelected} selected</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-2 space-y-1">
                          {(questions as any[]).map((question) => {
                            const isSelected = currentSelected.includes(question.id);
                            const diff = DIFFICULTY_CONFIG[question.difficulty as Difficulty] || DIFFICULTY_CONFIG.medium;

                            return (
                              <button
                                key={question.id}
                                onClick={() => toggleQuestion(question.id)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all",
                                  isSelected 
                                    ? "bg-blue-50 border border-blue-200" 
                                    : "hover:bg-gray50 border border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                  isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                )}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 truncate">
                                    {question.questionText}
                                  </p>
                                </div>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full", diff.bg, diff.color)}>
                                  {diff.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {currentSelected.length} of {getTotalRequired(activeTab)} selected
                  </p>
                  <Button onClick={() => setShowPicker(false)}>
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PatternQuestionSelector;
