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
    args = [
      ...chromiumModule.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--font-render-hinting=none',
      '--renderer-process-limit=1',
    ];
  } else {
    // Try common Windows paths for Chrome
    const fs = require('fs');
    const possiblePaths = [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
    ];

    executablePath = possiblePaths.find(p => fs.existsSync(p)) || 'google-chrome';
    args = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];
    console.log('[PDF] Using local Chrome at:', executablePath);
  }

  console.log('[PDF] Launching Chrome...');

  const browser = await puppeteer.launch({
    args,
    executablePath,
    headless: true,
    defaultViewport: { width: 794, height: 1123 }, // A4 at 96 DPI
  });

  try {
    const html = generateHTMLTemplate(paperData);
    const page = await browser.newPage();

    try {
      // Set viewport for consistent rendering
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

      // Use networkidle0 to ensure all resources are loaded
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

      console.log('[PDF] Waiting for KaTeX to render...');

      // Wait for KaTeX to complete rendering with extended timeout
      await page.waitForFunction(() => {
        // Check if KaTeX has rendered all elements
        const katexElements = document.querySelectorAll('.katex');
        const dataKatex = document.querySelectorAll('[data-katex]');
        
        // If no KaTeX elements, it might already be rendered or not needed
        if (dataKatex.length === 0) return true;
        
        // Check if rendered output exists
        if (katexElements.length === dataKatex.length) {
          // Verify rendered content is not empty
          const firstKatex = katexElements[0];
          return firstKatex && firstKatex.textContent && firstKatex.textContent.trim().length > 0;
        }
        return false;
      }, { timeout: 30000 }).catch(() => {
        console.warn('[PDF] KaTeX wait timeout - proceeding anyway');
      });

      // Additional wait for fonts to load
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

      console.log('[PDF] Generating PDF...');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        printBackground: true,
        preferCSSPageSize: false,
        scale: 1,
      });

      console.log('[PDF] Buffer size:', pdfBuffer.length);

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
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

    const qNoWidth = 10;
    const contentWidth = pageWidth - (2 * margin);
    const optCellWidth = contentWidth / 4;
    const questionRowH = 8;
    const optionsRowH = 7;

    doc.setFont('times', 'normal');
    doc.setFontSize(8);

    paperData.mcqs.forEach((mcq, idx) => {
      if (yPos + questionRowH + optionsRowH > 270) { doc.addPage(); yPos = margin; }
      const opts = mcq.options || [];
      const cleanQ = cleanLatex(mcq.questionText);

      // Row 1: Q# + full question text
      let x = margin;
      doc.setLineWidth(0.15);
      doc.rect(x, yPos, qNoWidth, questionRowH);
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      doc.text(String(idx + 1), x + qNoWidth / 2, yPos + 5, { align: 'center' });
      x += qNoWidth;
      doc.rect(x, yPos, contentWidth - qNoWidth, questionRowH);
      doc.setFont('times', 'normal');
      const qLines = doc.splitTextToSize(cleanQ, contentWidth - qNoWidth - 4);
      doc.text(qLines[0], x + 2, yPos + 5);
      yPos += questionRowH;

      // Row 2: 4 option cells — no truncation
      x = margin;
      const optLabels = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        doc.rect(x, yPos, optCellWidth, optionsRowH);
        const optText = cleanLatex(opts[i] || '');
        const optLines = doc.splitTextToSize(`${optLabels[i]}: ${optText}`, optCellWidth - 4);
        doc.text(optLines[0], x + 2, yPos + 4.5);
        x += optCellWidth;
      }
      yPos += optionsRowH;
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
      const qText = `${idx + 1}. ${cleanLatex(sq.questionText)}`;
      // Use splitTextToSize instead of substring — wraps text across multiple lines
      const lines = doc.splitTextToSize(qText, pageWidth - margin * 2 - 12);
      // Check if we need a new page for multi-line question
      if (yPos + (lines.length * 5) > 275) { doc.addPage(); yPos = margin; }
      doc.text(lines, margin, yPos);
      doc.setFontSize(7);
      doc.text(`[${QUESTION_MARKS.short}]`, pageWidth - margin - 5, yPos);
      doc.setFontSize(9);
      yPos += (lines.length * 5) + 1;
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
      const qText = `Q${idx + 1}. ${cleanLatex(lq.questionText)}`;
      const lines = doc.splitTextToSize(qText, pageWidth - margin * 2 - 12);
      if (yPos + (lines.length * 6) > 275) { doc.addPage(); yPos = margin; }
      doc.text(lines, margin, yPos);
      doc.setFontSize(7);
      doc.text(`[${QUESTION_MARKS.long}]`, pageWidth - margin - 5, yPos);
      doc.setFontSize(9);
      yPos += (lines.length * 6) + 1;
    });
  }

  // Watermark
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('PaperPress — paperpressapp@gmail.com', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

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
    console.error('[PDF] Using jsPDF fallback — output quality reduced');
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
