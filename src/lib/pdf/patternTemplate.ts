/**
 * PaperPress — Pattern-Aware HTML Paper Generator
 *
 * Produces complete A4 paper HTML for any classId + subject.
 * Called by generateHTMLTemplate() in htmlTemplate.ts.
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { processMathInText, escapeHtml, escapeAttr } from './mathProcessor';
import { generateKaTeXScript, getKaTeXCSSTag } from './modules';
import { generatePatternCSS } from './patternCSS';
import {
  resolvePaperPattern,
  distributeShorts,
  distributeLongs,
  type QuestionSection,
} from './patterns';

export interface PatternTemplateInput {
  instituteName: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  logoUrl?: string | null;
  showLogo?: boolean;
  showWatermark?: boolean;
  classId: string;
  subject: string;
  examType?: string;
  date: string;
  timeAllowed?: string;
  syllabus?: string;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
  customHeader?: string;
  customSubHeader?: string;
  customMarks?: {
    mcq?: number;
    short?: number;
    long?: number;
  };
  attemptRules?: {
    shortAttempt?: number;
    longAttempt?: number;
  };
  includeBubbleSheet?: boolean;
}

export function generatePatternHTML(input: PatternTemplateInput): string {
  const pattern = resolvePaperPattern(input.classId, input.subject);

  const timeAllowed = input.timeAllowed || pattern.timeAllowed;

  // Calculate ACTUAL marks based on selected questions and custom marks per question
  // Fall back to pattern.totalMarks only if no questions selected
  const mcqMark = input.customMarks?.mcq ?? 1;
  const shortMark = input.customMarks?.short ?? 2;
  const longMark = input.customMarks?.long ?? 5;

  const actualMarks =
    input.mcqs.length > 0 || input.shorts.length > 0 || input.longs.length > 0
      ? (input.mcqs.length * mcqMark) +
        (input.shorts.length * shortMark) +
        (input.longs.length * longMark)
      : pattern.totalMarks;

  const totalMarks = actualMarks;

  const shortDist = distributeShorts(pattern, input.shorts);
  const longDist  = distributeLongs(pattern, input.longs);

  // Determine the first subjective section Q number
  const firstSubjectiveQNum = pattern.sections
    .filter(s => s.type === 'short' || s.type === 'long')
    .sort((a, b) => a.qNumber - b.qNumber)[0]?.qNumber ?? -1;

  let longQCounter = 0;
  const firstLongSection = pattern.sections.find(s => s.type === 'long');
  if (firstLongSection) longQCounter = firstLongSection.qNumber;

  const sectionsHTML = pattern.sections.map(section => {
    switch (section.type) {

      case 'mcq':
        return renderMCQ(section, input.mcqs);

      case 'short': {
        const dist = shortDist.find(d => d.section.qNumber === section.qNumber);
        const isFirstSubjective = section.qNumber === firstSubjectiveQNum;
        return renderShorts(
          section,
          dist?.questions || [],
          input.customMarks?.short,
          isFirstSubjective
        );
      }

      case 'long': {
        const dist = longDist.find(d => d.section.qNumber === section.qNumber);
        const isFirstSubjective = section.qNumber === firstSubjectiveQNum;
        return renderLongs(
          section,
          dist?.questions || [],
          section.qNumber,
          input.customMarks?.long,
          isFirstSubjective
        );
      }

      case 'writing':
        return renderWriting(section);

      default:
        return '';
    }
  }).join('\n');

  const hasSubjective = input.shorts.length > 0 || input.longs.length > 0;
  const hasWriting = pattern.sections.some(s => s.type === 'writing');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794, initial-scale=1.0, maximum-scale=1.0">
  <title>${escapeHtml(input.subject)} — Class ${escapeHtml(input.classId)}</title>
  ${getKaTeXCSSTag()}
  <style>${generatePatternCSS()}</style>
</head>
<body>
  ${renderHeader(input, timeAllowed, totalMarks)}
  ${renderStudentMeta(input, totalMarks)}
  ${sectionsHTML}
  ${input.includeBubbleSheet ? renderOMRBubbleSheet(input.mcqs.length) : ''}
  ${input.showWatermark !== false ? `<div class="pp-footer">PaperPress App &mdash; paperpressapp@gmail.com</div>` : ''}
  ${generateKaTeXScript()}
</body>
</html>`;
}

function renderHeader(
  input: PatternTemplateInput,
  timeAllowed: string,
  totalMarks: number
): string {
  const hasLogo = !!input.logoUrl && input.showLogo !== false;

  const logoHTML = hasLogo
    ? `<img src="${escapeAttr(input.logoUrl!)}" alt="School Logo" class="pp-logo" />`
    : '';

  const customTop = input.customHeader?.trim()
    ? `<div style="font-size:8pt;font-style:italic;margin-bottom:1pt">${escapeHtml(input.customHeader!)}</div>`
    : '';

  const customSub = input.customSubHeader?.trim()
    ? `<div style="font-size:8pt;margin-top:1pt">${escapeHtml(input.customSubHeader!)}</div>`
    : '';

  const hasContact = input.instituteAddress || input.instituteEmail ||
                     input.institutePhone   || input.instituteWebsite;

  const contactBar = hasContact ? `
    <div class="pp-contact-bar">
      ${input.instituteAddress ? `<span>&#x1F4CD; ${escapeHtml(input.instituteAddress)}</span>` : ''}
      ${input.instituteWebsite ? `<span>&#x1F310; ${escapeHtml(input.instituteWebsite)}</span>` : ''}
      ${input.instituteEmail   ? `<span>&#x2709; ${escapeHtml(input.instituteEmail)}</span>`   : ''}
      ${input.institutePhone   ? `<span>&#x260E; ${escapeHtml(input.institutePhone)}</span>`   : ''}
    </div>` : '';

  return `
  <div class="pp-header">
    <div class="pp-header-body">
      ${logoHTML}
      ${customTop}
      <div class="pp-school-name">${escapeHtml(input.instituteName)}</div>
      ${customSub}
    </div>
    ${contactBar}
  </div>`;
}

function renderStudentMeta(input: PatternTemplateInput, totalMarks: number): string {
  const pattern = resolvePaperPattern(input.classId, input.subject);
  const timeAllowed = input.timeAllowed || pattern.timeAllowed;

  return `
  <div class="pp-meta">
    <div class="pp-meta-row">
      <div class="pp-meta-cell" style="flex:2">
        <span class="pp-meta-label">Name:</span>
        <span class="pp-meta-line"></span>
      </div>
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Roll #:</span>
        <span class="pp-meta-line"></span>
      </div>
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Subject:</span>
        <span style="margin-left:2pt">${escapeHtml(input.subject)}</span>
      </div>
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Date:</span>
        <span style="margin-left:2pt">${escapeHtml(input.date)}</span>
      </div>
    </div>
    <div class="pp-meta-row">
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Class:</span>
        <span style="margin-left:2pt">${escapeHtml(input.classId)}</span>
      </div>
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Time:</span>
        <span style="margin-left:2pt">${escapeHtml(timeAllowed)}</span>
      </div>
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Total Marks:</span>
        <span style="margin-left:2pt;font-weight:bold">${totalMarks}</span>
      </div>
      <div class="pp-meta-cell">
        <span class="pp-meta-label">Signature:</span>
        <span class="pp-meta-line"></span>
      </div>
    </div>
    <div class="pp-meta-row">
      <div class="pp-meta-cell" style="flex:1">
        <span class="pp-meta-label">Syllabus:</span>
        <span class="pp-meta-line" style="min-width:100pt"></span>
      </div>
    </div>
  </div>`;
}

function renderSectionBar(section: QuestionSection): string {
  return `
  <div class="pp-sec-bar">
    <span class="pp-sec-qnum">Q${section.qNumber}:</span>
    <span class="pp-sec-title">${escapeHtml(section.title)}</span>
    <span class="pp-sec-instr">${escapeHtml(section.instruction)}</span>
    <span class="pp-sec-marks">${escapeHtml(section.marksFormula)}</span>
  </div>
  ${section.specialNote
    ? `<div class="pp-sec-note">&#9658; ${escapeHtml(section.specialNote)}</div>`
    : ''}`;
}

function renderMCQ(section: QuestionSection, mcqs: MCQQuestion[]): string {
  if (!mcqs.length) return '';

  return `
  <div data-section="mcq">
    ${renderSectionBar(section)}
    ${renderBubblegrid(mcqs)}
    ${renderMCQTable(mcqs)}
  </div>`;
}

function renderBubblegrid(mcqs: MCQQuestion[]): string {
  const items = mcqs.map((_, i) => `
    <div class="pp-bub-item">
      <span class="pp-bub-num">${i + 1}.</span>
      <div class="pp-bub-opts">
        ${['A','B','C','D'].map(l => `
          <div class="pp-bub-opt">
            <span class="pp-bub-letter">${l}</span>
            <span class="pp-bub-circle"></span>
          </div>`).join('')}
      </div>
    </div>`).join('');

  return `<div class="pp-bubbles">${items}</div>`;
}

function renderMCQTable(mcqs: MCQQuestion[]): string {
  const rows = mcqs.map((mcq, i) => {
    const opts = mcq.options || ['', '', '', ''];
    const labels = ['A', 'B', 'C', 'D'];
    const optHTML = opts.map((opt, oi) =>
      `<div class="pp-mcq-opt">
        <span class="pp-mcq-opt-lbl">(${labels[oi]})</span>&nbsp;${processMathInText(String(opt))}
      </div>`).join('');

    return `
    <tr class="pp-mcq-tr" data-qid="${escapeAttr(mcq.id)}">
      <td class="pp-mcq-num">${i + 1}.</td>
      <td class="pp-mcq-body">
        <span class="pp-mcq-qtext">${processMathInText(mcq.questionText)}</span>
        <div class="pp-mcq-opts">${optHTML}</div>
      </td>
    </tr>`;
  }).join('');

  return `<table class="pp-mcq-table"><tbody>${rows}</tbody></table>`;
}

function renderShorts(
  section: QuestionSection,
  questions: ShortQuestion[],
  customMark?: number,
  isFirstSubjective: boolean = false
): string {
  if (!questions.length) return '';

  const marksPerQ = customMark ?? section.marksPerQuestion;
  const attemptCount = Math.min(section.attemptCount, questions.length);
  const actualTotal = attemptCount * marksPerQ;

  // Build dynamic section with actual counts
  const dynamicSection: QuestionSection = {
    ...section,
    marksPerQuestion: marksPerQ,
    marksFormula: `${attemptCount} × ${marksPerQ} = ${actualTotal}`,
    instruction: `Attempt any ${attemptCount} short questions.`,
  };

  const rows = questions.map((q, i) => `
    <div class="pp-short-row" data-qid="${escapeAttr(q.id)}">
      <span class="pp-short-num">(${toRoman(i + 1)})</span>
      <span class="pp-short-text">${processMathInText(q.questionText)}</span>
      <span class="pp-short-marks">[${marksPerQ}]</span>
    </div>`).join('');

  return `
  ${isFirstSubjective ? '<div class="pp-divider">SUBJECTIVE SECTION</div>' : ''}
  <div data-section="short-${section.qNumber}">
    ${renderSectionBar(dynamicSection)}
    <div class="pp-shorts">${rows}</div>
  </div>`;
}

function renderLongs(
  section: QuestionSection,
  questions: LongQuestion[],
  startQNum: number,
  customMark?: number,
  isFirstSubjective: boolean = false
): string {
  if (!questions.length) return '';

  const marksPerQ = customMark ?? section.marksPerQuestion;
  const attemptCount = Math.min(section.attemptCount, questions.length);
  const actualTotal = attemptCount * marksPerQ;

  const dynamicSection: QuestionSection = {
    ...section,
    marksPerQuestion: marksPerQ,
    marksFormula: `${attemptCount} × ${marksPerQ} = ${actualTotal}`,
    instruction: `Attempt any ${attemptCount} long questions.`,
  };

  const items = questions.map((q, i) => {
    const displayNum = `Q.${startQNum + i}`;
    const marksDisplay = marksPerQ;

    if (section.hasSubParts) {
      const hasExplicitParts = q.questionText.includes('(a)') || q.questionText.includes('(b)');

      const partsHTML = hasExplicitParts
        ? `<div class="pp-long-parts">
             <div class="pp-long-part">
               <span class="pp-long-part-text">${processMathInText(q.questionText)}</span>
             </div>
           </div>`
        : `<div class="pp-long-parts">
             <div class="pp-long-part">
               <span class="pp-long-part-lbl">(a)</span>
               <span class="pp-long-part-text">${processMathInText(q.questionText)}</span>
               <span class="pp-long-part-marks">[${section.subPartAMarks ?? 5}]</span>
             </div>
             <div class="pp-long-part">
               <span class="pp-long-part-lbl">(b)</span>
               <span class="pp-long-part-text">Solve the related numerical / practical application.</span>
               <span class="pp-long-part-marks">[${section.subPartBMarks ?? 4}]</span>
             </div>
           </div>`;

      return `
      <div class="pp-long-item" data-qid="${escapeAttr(q.id)}">
        <div class="pp-long-header">
          <span class="pp-long-qnum">${displayNum}.</span>
          <span class="pp-long-marks">[${marksDisplay}]</span>
        </div>
        ${partsHTML}
      </div>`;
    } else {
      return `
      <div class="pp-long-item" data-qid="${escapeAttr(q.id)}">
        <div class="pp-long-header">
          <span class="pp-long-qnum">${displayNum}.</span>
          <span class="pp-long-text">${processMathInText(q.questionText)}</span>
          <span class="pp-long-marks">[${marksDisplay}]</span>
        </div>
      </div>`;
    }
  }).join('');

  return `
  ${isFirstSubjective ? '<div class="pp-divider">SUBJECTIVE SECTION</div>' : ''}
  <div data-section="long">
    ${renderSectionBar(dynamicSection)}
    <div class="pp-longs">${items}</div>
  </div>`;
}

function renderWriting(section: QuestionSection): string {
  const lineCount = section.answerLines ?? Math.min(Math.ceil(section.totalMarks * 1.8), 22);
  const lines = Array(lineCount).fill('<div class="pp-line"></div>').join('');

  const needsBreak = section.qNumber >= 3 && section.type === 'writing';

  return `
  ${needsBreak ? '<div class="pp-divider">SUBJECTIVE SECTION</div>' : ''}
  <div data-section="writing-${section.qNumber}">
    ${renderSectionBar(section)}
    ${section.writingPrompt
      ? `<div class="pp-writing-prompt">${escapeHtml(section.writingPrompt)}</div>`
      : ''}
    <div class="pp-lines">${lines}</div>
  </div>`;
}

function renderOMRBubbleSheet(mcqCount: number): string {
  const rows = Math.ceil(mcqCount / 10);
  let bubbles = '';
  
  for (let row = 0; row < rows; row++) {
    const startNum = row * 10 + 1;
    const endNum = Math.min(startNum + 9, mcqCount);
    const questionsInRow = endNum - startNum + 1;
    
    let rowHTML = `<div class="omr-row"><span class="omr-range">${startNum}-${endNum}</span>`;
    
    for (let q = 0; q < questionsInRow; q++) {
      const qNum = startNum + q;
      rowHTML += `
        <div class="omr-q">
          <span class="omr-num">${qNum}</span>
          <div class="omr-bubbles">
            <span class="omr-letter">A</span><span class="omr-circle"></span>
            <span class="omr-letter">B</span><span class="omr-circle"></span>
            <span class="omr-letter">C</span><span class="omr-circle"></span>
            <span class="omr-letter">D</span><span class="omr-circle"></span>
          </div>
        </div>`;
    }
    rowHTML += '</div>';
    bubbles += rowHTML;
  }

  return `
  <div class="pp-page-break"></div>
  <div class="omr-sheet">
    <div class="omr-header">
      <h3>OMR Answer Sheet</h3>
      <p>Fill bubbles completely. Use only blue/black ball point pen.</p>
    </div>
    <div class="omr-info">
      <div class="omr-field"><span>Name:</span><div class="omr-line"></div></div>
      <div class="omr-field"><span>Roll No:</span><div class="omr-line"></div></div>
      <div class="omr-field"><span>Class:</span><div class="omr-line"></div></div>
    </div>
    <div class="omr-instructions">
      <strong>Instructions:</strong> Darken the correct bubble completely. Do not make stray marks.
    </div>
    <div class="omr-bubbles-container">${bubbles}</div>
  </div>`;
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [10,'x'],[9,'ix'],[8,'viii'],[7,'vii'],[6,'vi'],
    [5,'v'],[4,'iv'],[3,'iii'],[2,'ii'],[1,'i'],
  ];
  let r = '';
  for (const [v, s] of map) {
    while (n >= v) { r += s; n -= v; }
  }
  return r;
}
