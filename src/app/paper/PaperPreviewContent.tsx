"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Share2, Plus, Check, FileText, Clock, BookOpen, Hash, MessageCircle, Mail, Copy, CheckCircle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollView, MainLayout } from "@/components/layout";
import { toast } from "@/hooks";
import { usePaperStore, useAuthStore } from "@/stores";
import { getPaperById } from "@/lib/storage/papers";
import { getQuestionsByIds } from "@/data";
import { fetchAndDownloadPDF, fetchAndPreviewPDF, fetchAndDownloadDOCX } from "@/lib/pdf/download";
import { AppLoader } from "@/components/shared";
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { QUESTION_MARKS } from "@/types/question";
import type { GeneratedPaper, MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

export default function PaperPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetAll } = usePaperStore();
  const { isPremium } = useAuthStore();

  const paperId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [questions, setQuestions] = useState<{ mcqs: MCQQuestion[]; shorts: ShortQuestion[]; longs: LongQuestion[] }>({ mcqs: [], shorts: [], longs: [] });
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !paperId) return;
    loadedRef.current = true;

    const loadPaper = async () => {
      try {
        const paperData = getPaperById(paperId);

        if (!paperData) {
          toast.error("Paper not found");
          router.replace("/home");
          return;
        }

        setPaper(paperData);

        const mcqs: MCQQuestion[] = [];
        const shorts: ShortQuestion[] = [];
        const longs: LongQuestion[] = [];

        const allQuestions = getQuestionsByIds(paperData.classId, paperData.subject, [...paperData.mcqIds, ...paperData.shortIds, ...paperData.longIds]);

        allQuestions.forEach((q) => {
          if ('options' in q && paperData.mcqIds.includes(q.id)) {
            mcqs.push(q as MCQQuestion);
          } else if (paperData.shortIds.includes(q.id)) {
            shorts.push(q as ShortQuestion);
          } else if (paperData.longIds.includes(q.id)) {
            longs.push(q as LongQuestion);
          }
        });

        setQuestions({ mcqs, shorts, longs });
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load paper");
        router.replace("/home");
      }
    };

    loadPaper();
  }, [paperId]);

  const getSettings = useCallback(() => {
    if (!paper) return null;
    return {
      instituteName: paper.instituteName || "Institution",
      date: paper.date,
      timeAllowed: paper.timeAllowed,
      classId: paper.classId,
      subject: paper.subject,
      instituteLogo: paper.instituteLogo || null,
      customHeader: paper.customHeader || '',
      customSubHeader: paper.customSubHeader || '',
      showLogo: paper.showLogo && !!paper.instituteLogo,
      isPremium: isPremium,
      includeAnswerSheet: paper.includeAnswerSheet ?? true,
      customMarks: paper.customMarks || { mcq: 1, short: 5, long: 10 },
      attemptRules: { shortAttempt: paper.shortCount, longAttempt: paper.longCount },
      syllabus: paper.syllabus || '',
      instituteAddress: paper.instituteAddress || '',
      instituteEmail: paper.instituteEmail || '',
      institutePhone: paper.institutePhone || '',
      instituteWebsite: paper.instituteWebsite || '',
    };
  }, [paper, isPremium]);

  const handleDownloadPDF = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);
    const result = await fetchAndDownloadPDF(settings, questions.mcqs, questions.shorts, questions.longs);
    setIsGenerating(false);

    if (result.success) {
      toast.success(Capacitor.isNativePlatform() ? "PDF saved to Documents/PaperPress" : "PDF downloaded!");
    } else {
      toast.error(result.error || "Failed to download PDF");
    }
  }, [questions, getSettings]);

  const handlePreviewPDF = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);
    const result = await fetchAndPreviewPDF(settings, questions.mcqs, questions.shorts, questions.longs);
    setIsGenerating(false);

    if (!result.success) {
      toast.error(result.error || "Failed to preview PDF");
    }
  }, [questions, getSettings]);

  const handleDownloadDOCX = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);
    const result = await fetchAndDownloadDOCX(settings, questions.mcqs, questions.shorts, questions.longs);
    setIsGenerating(false);

    if (result.success) {
      toast.success("DOCX downloaded!");
    } else {
      toast.error(result.error || "Failed to download DOCX");
    }
  }, [questions, getSettings]);

  const getShareText = useCallback(() => {
    if (!paper) return "";
    return `${paper.title}\n\nSubject: ${paper.subject}\nClass: ${paper.classId}\nMarks: ${paper.totalMarks}\nQuestions: ${paper.questionCount}\nDate: ${paper.date}\n\nGenerated with PaperPress`;
  }, [paper]);

  const handleWhatsAppShare = useCallback(async () => {
    const shareText = getShareText();
    
    // On Android, use native share sheet
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: paper?.title || "Paper",
          text: shareText,
          dialogTitle: 'Share via',
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Web: open WhatsApp web
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
    setShowShareSheet(false);
  }, [paper, getShareText]);

  const handleEmailShare = useCallback(async () => {
    const shareText = getShareText();
    
    // On Android, use native share sheet
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: paper?.title || "Paper",
          text: shareText,
          dialogTitle: 'Share via',
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Web: open mailto
      if (paper) {
        window.location.href = `mailto:?subject=${encodeURIComponent(paper.title)}&body=${encodeURIComponent(shareText)}`;
      }
    }
    setShowShareSheet(false);
  }, [paper, getShareText]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [getShareText, toast]);

  const handleNativeShare = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({ title: paper?.title || "Paper", text: getShareText() });
      } catch {
        setShowShareSheet(true);
      }
    } else {
      setShowShareSheet(true);
    }
  }, [paper, getShareText]);

  const handleCreateAnother = useCallback(() => {
    resetAll();
    router.push("/home");
  }, [resetAll, router]);

  if (isLoading) return <AppLoader message="Loading paper..." />;
  if (!paper) return null;

  return (
    <MainLayout showBottomNav={false} className="bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto max-w-[428px]">
            <div className="glass-panel border-b border-white/10">
              <div className="px-4 h-14 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20" onClick={() => router.push("/home")}>
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Button>
                <h1 className="font-bold text-lg text-white">Paper Ready</h1>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20" onClick={handleNativeShare} disabled={isGenerating}>
                  <Share2 className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <ScrollView className="pt-[56px] flex-1 pb-8">
          {/* Success Card */}
          <div className="mx-5 mt-4">
            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">{paper.title}</h2>
                    <p className="text-sm text-emerald-600 font-medium mt-1">Generated Successfully</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-[#1E88E5]/10 rounded-xl px-3 py-2">
                    <BookOpen className="w-4 h-4 text-[#1E88E5]" />
                    <span className="text-sm font-medium text-gray-700">{paper.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-violet-500/10 rounded-xl px-3 py-2">
                    <Hash className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-medium text-gray-700">{paper.classId} Class</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-3 py-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{paper.totalMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-3 py-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-700">{paper.timeAllowed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="mx-5 mt-4">
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Question Breakdown</p>
              <div className="space-y-2">
                {[
                  { label: "MCQs", count: paper.mcqCount, marks: paper.mcqCount * QUESTION_MARKS.mcq, color: "bg-[#1E88E5]" },
                  { label: "Short", count: paper.shortCount, marks: paper.shortCount * QUESTION_MARKS.short, color: "bg-emerald-500" },
                  { label: "Long", count: paper.longCount, marks: paper.longCount * QUESTION_MARKS.long, color: "bg-violet-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{item.count} Q</span>
                      <span className="text-xs text-gray-400">{item.marks} marks</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-sm font-bold text-[#1E88E5]">{paper.questionCount} Questions • {paper.totalMarks} Marks</span>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-4 mt-4 space-y-3"
          >
            <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all disabled:opacity-50">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download PDF</>
              )}
            </Button>

            <Button onClick={handleDownloadDOCX} disabled={isGenerating} variant="outline" className="w-full h-10 rounded-lg font-medium text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm disabled:opacity-50">
              <FileDown className="w-4 h-4 mr-1.5" /> Word (.docx)
            </Button>
          </motion.div>

          {/* Preview & Share */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-4 mt-3 grid grid-cols-2 gap-2"
          >
            <Button variant="outline" onClick={handlePreviewPDF} disabled={isGenerating} className="h-10 rounded-lg font-medium text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
              <FileText className="w-4 h-4 mr-1.5" /> Preview
            </Button>
            <Button variant="outline" onClick={handleNativeShare} disabled={isGenerating} className="h-10 rounded-lg font-medium text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-md">
              <Share2 className="w-4 h-4 mr-1.5" /> Share
            </Button>
          </motion.div>

          {/* Quick Share */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-4 mt-4"
          >
            <p className="text-[10px] font-medium text-white/40 uppercase mb-3 px-1">Quick Share</p>
            <div className="grid grid-cols-3 gap-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppShare} 
                className="bg-white rounded-xl p-2.5 flex flex-col items-center gap-1.5 shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-600">WhatsApp</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleEmailShare} 
                className="bg-white rounded-xl p-2.5 flex flex-col items-center gap-1.5 shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-600">Email</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink} 
                className="bg-white rounded-xl p-2.5 flex flex-col items-center gap-1.5 shadow"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${copied ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                  {copied ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                </div>
                <span className="text-[10px] font-medium text-gray-600">{copied ? 'Copied!' : 'Copy'}</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Create Another */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-5 mt-8 mb-8"
          >
            <Button variant="outline" onClick={handleCreateAnother} className="w-full h-14 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-bold hover:bg-white/20 transition-all">
              <Plus className="w-5 h-5 mr-2" /> Create Another Paper
            </Button>
          </motion.div>

          <div className="h-8" />
        </ScrollView>
      </div>

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareSheet(false)} />
            <motion.div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}>
              <div className="w-12 h-1.5 rounded-full bg-gray-200 mx-auto mb-6" />
              <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Share Paper</h3>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={handleWhatsAppShare} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-green-500/30">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">WhatsApp</span>
                </button>
                <button onClick={handleEmailShare} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Email</span>
                </button>
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${copied ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-gray-500 shadow-gray-500/30'}`}>
                    {copied ? <CheckCircle className="w-7 h-7 text-white" /> : <Copy className="w-7 h-7 text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <Button variant="outline" onClick={() => setShowShareSheet(false)} className="w-full h-12 mt-6 rounded-xl">Cancel</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
