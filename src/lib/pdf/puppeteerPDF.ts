/**
 * PDF Generation Service
 * - Primary: Puppeteer with Chrome (perfect KaTeX rendering)
 * - Fallback: jsPDF (basic rendering, always works)
 */

import type { PaperData } from './htmlTemplate';
import { generateHTMLTemplate } from './htmlTemplate';
import { jsPDF } from 'jspdf';
import { QUESTION_MARKS } from '@/types/question';

export interface PDFOptions {
  format?: 'A4';
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  printBackground?: boolean;
}

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function isProduction(): boolean {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function generatePDFWithPuppeteer(paperData: PaperData): Promise<Buffer> {
  const puppeteer = await import('puppeteer-core');

  let executablePath: string;
  let args: string[];

  if (isProduction()) {
    const chromium = await import('@sparticuz/chromium');
    const chromiumModule = chromium.default || chromium;
    executablePath = await chromiumModule.executablePath();
    args = chromiumModule.args;
  } else {
    executablePath = CHROME_PATH;
    args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];
  }

  console.log('[PDF] Launching Chrome...');

  const browser = await puppeteer.launch({
    args,
    executablePath,
    headless: true,
  });

  try {
    const html = generateHTMLTemplate(paperData);
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('[PDF] Waiting for KaTeX...');

    await page.waitForFunction(() => {
      return (window as any).__katexRendered === true ||
        document.querySelectorAll('[data-katex]').length === 0;
    }, { timeout: 20000 }).catch(() => console.warn('[PDF] KaTeX timeout'));

    await new Promise(r => setTimeout(r, 500));

    console.log('[PDF] Generating PDF...');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      printBackground: true,
    });

    console.log('[PDF] Buffer size:', pdfBuffer.length);

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

function generatePDFWithJsPDF(paperData: PaperData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPos = margin;

  doc.setFont('times', 'normal');
  doc.setFontSize(16);

  const title = paperData.instituteName.toUpperCase();
  doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, yPos + 7);
  yPos += 10;

  doc.setFontSize(12);
  const subjectLine = `${paperData.subject.toUpperCase()} - CLASS ${paperData.classId.toUpperCase()}`;
  doc.text(subjectLine, (pageWidth - doc.getTextWidth(subjectLine)) / 2, yPos + 4);
  yPos += 7;

  const totalMarks = paperData.mcqs.length * QUESTION_MARKS.mcq + paperData.shorts.length * QUESTION_MARKS.short + paperData.longs.length * QUESTION_MARKS.long;
  doc.setFontSize(9);
  doc.text(`Time: ${paperData.timeAllowed}    Marks: ${totalMarks}    Date: ${paperData.date}`, pageWidth / 2, yPos + 3, { align: 'center' });
  yPos += 5;

  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Info table
  doc.setFontSize(9);
  doc.setLineWidth(0.1);
  const rowH = 7;
  doc.rect(margin, yPos, 15, rowH);
  doc.rect(margin + 15, yPos, 40, rowH);
  doc.rect(margin + 55, yPos, 15, rowH);
  doc.rect(margin + 70, yPos, 40, rowH);
  doc.rect(margin + 110, yPos, 15, rowH);
  doc.rect(margin + 125, yPos, 55, rowH);
  doc.setFont('times', 'bold');
  doc.text('Name:', margin + 2, yPos + 5);
  doc.text('Roll No:', margin + 57, yPos + 5);
  doc.text('Section:', margin + 112, yPos + 5);
  yPos += rowH + 6;

  // MCQs
  if (paperData.mcqs.length > 0) {
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('SECTION A: OBJECTIVE / MCQs', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.setFontSize(8);
    doc.setFont('times', 'italic');
    doc.text(`(${paperData.mcqs.length} × ${QUESTION_MARKS.mcq} = ${paperData.mcqs.length * QUESTION_MARKS.mcq} Marks)`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    const cols = [10, 55, 25, 25, 25, 25];
    const h = 7;

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, cols.reduce((a, b) => a + b, 0), h, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(7);

    let x = margin;
    ['Q.No', 'Question', 'A', 'B', 'C', 'D'].forEach((header, i) => {
      doc.rect(x, yPos, cols[i], h);
      doc.text(header, x + cols[i] / 2, yPos + 5, { align: 'center' });
      x += cols[i];
    });
    yPos += h;

    doc.setFont('times', 'normal');
    doc.setFontSize(7);

    paperData.mcqs.forEach((mcq, idx) => {
      if (yPos > 270) { doc.addPage(); yPos = margin; }
      x = margin;
      const opts = mcq.options || [];

      doc.rect(x, yPos, cols[0], h);
      doc.text(String(idx + 1), x + cols[0] / 2, yPos + 5, { align: 'center' });
      x += cols[0];

      doc.rect(x, yPos, cols[1], h);
      doc.text(cleanLatex(mcq.questionText).substring(0, 40), x + 2, yPos + 5);
      x += cols[1];

      for (let i = 0; i < 4; i++) {
        doc.rect(x, yPos, cols[2 + i], h);
        doc.text(cleanLatex(opts[i] || '').substring(0, 12), x + cols[2 + i] / 2, yPos + 5, { align: 'center' });
        x += cols[2 + i];
      }
      yPos += h;
    });
    yPos += 4;
  }

  // Subjective
  if (paperData.shorts.length > 0 || paperData.longs.length > 0) {
    if (yPos > 200) { doc.addPage(); yPos = margin; }
    yPos += 3;
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('SUBJECTIVE PART', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  if (paperData.shorts.length > 0) {
    doc.setFontSize(10);
    doc.text(`Q1: SHORT QUESTIONS (${paperData.shorts.length} = ${paperData.shorts.length * QUESTION_MARKS.short} Marks)`, margin, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('times', 'normal');

    paperData.shorts.forEach((sq, idx) => {
      if (yPos > 270) { doc.addPage(); yPos = margin; }
      doc.text(`${idx + 1}. ${cleanLatex(sq.questionText).substring(0, 75)}`, margin, yPos);
      doc.setFontSize(7);
      doc.text(`[${QUESTION_MARKS.short}]`, pageWidth - margin - 5, yPos);
      doc.setFontSize(9);
      yPos += 5;
    });
  }

  if (paperData.longs.length > 0) {
    yPos += 4;
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text(`Q2: LONG QUESTIONS (${paperData.longs.length} = ${paperData.longs.length * QUESTION_MARKS.long} Marks)`, margin, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('times', 'normal');

    paperData.longs.forEach((lq, idx) => {
      if (yPos > 270) { doc.addPage(); yPos = margin; }
      doc.text(`Q${idx + 1}. ${cleanLatex(lq.questionText).substring(0, 70)}`, margin, yPos);
      doc.setFontSize(7);
      doc.text(`[${QUESTION_MARKS.long}]`, pageWidth - margin - 5, yPos);
      doc.setFontSize(9);
      yPos += 6;
    });
  }

  // Watermark
  doc.setFontSize(8);
  doc.text('PaperPress App by Hamza Khan - Phone: 03007172656.', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
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

export async function generatePDF(paperData: PaperData): Promise<Buffer> {
  try {
    console.log('[PDF] Trying Puppeteer...');
    return await generatePDFWithPuppeteer(paperData);
  } catch (err) {
    console.error('[PDF] Puppeteer failed:', err);
    console.log('[PDF] Using jsPDF fallback');
    return generatePDFWithJsPDF(paperData);
  }
}

export async function generatePDFWithRetry(paperData: PaperData, maxRetries = 2): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await generatePDF(paperData);
    } catch (err) {
      lastError = err as Error;
      console.error(`[PDF] Attempt ${i} failed:`, err);
      if (i < maxRetries) await new Promise(r => setTimeout(r, 1000 * i));
    }
  }

  throw lastError || new Error('PDF generation failed');
}
