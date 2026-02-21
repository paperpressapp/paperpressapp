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
import { generatePaperHTML, generatePDFFilename } from './htmlGenerator';
import PDFPrinter from '@/lib/plugins/PDFPrinter';

// Always use the deployed API URL for PDF generation
// The app makes HTTP calls to the Vercel server for Puppeteer PDF
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paperpressapp.vercel.app';

export interface PDFSettings {
  instituteName: string;
  instituteLogo?: string | null;
  examType: string;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  customHeader?: string;
  customSubHeader?: string;
  showLogo?: boolean;
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

  try {
    // Generate HTML locally — no internet needed
    const html = generatePaperHTML(
      {
        instituteName: settings.instituteName,
        instituteLogo: settings.instituteLogo,
        examType: settings.examType,
        date: settings.date,
        timeAllowed: settings.timeAllowed,
        classId: settings.classId,
        subject: settings.subject,
      },
      mcqs,
      shorts,
      longs
    );

    const filename = generatePDFFilename(settings.classId, settings.subject, settings.date);

    // → Android WebView renders HTML (KaTeX renders perfectly)
    // → Android PrintManager converts to PDF at 300 DPI
    // → Opens Android print dialog → user saves as PDF
    console.log('[PDF] Using native WebView PrintManager...');
    const result = await PDFPrinter.printToPDF({ html, filename });

    if (!result.success) {
      throw new Error(result.message || 'Print failed');
    }

    showToast('PDF ready — tap "Save as PDF" in the print dialog');
    return { success: true };

  } catch (error) {
    console.error('[PDF] Native print failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
    return { success: false, error: errorMessage };
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
