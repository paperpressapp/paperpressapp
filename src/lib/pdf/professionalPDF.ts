/**
 * Professional PDF Generator using jsPDF
 * High-quality exam paper generation optimized for Android
 * 
 * Features:
 * - Professional typography with Times New Roman
 * - Proper margins and spacing
 * - Clean question formatting
 * - Student info section
 * - Automatic page breaks
 */

import { jsPDF } from 'jspdf';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { QUESTION_MARKS } from '@/types/question';

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

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

export async function generateProfessionalPDF(
  settings: PDFSettings,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  let y = MARGIN;
  const totalMarks = 
    mcqs.length * QUESTION_MARKS.mcq + 
    shorts.length * QUESTION_MARKS.short + 
    longs.length * QUESTION_MARKS.long;

  // ─────────────────────────────────────────────
  // HEADER SECTION
  // ─────────────────────────────────────────────
  
  // Institute Name
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  const instituteName = settings.instituteName.toUpperCase();
  doc.text(instituteName, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  // Custom Header (if provided)
  if (settings.customHeader) {
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(settings.customHeader, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 5;
  }

  // Subject and Class
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  const subjectLine = `${settings.subject.toUpperCase()} — CLASS ${settings.classId.toUpperCase()}`;
  doc.text(subjectLine, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 6;

  // Exam Type
  if (settings.customSubHeader || settings.examType) {
    doc.setFontSize(11);
    doc.setFont('times', 'italic');
    doc.text(settings.customSubHeader || settings.examType, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 6;
  }

  // Time, Marks, Date line
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  const infoLine = `Time Allowed: ${settings.timeAllowed}     Total Marks: ${totalMarks}     Date: ${settings.date}`;
  doc.text(infoLine, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 4;

  // Header separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // ─────────────────────────────────────────────
  // STUDENT INFO SECTION
  // ─────────────────────────────────────────────
  
  const rowHeight = 8;
  doc.setLineWidth(0.2);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');

  // Row 1: Name and Roll No
  doc.rect(MARGIN, y, 12, rowHeight);
  doc.text('Name:', MARGIN + 2, y + 5.5);
  doc.rect(MARGIN + 12, y, 70, rowHeight);
  doc.rect(MARGIN + 82, y, 15, rowHeight);
  doc.text('Roll No:', MARGIN + 84, y + 5.5);
  doc.rect(MARGIN + 97, y, 30, rowHeight);
  
  // Section
  doc.rect(MARGIN + 127, y, 15, rowHeight);
  doc.text('Section:', MARGIN + 128.5, y + 5.5);
  doc.rect(MARGIN + 142, y, CONTENT_WIDTH - 142 + MARGIN, rowHeight);
  y += rowHeight + 6;

  // ─────────────────────────────────────────────
  // MCQ SECTION
  // ─────────────────────────────────────────────
  
  if (mcqs.length > 0) {
    y = checkPageBreak(doc, y, 40);
    
    // Section Header
    doc.setFillColor(230, 240, 250);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('SECTION A: MULTIPLE CHOICE QUESTIONS', PAGE_WIDTH / 2, y + 5.5, { align: 'center' });
    y += 8;

    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.text(`(${mcqs.length} × ${QUESTION_MARKS.mcq} = ${mcqs.length * QUESTION_MARKS.mcq} Marks)`, PAGE_WIDTH / 2, y + 3, { align: 'center' });
    y += 6;

    // MCQ Table
    const cols = [8, 85, 22, 22, 22, 22];
    const cellHeight = 9;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    let x = MARGIN;
    
    ['Q.', 'Question', 'A', 'B', 'C', 'D'].forEach((header, i) => {
      doc.rect(x, y, cols[i], cellHeight, 'FD');
      doc.text(header, x + cols[i] / 2, y + 6, { align: 'center' });
      x += cols[i];
    });
    y += cellHeight;

    // MCQ Rows
    doc.setFont('times', 'normal');
    doc.setFontSize(8);

    mcqs.forEach((mcq, idx) => {
      y = checkPageBreak(doc, y, cellHeight + 5);
      x = MARGIN;
      const opts = mcq.options || [];

      // Question number
      doc.rect(x, y, cols[0], cellHeight);
      doc.text(String(idx + 1), x + cols[0] / 2, y + 6, { align: 'center' });
      x += cols[0];

      // Question text
      doc.rect(x, y, cols[1], cellHeight);
      const qText = cleanLatex(mcq.questionText);
      const truncatedQ = qText.length > 50 ? qText.substring(0, 47) + '...' : qText;
      doc.text(truncatedQ, x + 2, y + 6);
      x += cols[1];

      // Options
      for (let i = 0; i < 4; i++) {
        doc.rect(x, y, cols[2 + i], cellHeight);
        const opt = cleanLatex(opts[i] || '');
        const truncatedOpt = opt.length > 10 ? opt.substring(0, 7) + '...' : opt;
        doc.text(truncatedOpt, x + cols[2 + i] / 2, y + 6, { align: 'center' });
        x += cols[2 + i];
      }
      y += cellHeight;
    });
    y += 8;
  }

  // ─────────────────────────────────────────────
  // SUBJECTIVE SECTION
  // ─────────────────────────────────────────────
  
  if (shorts.length > 0 || longs.length > 0) {
    y = checkPageBreak(doc, y, 30);
    
    // Section Header
    doc.setFillColor(230, 250, 240);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('SECTION B: SUBJECTIVE', PAGE_WIDTH / 2, y + 5.5, { align: 'center' });
    y += 12;

    // Short Questions
    if (shorts.length > 0) {
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(`Q.1 Short Questions (${shorts.length} × ${QUESTION_MARKS.short} = ${shorts.length * QUESTION_MARKS.short} Marks)`, MARGIN, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont('times', 'normal');

      shorts.forEach((sq, idx) => {
        y = checkPageBreak(doc, y, 12);
        
        const qText = cleanLatex(sq.questionText);
        const lines = doc.splitTextToSize(`${idx + 1}. ${qText}`, CONTENT_WIDTH - 10);
        
        doc.text(lines, MARGIN, y);
        doc.setFontSize(8);
        doc.text(`[${QUESTION_MARKS.short}]`, PAGE_WIDTH - MARGIN - 5, y);
        doc.setFontSize(10);
        y += lines.length * 5 + 3;
      });
      y += 5;
    }

    // Long Questions
    if (longs.length > 0) {
      y = checkPageBreak(doc, y, 25);
      
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(`Q.2 Long Questions (${longs.length} × ${QUESTION_MARKS.long} = ${longs.length * QUESTION_MARKS.long} Marks)`, MARGIN, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont('times', 'normal');

      longs.forEach((lq, idx) => {
        y = checkPageBreak(doc, y, 15);
        
        const qText = cleanLatex(lq.questionText);
        const lines = doc.splitTextToSize(`${idx + 1}. ${qText}`, CONTENT_WIDTH - 10);
        
        doc.text(lines, MARGIN, y);
        doc.setFontSize(8);
        doc.text(`[${QUESTION_MARKS.long}]`, PAGE_WIDTH - MARGIN - 5, y);
        doc.setFontSize(10);
        y += lines.length * 5 + 8;
      });
    }
  }

  // ─────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────
  
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    
    // Footer line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_HEIGHT - 12, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Generated by PaperPress — Professional Exam Paper Generator',
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 7,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  // Return base64 without data URI prefix
  const dataUri = doc.output('datauristring');
  return dataUri.split(',')[1];
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function checkPageBreak(doc: jsPDF, y: number, neededHeight: number): number {
  const maxY = PAGE_HEIGHT - MARGIN - 15;
  if (y + neededHeight > maxY) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function cleanLatex(text: string): string {
  if (!text) return '';
  return text
    // Remove math delimiters
    .replace(/\$\$?([^$]+)\$\$?/g, '$1')
    .replace(/\\\(([^)]+)\\\)/g, '$1')
    .replace(/\\\[([^[\]]+)\\\]/g, '$1')
    // Convert common LaTeX commands
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt(\w)/g, '√$1')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
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
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\int/g, '∫')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\omega/g, 'ω')
    // Handle superscripts and subscripts
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^n/g, 'ⁿ')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_4/g, '₄')
    .replace(/_n/g, 'ₙ')
    // Remove remaining LaTeX commands
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateFilename(settings: PDFSettings): string {
  const date = settings.date.replace(/-/g, '');
  const subj = settings.subject.replace(/\s+/g, '_');
  return `${settings.classId}_${subj}_${date}.pdf`;
}
