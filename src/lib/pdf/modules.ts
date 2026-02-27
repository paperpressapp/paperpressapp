/**
 * PDF Template Modules
 * Compact exam paper layout
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { QUESTION_MARKS } from '@/types/question';
import type { PDFConfig } from './config';
import { processMathInText, escapeHtml, escapeAttr } from './mathProcessor';

function isServerless(): boolean {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
}

let cachedKatexCSS: string | null = null;
let cachedKatexJS: string | null = null;

function getKaTeXCSS(): string {
  if (typeof window !== 'undefined') return '';
  if (cachedKatexCSS) return cachedKatexCSS;
  if (isServerless()) return ''; // Use CDN in serverless
  try {
    const _require = eval('require');
    const fs = _require('fs');
    const path = _require('path');
    const cssPath = path.join(process.cwd(), 'public/lib/katex/katex.min.css');
    cachedKatexCSS = fs.readFileSync(cssPath, 'utf-8');
    return cachedKatexCSS || '';
  } catch {
    return '';
  }
}

function getKaTeXJS(): string {
  if (typeof window !== 'undefined') return '';
  if (cachedKatexJS) return cachedKatexJS;
  if (isServerless()) return ''; // Use CDN in serverless
  try {
    const _require = eval('require');
    const fs = _require('fs');
    const path = _require('path');
    const jsPath = path.join(process.cwd(), 'public/lib/katex/katex.min.js');
    cachedKatexJS = fs.readFileSync(jsPath, 'utf-8');
    return cachedKatexJS || '';
  } catch {
    return '';
  }
}

export interface HeaderData {
  instituteName: string;
  logoUrl?: string | null;
  showLogo?: boolean;
  customHeader?: string;
  subject: string;
  classId: string;
  timeAllowed: string;
  totalMarks: number;
  date: string;
}

export interface MCQSectionData {
  mcqs: MCQQuestion[];
  showBubbles?: boolean;
  marksPerQuestion?: number;
}

export interface ShortQuestionsData {
  questions: ShortQuestion[];
  attemptCount?: number;
  marksPerQuestion?: number;
}

export interface LongQuestionsData {
  questions: LongQuestion[];
  attemptCount?: number;
  marksPerQuestion?: number;
}

export function generateHeaderModule(data: HeaderData, config: PDFConfig): string {
  const hasLogo = data.logoUrl && data.showLogo !== false;
  const hasCustomHeader = data.customHeader?.trim();

  let headerContent = '';

  if (hasLogo) {
    headerContent = `
      <div class="h-logo">
        <img src="${data.logoUrl}" alt="Logo" class="logo">
      </div>
      <div class="h-school">${escapeHtml(data.instituteName).toUpperCase()}</div>
      ${hasCustomHeader ? `<div class="h-custom">${escapeHtml(data.customHeader!)}</div>` : ''}`;
  } else {
    headerContent = `
      <div class="h-school">${escapeHtml(data.instituteName).toUpperCase()}</div>
      ${hasCustomHeader ? `<div class="h-custom">${escapeHtml(data.customHeader!)}</div>` : ''}`;
  }

  return `
    <div class="header">
      ${headerContent}
    </div>
    <div class="info-grid">
      <div class="info-row">
        <div class="info-cell">
          <div class="info-label">Subject:</div>
          <div class="info-value">${escapeHtml(data.subject)}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Class:</div>
          <div class="info-value">${escapeHtml(data.classId)}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Time:</div>
          <div class="info-value">${escapeHtml(data.timeAllowed)}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Marks:</div>
          <div class="info-value">${data.totalMarks}</div>
        </div>
      </div>
      <div class="info-row">
        <div class="info-cell">
          <div class="info-label">Name:</div>
          <div class="info-value"></div>
        </div>
        <div class="info-cell">
          <div class="info-label">Roll No:</div>
          <div class="info-value"></div>
        </div>
        <div class="info-cell">
          <div class="info-label">Syllabus:</div>
          <div class="info-value"></div>
        </div>
        <div class="info-cell">
          <div class="info-label">Signature:</div>
          <div class="info-value"></div>
        </div>
      </div>
    </div>`;
}

export function generateMCQBubblesModule(mcqs: MCQQuestion[], perRow: number = 8): string {
  if (mcqs.length === 0) return '';

  let html = '<div class="bubble-section">';

  for (let i = 0; i < mcqs.length; i += perRow) {
    const rowMcqs = mcqs.slice(i, i + perRow);

    html += '<div class="bubble-row">';

    rowMcqs.forEach((_, idx) => {
      const qNum = i + idx + 1;
      html += `
        <div class="bubble-item">
          <span class="bq-num">${qNum}</span>
          <div class="b-opts">
            <span class="b-opt"><span class="b-circle"></span><span class="b-letter">A</span></span>
            <span class="b-opt"><span class="b-circle"></span><span class="b-letter">B</span></span>
            <span class="b-opt"><span class="b-circle"></span><span class="b-letter">C</span></span>
            <span class="b-opt"><span class="b-circle"></span><span class="b-letter">D</span></span>
          </div>
        </div>`;
    });

    html += '</div>';
  }

  html += '</div>';
  return html;
}

export function generateMCQQuestionsModule(mcqs: MCQQuestion[], marksPerQuestion: number = QUESTION_MARKS.mcq): string {
  if (mcqs.length === 0) return '';

  let html = '<div class="mcq-questions">';

  mcqs.forEach((mcq, idx) => {
    const opts = mcq.options || [];
    html += `
      <div class="mcq-row" data-question-id="${escapeAttr(mcq.id)}">
        <span class="mq-num">${idx + 1}.</span>
        <span class="mq-text">${processMathInText(mcq.questionText)}</span>
        <span class="mq-opts">
          <span class="mo">(A) ${processMathInText(opts[0] || '')}</span>
          <span class="mo">(B) ${processMathInText(opts[1] || '')}</span>
          <span class="mo">(C) ${processMathInText(opts[2] || '')}</span>
          <span class="mo">(D) ${processMathInText(opts[3] || '')}</span>
        </span>
      </div>`;
  });

  html += '</div>';
  return html;
}

export function generateMCQSection(data: MCQSectionData, config: PDFConfig): string {
  if (data.mcqs.length === 0) return '';

  const marksPerQ = data.marksPerQuestion || QUESTION_MARKS.mcq;
  const mcqMarks = data.mcqs.length * marksPerQ;

  return `
    <section class="section mcq-section" data-section="mcq">
      <div class="sec-head">
        <span class="sec-title">Q1: Objective (MCQs)</span>
        <span class="sec-marks">${data.mcqs.length} × ${marksPerQ} = ${mcqMarks} Marks</span>
      </div>
      ${data.showBubbles !== false ? generateMCQBubblesModule(data.mcqs, 8) : ''}
      ${generateMCQQuestionsModule(data.mcqs, marksPerQ)}
    </section>`;
}

export function generateShortQuestionsModule(data: ShortQuestionsData, config: PDFConfig): string {
  if (data.questions.length === 0) return '';

  const marksPerQ = data.marksPerQuestion || QUESTION_MARKS.short;
  const attemptCount = data.attemptCount || data.questions.length;
  const totalMarks = attemptCount * marksPerQ;

  let questionsHtml = '';
  data.questions.forEach((q, idx) => {
    questionsHtml += `
      <div class="q-row" data-question-id="${escapeAttr(q.id)}">
        <span class="q-n">${idx + 1}.</span>
        <span class="q-t">${processMathInText(q.questionText)}</span>
        <span class="q-m">[${marksPerQ}]</span>
      </div>`;
  });

  return `
    <section class="section short-section" data-section="short">
      <div class="sec-head">
        <span class="sec-title">Q2: Short Questions</span>
        <span class="sec-marks">Attempt any ${attemptCount} (${attemptCount} × ${marksPerQ} = ${totalMarks} Marks)</span>
      </div>
      ${questionsHtml}
    </section>`;
}

export function generateLongQuestionsModule(data: LongQuestionsData, config: PDFConfig): string {
  if (data.questions.length === 0) return '';

  const marksPerQ = data.marksPerQuestion || QUESTION_MARKS.long;
  const attemptCount = data.attemptCount || data.questions.length;
  const totalMarks = attemptCount * marksPerQ;

  let questionsHtml = '';
  data.questions.forEach((q, idx) => {
    questionsHtml += `
      <div class="q-row q-long" data-question-id="${escapeAttr(q.id)}">
        <span class="q-n">${idx + 1}.</span>
        <span class="q-t">${processMathInText(q.questionText)}</span>
        <span class="q-m">[${marksPerQ}]</span>
      </div>`;
  });

  return `
    <section class="section long-section" data-section="long">
      <div class="sec-head">
        <span class="sec-title">Q3: Long Questions</span>
        <span class="sec-marks">Attempt any ${attemptCount} (${attemptCount} × ${marksPerQ} = ${totalMarks} Marks)</span>
      </div>
      ${questionsHtml}
    </section>`;
}

export function generateCSS(config: PDFConfig): string {
  const { fonts, margins, spacing } = config;

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 794px;
      max-width: 794px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @page {
      size: A4;
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }

    body {
      font-family: ${fonts.family};
      font-size: 10pt;
      line-height: 1.2;
      color: #000;
      background: #fff;
    }

    .header {
      text-align: center;
      padding: 2pt 6pt 4pt 6pt;
    }

    .h-logo {
      text-align: center;
      margin-bottom: 2pt;
    }

    .logo {
      width: 28pt;
      height: 28pt;
      object-fit: contain;
    }

    .h-school {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 0.5pt;
    }

    .h-custom {
      font-size: 9pt;
      font-weight: bold;
      margin-top: 1pt;
    }

    .info-grid {
      border: 1pt solid #000;
      margin-bottom: 4pt;
    }

    .info-row {
      display: flex;
      border-bottom: 0.5pt solid #000;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-cell {
      flex: 1;
      display: flex;
      border-right: 0.5pt solid #000;
    }

    .info-cell:last-child {
      border-right: none;
    }

    .info-label {
      background: #f0f0f0;
      padding: 2pt 4pt;
      font-size: 7pt;
      font-weight: bold;
      min-width: 35pt;
      border-right: 0.5pt solid #000;
    }

    .info-value {
      flex: 1;
      padding: 2pt 4pt;
      font-size: 8pt;
      min-height: 12pt;
    }

    .section {
      page-break-inside: avoid;
    }

    .mcq-section {
      page-break-after: always;
    }

    .sec-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 3pt 0;
      margin-bottom: 3pt;
    }

    .sec-title {
      font-size: 12pt;
      font-weight: bold;
    }

    .sec-marks {
      font-size: 8pt;
      font-weight: bold;
    }

    .bubble-section {
      border: 0.5pt solid #000;
      padding: 2pt;
      margin-bottom: 3pt;
    }

    .bubble-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2pt;
    }

    .bubble-row:last-child { margin-bottom: 0; }

    .bubble-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .bq-num {
      font-size: 7pt;
      font-weight: bold;
      margin-bottom: 1pt;
    }

    .b-opts {
      display: flex;
      gap: 1pt;
    }

    .b-opt {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .b-letter {
      font-size: 5pt;
      font-weight: bold;
    }

    .b-circle {
      display: block;
      width: 7pt;
      height: 7pt;
      border: 0.5pt solid #000;
      border-radius: 50%;
      margin-bottom: 1pt;
    }

    .mcq-questions {
      font-size: 8pt;
    }

    .mcq-row {
      display: flex;
      align-items: flex-start;
      padding: 1pt 0;
      border-bottom: 0.25pt solid #ccc;
    }

    .mcq-row:last-child {
      border-bottom: none;
    }

    .mq-num {
      font-weight: bold;
      min-width: 10pt;
      flex-shrink: 0;
    }

    .mq-text {
      flex: 0 0 auto;
      margin-right: 3pt;
    }

    .mq-opts {
      display: flex;
      flex-wrap: wrap;
      gap: 1pt 4pt;
      flex: 1;
    }

    .mo {
      font-size: 8pt;
    }

    .q-row {
      display: flex;
      align-items: flex-start;
      padding: 2pt 0;
    }

    .q-long {
      margin-top: 2pt;
    }

    .q-n {
      font-weight: bold;
      min-width: 12pt;
      flex-shrink: 0;
      font-size: 10pt;
    }

    .q-t { 
      flex: 1; 
      font-size: 10pt;
    }

    .q-m {
      font-size: 9pt;
      color: #333;
      margin-left: 2pt;
      flex-shrink: 0;
      font-weight: bold;
    }

    .short-section .sec-title,
    .long-section .sec-title {
      font-size: 12pt;
    }

    .watermark {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 5pt;
      color: #666;
      padding: 1pt 0;
      border-top: 0.25pt solid #ccc;
      background: #fff;
    }

    .math-inline { display: inline; margin: 0 1pt; }
    .math-display { display: block; text-align: center; margin: 2pt 0; }

    .katex {
      font-size: 0.9em;
      line-height: 1.1;
      font-family: 'KaTeX_Main', 'Times New Roman', serif;
    }

    .katex .frac-line { border-top-width: 1px; min-height: 0.03em; }
    .katex .sqrt-sign { font-size: 1em; }

    .math-error {
      color: #c00;
      font-style: italic;
      border-bottom: 1px dashed #c00;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .mcq-section {
        page-break-after: always;
      }
      .short-section, .long-section {
        page-break-before: always;
      }
      .q-row, .mcq-row {
        page-break-inside: avoid;
      }
    }
  `;
}

export function generateKaTeXScript(): string {
  const katexJS = getKaTeXJS();
  
  const katexJSTag = katexJS
    ? `<script>${katexJS}<\/script>`
    : `<script src="lib/katex/katex.min.js"><\/script>`;

  return `
    ${katexJSTag}
    <script>
      (function() {
        function renderMath() {
          if (typeof katex === 'undefined') {
            // CDN fallback if local file not found
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            script.onload = renderMath;
            script.onerror = function() {
              console.warn('[KaTeX] Not loaded, math will show as plain text');
            };
            document.head.appendChild(script);
            return;
          }
          var els = document.querySelectorAll('[data-katex]');
          els.forEach(function(el) {
            var latex = el.getAttribute('data-katex');
            if (!latex || latex.trim() === '') return;
            var isDisplay = el.classList.contains('math-display');
            try {
              katex.render(latex, el, {
                displayMode: isDisplay,
                throwOnError: false,
                output: 'html',
                strict: false,
                trust: true,
                minRuleThickness: 0.06,
                maxSize: 10000,
                maxExpand: 10000
              });
            } catch(e) {
              el.innerHTML = '<span class="math-error">[Math: ' + latex + ']</span>';
            }
          });
          window.__katexRendered = true;
        }
        if (document.readyState === 'complete') { renderMath(); }
        else { window.addEventListener('load', renderMath); }
        // Also try after a short delay for slow WebViews
        setTimeout(renderMath, 500);
      })();
    </script>`;
}

export function getKaTeXCSSTag(): string {
  const katexCSS = getKaTeXCSS();
  return katexCSS
    ? `<style>${katexCSS}</style>`
    : `<link rel="stylesheet" href="lib/katex/katex.min.css">`;
}
