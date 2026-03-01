/**
 * Master HTML Generator for PaperPress
 * 
 * Generates a complete, print-optimized HTML document for exam papers.
 * Used by both Android (iframe print) and Web (Puppeteer) implementations.
 * 
 * This is the SHARED CORE that ensures identical output on both platforms.
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import type { CustomMarks } from './marksCalculator';
import { generatePatternHTML, type PatternTemplateInput } from './patternTemplate';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface MasterPaperData {
  // Institute Info
  instituteName: string;
  instituteLogo?: string | null;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  
  // Paper Info
  classId: string;
  subject: string;
  date: string;
  timeAllowed: string;
  totalMarks?: number;
  
  // Custom Headers
  customHeader?: string;
  customSubHeader?: string;
  
  // Questions
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
  
  // Display Options
  showLogo?: boolean;
  showWatermark?: boolean;
  includeAnswerSheet?: boolean;
  includeBubbleSheet?: boolean;
  
  // Marks
  customMarks?: CustomMarks;
  attemptRules?: {
    shortAttempt?: number;
    longAttempt?: number;
  };
  
  // Font Size
  fontSize?: number;
  
  // Premium
  isPremium?: boolean;
  
  // Additional
  syllabus?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate total marks from questions
 */
export function calculateTotalMarks(data: MasterPaperData): number {
  const mcqMark = data.customMarks?.mcq ?? 1;
  const shortMark = data.customMarks?.short ?? 2;
  const longMark = data.customMarks?.long ?? 5;
  
  const mcqMarks = data.mcqs.length * mcqMark;
  const shortMarks = data.shorts.length * shortMark;
  const longMarks = data.longs.length * longMark;
  
  return mcqMarks + shortMarks + longMarks;
}

/**
 * Get default filename for the paper
 */
export function getDefaultFilename(data: MasterPaperData): string {
  const dateStr = data.date.replace(/-/g, '');
  return `PaperPress_${data.classId}_${data.subject}_${dateStr}.pdf`;
}

// ============================================================================
// Master HTML Generator
// ============================================================================

/**
 * Generate complete HTML document for printing
 * This is the core function used by both Android and Web implementations
 */
export function generateMasterHTML(data: MasterPaperData): string {
  // Prepare input for pattern template
  const input: PatternTemplateInput = {
    instituteName: data.instituteName,
    logoUrl: data.instituteLogo,
    showLogo: data.showLogo ?? true,
    showWatermark: data.showWatermark ?? true,
    classId: data.classId,
    subject: data.subject,
    date: data.date,
    timeAllowed: data.timeAllowed,
    mcqs: data.mcqs,
    shorts: data.shorts,
    longs: data.longs,
    customHeader: data.customHeader,
    customSubHeader: data.customSubHeader,
    syllabus: data.syllabus,
    instituteAddress: data.instituteAddress,
    instituteEmail: data.instituteEmail,
    institutePhone: data.institutePhone,
    instituteWebsite: data.instituteWebsite,
    customMarks: data.customMarks,
    attemptRules: data.attemptRules,
    includeBubbleSheet: data.includeBubbleSheet,
    fontSize: data.fontSize,
  };
  
  // Generate the inner HTML content
  const content = generatePatternHTML(input);
  
  // Calculate total marks
  const totalMarks = data.totalMarks ?? calculateTotalMarks(data);
  
  // Build complete HTML document
  return buildHTMLDocument(content, {
    classId: data.classId,
    subject: data.subject,
    totalMarks,
    date: data.date,
    timeAllowed: data.timeAllowed,
  });
}

/**
 * Build the complete HTML document with DOCTYPE, head, and body
 */
function buildHTMLDocument(
  content: string, 
  meta: { classId: string; subject: string; totalMarks: number; date: string; timeAllowed: string }
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.subject} - Class ${meta.classId}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    /* Reset and Base */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    html, body {
      width: 210mm;
      min-height: 297mm;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Header */
    .header {
      text-align: center;
      padding: 8px 12px;
      border-bottom: 2px solid #000;
      margin-bottom: 12px;
    }
    
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .header .subtitle {
      font-size: 11pt;
    }
    
    /* Info Bar */
    .info-bar {
      display: flex;
      justify-content: space-between;
      border: 1px solid #000;
      border-bottom: none;
      margin-bottom: 16px;
    }
    
    .info-bar .cell {
      flex: 1;
      padding: 6px 10px;
      border-right: 1px solid #000;
      font-size: 10pt;
    }
    
    .info-bar .cell:last-child {
      border-right: none;
    }
    
    .info-bar .label {
      font-weight: bold;
    }
    
    /* Sections */
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #000;
    }
    
    /* MCQs */
    .mcq-list {
      font-size: 10pt;
    }
    
    .mcq-item {
      margin-bottom: 12px;
      padding: 8px;
      border-bottom: 0.5px solid #ccc;
    }
    
    .mcq-item:last-child {
      border-bottom: none;
    }
    
    .mcq-number {
      font-weight: bold;
      margin-right: 8px;
    }
    
    .mcq-text {
      margin-bottom: 6px;
    }
    
    .mcq-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-left: 20px;
    }
    
    .mcq-option {
      font-size: 10pt;
    }
    
    /* Questions */
    .question-list {
      font-size: 11pt;
    }
    
    .question-item {
      margin-bottom: 16px;
      padding: 10px;
    }
    
    .question-item.long {
      min-height: 80px;
    }
    
    .question-number {
      font-weight: bold;
      margin-right: 8px;
    }
    
    .question-text {
      flex: 1;
    }
    
    .question-marks {
      font-weight: bold;
      margin-left: 12px;
      color: #444;
    }
    
    /* Answer Lines */
    .answer-lines {
      margin-top: 12px;
    }
    
    .answer-line {
      border-bottom: 1px dashed #999;
      height: 24px;
      margin-bottom: 4px;
    }
    
    /* OMR Sheet */
    .omr-sheet {
      page-break-before: always;
      padding: 20px;
    }
    
    .omr-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    
    .omr-header h2 {
      font-size: 16pt;
      margin-bottom: 8px;
    }
    
    .omr-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 11pt;
    }
    
    .omr-field {
      flex: 1;
    }
    
    .omr-field span {
      font-weight: bold;
    }
    
    .omr-field .line {
      border-bottom: 1px solid #000;
      display: inline-block;
      width: 120px;
      margin-left: 8px;
    }
    
    .omr-bubbles {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    
    .omr-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .omr-num {
      width: 30px;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .omr-bubble {
      width: 24px;
      height: 24px;
      border: 1px solid #000;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80pt;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.05);
      pointer-events: none;
      z-index: -1;
    }
    
    /* Footer */
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 8pt;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 4px;
    }
    
    /* Print Media */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .omr-sheet {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

// ============================================================================
// Export for use
// ============================================================================

export default {
  generateMasterHTML,
  calculateTotalMarks,
  getDefaultFilename,
};
