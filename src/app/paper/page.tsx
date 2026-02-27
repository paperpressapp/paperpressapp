import { Suspense } from 'react';
import PaperPreviewContent from './PaperPreviewContent';
import { MainLayout } from '@/components/layout';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PaperPreviewPage() {
  return (
    <Suspense fallback={
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
          <Skeleton height={180} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={56} borderRadius={12} />
          <Skeleton height={44} borderRadius={12} />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton height={48} borderRadius={12} />
            <Skeleton height={48} borderRadius={12} />
          </div>
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={56} borderRadius={12} />
        </div>
      </MainLayout>
    }>
      <PaperPreviewContent />
    </Suspense>
  );
}
