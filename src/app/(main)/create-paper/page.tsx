"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, RotateCcw, Sparkles, BookOpen, Layers, Crown,
  Check, ChevronDown, X, Trash2, Eye, Edit3, Calculator,
  Wand2, Image, MapPin, Phone, Mail, Globe, Minus, Plus,
  Upload, FileText, ToggleLeft, ToggleRight
} from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { ConfirmDialog, AppLoader } from "@/components/shared";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks";
import { usePaperStore, useAuthStore } from "@/stores";
import { getAvailableQuestionCounts, getRandomQuestions, getQuestionsByIds, getMcqsByChapterIds, getShortsByChapterIds, getLongsByChapterIds, getSubjectData } from "@/data";
import { getPattern } from "@/lib/pdf/patterns";
import { savePaper } from "@/lib/storage/papers";
import { generatePaperId } from "@/lib/utils/id";
import { canGeneratePaper, incrementPaperUsage, checkPremiumStatus } from "@/lib/premium";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion, Difficulty, ClassName, SubjectName } from "@/types";
import { VirtualQuestionList } from "@/components/paper/VirtualQuestionList";

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
  } = usePaperStore();

  // State
  const [isValidating, setIsValidating] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Creating paper...");
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, remaining: 0 });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Logo upload ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Bubble sheet state
  const [includeBubbleSheet, setIncludeBubbleSheet] = useState(false);

  // Question data
  const [allMcqs, setAllMcqs] = useState<MCQQuestion[]>([]);
  const [allShorts, setAllShorts] = useState<ShortQuestion[]>([]);
  const [allLongs, setAllLongs] = useState<LongQuestion[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [availableCounts, setAvailableCounts] = useState({ mcqs: 0, shorts: 0, longs: 0 });

  // UI State
  const [activeTab, setActiveTab] = useState<"mcq" | "short" | "long">("mcq");
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Open question picker with all chapters expanded
  const openQuestionPicker = useCallback((tab: "mcq" | "short" | "long") => {
    setActiveTab(tab);
    setSearchQuery("");
    setDifficultyFilter("all");
    // Expand all chapters that have questions
    const allChapterIds = new Set<string>();
    if (tab === "mcq") allMcqs.forEach(q => {
      const parts = q.id.split("_");
      const chapterId = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : `ch_${q.chapterNumber || 1}`;
      allChapterIds.add(chapterId);
    });
    if (tab === "short") allShorts.forEach(q => {
      const parts = q.id.split("_");
      const chapterId = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : `ch_${q.chapterNumber || 1}`;
      allChapterIds.add(chapterId);
    });
    if (tab === "long") allLongs.forEach(q => {
      const parts = q.id.split("_");
      const chapterId = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : `ch_${q.chapterNumber || 1}`;
      allChapterIds.add(chapterId);
    });
    setExpandedChapters(allChapterIds);
    setShowQuestionPicker(true);
  }, [allMcqs, allShorts, allLongs]);

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
  const totalMarks = (selectedMcqIds.length * customMcqMarks) + 
                     (selectedShortIds.length * customShortMarks) + 
                     (selectedLongIds.length * customLongMarks);

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
    const timer = setTimeout(async () => {
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

      // Load questions (async)
      if (selectedChapters.length > 0) {
        await loadQuestions();
      }

      // Apply pattern defaults
      if (pattern) {
        const mcqSection = pattern.sections.find(s => s.type === 'mcq');
        const shortSections = pattern.sections.filter(s => s.type === 'short');
        const longSections = pattern.sections.filter(s => s.type === 'long');

        setCustomMcqMarks(mcqSection?.marksPerQuestion || 1);
        setCustomShortMarks(shortSections[0]?.marksPerQuestion || 2);
        setCustomLongMarks(longSections[0]?.marksPerQuestion || 5);
      }

      setIsValidating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedClass, selectedSubject, selectedChapters, pattern, router, paperSettings.title, updateSettings, loadQuestions]);

  // Auto-fill
  const handleAutoFill = useCallback(async (difficulty: DifficultyLevel) => {
    if (!selectedClass || !selectedSubject) return;

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

    setMcqs(result.mcqs.map((q: MCQQuestion) => q.id));
    setShorts(result.shorts.map((q: ShortQuestion) => q.id));
    setLongs(result.longs.map((q: LongQuestion) => q.id));

    toast.success(`Auto-filled with ${difficulty} questions`);
  }, [selectedClass, selectedSubject, selectedChapters, pattern, setMcqs, setShorts, setLongs, toast]);

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
  }, [currentQuestions, chapters]);

  const filteredQuestions = useMemo(() => {
    const result: Record<string, typeof currentQuestions> = {};
    Object.entries(groupedQuestions).forEach(([chapterId, questions]) => {
      let filtered = questions;
      if (difficultyFilter !== "all") filtered = filtered.filter(q => q.difficulty === difficultyFilter);
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(q => q.questionText.toLowerCase().includes(query));
      }
      if (filtered.length > 0) result[chapterId] = filtered;
    });
    return result;
  }, [groupedQuestions, difficultyFilter, searchQuery]);

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
        customMarks: { mcq: customMcqMarks, short: customShortMarks, long: customLongMarks },
        includeBubbleSheet,
      } as any;

      savePaper(paper);
      if (!paperCheck.isPremium) incrementPaperUsage();
      setStatusMessage("Redirecting...");
      router.push(`/paper?id=${paperId}`);
    } catch (error) {
      toast.error("Failed to create paper");
      setIsGenerating(false);
    }
  }, [totalQuestions, selectedClass, selectedSubject, selectedMcqIds, selectedShortIds, selectedLongIds, paperSettings, totalMarks, customMcqMarks, customShortMarks, customLongMarks, logoPreview, includeBubbleSheet, router, toast]);

  const getChapterName = (chapterId: string) => chapters.find(c => c.id === chapterId)?.name || chapterId;

  const DIFFICULTY_COLORS: Record<Difficulty, { label: string; color: string; bg: string }> = {
    easy: { label: "Easy", color: "text-green-600", bg: "bg-green-50" },
    medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50" },
    hard: { label: "Hard", color: "text-red-600", bg: "bg-red-50" },
  };

  if (isValidating) return <AppLoader message="Preparing..." />;

  return (
    <MainLayout showBottomNav={false}>
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-40 pt-safe">
        <div className="mx-auto max-w-[428px]">
          <div className="h-14 px-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="font-bold text-lg text-white">Create Paper</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReset} 
              className={hasUnsavedChanges ? "text-red-500" : "text-gray-400"}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <ScrollView className="flex-1 pb-36">
        {/* Premium Banner - Small */}
        {!premiumStatus.isPremium && (
          <div className="px-4 py-2">
            <Button 
              variant="outline"
              onClick={() => setShowPremiumModal(true)}
              className="w-full h-10 rounded-xl bg-[#B9FF66]/10 border-[#B9FF66]/30 text-[#B9FF66] hover:bg-[#B9FF66]/20"
            >
              <Crown className="w-4 h-4 mr-2" />
              {premiumStatus.remaining} free papers left · Upgrade
            </Button>
          </div>
        )}

        {/* Subject Card */}
        <div className="px-4 py-3">
          <div className="bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] p-4 flex items-center justify-between shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">Class {selectedClass}</p>
                <p className="font-semibold text-white">{selectedSubject}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#A0A0A0] bg-[#2A2A2A] px-2 py-1 rounded-lg">
              <Layers className="w-3 h-3" />
              <span className="text-xs font-medium">{selectedChapters.length} chapters</span>
            </div>
          </div>
        </div>

        {/* Stats Bar - White Card */}
        <div className="px-4 py-3">
          <div className="bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between text-white">
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-xs text-[#6B7280]">Questions</p>
              </div>
              <div className="w-px h-10 bg-[#E5E7EB]" />
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{totalMarks}</p>
                <p className="text-xs text-[#6B7280]">Marks</p>
              </div>
              <div className="w-px h-10 bg-[#E5E7EB]" />
              <div className="text-center flex-1">
                <p className="text-2xl font-bold">{selectedChapters.length}</p>
                <p className="text-xs text-[#6B7280]">Chapters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Details - Expanded by default */}
        <div className="px-4 py-3">
          <div className="bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <h3 className="text-sm font-semibold text-white mb-3">Paper Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6B7280]">Title</label>
                <input 
                  type="text"
                  value={paperSettings.title || ''}
                  onChange={(e) => updateSettings({ title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-white focus:outline-none focus:border-[#1E88E5]"
                  placeholder="Enter paper title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#6B7280]">Date</label>
                  <input 
                    type="date"
                    value={paperSettings.date || ''}
                    onChange={(e) => updateSettings({ date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-white focus:outline-none focus:border-[#1E88E5]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6B7280]">Time</label>
                  <select 
                    value={paperSettings.timeAllowed || '2 Hours'}
                    onChange={(e) => updateSettings({ timeAllowed: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-white focus:outline-none focus:border-[#1E88E5]"
                  >
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                    <option>1.5 Hours</option>
                    <option>2 Hours</option>
                    <option>2.5 Hours</option>
                    <option>3 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#6B7280]">Institute Name</label>
                <input 
                  type="text"
                  value={paperSettings.instituteName || ''}
                  onChange={(e) => updateSettings({ instituteName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-white focus:outline-none focus:border-[#1E88E5]"
                  placeholder="Enter institute name"
                />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <Button 
              variant="ghost"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full mt-4 justify-between text-[#6B7280] hover:text-white h-10"
            >
              <span className="text-sm">Advanced Options</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvancedSettings && "rotate-180")} />
            </Button>

            {/* Advanced Settings */}
            {showAdvancedSettings && (
              <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-3">
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
                          ? "border-[#1E88E5] text-[#1E88E5] hover:bg-blue-50" 
                          : "border-amber-300 text-amber-600 bg-amber-50"
                      )}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {logoPreview || paperSettings.instituteLogo ? "Change" : "Upload Logo"}
                    </Button>
                  </div>
                </div>

                {/* Bubble Sheet Toggle - Premium Feature */}
                <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-[12px]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#6B7280]" />
                    <div>
                      <p className="text-sm text-white">Bubble Sheet</p>
                      <p className="text-xs text-[#9CA3AF]">Add OMR answer sheet</p>
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

                <div>
                  <label className="text-xs text-[#6B7280]">Custom Header</label>
                  <input 
                    type="text"
                    value={paperSettings.customHeader || ''}
                    onChange={(e) => updateSettings({ customHeader: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-white focus:outline-none focus:border-[#1E88E5]"
                    placeholder="Optional header text"
                  />
                </div>
                
                {/* Marks Configuration */}
                <div className="pt-3 border-t border-[#E5E7EB]">
                  <label className="text-xs text-[#6B7280] flex items-center gap-1 mb-2">
                    <Calculator className="w-3 h-3" /> Marks per Question
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#2A2A2A] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#A0A0A0]">MCQ</p>
                      <input 
                        type="number" 
                        value={customMcqMarks}
                        onChange={(e) => setCustomMcqMarks(parseInt(e.target.value) || 1)}
                        className="w-full text-center font-bold text-[#B9FF66] bg-transparent border-b border-[#2A2A2A] focus:outline-none"
                      />
                    </div>
                    <div className="bg-[#2A2A2A] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#A0A0A0]">Short</p>
                      <input 
                        type="number" 
                        value={customShortMarks}
                        onChange={(e) => setCustomShortMarks(parseInt(e.target.value) || 2)}
                        className="w-full text-center font-bold text-[#22c55e] bg-transparent border-b border-[#2A2A2A] focus:outline-none"
                      />
                    </div>
                    <div className="bg-[#2A2A2A] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#A0A0A0]">Long</p>
                      <input 
                        type="number" 
                        value={customLongMarks}
                        onChange={(e) => setCustomLongMarks(parseInt(e.target.value) || 5)}
                        className="w-full text-center font-bold text-[#B9FF66] bg-transparent border-b border-[#2A2A2A] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Fill */}
        <div className="px-4 py-3">
          <div className="bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-4 h-4 text-[#1E88E5]" />
              <span className="text-sm font-semibold text-white">Quick Fill</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'easy', label: 'Easy' },
                { key: 'medium', label: 'Medium' },
                { key: 'hard', label: 'Hard' },
                { key: 'mixed', label: 'Mixed' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleAutoFill(item.key as DifficultyLevel)}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <span className="text-xs font-medium text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Type Cards */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-white mb-3">Select Questions</h3>
          
          <div className="space-y-2">
            {[
              { key: "mcq", label: "MCQs", color: "text-[#1E88E5]", bg: "bg-blue-50", count: selectedMcqIds.length, available: availableCounts.mcqs },
              { key: "short", label: "Short Questions", color: "text-emerald-600", bg: "bg-emerald-50", count: selectedShortIds.length, available: availableCounts.shorts },
              { key: "long", label: "Long Questions", color: "text-violet-600", bg: "bg-violet-50", count: selectedLongIds.length, available: availableCounts.longs },
            ].map((tab) => (
              <div key={tab.key} className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-medium", tab.color)}>{tab.label}</span>
                    <span className="text-xs text-[#9CA3AF]">{tab.available} available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openQuestionPicker(tab.key as any)}
                      className={cn("text-lg font-bold min-w-[40px]", tab.color)}
                    >
                      {tab.count}
                    </button>
                  </div>
                </div>

                {/* Select Questions Button */}
                <button
                  onClick={() => openQuestionPicker(tab.key as any)}
                  className={cn("w-full mt-3 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2", tab.bg, tab.color)}
                >
                  <Plus className="w-4 h-4" />
                  {tab.count > 0 ? 'Add / Remove Questions' : 'Select Questions'}
                </button>
                
                {/* Selected preview */}
                {tab.count > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {(tab.key === "mcq" ? selectedMcqIds : tab.key === "short" ? selectedShortIds : selectedLongIds).slice(0, 10).map((id, idx) => (
                        <span key={`${tab.key}-${id}-${idx}`} className={cn("px-2 py-0.5 rounded text-xs", tab.bg, tab.color)}>Q{idx + 1}</span>
                      ))}
                      {(tab.key === "mcq" ? selectedMcqIds.length : tab.key === "short" ? selectedShortIds.length : selectedLongIds.length) > 10 && (
                        <span className="text-xs text-[#9CA3AF]">+{tab.key === "mcq" ? selectedMcqIds.length - 10 : tab.key === "short" ? selectedShortIds.length - 10 : selectedLongIds.length - 10} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </ScrollView>

      {/* Generate Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] p-4 pb-6 shadow-[0px_-8px_24px_rgba(0,0,0,0.4)]">
        <div className="mx-auto max-w-[428px]">
          <Button
            onClick={handleGenerate}
            disabled={totalQuestions === 0 || isGenerating}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] font-semibold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Paper
                {totalQuestions > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                    {totalQuestions}Q • {totalMarks}M
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Question Picker Modal */}
      <AnimatePresence>
        {showQuestionPicker && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowQuestionPicker(false);
              setSearchQuery("");
            }}
          >
            <motion.div
              className="bg-[#1A1A1A] rounded-t-[20px] w-full max-h-[85vh] overflow-hidden flex flex-col border border-[#2A2A2A]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b bg-[#1A1A1A] border-[#2A2A2A]">
                <div>
                  <h3 className="font-semibold text-white">
                    Select {activeTab === 'mcq' ? 'MCQ' : activeTab === 'short' ? 'Short' : 'Long'} Questions
                  </h3>
                  <p className="text-xs text-[#6B7280]">{currentSelectedIds.length} selected • {currentQuestions.length} available</p>
                </div>
                <button 
                  onClick={() => {
                    setShowQuestionPicker(false);
                    setSearchQuery("");
                  }} 
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 border-b bg-[#1A1A1A] border-[#2A2A2A]">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm"
                />
                <div className="flex gap-2 mt-2">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", difficultyFilter === diff ? "bg-[#B9FF66] text-[#0A0A0A]" : "bg-[#2A2A2A] text-[#A0A0A0]")}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {Object.keys(filteredQuestions).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-20 h-20 text-gray-300 mb-4" viewBox="0 0 80 80" fill="none">
                      <circle cx="40" cy="40" r="35" fill="#F3F4F6" />
                      <path d="M25 35h30M25 45h20" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="40" cy="55" r="8" fill="#E5E7EB" />
                      <path d="M36 55h8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-[#6B7280] font-medium">No questions found</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">Try changing search or difficulty filter</p>
                  </div>
                ) : (
                  Object.entries(filteredQuestions).map(([chapterId, questions]) => {
                    const selected = questions.filter(q => currentSelectedIds.includes(q.id)).length;
                    const isExpanded = expandedChapters.has(chapterId);
                    return (
                      <div key={chapterId} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedChapters(prev => { const n = new Set(prev); n.has(chapterId) ? n.delete(chapterId) : n.add(chapterId); return n; })}
                          className="w-full flex items-center justify-between p-3 bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#6B7280]" />
                            <span className="text-sm font-medium text-white">{getChapterName(chapterId)}</span>
                            <span className="text-xs text-[#9CA3AF]">({questions.length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selected > 0 && <span className="px-2 py-0.5 bg-[#1E88E5] text-white text-xs rounded-full">{selected}/{questions.length}</span>}
                            {isExpanded ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-2 space-y-2">
                            {questions.map((q) => {
                              const isSelected = currentSelectedIds.includes(q.id);
                              const diff = DIFFICULTY_COLORS[q.difficulty];
                              const mcqOptions = 'options' in q ? (q as any).options : null;
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => toggleQuestion(q.id)}
                                  className={cn("w-full flex items-start gap-3 p-3 rounded-[12px] text-left touch-manipulation", isSelected ? "bg-[#B9FF66]/20 border border-[#B9FF66]" : "hover:bg-[#2A2A2A] bg-[#1A1A1A] border border-[#2A2A2A]")}
                                >
                                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5", isSelected ? "bg-[#1E88E5] border-[#1E88E5]" : "border-gray-300")}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">{q.questionText}</p>
                                    {/* Show MCQ options if available */}
                                    {mcqOptions && Array.isArray(mcqOptions) && (
                                      <div className="mt-2 space-y-1">
                                        {mcqOptions.map((opt: string, idx: number) => (
                                          <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                            <span className="font-medium">{String.fromCharCode(97 + idx)})</span> {opt}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", diff.bg, diff.color)}>{diff.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t bg-[#1A1A1A] border-[#2A2A2A]">
                <Button onClick={() => {
                  setShowQuestionPicker(false);
                  setSearchQuery("");
                }} className="w-full h-12 rounded-xl bg-[#1E88E5] text-white">
                  Done ({currentSelectedIds.length} selected)
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
              <div className="w-16 h-16 border-4 border-[#1E88E5]/30 border-t-[#1E88E5] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">{statusMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
