/**
 * Error Display Components
 * 
 * Reusable error UI components for consistent error handling.
 */

"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff, FileWarning, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  icon?: 'warning' | 'wifi' | 'file' | 'database';
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const iconMap = {
  warning: AlertTriangle,
  wifi: WifiOff,
  file: FileWarning,
  database: Database,
};

export function ErrorDisplay({
  title = 'Error',
  message,
  icon = 'warning',
  onRetry,
  retryText = 'Try Again',
  className = '',
}: ErrorDisplayProps) {
  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-sm">{message}</p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="h-11 px-6 rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </motion.div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="No Internet Connection"
      message="Please check your internet connection and try again."
      icon="wifi"
      onRetry={onRetry}
    />
  );
}

export function DataLoadError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Failed to Load"
      message="We couldn't load the data. Please try again."
      icon="database"
      onRetry={onRetry}
    />
  );
}

export function PaperGenerationError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Failed to Generate Paper"
      message="There was an error creating your paper. Please check your selections and try again."
      icon="file"
      onRetry={onRetry}
      retryText="Retry Generation"
    />
  );
}

export function InlineError({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-700 font-medium hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function ToastError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600">
      <AlertTriangle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
