"use client";

import { useState, useMemo } from "react";
import { X, Check, ChevronDown, ChevronUp, Search, Filter, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion, Difficulty } from "@/types";

interface QuestionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionType: "mcq" | "short" | "long";
  availableQuestions: MCQQuestion[] | ShortQuestion[] | LongQuestion[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  chapters: { id: string; name: string; number: number }[];
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bg: string }> = {
  easy: { label: "Easy", color: "text-green-600", bg: "bg-green-100" },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-100" },
  hard: { label: "Hard", color: "text-red-600", bg: "bg-red-100" },
};

type Question = MCQQuestion | ShortQuestion | LongQuestion;

export function QuestionPickerModal({
  isOpen,
  onClose,
  questionType,
  availableQuestions,
  selectedIds,
  onSelectionChange,
  chapters,
}: QuestionPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const toggleQuestion = (questionId: string) => {
    if (selectedIds.includes(questionId)) {
      onSelectionChange(selectedIds.filter((id) => id !== questionId));
    } else {
      onSelectionChange([...selectedIds, questionId]);
    }
  };

  const selectAllInChapter = (chapterId: string, chapterQuestions: Question[]) => {
    const chapterIds = chapterQuestions.map((q) => q.id);
    if (chapterQuestions.every((q) => selectedIds.includes(q.id))) {
      onSelectionChange(selectedIds.filter((id) => !chapterIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedIds, ...chapterIds])]);
    }
  };

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    chapters.forEach((chapter) => {
      groups[chapter.id] = [];
    });
    availableQuestions.forEach((q) => {
      const parts = q.id.split("_");
      const chapterId = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : `ch_${q.chapterNumber || 1}`;
      if (!groups[chapterId]) {
        groups[chapterId] = [];
      }
      groups[chapterId].push(q);
    });
    return groups;
  }, [availableQuestions, chapters]);

  const filteredQuestions = useMemo(() => {
    const result: Record<string, Question[]> = {};
    Object.entries(groupedQuestions).forEach(([chapterId, questions]) => {
      let filtered = questions;
      if (difficultyFilter !== "all") {
        filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((q) => q.questionText.toLowerCase().includes(query));
      }
      if (filtered.length > 0) {
        result[chapterId] = filtered;
      }
    });
    return result;
  }, [groupedQuestions, difficultyFilter, searchQuery]);

  const totalQuestions = availableQuestions.length;
  const selectedCount = selectedIds.length;
  const isMCQ = questionType === "mcq";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[428px] h-[85vh] bg-white rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-slideUp">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Select {isMCQ ? "MCQs" : questionType === "short" ? "Short Questions" : "Long Questions"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#1E88E5]">{selectedCount} selected</span>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-9 pr-3 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center text-sm font-medium transition-colors",
                showFilters ? "bg-[#1E88E5] text-white" : "bg-gray-100 text-gray-700"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          {showFilters && (
            <div className="flex gap-2 mt-3">
              {(["all", "easy", "medium", "hard"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff as Difficulty | "all")}
                  className={cn(
                    "h-10 px-4 rounded-lg text-sm font-medium transition-colors",
                    difficultyFilter === diff
                      ? "bg-[#1E88E5] text-white"
                      : "bg-gray-100 text-gray-700 active:bg-gray-200"
                  )}
                >
                  {diff === "all" ? "All" : DIFFICULTY_CONFIG[diff as Difficulty]?.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between px-4 py-3 bg-[#E3F2FD] text-sm min-h-[48px]">
          <span className="text-[#1E88E5] font-medium">{selectedCount} of {totalQuestions} questions</span>
          <div className="flex gap-3">
            <button onClick={() => onSelectionChange([])} className="text-sm text-[#1E88E5] font-medium px-2 py-1 hover:bg-white/50 rounded-lg transition-colors">Clear</button>
            <button onClick={() => onSelectionChange(availableQuestions.map((q) => q.id))} className="text-sm text-[#1E88E5] font-medium px-2 py-1 hover:bg-white/50 rounded-lg transition-colors">Select All</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {Object.entries(filteredQuestions).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <HelpCircle className="w-10 h-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium">No questions found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            Object.entries(filteredQuestions).map(([chapterId, questions]) => {
              const chapter = chapters.find((c) => c.id === chapterId);
              const isExpanded = expandedChapters.has(chapterId);
              const allSelected = questions.every((q) => selectedIds.includes(q.id));
              const someSelected = questions.some((q) => selectedIds.includes(q.id));
              
              return (
                <div key={chapterId} className="mb-3">
                  <div
                    onClick={() => toggleChapter(chapterId)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer min-h-[56px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1E88E5]/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-semibold text-gray-800 block">
                          {chapter?.name || `Chapter ${chapterId.split('_')[2] || chapterId}`}
                        </span>
                        <span className="text-xs text-gray-500">{questions.length} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInChapter(chapterId, questions);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            selectAllInChapter(chapterId, questions);
                          }
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                          allSelected ? "bg-green-500 text-white" : someSelected ? "bg-[#1E88E5]/20 text-[#1E88E5]" : "bg-gray-200 text-gray-600"
                        )}
                      >
                        {allSelected ? <Check className="w-5 h-5" /> : someSelected ? questions.filter(q => selectedIds.includes(q.id)).length : "All"}
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="overflow-hidden">
                      <div className="space-y-2 pt-2">
                        {questions.map((q, index) => {
                          const isSelected = selectedIds.includes(q.id);
                          const diffConfig = DIFFICULTY_CONFIG[q.difficulty];
                          const marks = isMCQ ? (q as MCQQuestion).marks || 1 : questionType === "short" ? 5 : 10;
                          
                          return (
                            <div
                              key={q.id}
                              onClick={() => toggleQuestion(q.id)}
                              className={cn(
                                "w-full p-4 rounded-xl cursor-pointer transition-all border-2 min-h-[56px]",
                                isSelected ? "bg-[#E3F2FD] border-[#1E88E5]" : "bg-white border-gray-100 active:border-[#1E88E5]/50"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                  isSelected ? "bg-[#1E88E5] text-white" : "bg-gray-100 text-gray-500"
                                )}>
                                  {isSelected ? <Check className="w-5 h-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">{q.questionText}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={cn("text-xs font-medium px-2 py-1 rounded-md", diffConfig.bg, diffConfig.color)}>{diffConfig.label}</span>
                                    <span className="text-xs text-gray-400">{marks} mark{marks > 1 ? "s" : ""}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 pb-safe">
          <button
            onClick={onClose}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white font-semibold shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition-transform"
          >
            Done - {selectedCount} Selected
          </button>
        </div>
      </div>
    </div>
  );
}
