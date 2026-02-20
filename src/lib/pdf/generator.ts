import { jsPDF } from "jspdf";
import type { PaperData, MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

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
    .replace(/\\div/g, '÷')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\pi/g, 'π')
    .replace(/\\infty/g, '∞')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_4/g, '₄')
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
  // Calculate total marks
  const mcqMarks = mcqs.length;
  const shortMarks = Math.min(8, shorts.length) * 2;
  const longMarks = Math.min(3, longs.length) * 5;
  const totalMarks = mcqMarks + shortMarks + longMarks;

  // Center point for alignment
  const xCenter = PAGE_WIDTH / 2;

  // Start position
  let y = MARGIN_TOP;

  // -------------------------------------------------------------------------
  // STEP 1: Draw Institute Name (Centered)
  // -------------------------------------------------------------------------
  setFont(pdf, FONT_SIZE.institution, "bold");
  pdf.text(
    settings.instituteName?.toUpperCase() || "INSTITUTION NAME",
    xCenter,
    y + 5,
    { align: "center" }
  );
  y += 7;

  // -------------------------------------------------------------------------
  // STEP 2: Draw Subject – Class (Centered)
  // -------------------------------------------------------------------------
  setFont(pdf, FONT_SIZE.subject, "bold");
  pdf.text(`${subject} – ${classId}`, xCenter, y + 3, { align: "center" });
  y += 6;

  // -------------------------------------------------------------------------
  // STEP 3: Draw Logo (Absolute Positioning - drawn LAST for z-index)
  // -------------------------------------------------------------------------
  // Logo drawn at end to ensure it's on top

  // Lock header boundary - force y to header height
  y = MARGIN_TOP + HEADER_HEIGHT;

  return { currentY: y, totalMarks };
}

function drawLogo(pdf: jsPDF, logoBase64: string | null | undefined) {
  if (!logoBase64) return;

  try {
    // Absolute positioning for logo
    const logoX = MARGIN_LEFT;
    const logoY = MARGIN_TOP;
    const logoWidth = 20;
    const logoHeight = 20;

    pdf.addImage(
      logoBase64,
      'PNG',
      logoX,
      logoY,
      logoWidth,
      logoHeight
    );
  } catch (error) {
    console.warn('Failed to draw logo:', error);
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
  const pageHeight = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  const remainingSpace = PAGE_HEIGHT - MARGIN_BOTTOM - currentY;

  // "50% Rule": If remaining space < 50% of page height
  if (remainingSpace < pageHeight * 0.5 || !checkSpace(currentY, requiredSpace)) {
    pdf.addPage();
    return MARGIN_TOP;
  }

  return currentY;
}

// =============================================================================
// MCQ SECTION
// =============================================================================

function addMCQSection(pdf: jsPDF, mcqs: MCQQuestion[], startY: number): number {
  if (mcqs.length === 0) return startY;

  let y = startY;

  // Section Header
  setFont(pdf, FONT_SIZE.section, "bold");
  pdf.text("PART I – OBJECTIVE", MARGIN_LEFT, y);
  y += 5;

  setFont(pdf, FONT_SIZE.label, "italic");
  pdf.text(`Marks: ${mcqs.length} | Time: 15 min | Choose correct answer.`, MARGIN_LEFT, y);
  y += 6;

  // MCQ Table
  const colWidths = {
    qno: 10,
    question: SAFE_WIDTH - 10 - (14 * 4),
    opt: 14
  };
  const rowHeight = 7;

  // Table Header
  pdf.setFillColor(245, 245, 245);
  pdf.setLineWidth(LINE_WIDTH);
  pdf.rect(MARGIN_LEFT, y, SAFE_WIDTH, rowHeight, "FD");

  setFont(pdf, FONT_SIZE.option, "bold");
  pdf.text("Q.No", MARGIN_LEFT + colWidths.qno / 2, y + 4.5, { align: "center" });
  pdf.text("Question", MARGIN_LEFT + colWidths.qno + colWidths.question / 2, y + 4.5, { align: "center" });
  pdf.text("A", MARGIN_LEFT + colWidths.qno + colWidths.question + colWidths.opt * 0.5, y + 4.5, { align: "center" });
  pdf.text("B", MARGIN_LEFT + colWidths.qno + colWidths.question + colWidths.opt * 1.5, y + 4.5, { align: "center" });
  pdf.text("C", MARGIN_LEFT + colWidths.qno + colWidths.question + colWidths.opt * 2.5, y + 4.5, { align: "center" });
  pdf.text("D", MARGIN_LEFT + colWidths.qno + colWidths.question + colWidths.opt * 3.5, y + 4.5, { align: "center" });

  // Header vertical lines
  pdf.line(MARGIN_LEFT + colWidths.qno, y, MARGIN_LEFT + colWidths.qno, y + rowHeight);
  pdf.line(MARGIN_LEFT + colWidths.qno + colWidths.question, y, MARGIN_LEFT + colWidths.qno + colWidths.question, y + rowHeight);
  for (let i = 1; i <= 4; i++) {
    const x = MARGIN_LEFT + colWidths.qno + colWidths.question + (i * colWidths.opt);
    pdf.line(x, y, x, y + rowHeight);
  }

  y += rowHeight;

  // Table Rows
  mcqs.forEach((mcq, index) => {
    // Check space for new row
    if (!checkSpace(y, rowHeight + 5)) {
      pdf.addPage();
      y = MARGIN_TOP;
    }

    const rowStartY = y;
    const cleanQ = cleanLatex(mcq.questionText);

    // Row border
    pdf.setLineWidth(LINE_WIDTH);
    pdf.rect(MARGIN_LEFT, y, SAFE_WIDTH, rowHeight, "S");

    // Q.No
    setFont(pdf, FONT_SIZE.option, "bold");
    pdf.text(`${index + 1}`, MARGIN_LEFT + colWidths.qno / 2, y + 4.5, { align: "center" });

    // Question (truncated to fit)
    setFont(pdf, FONT_SIZE.option, "normal");
    const qText = cleanQ.length > 70
      ? cleanQ.substring(0, 67) + "..."
      : cleanQ;
    pdf.text(qText, MARGIN_LEFT + colWidths.qno + 2, y + 4.5);

    // Options
    const opts = mcq.options || [];
    const optX = MARGIN_LEFT + colWidths.qno + colWidths.question;
    setFont(pdf, FONT_SIZE.option - 1, "normal");

    pdf.text(truncateText(cleanLatex(opts[0]), 7), optX + colWidths.opt * 0.5, y + 4.5, { align: "center" });
    pdf.text(truncateText(cleanLatex(opts[1]), 7), optX + colWidths.opt * 1.5, y + 4.5, { align: "center" });
    pdf.text(truncateText(cleanLatex(opts[2]), 7), optX + colWidths.opt * 2.5, y + 4.5, { align: "center" });
    pdf.text(truncateText(cleanLatex(opts[3]), 7), optX + colWidths.opt * 3.5, y + 4.5, { align: "center" });

    // Vertical lines
    pdf.line(MARGIN_LEFT + colWidths.qno, rowStartY, MARGIN_LEFT + colWidths.qno, rowStartY + rowHeight);
    pdf.line(MARGIN_LEFT + colWidths.qno + colWidths.question, rowStartY, MARGIN_LEFT + colWidths.qno + colWidths.question, rowStartY + rowHeight);
    for (let i = 1; i <= 4; i++) {
      const x = MARGIN_LEFT + colWidths.qno + colWidths.question + (i * colWidths.opt);
      pdf.line(x, rowStartY, x, rowStartY + rowHeight);
    }

    // Update cursor with line height
    y += rowHeight;
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

function addShortQuestions(pdf: jsPDF, shorts: ShortQuestion[], startY: number): number {
  if (shorts.length === 0) return startY;

  let y = startY;
  const attemptCount = Math.min(8, shorts.length);

  // STEP 1.4: Intelligent page break for Subjective Section
  // Check remaining space before starting subjective section
  const requiredSpace = 40; // Minimum space needed for header + at least one question
  y = checkAndAddPage(pdf, y, requiredSpace);

  // If we didn't add a page, draw divider line
  if (y === startY) {
    drawHLine(pdf, y, 0.5);
    y += 5; // Extra padding to visually separate from MCQs
  }

  // Section Header
  setFont(pdf, FONT_SIZE.section, "bold");
  pdf.text("PART II – SUBJECTIVE", MARGIN_LEFT, y);
  y += 4;

  setFont(pdf, FONT_SIZE.label, "italic");
  pdf.text(`SHORT QUESTIONS: Attempt any ${attemptCount} questions. (2 marks each)`, MARGIN_LEFT, y);
  y += 6;

  // Questions
  shorts.forEach((shortQ) => {
    // Check space
    if (!checkSpace(y, 8)) {
      pdf.addPage();
      y = MARGIN_TOP;
    }

    const cleanQ = cleanLatex(shortQ.questionText);

    setFont(pdf, FONT_SIZE.question, "normal");
    const lines = pdf.splitTextToSize(cleanQ, SAFE_WIDTH - 5);
    pdf.text(lines, MARGIN_LEFT, y);

    // Update cursor: add line_height for each line
    y += lines.length * 4 + 2;
  });

  return y + 4;
}

// =============================================================================
// LONG QUESTIONS SECTION
// =============================================================================

function addLongQuestions(pdf: jsPDF, longs: LongQuestion[], startY: number): number {
  if (longs.length === 0) return startY;

  let y = startY;
  const attemptCount = Math.min(3, longs.length);

  // Check space before starting
  if (!checkSpace(y, 30)) {
    pdf.addPage();
    y = MARGIN_TOP;
  }

  // Section Header
  setFont(pdf, FONT_SIZE.section, "bold");
  pdf.text(`LONG QUESTIONS: Attempt any ${attemptCount} questions. (5 marks each)`, MARGIN_LEFT, y);
  y += 7;

  // Questions
  longs.forEach((longQ, index) => {
    // Check space
    if (!checkSpace(y, 12)) {
      pdf.addPage();
      y = MARGIN_TOP;
    }

    const cleanQ = cleanLatex(longQ.questionText);

    setFont(pdf, FONT_SIZE.question, "bold");
    pdf.text(`Q${index + 1}.`, MARGIN_LEFT, y);

    setFont(pdf, FONT_SIZE.question, "normal");
    const lines = pdf.splitTextToSize(cleanQ, SAFE_WIDTH - 12);
    pdf.text(lines, MARGIN_LEFT + 10, y);

    // Update cursor
    y += lines.length * 4 + 5;
  });

  return y;
}

// =============================================================================
// FOOTER
// =============================================================================

function addFooter(pdf: jsPDF, pageNum: number, totalPages: number) {
  setFont(pdf, FONT_SIZE.footer, "normal");
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
  const { classId, subject, settings, mcqs, shorts, longs } = paperData;

  const pdf = createPDF();

  // Initialize vertical cursor
  let currentY = MARGIN_TOP;

  // STEP 1.2: Header Container
  const headerResult = addHeader(pdf, settings, classId, subject, mcqs, shorts, longs, settings.instituteLogo);
  currentY = headerResult.currentY;
  const totalMarks = headerResult.totalMarks;

  // Draw logo LAST (z-index on top)
  drawLogo(pdf, settings.instituteLogo);

  // Validate cursor
  currentY = validateCursor(currentY);

  // STEP 1.3: Meta-Data Grid
  currentY = addMetaDataGrid(pdf, currentY, settings.timeAllowed, totalMarks, settings.date);
  currentY = validateCursor(currentY);

  // MCQ Section
  if (mcqs.length > 0) {
    currentY = addMCQSection(pdf, mcqs, currentY);
    currentY = validateCursor(currentY);
  }

  // Short Questions Section
  if (shorts.length > 0) {
    currentY = addShortQuestions(pdf, shorts, currentY);
    currentY = validateCursor(currentY);
  }

  // Long Questions Section
  if (longs.length > 0) {
    currentY = addLongQuestions(pdf, longs, currentY);
    currentY = validateCursor(currentY);
  }

  // Add footers to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(pdf, i, totalPages);
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
