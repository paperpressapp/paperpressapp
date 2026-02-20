import { Suspense } from 'react';
import PaperPreviewContent from './PaperPreviewContent';
import { AppLoader } from '@/components/shared';

export default function PaperPreviewPage() {
  return (
    <Suspense fallback={<AppLoader message="Loading paper..." />}>
      <PaperPreviewContent />
    </Suspense>
  );
}
