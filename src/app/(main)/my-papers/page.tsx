"use client";

/**
 * My Papers Page - Redesigned with Glassmorphism
 * 
 * Lists all previously generated papers with search and filter options.
 */

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Plus, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout, ScrollView } from "@/components/layout";
import { PaperListCard, EmptyPapers, PapersTabs } from "@/components/my-papers";
import { AppLoader } from "@/components/shared";
import { useDebounce, useToast } from "@/hooks";
import { getPapers, deletePaper } from "@/lib/storage/papers";
import { fetchAndDownloadPDF } from "@/lib/pdf/download";
import { getQuestionsByIds } from "@/data";
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { DEFAULT_MARKS } from "@/constants/paper";
import type { GeneratedPaper, MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

export default function MyPapersPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [papers, setPapers] = useState<GeneratedPaper[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "month" | "week" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleShowSearch = () => {
    setShowSearch(true);
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load papers
  const loadPapers = useCallback(() => {
    const loadedPapers = getPapers();
    setPapers(loadedPapers);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  // Filter papers
  const filteredPapers = useMemo(() => {
    let filtered = [...papers];

    // Tab filter
    if (activeTab === "month") {
      const now = new Date();
      filtered = filtered.filter((paper) => {
        const paperDate = new Date(paper.createdAt);
        return (
          paperDate.getMonth() === now.getMonth() &&
          paperDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (activeTab === "week") {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((paper) => {
        const paperDate = new Date(paper.createdAt);
        return paperDate >= weekAgo;
      });
    } else if (activeTab === "favorites") {
      filtered = filtered.filter((paper) => paper.isFavorite);
    }

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((paper) =>
        paper.title.toLowerCase().includes(query) ||
        paper.subject.toLowerCase().includes(query) ||
        paper.classId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [papers, activeTab, debouncedSearch]);

  // Handle view paper
  const handleView = useCallback((paperId: string) => {
    router.push(`/paper?id=${paperId}`);
  }, [router]);

  // Handle download
  const handleDownload = useCallback(async (paper: GeneratedPaper) => {
    try {
      const mcqs: MCQQuestion[] = [];
      const shorts: ShortQuestion[] = [];
      const longs: LongQuestion[] = [];

      const allQuestions = await getQuestionsByIds(
        paper.classId,
        paper.subject,
        [...paper.mcqIds, ...paper.shortIds, ...paper.longIds]
      );

      allQuestions.forEach((q) => {
        if ('options' in q && paper.mcqIds.includes(q.id)) {
          mcqs.push(q as MCQQuestion);
        } else if (paper.shortIds.includes(q.id)) {
          shorts.push(q as ShortQuestion);
        } else if (paper.longIds.includes(q.id)) {
          longs.push(q as LongQuestion);
        }
      });

      const settings = {
        classId: paper.classId,
        subject: paper.subject,
        instituteName: paper.instituteName || "Institution",
        instituteLogo: paper.instituteLogo || null,
        examType: paper.examType,
        date: paper.date,
        timeAllowed: paper.timeAllowed,
        customHeader: paper.customHeader || '',
        customSubHeader: paper.customSubHeader || '',
        showLogo: paper.showLogo && !!paper.instituteLogo,
        customMarks: paper.customMarks || { ...DEFAULT_MARKS },
      };

      const result = await fetchAndDownloadPDF(settings, mcqs, shorts, longs);

      if (result.success) {
        toast.success("PDF downloaded successfully!");
      } else {
        toast.error(result.error || "Failed to download PDF");
      }
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  }, [toast]);

  // Handle share
  const handleShare = useCallback(async (paper: GeneratedPaper) => {
    const text = `${paper.title}\nClass: ${paper.classId} | Subject: ${paper.subject}\nMarks: ${paper.totalMarks} | Questions: ${paper.questionCount}\n\nCreated with PaperPress`;

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: paper.title,
          text,
          dialogTitle: 'Share Paper',
        });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } catch {
      // User cancelled
    }
  }, []);

  // Handle delete
  const handleDelete = useCallback((paperId: string) => {
    deletePaper(paperId);
    setPapers((prev) => prev.filter((p) => p.id !== paperId));
    toast.success("Paper deleted");
  }, [toast]);

  // Handle favorites tab
  const handleTabChange = useCallback((tab: "all" | "month" | "week" | "favorites") => {
    setActiveTab(tab);
  }, []);

  if (isLoading) {
    return <AppLoader message="Loading papers..." />;
  }

  return (
    <MainLayout showBottomNav className="bg-[#0A0A0A]" topSafe={false}>
      <div className="min-h-screen pb-24">
          {/* App Bar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            {/* Safe Area Background */}
            <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#2A2A2A]" />

            <div className="mx-auto max-w-[428px] relative pt-safe">
              <div className="px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-[12px] hover:bg-[#2A2A2A]"
                    onClick={() => router.push("/home")}
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </Button>
                  <h1 className="font-bold text-lg text-white">My Papers</h1>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-[12px] hover:bg-[#2A2A2A]"
                    onClick={showSearch ? () => setShowSearch(false) : handleShowSearch}
                  >
                    <Search className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                className="fixed left-0 right-0 z-40 px-4 py-3 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#2A2A2A]"
                style={{ top: 'calc(56px + env(safe-area-inset-top, 0px))' }}
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
              >
                <div className="mx-auto max-w-[428px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search papers..."
                      className="pl-10 h-12 rounded-[12px] border-[#2A2A2A] bg-[#1A1A1A] text-sm text-white"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-xs"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <ScrollView
            className="flex-1"
            style={{
              paddingTop: showSearch
                ? '120px'
                : '56px'
            }}
          >
            {/* Stats Card - Connected to header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pt-2 pb-2"
            >
              <div className="bg-[#1A1A1A] rounded-[16px] p-3 border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-[#0A0A0A]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{papers.length}</p>
                      <p className="text-[10px] text-[#A0A0A0]">Papers</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/home")}
                    className="h-8 rounded-lg bg-gradient-to-r from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] font-medium text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="px-4 mb-2">
              <PapersTabs activeTab={activeTab} onChange={handleTabChange} />
            </div>

            {/* Papers List */}
            <div className="px-4 space-y-2 pb-4">
              {filteredPapers.length === 0 ? (
                <EmptyPapers onCreate={() => router.push("/home")} />
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredPapers.map((paper) => (
                      <PaperListCard
                        key={paper.id}
                        paper={paper}
                        onView={() => handleView(paper.id)}
                        onDownload={() => handleDownload(paper)}
                        onShare={() => handleShare(paper)}
                        onDelete={() => handleDelete(paper.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="h-12" />
            </div>
          </ScrollView>
        </div>
      </MainLayout>
    );
  }
