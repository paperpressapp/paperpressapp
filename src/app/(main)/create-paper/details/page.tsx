"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronDown, ChevronUp, Upload, Type, 
  Clock, Calendar, Building2, FileText, Sparkles, Image
} from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { triggerHaptic } from "@/hooks";
import { cn } from "@/lib/utils";

export default function CreatePaperDetailsPage() {
  const router = useRouter();
  const {
    selectedClass, selectedSubject, selectedChapters,
    selectedMcqIds, selectedShortIds, selectedLongIds,
    paperSettings, updateSettings, setStep
  } = usePaperStore();

  const [title, setTitle] = useState(paperSettings.title || `${selectedClass} ${selectedSubject} Test Paper`);
  const [instituteName, setInstituteName] = useState(paperSettings.instituteName || "");
  const [date, setDate] = useState(paperSettings.date || new Date().toISOString().split('T')[0]);
  const [timeAllowed, setTimeAllowed] = useState(paperSettings.timeAllowed || "2 Hours");
  const [showLogo, setShowLogo] = useState(paperSettings.showLogo || false);
  const [logoPreview, setLogoPreview] = useState<string | null>(paperSettings.instituteLogo || null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fontSize, setFontSize] = useState(paperSettings.fontSize || 12);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [includeBubbleSheet, setIncludeBubbleSheet] = useState(false);

  // Marks
  const [mcqMarks, setMcqMarks] = useState(paperSettings.customMarks?.mcq || 1);
  const [shortMarks, setShortMarks] = useState(paperSettings.customMarks?.short || 2);
  const [longMarks, setLongMarks] = useState(paperSettings.customMarks?.long || 5);

  // Validate
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      router.push('/create-paper/templates');
      return;
    }
    if (selectedChapters.length === 0) {
      router.push('/create-paper/chapters');
      return;
    }
    if (selectedMcqIds.length === 0 && selectedShortIds.length === 0 && selectedLongIds.length === 0) {
      router.push('/create-paper/questions');
      return;
    }
  }, [selectedClass, selectedSubject, selectedChapters, selectedMcqIds, selectedShortIds, selectedLongIds, router]);

  // Calculate totals
  const totalQuestions = selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length;
  const totalMarks = (selectedMcqIds.length * mcqMarks) + (selectedShortIds.length * shortMarks) + (selectedLongIds.length * longMarks);

  const handleNext = useCallback(() => {
    triggerHaptic('medium');
    updateSettings({
      title,
      instituteName,
      date,
      timeAllowed,
      showLogo,
      instituteLogo: logoPreview,
      customMarks: { mcq: mcqMarks, short: shortMarks, long: longMarks },
      fontSize,
    });
    setStep('preview');
    router.push('/create-paper/preview');
  }, [title, instituteName, date, timeAllowed, showLogo, logoPreview, mcqMarks, shortMarks, longMarks, fontSize, includeWatermark, updateSettings, setStep, router]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    setStep('questions');
    router.push('/create-paper/questions');
  }, [setStep, router]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
        setShowLogo(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={handleBack} className="text-[#6B7280] hover:text-white text-sm font-medium">
                ← Back
              </button>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span>Templates</span>
                <ChevronRight className="w-3 h-3" />
                <span>Chapters</span>
                <ChevronRight className="w-3 h-3" />
                <span>Questions</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#B9FF66]">Details</span>
                <ChevronRight className="w-3 h-3" />
                <span>Preview</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mt-3">Paper Details</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
          {/* Paper Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">Paper Information</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Paper Title</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B9FF66]/50"
                    placeholder="Enter paper title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#6B7280] block mb-1">Exam Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#B9FF66]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] block mb-1">Time Allowed</label>
                  <select
                    value={timeAllowed}
                    onChange={(e) => setTimeAllowed(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#B9FF66]/50"
                  >
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="45 Minutes">45 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="1.5 Hours">1.5 Hours</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="2.5 Hours">2.5 Hours</option>
                    <option value="3 Hours">3 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Institute Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">Institute</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Institute Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="text"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B9FF66]/50"
                    placeholder="Enter institute name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Logo (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#B9FF66]/30 transition-all">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <Upload className="w-6 h-6 text-[#6B7280]" />
                      )}
                    </div>
                  </label>
                  <div className="flex-1">
                    <button
                      onClick={() => { setShowLogo(!showLogo); }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        showLogo ? "bg-[#B9FF66] text-[#0A0A0A]" : "bg-white/5 text-[#6B7280] border border-white/10"
                      )}
                    >
                      {showLogo ? 'Logo Visible' : 'Hide Logo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marks Configuration */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">Marks per Question</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5">
                <p className="text-xs text-[#6B7280] mb-2">MCQ</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMcqMarks(Math.max(1, mcqMarks - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-white">{mcqMarks}</span>
                  <button
                    onClick={() => setMcqMarks(mcqMarks + 1)}
                    className="w-8 h-8 rounded-lg bg-[#B9FF66]/10 flex items-center justify-center text-[#B9FF66]"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5">
                <p className="text-xs text-[#6B7280] mb-2">Short</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShortMarks(Math.max(1, shortMarks - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-white">{shortMarks}</span>
                  <button
                    onClick={() => setShortMarks(shortMarks + 1)}
                    className="w-8 h-8 rounded-lg bg-[#B9FF66]/10 flex items-center justify-center text-[#B9FF66]"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5">
                <p className="text-xs text-[#6B7280] mb-2">Long</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLongMarks(Math.max(1, longMarks - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-white">{longMarks}</span>
                  <button
                    onClick={() => setLongMarks(longMarks + 1)}
                    className="w-8 h-8 rounded-lg bg-[#B9FF66]/10 flex items-center justify-center text-[#B9FF66]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-white/5"
            >
              <span className="text-sm font-medium text-white">Advanced Options</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-[#6B7280] block mb-2">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="10"
                      max="16"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-[#B9FF66]"
                    />
                  </div>

                  <button
                    onClick={() => setIncludeWatermark(!includeWatermark)}
                    className={cn(
                      "w-full p-4 rounded-xl flex items-center justify-between transition-all",
                      includeWatermark ? "bg-[#B9FF66]/10 border border-[#B9FF66]/30" : "bg-white/5 border border-white/10"
                    )}
                  >
                    <span className="text-sm font-medium text-white">Watermark</span>
                    <div className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      includeWatermark ? "bg-[#B9FF66]" : "bg-white/20"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        includeWatermark ? "translate-x-5" : "translate-x-1"
                      )} />
                    </div>
                  </button>

                  <button
                    onClick={() => setIncludeBubbleSheet(!includeBubbleSheet)}
                    className={cn(
                      "w-full p-4 rounded-xl flex items-center justify-between transition-all",
                      includeBubbleSheet ? "bg-[#B9FF66]/10 border border-[#B9FF66]/30" : "bg-white/5 border border-white/10"
                    )}
                  >
                    <span className="text-sm font-medium text-white">Bubble Sheet (OMR)</span>
                    <div className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      includeBubbleSheet ? "bg-[#B9FF66]" : "bg-white/20"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        includeBubbleSheet ? "translate-x-5" : "translate-x-1"
                      )} />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0A] to-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3 px-4">
              <span className="text-[#6B7280] text-sm">{totalQuestions} Questions</span>
              <span className="text-[#B9FF66] font-bold">{totalMarks} Marks</span>
            </div>
            <Button
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-[#B9FF66] text-[#0A0A0A] font-bold text-lg hover:bg-[#a3e659]"
            >
              <span className="flex items-center gap-2">
                Next: Preview Paper
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
