"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, BookOpen, Clock, FileText, GraduationCap, ChevronRight, Check
} from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { getCustomTemplates, getPredefinedTemplates } from "@/lib/template-store";
import { getChaptersForSubject } from "@/data";
import type { PaperTemplate } from "@/types/template";
import { triggerHaptic } from "@/hooks";
import { cn } from "@/lib/utils";

const CLASS_OPTIONS = [
  { id: '9th', name: '9th', color: '#3B82F6' },
  { id: '10th', name: '10th', color: '#10B981' },
  { id: '11th', name: '11th', color: '#8B5CF6' },
  { id: '12th', name: '12th', color: '#F59E0B' },
];

export default function CreatePaperTemplatesPage() {
  const router = useRouter();
  const {
    selectedClass, selectedSubject, setClass, setSubject,
    applyTemplate, selectedTemplate,
    setMcqs, setShorts, setLongs, selectAllChapters,
    setSelectedDifficulty, setSelectedHalf, selectedHalf,
    setStep, resetFlow
  } = usePaperStore();

  const [selectedClassId, setSelectedClassId] = useState<string>(selectedClass || '9th');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(selectedSubject || 'Physics');
  const [templates, setTemplates] = useState<PaperTemplate[]>([]);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  // Option sheet state
  const [selectedTemplateForOption, setSelectedTemplateForOption] = useState<PaperTemplate | null>(null);
  const [showOptionSheet, setShowOptionSheet] = useState(false);
  const [tempDifficulty, setTempDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

  useEffect(() => {
    const predefined = getPredefinedTemplates(selectedClassId, selectedSubjectId);
    const custom = getCustomTemplates().filter(
      t => t.classId === selectedClassId && t.subject === selectedSubjectId
    );
    setTemplates([...predefined, ...custom]);
  }, [selectedClassId, selectedSubjectId]);

  // Handle class/subject change
  useEffect(() => {
    if (selectedClassId) {
      setClass(selectedClassId as any);
    }
    if (selectedSubjectId) {
      setSubject(selectedSubjectId as any);
    }
  }, [selectedClassId, selectedSubjectId, setClass, setSubject]);

  const handleUseTemplate = useCallback(async (template: PaperTemplate) => {
    triggerHaptic('light');
    setSelectedTemplateForOption(template);
    setShowOptionSheet(true);
  }, []);

  const handleOptionSelect = useCallback(async (mode: 'auto' | 'custom', difficulty?: 'easy' | 'medium' | 'hard' | 'mixed') => {
    if (!selectedTemplateForOption) return;

    triggerHaptic('medium');
    applyTemplate(selectedTemplateForOption);

    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }

    const chapters = await getChaptersForSubject(selectedClassId, selectedSubjectId);
    const allChapterIds = chapters.map(c => c.id);

    let chapterIdsToUse = allChapterIds;

    // Handle half book
    if (selectedTemplateForOption.category === 'half_book' && mode === 'custom') {
      // Show half selector first
      setShowOptionSheet(false);
      // For custom mode with half book, we'll handle chapters
      const halfIndex = Math.ceil(allChapterIds.length / 2);
      if (selectedHalf === 'first') {
        chapterIdsToUse = allChapterIds.slice(0, halfIndex);
      } else if (selectedHalf === 'second') {
        chapterIdsToUse = allChapterIds.slice(halfIndex);
      }
    }

    if (mode === 'auto') {
      // Auto generate - go directly to questions with auto-selected questions
      selectAllChapters(chapterIdsToUse);
      setStep('questions');
      router.push('/create-paper/questions');
    } else {
      // Custom - go to chapters first
      if (selectedTemplateForOption.category === 'full_book') {
        selectAllChapters(chapterIdsToUse);
        setStep('questions');
        router.push('/create-paper/questions');
      } else if (selectedTemplateForOption.category === 'half_book') {
        selectAllChapters(chapterIdsToUse);
        setStep('questions');
        router.push('/create-paper/questions');
      } else {
        // chapter_wise or multi_chapter - go to chapters
        setStep('chapters');
        router.push('/create-paper/chapters');
      }
    }

    setShowOptionSheet(false);
    setSelectedTemplateForOption(null);
  }, [selectedTemplateForOption, applyTemplate, selectedClassId, selectedSubjectId, selectedHalf, selectAllChapters, setStep, router]);

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'full_book': return <BookOpen className="w-5 h-5" />;
      case 'half_book': return <FileText className="w-5 h-5" />;
      case 'chapter_wise': return <GraduationCap className="w-5 h-5" />;
      case 'multi_chapter': return <Sparkles className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTemplateDescription = (template: PaperTemplate) => {
    const mcq = template.sections.find(s => s.type === 'mcq');
    const short = template.sections.find(s => s.type === 'short');
    const long = template.sections.find(s => s.type === 'long');
    
    const parts = [];
    if (mcq) parts.push(`${mcq.totalQuestions} MCQs`);
    if (short) parts.push(`${short.totalQuestions} Short`);
    if (long) parts.push(`${long.totalQuestions} Long`);
    
    return parts.join(' • ');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-xl font-bold text-white">Create Paper</h1>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span className="text-[#B9FF66]">Templates</span>
                <ChevronRight className="w-3 h-3" />
                <span>Chapters</span>
                <ChevronRight className="w-3 h-3" />
                <span>Questions</span>
                <ChevronRight className="w-3 h-3" />
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
                <span>Preview</span>
              </div>
            </div>
            
            {/* Class & Subject Selectors */}
            <div className="flex items-center gap-3 mt-4">
              {/* Class Selector */}
              <button
                onClick={() => setShowClassSelector(!showClassSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#B9FF66]/30 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#3B82F6]">{selectedClassId}</span>
                </div>
                <span className="text-sm font-medium text-white">{selectedClassId}</span>
              </button>

              {/* Subject Selector */}
              <button
                onClick={() => setShowSubjectSelector(!showSubjectSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#B9FF66]/30 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#10B981]">{selectedSubjectId[0]}</span>
                </div>
                <span className="text-sm font-medium text-white">{selectedSubjectId}</span>
              </button>
            </div>

            {/* Class Dropdown */}
            <AnimatePresence>
              {showClassSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-4 top-32 w-48 bg-[#1A1A1A] rounded-xl border border-white/10 shadow-xl overflow-hidden z-50"
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setShowClassSelector(false);
                        triggerHaptic('light');
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors",
                        selectedClassId === cls.id && "bg-[#B9FF66]/10"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cls.color}20` }}>
                        <span className="text-sm font-bold" style={{ color: cls.color }}>{cls.name}</span>
                      </div>
                      {selectedClassId === cls.id && <Check className="w-4 h-4 text-[#B9FF66] ml-auto" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject Dropdown */}
            <AnimatePresence>
              {showSubjectSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-36 top-32 w-56 bg-[#1A1A1A] rounded-xl border border-white/10 shadow-xl overflow-hidden z-50"
                >
                  {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Urdu', 'PakStudies', 'Islamiat'].map((subj) => (
                    <button
                      key={subj}
                      onClick={() => {
                        setSelectedSubjectId(subj);
                        setShowSubjectSelector(false);
                        triggerHaptic('light');
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors",
                        selectedSubjectId === subj && "bg-[#B9FF66]/10"
                      )}
                    >
                      <span className="text-sm font-medium text-white">{subj}</span>
                      {selectedSubjectId === subj && <Check className="w-4 h-4 text-[#B9FF66] ml-auto" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#1A1A1A] rounded-2xl border border-white/5 p-5 hover:border-[#B9FF66]/30 transition-all cursor-pointer group"
                onClick={() => handleUseTemplate(template)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    template.category === 'full_book' && "bg-[#3B82F6]/10 text-[#3B82F6]",
                    template.category === 'half_book' && "bg-[#10B981]/10 text-[#10B981]",
                    template.category === 'chapter_wise' && "bg-[#8B5CF6]/10 text-[#8B5CF6]",
                    template.category === 'multi_chapter' && "bg-[#F59E0B]/10 text-[#F59E0B]"
                  )}>
                    {getTemplateIcon(template.category)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#B9FF66] text-[#0A0A0A] text-sm font-bold hover:bg-[#a3e659] transition-colors"
                  >
                    Use
                  </button>
                </div>
                
                <h3 className="text-white font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-[#6B7280] text-sm mb-3">{template.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.timeAllowed}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {getTemplateDescription(template)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Option Sheet Modal */}
        <AnimatePresence>
          {showOptionSheet && selectedTemplateForOption && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowOptionSheet(false)}
              />
              <motion.div
                className="relative bg-[#1A1A1A] rounded-t-[24px] w-full max-w-lg p-6 border-t border-white/10"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="w-12 h-1.5 rounded-full bg-[#2A2A2A] mx-auto mb-6" />
                
                <h3 className="text-white font-bold text-xl text-center mb-6">
                  {selectedTemplateForOption.name}
                </h3>

                {/* Auto Generate Option */}
                <button
                  onClick={() => handleOptionSelect('auto', tempDifficulty)}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#B9FF66] mb-3 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-white font-bold">Auto Generate</span>
                      <span className="text-xs text-white/70">Automatically select questions</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Difficulty Selection for Auto */}
                <div className="flex gap-2 mb-6">
                  {(['easy', 'medium', 'hard', 'mixed'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setTempDifficulty(diff)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                        tempDifficulty === diff && diff === 'easy' && "bg-green-500/20 text-green-400 border border-green-500/30",
                        tempDifficulty === diff && diff === 'medium' && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        tempDifficulty === diff && diff === 'hard' && "bg-red-500/20 text-red-400 border border-red-500/30",
                        tempDifficulty === diff && diff === 'mixed' && "bg-[#B9FF66]/20 text-[#B9FF66] border border-[#B9FF66]/30",
                        tempDifficulty !== diff && "bg-white/5 text-[#6B7280] border border-white/10"
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                {/* Customize Option */}
                <button
                  onClick={() => handleOptionSelect('custom')}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#B9FF66]/30 mb-3 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-white font-bold">Customize</span>
                      <span className="text-xs text-[#6B7280]">Select your own questions</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setShowOptionSheet(false)}
                  className="w-full py-3 mt-2 text-sm text-[#6B7280] font-medium hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
