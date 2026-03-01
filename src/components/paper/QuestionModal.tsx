"use client";

/**
 * QuestionModal Component - Premium Design
 * 
 * Full screen modal for selecting questions.
 * Fixed footer positioned above bottom navbar.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChapterAccordion } from "./ChapterAccordion";
import { QuestionItem } from "./QuestionItem";
import { useDebounce, useToast } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  getMcqsByChapterIds,
  getShortsByChapterIds,
  getLongsByChapterIds,
} from "@/data";
import type { MCQQuestion, ShortQuestion, LongQuestion, Question } from "@/types";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "mcq" | "short" | "long";
  classId: string;
  subject: string;
  chapterIds: string[];
  selectedIds: string[];
  onSave: (ids: string[]) => void;
}

const filterOptions = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "selected", label: "Selected" },
];

export function QuestionModal({
  isOpen,
  onClose,
  type,
  classId,
  subject,
  chapterIds,
  selectedIds,
  onSave,
}: QuestionModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!isOpen) return;

    const loadQuestions = async () => {
      setIsLoading(true);
      let loadedQuestions: Question[] = [];

      switch (type) {
        case "mcq":
          loadedQuestions = await getMcqsByChapterIds(classId, subject, chapterIds);
          break;
        case "short":
          loadedQuestions = await getShortsByChapterIds(classId, subject, chapterIds);
          break;
        case "long":
          loadedQuestions = await getLongsByChapterIds(classId, subject, chapterIds);
          break;
      }

      setQuestions(loadedQuestions);

      const chapterSet = new Set(loadedQuestions.map((q) => q.chapterName || ""));
      setExpandedChapters(Array.from(chapterSet));

      setIsLoading(false);
    };

    loadQuestions();
  }, [isOpen, type, classId, subject, chapterIds]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedIds);
    }
  }, [isOpen, selectedIds]);

  const groupedQuestions = useMemo(() => {
    const grouped: Record<string, Question[]> = {};

    questions.forEach((question) => {
      const chapterName = question.chapterName || "Unknown Chapter";
      if (!grouped[chapterName]) {
        grouped[chapterName] = [];
      }
      grouped[chapterName].push(question);
    });

    return grouped;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    let filtered = [...questions];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((q) =>
        q.questionText.toLowerCase().includes(query)
      );
    }

    if (difficultyFilter !== "all" && difficultyFilter !== "selected") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    if (difficultyFilter === "selected") {
      filtered = filtered.filter((q) => localSelectedIds.includes(q.id));
    }

    return filtered;
  }, [questions, debouncedSearch, difficultyFilter, localSelectedIds]);

  const toggleChapter = useCallback((chapterName: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterName)
        ? prev.filter((c) => c !== chapterName)
        : [...prev, chapterName]
    );
  }, []);

  const toggleQuestion = useCallback((questionId: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const handleSave = useCallback(() => {
    onSave(localSelectedIds);
    toast.success(`Selected ${localSelectedIds.length} questions`);
    onClose();
  }, [localSelectedIds, onSave, onClose, toast]);

  const handleCancel = useCallback(() => {
    setLocalSelectedIds(selectedIds);
    onClose();
  }, [selectedIds, onClose]);

  const getModalTitle = () => {
    switch (type) {
      case "mcq":
        return "Select MCQs";
      case "short":
        return "Select Short Questions";
      case "long":
        return "Select Long Questions";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          />

          {/* Modal Container */}
          <div 
            className="absolute inset-0 flex items-end sm:items-center justify-center pointer-events-none"
            style={{ zIndex: 99999 }}
          >
            <motion.div
              className="relative w-full max-w-[428px] bg-white rounded-t-[20px] sm:rounded-[20px] max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden mx-auto pointer-events-auto"
              style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1.5 bg-white">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {localSelectedIds.length}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{getModalTitle()}</h2>
                    <p className="text-xs text-gray-500">{questions.length} available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={localSelectedIds.length === 0}
                    className={cn(
                      "h-9 px-3.5 rounded-lg font-semibold text-sm transition-all",
                      localSelectedIds.length > 0
                        ? "bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Select
                  </Button>
                  <button
                    onClick={handleCancel}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="pl-9 h-10 rounded-lg border-gray-200 bg-white text-sm"
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      showFilters
                        ? "bg-[#1E88E5] text-white"
                        : "bg-white border border-gray-200 text-gray-600"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Chips */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pt-3">
                        {filterOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setDifficultyFilter(option.value)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all",
                              difficultyFilter === option.value
                                ? "bg-[#1E88E5] text-white shadow-md shadow-[#1E88E5]/30"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Questions list */}
              <div className="flex-1 overflow-y-auto bg-gray-50/30">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[#1E88E5]/30 border-t-[#1E88E5] rounded-full animate-spin" />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">No questions found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <div className="pb-4">
                    {Object.entries(groupedQuestions).map(([chapterName, chapterQuestions]) => {
                      const filteredChapterQuestions = chapterQuestions.filter((q) =>
                        filteredQuestions.some((fq) => fq.id === q.id)
                      );

                      if (filteredChapterQuestions.length === 0) return null;

                      return (
                        <ChapterAccordion
                          key={chapterName}
                          chapterName={chapterName}
                          chapterNumber={chapterQuestions[0]?.chapterNumber || 0}
                          questionCount={filteredChapterQuestions.length}
                          isExpanded={expandedChapters.includes(chapterName)}
                          onToggle={() => toggleChapter(chapterName)}
                        >
                          {filteredChapterQuestions.map((question) => (
                            <QuestionItem
                              key={question.id}
                              question={question}
                              type={type}
                              isSelected={localSelectedIds.includes(question.id)}
                              onToggle={() => toggleQuestion(question.id)}
                            />
                          ))}
                        </ChapterAccordion>
                      );
                    })}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
