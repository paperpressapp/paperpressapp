"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Share2, Plus, Check, FileText, Clock, BookOpen, Hash, MessageCircle, Mail, Copy, CheckCircle, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollView, MainLayout } from "@/components/layout";
import { toast } from "@/hooks";
import { usePaperStore, useAuthStore } from "@/stores";
import { getPaperById } from "@/lib/storage/papers";
import { getQuestionsByIds } from "@/data";
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { QUESTION_MARKS } from "@/types/question";
import { DEFAULT_MARKS } from "@/constants/paper";
import type { GeneratedPaper, MCQQuestion, ShortQuestion, LongQuestion } from "@/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LOADING_MESSAGES = {
  arranging: 'Arranging Paper...',
  compiling: 'Compiling Questions...',
  generating: 'Generating PDF...',
  bundling: 'Bundling Everything...',
  magical: 'Adding Final Touches...',
};

const LOADING_STEPS = ['arranging', 'compiling', 'generating', 'bundling', 'magical'];

export default function PaperPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetAll } = usePaperStore();
  const { isPremium } = useAuthStore();

  const paperId = searchParams.get('id') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('arranging');
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [questions, setQuestions] = useState<{ mcqs: MCQQuestion[]; shorts: ShortQuestion[]; longs: LongQuestion[] }>({ mcqs: [], shorts: [], longs: [] });
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPdfDownloaded, setIsPdfDownloaded] = useState(false);

  const loadedRef = useRef(false);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, []);

  const startLoadingAnimation = useCallback(() => {
    setLoadingStep('arranging');
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStep(prev => {
        const currentIndex = LOADING_STEPS.indexOf(prev);
        if (currentIndex < LOADING_STEPS.length - 1) {
          return LOADING_STEPS[currentIndex + 1];
        }
        return prev;
      });
    }, 2000);
  }, []);

  const stopLoadingAnimation = useCallback(() => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  }, []);

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

        const allQuestions = await getQuestionsByIds(paperData.classId || '9th', paperData.subject || 'Physics', [...(paperData.mcqIds || []), ...(paperData.shortIds || []), ...(paperData.longIds || [])]);

        allQuestions.forEach((q) => {
          if ('options' in q && paperData.mcqIds?.includes(q.id)) {
            mcqs.push(q as MCQQuestion);
          } else if (paperData.shortIds?.includes(q.id)) {
            shorts.push(q as ShortQuestion);
          } else if (paperData.longIds?.includes(q.id)) {
            longs.push(q as LongQuestion);
          }
        });

        // Add custom questions from editedQuestions (IDs starting with 'custom_')
        const editedQuestions = paperData.editedQuestions || {};
        
        // Add custom MCQs
        paperData.mcqIds?.forEach((id: string) => {
          if (typeof id === 'string' && id.startsWith('custom_') && editedQuestions[id]) {
            mcqs.push({
              id,
              questionText: editedQuestions[id].questionText || "Custom MCQ",
              options: editedQuestions[id].options || ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctOption: 0,
              difficulty: editedQuestions[id].difficulty || 'medium',
              chapterNumber: 0,
              marks: paperData.customMarks?.mcq || 1
            } as unknown as MCQQuestion);
          }
        });

        // Add custom Short questions
        paperData.shortIds?.forEach((id: string) => {
          if (typeof id === 'string' && id.startsWith('custom_') && editedQuestions[id]) {
            shorts.push({
              id,
              questionText: editedQuestions[id].questionText || "Custom Short Question",
              difficulty: editedQuestions[id].difficulty || 'medium',
              chapterNumber: 0,
              marks: paperData.customMarks?.short || 2
            } as unknown as ShortQuestion);
          }
        });

        // Add custom Long questions
        paperData.longIds?.forEach((id: string) => {
          if (typeof id === 'string' && id.startsWith('custom_') && editedQuestions[id]) {
            longs.push({
              id,
              questionText: editedQuestions[id].questionText || "Custom Long Question",
              difficulty: editedQuestions[id].difficulty || 'medium',
              chapterNumber: 0,
              marks: paperData.customMarks?.long || 5
            } as unknown as LongQuestion);
          }
        });

        setQuestions({ mcqs, shorts, longs });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading paper:', error);
        toast.error("Failed to load paper");
        router.replace("/home");
      }
    };

    loadPaper();
  }, [paperId, router]);

  const getSettings = useCallback(() => {
    if (!paper) return null;
    return {
      instituteName: paper.instituteName || "Institution",
      date: paper.date || new Date().toLocaleDateString(),
      timeAllowed: paper.timeAllowed || '2 Hours',
      classId: paper.classId || '9th',
      subject: paper.subject || 'Physics',
      instituteLogo: paper.instituteLogo || null,
      customHeader: paper.customHeader || '',
      customSubHeader: paper.customSubHeader || '',
      showLogo: paper.showLogo && !!paper.instituteLogo,
      showWatermark: paper.showWatermark ?? true,
      isPremium: isPremium,
      includeAnswerSheet: paper.includeAnswerSheet ?? true,
      customMarks: paper.customMarks || { ...DEFAULT_MARKS },
      attemptRules: { shortAttempt: paper.shortCount, longAttempt: paper.longCount },
      syllabus: paper.syllabus || '',
      instituteAddress: paper.instituteAddress || '',
      instituteEmail: paper.instituteEmail || '',
      institutePhone: paper.institutePhone || '',
      instituteWebsite: paper.instituteWebsite || '',
      includeBubbleSheet: paper.includeBubbleSheet ?? false,
      fontSize: paper.fontSize || 12,
      editedQuestions: paper?.editedQuestions || {} || {},
      questionOrder: paper?.questionOrder || {} || { mcqs: [], shorts: [], longs: [] },
    };
  }, [paper, isPremium]);

  const handleDownloadPDF = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);
    startLoadingAnimation();

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
        },
        body: JSON.stringify({
          settings,
          mcqs: questions.mcqs,
          shorts: questions.shorts,
          longs: questions.longs,
          editedQuestions: paper?.editedQuestions || {},
          questionOrder: paper?.questionOrder || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Server returned empty PDF");
      }

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const fileName = `${settings.classId}_${settings.subject}_${settings.date}.pdf`;
          await Filesystem.writeFile({
            path: `PaperPress/${fileName}`,
            data: base64,
            directory: Directory.Documents,
          });
          toast.success("PDF saved to Documents/PaperPress");
          setIsPdfDownloaded(true);
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${settings.classId}_${settings.subject}_${settings.date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded!");
        setIsPdfDownloaded(true);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to download PDF");
    } finally {
      stopLoadingAnimation();
      setIsGenerating(false);
    }
  }, [questions, getSettings, startLoadingAnimation, stopLoadingAnimation]);

  const handlePreviewPDF = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);
    startLoadingAnimation();

    try {
      const response = await fetch('/api/preview-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
        },
        body: JSON.stringify({
          settings,
          mcqs: questions.mcqs,
          shorts: questions.shorts,
          longs: questions.longs,
          editedQuestions: paper?.editedQuestions || {},
          questionOrder: paper?.questionOrder || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to preview PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error("Failed to preview PDF");
    } finally {
      stopLoadingAnimation();
      setIsGenerating(false);
    }
  }, [questions, getSettings, startLoadingAnimation, stopLoadingAnimation]);

  const handleDownloadDOCX = useCallback(async () => {
    const settings = getSettings();
    if (!settings) return;

    setIsGenerating(true);
    startLoadingAnimation();

    try {
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
        },
        body: JSON.stringify({
          settings,
          mcqs: questions.mcqs,
          shorts: questions.shorts,
          longs: questions.longs,
          editedQuestions: paper?.editedQuestions || {},
          questionOrder: paper?.questionOrder || {}
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate DOCX");
      }

      const blob = await response.blob();

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const fileName = `${settings.classId}_${settings.subject}_${settings.date}.docx`;
          await Filesystem.writeFile({
            path: `PaperPress/${fileName}`,
            data: base64,
            directory: Directory.Documents,
          });
          toast.success("DOCX saved to Documents/PaperPress");
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${settings.classId}_${settings.subject}_${settings.date}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("DOCX downloaded!");
      }
    } catch (error) {
      console.error('DOCX error:', error);
      toast.error("Failed to download DOCX");
    } finally {
      stopLoadingAnimation();
      setIsGenerating(false);
    }
  }, [questions, getSettings, startLoadingAnimation, stopLoadingAnimation]);

  const getShareText = useCallback(() => {
    if (!paper) return "";
    return `${paper.title}\n\nSubject: ${paper.subject}\nClass: ${paper.classId}\nMarks: ${paper.totalMarks}\nQuestions: ${paper.questionCount}\nDate: ${paper.date}\n\nGenerated with PaperPress`;
  }, [paper]);

  const generateAndGetPDFBlob = useCallback(async (): Promise<Blob | null> => {
    const settings = getSettings();
    if (!settings) return null;

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
        },
        body: JSON.stringify({
          settings,
          mcqs: questions.mcqs,
          shorts: questions.shorts,
          longs: questions.longs,
          editedQuestions: paper?.editedQuestions || {},
          questionOrder: paper?.questionOrder || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate PDF");
        return null;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        toast.error("Server returned empty PDF");
        return null;
      }

      return blob;
    } catch (error) {
      toast.error("Failed to generate PDF");
      return null;
    }
  }, [questions, getSettings]);

  const handleWhatsAppShare = useCallback(async () => {
    if (!isPdfDownloaded) {
      toast.info("Please download the PDF first, then click share again");
      return;
    }

    setShowShareSheet(false);
    setIsGenerating(true);
    try {
      const blob = await generateAndGetPDFBlob();

      if (!blob) {
        setIsGenerating(false);
        return;
      }

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const fileName = `PaperPress_${paper?.classId}_${paper?.subject}_${paper?.date}.pdf`;

          try {
            await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Cache,
            });
            const fileUri = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });

            const shareResult = await Share.share({
              title: paper?.title || "Exam Paper",
              text: getShareText(),
              url: fileUri.uri,
              dialogTitle: 'Share via WhatsApp',
            });

            if (!shareResult) {
              toast.info("Share cancelled");
            } else {
              toast.success("Shared via WhatsApp");
            }
          } catch (shareError: any) {
            if (shareError?.message?.includes('User did not share')) {
              toast.info("Share cancelled");
            } else {
              console.error('Share error:', shareError);
              toast.error("Failed to share");
            }
          }
          setIsGenerating(false);
        };
      } else {
        const file = new File([blob], `${paper?.title || 'Exam Paper'}.pdf`, { type: "application/pdf" });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: paper?.title || "Exam Paper",
              text: getShareText(),
            });
            toast.success("Shared successfully!");
            setIsGenerating(false);
            return;
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('Share error:', error);
            }
          }
        }

        toast.info("Please download the PDF and share it via WhatsApp");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast.error("Failed to share");
      setIsGenerating(false);
    }
  }, [paper, generateAndGetPDFBlob, getShareText, isPdfDownloaded]);

  const handleEmailShare = useCallback(async () => {
    if (!isPdfDownloaded) {
      toast.info("Please download the PDF first, then click share again");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await generateAndGetPDFBlob();

      if (!blob) {
        setIsGenerating(false);
        return;
      }

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const fileName = `${paper?.classId}_${paper?.subject}_${paper?.date}.pdf`;
          await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Cache,
          });
          const fileUri = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });

          await Share.share({
            title: paper?.title || "Paper",
            text: getShareText(),
            url: fileUri.uri,
            dialogTitle: 'Share via Email',
          });
        };
      } else {
        const file = new File([blob], `${paper?.title || 'Exam Paper'}.pdf`, { type: "application/pdf" });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: paper?.title || "Exam Paper",
              text: getShareText(),
            });
            toast.success("Shared successfully!");
            setIsGenerating(false);
            return;
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('Share error:', error);
            }
          }
        }

        const subject = encodeURIComponent(paper?.title || "Exam Paper");
        const body = encodeURIComponent(`${getShareText()}\n\n(Please find the PDF attached)`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    } catch (error) {
      console.error('Email share error:', error);
      toast.error("Failed to share");
    }
    setIsGenerating(false);
    setShowShareSheet(false);
  }, [paper, generateAndGetPDFBlob, getShareText, isPdfDownloaded]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [getShareText]);

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

  if (isLoading) return (
    <MainLayout showBottomNav={false} className="bg-[#0A0A0A]">
      <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-40">
        <div className="mx-auto max-w-[428px]">
          <div className="h-14 px-4 flex items-center justify-between">
            <Skeleton circle width={40} height={40} />
            <Skeleton width={120} height={24} />
            <Skeleton circle width={40} height={40} />
          </div>
        </div>
      </header>
      <div className="p-4 space-y-4">
        <Skeleton height={180} borderRadius={20} />
        <Skeleton height={120} borderRadius={20} />
        <Skeleton height={56} borderRadius={12} />
        <Skeleton height={44} borderRadius={40} />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton height={48} borderRadius={40} />
          <Skeleton height={48} borderRadius={40} />
        </div>
        <Skeleton height={100} borderRadius={20} />
        <Skeleton height={56} borderRadius={40} />
      </div>
    </MainLayout>
  );
  if (!paper) return null;

  return (
    <MainLayout showBottomNav={false} className="bg-[#0A0A0A]">
      <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-40">
        <div className="mx-auto max-w-[428px]">
          <div className="h-14 px-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[12px]" onClick={() => router.push("/home")}>
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="font-bold text-lg text-white">Paper Ready</h1>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[12px]" onClick={handleNativeShare} disabled={isGenerating}>
              <Share2 className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </header>

      <ScrollView className="flex-1 pb-8">
        <div className="px-4 py-4">
          <div className="bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] p-5 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-[16px] bg-[#22c55e] flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-white leading-tight">{paper.title}</h2>
                <p className="text-sm text-[#22c55e] font-medium mt-1">Generated Successfully</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-[12px] px-3 py-2">
                <BookOpen className="w-4 h-4 text-[#B9FF66]" />
                <span className="text-sm font-medium text-white">{paper.subject || 'Physics'}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-[12px] px-3 py-2">
                <Hash className="w-4 h-4 text-[#B9FF66]" />
                <span className="text-sm font-medium text-white">{paper.classId || '9th'} Class</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-[12px] px-3 py-2">
                <FileText className="w-4 h-4 text-[#B9FF66]" />
                <span className="text-sm font-medium text-white">{paper.totalMarks || 60} Marks</span>
              </div>
              <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-[12px] px-3 py-2">
                <Clock className="w-4 h-4 text-[#B9FF66]" />
                <span className="text-sm font-medium text-white">{paper.timeAllowed || '2 Hours'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <p className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">Question Breakdown</p>
            <div className="space-y-2">
              {[
                { label: "MCQs", count: paper.mcqCount || 0, marks: (paper.mcqCount || 0) * (paper.customMarks?.mcq || 1), color: "bg-[#B9FF66]" },
                { label: "Short", count: paper.shortCount || 0, marks: (paper.shortCount || 0) * (paper.customMarks?.short || 2), color: "bg-[#22c55e]" },
                { label: "Long", count: paper.longCount || 0, marks: (paper.longCount || 0) * (paper.customMarks?.long || 5), color: "bg-[#B9FF66]" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-[#A0A0A0]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{item.count} Q</span>
                    <span className="text-xs text-[#A0A0A0]">{item.marks} marks</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex justify-between">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-sm font-bold text-[#B9FF66]">{paper.questionCount || 0} Questions • {paper.totalMarks || 0} Marks</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full h-14 rounded-[40px] bg-[#B9FF66] text-[#0A0A0A] font-semibold shadow-lg disabled:opacity-50">
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {LOADING_MESSAGES[loadingStep as keyof typeof LOADING_MESSAGES] || 'Generating...'}
              </span>
            ) : (
              <><Download className="w-5 h-5 mr-2" /> Download PDF</>
            )}
          </Button>

          <Button onClick={handleDownloadDOCX} disabled={isGenerating} variant="outline" className="w-full h-11 rounded-[40px] font-medium text-sm mt-2 bg-transparent text-white border border-[#2A2A2A] hover:bg-[#2A2A2A] disabled:opacity-50">
            <FileDown className="w-4 h-4 mr-2" /> Download Word (.docx)
          </Button>
        </div>

        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handlePreviewPDF} disabled={isGenerating} className="h-12 rounded-[40px] font-medium text-sm bg-transparent text-white border border-[#2A2A2A] hover:bg-[#2A2A2A]">
            <FileText className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button onClick={handleNativeShare} disabled={isGenerating} className="h-12 rounded-[40px] font-medium text-sm bg-[#22c55e] text-white shadow-md">
            <Share2 className="w-4 h-4 mr-2" /> Share Paper
          </Button>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-[#A0A0A0] uppercase mb-3">Quick Share</p>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppShare}
              disabled={isGenerating}
              className="bg-[#1A1A1A] rounded-[20px] p-3 flex flex-col items-center gap-2 border border-[#2A2A2A] disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-white">WhatsApp</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleEmailShare}
              disabled={isGenerating}
              className="bg-[#1A1A1A] rounded-[20px] p-3 flex flex-col items-center gap-2 border border-[#2A2A2A] disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <span className="text-xs font-medium text-white">Email</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="bg-[#1A1A1A] rounded-[20px] p-3 flex flex-col items-center gap-2 border border-[#2A2A2A]"
            >
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${copied ? 'bg-[#22c55e]' : 'bg-[#2A2A2A]'}`}>
                {copied ? <CheckCircle className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </div>
              <span className="text-xs font-medium text-white">{copied ? 'Copied!' : 'Copy'}</span>
            </motion.button>
          </div>
        </div>

        <div className="px-4 py-4">
          <Button variant="outline" onClick={handleCreateAnother} className="w-full h-14 rounded-[40px] border-2 border-[#2A2A2A] text-white font-bold hover:bg-[#2A2A2A]">
            <Plus className="w-5 h-5 mr-2" /> Create Another Paper
          </Button>
        </div>

        <div className="h-8" />
      </ScrollView>

      <AnimatePresence>
        {showShareSheet && (
          <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareSheet(false)} />
            <motion.div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[20px] p-6 border border-[#2A2A2A]" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}>
              <div className="w-12 h-1.5 rounded-full bg-[#2A2A2A] mx-auto mb-6" />
              <h3 className="text-lg font-bold text-white text-center mb-6">Share Paper</h3>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="ghost" onClick={handleWhatsAppShare} className="flex flex-col h-auto gap-2 py-3 px-2 rounded-[20px] hover:bg-[#2A2A2A]">
                  <div className="w-14 h-14 rounded-[16px] bg-[#25D366] flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm text-white">WhatsApp</span>
                </Button>
                <Button variant="ghost" onClick={handleEmailShare} className="flex flex-col h-auto gap-2 py-3 px-2 rounded-[20px] hover:bg-[#2A2A2A]">
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-lg">
                    <Mail className="w-7 h-7 text-[#0A0A0A]" />
                  </div>
                  <span className="text-sm text-white">Email</span>
                </Button>
                <Button variant="ghost" onClick={handleCopyLink} className="flex flex-col h-auto gap-2 py-3 px-2 rounded-[20px] hover:bg-[#2A2A2A]">
                  <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center shadow-lg ${copied ? 'bg-[#22c55e]' : 'bg-[#2A2A2A]'}`}>
                    {copied ? <CheckCircle className="w-7 h-7 text-white" /> : <Copy className="w-7 h-7 text-white" />}
                  </div>
                  <span className="text-sm text-white">{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowShareSheet(false)} className="w-full h-12 mt-6 rounded-[40px] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A]">Cancel</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#0A0A0A]/95 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full border-4 border-[#2A2A2A]" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#B9FF66]"
                />
                <div className="absolute inset-2 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                  <FileSpreadsheet className="w-10 h-10 text-[#B9FF66]" />
                </div>
              </motion.div>
              <motion.h2
                className="text-xl font-bold text-white mb-2"
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {LOADING_MESSAGES[loadingStep as keyof typeof LOADING_MESSAGES] || 'Generating...'}
              </motion.h2>
              <motion.p
                className="text-sm text-[#A0A0A0]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Please wait while we create your paper...
              </motion.p>

              <motion.button
                className="mt-6 px-6 py-2 text-sm text-[#A0A0A0] hover:text-white font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  stopLoadingAnimation();
                  setIsGenerating(false);
                  toast.info('PDF generation cancelled');
                }}
              >
                Cancel
              </motion.button>

              <motion.div
                className="mt-6 flex justify-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#B9FF66]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

