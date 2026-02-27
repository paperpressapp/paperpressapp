/**
 * PDF Download Utility - Universal Implementation
 * 
 * This is now a wrapper around the new universal download system.
 * For new code, prefer using universalDownload.ts directly.
 */

import { Capacitor } from '@capacitor/core';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import type { CustomMarks } from './marksCalculator';

// Re-export types for backward compatibility
export interface PDFSettings {
  instituteName: string;
  instituteLogo?: string | null;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  customHeader?: string;
  customSubHeader?: string;
  showLogo?: boolean;
  showWatermark?: boolean;
  isPremium?: boolean;
  includeAnswerSheet?: boolean;
  syllabus?: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  attemptRules?: {
    shortAttempt?: number;
    shortTotal?: number;
    longAttempt?: number;
    longTotal?: number;
  };
  customMarks?: CustomMarks;
  includeBubbleSheet?: boolean;
}

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('vercel.app')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    if (Capacitor.isNativePlatform()) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  return 'https://paperpressapp.vercel.app';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Fetch and download PDF - wrapper for backward compatibility
 * Uses the new universal download internally
 */
export async function fetchAndDownloadPDF(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import the new universal download
    const { downloadPerfectPaper } = await import('./universalDownload');
    
    // Convert settings to paper data
    const paperData = {
      instituteName: settings.instituteName,
      instituteLogo: settings.instituteLogo,
      date: settings.date,
      timeAllowed: settings.timeAllowed,
      classId: settings.classId,
      subject: settings.subject,
      mcqs,
      shorts,
      longs,
      customHeader: settings.customHeader,
      customSubHeader: settings.customSubHeader,
      showLogo: settings.showLogo,
      showWatermark: settings.showWatermark ?? true,
      isPremium: settings.isPremium,
      includeAnswerSheet: settings.includeAnswerSheet,
      attemptRules: settings.attemptRules,
      customMarks: settings.customMarks,
      syllabus: settings.syllabus,
      instituteAddress: settings.instituteAddress,
      instituteEmail: settings.instituteEmail,
      institutePhone: settings.institutePhone,
      instituteWebsite: settings.instituteWebsite,
      includeBubbleSheet: settings.includeBubbleSheet,
    };
    
    console.log('[PDF] Calling downloadPerfectPaper with:', {
      classId: paperData.classId,
      subject: paperData.subject,
      mcqsCount: paperData.mcqs.length,
      shortsCount: paperData.shorts.length,
      longsCount: paperData.longs.length,
    });
    
    await downloadPerfectPaper(paperData);
    return { success: true };
    
  } catch (error) {
    console.error('[PDF] Download failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to download PDF' 
    };
  }
}

/**
 * Preview PDF - wrapper for backward compatibility
 */
export async function fetchAndPreviewPDF(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  // For preview, we'll just call the download and let it handle it
  return fetchAndDownloadPDF(settings, mcqs, shorts, longs);
}

/**
 * Fetch and download DOCX - backward compatibility
 */
export async function fetchAndDownloadDOCX(
  settings: any,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  // DOCX generation - fall back to server API
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, mcqs, shorts, longs }),
    });

    if (!response.ok) throw new Error('Server returned error');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.classId}_${settings.subject}_${settings.date.replace(/-/g, '')}.docx`;
    link.click();
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate DOCX' 
    };
  }
}

// Keep other utility functions for backward compatibility
export function generateFilename(classId: string, subject: string, date: string): string {
  return `PaperPress_${classId}_${subject}_${date.replace(/-/g, '')}.pdf`;
}
