/**
 * HTML TEMPLATE ENGINE - Professional Exam Paper Layout
 * 
 * Adaptive: Objective & Subjective on separate pages by default
 * But if > half page empty after MCQs, put Subjective on same page with 2 line spaces
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

export interface PaperConfig {
  classId: string;
  subject: string;
  logoUrl?: string | null;
  instituteName: string;
  date: string;
  timeAllowed: string;
  totalMarks: number;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
}

export interface PDFSettings {
  instituteName: string;
  instituteLogo?: string | null;
  examType: string;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
}

function processText(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, latex) => {
    return `<span class="math-display" data-katex="${escapeAttr(latex)}"></span>`;
  });
  
  result = result.replace(/\$([^$]+)\$/g, (_, latex) => {
    return `<span class="math-inline" data-katex="${escapeAttr(latex)}"></span>`;
  });
  
  result = result.replace(/\\\(([^)]+)\\\)/g, (_, latex) => {
    return `<span class="math-inline" data-katex="${escapeAttr(latex)}"></span>`;
  });
  
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (_, latex) => {
    return `<span class="math-display" data-katex="${escapeAttr(latex)}"></span>`;
  });
  
  // Escape HTML special characters not already in KaTeX spans
  result = result.replace(/([^>])<(?!\/span)/g, '$1&lt;');
  result = result.replace(/([^\s])>(?!\s)/g, '$1&gt;');
  
  return result;
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function calculateMarks(mcqs: MCQQuestion[], shorts: ShortQuestion[], longs: LongQuestion[]) {
  const mcqMarks = mcqs.reduce((sum, m) => sum + (m.marks || 1), 0);
  const shortMarks = shorts.length * 2;
  const longMarks = longs.length * 5;
  return { mcqMarks, shortMarks, longMarks, total: mcqMarks + shortMarks + longMarks };
}

function shouldFitOnSamePage(mcqCount: number, mcqs: MCQQuestion[]): boolean {
  // A4 page height: 11 inches (279.4mm), margins: 0.4in top + 0.7in bottom = 1.1in total
  // Usable page height: 9.9 inches (251.5mm)
  const USABLE_PAGE_HEIGHT = 251.5; // in mm
  const HEADER_HEIGHT = 38; // header + info table height in mm (larger for this template)
  const SECTION_TITLE_HEIGHT = 14; // section title spacing in mm
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

export function generatePaperHTML(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): string {
  const paper: PaperConfig = {
    classId: settings.classId,
    subject: settings.subject,
    logoUrl: settings.instituteLogo,
    instituteName: settings.instituteName,
    date: settings.date,
    timeAllowed: settings.timeAllowed,
    totalMarks: 0,
    mcqs,
    shorts,
    longs
  };
  
  return generateHTML(paper);
}

export function generateHTML(paper: PaperConfig): string {
  const { mcqMarks, shortMarks, longMarks, total } = calculateMarks(paper.mcqs, paper.shorts, paper.longs);
  
  const hasLogo = paper.logoUrl && paper.logoUrl.length > 0;
  const mcqCount = paper.mcqs.length;
  const shortCount = paper.shorts.length;
  const longCount = paper.longs.length;
  const shortStartNum = mcqCount + 1;
  const longStartNum = mcqCount + shortCount + 1;
  
  const hasMcq = mcqCount > 0;
  const hasShorts = shortCount > 0;
  const hasLongs = longCount > 0;

  const fitOnSamePage = shouldFitOnSamePage(mcqCount, paper.mcqs);

  const mcqRows = paper.mcqs.map((mcq, idx) => `
    <tr>
      <td class="mcq-col-no">${idx + 1}</td>
      <td class="mcq-col-question">${processText(mcq.questionText)}</td>
      <td class="mcq-col-option">${processText(mcq.options?.[0] || '')}</td>
      <td class="mcq-col-option">${processText(mcq.options?.[1] || '')}</td>
      <td class="mcq-col-option">${processText(mcq.options?.[2] || '')}</td>
      <td class="mcq-col-option">${processText(mcq.options?.[3] || '')}</td>
    </tr>
  `).join('');

  const shortItems = paper.shorts.map((sq, idx) => `
    <div class="question-item">
      <span class="question-number">${idx + 1}.</span>
      <span class="question-text">${processText(sq.questionText)}</span>
      <span class="question-marks">[2]</span>
    </div>
  `).join('');

  const longItems = paper.longs.map((lq, idx) => `
    <div class="question-item">
      <span class="question-number">${idx + 1}.</span>
      <span class="question-text">${processText(lq.questionText)}</span>
      <span class="question-marks">[5]</span>
    </div>
  `).join('');

  let mcqSection = '';
  if (hasMcq) {
    mcqSection = `
  <div class="section-title">SECTION A: OBJECTIVE / MCQs</div>
  <div class="one-line-space"></div>
  <div class="section-subtitle">(${mcqCount} × 1 = ${mcqMarks} Marks)</div>

  <table class="mcq-table">
    <thead>
      <tr>
        <th class="mcq-col-no">Q.No</th>
        <th class="mcq-col-question">Question</th>
        <th class="mcq-col-option">A</th>
        <th class="mcq-col-option">B</th>
        <th class="mcq-col-option">C</th>
        <th class="mcq-col-option">D</th>
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
      if (fitOnSamePage) {
        subjectiveSection += '<div class="two-line-space"></div>';
      } else {
        subjectiveSection += '<div class="page-break"></div>';
      }
    }
    
    subjectiveSection += '<div class="subjective-title">SUBJECTIVE PART</div>';
    
    if (hasShorts) {
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += `<div class="question-header">Q${shortStartNum}: SHORT QUESTIONS (Attempt ${shortCount} = ${shortMarks} Marks)</div>`;
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += shortItems;
    }
    
    if (hasLongs) {
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += `<div class="question-header">Q${longStartNum}: LONG QUESTIONS (Attempt ${longCount} = ${longMarks} Marks)</div>`;
      subjectiveSection += '<div class="one-line-space"></div>';
      subjectiveSection += longItems;
    }
  }

  let headerHtml = '';
  if (hasLogo) {
    headerHtml = `
  <div class="header-with-logo">
    <img src="${paper.logoUrl}" alt="Logo" class="logo">
    <div class="header-content">
      <div class="school-name">${escapeHtml(paper.instituteName).toUpperCase()}</div>
      <div class="subject-line">${escapeHtml(paper.subject).toUpperCase()} - CLASS ${escapeHtml(paper.classId).toUpperCase()}</div>
      <div class="header-details">
        <span>Time: ${escapeHtml(paper.timeAllowed)}</span>
        <span>Total Marks: ${total}</span>
        <span>Date: ${escapeHtml(paper.date)}</span>
      </div>
    </div>
  </div>`;
  } else {
    headerHtml = `
  <div class="header">
    <div class="school-name">${escapeHtml(paper.instituteName).toUpperCase()}</div>
    <div class="subject-line">${escapeHtml(paper.subject).toUpperCase()} - CLASS ${escapeHtml(paper.classId).toUpperCase()}</div>
    <div class="header-details">
      <span>Time: ${escapeHtml(paper.timeAllowed)}</span>
      <span>Total Marks: ${total}</span>
      <span>Date: ${escapeHtml(paper.date)}</span>
    </div>
  </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(paper.subject)} - Class ${escapeHtml(paper.classId)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <style>
    @font-face { font-family: 'Times New Roman'; src: local('Times New Roman'); }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0.4in 0.35in; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; color: #000000; background: #ffffff; }
    
    .one-line-space { height: 8pt; }
    .two-line-space { height: 16pt; }
    
    .header { text-align: center; border-bottom: 0.6pt solid #000000; padding-bottom: 3pt; margin-bottom: 3pt; }
    .header-with-logo { display: flex; align-items: center; justify-content: center; gap: 10pt; border-bottom: 0.6pt solid #000000; padding-bottom: 3pt; margin-bottom: 3pt; }
    .logo { width: 40pt; height: 32pt; object-fit: contain; }
    .header-content { text-align: center; }
    .school-name { font-size: 20pt; font-weight: bold; letter-spacing: 0.5pt; }
    .subject-line { font-size: 16pt; margin-top: 1pt; font-weight: 600; }
    .header-details { display: flex; justify-content: center; gap: 20pt; font-size: 10pt; margin-top: 1pt; }
    
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; font-size: 10pt; }
    .info-table td { border: 0.5pt solid #000000; padding: 3pt 3pt; vertical-align: middle; }
    .info-label { font-weight: bold; width: 45pt; background: #f5f5f5; }
    
    .section-title { font-size: 14pt; font-weight: bold; text-align: center; }
    .section-subtitle { font-size: 10pt; text-align: center; color: #444444; }
    
    .mcq-table { width: 100%; border-collapse: collapse; font-size: 9pt; table-layout: fixed; }
    .mcq-table th { border: 0.5pt solid #000000; background: #f0f0f0; padding: 2pt 3pt; font-weight: bold; text-align: center; font-size: 8pt; }
    .mcq-table td { border: 0.5pt solid #000000; padding: 2pt 3pt; vertical-align: middle; word-wrap: break-word; overflow-wrap: break-word; }
    .mcq-col-no { width: 16pt; text-align: center; }
    .mcq-col-question { text-align: left; }
    .mcq-col-option { width: 36pt; text-align: center; }
    
    .subjective-title { font-size: 16pt; font-weight: bold; text-align: center; }
    .question-header { font-size: 12pt; font-weight: bold; }
    
    .question-item { display: flex; margin-bottom: 0; line-height: 1.3; }
    .question-number { font-weight: bold; width: 16pt; flex-shrink: 0; }
    .question-text { flex: 1; text-align: justify; }
    .question-marks { font-size: 8pt; color: #555555; width: 20pt; text-align: right; flex-shrink: 0; }
    
    .page-break { page-break-before: always; }
    
    .watermark { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; text-align: center; font-size: 9pt; font-family: 'Times New Roman', Times, serif; color: #666; padding: 6pt 20pt; margin-top: 4pt; border-top: 0.5pt solid #ccc; background: white; z-index: 1000; }
    
    .katex { 
      font-size: 1em; 
      line-height: 1.2; 
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
    .katex .frac-line { border-top: 1.4px solid #000; }
    .katex .sqrt-sign { font-size: 1.25em; }
    .katex .radical { font-size: 1.2em; }
    .katex .op { letter-spacing: 0.05em; font-weight: 400; }
    .katex .thinspace { width: 0.15em; }
    .katex .enclose { border-radius: 2pt; }
    
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
      <td class="info-label">Name:</td>
      <td></td>
      <td class="info-label">Roll No:</td>
      <td></td>
      <td class="info-label">Section:</td>
      <td></td>
    </tr>
  </table>

  ${mcqSection}
  ${subjectiveSection}

  <div class="watermark">PaperPress App by Hamza Khan - Phone: 03007172656.</div>

  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('[data-katex]').forEach(function(el) {
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
    });
  </script>
</body>
</html>`;
}

export function generatePDFFilename(
  classId: string,
  subject: string,
  date: string
): string {
  const formattedDate = date.replace(/-/g, '');
  const formattedSubject = subject.replace(/\s+/g, '_');
  return `${classId}_${formattedSubject}_${formattedDate}.pdf`;
}

export { processText };
