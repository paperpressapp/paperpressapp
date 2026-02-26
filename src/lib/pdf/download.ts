/**
 * PDF Download Utility - Server-Based Architecture
 * 
 * ┌─────────────────┐         ┌────────────────────┐
 * │   Android App   │  HTTP   │   Vercel Server    │
 * │   (Capacitor)   │ ──────▶ │   (Next.js API)    │
 * │                 │ ◀────── │   (Puppeteer)      │
 * └─────────────────┘   PDF   └────────────────────┘
 * 
 * Primary: Call Vercel API for Puppeteer PDF (best quality)
 * Fallback: jsPDF for offline scenarios only
 */

import { Capacitor } from '@capacitor/core';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { generateProfessionalPDF, generateFilename as profFilename } from './professionalPDF';
import { generateHTMLTemplate, type PaperData } from './htmlTemplate';
import PDFPrinter from '@/lib/plugins/PDFPrinter';

// Helper to get the base URL for API calls
function getApiBaseUrl(): string {
  // If explicitly set in environment, use that
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('vercel.app')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Development environment logic
  if (process.env.NODE_ENV === 'development') {
    if (Capacitor.isNativePlatform()) {
      // In Android emulator, 10.0.2.2 points to the host machine's localhost
      // For physical devices, they should ideally set NEXT_PUBLIC_API_URL to their IP
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  // Production default
  return 'https://paperpressapp.vercel.app';
}

const API_BASE_URL = getApiBaseUrl();

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
  customMarks?: {
    mcq?: number;
    short?: number;
    long?: number;
  };
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

export async function fetchAndDownloadPDF(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  if (Capacitor.isNativePlatform()) {
    return downloadPDFAndroid(settings, mcqs, shorts, longs);
  }
  return downloadPDFWeb(settings, mcqs, shorts, longs);
}

export async function fetchAndDownloadDOCX(
  settings: any,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  showToast('Generating Word Document...');

  const filename = `${settings.classId}_${settings.subject}_${settings.date.replace(/-/g, '')}.docx`;

  // ── PRIMARY PATH: Server-side API (Professional Layout) ──────────
  try {
    console.log('[DOCX] Fetching from server...');
    const response = await fetch(`${API_BASE_URL}/api/generate-docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, mcqs, shorts, longs }),
    });

    if (!response.ok) throw new Error('Server returned error');

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        if (Capacitor.isNativePlatform()) {
          await savePDFToDevice(base64, filename, true);
          showToast('Word file saved to Documents/PaperPress/');
        } else {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;
          link.click();
        }
        resolve({ success: true });
      };
      reader.onerror = () => resolve({ success: false, error: 'Failed to process file binary' });
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.warn('[DOCX] Server API failed or offline, falling back to local generation:', error);

    // OFFLINE FALLBACK: Local generation (docx library)
    try {
      const { downloadDOCX } = await import('./docxGenerator');
      return await downloadDOCX(settings, mcqs, shorts, longs);
    } catch (localError) {
      return { success: false, error: 'Failed to generate Word document locally' };
    }
  }
}
export async function fetchAndPreviewPDF(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  if (Capacitor.isNativePlatform()) {
    return downloadPDFAndroid(settings, mcqs, shorts, longs, true);
  }
  return previewPDFWeb(settings, mcqs, shorts, longs);
}

// ─────────────────────────────────────────────
// ANDROID: Native WebView PrintManager (Best Quality)
// Uses PDFPrinterPlugin.java — same engine as Chrome print-to-PDF
// Works offline, perfect KaTeX, 300 DPI — no server needed
// ─────────────────────────────────────────────

async function downloadPDFAndroid(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[],
  openAfterSave = false
): Promise<{ success: boolean; error?: string }> {
  showToast('Generating PDF...');

  // Build HTML for WebView rendering (fully offline with bundled KaTeX)
  const paperData: PaperData = {
    instituteName: settings.instituteName,
    logoUrl: settings.instituteLogo,
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
    isPremium: settings.isPremium,
    includeAnswerSheet: settings.includeAnswerSheet,
    attemptRules: settings.attemptRules,
    customMarks: settings.customMarks,
    syllabus: settings.syllabus,
    instituteAddress: settings.instituteAddress,
    instituteEmail: settings.instituteEmail,
    institutePhone: settings.institutePhone,
    instituteWebsite: settings.instituteWebsite,
  };

  const html = generateHTMLTemplate(paperData);
  const filename = generateFilename(settings.classId, settings.subject, settings.date);

  // ── PRIMARY: Silent PDF save via PDFPrinterPlugin.java ────────────────────
  try {
    console.log('[PDF] Using Android WebView PrintManager (offline)...');
    const result = await PDFPrinter.printToPDF({ html, filename });

    if (!result.success) {
      throw new Error(result.message || 'PDFPrinterPlugin returned failure');
    }

    console.log('[PDF] Saved to:', result.filePath);
    showToast('✅ PDF saved to Documents/PaperPress/');

    // Open the file immediately if requested (preview mode)
    if (openAfterSave && result.filePath) {
      await openSavedPDF(result.filePath);
    }

    return { success: true };

  } catch (primaryError) {
    console.warn('[PDF] Silent save failed, trying print dialog:', primaryError);
  }

  // ── FALLBACK 1: Show Android print dialog ───────────────────────────────────
  try {
    const result = await PDFPrinter.showPrintDialog({ html, filename });

    if (!result.success) {
      throw new Error(result.message || 'Print dialog failed');
    }

    showToast('Tap "Save as PDF" in the print dialog');
    return { success: true };

  } catch (dialogError) {
    console.warn('[PDF] Print dialog failed, trying server:', dialogError);
  }

  // ── FALLBACK 2: Try server API (requires internet) ──────────────────────────
  try {
    console.log('[PDF] Trying Puppeteer via API: ' + API_BASE_URL);
    const pdfBase64 = await fetchPDFFromServer(settings, mcqs, shorts, longs);
    await savePDFToDevice(pdfBase64, filename, openAfterSave);
    showToast('PDF downloaded from server');
    return { success: true };
  } catch (serverError) {
    console.warn('[PDF] Server API unavailable:', serverError);
  }

  // ── FALLBACK 3: jsPDF (last resort, reduced quality) ────────────────────────
  try {
    console.log('[PDF] Using jsPDF fallback...');
    const pdfBase64 = await generateProfessionalPDF(settings, mcqs, shorts, longs);
    await savePDFToDevice(pdfBase64, filename, openAfterSave);
    showToast('PDF saved (basic format)');
    return { success: true };
  } catch (finalError) {
    console.error('[PDF] All PDF methods failed:', finalError);
    const errorMessage = finalError instanceof Error ? finalError.message : 'Failed to generate PDF';
    return { success: false, error: errorMessage };
  }
}

async function openSavedPDF(filePath: string): Promise<void> {
  try {
    const { FileOpener } = await import('@capacitor-community/file-opener');
    await FileOpener.open({
      filePath,
      contentType: 'application/pdf',
    });
  } catch (e) {
    console.warn('[PDF] Could not open file automatically:', e);
  }
}

async function fetchPDFFromServer(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<string> {
  const controller = new AbortController();
  const timeout = 60000; // 60 seconds
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
      },
      body: JSON.stringify({ settings, mcqs, shorts, longs }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch {
        // Can't parse error JSON
      }
      throw new Error(errorMsg);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Server returned empty PDF');
    }

    console.log('[PDF] Received:', blob.size, 'bytes');

    return await blobToBase64(blob);

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Server timeout - request took too long');
    }

    throw error;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read PDF data'));
    reader.readAsDataURL(blob);
  });
}

async function savePDFToDevice(
  pdfBase64: string,
  filename: string,
  openAfterSave: boolean
): Promise<void> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');

  // Create directory
  try {
    await Filesystem.mkdir({
      path: 'PaperPress',
      directory: Directory.Documents,
      recursive: true,
    });
  } catch {
    // Directory exists
  }

  const filePath = `PaperPress/${filename}`;

  await Filesystem.writeFile({
    path: filePath,
    data: pdfBase64,
    directory: Directory.Documents,
  });

  console.log('[PDF] Saved: Documents/PaperPress/' + filename);

  if (openAfterSave) {
    try {
      const fileUri = await Filesystem.getUri({
        path: filePath,
        directory: Directory.Documents,
      });

      const { FileOpener } = await import('@capacitor-community/file-opener');
      await FileOpener.open({
        filePath: fileUri.uri,
        contentType: 'application/pdf',
      });
    } catch {
      // Could not open - but file was saved
    }
  }
}

async function showToast(message: string): Promise<void> {
  try {
    const { Toast } = await import('@capacitor/toast');
    await Toast.show({ text: message, duration: 'long' });
  } catch {
    // Toast not available
  }
}

// ─────────────────────────────────────────────
// OFFLINE FALLBACK (Optional)
// ─────────────────────────────────────────────

export async function generatePDFOffline(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[],
  openAfterSave = false
): Promise<{ success: boolean; error?: string }> {
  console.log('[PDF] Generating offline with jsPDF...');

  try {
    const filename = profFilename(settings);
    const pdfBase64 = await generateProfessionalPDF(settings, mcqs, shorts, longs);
    await savePDFToDevice(pdfBase64, filename, openAfterSave);

    showToast('PDF saved (offline mode)');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    };
  }
}

// ─────────────────────────────────────────────
// WEB
// ─────────────────────────────────────────────

async function downloadPDFWeb(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
      },
      body: JSON.stringify({ settings, mcqs, shorts, longs }),
    });

    if (!response.ok) {
      let errMsg = `Server error (${response.status})`;
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        errMsg = json.error || json.message || errMsg;
      } catch { }
      return { success: false, error: errMsg };
    }

    const blob = await response.blob();
    if (blob.size === 0) return { success: false, error: 'Empty PDF received' };

    triggerBrowserDownload(blob, profFilename(settings));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

async function previewPDFWeb(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
      },
      body: JSON.stringify({ settings, mcqs, shorts, longs }),
    });

    if (!response.ok) return { success: false, error: 'Server error' };

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Preview failed',
    };
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { triggerBrowserDownload as downloadPDF };

export function previewPDFBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function generateFilename(classId: string, subject: string, date: string): string {
  return `${classId}_${subject.replace(/\s+/g, '_')}_${date.replace(/-/g, '')}.pdf`;
}
