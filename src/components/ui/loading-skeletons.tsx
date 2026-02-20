import { Skeleton } from '@/components/ui/skeleton';

export function PaperCardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-4 mb-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-10 rounded-full" />
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
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      <div className="p-4">
        <Skeleton className="h-8 w-32 mb-4 bg-white/20" />
        <div className="relative overflow-hidden rounded-b-[32px] p-4 mb-6">
          <Skeleton className="h-20 w-full bg-white/20" />
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
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      <div className="p-4">
        <Skeleton className="h-8 w-40 mb-4 bg-white/20" />
        <div className="glass-panel rounded-2xl p-4 mb-4">
          <Skeleton className="h-32 w-full mb-4" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
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
