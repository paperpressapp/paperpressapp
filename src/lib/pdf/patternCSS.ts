/**
 * PaperPress — Board-Exam Quality Print CSS
 *
 * A4, narrow margins, Times New Roman, clean table borders.
 * Works for Puppeteer (Vercel) and Android WebView PrintManager.
 */
export function generatePatternCSS(): string {
  return `
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    @page {
      size: A4;
      margin: 13mm 13mm 13mm 13mm;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 9.5pt;
      line-height: 1.25;
      color: #000;
      background: #fff;
    }

    /* ════════════ HEADER ════════════ */

    .pp-header {
      border: 1.5pt solid #000;
      margin-bottom: 0;
    }

    .pp-header-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4pt 8pt 3pt;
      text-align: center;
    }

    .pp-logo {
      width: 44pt;
      height: 44pt;
      object-fit: contain;
      margin-bottom: 2pt;
    }

    .pp-school-name {
      font-size: 15pt;
      font-weight: bold;
      letter-spacing: 0.4pt;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .pp-school-sub {
      font-size: 8pt;
      margin-top: 1pt;
    }

    .pp-contact-bar {
      background: #1a1a1a;
      color: #ffffff;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 2.5pt 6pt;
      font-size: 7pt;
      gap: 4pt;
      flex-wrap: wrap;
    }

    .pp-contact-bar span { text-align: center; }

    /* ════════════ STUDENT META ════════════ */

    .pp-meta {
      border-left: 1.5pt solid #000;
      border-right: 1.5pt solid #000;
      border-bottom: 1.5pt solid #000;
      margin-bottom: 5pt;
    }

    .pp-meta-row {
      display: flex;
      border-bottom: 0.75pt solid #aaa;
    }

    .pp-meta-row:last-child { border-bottom: none; }

    .pp-meta-cell {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 2.5pt 5pt;
      border-right: 0.75pt solid #aaa;
      font-size: 8.5pt;
    }

    .pp-meta-cell:last-child { border-right: none; }

    .pp-meta-label {
      font-weight: bold;
      white-space: nowrap;
      margin-right: 3pt;
    }

    .pp-meta-line {
      flex: 1;
      border-bottom: 0.5pt solid #555;
      height: 8pt;
      min-width: 40pt;
    }

    /* ════════════ SECTION HEADER BAR ════════════ */

    .pp-sec-bar {
      display: flex;
      align-items: baseline;
      background: #ebebeb;
      border: 1pt solid #000;
      padding: 2.5pt 5pt;
      margin-bottom: 2pt;
      gap: 4pt;
      page-break-inside: avoid;
      page-break-after: avoid;
    }

    .pp-sec-qnum {
      font-weight: bold;
      font-size: 10pt;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .pp-sec-title {
      font-weight: bold;
      font-size: 10pt;
      flex: 2;
    }

    .pp-sec-instr {
      font-style: italic;
      font-size: 8.5pt;
      flex: 3;
      text-align: center;
    }

    .pp-sec-marks {
      font-weight: bold;
      font-size: 9pt;
      white-space: nowrap;
      flex-shrink: 0;
      text-align: right;
    }

    .pp-sec-note {
      background: #fffbe6;
      border: 0.5pt solid #e0c000;
      border-left: 3pt solid #e0c000;
      padding: 2pt 5pt;
      font-size: 7.5pt;
      font-style: italic;
      margin-bottom: 3pt;
    }

    /* ════════════ PAGE DIVIDER (Objective → Subjective) ════════════ */

    .pp-divider {
      border: 1.5pt solid #000;
      text-align: center;
      padding: 3pt 0;
      font-size: 10pt;
      font-weight: bold;
      letter-spacing: 3pt;
      margin: 6pt 0 4pt;
      background: #ebebeb;
      page-break-before: always;
      page-break-after: avoid;
    }

    /* ════════════ MCQ — BUBBLE GRID ════════════ */

    .pp-bubbles {
      border: 0.75pt solid #000;
      padding: 4pt 5pt 3pt;
      margin-bottom: 4pt;
      display: flex;
      flex-wrap: wrap;
      gap: 3pt 8pt;
      page-break-inside: avoid;
    }

    .pp-bub-item {
      display: flex;
      align-items: center;
      gap: 2pt;
    }

    .pp-bub-num {
      font-size: 8pt;
      font-weight: bold;
      min-width: 13pt;
      text-align: right;
    }

    .pp-bub-opts {
      display: flex;
      gap: 2pt;
    }

    .pp-bub-opt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1pt;
    }

    .pp-bub-letter {
      font-size: 6pt;
      font-weight: bold;
      line-height: 1;
    }

    .pp-bub-circle {
      display: block;
      width: 9pt;
      height: 9pt;
      border: 0.75pt solid #000;
      border-radius: 50%;
    }

    /* ════════════ MCQ — QUESTION TABLE ════════════ */

    .pp-mcq-table {
      width: 100%;
      border-collapse: collapse;
      border: 0.75pt solid #000;
      font-size: 9pt;
    }

    .pp-mcq-tr {
      border-bottom: 0.4pt solid #ccc;
      page-break-inside: avoid;
    }

    .pp-mcq-tr:last-child { border-bottom: none; }

    .pp-mcq-num {
      width: 15pt;
      vertical-align: top;
      padding: 2pt 2pt 1pt 3pt;
      font-weight: bold;
      font-size: 8.5pt;
      border-right: 0.4pt solid #ccc;
    }

    .pp-mcq-body {
      padding: 2pt 3pt 2pt 3pt;
    }

    .pp-mcq-qtext {
      display: block;
      line-height: 1.35;
      margin-bottom: 2pt;
    }

    .pp-mcq-opts {
      display: flex;
      gap: 0;
    }

    .pp-mcq-opt {
      flex: 1;
      font-size: 8.5pt;
    }

    .pp-mcq-opt-lbl { font-weight: bold; }

    /* ════════════ SHORT QUESTIONS ════════════ */

    .pp-shorts { }

    .pp-short-row {
      display: flex;
      align-items: flex-start;
      padding: 2pt 4pt;
      border-bottom: 0.3pt solid #ddd;
      page-break-inside: avoid;
      min-height: 13pt;
    }

    .pp-short-row:last-child { border-bottom: none; }

    .pp-short-num {
      font-weight: bold;
      font-size: 9pt;
      min-width: 22pt;
      flex-shrink: 0;
    }

    .pp-short-text {
      flex: 1;
      font-size: 9pt;
      line-height: 1.3;
    }

    .pp-short-marks {
      font-size: 7.5pt;
      color: #333;
      margin-left: 4pt;
      flex-shrink: 0;
    }

    /* ════════════ LONG QUESTIONS ════════════ */

    .pp-longs { }

    .pp-long-item {
      padding: 3pt 4pt;
      border-bottom: 0.75pt solid #888;
      page-break-inside: avoid;
    }

    .pp-long-item:last-child { border-bottom: none; }

    .pp-long-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 2pt;
    }

    .pp-long-qnum {
      font-weight: bold;
      font-size: 10pt;
      min-width: 26pt;
      flex-shrink: 0;
    }

    .pp-long-text {
      flex: 1;
      font-size: 9pt;
      line-height: 1.35;
    }

    .pp-long-marks {
      font-size: 8pt;
      font-weight: bold;
      margin-left: 4pt;
      flex-shrink: 0;
    }

    .pp-long-parts { padding-left: 24pt; }

    .pp-long-part {
      display: flex;
      align-items: flex-start;
      margin-bottom: 2pt;
      page-break-inside: avoid;
    }

    .pp-long-part-lbl {
      font-weight: bold;
      font-size: 9pt;
      min-width: 18pt;
      flex-shrink: 0;
    }

    .pp-long-part-text {
      flex: 1;
      font-size: 9pt;
      line-height: 1.3;
    }

    .pp-long-part-marks {
      font-size: 7.5pt;
      color: #444;
      margin-left: 3pt;
      flex-shrink: 0;
    }

    /* ════════════ WRITING SECTIONS (English) ════════════ */

    .pp-writing-prompt {
      font-style: italic;
      font-size: 9pt;
      padding: 2pt 4pt;
      border: 0.5pt dashed #888;
      background: #fafafa;
      margin-bottom: 3pt;
    }

    .pp-lines {
      display: flex;
      flex-direction: column;
    }

    .pp-line {
      border-bottom: 0.5pt solid #bbb;
      height: 14pt;
    }

    /* ════════════ FOOTER WATERMARK ════════════ */

    .pp-footer {
      text-align: center;
      font-size: 6.5pt;
      color: #666;
      padding: 2pt 0;
      border-top: 0.25pt solid #ccc;
      margin-top: 4pt;
    }

    /* ════════════ MATH (KaTeX) ════════════ */

    .math-inline { display: inline; margin: 0 1pt; }
    .math-display { display: block; text-align: center; margin: 2pt 0; }

    .katex {
      font-size: 0.95em;
      line-height: 1.25;
      font-family: 'KaTeX_Main', 'Times New Roman', serif;
    }

    .katex .frac-line { border-top-width: 1px; min-height: 0.03em; }
    .math-error { color: #c00; font-style: italic; }

    /* ════════════ PRINT RULES ════════════ */

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }

      .pp-header,
      .pp-meta,
      .pp-sec-bar,
      .pp-bubbles,
      .pp-mcq-tr,
      .pp-short-row,
      .pp-long-item,
      .pp-long-part { page-break-inside: avoid; }

      .pp-divider {
        page-break-before: always;
        page-break-after: avoid;
      }
    }
  `;
}
