"use client";

import { FileText, ChevronRight, Plus } from "lucide-react";
import type { GeneratedPaper } from "@/types";

interface LastPaperCardProps {
  paper: GeneratedPaper | null;
  onOpen: (id: string) => void;
  onCreateFirst: () => void;
}

export function LastPaperCard({ paper, onOpen, onCreateFirst }: LastPaperCardProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
        Continue Where You Left Off
      </p>

      {paper ? (
        <button
          onClick={() => onOpen(paper.id)}
          className="w-full bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-4 text-left flex items-center gap-4 shadow-sm active:scale-[0.99] transition-transform"
        >
          {/* Subject icon */}
          <div className="w-12 h-12 rounded-xl bg-[#B9FF66]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-[#B9FF66]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{paper.subject}</p>
            <p className="text-sm text-[#A0A0A0] mt-0.5">
              {paper.classId} &bull;{" "}
              {new Date(paper.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">
              {paper.questionCount} questions &bull; {paper.totalMarks} marks
            </p>
          </div>

          {/* Open pill */}
          <div className="flex-shrink-0 flex items-center gap-1 bg-[#B9FF66]/10 text-[#B9FF66] text-xs font-semibold px-3 py-1.5 rounded-full">
            Open
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      ) : (
        <div className="bg-[#1A1A1A] rounded-2xl border border-dashed border-[#2A2A2A] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2A2A2A] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7 text-[#6B6B6B]" />
          </div>
          <p className="text-sm font-medium text-[#A0A0A0]">No papers yet</p>
          <p className="text-xs text-[#6B6B6B] mt-1 mb-4">
            Create your first paper to get started
          </p>
          <button
            onClick={onCreateFirst}
            className="inline-flex items-center gap-1.5 bg-[#B9FF66]/10 text-[#B9FF66] text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Create First Paper
          </button>
        </div>
      )}
    </div>
  );
}
