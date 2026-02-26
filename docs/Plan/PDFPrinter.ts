/**
 * PDFPrinter Capacitor Plugin
 *
 * Bridges TypeScript → PDFPrinterPlugin.java
 *
 * Two modes available:
 *  - printToPDF()      → Silent auto-save to Documents/PaperPress/ (primary)
 *  - showPrintDialog() → Android print dialog, user taps "Save as PDF" (fallback)
 */

import { registerPlugin } from '@capacitor/core';

export interface PDFPrinterPlugin {
  /**
   * PRIMARY: Silently generates PDF and saves to Documents/PaperPress/
   * No dialog shown. Returns filePath on success.
   */
  printToPDF(options: PrintToPDFOptions): Promise<PrintToPDFResult>;

  /**
   * FALLBACK: Opens Android native print dialog.
   * User taps "Save as PDF" to save. Useful when silent save fails.
   */
  showPrintDialog(options: PrintToPDFOptions): Promise<PrintToPDFResult>;
}

export interface PrintToPDFOptions {
  /** Full HTML string including KaTeX math, styles, and content */
  html: string;
  /** Output filename e.g. "10th_Physics_20250222.pdf" */
  filename: string;
}

export interface PrintToPDFResult {
  success: boolean;
  message: string;
  /** Absolute file path on device — use with FileOpener plugin */
  filePath?: string;
  fileName?: string;
  jobName?: string;
}

const PDFPrinter = registerPlugin<PDFPrinterPlugin>('PDFPrinter');

export default PDFPrinter;
