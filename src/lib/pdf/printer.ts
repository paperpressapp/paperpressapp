import { Capacitor } from '@capacitor/core';
import PDFPrinter from '@/lib/plugins/PDFPrinter';
import { generatePaperHTML, generatePDFFilename, type PDFSettings } from './htmlGenerator';
import { jsPDF } from 'jspdf';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

export interface PaperData {
  classId: string;
  subject: string;
  settings: PDFSettings;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
}

export interface PrintResult {
  success: boolean;
  method: 'native' | 'jspdf' | 'web';
  filename?: string;
  blob?: Blob;
  error?: string;
}

const isNative = () => Capacitor.isNativePlatform();

export async function printPaper(paperData: PaperData): Promise<PrintResult> {
  const filename = generatePDFFilename(
    paperData.classId,
    paperData.subject,
    paperData.settings.date
  );

  if (isNative()) {
    return printNative(paperData, filename);
  } else {
    return printWeb(paperData, filename);
  }
}

async function printNative(paperData: PaperData, filename: string): Promise<PrintResult> {
  try {
    const html = generatePaperHTML(
      paperData.settings,
      paperData.mcqs,
      paperData.shorts,
      paperData.longs
    );

    const result = await PDFPrinter.printToPDF({
      html,
      filename,
    });

    return {
      success: result.success,
      method: 'native',
      filename: result.jobName || filename,
    };
  } catch (error) {
    console.error('[PDFPrinter] Native print failed, falling back to jsPDF:', error);
    return printWeb(paperData, filename);
  }
}

async function printWeb(paperData: PaperData, filename: string): Promise<PrintResult> {
  try {
    const blob = await generatePDFBlob(paperData);

    if (typeof window !== 'undefined' && typeof window.navigator?.share === 'function') {
      const file = new File([blob], filename, { type: 'application/pdf' });
      try {
        await navigator.share({
          files: [file],
          title: `${paperData.subject} - ${paperData.classId} Paper`,
        });
        return { success: true, method: 'web', filename, blob };
      } catch {
        downloadPDF(blob, filename);
        return { success: true, method: 'jspdf', filename, blob };
      }
    } else {
      downloadPDF(blob, filename);
      return { success: true, method: 'jspdf', filename, blob };
    }
  } catch (error) {
    return {
      success: false,
      method: 'jspdf',
      error: error instanceof Error ? error.message : 'PDF generation failed',
    };
  }
}

async function generatePDFBlob(paperData: PaperData): Promise<Blob> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const { classId, subject, settings, mcqs, shorts, longs } = paperData;

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN = { top: 15, bottom: 15, left: 20, right: 15 };

  pdf.setFont('helvetica');
  pdf.setTextColor(0, 0, 0);

  let y = MARGIN.top + 5;

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(settings.instituteName?.toUpperCase() || 'INSTITUTION NAME', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  pdf.setFontSize(13);
  pdf.text(`${subject.toUpperCase()} - ${classId} CLASS`, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  pdf.setLineWidth(0.5);
  pdf.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
  y += 8;

  const totalMarks = mcqs.length + (shorts.length * 2) + (longs.length * 9);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Time Allowed: ${settings.timeAllowed}`, MARGIN.left, y);
  pdf.text(`Total Marks: ${totalMarks}`, PAGE_WIDTH - MARGIN.right - 40, y);
  y += 6;
  pdf.text(`Date: ${settings.date}`, MARGIN.left, y);
  y += 10;

  pdf.setLineWidth(0.3);
  pdf.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
  y += 8;

  if (mcqs.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`SECTION A: OBJECTIVE TYPE QUESTIONS (${mcqs.length} Marks)`, MARGIN.left, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    mcqs.forEach((mcq, index) => {
      if (y > PAGE_HEIGHT - MARGIN.bottom - 20) {
        pdf.addPage();
        y = MARGIN.top + 5;
      }

      const questionText = `${index + 1}. ${mcq.questionText}`;
      const optionsText = mcq.options?.slice(0, 4).map((opt, idx) =>
        `${String.fromCharCode(65 + idx)}. ${opt}`
      ).join('    ') || '';

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}.`, MARGIN.left, y);
      pdf.setFont('helvetica', 'normal');

      const lines = pdf.splitTextToSize(mcq.questionText, PAGE_WIDTH - MARGIN.left - MARGIN.right - 10);
      pdf.text(lines, MARGIN.left + 8, y);
      y += lines.length * 4 + 2;

      const optLines = pdf.splitTextToSize(optionsText, PAGE_WIDTH - MARGIN.left - MARGIN.right - 10);
      pdf.text(optLines, MARGIN.left + 8, y);
      y += optLines.length * 4 + 4;
    });

    y += 10;
  }

  if (shorts.length > 0) {
    if (y > PAGE_HEIGHT - MARGIN.bottom - 40) {
      pdf.addPage();
      y = MARGIN.top + 5;
    }

    const attemptCount = Math.min(8, shorts.length);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`SECTION B: SHORT ANSWER QUESTIONS (${attemptCount * 2} Marks)`, MARGIN.left, y);
    y += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Attempt any ${attemptCount} questions. Each question carries 2 marks.`, MARGIN.left, y);
    y += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    shorts.forEach((short, index) => {
      if (y > PAGE_HEIGHT - MARGIN.bottom - 15) {
        pdf.addPage();
        y = MARGIN.top + 5;
      }

      const romanNum = toRoman(index + 1);
      const questionText = `(${romanNum}) ${short.questionText}`;
      const lines = pdf.splitTextToSize(questionText, PAGE_WIDTH - MARGIN.left - MARGIN.right - 10);
      pdf.text(lines, MARGIN.left, y);
      y += lines.length * 4.5 + 4;
    });

    y += 10;
  }

  if (longs.length > 0) {
    if (y > PAGE_HEIGHT - MARGIN.bottom - 40) {
      pdf.addPage();
      y = MARGIN.top + 5;
    }

    const attemptCount = Math.min(4, longs.length);
    const questionOffset = mcqs.length + shorts.length;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`SECTION C: LONG ANSWER QUESTIONS (${attemptCount * 9} Marks)`, MARGIN.left, y);
    y += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Attempt any ${attemptCount} questions. Each question carries 9 marks.`, MARGIN.left, y);
    y += 10;

    pdf.setFontSize(10);

    longs.forEach((long, index) => {
      const qNum = questionOffset + index + 1;

      if (y > PAGE_HEIGHT - MARGIN.bottom - 25) {
        pdf.addPage();
        y = MARGIN.top + 5;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Q${qNum}.`, MARGIN.left, y);
      pdf.setFont('helvetica', 'normal');

      const lines = pdf.splitTextToSize(long.questionText, PAGE_WIDTH - MARGIN.left - MARGIN.right - 15);
      pdf.text(lines, MARGIN.left + 12, y);
      y += lines.length * 4.5 + 10;
    });
  }

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
  }

  return pdf.output('blob');
}

function toRoman(num: number): string {
  const map: [string, number][] = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let str = '';
  for (const [letter, value] of map) {
    while (num >= value) {
      str += letter;
      num -= value;
    }
  }
  return str.toLowerCase();
}

function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { generatePaperHTML, generatePDFFilename };
export type { PDFSettings };
