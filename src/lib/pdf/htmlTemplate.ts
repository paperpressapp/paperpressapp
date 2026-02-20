/**
 * HTML Template for PDF Generation
 * Optimized for Puppeteer server-side rendering
 * Punjab Board exam paper format
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { QUESTION_MARKS } from '@/types/question';

export interface PaperData {
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
  customSubHeader?: string;
  showLogo?: boolean;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function processMath(text: string): string {
  if (!text) return '';
  let result = text;

  // Handle display math ($$...$$)
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, latex) => {
    return `<span class="math-display" data-katex="${escapeAttr(latex)}"></span>`;
  });

  // Handle inline math ($...$)
  result = result.replace(/\$([^$]+)\$/g, (_, latex) => {
    return `<span class="math-inline" data-katex="${escapeAttr(latex)}"></span>`;
  });

  // Handle LaTeX delimiters \(...\) and \[...\]
  result = result.replace(/\\\(([^)]+)\\\)/g, (_, latex) => {
    return `<span class="math-inline" data-katex="${escapeAttr(latex)}"></span>`;
  });

  result = result.replace(/\\\[(\s|\S)+?\\\]/g, (match) => {
    const latex = match.slice(2, -2);
    return `<span class="math-display" data-katex="${escapeAttr(latex)}"></span>`;
  });

  // Escape HTML special characters not already in KaTeX spans
  // This preserves Unicode math symbols while escaping < and >
  result = result.replace(/([^>])<(?!\/span)/g, '$1&lt;');
  result = result.replace(/([^\s])>(?!\s)/g, '$1&gt;');

  return result;
}

function calculateMarks(mcqs: MCQQuestion[], shorts: ShortQuestion[], longs: LongQuestion[]) {
  const mcqMarks = mcqs.reduce((sum, m) => sum + (m.marks || QUESTION_MARKS.mcq), 0);
  const shortMarks = shorts.length * QUESTION_MARKS.short;
  const longMarks = longs.length * QUESTION_MARKS.long;
  return { mcqMarks, shortMarks, longMarks, total: mcqMarks + shortMarks + longMarks };
}

function shouldFitOnSamePage(mcqCount: number, mcqs: MCQQuestion[]): boolean {
  // A4 page height: 297mm, margins: 10mm top + 18mm bottom = 28mm total margins
  // Usable page height: 269mm
  const USABLE_PAGE_HEIGHT = 269; // in mm
  const HEADER_HEIGHT = 30; // header + info table height in mm
  const SECTION_TITLE_HEIGHT = 12; // section title spacing in mm
  const EMPTY_SPACE_THRESHOLD = 30; // 30% of page

  // Calculate dynamic row height based on actual question text length
  let totalTextLength = 0;
  mcqs.forEach(mcq => {
    totalTextLength += mcq.questionText?.length || 0;
  });
  const avgTextLength = totalTextLength / Math.max(mcqCount, 1);
  // Minimum 6mm, increase 0.05mm per character of average question length
  const MCQ_ROW_HEIGHT = Math.min(6 + (avgTextLength * 0.05), 15);

  const estimatedMcqHeight = SECTION_TITLE_HEIGHT + (mcqCount * MCQ_ROW_HEIGHT);
  const usedHeight = HEADER_HEIGHT + estimatedMcqHeight;
  const remainingHeight = USABLE_PAGE_HEIGHT - usedHeight;
  const emptyPercentage = (remainingHeight / USABLE_PAGE_HEIGHT) * 100;

  // If more than 30% space is empty, fit on same page
  return emptyPercentage > EMPTY_SPACE_THRESHOLD;
}

export function generateHTMLTemplate(data: PaperData): string {
  const { mcqMarks, shortMarks, longMarks, total } = calculateMarks(data.mcqs, data.shorts, data.longs);

  const hasLogo = data.logoUrl && data.logoUrl.length > 0 && data.showLogo !== false;
  const hasCustomHeader = data.customHeader && data.customHeader.trim().length > 0;
  const hasCustomSubHeader = data.customSubHeader && data.customSubHeader.trim().length > 0;

  const mcqCount = data.mcqs.length;
  const shortCount = data.shorts.length;
  const longCount = data.longs.length;

  const hasMcq = mcqCount > 0;
  const hasShorts = shortCount > 0;
  const hasLongs = longCount > 0;
  const fitOnSamePage = shouldFitOnSamePage(mcqCount, data.mcqs);

  const mcqRows = data.mcqs.map((mcq, idx) => `
    <tr>
      <td class="mcq-col-no">${idx + 1}</td>
      <td class="mcq-col-question">${processMath(mcq.questionText)}</td>
      <td class="mcq-col-option">${processMath(mcq.options?.[0] || '')}</td>
      <td class="mcq-col-option">${processMath(mcq.options?.[1] || '')}</td>
      <td class="mcq-col-option">${processMath(mcq.options?.[2] || '')}</td>
      <td class="mcq-col-option">${processMath(mcq.options?.[3] || '')}</td>
    </tr>
  `).join('');

  const shortItems = data.shorts.map((sq, idx) => `
    <div class="question-item">
      <span class="question-number">${idx + 1}.</span>
      <span class="question-text">${processMath(sq.questionText)}</span>
      <span class="question-marks">[2]</span>
    </div>
  `).join('');

  const longItems = data.longs.map((lq, idx) => `
    <div class="question-item long-question">
      <span class="question-number">${idx + 1}.</span>
      <span class="question-text">${processMath(lq.questionText)}</span>
      <span class="question-marks">[5]</span>
    </div>
  `).join('');

  let mcqSection = '';
  if (hasMcq) {
    mcqSection = `
  <div class="section-title">SECTION A: OBJECTIVE / MCQs</div>
  <div class="section-subtitle">(${mcqCount} × 1 = ${mcqMarks} Marks)</div>
  <table class="mcq-table">
    <colgroup>
      <col style="width: 5%">
      <col style="width: 55%">
      <col style="width: 10%">
      <col style="width: 10%">
      <col style="width: 10%">
      <col style="width: 10%">
    </colgroup>
    <thead>
      <tr>
        <th>Q.No</th>
        <th>Question</th>
        <th>A</th>
        <th>B</th>
        <th>C</th>
        <th>D</th>
      </tr>
    </thead>
    <tbody>
      ${mcqRows}
    </tbody>
  </table>`;
  }

  let subjectiveSection = '';
  if (hasShorts || hasLongs) {
    if (hasMcq) {
      subjectiveSection += fitOnSamePage ? '<div class="two-line-space"></div>' : '<div class="page-break"></div>';
    }

    subjectiveSection += '<div class="subjective-title">SUBJECTIVE PART</div>';

    if (hasShorts) {
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += `<div class="question-header">Q1: SHORT QUESTIONS (Attempt ${shortCount} = ${shortMarks} Marks)</div>`;
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += shortItems;
    }

    if (hasLongs) {
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += `<div class="question-header">Q2: LONG QUESTIONS (Attempt ${longCount} = ${longMarks} Marks)</div>`;
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += longItems;
    }
  }

  const customHeaderHtml = hasCustomHeader ? `<div class="custom-header">${escapeHtml(data.customHeader!)}</div>` : '';
  const customSubHeaderHtml = hasCustomSubHeader ? `<div class="custom-subheader">${escapeHtml(data.customSubHeader!)}</div>` : '';

  const logoHtml = hasLogo ? `<div class="logo-container"><img src="${data.logoUrl}" alt="Logo" class="logo"></div>` : '';

  const headerHtml = `
  <div class="header">
    ${logoHtml}
    ${customHeaderHtml}
    <div class="school-name">${escapeHtml(data.instituteName).toUpperCase()}</div>
    ${customSubHeaderHtml}
    <div class="subject-line">${escapeHtml(data.subject).toUpperCase()} - CLASS ${escapeHtml(data.classId).toUpperCase()}</div>
    <div class="header-details">
      <span>Time: ${escapeHtml(data.timeAllowed)}</span>
      <span>Total Marks: ${total}</span>
      <span>Date: ${escapeHtml(data.date)}</span>
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.subject)} - Class ${escapeHtml(data.classId)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 10mm; }
    
    body {  
      font-family: 'Times New Roman', Times, serif; 
      font-size: 12pt; 
      line-height: 1.5; 
      color: #000; 
    }
    
    .one-line-space { height: 10pt; }
    .two-line-space { height: 18pt; }
    
    .header { 
      text-align: center; 
      border-bottom: 0.5pt solid #000; 
      padding-bottom: 4pt; 
      margin-bottom: 4pt; 
    }
    
    .logo-container { 
      text-align: center; 
      margin-bottom: 4pt; 
    }
    
    .logo { 
      width: 45pt; 
      height: 45pt; 
      object-fit: contain; 
    }
    
    .custom-header { font-size: 14pt; font-weight: bold; margin-bottom: 2pt; color: #333; }
    .custom-subheader { font-size: 12pt; font-weight: 500; margin-top: 1pt; margin-bottom: 3pt; color: #444; }
    
    .school-name { font-size: 16pt; font-weight: bold; }
    .subject-line { font-size: 14pt; margin-top: 2pt; font-weight: 600; }
    .header-details { display: flex; justify-content: center; gap: 15pt; font-size: 10pt; margin-top: 2pt; }
    
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; font-size: 10pt; }
    .info-table td { border: 0.4pt solid #000; padding: 4pt; }
    .info-label { font-weight: bold; width: 45pt; background: #f5f5f5; }
    
    .section-title { font-size: 14pt; font-weight: bold; text-align: center; margin-top: 5pt; }
    .section-subtitle { font-size: 11pt; text-align: center; color: #444; margin-bottom: 6pt; }
    
    .mcq-table { width: 100%; border-collapse: collapse; font-size: 12pt; table-layout: fixed; }
    .mcq-table th { border: 0.4pt solid #000; background: #f0f0f0; padding: 4pt; font-weight: bold; text-align: center; font-size: 11pt; }
    .mcq-table td { border: 0.4pt solid #000; padding: 4pt; vertical-align: middle; word-wrap: break-word; }
    .mcq-col-no { text-align: center; }
    .mcq-col-question { text-align: left; }
    .mcq-col-option { text-align: center; }
    
    .subjective-title { font-size: 15pt; font-weight: bold; text-align: center; margin-top: 10pt; }
    .question-header { font-size: 14pt; font-weight: bold; }
    
    .question-item { display: flex; line-height: 1.5; margin-bottom: 4pt; }
    .long-question { margin-top: 6pt; }
    .question-number { font-weight: bold; width: 18pt; flex-shrink: 0; }
    .question-text { flex: 1; text-align: left; }
    .question-marks { font-size: 11pt; color: #555; width: 22pt; text-align: right; flex-shrink: 0; }
    
    .page-break { page-break-before: always; }
    
    .watermark { 
      position: fixed; 
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      text-align: center; 
      font-size: 9pt; 
      font-family: 'Times New Roman', Times, serif;
      color: #1c1c1c;
      padding: 6pt 10mm;
      margin-top: 4pt;
      border-top: 0.5pt solid #ccc;
      background: white;
      z-index: 1000;
    }
    
    .katex { 
      font-size: 1.15em; 
      line-height: 1.4; 
      font-family: 'KaTeX_Main', 'Times New Roman', serif;
      letter-spacing: 0.01em;
    }
    .katex-html { 
      white-space: normal; 
      display: inline;
    }
    .katex .sizing { font-size: inherit; }
    .katex .mopen, .katex .mclose { font-size: 1.1em; }
    .math-inline { 
      display: inline; 
      word-spacing: normal;
      margin: 0 2pt;
    }
    .math-display { 
      display: block; 
      text-align: center; 
      margin: 6pt 0; 
      padding: 4pt 0; 
      font-size: 1.05em;
    }
    
    /* Professional book-like fraction and math rendering */
    .katex .frac-line { 
      border-top: 1.4px solid #000; 
      min-height: 0.04em;
    }
    .katex .mfrac > .vlist-t { 
      vertical-align: middle; 
    }
    .katex .sqrt-sign { 
      font-size: 1.1em; 
      position: relative;
      top: -0.1em;
    }
    .katex .radical { font-size: 1.1em; }
    .katex .op { letter-spacing: 0.05em; font-weight: 400; }
    .katex .thinspace { width: 0.15em; }
    .katex .enclose { border-radius: 2pt; }

    /* Increase inline math size slightly for better legibility */
    .math-inline .katex { font-size: 1.15em; }
    
    /* Ensure fractions don't look too small in inline mode */
    .math-inline .katex .mfrac { font-size: 0.95em; }
    
    /* Question text with math */
    .question-text, .mcq-col-question { 
      line-height: 1.6; 
      word-spacing: 0.05em;
      overflow-wrap: break-word;
    }
    
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .mcq-table { page-break-inside: auto; }
      .question-item { page-break-inside: avoid; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  ${headerHtml}

  <table class="info-table">
    <tr>
      <td class="info-label">Name:</td><td></td>
      <td class="info-label">Roll No:</td><td></td>
      <td class="info-label">Section:</td><td></td>
    </tr>
  </table>

  ${mcqSection}
  ${subjectiveSection}

  <div class="watermark">PaperPress App by Hamza Khan. - Email: paperpressapp@gmail.com</div>

  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script>
    (function() {
      function renderMath() {
        if (typeof katex === 'undefined') return;
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
              minRuleThickness: 0.1,
              maxSize: 10000,
              maxExpand: 10000,
              macros: {
                /* Fractions and roots */
                "\\frac": "\\frac",
                "\\dfrac": "\\dfrac",
                "\\tfrac": "\\tfrac",
                "\\sqrt": "\\sqrt",
                "\\cbrt": "\\sqrt[3]",
                
                /* Limits and summations */
                "\\lim": "\\lim",
                "\\liminf": "\\liminf",
                "\\limsup": "\\limsup",
                "\\sum": "\\sum",
                "\\prod": "\\prod",
                "\\int": "\\int",
                "\\iint": "\\iint",
                "\\oint": "\\oint",
                
                /* Operators */
                "\\sin": "\\sin",
                "\\cos": "\\cos",
                "\\tan": "\\tan",
                "\\sec": "\\sec",
                "\\csc": "\\csc",
                "\\cot": "\\cot",
                "\\sinh": "\\sinh",
                "\\cosh": "\\cosh",
                "\\tanh": "\\tanh",
                "\\log": "\\log",
                "\\ln": "\\ln",
                "\\lg": "\\lg",
                "\\exp": "\\exp",
                
                /* Inverse functions */
                "\\arcsin": "\\arcsin",
                "\\arccos": "\\arccos",
                "\\arctan": "\\arctan",
                "\\sin^{-1}": "\\sin^{-1}",
                "\\cos^{-1}": "\\cos^{-1}",
                "\\tan^{-1}": "\\tan^{-1}",
                
                /* Derivatives */
                "\\frac{d}{dx}": "\\frac{d}{dx}",
                "\\frac{\\partial}{\\partial x}": "\\frac{\\partial}{\\partial x}",
                "\\mathrm{d}": "\\mathrm{d}",
                
                /* Calculus notation */
                "\\to": "\\to",
                "\\infty": "\\infty",
                "\\pm": "\\pm",
                "\\mp": "\\mp",
                "\\cdot": "\\cdot",
                "\\times": "\\times",
                "\\div": "\\div",
                "\\leq": "\\leq",
                "\\geq": "\\geq",
                "\\approx": "\\approx",
                "\\equiv": "\\equiv",
                "\\ne": "\\ne",
                "\\neq": "\\neq",
                
                /* Special symbols */
                "\\alpha": "\\alpha",
                "\\beta": "\\beta",
                "\\gamma": "\\gamma",
                "\\delta": "\\delta",
                "\\epsilon": "\\epsilon",
                "\\theta": "\\theta",
                "\\pi": "\\pi",
                "\\phi": "\\phi",
                "\\psi": "\\psi",
                "\\omega": "\\omega",
                "\\lambda": "\\lambda",
                "\\mu": "\\mu",
                "\\nu": "\\nu",
                "\\xi": "\\xi",
                "\\sigma": "\\sigma",
                "\\tau": "\\tau",
                "\\rho": "\\rho"
              }
            });
          } catch(e) {
            /* Fallback: show placeholder if KaTeX fails */
            el.innerHTML = '<span style="color:#999;font-style:italic;">[Formula]</span>';
          }
        });
        window.__katexRendered = true;
      }
      if (document.readyState === 'complete') renderMath();
      else window.addEventListener('load', renderMath);
    })();
  </script>
</body>
</html>`;
}
