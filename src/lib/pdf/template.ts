/**
 * PDF Template Generator
 * Main entry point using modular architecture
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import type { PDFConfig } from './config';
import { DEFAULT_CONFIG, getConfig } from './config';
import { calculateMarks, type MarksBreakdown, type CustomMarks } from './marksCalculator';
import {
  generateHeaderModule,
  generateMCQSection,
  generateShortQuestionsModule,
  generateLongQuestionsModule,
  generateCSS,
  generateKaTeXScript,
  getKaTeXCSSTag,
} from './modules';
import { escapeHtml } from './mathProcessor';

export interface PaperTemplateData {
  instituteName: string;
  logoUrl?: string | null;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
  customHeader?: string;
  showLogo?: boolean;
  showWatermark?: boolean;
  showBubbles?: boolean;
  attemptRules?: {
    shortAttempt?: number;
    longAttempt?: number;
  };
  customMarks?: CustomMarks;
  template?: string;
}

export interface TemplateResult {
  html: string;
  marks: MarksBreakdown;
  pageCount: number;
  config: PDFConfig;
}

export function generatePaperTemplate(data: PaperTemplateData): TemplateResult {
  const config = getConfig(data.template);
  const marks = calculateMarks(data.mcqs, data.shorts, data.longs, data.attemptRules, data.customMarks);

  const headerModule = generateHeaderModule(
    {
      instituteName: data.instituteName,
      logoUrl: data.logoUrl,
      showLogo: data.showLogo,
      customHeader: data.customHeader,
      subject: data.subject,
      classId: data.classId,
      timeAllowed: data.timeAllowed,
      totalMarks: marks.total,
      date: data.date,
    },
    config
  );

  const mcqSection = generateMCQSection(
    {
      mcqs: data.mcqs,
      showBubbles: data.showBubbles !== false,
      marksPerQuestion: data.customMarks?.mcq,
    },
    config
  );

  const shortSection = generateShortQuestionsModule(
    {
      questions: data.shorts,
      attemptCount: data.attemptRules?.shortAttempt,
      marksPerQuestion: data.customMarks?.short,
    },
    config
  );

  const longSection = generateLongQuestionsModule(
    {
      questions: data.longs,
      attemptCount: data.attemptRules?.longAttempt,
      marksPerQuestion: data.customMarks?.long,
    },
    config
  );

  const watermarkHtml = data.showWatermark !== false ? `<div class="watermark">PaperPress App - paperpressapp@gmail.com</div>` : '';
  
  const bodyContent = `
    ${headerModule}
    ${mcqSection}
    <div class="page-break"></div>
    ${shortSection}
    ${longSection}
    ${watermarkHtml}
  `;

  const estimatedPageCount = estimatePageCount(data, marks);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794, initial-scale=1.0, maximum-scale=1.0">
  <title>${escapeHtml(data.subject)} - Class ${escapeHtml(data.classId)}</title>
  ${getKaTeXCSSTag()}
  <style>
    ${generateCSS(config)}
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  ${bodyContent}
  ${generateKaTeXScript()}
</body>
</html>`;

  return {
    html,
    marks,
    pageCount: estimatedPageCount,
    config,
  };
}

function estimatePageCount(data: PaperTemplateData, marks: MarksBreakdown): number {
  let pages = 1;

  if (data.mcqs.length > 0) pages = 1;
  if (data.shorts.length > 0 || data.longs.length > 0) pages += 1;

  return pages;
}

export function generatePreviewHTML(data: PaperTemplateData): string {
  const result = generatePaperTemplate(data);

  return result.html.replace('</head>', `
    <style>
      body { transform-origin: top left; }
      .preview-container { width: 100%; overflow: auto; }
      .preview-page {
        width: 210mm;
        min-height: 297mm;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        margin: 20px auto;
      }
    </style>
  </head>`).replace('<body>', '<body><div class="preview-container"><div class="preview-page>').replace('</body>', '</div></div></body>');
}

export { DEFAULT_CONFIG } from './config';
export { calculateMarks, validateMarks, type MarksBreakdown, type MarksValidation, type CustomMarks } from './marksCalculator';
export { validatePaperData, type ValidationResult, type ValidationError } from './validation';
