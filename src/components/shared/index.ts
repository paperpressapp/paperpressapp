"use client";

/**
 * Shared Components Index
 * 
 * This file exports all shared UI components.
 */

// Basic Components
export { Logo } from './Logo';
export { LoadingSpinner } from './LoadingSpinner';
export { LoadingDots } from './LoadingDots';
export { AppLoader, QuickLoader } from './AppLoader';
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';

// Display Components
export { Badge } from './Badge';
export { StatCard } from './StatCard';
export { AnimatedCounter } from './AnimatedCounter';
export { ProgressBar } from './ProgressBar';

// Input Components
export { SearchInput } from './SearchInput';
export { FilterChips } from './FilterChips';

// Complex Components (Part 2)
export { BottomSheet } from './BottomSheet';
export { Breadcrumb } from './Breadcrumb';
export { ConfirmDialog } from './ConfirmDialog';
export { ImageUpload } from './ImageUpload';
export { NumberStepper } from './NumberStepper';
export { PressableCard } from './PressableCard';
export { 
  Skeleton, 
  TextSkeleton, 
  CardSkeleton, 
  QuestionCardSkeleton,
  PaperPreviewSkeleton,
  ChapterListSkeleton,
  SubjectGridSkeleton,
  ProfileSkeleton,
  PageLoadingSpinner,
  InlineLoadingSpinner 
} from './Skeleton';

// Error Handling
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { 
  ErrorDisplay, 
  NetworkError, 
  DataLoadError, 
  PaperGenerationError,
  InlineError 
} from './ErrorDisplay';

// Background Components
export { AppBackground, GlassCard } from './AppBackground';

// Status Components
export { OfflineBanner } from './OfflineBanner';
