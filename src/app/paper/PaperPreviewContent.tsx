"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Share2, Plus, Printer, Check,
  FileText, Clock, Calendar, BookOpen, Hash,
  MessageCircle, Mail, Copy, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollView, MainLayout } from "@/components/layout";
import { toast } from "@/hooks";
import { usePaperStore } from "@/stores";
import { getPaperById } from "@/lib/storage/papers";
import { getQuestionsByIds } from "@/data";
import { fetchAndDownloadPDF, fetchAndPreviewPDF } from "@/lib/pdf/download";
import { AppLoader } from "@/components/shared";
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { QUESTION_MARKS } from "@/types/question";
import type { GeneratedPaper, MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

const isNative = () => Capacitor.isNativePlatform();

export default function PaperPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetAll } = usePaperStore();

  const paperId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [questions, setQuestions] = useState<{
    mcqs: MCQQuestion[];
    shorts: ShortQuestion[];
    longs: LongQuestion[];
  }>({ mcqs: [], shorts: [], longs: [] });
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    if (!paperId) return;

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

        const allQuestions = getQuestionsByIds(
          paperData.classId,
          paperData.subject,
          [...paperData.mcqIds, ...paperData.shortIds, ...paperData.longIds]
        );

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
        console.error("Error loading paper:", error);
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
      examType: paper.examType,
      date: paper.date,
      timeAllowed: paper.timeAllowed,
      classId: paper.classId,
      subject: paper.subject,
      instituteLogo: paper.instituteLogo || null,
      customHeader: paper.customHeader || '',
      customSubHeader: paper.customSubHeader || '',
      showLogo: paper.showLogo && !!paper.instituteLogo,
    };
  }, [paper]);

  const handleDownloadPDF = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);

    const result = await fetchAndDownloadPDF(
      settings,
      questions.mcqs,
      questions.shorts,
      questions.longs
    );

    setIsGenerating(false);

    if (result.success) {
      const isNative = Capacitor.isNativePlatform();
      toast.success(
        isNative
          ? "PDF saved! Check Documents/PaperPress folder."
          : "PDF downloaded!"
      );
    } else {
      toast.error(result.error || "Failed to download PDF");
    }
  }, [questions, getSettings]);

  const handlePreviewPDF = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);

    const result = await fetchAndPreviewPDF(
      settings,
      questions.mcqs,
      questions.shorts,
      questions.longs
    );

    setIsGenerating(false);

    if (result.success) {
      if (Capacitor.isNativePlatform()) {
        toast.success("Opening PDF with system viewer...");
      }
    } else {
      toast.error(result.error || "Failed to preview PDF");
    }
  }, [questions, getSettings]);

  const getShareText = useCallback(() => {
    if (!paper) return "";
    const instituteName = localStorage.getItem("paperpress_user_institute") || "PaperPress";
    return `📝 ${paper.title}\n\n` +
      `📚 Subject: ${paper.subject}\n` +
      `🏫 Class: ${paper.classId}\n` +
      `📊 Total Marks: ${paper.totalMarks}\n` +
      `❓ Questions: ${paper.questionCount}\n` +
      `📅 Date: ${paper.date}\n\n` +
      `Generated with ${instituteName} using PaperPress App`;
  }, [paper]);

  const handleWhatsAppShare = useCallback(async () => {
    const text = encodeURIComponent(getShareText());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
    setShowShareSheet(false);
  }, [getShareText]);

  const handleEmailShare = useCallback(() => {
    if (!paper) return;
    const subject = encodeURIComponent(paper.title);
    const body = encodeURIComponent(getShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareSheet(false);
  }, [paper, getShareText]);

  const handleCopyLink = useCallback(async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [getShareText, toast]);

  const handleNativeShare = useCallback(async () => {
    if (isNative()) {
      try {
        await Share.share({
          title: paper?.title || "Paper",
          text: getShareText(),
        });
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

  if (isLoading) {
    return <AppLoader message="Preparing your paper..." />;
  }

  if (!paper) return null;

  const questionBreakdown = [
    { label: "MCQs", count: paper.mcqCount, marks: paper.mcqCount * QUESTION_MARKS.mcq, color: "bg-blue-500" },
    { label: "Short", count: paper.shortCount, marks: paper.shortCount * QUESTION_MARKS.short, color: "bg-green-500" },
    { label: "Long", count: paper.longCount, marks: paper.longCount * QUESTION_MARKS.long, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <MainLayout showBottomNav={false}>
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="fixed top-0 left-0 right-0 z-50 pt-safe">
            <div className="mx-auto max-w-[428px]">
              <div className="glass-panel border-b border-gray-100/50">
                <div className="px-4 h-14 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl active:bg-gray-100"
                    onClick={() => router.push("/home")}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </Button>
                  <h1 className="font-bold text-lg text-gray-900">Paper Ready</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNativeShare}
                    disabled={isGenerating}
                    className="h-10 w-10 rounded-xl active:bg-gray-100"
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <ScrollView className="pt-[56px] pt-safe flex-1 pb-8">
            <div className="mx-5 mt-4">
              <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-xl text-gray-900 leading-tight">
                        {paper.title}
                      </h2>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Generated Successfully
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 bg-[#1E88E5]/10 rounded-xl px-3 py-2">
                      <BookOpen className="w-4 h-4 text-[#1E88E5]" />
                      <span className="text-sm font-medium text-gray-700">{paper.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-500/10 rounded-xl px-3 py-2">
                      <Hash className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">{paper.classId} Class</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 rounded-xl px-3 py-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{paper.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-500/10 rounded-xl px-3 py-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">{paper.timeAllowed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-5 mt-4">
              <div className="glass-panel rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Question Breakdown</p>
                <div className="space-y-2">
                  {questionBreakdown.map((item) => (
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
                  <span className="text-sm font-bold text-[#1E88E5]">{paper.questionCount} Questions</span>
                </div>
              </div>
            </div>

            <div className="mx-5 mt-6">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] font-semibold text-base shadow-xl shadow-[#1E88E5]/30 active:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </span>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>

            <div className="mx-5 mt-3 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handlePreviewPDF}
                disabled={isGenerating}
                className="h-14 rounded-2xl border-2 border-gray-200 font-semibold bg-white/80 hover:bg-white"
              >
                <Printer className="w-5 h-5 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={handleNativeShare}
                disabled={isGenerating}
                className="h-14 rounded-2xl border-2 border-gray-200 font-semibold bg-white/80 active:bg-white"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>

            <div className="mx-5 mt-4">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3 px-1">Quick Share</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-white/95 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                </button>
                <button
                  onClick={handleEmailShare}
                  className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-white/95 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Email</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-white/95 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${copied ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {copied ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Copy className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="mx-5 mt-6">
              <Button
                variant="outline"
                onClick={handleCreateAnother}
                className="w-full h-14 rounded-2xl border-2 border-white/30 text-white active:bg-white/10 font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Another Paper
              </Button>
            </div>

            <div className="mx-5 mt-4 text-center">
              <p className="text-xs text-white/40">
                {paper.examType} • {paper.date}
              </p>
            </div>

            <div className="h-8" />
          </ScrollView>
        </div>
      </MainLayout>

      <AnimatePresence>
        {showShareSheet && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowShareSheet(false)}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-safe"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="w-12 h-1.5 rounded-full bg-gray-200 mx-auto mb-6" />
              <h3 className="text-lg font-bold text-gray-900 text-center mb-6">Share Paper Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-2 active:opacity-80"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                </button>
                <button
                  onClick={handleEmailShare}
                  className="flex flex-col items-center gap-2 active:opacity-80"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Email</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 active:opacity-80"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${copied ? 'bg-green-500 shadow-green-500/30' : 'bg-gray-500 shadow-gray-500/30'}`}>
                    {copied ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <Copy className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowShareSheet(false)}
                className="w-full h-12 mt-6 rounded-xl font-medium"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
