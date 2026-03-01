"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Sparkles, BookOpen, Clock, FileText,
  Trash2, Edit3, ChevronRight, X, Check, GraduationCap
} from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { getCustomTemplates, deleteCustomTemplate, getPredefinedTemplates, getChapterIndicesForHalf } from "@/lib/template-store";
import { getChaptersForSubject } from "@/data";
import { SUBJECTS } from "@/constants/subjects";
import type { PaperTemplate } from "@/types/template";
import { triggerHaptic } from "@/hooks";
import { HalfBookSelector } from "@/components/paper/HalfBookSelector";
import { CreateModeSelector } from "@/components/paper/CreateModeSelector";
import { AIGeneratingScreen } from "@/components/paper/AIGeneratingScreen";

const CLASS_OPTIONS = [
  { id: '9th', name: '9th', color: '#3B82F6' },
  { id: '10th', name: '10th', color: '#10B981' },
  { id: '11th', name: '11th', color: '#8B5CF6' },
  { id: '12th', name: '12th', color: '#F59E0B' },
];

export default function TemplatesPage() {
  const router = useRouter();
  const {
    selectedClass, selectedSubject, setClass, setSubject,
    applyTemplate, activeTemplateId, selectedTemplate,
    setMcqs, setShorts, setLongs, selectAllChapters, toggleChapter,
    updateSettings, setSelectedDifficulty, setSelectedHalf, selectedHalf
  } = usePaperStore();

  const [selectedClassId, setSelectedClassId] = useState<string>(selectedClass || '9th');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(selectedSubject || 'Physics');
  const [templates, setTemplates] = useState<PaperTemplate[]>([]);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // New flow states
  const [showHalfBookSelector, setShowHalfBookSelector] = useState(false);
  const [showCreateModeSelector, setShowCreateModeSelector] = useState(false);
  const [showAIGenerating, setShowAIGenerating] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<PaperTemplate | null>(null);
  const [tempDifficulty, setTempDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [totalChapters, setTotalChapters] = useState(10);
  const [generateChapterIds, setGenerateChapterIds] = useState<string[]>([]);

  useEffect(() => {
    const predefined = getPredefinedTemplates(selectedClassId, selectedSubjectId);
    const custom = getCustomTemplates().filter(
      t => t.classId === selectedClassId && t.subject === selectedSubjectId
    );
    setTemplates([...predefined, ...custom]);
  }, [selectedClassId, selectedSubjectId]);

  const handleTemplateClick = useCallback(async (template: PaperTemplate) => {
    triggerHaptic('light');
    setPendingTemplate(template);

    // Check template category
    if (template.category === 'half_book') {
      // Fetch actual chapter count for this class/subject
      const chapters = await getChaptersForSubject(selectedClassId, selectedSubjectId);
      setTotalChapters(chapters.length);
      setShowHalfBookSelector(true);
    } else if (template.category === 'chapter_wise' || template.category === 'multi_chapter') {
      // For chapter wise and multi-chapter templates, go to chapters page for manual mode
      // Apply template and navigate to chapters
      applyTemplate(template);
      router.push(`/chapters/${selectedClassId}/${selectedSubjectId.toLowerCase()}`);
    } else {
      // For full_book template, go to create mode selector (Auto mode will use all chapters)
      setShowCreateModeSelector(true);
    }
  }, [selectedClassId, selectedSubjectId, applyTemplate, router]);

  const handleHalfSelect = useCallback((half: 'first' | 'second') => {
    setSelectedHalf(half);
    setShowHalfBookSelector(false);
    setShowCreateModeSelector(true);
  }, [setSelectedHalf]);

  const handleModeSelect = useCallback(async (mode: 'manual' | 'auto', difficulty?: 'easy' | 'medium' | 'hard' | 'mixed') => {
    if (!pendingTemplate) return;

    applyTemplate(pendingTemplate);
    triggerHaptic('medium');

    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }

    // Get all chapters for this class/subject
    const chapters = await getChaptersForSubject(selectedClassId, selectedSubjectId);
    const allChapterIds = chapters.map((c) => c.id);

    // Determine which chapters to use based on template type
    let chapterIdsToUse = allChapterIds;
    if (pendingTemplate.category === 'half_book' && selectedHalf) {
      const halfIndex = Math.ceil(allChapterIds.length / 2);
      if (selectedHalf === 'first') {
        chapterIdsToUse = allChapterIds.slice(0, halfIndex);
      } else {
        chapterIdsToUse = allChapterIds.slice(halfIndex);
      }
    }

    if (mode === 'manual') {
      // For manual mode: set chapters and go to create paper directly
      // Import the store action here or use applyTemplate's chapter handling
      const { selectAllChapters } = usePaperStore.getState();
      selectAllChapters(chapterIdsToUse);
      router.push('/create-paper');
    } else {
      // AI: Show generating screen with real question selection
      setGenerateChapterIds(chapterIdsToUse);
      setShowCreateModeSelector(false);
      setShowAIGenerating(true);
    }
  }, [pendingTemplate, applyTemplate, router, selectedClassId, selectedSubjectId, selectedHalf]);

  const handleAIGenerateComplete = useCallback(() => {
    setShowAIGenerating(false);
    // Navigate directly to create paper for a seamless experience
    router.push('/create-paper');
  }, [router]);

  const handleApplyTemplate = useCallback((template: PaperTemplate) => {
    handleTemplateClick(template);
  }, [handleTemplateClick]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    deleteCustomTemplate(templateId);
    setShowDeleteConfirm(null);
    const predefined = getPredefinedTemplates(selectedClassId, selectedSubjectId);
    const custom = getCustomTemplates().filter(
      t => t.classId === selectedClassId && t.subject === selectedSubjectId
    );
    setTemplates([...predefined, ...custom]);
  }, [selectedClassId, selectedSubjectId]);

  const getQuestionCounts = (template: PaperTemplate) => {
    const mcq = template.sections.find(s => s.type === 'mcq');
    const short = template.sections.find(s => s.type === 'short');
    const long = template.sections.find(s => s.type === 'long');
    return {
      mcq: mcq?.totalQuestions || 0,
      short: short?.totalQuestions || 0,
      long: long?.totalQuestions || 0,
    };
  };

  return (
    <MainLayout showBottomNav headerTitle="Templates" className="bg-[#0A0A0A]">
      <ScrollView className="flex-1 pb-24">
        <div className="mx-auto max-w-[428px]">
          {/* Active Template Banner */}
          {activeTemplateId && selectedTemplate && (
            <div className="px-4 pt-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#B9FF66]/10 border border-[#B9FF66]/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#B9FF66]/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#B9FF66]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{selectedTemplate.name}</p>
                      <p className="text-[10px] text-[#B9FF66]">Active</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/chapters/${selectedClassId}/${selectedSubjectId.toLowerCase()}`)}
                    className="px-3 py-1.5 bg-[#B9FF66] text-[#0A0A0A] text-xs font-medium rounded-lg group relative overflow-hidden"
                  >
                    <span className="relative z-10">Continue</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Class & Subject Selection Pills */}
          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={() => setShowClassSelector(true)}
              className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] py-2.5 px-3 flex items-center justify-between hover:border-[#B9FF66]/30"
            >
              <span className="text-sm text-white">{selectedClassId}</span>
              <ChevronRight className="w-3 h-3 text-[#6B7280]" />
            </button>
            <button
              onClick={() => setShowSubjectSelector(true)}
              className="flex-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] py-2.5 px-3 flex items-center justify-between hover:border-[#B9FF66]/30"
            >
              <span className="text-sm text-white">{selectedSubjectId}</span>
              <ChevronRight className="w-3 h-3 text-[#6B7280]" />
            </button>
          </div>

          {/* Templates Grid */}
          <div className="px-4">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-[#2A2A2A] mx-auto mb-3" />
                <p className="text-[#6B7280] text-sm">No templates</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template, index) => {
                  const counts = getQuestionCounts(template);
                  const isActiveTemplate = activeTemplateId === template.id;

                  return (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleTemplateClick(template)}
                      className={`bg-[#1A1A1A] rounded-lg p-4 border text-left transition-all active:scale-[0.98] ${isActiveTemplate
                        ? 'border-[#B9FF66]/50 shadow-[0_0_20px_rgba(185,255,102,0.1)]'
                        : 'border-[#2A2A2A] hover:border-[#B9FF66]/30'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                            {template.type === 'custom' && (
                              <span className="px-1.5 py-0.5 bg-[#B9FF66]/20 text-[#B9FF66] text-[9px] rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#9CA3AF]">{template.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#B9FF66]">{template.totalMarks}</p>
                          <p className="text-[9px] text-[#9CA3AF]">marks</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-[#B9FF66]/10 rounded text-[10px] text-[#B9FF66] font-medium">
                          {counts.mcq} MCQ
                        </span>
                        <span className="px-2 py-1 bg-emerald-500/10 rounded text-[10px] text-emerald-400 font-medium">
                          {counts.short} Short
                        </span>
                        <span className="px-2 py-1 bg-violet-500/10 rounded text-[10px] text-violet-400 font-medium">
                          {counts.long} Long
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-[9px] text-[#9CA3AF]">
                          <Clock className="w-3 h-3" />
                          {template.timeAllowed}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateClick(template);
                          }}
                          className={`flex-1 h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 group relative overflow-hidden ${isActiveTemplate
                            ? 'bg-[#B9FF66]/20 text-[#B9FF66]'
                            : 'bg-[#B9FF66] text-[#0A0A0A]'
                            }`}
                        >
                          <span className="relative z-10">
                          {isActiveTemplate ? (
                            <>
                              <Check className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              Use
                            </>
                          )}
                          </span>
                          {!isActiveTemplate && (
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                          )}
                        </button>
                        {template.type === 'custom' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement edit template
                                alert('Edit template coming soon!');
                              }}
                              className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center"
                            >
                              <Edit3 className="w-3 h-3 text-[#9CA3AF]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(template.id);
                              }}
                              className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => router.push(`/templates?class=${selectedClassId}&subject=${selectedSubjectId.toLowerCase()}`)}
              className="w-full mt-3 bg-[#1A1A1A] rounded-lg border border-dashed border-[#2A2A2A] py-3 flex items-center justify-center gap-2 hover:border-[#B9FF66]/30"
            >
              <Plus className="w-4 h-4 text-[#B9FF66]" />
              <span className="text-sm text-[#B9FF66]">Create Custom Template</span>
            </button>
          </div>
        </div>
      </ScrollView>

      {/* Class Selector Modal */}
      <AnimatePresence>
        {showClassSelector && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClassSelector(false)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-xl max-h-[60vh] overflow-hidden border-t border-[#2A2A2A]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
            >
              <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Select Class</h3>
                <button onClick={() => setShowClassSelector(false)} className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {CLASS_OPTIONS.map((cls) => (
                  <motion.button
                    key={cls.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedClassId(cls.id);
                      setClass(cls.id as any);
                      setShowClassSelector(false);
                    }}
                    className="w-full flex items-center gap-3 bg-[#2A2A2A] rounded-lg p-3 transition-colors active:bg-[#3A3A3A]"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cls.color}20` }}
                    >
                      <GraduationCap className="w-5 h-5" style={{ color: cls.color }} />
                    </div>
                    <span className="font-medium text-white flex-1 text-left">Class {cls.name}</span>
                    {selectedClassId === cls.id && <Check className="w-4 h-4 text-[#B9FF66]" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Selector Modal */}
      <AnimatePresence>
        {showSubjectSelector && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubjectSelector(false)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-xl max-h-[60vh] overflow-hidden border-t border-[#2A2A2A]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
            >
              <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Select Subject</h3>
                <button onClick={() => setShowSubjectSelector(false)} className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                {SUBJECTS.map((subject) => (
                  <motion.button
                    key={subject.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedSubjectId(subject.name);
                      setSubject(subject.name as any);
                      setShowSubjectSelector(false);
                    }}
                    className="w-full flex items-center gap-3 bg-[#2A2A2A] rounded-lg p-3 transition-colors active:bg-[#3A3A3A]"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
                    </div>
                    <span className="font-medium text-white flex-1 text-left">{subject.name}</span>
                    {selectedSubjectId === subject.name && <Check className="w-4 h-4 text-[#B9FF66]" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeleteConfirm(null)} />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1A1A] rounded-lg p-5 w-full max-w-[300px] mx-4 border border-[#2A2A2A]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-base font-bold text-white mb-2">Delete Template?</h3>
              <p className="text-xs text-[#9CA3AF] mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="flex-1 h-9 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteTemplate(showDeleteConfirm)}
                  className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Half Book Selector */}
      <HalfBookSelector
        isOpen={showHalfBookSelector}
        onClose={() => setShowHalfBookSelector(false)}
        onSelectHalf={handleHalfSelect}
        totalChapters={totalChapters}
      />

      {/* Create Mode Selector */}
      <CreateModeSelector
        isOpen={showCreateModeSelector}
        onClose={() => setShowCreateModeSelector(false)}
        onSelectMode={handleModeSelect}
        templateName={pendingTemplate?.name || ''}
      />

      {/* AI Generating Screen */}
      <AIGeneratingScreen
        isVisible={showAIGenerating}
        onComplete={handleAIGenerateComplete}
        minDuration={4000}
        template={pendingTemplate}
        difficulty={tempDifficulty}
        classId={selectedClassId}
        subject={selectedSubjectId}
        chapterIds={generateChapterIds}
      />
    </MainLayout>
  );
}
