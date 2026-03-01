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
import { getChaptersForSubject, getChapterQuestionCounts, getRandomQuestions } from "@/data";
import { CLASS_IDS } from "@/constants/classes";
import { SUBJECT_NAMES } from "@/constants/subjects";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/hooks";

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
    selectedMcqIds,
    selectedShortIds,
    selectedLongIds,
    setClass,
    setSubject,
    toggleChapter,
    selectAllChapters,
    clearChapters,
    activeTemplateId,
    selectedTemplate,
    selectedDifficulty,
    selectedHalf,
    setMcqs,
    setShorts,
    setLongs,
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

      // Load chapters (async)
      const [chapterData, counts] = await Promise.all([
        getChaptersForSubject(classId, subjectName),
        getChapterQuestionCounts(classId, subjectName)
      ]);

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

      // Auto-select chapters based on template flow (only for full/half book)
      if (activeTemplateId && selectedTemplate && selectedChapters.length === 0) {
        if (selectedTemplate.category === 'full_book') {
          const allChapterIds = chaptersWithCounts.map((c) => c.id);
          selectAllChapters(allChapterIds);
        } else if (selectedTemplate.category === 'half_book') {
          const allChapterIds = chaptersWithCounts.map((c) => c.id);
          let chapterIdsToSelect = allChapterIds;
          if (selectedHalf === 'first') {
            const halfIndex = Math.ceil(allChapterIds.length / 2);
            chapterIdsToSelect = allChapterIds.slice(0, halfIndex);
          } else if (selectedHalf === 'second') {
            const halfIndex = Math.ceil(allChapterIds.length / 2);
            chapterIdsToSelect = allChapterIds.slice(halfIndex);
          }
          selectAllChapters(chapterIdsToSelect);
        }
      }

      // Check if all chapters are selected
      const allChapterIds = chaptersWithCounts.map((c) => c.id);
      setIsAllSelected(
        allChapterIds.length > 0 &&
        allChapterIds.every((id) => selectedChapters.includes(id))
      );

      setIsValidating(false);
    };

    validateAndLoad();
  }, [classId, subjectId, selectedClass, selectedSubject, selectedHalf, setClass, setSubject, selectedChapters, router]);

  // Update isAllSelected when selectedChapters changes
  useEffect(() => {
    const allChapterIds = chapters.map((c) => c.id);
    setIsAllSelected(
      allChapterIds.length > 0 &&
      allChapterIds.every((id) => selectedChapters.includes(id))
    );
  }, [selectedChapters, chapters]);

  // Auto-select questions when chapters are selected and there's an active template
  useEffect(() => {
    const autoSelectQuestions = async () => {
      if (!activeTemplateId || !selectedTemplate || selectedChapters.length === 0) return;

      const mcqSection = selectedTemplate.sections.find(s => s.type === 'mcq');
      const shortSection = selectedTemplate.sections.find(s => s.type === 'short');
      const longSection = selectedTemplate.sections.find(s => s.type === 'long');

      const targetMcqs = mcqSection?.totalQuestions || 0;
      const targetShorts = shortSection?.totalQuestions || 0;
      const targetLongs = longSection?.totalQuestions || 0;

      // Only trigger if we are under the target counts
      const needsMcqs = targetMcqs > selectedMcqIds.length;
      const needsShorts = targetShorts > selectedShortIds.length;
      const needsLongs = targetLongs > selectedLongIds.length;

      if (!needsMcqs && !needsShorts && !needsLongs) return;

      const difficulty = selectedDifficulty || 'mixed';

      const result = await getRandomQuestions(
        classId as any,
        subjectName as any,
        selectedChapters,
        needsMcqs ? targetMcqs - selectedMcqIds.length : 0,
        needsShorts ? targetShorts - selectedShortIds.length : 0,
        needsLongs ? targetLongs - selectedLongIds.length : 0,
        difficulty
      );

      if (needsMcqs) setMcqs([...selectedMcqIds, ...result.mcqs.map((q: any) => q.id)]);
      if (needsShorts) setShorts([...selectedShortIds, ...result.shorts.map((q: any) => q.id)]);
      if (needsLongs) setLongs([...selectedLongIds, ...result.longs.map((q: any) => q.id)]);
    };

    autoSelectQuestions();
  }, [activeTemplateId, selectedTemplate, selectedChapters, selectedDifficulty, classId, subjectName, selectedMcqIds, selectedShortIds, selectedLongIds, setMcqs, setShorts, setLongs]);

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

  const handleSelectFirstHalf = useCallback(() => {
    if (chapters.length === 0) return;
    const halfIndex = Math.ceil(chapters.length / 2);
    const halfIds = chapters.slice(0, halfIndex).map(c => c.id);
    selectAllChapters(halfIds);
    triggerHaptic('light');
  }, [chapters, selectAllChapters]);

  const handleSelectSecondHalf = useCallback(() => {
    if (chapters.length === 0) return;
    const halfIndex = Math.ceil(chapters.length / 2);
    const halfIds = chapters.slice(halfIndex).map(c => c.id);
    selectAllChapters(halfIds);
    triggerHaptic('light');
  }, [chapters, selectAllChapters]);

  const handleSelectFullBook = useCallback(() => {
    if (chapters.length === 0) return;
    const allIds = chapters.map(c => c.id);
    selectAllChapters(allIds);
    triggerHaptic('medium');
  }, [chapters, selectAllChapters]);

  const handleClearAll = useCallback(() => {
    clearChapters();
  }, [clearChapters]);

  const handleBack = useCallback(() => {
    clearChapters();
    router.push(`/subjects/${classId}`);
  }, [clearChapters, router, classId]);

  const handleProceed = useCallback(async () => {
    if (selectedChapters.length === 0) return;

    triggerHaptic('light');

    // If there's an active template, auto-select questions
    if (activeTemplateId && selectedTemplate) {
      const mcqSection = selectedTemplate.sections.find(s => s.type === 'mcq');
      const shortSection = selectedTemplate.sections.find(s => s.type === 'short');
      const longSection = selectedTemplate.sections.find(s => s.type === 'long');

      const targetMcqs = mcqSection?.totalQuestions || 0;
      const targetShorts = shortSection?.totalQuestions || 0;
      const targetLongs = longSection?.totalQuestions || 0;

      const difficulty = selectedDifficulty || 'mixed';

      if (targetMcqs > 0 || targetShorts > 0 || targetLongs > 0) {
        const result = await getRandomQuestions(
          classId as any,
          subjectName as any,
          selectedChapters,
          targetMcqs,
          targetShorts,
          targetLongs,
          difficulty
        );

        setMcqs(result.mcqs.map((q: any) => q.id));
        setShorts(result.shorts.map((q: any) => q.id));
        setLongs(result.longs.map((q: any) => q.id));
      }
    }

    router.push("/create-paper");
  }, [selectedChapters, activeTemplateId, selectedTemplate, classId, subjectName, setMcqs, setShorts, setLongs, router]);

  if (isValidating) {
    return <AppLoader message="Loading chapters..." />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-primary)' }}>
      <MainLayout showBottomNav topSafe={false}>
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* App Bar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            {/* Safe Area Background */}
            <div className="absolute inset-0 backdrop-blur-xl border-b border-[#2A2A2A]" style={{ backgroundColor: 'var(--background-primary)' }} />

            <div className="mx-auto max-w-[428px] relative pt-safe">
              <div className="px-4 h-14 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-[12px] hover:bg-[#2A2A2A]"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Button>
                <h1 className="font-bold text-lg text-white">{subjectName}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-[#B9FF66] hover:bg-[#B9FF66]/10 font-medium"
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

          {/* Content */}
          <ScrollView
            className="flex-1 pb-32"
            style={{ paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}
          >
            {/* Subject Hero Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-b-[32px] px-6 pt-6 pb-8 text-white mb-6 border border-[#2A2A2A]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#A0A0A0] text-sm font-medium mb-1">Class {classId}</p>
                  <h2 className="text-2xl font-bold">{subjectName}</h2>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#2A2A2A] flex items-center justify-center border border-[#2A2A2A]">
                  <span className="text-xl font-bold text-[#B9FF66]">{chapters.length}</span>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-[#A0A0A0] bg-[#2A2A2A] rounded-xl p-3 border border-[#2A2A2A]">
                <Breadcrumb steps={breadcrumbSteps} className="text-white" variant="hero" />
              </div>
            </motion.div>

            {/* Quick Actions (Full/Half Book) */}
            <div className="px-5 mb-4 grid grid-cols-3 gap-2">
              <button
                onClick={handleSelectFirstHalf}
                className="py-2.5 px-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] active:scale-95 transition-all outline-none rounded-xl text-xs font-semibold text-white border border-[#3A3A3A]"
              >
                1st Half Book
              </button>
              <button
                onClick={handleSelectSecondHalf}
                className="py-2.5 px-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] active:scale-95 transition-all outline-none rounded-xl text-xs font-semibold text-white border border-[#3A3A3A]"
              >
                2nd Half Book
              </button>
              <button
                onClick={handleSelectFullBook}
                className="py-2.5 px-2 bg-[#B9FF66] hover:bg-[#B9FF66]/80 active:scale-95 transition-all outline-none rounded-xl text-xs font-bold text-[#0A0A0A]"
              >
                Full Book
              </button>
            </div>

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
