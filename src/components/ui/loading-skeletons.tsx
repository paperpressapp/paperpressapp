import { Skeleton } from '@/components/ui/skeleton';

export function PaperCardSkeleton() {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-3 border border-[#2A2A2A]">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-xl bg-[#2A2A2A]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4 bg-[#2A2A2A]" />
          <Skeleton className="h-4 w-1/2 bg-[#2A2A2A]" />
        </div>
      </div>
      <div className="flex-3">
        gap-2 mt <Skeleton className="h-6 w-16 rounded-full bg-[#2A2A2A]" />
        <Skeleton className="h-6 w-12 rounded-full bg-[#2A2A2A]" />
        <Skeleton className="h-6 w-10 rounded-full bg-[#2A2A2A]" />
      </div>
    </div>
  );
}

export function QuestionCardSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-4 mb-2">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-6 w-12 rounded" />
      </div>
    </div>
  );
}

export function ChapterSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-4 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="p-4">
        <Skeleton className="h-8 w-32 mb-4 bg-[#2A2A2A]" />
        <div className="relative overflow-hidden rounded-b-[32px] p-4 mb-6">
          <Skeleton className="h-20 w-full bg-[#1A1A1A]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <PaperCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreatePaperSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="p-4">
        <Skeleton className="h-8 w-40 mb-4 bg-[#2A2A2A]" />
        <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4 border border-[#2A2A2A]">
          <Skeleton className="h-32 w-full mb-4 bg-[#2A2A2A]" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl bg-[#2A2A2A]" />
            <Skeleton className="h-12 rounded-xl bg-[#2A2A2A]" />
            <Skeleton className="h-12 rounded-xl bg-[#2A2A2A]" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <QuestionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
