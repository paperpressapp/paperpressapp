/**
 * React Hook for PDF Generation
 * Handles API calls, loading states, and PDF downloads
 */

import { useState, useCallback } from 'react';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

interface PDFSettings {
  instituteName: string;
  instituteLogo?: string | null;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  customHeader?: string;
  showLogo?: boolean;
  isPremium?: boolean;
  includeAnswerSheet?: boolean;
  attemptRules?: {
    shortAttempt?: number;
    shortTotal?: number;
    longAttempt?: number;
    longTotal?: number;
  };
  customMarks?: {
    mcq?: number;
    short?: number;
    long?: number;
  };
}

interface UsePDFGeneratorReturn {
  generatePDF: (
    settings: PDFSettings,
    mcqs: MCQQuestion[],
    shorts: ShortQuestion[],
    longs: LongQuestion[]
  ) => Promise<Blob | null>;
  loading: boolean;
  error: string | null;
  progress: string;
}

export function usePDFGenerator(): UsePDFGeneratorReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const generatePDF = useCallback(
    async (
      settings: PDFSettings,
      mcqs: MCQQuestion[],
      shorts: ShortQuestion[],
      longs: LongQuestion[]
    ): Promise<Blob | null> => {
      setLoading(true);
      setError(null);
      setProgress('Preparing paper data...');

      try {
        setProgress('Sending to server...');
        
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            settings,
            mcqs,
            shorts,
            longs,
          }),
        });

        console.log('[PDF] Response status:', response.status);
        console.log('[PDF] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('[PDF] Error response:', errorText);
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 100)}`);
        }

        setProgress('Generating PDF...');
        
        const blob = await response.blob();
        
        console.log('[PDF] Blob size:', blob.size, 'type:', blob.type);
        
        if (blob.size === 0) {
          throw new Error('Empty response from server');
        }

        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

        setProgress('PDF ready!');
        setLoading(false);
        
        return pdfBlob;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'PDF generation failed';
        console.error('[PDF] Error:', errorMessage);
        setError(errorMessage);
        setProgress('');
        setLoading(false);
        return null;
      }
    },
    []
  );

  return { generatePDF, loading, error, progress };
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openPDFInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
