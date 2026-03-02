"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, Download, Share2, Plus, 
  MessageCircle, Mail, Copy, CheckCircle, ZoomIn, ZoomOut
} from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { getMcqsByChapterIds, getShortsByChapterIds, getLongsByChapterIds } from "@/data";
import { savePaper } from "@/lib/storage/papers";
import { triggerHaptic } from "@/hooks";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion } from "@/types";
import { LivePaperPreview } from "@/components/paper/LivePaperPreview";
import { toast } from "sonner";

export default function CreatePaperPreviewPage() {
  const router = useRouter();
  const {
    selectedClass, selectedSubject, selectedChapters,
    selectedMcqIds, selectedShortIds, selectedLongIds,
    paperSettings, setStep, questionOrder, editedQuestions,
    resetFlow
  } = usePaperStore();

  const [allMcqs, setAllMcqs] = useState<MCQQuestion[]>([]);
  const [allShorts, setAllShorts] = useState<ShortQuestion[]>([]);
  const [allLongs, setAllLongs] = useState<LongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Load questions
  useEffect(() => {
    const loadData = async () => {
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

      try {
        const [mcqs, shorts, longs] = await Promise.all([
          getMcqsByChapterIds(selectedClass, selectedSubject, selectedChapters),
          getShortsByChapterIds(selectedClass, selectedSubject, selectedChapters),
          getLongsByChapterIds(selectedClass, selectedSubject, selectedChapters)
        ]);

        setAllMcqs(mcqs);
        setAllShorts(shorts);
        setAllLongs(longs);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClass, selectedSubject, selectedChapters, router, selectedMcqIds, selectedShortIds, selectedLongIds]);

  // Get preview questions
  const mcqsForPreview = useMemo(() => 
    selectedMcqIds.map(id => allMcqs.find(q => q.id === id)).filter(Boolean) as MCQQuestion[],
    [selectedMcqIds, allMcqs]
  );
  
  const shortsForPreview = useMemo(() => 
    selectedShortIds.map(id => allShorts.find(q => q.id === id)).filter(Boolean) as ShortQuestion[],
    [selectedShortIds, allShorts]
  );
  
  const longsForPreview = useMemo(() => 
    selectedLongIds.map(id => allLongs.find(q => q.id === id)).filter(Boolean) as LongQuestion[],
    [selectedLongIds, allLongs]
  );

  const totalMarks = useMemo(() => {
    const mMarks = paperSettings.customMarks?.mcq || 1;
    const sMarks = paperSettings.customMarks?.short || 2;
    const lMarks = paperSettings.customMarks?.long || 5;
    return (selectedMcqIds.length * mMarks) + (selectedShortIds.length * sMarks) + (selectedLongIds.length * lMarks);
  }, [selectedMcqIds, selectedShortIds, selectedLongIds, paperSettings.customMarks]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    setStep('details');
    router.push('/create-paper/details');
  }, [setStep, router]);

  const handleGeneratePDF = useCallback(async () => {
    triggerHaptic('medium');
    setIsGenerating(true);

    try {
      // Create paper object
      const paper = {
        id: `paper_${Date.now()}`,
        classId: selectedClass!,
        subject: selectedSubject!,
        title: paperSettings.title || `${selectedClass} ${selectedSubject} Paper`,
        date: paperSettings.date || new Date().toISOString().split('T')[0],
        timeAllowed: paperSettings.timeAllowed || "2 Hours",
        totalMarks,
        questionCount: selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length,
        mcqCount: selectedMcqIds.length,
        shortCount: selectedShortIds.length,
        longCount: selectedLongIds.length,
        mcqIds: selectedMcqIds,
        shortIds: selectedShortIds,
        longIds: selectedLongIds,
        instituteName: paperSettings.instituteName || "",
        settings: paperSettings,
        editedQuestions,
        questionOrder,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      savePaper(paper);

      // Navigate to preview
      router.push(`/paper?id=${paper.id}`);
    } catch (error) {
      console.error("Error generating paper:", error);
      toast.error("Failed to generate paper");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedClass, selectedSubject, paperSettings, totalMarks, selectedMcqIds, selectedShortIds, selectedLongIds, editedQuestions, questionOrder, savePaper, router]);

  const handleCreateAnother = useCallback(() => {
    triggerHaptic('medium');
    resetFlow();
    router.push('/create-paper/templates');
  }, [resetFlow, router]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/paper?class=${selectedClass}&subject=${selectedSubject}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [selectedClass, selectedSubject]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#B9FF66]/30 border-t-[#B9FF66] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={handleBack} className="text-[#6B7280] hover:text-white text-sm font-medium flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <span>Templates</span>
                <ChevronRight className="w-3 h-3" />
                <span>Chapters</span>
                <ChevronRight className="w-3 h-3" />
                <span>Questions</span>
                <ChevronRight className="w-3 h-3" />
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#B9FF66]">Preview</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mt-3">Preview & Generate</h1>
            <p className="text-[#6B7280] text-sm">
              {selectedClass} • {selectedSubject} • {totalMarks} Marks
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#6B7280] w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="max-w-4xl mx-auto px-4 pb-40">
          <div 
            className="bg-white mx-auto transition-transform origin-top"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            <LivePaperPreview
              paperTitle={paperSettings.title || `${selectedClass} ${selectedSubject} Paper`}
              instituteName={paperSettings.instituteName || "Institute Name"}
              date={paperSettings.date || new Date().toISOString().split('T')[0]}
              timeAllowed={paperSettings.timeAllowed || "2 Hours"}
              totalMarks={totalMarks}
              mcqs={mcqsForPreview}
              shorts={shortsForPreview}
              longs={longsForPreview}
              editedQuestions={editedQuestions}
              questionOrder={questionOrder}
              settings={paperSettings}
              fontSize={paperSettings.fontSize || 12}
              logoPreview={paperSettings.instituteLogo || null}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A0A] to-transparent">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Generate Button */}
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full h-14 rounded-2xl bg-[#B9FF66] text-[#0A0A0A] font-bold text-lg hover:bg-[#a3e659] disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Generate PDF
                </span>
              )}
            </Button>

            {/* Secondary Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareSheet(true)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleCreateAnother}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <Plus className="w-4 h-4" />
                Create Another
              </button>
            </div>
          </div>
        </div>

        {/* Share Sheet */}
        <AnimatePresence>
          {showShareSheet && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowShareSheet(false)} />
              <motion.div
                className="relative bg-[#1A1A1A] rounded-t-[24px] w-full max-w-md p-6"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
              >
                <div className="w-12 h-1.5 rounded-full bg-[#2A2A2A] mx-auto mb-6" />
                <h3 className="text-white font-bold text-lg text-center mb-6">Share Paper</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      toast.info("Share via WhatsApp");
                      setShowShareSheet(false);
                    }}
                    className="w-full p-4 rounded-xl bg-[#25D366]/10 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      toast.info("Share via Email");
                      setShowShareSheet(false);
                    }}
                    className="w-full p-4 rounded-xl bg-white/5 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-white font-medium">Email</span>
                  </button>
                  
                  <button
                    onClick={handleCopyLink}
                    className="w-full p-4 rounded-xl bg-white/5 flex items-center gap-3"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      copied ? "bg-[#22c55e]" : "bg-white/10"
                    )}>
                      {copied ? <CheckCircle className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-white font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowShareSheet(false)}
                  className="w-full py-3 mt-4 text-[#6B7280] font-medium"
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
