import { jsPDF } from "jspdf";
import type { PaperData, MCQQuestion, ShortQuestion, LongQuestion } from "@/types";
import { QUESTION_MARKS } from "@/types/question";

/**
 * PROFESSIONAL EXAM PAPER GENERATOR
 * Phase 1: Core Layout & Architecture
 * Punjab Board Style with Proper Page Management
 */

// =============================================================================
// STEP 1.1: GLOBAL PAGE CONFIGURATION
// =============================================================================

// Page dimensions (A4 in mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

// Margin constants (in mm) - accessible everywhere
const MARGIN_TOP = 15;
const MARGIN_BOTTOM = 15;
const MARGIN_LEFT = 15;
const MARGIN_RIGHT = 15;

// Safe width - ensures no text touches edges
const SAFE_WIDTH = PAGE_WIDTH - (MARGIN_LEFT + MARGIN_RIGHT);

// Header section fixed height (in mm)
const HEADER_HEIGHT = 35;

// Font settings
// Font settings
const FONT = "times";
const FONT_SIZE = {
  institution: 16,
  subject: 14,
  meta: 10,
  label: 10,
  section: 12,
  question: 12,
  option: 11,
  footer: 8
};

// Line width for borders
const LINE_WIDTH = 0.3;

// =============================================================================
// PDF CREATION & UTILITIES
// =============================================================================

function createPDF(): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.setFont(FONT);
  pdf.setTextColor(0, 0, 0);
  pdf.setDrawColor(0, 0, 0);
  return pdf;
}

function setFont(pdf: jsPDF, size: number, style: string = "normal") {
  pdf.setFontSize(size);
  pdf.setFont(FONT, style);
}

function drawHLine(pdf: jsPDF, y: number, width: number = LINE_WIDTH) {
  pdf.setLineWidth(width);
  pdf.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
}

function cleanLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\$\$?([^$]+)\$\$?/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt(\w)/g, '√$1')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\degree/g, '°')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^o/g, '°')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_4/g, '₄')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '');
}

// =============================================================================
// STEP 1.2: THE HEADER "CONTAINER"
// =============================================================================

interface HeaderResult {
  currentY: number;
  totalMarks: number;
}

function addHeader(
  pdf: jsPDF,
  settings: any,
  classId: string,
  subject: string,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[],
  logoBase64?: string | null
): HeaderResult {
  // Use custom marks if available
  const mcqMark = settings.customMarks?.mcq || QUESTION_MARKS.mcq;
  const shortMark = settings.customMarks?.short || QUESTION_MARKS.short;
  const longMark = settings.customMarks?.long || QUESTION_MARKS.long;

  // Calculate total marks based on attempts if pattern exists
  const mcqTotal = mcqs.length * mcqMark;
  const shortTotal = shorts.length * shortMark;
  const longTotal = longs.length * longMark;
  const totalMarks = mcqTotal + shortTotal + longTotal;

  // Center point for alignment
  const xCenter = PAGE_WIDTH / 2;
  const style = settings.pdfStyle || 'standard';

  // Start position
  let y = MARGIN_TOP;

  // -------------------------------------------------------------------------
  // Style-specific Header Rendering
  // -------------------------------------------------------------------------
  if (style === 'minimal') {
    // Minimal: Simple, no uppercase institution, smaller subject
    setFont(pdf, FONT_SIZE.institution - 2, "normal");
    pdf.text(settings.instituteName || "Institution Name", MARGIN_LEFT, y + 5);

    setFont(pdf, FONT_SIZE.subject - 1, "bold");
    pdf.text(`${subject} – ${classId}`, PAGE_WIDTH - MARGIN_RIGHT, y + 5, { align: "right" });
    y += 10;
  } else if (style === 'modern') {
    // Modern: Sleek, sans-serif focus (handled by fonts), centered subject
    setFont(pdf, FONT_SIZE.institution + 2, "bold");
    pdf.text(settings.instituteName?.toUpperCase() || "INSTITUTION NAME", xCenter, y + 5, { align: "center" });
    y += 8;

    setFont(pdf, FONT_SIZE.subject, "normal");
    pdf.text(`${subject} – Class ${classId}`, xCenter, y + 3, { align: "center" });
    y += 6;
  } else {
    // Standard / Classic: Heavy-duty exam feel
    setFont(pdf, FONT_SIZE.institution, "bold");
    pdf.text(
      settings.instituteName?.toUpperCase() || "INSTITUTION NAME",
      xCenter,
      y + 5,
      { align: "center" }
    );
    y += 7;

    setFont(pdf, FONT_SIZE.subject, "bold");
    pdf.text(`${subject} – ${classId}`, xCenter, y + 3, { align: "center" });
    y += 6;
  }

  // Lock header boundary - force y to header height if not minimal
  const finalY = style === 'minimal' ? y : MARGIN_TOP + HEADER_HEIGHT;

  return { currentY: finalY, totalMarks };
}

function drawLogo(pdf: jsPDF, settings: any) {
  const logoBase64 = settings.instituteLogo;
  if (!logoBase64) return;

  try {
    const imgFmt = /data:image\/(jpeg|jpg)/i.test(logoBase64) ? 'JPEG' : 'PNG';
    const pos = settings.logoPosition || 'left';

    let logoX = MARGIN_LEFT;
    if (pos === 'center') logoX = (PAGE_WIDTH / 2) - 10;
    else if (pos === 'right') logoX = PAGE_WIDTH - MARGIN_RIGHT - 20;

    const logoY = MARGIN_TOP;
    const logoWidth = 20;
    const logoHeight = 20;

    pdf.addImage(logoBase64, imgFmt, logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.warn('[PDF] Logo render failed — skipping:', error);
  }
}

// =============================================================================
// STEP 1.3: THE META-DATA GRID
// =============================================================================

function addMetaDataGrid(pdf: jsPDF, startY: number, timeAllowed: string, totalMarks: number, date: string): number {
  let y = startY;

  // Calculate three x-coordinates for flex-row
  const xLeft = MARGIN_LEFT;
  const xCenter = PAGE_WIDTH / 2;
  const xRight = PAGE_WIDTH - MARGIN_RIGHT;

  // Draw separator line above
  drawHLine(pdf, y);
  y += 4;

  // Draw "Time" at x_left
  setFont(pdf, FONT_SIZE.meta, "bold");
  pdf.text(`Time: ${timeAllowed}`, xLeft, y, { align: "left" });

  // Draw "Marks" at x_center
  pdf.text(`Total Marks: ${totalMarks}`, xCenter, y, { align: "center" });

  // Draw "Date" at x_right
  pdf.text(`Date: ${date}`, xRight, y, { align: "right" });

  y += 3;

  // Draw separator line below
  drawHLine(pdf, y);
  y += 6;

  // -------------------------------------------------------------------------
  // Student Info Grid (Single Row)
  // -------------------------------------------------------------------------
  const cellWidth = SAFE_WIDTH / 3;
  const cellHeight = 8;
  const labelWidth = 14;

  // Draw 3 cells with internal label dividers
  for (let i = 0; i < 3; i++) {
    const x = MARGIN_LEFT + (i * cellWidth);
    pdf.setLineWidth(LINE_WIDTH);
    pdf.rect(x, y, cellWidth, cellHeight);

    // Label divider line
    pdf.line(x + labelWidth, y, x + labelWidth, y + cellHeight);
  }

  // Labels
  setFont(pdf, FONT_SIZE.label, "bold");
  pdf.text("Name:", MARGIN_LEFT + 2, y + 5);
  pdf.text("Roll No:", MARGIN_LEFT + cellWidth + 2, y + 5);
  pdf.text("Section:", MARGIN_LEFT + (cellWidth * 2) + 2, y + 5);

  // Update cursor with padding
  y += cellHeight + 8;

  return y;
}

// =============================================================================
// STEP 1.4: INTELLIGENT PAGE BREAKING LOGIC
// =============================================================================

function checkSpace(currentY: number, requiredSpace: number): boolean {
  const remainingSpace = PAGE_HEIGHT - MARGIN_BOTTOM - currentY;
  return remainingSpace >= requiredSpace;
}

function checkAndAddPage(pdf: jsPDF, currentY: number, requiredSpace: number): number {
  const remainingSpace = PAGE_HEIGHT - MARGIN_BOTTOM - currentY;

  // Only add a page when the next element genuinely doesn't fit
  if (remainingSpace < requiredSpace) {
    pdf.addPage();
    return MARGIN_TOP;
  }

  return currentY;
}

// =============================================================================
// MCQ SECTION
// =============================================================================

function addMCQSection(pdf: jsPDF, mcqs: MCQQuestion[], startY: number, settings: any): number {
  if (mcqs.length === 0) return startY;

  const editedQuestions = settings.editedQuestions;
  const mcqMark = settings.customMarks?.mcq || QUESTION_MARKS.mcq;
  const style = settings.pdfStyle || 'standard';

  let y = startY;

  // Section Header
  setFont(pdf, FONT_SIZE.section, "bold");
  const sectionTitle = style === 'minimal' ? "SECTION A: MCQs" : "PART I \u2013 OBJECTIVE";
  pdf.text(sectionTitle, MARGIN_LEFT, y);
  y += 5;

  setFont(pdf, FONT_SIZE.label, "italic");
  pdf.text(`Marks: ${mcqs.length} \u00d7 ${mcqMark} = ${mcqs.length * mcqMark} | Time: 15 min`, MARGIN_LEFT, y);
  y += 6;

  const qNoWidth = 10;
  const optWidth = (SAFE_WIDTH - qNoWidth) / 4;
  const optionsRowHeight = 7;

  // MCQ Items - 2 rows per question
  mcqs.forEach((mcq, index) => {
    const qText = editedQuestions?.[mcq.id]?.questionText || mcq.questionText;
    const cleanQ = cleanLatex(qText);
    const opts = editedQuestions?.[mcq.id]?.options || mcq.options || [];

    setFont(pdf, FONT_SIZE.option, "normal");
    const qLines = pdf.splitTextToSize(cleanQ, SAFE_WIDTH - qNoWidth - 4);

    // Dynamic height based on lines
    const lineCount = Math.max(1, qLines.length);
    const questionRowHeight = (lineCount * 5) + 3;

    // Check exact space for 2 rows
    if (!checkSpace(y, questionRowHeight + optionsRowHeight + 2)) {
      pdf.addPage();
      y = MARGIN_TOP;
    }

    // Row 1: Question number + Question text
    pdf.setLineWidth(LINE_WIDTH);

    // Question number cell
    pdf.rect(MARGIN_LEFT, y, qNoWidth, questionRowHeight);
    setFont(pdf, FONT_SIZE.option, "bold");
    pdf.text(String(index + 1), MARGIN_LEFT + qNoWidth / 2, y + (questionRowHeight / 2) + 1.5, { align: "center" });

    // Question text cell
    pdf.rect(MARGIN_LEFT + qNoWidth, y, SAFE_WIDTH - qNoWidth, questionRowHeight);
    setFont(pdf, FONT_SIZE.option, "normal");
    pdf.text(qLines, MARGIN_LEFT + qNoWidth + 2, y + 5.5);

    // Border between Q.No and Question
    pdf.line(MARGIN_LEFT + qNoWidth, y, MARGIN_LEFT + qNoWidth, y + questionRowHeight);

    y += questionRowHeight;

    // Row 2: Options (4 equal columns)
    for (let i = 0; i < 4; i++) {
      const x = MARGIN_LEFT + (i === 0 ? 0 : qNoWidth) + (i * optWidth);
      const width = i === 0 ? qNoWidth + optWidth : optWidth;

      pdf.rect(x, y, width, optionsRowHeight);

      // Option label and text
      const optText = cleanLatex(opts[i] || '');
      const optLabel = ['A', 'B', 'C', 'D'][i];
      setFont(pdf, FONT_SIZE.option - 1, "normal");

      const optLines = pdf.splitTextToSize(`${optLabel}: ${optText}`, width - 3);
      pdf.text(optLines[0], x + 2, y + 4.5);
    }

    y += optionsRowHeight;
  });

  return y + 6;
}

function truncateText(text: string | undefined, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.substring(0, maxLen - 1) + "." : text;
}

// =============================================================================
// SHORT QUESTIONS SECTION
// =============================================================================

function addShortQuestions(pdf: jsPDF, shorts: ShortQuestion[], startY: number, settings: any): number {
  if (shorts.length === 0) return startY;

  const editedQuestions = settings.editedQuestions;
  const shortMark = settings.customMarks?.short || QUESTION_MARKS.short;
  const style = settings.pdfStyle || 'standard';

  let y = startY;
  const attemptCount = Math.min(8, shorts.length);

  // STEP 1.4: Intelligent page break for Subjective Section
  // Check remaining space before starting subjective section
  const requiredSpace = 40; // Minimum space needed for header + at least one question
  y = checkAndAddPage(pdf, y, requiredSpace);

  // If we didn't add a page, draw divider line
  if (y === startY && style !== 'minimal') {
    drawHLine(pdf, y, 0.5);
    y += 5; // Extra padding to visually separate from MCQs
  }

  // Section Header
  setFont(pdf, FONT_SIZE.section, "bold");
  const sectionTitle = style === 'minimal' ? "SECTION B: SHORT QUESTIONS" : "PART II \u2013 SUBJECTIVE";
  pdf.text(sectionTitle, MARGIN_LEFT, y);
  y += 4;

  setFont(pdf, FONT_SIZE.label, "italic");
  pdf.text(`SHORT QUESTIONS: Attempt any ${attemptCount} questions. (${shortMark} marks each)`, MARGIN_LEFT, y);
  y += 6;

  // Questions
  shorts.forEach((shortQ) => {
    const qText = editedQuestions?.[shortQ.id]?.questionText || shortQ.questionText;
    const cleanQ = cleanLatex(qText);

    setFont(pdf, FONT_SIZE.question, "normal");
    const lines = pdf.splitTextToSize(cleanQ, SAFE_WIDTH - 5);
    // Calculate exact height needed for this specific question
    const textHeight = lines.length * 5 + 2;

    // Check exact space needed
    if (!checkSpace(y, textHeight)) {
      pdf.addPage();
      y = MARGIN_TOP;
    }

    pdf.text(lines, MARGIN_LEFT, y);

    // Update cursor exactly
    y += textHeight;
  });

  return y + 4;
}

// =============================================================================
// LONG QUESTIONS SECTION
// =============================================================================

function addLongQuestions(pdf: jsPDF, longs: LongQuestion[], startY: number, settings: any): number {
  if (longs.length === 0) return startY;

  const editedQuestions = settings.editedQuestions;
  const longMark = settings.customMarks?.long || QUESTION_MARKS.long;
  const style = settings.pdfStyle || 'standard';

  let y = startY;
  const attemptCount = Math.min(3, longs.length);

  // Check space before starting
  if (!checkSpace(y, 30)) {
    pdf.addPage();
    y = MARGIN_TOP;
  }

  // Section Header
  setFont(pdf, FONT_SIZE.section, "bold");
  const sectionTitle = style === 'minimal' ? "SECTION C: LONG QUESTIONS" : "LONG QUESTIONS";
  pdf.text(`${sectionTitle}: Attempt any ${attemptCount} questions. (${longMark} marks each)`, MARGIN_LEFT, y);
  y += 7;

  // Questions
  longs.forEach((longQ, index) => {
    const qText = editedQuestions?.[longQ.id]?.questionText || longQ.questionText;
    const cleanQ = cleanLatex(qText);

    setFont(pdf, FONT_SIZE.question, "normal");
    const lines = pdf.splitTextToSize(cleanQ, SAFE_WIDTH - 12);
    // Calculate exact height needed
    const textHeight = lines.length * 5 + 5;

    // Check exact space
    if (!checkSpace(y, textHeight)) {
      pdf.addPage();
      y = MARGIN_TOP;
    }

    setFont(pdf, FONT_SIZE.question, "bold");
    pdf.text(`Q${index + 1}.`, MARGIN_LEFT, y);

    setFont(pdf, FONT_SIZE.question, "normal");
    pdf.text(lines, MARGIN_LEFT + 10, y);

    // Update cursor
    y += textHeight;
  });

  return y;
}

// =============================================================================
// FOOTER
// =============================================================================

function addFooter(pdf: jsPDF, pageNum: number, totalPages: number, settings: any) {
  setFont(pdf, FONT_SIZE.footer, "normal");
  const showWatermark = settings?.showWatermark;
  const customFooter = settings?.customFooter;

  // Watermark logic
  if (showWatermark !== false) {
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "PaperPress App \u2014 paperpressapp@gmail.com",
      MARGIN_LEFT,
      PAGE_HEIGHT - 8,
      { align: "left" }
    );
    pdf.setTextColor(0, 0, 0);
  }

  // Custom Footer
  if (customFooter) {
    pdf.text(
      customFooter,
      PAGE_WIDTH - MARGIN_RIGHT,
      PAGE_HEIGHT - 8,
      { align: "right" }
    );
  }

  pdf.text(
    `Page ${pageNum} of ${totalPages}`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 8,
    { align: "center" }
  );
}

// =============================================================================
// STEP 1.5: PREVENT TEXT OVERLAPPING
// =============================================================================

function validateCursor(y: number): number {
  // Prevent negative coordinates
  if (y < 0) {
    return MARGIN_TOP;
  }
  return y;
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export async function generatePaperPDF(paperData: PaperData): Promise<Blob> {
  const { classId, subject, settings, mcqs, shorts, longs, editedQuestions, questionOrder } = paperData;

  const pdf = createPDF();

  // Initialize vertical cursor
  let currentY = MARGIN_TOP;

  // STEP 1.2: Header Container
  const headerResult = addHeader(pdf, settings, classId, subject, mcqs, shorts, longs, settings.instituteLogo);
  currentY = headerResult.currentY;
  const totalMarks = headerResult.totalMarks;

  // Sorting based on questionOrder
  const sortedMcqs = questionOrder?.mcqs
    ? [...mcqs].sort((a, b) => {
      const idxA = questionOrder.mcqs.indexOf(a.id);
      const idxB = questionOrder.mcqs.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    })
    : mcqs;

  const sortedShorts = questionOrder?.shorts
    ? [...shorts].sort((a, b) => {
      const idxA = questionOrder.shorts.indexOf(a.id);
      const idxB = questionOrder.shorts.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    })
    : shorts;

  const sortedLongs = questionOrder?.longs
    ? [...longs].sort((a, b) => {
      const idxA = questionOrder.longs.indexOf(a.id);
      const idxB = questionOrder.longs.indexOf(b.id);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    })
    : longs;

  // Draw logo LAST (z-index on top)
  drawLogo(pdf, settings);

  // Validate cursor
  currentY = validateCursor(currentY);

  // STEP 1.3: Meta-Data Grid
  currentY = addMetaDataGrid(pdf, currentY, settings.timeAllowed, totalMarks, settings.date);
  currentY = validateCursor(currentY);

  // MCQ Section
  if (sortedMcqs.length > 0) {
    currentY = addMCQSection(pdf, sortedMcqs, currentY, settings);
    currentY = validateCursor(currentY);
  }

  // Short Questions Section
  if (sortedShorts.length > 0) {
    currentY = addShortQuestions(pdf, sortedShorts, currentY, settings);
    currentY = validateCursor(currentY);
  }

  // Long Questions Section
  if (sortedLongs.length > 0) {
    currentY = addLongQuestions(pdf, sortedLongs, currentY, settings);
    currentY = validateCursor(currentY);
  }

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(pdf, i, totalPages, settings);
  }

  return pdf.output("blob");
}

export function generateFilename(classId: string, subject: string, date: string): string {
  const formattedDate = date.replace(/-/g, "");
  const formattedSubject = subject.replace(/\s+/g, "_");
  return `${classId}_${formattedSubject}_${formattedDate}.pdf`;
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
