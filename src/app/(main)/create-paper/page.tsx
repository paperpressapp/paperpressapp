"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, RotateCcw, Sparkles, BookOpen, Layers, Crown,
  Check, ChevronDown, X, Trash2, Eye, Edit3, Calculator,
  Wand2, Image, MapPin, Phone, Mail, Globe, Minus, Plus,
  Upload, FileText, ToggleLeft, ToggleRight, GripVertical, Search
} from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { ConfirmDialog, AppLoader } from "@/components/shared";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast, triggerHaptic } from "@/hooks";
import { usePaperStore, useAuthStore } from "@/stores";
import { getAvailableQuestionCounts, getRandomQuestions, getQuestionsByIds, getMcqsByChapterIds, getShortsByChapterIds, getLongsByChapterIds, getSubjectData } from "@/data";
import { getPattern } from "@/lib/pdf/patterns";
import { savePaper } from "@/lib/storage/papers";
import { generatePaperId } from "@/lib/utils/id";
import { canGeneratePaper, incrementPaperUsage, checkPremiumStatus } from "@/lib/premium";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion, Difficulty, ClassName, SubjectName } from "@/types";
import { VirtualQuestionList, LivePaperPreview, ReorderQuestions } from "@/components/paper";

interface Chapter {
  id: string;
  name: string;
  number: number;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export default function CreatePaperPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isPremium: authPremium } = useAuthStore();
  const {
    selectedClass, selectedSubject, selectedChapters, paperSettings,
    selectedMcqIds, selectedShortIds, selectedLongIds,
    setMcqs, setShorts, setLongs, updateSettings, resetQuestions,
    activeTemplateId, selectedTemplate, clearActiveTemplate,
    editedQuestions, editQuestion, questionOrder, setQuestionOrder, _hasHydrated
  } = usePaperStore();

  // Preview State

  // Edit State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingOptions, setEditingOptions] = useState<string[]>([]);

  // State
  const [isValidating, setIsValidating] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Creating paper...");
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, remaining: 0 });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  // Logo upload ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Bubble sheet state
  const [includeBubbleSheet, setIncludeBubbleSheet] = useState(false);

  // Font size state - sync with store settings
  const [fontSize, setFontSize] = useState(paperSettings.fontSize || 12);

  // Sync fontSize from store when it changes (e.g., after hydration)
  useEffect(() => {
    if (paperSettings.fontSize && paperSettings.fontSize !== fontSize) {
      setFontSize(paperSettings.fontSize);
    }
  }, [paperSettings.fontSize]);

  // Question data
  const [allMcqs, setAllMcqs] = useState<MCQQuestion[]>([]);
  const [allShorts, setAllShorts] = useState<ShortQuestion[]>([]);
  const [allLongs, setAllLongs] = useState<LongQuestion[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [availableCounts, setAvailableCounts] = useState({ mcqs: 0, shorts: 0, longs: 0 });

  // UI State
  const [activeTab, setActiveTab] = useState<"mcq" | "short" | "long">("mcq");
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandingReorder, setExpandingReorder] = useState<'mcq' | 'short' | 'long' | null>(null);

  // Open question picker with chapters collapsed by default
  const openQuestionPicker = useCallback(async (tab: "mcq" | "short" | "long") => {
    setActiveTab(tab);
    setSearchQuery("");
    setDifficultyFilter("all");
    
    // Ensure questions are loaded before showing picker
    if (selectedClass && selectedSubject && selectedChapters.length > 0) {
      if (allMcqs.length === 0 && allShorts.length === 0 && allLongs.length === 0) {
        setIsLoadingQuestions(true);
        try {
          const [mcqs, shorts, longs] = await Promise.all([
            getMcqsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters),
            getShortsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters),
            getLongsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters)
          ]);
          setAllMcqs(mcqs);
          setAllShorts(shorts);
          setAllLongs(longs);
          setAvailableCounts({ mcqs: mcqs.length, shorts: shorts.length, longs: longs.length });
          
          // Also load chapter details
          const subjectData = await getSubjectData(selectedClass as ClassName, selectedSubject as SubjectName);
          if (subjectData) {
            const chaptersData: Chapter[] = subjectData.chapters
              .filter(ch => selectedChapters.includes(ch.id))
              .map(ch => ({ id: ch.id, name: ch.name, number: ch.number }));
            setChapters(chaptersData);
          }
        } catch (error) {
          console.error("Failed to load questions:", error);
          toast.error("Failed to load questions");
        } finally {
          setIsLoadingQuestions(false);
        }
      }
    }
    
    // Start with first chapter expanded to show questions immediately
    if (selectedChapters.length > 0) {
      setExpandedChapters(new Set([selectedChapters[0]]));
    } else {
      setExpandedChapters(new Set());
    }
    
    setShowQuestionPicker(true);
  }, [selectedClass, selectedSubject, selectedChapters, allMcqs.length, allShorts.length, allLongs.length, toast]);

  // Custom marks config
  const [customMcqMarks, setCustomMcqMarks] = useState(1);
  const [customShortMarks, setCustomShortMarks] = useState(2);
  const [customLongMarks, setCustomLongMarks] = useState(5);

  // Logo upload handler
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      updateSettings({ instituteLogo: base64 });
    };
    reader.readAsDataURL(file);
  }, [toast, updateSettings]);

  // Bubble sheet toggle handler
  const handleBubbleSheetToggle = useCallback(() => {
    setIncludeBubbleSheet(prev => !prev);
  }, []);

  // Get pattern
  const pattern = useMemo(() => {
    if (!selectedClass || !selectedSubject) return null;
    return getPattern(selectedClass, selectedSubject);
  }, [selectedClass, selectedSubject]);

  // Calculate totals
  const totalQuestions = selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length;

  // Calculate marks respecting attempt rules from pattern
  const shortAttemptTotal = pattern?.sections
    .filter(s => s.type === 'short')
    .reduce((sum, s) => sum + s.attemptCount, 0) || selectedShortIds.length;
  const longAttemptTotal = pattern?.sections
    .filter(s => s.type === 'long')
    .reduce((sum, s) => sum + s.attemptCount, 0) || selectedLongIds.length;

  const totalMarks = (selectedMcqIds.length * customMcqMarks) +
    (Math.min(selectedShortIds.length, shortAttemptTotal) * customShortMarks) +
    (Math.min(selectedLongIds.length, longAttemptTotal) * customLongMarks);

  const hasUnsavedChanges = selectedMcqIds.length > 0 || selectedShortIds.length > 0 || selectedLongIds.length > 0;

  const loadQuestions = useCallback(async () => {
    if (!selectedClass || !selectedSubject || selectedChapters.length === 0) return;

    // Get all questions from selected chapters (async)
    const [mcqs, shorts, longs] = await Promise.all([
      getMcqsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters),
      getShortsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters),
      getLongsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters)
    ]);

    setAllMcqs(mcqs);
    setAllShorts(shorts);
    setAllLongs(longs);
    setAvailableCounts({ mcqs: mcqs.length, shorts: shorts.length, longs: longs.length });

    // Get chapter details from subject data (async)
    const subjectData = await getSubjectData(selectedClass as ClassName, selectedSubject as SubjectName);
    if (subjectData) {
      const chaptersData: Chapter[] = subjectData.chapters
        .filter(ch => selectedChapters.includes(ch.id))
        .map(ch => ({
          id: ch.id,
          name: ch.name,
          number: ch.number
        }));
      setChapters(chaptersData);
    }
  }, [selectedClass, selectedSubject, selectedChapters]);

  // Initialize
  useEffect(() => {
    const status = checkPremiumStatus();
    const paperCheck = canGeneratePaper();
    setPremiumStatus({ isPremium: status.isPremium, remaining: paperCheck.remaining });
  }, []);

  // Load data - with hydration handling
  useEffect(() => {
    // Wait for store to hydrate
    if (!_hasHydrated) return;

    const initialize = async () => {
      try {
        if (!selectedClass || !selectedSubject) {
          router.replace("/home");
          return;
        }

        // Initialize settings
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

        // Load questions (async) - only if chapters are selected
        if (selectedChapters.length > 0) {
          try {
            const [mcqs, shorts, longs] = await Promise.all([
              getMcqsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters),
              getShortsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters),
              getLongsByChapterIds(selectedClass as ClassName, selectedSubject as SubjectName, selectedChapters)
            ]);

            setAllMcqs(mcqs);
            setAllShorts(shorts);
            setAllLongs(longs);
            setAvailableCounts({ mcqs: mcqs.length, shorts: shorts.length, longs: longs.length });

            // Get chapter details
            const subjectData = await getSubjectData(selectedClass as ClassName, selectedSubject as SubjectName);
            if (subjectData) {
              const chaptersData: Chapter[] = subjectData.chapters
                .filter(ch => selectedChapters.includes(ch.id))
                .map(ch => ({ id: ch.id, name: ch.name, number: ch.number }));
              setChapters(chaptersData);
            }
          } catch (err) {
            console.error("Error loading questions:", err);
          }
        }

        // Apply marks from template or pattern
        if (paperSettings.customMarks) {
          // Use marks from template
          setCustomMcqMarks(paperSettings.customMarks.mcq || 1);
          setCustomShortMarks(paperSettings.customMarks.short || 2);
          setCustomLongMarks(paperSettings.customMarks.long || 5);
        } else if (pattern) {
          // Use marks from default pattern
          const mcqSection = pattern.sections.find(s => s.type === 'mcq');
          const shortSections = pattern.sections.filter(s => s.type === 'short');
          const longSections = pattern.sections.filter(s => s.type === 'long');
          setCustomMcqMarks(mcqSection?.marksPerQuestion || 1);
          setCustomShortMarks(shortSections[0]?.marksPerQuestion || 2);
          setCustomLongMarks(longSections[0]?.marksPerQuestion || 5);
        }

        setIsValidating(false);
      } catch (error) {
        console.error("Error initializing create paper page:", error);
        setIsValidating(false);
      }
    };

    initialize();
  }, [_hasHydrated, selectedClass, selectedSubject, selectedChapters, router]);

  // Auto-fill
  const handleAutoFill = useCallback(async (difficulty: DifficultyLevel) => {
    if (!selectedClass || !selectedSubject) return;

    try {
      const targetMcqs = pattern?.sections.find(s => s.type === 'mcq')?.totalQuestions || 15;
      const targetShorts = pattern?.sections.filter(s => s.type === 'short').reduce((sum, s) => sum + s.totalQuestions, 0) || 10;
      const targetLongs = pattern?.sections.filter(s => s.type === 'long').reduce((sum, s) => sum + s.totalQuestions, 0) || 3;

      const result = await getRandomQuestions(
        selectedClass as ClassName,
        selectedSubject as SubjectName,
        selectedChapters,
        targetMcqs,
        targetShorts,
        targetLongs,
        difficulty
      );

      const newMcqIds = result.mcqs.map((q: MCQQuestion) => q.id);
      const newShortIds = result.shorts.map((q: ShortQuestion) => q.id);
      const newLongIds = result.longs.map((q: LongQuestion) => q.id);

      setMcqs(newMcqIds);
      setShorts(newShortIds);
      setLongs(newLongIds);

      // Load question data for display
      if (result.mcqs.length > 0) {
        setAllMcqs(result.mcqs);
        setAvailableCounts(prev => ({ ...prev, mcqs: result.mcqs.length }));
      }
      if (result.shorts.length > 0) {
        setAllShorts(result.shorts);
        setAvailableCounts(prev => ({ ...prev, shorts: result.shorts.length }));
      }
      if (result.longs.length > 0) {
        setAllLongs(result.longs);
        setAvailableCounts(prev => ({ ...prev, longs: result.longs.length }));
      }

      // Load chapter details if not already loaded
      if (selectedChapters.length > 0) {
        const subjectData = await getSubjectData(selectedClass as ClassName, selectedSubject as SubjectName);
        if (subjectData) {
          const chaptersData: Chapter[] = subjectData.chapters
            .filter(ch => selectedChapters.includes(ch.id))
            .map(ch => ({ id: ch.id, name: ch.name, number: ch.number }));
          setChapters(chaptersData);
        }
      }

      toast.success(`Auto-filled with ${difficulty} questions`);
    } catch (error) {
      console.error("Error in auto-fill:", error);
      toast.error("Failed to auto-select questions. Please try again.");
    }
  }, [selectedClass, selectedSubject, selectedChapters, pattern, setMcqs, setShorts, setLongs, toast]);

  // Add custom question handler
  const handleAddCustom = useCallback(() => {
    triggerHaptic('medium');
    const customId = `custom_${activeTab}_${Date.now()}`;
    const placeholder = activeTab === 'mcq'
      ? "Enter your custom MCQ question text here..."
      : "Enter your custom question text here...";

    // Add to selection
    if (activeTab === 'mcq') setMcqs([...selectedMcqIds, customId]);
    else if (activeTab === 'short') setShorts([...selectedShortIds, customId]);
    else setLongs([...selectedLongIds, customId]);

    // Initialize edited questions with placeholder
    editQuestion(customId, {
      questionText: placeholder,
      options: activeTab === 'mcq' ? ["Option 1", "Option 2", "Option 3", "Option 4"] : undefined,
      difficulty: 'medium',
      chapterNumber: 0
    });

    // Expand custom chapter to show the new question
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      newSet.add('custom');
      return newSet;
    });

    // Open editor for this new question
    setEditingText(placeholder);
    setEditingOptions(activeTab === 'mcq' ? ["Option 1", "Option 2", "Option 3", "Option 4"] : []);
    setEditingQuestionId(customId);

    toast.success(`Custom ${activeTab.toUpperCase()} added - Edit it below`);
  }, [activeTab, selectedMcqIds, selectedShortIds, selectedLongIds, setMcqs, setShorts, setLongs, editQuestion, toast]);

  // Current questions based on tab
  const currentQuestions = useMemo(() => {
    switch (activeTab) {
      case "mcq": return allMcqs;
      case "short": return allShorts;
      case "long": return allLongs;
    }
  }, [activeTab, allMcqs, allShorts, allLongs]);

  const currentSelectedIds = useMemo(() => {
    switch (activeTab) {
      case "mcq": return selectedMcqIds;
      case "short": return selectedShortIds;
      case "long": return selectedLongIds;
    }
  }, [activeTab, selectedMcqIds, selectedShortIds, selectedLongIds]);

  // Group questions by chapter
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof currentQuestions> = {};
    chapters.forEach(ch => { groups[ch.id] = []; });
    currentQuestions.forEach(q => {
      const parts = q.id.split("_");
      const chapterId = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : `ch_${q.chapterNumber || 1}`;
      if (!groups[chapterId]) groups[chapterId] = [];
      groups[chapterId].push(q);
    });
    return groups;
  }, [currentQuestions, chapters, selectedMcqIds, selectedShortIds, selectedLongIds, editedQuestions, activeTab, paperSettings.customMarks]);

  // Get custom questions that are selected but not in repo
  const customQuestionsForPicker = useMemo(() => {
    let customIds: string[] = [];
    if (activeTab === 'mcq') {
      customIds = selectedMcqIds.filter((id): id is string => typeof id === 'string' && id.startsWith('custom_'));
    } else if (activeTab === 'short') {
      customIds = selectedShortIds.filter((id): id is string => typeof id === 'string' && id.startsWith('custom_'));
    } else {
      customIds = selectedLongIds.filter((id): id is string => typeof id === 'string' && id.startsWith('custom_'));
    }
    return customIds.map(id => {
      if (activeTab === 'mcq') {
        return {
          id,
          questionText: editedQuestions[id]?.questionText || "Custom MCQ",
          options: editedQuestions[id]?.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
          difficulty: editedQuestions[id]?.difficulty || 'medium',
          chapterNumber: 0,
          correctOption: 0,
          marks: paperSettings.customMarks?.mcq || 1
        } as MCQQuestion;
      } else if (activeTab === 'short') {
        return {
          id,
          questionText: editedQuestions[id]?.questionText || "Custom Short Question",
          difficulty: editedQuestions[id]?.difficulty || 'medium',
          chapterNumber: 0,
          marks: paperSettings.customMarks?.short || 2
        } as ShortQuestion;
      } else {
        return {
          id,
          questionText: editedQuestions[id]?.questionText || "Custom Long Question",
          difficulty: editedQuestions[id]?.difficulty || 'medium',
          chapterNumber: 0,
          marks: paperSettings.customMarks?.long || 5
        } as LongQuestion;
      }
    });
  }, [activeTab, selectedMcqIds, selectedShortIds, selectedLongIds, editedQuestions, paperSettings.customMarks]);

  const filteredQuestions = useMemo(() => {
    const result: Record<string, typeof currentQuestions> = {};
    
    // Add custom questions first under "Custom" chapter
    if (customQuestionsForPicker.length > 0) {
      result['custom'] = customQuestionsForPicker;
    }
    
    // Add regular grouped questions
    Object.entries(groupedQuestions).forEach(([chapterId, questions]) => {
      let filtered = questions;
      if (difficultyFilter !== "all") filtered = filtered.filter(q => q.difficulty === difficultyFilter);
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(q => typeof q.questionText === 'string' && q.questionText.toLowerCase().includes(query));
      }
      if (filtered.length > 0) result[chapterId] = filtered;
    });
    return result;
  }, [groupedQuestions, customQuestionsForPicker, difficultyFilter, searchQuery]);

  // Merge custom questions for preview
  const mcqsForPreview = useMemo(() => {
    const fromRepo = allMcqs.filter(q => selectedMcqIds.includes(q.id));
    const custom = selectedMcqIds
      .filter((id): id is string => typeof id === 'string' && id.startsWith('custom_'))
      .map(id => ({
        id,
        questionText: editedQuestions[id]?.questionText || "Custom MCQ",
        options: editedQuestions[id]?.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
        difficulty: editedQuestions[id]?.difficulty || 'medium',
        chapterNumber: 'Custom',
        correctOption: 0,
        marks: paperSettings.customMarks?.mcq || 1
      }));
    return [...fromRepo, ...custom] as MCQQuestion[];
  }, [allMcqs, selectedMcqIds, editedQuestions, paperSettings.customMarks]);

  const shortsForPreview = useMemo(() => {
    const fromRepo = allShorts.filter(q => selectedShortIds.includes(q.id));
    const custom = selectedShortIds
      .filter((id): id is string => typeof id === 'string' && id.startsWith('custom_'))
      .map(id => ({
        id,
        questionText: editedQuestions[id]?.questionText || "Custom Short Question",
        difficulty: editedQuestions[id]?.difficulty || 'medium',
        chapterNumber: 'Custom',
        marks: paperSettings.customMarks?.short || 2
      }));
    return [...fromRepo, ...custom] as ShortQuestion[];
  }, [allShorts, selectedShortIds, editedQuestions, paperSettings.customMarks]);

  const longsForPreview = useMemo(() => {
    const fromRepo = allLongs.filter(q => selectedLongIds.includes(q.id));
    const custom = selectedLongIds
      .filter((id): id is string => typeof id === 'string' && id.startsWith('custom_'))
      .map(id => ({
        id,
        questionText: editedQuestions[id]?.questionText || "Custom Long Question",
        difficulty: editedQuestions[id]?.difficulty || 'medium',
        chapterNumber: 'Custom',
        marks: paperSettings.customMarks?.long || 5
      }));
    return [...fromRepo, ...custom] as LongQuestion[];
  }, [allLongs, selectedLongIds, editedQuestions, paperSettings.customMarks]);

  // Toggle question
  const toggleQuestion = useCallback((questionId: string) => {
    let current: string[], setter: (ids: string[]) => void;
    if (activeTab === "mcq") { current = selectedMcqIds; setter = setMcqs; }
    else if (activeTab === "short") { current = selectedShortIds; setter = setShorts; }
    else { current = selectedLongIds; setter = setLongs; }

    if (current.includes(questionId)) setter(current.filter(id => id !== questionId));
    else setter([...current, questionId]);
  }, [activeTab, selectedMcqIds, selectedShortIds, selectedLongIds, setMcqs, setShorts, setLongs]);

  // Handlers
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) setShowBackConfirm(true);
    else router.push(`/chapters/${selectedClass}/${selectedSubject?.toLowerCase()}`);
  }, [hasUnsavedChanges, router, selectedClass, selectedSubject]);

  const confirmBack = useCallback(() => {
    resetQuestions();
    setShowBackConfirm(false);
    router.push(`/chapters/${selectedClass}/${selectedSubject?.toLowerCase()}`);
  }, [resetQuestions, router, selectedClass, selectedSubject]);

  const handleReset = useCallback(() => {
    if (hasUnsavedChanges) setShowResetConfirm(true);
  }, [hasUnsavedChanges]);

  const confirmReset = useCallback(() => {
    resetQuestions();
    setShowResetConfirm(false);
    toast.success("Selections cleared");
  }, [resetQuestions, toast]);

  const handleGenerate = useCallback(async () => {
    if (totalQuestions === 0) {
      toast.error("Please select at least one question");
      return;
    }
    if (!paperSettings.title?.trim()) {
      toast.error("Please enter a paper title");
      return;
    }
    if (!paperSettings.instituteName?.trim()) {
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
        classId: selectedClass || '9th',
        subject: selectedSubject || 'Mathematics',
        title: paperSettings.title,
        examType: paperSettings.examType || 'Practice Paper',
        date: paperSettings.date,
        timeAllowed: paperSettings.timeAllowed || '2 Hours',
        totalMarks,
        questionCount: totalQuestions,
        mcqCount: selectedMcqIds.length,
        shortCount: selectedShortIds.length,
        longCount: selectedLongIds.length,
        mcqIds: selectedMcqIds,
        shortIds: selectedShortIds,
        longIds: selectedLongIds,
        createdAt: new Date().toISOString(),
        instituteName: paperSettings.instituteName || '',
        instituteLogo: logoPreview || paperSettings.instituteLogo,
        showLogo: paperSettings.showLogo && !!(logoPreview || paperSettings.instituteLogo),
        showWatermark: paperSettings.showWatermark ?? true,
        customHeader: paperSettings.customHeader || '',
        customSubHeader: paperSettings.customSubHeader || '',
        customFooter: paperSettings.customFooter || '',
        logoPosition: paperSettings.logoPosition || 'left',
        showQuestionNumbers: paperSettings.showQuestionNumbers ?? true,
        showInstructions: paperSettings.includeInstructions ?? true,
        showPageNumbers: paperSettings.showPageNumbers ?? true,
        includeInstructionsText: paperSettings.includeInstructionsText,
        pdfStyle: paperSettings.pdfStyle || 'standard',
        customMarks: { mcq: customMcqMarks, short: customShortMarks, long: customLongMarks },
        includeBubbleSheet,
        fontSize: fontSize,
        editedQuestions,
        questionOrder,
      } as any;

      savePaper(paper);
      if (!paperCheck.isPremium) incrementPaperUsage();
      setStatusMessage("Redirecting...");
      router.push(`/paper?id=${paperId}`);
    } catch (error) {
      toast.error("Failed to create paper");
      setIsGenerating(false);
    }
  }, [totalQuestions, selectedClass, selectedSubject, selectedMcqIds, selectedShortIds, selectedLongIds, paperSettings, totalMarks, customMcqMarks, customShortMarks, customLongMarks, logoPreview, includeBubbleSheet, fontSize, editedQuestions, questionOrder, router, toast]);

  const getChapterName = (chapterId: string) => {
    if (chapterId === 'custom') return 'Custom Questions';
    return chapters.find(c => c.id === chapterId)?.name || chapterId;
  };

  const DIFFICULTY_COLORS: Record<Difficulty, { label: string; color: string; bg: string }> = {
    easy: { label: "Easy", color: "text-green-400", bg: "bg-green-500/20" },
    medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/20" },
    hard: { label: "Hard", color: "text-red-400", bg: "bg-red-500/20" },
  };

  if (isValidating) return <AppLoader message="Preparing..." />;

  return (
    <MainLayout showBottomNav={false} className="overflow-hidden noise-bg min-h-screen bg-[#0A0A0A]">
      <div className="flex h-full w-full relative z-10">
        {/* Left Panel: Configuration (Scrollable) */}
        <div className="w-full md:w-[450px] flex-shrink-0 h-full flex flex-col overflow-y-auto bg-[#0A0A0A]/60 md:border-r border-white/5 custom-scrollbar relative">

          {/* Floating Live Total Marks HUD */}
          <div className="sticky top-16 md:top-4 z-50 flex justify-end px-4 pointer-events-none w-full h-0 overflow-visible">
            <AnimatePresence>
              {totalMarks > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="pointer-events-auto glass-panel-dark border-[#B9FF66]/30 shadow-[0_8px_32px_rgba(185,255,102,0.2)] rounded-full px-4 py-2.5 flex items-center gap-3 mt-2"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#B9FF66] font-black text-lg leading-none">{totalMarks}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#A0A0A0] leading-none mt-0.5">Marks</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm leading-none">{totalQuestions}</span>
                    <span className="text-[9px] uppercase font-bold text-[#6B7280] leading-none mt-0.5">Q</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Live Preview Toggle (Sticky Top) */}
          <div className="md:hidden sticky top-0 z-30 glass-panel-dark border-b border-[#2A2A2A] p-4 flex justify-between items-center shadow-md">
            <span className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#2A2A2A] flex items-center justify-center border border-white/5">
                <Eye className="w-3 h-3 text-[#B9FF66]" />
              </div>
              Live Preview
            </span>
            <Button
              onClick={() => {
                triggerHaptic('light');
                toast.success("Preview feature coming soon");
              }}
              className="h-9 px-4 rounded-xl bg-[#2A2A2A] hover:bg-[#B9FF66] text-white hover:text-[#0A0A0A] text-xs font-bold transition-all border border-[#3A3A3A] hover:border-transparent active:scale-95 shadow-inner"
            >
              View HTML
            </Button>
          </div>

          <div className="pb-32 pt-2 md:pt-4 px-4 mx-auto max-w-[428px] w-full flex-1">
            {/* Stage Title */}
            <div className="mb-4 mt-2">
              <h2 className="text-2xl font-black text-white tracking-tighter">Paper Wizard</h2>
              <p className="text-sm text-[#A0A0A0] mt-1 font-medium">Configure your perfect exam paper.</p>
            </div>

            {/* Premium Banner - Small */}
            {!premiumStatus.isPremium && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPremiumModal(true)}
                  className="w-full h-11 rounded-xl bg-[#B9FF66]/10 border border-[#B9FF66]/20 text-[#B9FF66] hover:bg-[#B9FF66]/20 hover:border-[#B9FF66]/40 font-bold tracking-tight transition-all active:scale-[0.98]"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {premiumStatus.remaining} free papers left · Upgrade
                </Button>
              </div>
            )}

            {/* Active Template Banner */}
            {activeTemplateId && selectedTemplate && (
              <div className="mb-4">
                <div className="bg-gradient-to-r from-[#8B5CF6]/15 to-[#8B5CF6]/5 border border-[#8B5CF6]/30 rounded-xl p-3.5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center border border-[#8B5CF6]/30">
                      <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{selectedTemplate.name}</p>
                      <p className="text-[10px] text-[#8B5CF6] font-medium tracking-wide">Template active • {selectedTemplate.totalMarks} marks</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      clearActiveTemplate();
                    }}
                    className="text-[10px] font-bold tracking-wider uppercase text-[#9CA3AF] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Subject Card Bento Item */}
            <div className="mb-4">
              <div className="glass-panel-dark p-5 relative overflow-hidden border border-[#B9FF66]/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#B9FF66]/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-[0_0_20px_rgba(185,255,102,0.3)]">
                        <BookOpen className="w-5 h-5 text-[#0A0A0A]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">Class {selectedClass}</p>
                        <p className="font-black text-white text-xl tracking-tight leading-none mt-1">{selectedSubject}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[#B9FF66] bg-[#B9FF66]/10 border border-[#B9FF66]/20 px-2.5 py-1 rounded-md">
                      <Layers className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{selectedChapters.length} Chapters</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Stats Grid */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bento-item bg-[#1A1A1A]/80 border-[#2A2A2A] flex flex-col items-center justify-center col-span-1 py-6">
                  <p className="text-3xl font-bold text-white tracking-tighter">{totalQuestions}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280] mt-1">Questions</p>
                </div>
                <div className="bento-item bg-[#B9FF66]/5 border-[#B9FF66]/10 flex flex-col items-center justify-center col-span-1 py-6">
                  <p className="text-3xl font-bold text-[#B9FF66] tracking-tighter">{totalMarks}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#B9FF66]/60 mt-1">Total Marks</p>
                </div>
              </div>
            </div>

            {/* Paper Details - Expanded by default */}
            {/* Paper Details - Bento Item */}
            <div className="px-4 py-3">
              <div className="glass-panel-dark p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#B9FF66]/5 to-transparent rounded-bl-full pointer-events-none" />
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-6 h-6 rounded-md bg-[#2A2A2A] flex items-center justify-center">
                    <FileText className="w-3 h-3 text-[#A0A0A0]" />
                  </div>
                  Paper Details
                </h3>

                <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] group-focus-within:text-[#B9FF66] transition-colors ml-1">Paper Title</label>
                    <input
                      type="text"
                      value={paperSettings.title || ''}
                      onChange={(e) => updateSettings({ title: e.target.value })}
                      onFocus={() => triggerHaptic('light')}
                      className="w-full px-4 py-3 rounded-xl border border-white/5 bg-[#0A0A0A]/50 text-sm text-white focus:outline-none focus:border-[#B9FF66]/50 focus:bg-[#0A0A0A] transition-all placeholder:text-[#3A3A3A] font-medium shadow-inner"
                      placeholder="e.g. Mid-Term Mathematics 2024"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 group">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] group-focus-within:text-[#B9FF66] transition-colors ml-1">Date</label>
                      <input
                        type="date"
                        value={paperSettings.date || ''}
                        onChange={(e) => updateSettings({ date: e.target.value })}
                        onFocus={() => triggerHaptic('light')}
                        className="w-full px-4 py-3 rounded-xl border border-white/5 bg-[#0A0A0A]/50 text-sm text-white focus:outline-none focus:border-[#B9FF66]/50 focus:bg-[#0A0A0A] transition-all shadow-inner custom-date-input"
                      />
                    </div>
                    <div className="space-y-1.5 group">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] group-focus-within:text-[#B9FF66] transition-colors ml-1">Time Allowed</label>
                      <div className="relative">
                        <select
                          value={paperSettings.timeAllowed || '2 Hours'}
                          onChange={(e) => {
                            triggerHaptic('light');
                            updateSettings({ timeAllowed: e.target.value })
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-white/5 bg-[#0A0A0A]/50 text-sm text-white focus:outline-none focus:border-[#B9FF66]/50 focus:bg-[#0A0A0A] transition-all appearance-none shadow-inner font-medium"
                        >
                          <option value="30 Minutes">30 Minutes</option>
                          <option value="1 Hour">1 Hour</option>
                          <option value="1.5 Hours">1.5 Hours</option>
                          <option value="2 Hours">2 Hours</option>
                          <option value="2.5 Hours">2.5 Hours</option>
                          <option value="3 Hours">3 Hours</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1A1A1A] rounded flex items-center justify-center pointer-events-none border border-white/5">
                          <ChevronDown className="w-3.5 h-3.5 text-[#A0A0A0]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] group-focus-within:text-[#B9FF66] transition-colors ml-1">Institute Name</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] group-focus-within:text-[#B9FF66] transition-colors" />
                      <input
                        type="text"
                        value={paperSettings.instituteName || ''}
                        onChange={(e) => updateSettings({ instituteName: e.target.value })}
                        onFocus={() => triggerHaptic('light')}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-[#0A0A0A]/50 text-sm text-white focus:outline-none focus:border-[#B9FF66]/50 focus:bg-[#0A0A0A] transition-all placeholder:text-[#3A3A3A] font-medium shadow-inner"
                        placeholder="e.g. Oxford High School"
                      />
                    </div>
                  </div>

                  {/* Range Slider for Font Size */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Print Font Size</label>
                      <div className="px-2 py-0.5 rounded bg-[#1A1A1A] border border-white/5">
                        <span className="text-xs text-[#B9FF66] font-bold tracking-tight">{fontSize}pt</span>
                      </div>
                    </div>
                    <div className="relative pt-1 px-1">
                      <input
                        type="range"
                        min="11"
                        max="16"
                        step="1"
                        value={fontSize}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setFontSize(value);
                          updateSettings({ fontSize: value });
                          triggerHaptic('light');
                        }}
                        className="w-full h-1.5 bg-[#2A2A2A] rounded-full appearance-none outline-none accent-[#B9FF66] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#A0A0A0] mt-2 font-bold px-0.5">
                        <span>11pt</span>
                        <span>16pt</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setShowAdvancedSettings(!showAdvancedSettings);
                  }}
                  className="w-full mt-6 group flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 glass-panel-dark transition-all duration-300 active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#B9FF66]/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#B9FF66]" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight group-hover:text-[#B9FF66] transition-colors">Advanced Studio Options</span>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-[#6B7280] transition-transform duration-300", showAdvancedSettings && "rotate-180")} />
                </button>

                {/* Advanced Settings */}
                {showAdvancedSettings && (
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-3">
                    {/* Logo Upload - Premium Feature */}
                    <div>
                      <label className="text-xs text-[#6B7280] flex items-center gap-1">
                        <Image className="w-3 h-3" /> Institute Logo
                        {!authPremium && <span className="text-amber-500 text-[10px]">(Premium)</span>}
                      </label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <div className="mt-1 flex items-center gap-2">
                        {logoPreview || paperSettings.instituteLogo ? (
                          <div className="relative">
                            <img
                              src={logoPreview || paperSettings.instituteLogo || ''}
                              alt="Logo"
                              className="w-12 h-12 object-contain rounded-[12px] border border-[#2A2A2A] bg-[#1A1A1A]"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setLogoPreview(null);
                                updateSettings({ instituteLogo: null });
                              }}
                              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 hover:bg-red-600"
                            >
                              <X className="w-3 h-3 text-white" />
                            </Button>
                          </div>
                        ) : null}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                          className={cn(
                            "h-9",
                            authPremium
                              ? "border-[#B9FF66] text-[#B9FF66] hover:bg-[#B9FF66]/10"
                              : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                          )}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {logoPreview || paperSettings.instituteLogo ? "Change" : "Upload Logo"}
                        </Button>
                      </div>

                      {/* Logo Size Slider */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Logo Print Size</label>
                          <div className="px-2 py-0.5 rounded bg-[#1A1A1A] border border-white/5">
                            <span className="text-xs text-[#B9FF66] font-bold tracking-tight">{paperSettings.logoSize || 60}px</span>
                          </div>
                        </div>
                        <div className="relative pt-1 px-1">
                          <input
                            type="range"
                            min="30"
                            max="120"
                            step="5"
                            value={paperSettings.logoSize || 60}
                            onChange={(e) => {
                              updateSettings({ logoSize: parseInt(e.target.value) });
                              triggerHaptic('light');
                            }}
                            className="w-full h-1 bg-[#2A2A2A] rounded-full appearance-none outline-none accent-[#B9FF66] cursor-pointer"
                          />
                          <div className="flex justify-between text-[8px] text-[#6B7280] mt-1.5 font-bold px-0.5">
                            <span>30px</span>
                            <span>120px</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bubble Sheet Toggle - OMR Answer Sheet */}
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-[12px]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#B9FF66]" />
                        <div>
                          <p className="text-sm text-white">Bubble Sheet (OMR)</p>
                          <p className="text-xs text-[#9CA3AF]">Add answer sheet for marking</p>
                        </div>
                      </div>
                      <Switch
                        checked={includeBubbleSheet}
                        onCheckedChange={handleBubbleSheetToggle}
                      />
                    </div>

                    {/* Watermark Toggle */}
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-[12px]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6B7280]" />
                        <div>
                          <p className="text-sm text-white">Watermark</p>
                          <p className="text-xs text-[#9CA3AF]">{(paperSettings.showWatermark ?? true) ? 'On - Shows footer' : 'Off - Hidden'}</p>
                        </div>
                      </div>
                      <Switch
                        checked={paperSettings.showWatermark ?? true}
                        onCheckedChange={(checked) => updateSettings({ showWatermark: checked })}
                      />
                    </div>

                    {/* Marks Configuration */}
                    <div className="pt-4 border-t border-[#2A2A2A]/50">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-3">
                        <Calculator className="w-3 h-3" /> Scoring Configuration
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'MCQ', value: customMcqMarks, setter: setCustomMcqMarks, color: '#B9FF66' },
                          { label: 'Short', value: customShortMarks, setter: setCustomShortMarks, color: '#22C55E' },
                          { label: 'Long', value: customLongMarks, setter: setCustomLongMarks, color: '#4ADE80' },
                        ].map((m) => (
                          <div key={m.label} className="bg-[#0A0A0A]/80 border border-[#2A2A2A] rounded-xl p-2.5 text-center group-focus-within:border-primary/30 transition-all">
                            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-tighter mb-1">{m.label}</p>
                            <input
                              type="number"
                              value={m.value}
                              onChange={(e) => m.setter(parseInt(e.target.value) || 1)}
                              className="w-full text-center font-bold text-white bg-transparent border-none focus:outline-none focus:text-primary transition-colors text-lg"
                            />
                            <div className="w-8 h-0.5 mx-auto mt-1 rounded-full opacity-30" style={{ backgroundColor: m.color }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="pt-4 border-t border-[#2A2A2A]/50">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-3">
                        <Eye className="w-3 h-3" /> Display Options
                      </label>

                      {/* Question Numbers Toggle */}
                      <div className="flex items-center justify-between p-3 bg-[#0A0A0A]/50 rounded-xl mb-2">
                        <div>
                          <p className="text-sm text-white">Question Numbers</p>
                          <p className="text-xs text-[#9CA3AF]">Show 1, 2, 3...</p>
                        </div>
                        <Switch
                          checked={paperSettings.showQuestionNumbers ?? true}
                          onCheckedChange={(checked) => updateSettings({ showQuestionNumbers: checked })}
                        />
                      </div>

                      {/* Instructions Toggle */}
                      <div className="flex items-center justify-between p-3 bg-[#0A0A0A]/50 rounded-xl mb-2">
                        <div>
                          <p className="text-sm text-white">Section Instructions</p>
                          <p className="text-xs text-[#9CA3AF]">Show "Attempt any..."</p>
                        </div>
                        <Switch
                          checked={paperSettings.includeInstructions ?? true}
                          onCheckedChange={(checked) => updateSettings({ includeInstructions: checked })}
                        />
                      </div>

                      {/* Page Numbers Toggle */}
                      <div className="flex items-center justify-between p-3 bg-[#0A0A0A]/50 rounded-xl mb-2">
                        <div>
                          <p className="text-sm text-white">Page Numbers</p>
                          <p className="text-xs text-[#9CA3AF]">Show "Page X of Y"</p>
                        </div>
                        <Switch
                          checked={paperSettings.showPageNumbers ?? true}
                          onCheckedChange={(checked) => updateSettings({ showPageNumbers: checked })}
                        />
                      </div>
                    </div>

                    {/* Custom Footer */}
                    <div className="pt-4 border-t border-[#2A2A2A]/50">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-2">
                        Custom Footer Text
                      </label>
                      <input
                        type="text"
                        value={paperSettings.customFooter || ''}
                        onChange={(e) => updateSettings({ customFooter: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A]/50 text-sm text-white focus:outline-none focus:border-[#B9FF66]"
                        placeholder="e.g. Good Luck!"
                      />
                    </div>

                    {/* Logo Position */}
                    <div className="pt-4 border-t border-[#2A2A2A]/50">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-3">
                        Logo Position
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' },
                        ].map((pos) => (
                          <button
                            key={pos.value}
                            onClick={() => updateSettings({ logoPosition: pos.value as 'left' | 'center' | 'right' })}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${(paperSettings.logoPosition || 'left') === pos.value
                              ? 'bg-[#B9FF66] text-[#0A0A0A]'
                              : 'bg-[#0A0A0A]/50 text-[#9CA3AF] border border-[#2A2A2A]'
                              }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PDF Style Template */}
                    <div className="pt-4 border-t border-[#2A2A2A]/50">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-3">
                        PDF Style Template
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'standard', label: 'Standard', desc: 'Default board style' },
                          { value: 'modern', label: 'Modern', desc: 'Clean & minimal' },
                          { value: 'classic', label: 'Classic', desc: 'Traditional exam' },
                          { value: 'minimal', label: 'Minimal', desc: 'Simple layout' },
                        ].map((style) => (
                          <button
                            key={style.value}
                            onClick={() => updateSettings({ pdfStyle: style.value as 'standard' | 'modern' | 'classic' | 'minimal' })}
                            className={`p-3 rounded-lg text-left transition-all ${(paperSettings.pdfStyle || 'standard') === style.value
                              ? 'bg-[#B9FF66]/10 border border-[#B9FF66]/30'
                              : 'bg-[#0A0A0A]/50 border border-[#2A2A2A]'
                              }`}
                          >
                            <p className={`text-xs font-medium ${(paperSettings.pdfStyle || 'standard') === style.value ? 'text-[#B9FF66]' : 'text-white'}`}>
                              {style.label}
                            </p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{style.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Fill - Collapsible */}
            <div className="px-4 py-3">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowQuickFill(!showQuickFill);
                }}
                className="w-full glass-panel-dark rounded-lg p-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
              >
                {/* Magical glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/5 to-[#8B5CF6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated sparkles */}
                <motion.div
                  className="absolute top-1 right-8 w-1.5 h-1.5 rounded-full bg-[#B9FF66]"
                  animate={{
                    scale: [1, 1.5, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="absolute top-2 left-10 w-1 h-1 rounded-full bg-purple-400"
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#B9FF66] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 group-hover:shadow-[#8B5CF6]/50 transition-all duration-300">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white tracking-tight group-hover:text-[#B9FF66] transition-colors block">Magic Quick Fill</span>
                    <span className="text-[10px] text-[#6B7280]">Auto-select questions by difficulty</span>
                  </div>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-[#6B7280] transition-transform duration-300", showQuickFill && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showQuickFill && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-lg glass-panel-dark border border-[#B9FF66]/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#B9FF66]/5 to-transparent pointer-events-none" />
                      <div className="grid grid-cols-4 gap-3 relative z-10">
                        {[
                          { key: 'easy', label: 'Easy', color: 'text-green-400', bg: 'bg-green-400/10' },
                          { key: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                          { key: 'hard', label: 'Hard', color: 'text-red-400', bg: 'bg-red-400/10' },
                          { key: 'mixed', label: 'Mixed', color: 'text-[#B9FF66]', bg: 'bg-[#B9FF66]/10' },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => {
                              triggerHaptic('medium');
                              handleAutoFill(item.key as DifficultyLevel);
                            }}
                            className="flex flex-col items-center justify-center py-4 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden shadow-inner"
                          >
                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", item.bg)} />
                            <span className={cn("text-[11px] font-black uppercase tracking-widest relative z-10", item.color)}>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Question Cards with Inline ± Steppers */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#2A2A2A] flex items-center justify-center">
                    <Layers className="w-3 h-3 text-white" />
                  </div>
                  Questions Setup
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: "mcq" as const,
                    label: "MCQs",
                    sublabel: `${customMcqMarks} mark each`,
                    color: "text-[#B9FF66]",
                    border: "border-[#B9FF66]/30",
                    bg: "bg-[#B9FF66]/10",
                    gradient: "from-[#B9FF66] to-[#22c55e]",
                    count: selectedMcqIds.length,
                    available: availableCounts.mcqs,
                    all: allMcqs,
                    selected: selectedMcqIds,
                    setter: setMcqs,
                  },
                  {
                    key: "short" as const,
                    label: "Short Questions",
                    sublabel: `${customShortMarks} marks each`,
                    color: "text-emerald-400",
                    border: "border-emerald-500/30",
                    bg: "bg-emerald-500/10",
                    gradient: "from-emerald-400 to-teal-500",
                    count: selectedShortIds.length,
                    available: availableCounts.shorts,
                    all: allShorts,
                    selected: selectedShortIds,
                    setter: setShorts,
                  },
                  {
                    key: "long" as const,
                    label: "Long Questions",
                    sublabel: `${customLongMarks} marks each`,
                    color: "text-violet-400",
                    border: "border-violet-500/30",
                    bg: "bg-violet-500/10",
                    gradient: "from-violet-400 to-purple-500",
                    count: selectedLongIds.length,
                    available: availableCounts.longs,
                    all: allLongs,
                    selected: selectedLongIds,
                    setter: setLongs,
                  },
                ].map((tab) => (
                  <div key={tab.key} className={cn("glass-panel-dark p-4 group/card transition-all duration-300 relative overflow-hidden", tab.count > 0 ? "border-[#B9FF66]/20 bg-white/[0.02]" : "")}>
                    {/* Subtle active gradient */}
                    {tab.count > 0 && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />}

                    <div className="flex items-center justify-between relative z-10">
                      {/* Left: label + info */}
                      <button
                        onClick={() => openQuestionPicker(tab.key as any)}
                        className="flex items-center gap-4 flex-1 min-w-0 text-left"
                      >
                        <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/card:scale-105 shadow-lg", tab.count > 0 ? `bg-gradient-to-br ${tab.gradient}` : "bg-[#2A2A2A]")}>
                          <span className={cn("text-xl font-black tracking-tighter", tab.count > 0 ? "text-[#0A0A0A]" : "text-white")}>{tab.count}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-white tracking-tight">{tab.label}</p>
                          <p className="text-xs font-medium text-[#A0A0A0] mt-0.5">{tab.available} Available · {tab.sublabel}</p>
                        </div>
                      </button>

                      {/* Right: ± stepper */}
                      <div className="flex items-center gap-1.5 ml-2 bg-[#0A0A0A]/80 p-1.5 rounded-xl border border-[#2A2A2A]/80 shadow-inner">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            const newCount = Math.max(0, tab.count - 1);
                            tab.setter(tab.selected.slice(0, newCount));
                          }}
                          disabled={tab.count === 0}
                          className="w-8 h-8 rounded-[10px] bg-[#1A1A1A] hover:bg-[#2A2A2A] flex items-center justify-center text-white disabled:opacity-50 transition-all active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            openQuestionPicker(tab.key as any)
                          }}
                          className={cn("w-8 text-center font-black text-[15px] tracking-tighter cursor-pointer", tab.count > 0 ? tab.color : "text-white")}
                        >
                          {tab.count}
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            const unselected = tab.all.filter(q => !tab.selected.includes(q.id));
                            if (unselected.length > 0) {
                              const q = unselected[0];
                              const parts = q.id.split("_");
                              const chapterNum = parts.length >= 3 ? parts[2].replace('ch', '') : (q.chapterNumber || 'unknown');
                              tab.setter([...tab.selected, q.id]);
                              toast.success(`Added ${tab.key.toUpperCase()} from Chapter ${chapterNum}`, {
                                icon: <Plus className="w-4 h-4 text-[#B9FF66]" />,
                                duration: 2000,
                              });
                            }
                          }}
                          disabled={tab.count >= tab.available}
                          className="w-8 h-8 rounded-[10px] bg-[#B9FF66]/10 text-[#B9FF66] hover:bg-[#B9FF66] hover:text-[#0A0A0A] disabled:bg-[#1A1A1A] disabled:text-gray-500 flex items-center justify-center font-bold transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Reorder List (Expandable) */}
                    {expandingReorder === tab.key && tab.count > 0 && (
                      <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-[#6B7280]" />
                            Drag to Reorder
                          </span>
                          <button
                            onClick={() => { triggerHaptic('light'); setExpandingReorder(null); }}
                            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] px-3 py-1 rounded-md text-xs font-bold text-white transition-colors"
                          >
                            Done
                          </button>
                        </div>
                        <ReorderQuestions
                          type={tab.key}
                          items={tab.selected.map(id => tab.all.find(q => q.id === id)).filter((q): q is NonNullable<typeof q> => q !== undefined)}
                          onOrderChange={(newOrder) => {
                            // Update both questionOrder and the selected IDs
                            setQuestionOrder(tab.key, newOrder);
                            if (tab.key === 'mcq') setMcqs(newOrder);
                            else if (tab.key === 'short') setShorts(newOrder);
                            else setLongs(newOrder);
                            triggerHaptic('light');
                          }}
                          onRemove={(id) => {
                            triggerHaptic('medium');
                            if (tab.key === 'mcq') setMcqs(selectedMcqIds.filter(mid => mid !== id));
                            else if (tab.key === 'short') setShorts(selectedShortIds.filter(sid => sid !== id));
                            else setLongs(selectedLongIds.filter(lid => lid !== id));
                          }}
                          editedQuestions={editedQuestions}
                          onEditQuestion={(questionId, newText) => {
                            editQuestion(questionId, { questionText: newText });
                          }}
                        />
                      </div>
                    )}

                    {/* Compact Reorder Trigger (if not expanding) */}
                    {expandingReorder !== tab.key && tab.count > 1 && (
                      <button
                        onClick={() => { triggerHaptic('light'); setExpandingReorder(tab.key) }}
                        className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-[#2A2A2A] hover:border-[#B9FF66]/30 hover:bg-[#B9FF66]/5 text-xs font-bold text-[#A0A0A0] hover:text-[#B9FF66] transition-all flex items-center justify-center gap-2 relative z-10 active:scale-98"
                      >
                        <GripVertical className="w-4 h-4" />
                        Reorder Questions
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-20" />
          </div>

          {/* Generate Button (Sticky inside Left Panel) */}
          <div className="sticky bottom-0 left-0 right-0 p-5 z-20 w-full mt-auto">
            {/* Gradient fade above */}
            <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />

            <div className="mx-auto max-w-[428px]">
              <Button
                onClick={() => {
                  triggerHaptic('medium');
                  handleGenerate();
                }}
                disabled={totalQuestions === 0 || isGenerating}
                className="w-full h-[60px] rounded-lg bg-[#B9FF66] text-[#0A0A0A] font-bold text-lg flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(185,255,102,0.15)] hover:shadow-[0_8px_32px_rgba(185,255,102,0.25)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:bg-[#2A2A2A] disabled:text-white disabled:shadow-none group relative overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                {isGenerating ? (
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span className="tracking-tight">Preparing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full px-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="tracking-tight">Generate Paper</span>
                    </div>
                    {totalQuestions > 0 && (
                      <div className="bg-black/10 px-3 py-1.5 rounded-xl text-xs font-black shadow-inner flex items-center gap-1.5">
                        <span>{totalQuestions}</span>
                        <span className="text-black/50 font-medium text-[10px] uppercase">Q</span>
                        <div className="w-px h-3 bg-black/20" />
                        <span>{totalMarks}</span>
                        <span className="text-black/50 font-medium text-[10px] uppercase">M</span>
                      </div>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Live HTML Studio */}
        <div className="hidden md:flex flex-1 bg-[#1A1A1A] h-full overflow-hidden flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-[#0A0A0A]">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#B9FF66]" /> Live WYSIWYG Studio
            </h2>
            <div className="text-xs text-[#9CA3AF]">A4 View • Updates in real-time</div>
          </div>
          <LivePaperPreview
            paperTitle={paperSettings.title || ""}
            instituteName={paperSettings.instituteName || "Institute Name"}
            date={paperSettings.date || ""}
            timeAllowed={paperSettings.timeAllowed || "2 Hours"}
            totalMarks={totalMarks}
            mcqs={mcqsForPreview}
            shorts={shortsForPreview}
            longs={longsForPreview}
            editedQuestions={editedQuestions}
            questionOrder={questionOrder}
            settings={paperSettings}
            fontSize={fontSize}
            logoPreview={logoPreview}
          />
        </div>
      </div>

      {/* Question Picker Modal */}
      <AnimatePresence>
        {showQuestionPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* High-end Backdrop Blur */}
            <motion.div
              className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                triggerHaptic('light');
                setShowQuestionPicker(false);
                setSearchQuery("");
              }}
            />

            <motion.div
              className="glass-panel-dark w-full max-w-2xl max-h-[90vh] md:rounded-xl md:rounded-b-xl rounded-t-xl rounded-b-none overflow-hidden flex flex-col border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] relative z-10"
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full md:hidden" />
              <div className="noise-bg absolute inset-0 opacity-20 pointer-events-none" />
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 relative z-10 pt-8 md:pt-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#B9FF66]/10 flex items-center justify-center border border-[#B9FF66]/20">
                      <Layers className="w-5 h-5 text-[#B9FF66]" />
                    </div>
                    Select {activeTab === 'mcq' ? 'MCQs' : activeTab === 'short' ? 'Short Questions' : 'Long Questions'}
                  </h3>
                  <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-widest mt-2 ml-1">
                    {currentSelectedIds.length} Selected • {currentQuestions.length} Available
                  </p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setShowQuestionPicker(false);
                    setSearchQuery("");
                  }}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 border border-white/5"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4 space-y-4 bg-black/20 relative z-10 border-b border-white/5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                    <input
                      type="text"
                      placeholder="Search questions by text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-white/10 bg-[#0A0A0A]/50 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#B9FF66]/50 transition-all font-medium shadow-inner"
                    />
                  </div>
                  <div className="flex gap-2 shrink-0 h-[46px]">
                    <button
                      onClick={handleAddCustom}
                      className="px-5 rounded-lg bg-[#B9FF66] text-[#0A0A0A] text-xs font-bold active:scale-95 transition-all flex items-center gap-2 border border-[#B9FF66]/20 hover:bg-[#a3e659] whitespace-nowrap shadow-[0_4px_12px_rgba(185,255,102,0.2)]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Custom
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        const visibleIds = currentQuestions.map(q => q.id);
                        if (activeTab === 'mcq') setMcqs(Array.from(new Set([...selectedMcqIds, ...visibleIds])));
                        else if (activeTab === 'short') setShorts(Array.from(new Set([...selectedShortIds, ...visibleIds])));
                        else setLongs(Array.from(new Set([...selectedLongIds, ...visibleIds])));
                      }}
                      className="px-5 rounded-lg bg-[#B9FF66]/10 text-[#B9FF66] hover:bg-[#B9FF66] hover:text-[#0A0A0A] text-xs font-bold active:scale-95 transition-all flex items-center border border-[#B9FF66]/20 hover:border-transparent whitespace-nowrap"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        if (activeTab === 'mcq') setMcqs([]);
                        else if (activeTab === 'short') setShorts([]);
                        else setLongs([]);
                      }}
                      className="px-5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold active:scale-95 transition-all border border-red-500/20 hover:border-transparent flex items-center"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        triggerHaptic('light');
                        setDifficultyFilter(diff)
                      }}
                      className={cn(
                        "px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 border",
                        difficultyFilter === diff
                          ? "bg-[#B9FF66] text-[#0A0A0A] border-transparent shadow-[0_4px_12px_rgba(185,255,102,0.3)]"
                          : "bg-white/5 text-[#A0A0A0] hover:text-white hover:bg-white/10 border-white/5"
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 custom-scrollbar">
                {isLoadingQuestions ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 border-4 border-[#B9FF66]/30 border-t-[#B9FF66] rounded-full animate-spin mb-6" />
                    <p className="text-white font-bold text-lg tracking-tight mb-2">Loading Questions...</p>
                    <p className="text-sm text-[#A0A0A0]">Please wait while we fetch questions</p>
                  </div>
                ) : selectedChapters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Layers className="w-10 h-10 text-[#6B7280]" />
                    </div>
                    <p className="text-white font-bold text-lg tracking-tight mb-2">No Chapters Selected</p>
                    <p className="text-sm text-[#A0A0A0] max-w-[200px]">Please go back and select at least one chapter to load questions.</p>
                  </div>
                ) : Object.keys(filteredQuestions).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                      <Search className="w-10 h-10 text-[#6B7280]" />
                    </div>
                    <p className="text-white font-bold text-lg tracking-tight mb-2">No Match Found</p>
                    <p className="text-sm text-[#A0A0A0] max-w-[200px]">Adjust your search query or filters to find questions.</p>
                  </div>
                ) : (
                  Object.entries(filteredQuestions).map(([chapterId, questions]) => {
                    const selected = questions.filter(q => currentSelectedIds.includes(q.id)).length;
                    const isExpanded = expandedChapters.has(chapterId);
                    return (
                      <div key={chapterId} className="border border-white/10 rounded-lg overflow-hidden glass-panel-dark transition-all duration-300">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            setExpandedChapters(prev => { const n = new Set(prev); n.has(chapterId) ? n.delete(chapterId) : n.add(chapterId); return n; })
                          }}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                              <BookOpen className="w-4 h-4 text-[#A0A0A0]" />
                            </div>
                            <span className="text-sm font-bold text-white tracking-tight">{getChapterName(chapterId)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{questions.length} Qs</span>
                            {selected > 0 && <span className="px-2.5 py-1 bg-[#B9FF66]/20 border border-[#B9FF66]/30 text-[#B9FF66] text-xs font-bold rounded-lg">{selected} Selected</span>}
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                              <ChevronDown className={cn("w-4 h-4 text-[#A0A0A0] transition-transform duration-300", isExpanded && "rotate-180")} />
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="bg-black/30 border-t border-white/5"
                            >
                              <div className="p-3 space-y-2">
                                {questions.map((q) => {
                                  const isSelected = currentSelectedIds.includes(q.id);
                                  const diff = DIFFICULTY_COLORS[q.difficulty];
                                  const mcqOptions = 'options' in q ? (q as any).options : null;
                                  const finalQuestionText = editedQuestions[q.id]?.questionText || q.questionText;
                                  const finalMcqOptions = editedQuestions[q.id]?.options || mcqOptions;
                                  const isEdited = !!editedQuestions[q.id];

                                  if (editingQuestionId === q.id) {
                                    return (
                                      <div key={q.id} className="w-full flex-col gap-3 p-4 rounded-xl text-left bg-[#1A1A1A] border border-[#B9FF66]/50 shadow-[0_0_15px_rgba(185,255,102,0.1)]">
                                        <textarea
                                          value={editingText}
                                          onChange={(e) => setEditingText(e.target.value)}
                                          className="w-full bg-[#0A0A0A] text-white text-sm p-4 rounded-xl border border-white/10 min-h-[200px] focus:outline-none focus:border-[#B9FF66]/50 transition-colors custom-scrollbar leading-relaxed"
                                          placeholder="Type your question content here..."
                                        />
                                        {finalMcqOptions && Array.isArray(finalMcqOptions) && (
                                          <div className="mt-3 space-y-2">
                                            {editingOptions.map((opt, idx) => (
                                              <div key={idx} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-[#2A2A2A] flex items-center justify-center text-xs font-bold text-[#A0A0A0]">
                                                  {String.fromCharCode(65 + idx)}
                                                </div>
                                                <input
                                                  type="text"
                                                  value={opt}
                                                  onChange={(e) => {
                                                    const newOpts = [...editingOptions];
                                                    newOpts[idx] = e.target.value;
                                                    setEditingOptions(newOpts);
                                                  }}
                                                  className="flex-1 bg-[#0A0A0A] text-white text-sm p-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#B9FF66]/50 transition-colors"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <div className="flex justify-end gap-2 mt-4">
                                          <button
                                            onClick={() => {
                                              triggerHaptic('light');
                                              setEditingQuestionId(null);
                                            }}
                                            className="px-5 py-2 text-xs font-bold text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-white/10"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              triggerHaptic('medium');
                                              editQuestion(q.id, { questionText: editingText, options: finalMcqOptions ? editingOptions : undefined });
                                              setEditingQuestionId(null);
                                            }}
                                            className="px-5 py-2 text-xs font-bold bg-[#B9FF66] hover:bg-[#a3e659] text-[#0A0A0A] rounded-xl transition-colors active:scale-95 shadow-[0_4px_12px_rgba(185,255,102,0.2)]"
                                          >
                                            Save Changes
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={q.id}
                                      className={cn("relative group w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-300", isSelected ? "bg-[#B9FF66]/10 border border-[#B9FF66]/30 shadow-[0_4px_12px_rgba(185,255,102,0.05)]" : "bg-white/[0.02] border border-white/5 hover:border-white/10")}
                                    >
                                      <button onClick={() => {
                                        triggerHaptic(isSelected ? 'light' : 'medium');
                                        toggleQuestion(q.id)
                                      }} className="absolute inset-0 w-full h-full z-0 touch-manipulation rounded-xl" aria-label="Toggle select" />
                                      <div className={cn("relative z-10 w-6 h-6 rounded-[8px] border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300", isSelected ? "bg-[#B9FF66] border-[#B9FF66]" : "border-white/20 group-hover:border-white/40 pointer-events-none")}>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0A0A0A] font-bold" />}
                                      </div>
                                      <div className="relative z-10 flex-1 min-w-0 pointer-events-none">
                                        <p className={cn("text-sm transition-colors", isSelected ? "text-white" : "text-[#E0E0E0]")}>{finalQuestionText}</p>
                                        {/* Show MCQ options if available */}
                                        {finalMcqOptions && Array.isArray(finalMcqOptions) && (
                                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {finalMcqOptions.map((opt: string, idx: number) => (
                                              <div key={idx} className={cn("text-xs flex items-center gap-2 p-2 rounded-lg border transition-colors", isSelected ? "bg-[#B9FF66]/5 border-[#B9FF66]/20 text-white" : "bg-[#0A0A0A]/50 border-white/5 text-[#A0A0A0]")}>
                                                <span className={cn("w-5 h-5 rounded flex items-center justify-center font-bold", isSelected ? "bg-[#B9FF66]/20 text-[#B9FF66]" : "bg-[#2A2A2A] text-[#6B7280]")}>{String.fromCharCode(65 + idx)}</span>
                                                <span className="truncate">{opt}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div className="relative z-10 flex flex-col items-end gap-3 flex-shrink-0">
                                        <div className="flex items-center gap-1.5 pointer-events-none">
                                          {isEdited && <span className="text-[10px] px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 font-bold tracking-wider uppercase border-blue-500/20">Edited</span>}
                                          <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase border", diff.bg, diff.color, `border-current/[0.2]`)}>{diff.label}</span>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            triggerHaptic('light');
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditingText(finalQuestionText);
                                            setEditingOptions(finalMcqOptions || []);
                                            setEditingQuestionId(q.id);
                                          }}
                                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#A0A0A0] hover:text-white transition-all border border-white/5 z-20 active:scale-95"
                                          aria-label="Edit question"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-5 border-t bg-[#0A0A0A]/80 backdrop-blur-md border-white/5 relative z-10">
                <Button onClick={() => {
                  triggerHaptic('medium');
                  setShowQuestionPicker(false);
                  setSearchQuery("");
                }} className="w-full h-14 rounded-lg bg-[#B9FF66] text-[#0A0A0A] font-bold text-base shadow-[0_4px_24px_rgba(185,255,102,0.15)] hover:bg-[#a3e659] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  Done ({currentSelectedIds.length} questions ready)
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <ConfirmDialog isOpen={showBackConfirm} onClose={() => setShowBackConfirm(false)} onConfirm={confirmBack} title="Discard Changes?" message="Your question selections will be lost." confirmText="Discard" variant="destructive" />
      <ConfirmDialog isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={confirmReset} title="Clear All?" message="Remove all selected questions?" confirmText="Clear" variant="destructive" />
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} onSuccess={(status) => setPremiumStatus({ isPremium: status.isPremium, remaining: -1 })} />

      {/* Loading */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div className="fixed inset-0 z-[100] bg-[#0A0A0A]/90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#B9FF66]/30 border-t-[#B9FF66] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">{statusMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
