"use client";

import { useRouter } from "next/navigation";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/constants/colors";

interface HomeHeaderProps {
  onSettingsClick?: () => void;
}

export function HomeHeader({ onSettingsClick }: HomeHeaderProps) {
  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
      <div className="mx-auto max-w-[428px]">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B9FF66] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            <span className="font-bold text-lg text-[#111827]">PaperPress</span>
          </div>
          <button 
            onClick={onSettingsClick}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

interface HeroSectionProps {
  userName: string;
  totalPapers: number;
  papersThisMonth: number;
  instituteName?: string;
}

export function HeroSection({ userName, instituteName }: HeroSectionProps) {
  const router = useRouter();
  
  return (
    <div className="bg-white px-4 py-6">
      <h1 className="text-2xl font-bold text-[#111827]">
        Hello, {userName}
      </h1>
      {instituteName && (
        <p className="text-sm text-[#6B7280] mt-1">{instituteName}</p>
      )}
      
      <Button
        onClick={() => router.push('/subjects')}
        className="w-full h-14 mt-6 rounded-2xl bg-gradient-to-r from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#B9FF66]/25"
      >
        <Plus className="w-5 h-5" />
        Create New Paper
      </Button>
    </div>
  );
}

interface RecentPapersProps {
  papers: any[];
}

export function RecentPapers({ papers }: RecentPapersProps) {
  const router = useRouter();
  
  if (papers.length === 0) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-sm font-semibold text-[#111827] mb-3">Recent Papers</h2>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
          <FileText className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[#6B7280]">No papers yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1">Create your first paper to get started</p>
        </div>
      </div>
    );
  }

  const recentPaper = papers[0];
  
  return (
    <div className="px-4 py-4">
      <h2 className="text-sm font-semibold text-[#111827] mb-3">Recent Paper</h2>
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#111827]">{recentPaper.subject}</p>
            <p className="text-sm text-[#6B7280]">{recentPaper.classId} • {new Date(recentPaper.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {recentPaper.questionCount} questions • {recentPaper.totalMarks} marks
            </p>
          </div>
          <button 
            onClick={() => router.push(`/paper?id=${recentPaper.id}`)}
            className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ClassSectionProps {
  onSelectClass?: (classId: string) => void;
}

export function ClassSection({ onSelectClass }: ClassSectionProps) {
  return null;
}

export default HomeHeader;
