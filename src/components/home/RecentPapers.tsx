"use client";

/**
 * RecentPapers Component - Redesigned
 * 
 * Section displaying recently generated papers.
 * Clean design without emojis.
 */

import { useRouter } from "next/navigation";
import { RecentPaperCard } from "./RecentPaperCard";
import { ScrollView } from "@/components/layout";
import type { GeneratedPaper } from "@/types";
import { FileText, ChevronRight } from "lucide-react";

interface RecentPapersProps {
  /** Array of recent papers */
  papers: GeneratedPaper[];
}

export function RecentPapers({ papers }: RecentPapersProps) {
  const router = useRouter();

  // Don't render if no papers
  if (!papers || papers.length === 0) {
    return null;
  }

  return (
    <section className="py-5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#1E88E5]" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">Recent Papers</h2>
        </div>
        <button
          onClick={() => router.push("/my-papers")}
          className="flex items-center gap-1 text-sm text-[#1E88E5] font-medium hover:opacity-80 transition-opacity"
        >
          See All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Papers Scroll */}
      <ScrollView horizontal className="px-6">
        <div className="flex gap-3">
          {papers.slice(0, 5).map((paper) => (
            <RecentPaperCard
              key={paper.id}
              paper={paper}
              onPress={() => router.push(`/paper?id=${paper.id}`)}
            />
          ))}
        </div>
      </ScrollView>
    </section>
  );
}
