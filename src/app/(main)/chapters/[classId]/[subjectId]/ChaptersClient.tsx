"use client";

/**
 * Chapter Selection Page - Redesigned with consistent styling
 * 
 * Shows chapters for selected subject with multi-select functionality.
 * Fixed bottom button positioned correctly above nav.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckSquare, Square } from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { Breadcrumb, AppLoader } from "@/components/shared";
import { ChapterList, SelectionBar, ProceedButton } from "@/components/chapters";
import { usePaperStore } from "@/stores";
import { getChaptersForSubject, getChapterQuestionCounts } from "@/data";
import { CLASS_IDS } from "@/constants/classes";
import { SUBJECT_NAMES } from "@/constants/subjects";
import { Button } from "@/components/ui/button";

const breadcrumbSteps = [
  { label: "Class", status: "completed" as const },
  { label: "Subject", status: "completed" as const },
  { label: "Chapter", status: "current" as const },
  { label: "Questions", status: "pending" as const },
];

// Helper to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function ChaptersClient() {
  const router = useRouter();
  const params = useParams();
  const {
    selectedClass,
    selectedSubject,
    selectedChapters,
    setClass,
    setSubject,
    toggleChapter,
    selectAllChapters,
    clearChapters,
  } = usePaperStore();

  const classId = params.classId as string;
  const subjectId = params.subjectId as string;
  const subjectName = capitalize(subjectId);

  const [isValidating, setIsValidating] = useState(true);
  const [chapters, setChapters] = useState<Array<{
    id: string;
    number: number;
    name: string;
    mcqCount: number;
    shortCount: number;
    longCount: number;
  }>>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Validate and load data
  useEffect(() => {
    const validateAndLoad = async () => {
      // Validate classId
      if (!CLASS_IDS.includes(classId as any)) {
        router.replace("/home");
        return;
      }

      // Validate subjectId
      if (!SUBJECT_NAMES.includes(subjectName as any)) {
        router.replace("/home");
        return;
      }

      // Sync store with URL if needed
      if (selectedClass !== classId) {
        setClass(classId as "9th" | "10th" | "11th" | "12th");
      }
      if (selectedSubject !== subjectName) {
        setSubject(subjectName as "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Computer" | "English");
      }

      // Load chapters
      const chapterData = getChaptersForSubject(classId, subjectName);
      const counts = getChapterQuestionCounts(classId, subjectName);

      // Combine chapter data with counts
      const chaptersWithCounts = chapterData.map((chapter) => {
        const count = counts.find((c) => c.chapterId === chapter.id);
        return {
          ...chapter,
          mcqCount: count?.mcqCount || 0,
          shortCount: count?.shortCount || 0,
          longCount: count?.longCount || 0,
        };
      });

      setChapters(chaptersWithCounts);

      // Check if all chapters are selected
      const allChapterIds = chaptersWithCounts.map((c) => c.id);
      setIsAllSelected(
        allChapterIds.length > 0 &&
        allChapterIds.every((id) => selectedChapters.includes(id))
      );

      setIsValidating(false);
    };

    validateAndLoad();
  }, [classId, subjectId, selectedClass, selectedSubject, setClass, setSubject, selectedChapters, router]);

  // Update isAllSelected when selectedChapters changes
  useEffect(() => {
    const allChapterIds = chapters.map((c) => c.id);
    setIsAllSelected(
      allChapterIds.length > 0 &&
      allChapterIds.every((id) => selectedChapters.includes(id))
    );
  }, [selectedChapters, chapters]);

  const handleToggle = useCallback((chapterId: string) => {
    toggleChapter(chapterId);
  }, [toggleChapter]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearChapters();
    } else {
      const allChapterIds = chapters.map((c) => c.id);
      selectAllChapters(allChapterIds);
    }
  }, [isAllSelected, chapters, clearChapters, selectAllChapters]);

  const handleClearAll = useCallback(() => {
    clearChapters();
  }, [clearChapters]);

  const handleBack = useCallback(() => {
    clearChapters();
    router.push(`/subjects/${classId}`);
  }, [clearChapters, router, classId]);

  const handleProceed = useCallback(() => {
    if (selectedChapters.length === 0) return;
    router.push("/create-paper");
  }, [selectedChapters, router]);

  if (isValidating) {
    return <AppLoader message="Loading chapters..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainLayout showBottomNav>
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* App Bar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-[428px]">
              <div className="glass-panel border-b border-white/50">
                <div className="px-4 h-14 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-gray-100"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </Button>
                  <h1 className="font-bold text-lg text-gray-900">{subjectName}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-[#1E88E5] hover:bg-[#1E88E5]/10 font-medium"
                  >
                    {isAllSelected ? (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        None
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4 mr-1" />
                        All
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollView className="pt-14 pb-32 flex-1">
            {/* Subject Hero Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden bg-gradient-to-b from-[#1E88E5] to-[#1565C0] rounded-b-[32px] px-6 pt-6 pb-8 text-white mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Class {classId}</p>
                  <h2 className="text-2xl font-bold">{subjectName}</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <span className="text-xl font-bold">{chapters.length}</span>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-white/80 bg-white/10 rounded-xl p-3 border border-white/20">
                <Breadcrumb steps={breadcrumbSteps} className="text-white" variant="hero" />
              </div>
            </motion.div>

            {/* Selection Bar */}
            <div className="px-5 mb-4">
              <SelectionBar
                selectedCount={selectedChapters.length}
                onClearAll={handleClearAll}
              />
            </div>

            {/* Chapter List */}
            <div className="px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <ChapterList
                  chapters={chapters}
                  selectedIds={selectedChapters}
                  onToggle={handleToggle}
                />
              </motion.div>
            </div>
          </ScrollView>

          {/* Proceed Button - Fixed above bottom nav */}
          <ProceedButton
            selectedCount={selectedChapters.length}
            disabled={selectedChapters.length === 0}
            onProceed={handleProceed}
          />
        </div>
      </MainLayout>
    </div>
  );
}
