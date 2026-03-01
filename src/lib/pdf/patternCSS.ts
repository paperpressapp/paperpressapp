/**
 * PaperPress — Board-Exam Quality Print CSS
 *
 * A4, narrow margins, Times New Roman, clean table borders.
 * Compact, dense layout resembling traditional board papers.
 */
export function generatePatternCSS(baseFontSize: number = 12): string {
  return `
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    html, body {
      width: 794px;
      max-width: 794px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @page {
      size: A4;
      margin: 6mm 7mm 6mm 7mm;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: ${baseFontSize}pt;
      line-height: 1.2;
      color: #000;
      background: #fff;
    }

    /* ════════════ HEADER ════════════ */

    .pp-header {
      border: 1px solid #000;
      margin-bottom: 0;
    }

    .pp-header-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3pt 6pt 2pt;
      text-align: center;
    }

    .pp-logo {
      width: 36pt;
      height: 36pt;
      object-fit: contain;
      margin-bottom: 1pt;
    }

    .pp-school-name {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 0.3pt;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .pp-school-sub {
      font-size: 7pt;
      margin-top: 0.5pt;
    }

    .pp-contact-bar {
      background: #1a1a1a;
      color: #ffffff;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 2pt 4pt;
      font-size: 6pt;
      gap: 3pt;
      flex-wrap: wrap;
    }

    .pp-contact-bar span { text-align: center; }

    /* ════════════ STUDENT META - COMPACT BOARD STYLE ════════════ */

    .pp-meta {
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
      margin-bottom: 3pt;
    }

    .pp-meta-row {
      display: flex;
      border-bottom: 0.5pt solid #000;
    }

    .pp-meta-row:last-child { border-bottom: none; }

    .pp-meta-cell {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 4pt 5pt;
      border-right: 0.5pt solid #000;
      font-size: 9pt;
    }

    .pp-meta-line {
      flex: 1;
      border-bottom: 0.5pt solid #333;
      height: 14pt;
      min-width: 60pt;
    }

    .pp-meta-line {
      flex: 1;
      border-bottom: 0.5pt solid #333;
      height: 10pt;
      min-width: 50pt;
    }

    .pp-meta-cell:last-child { border-right: none; }

    .pp-meta-label {
      font-weight: bold;
      white-space: nowrap;
      margin-right: 2pt;
    }

    .pp-meta-value {
      margin-left: 2pt;
    }

    /* ════════════ SECTION HEADER BAR ════════════ */

    .pp-sec-bar {
      display: flex;
      align-items: baseline;
      border: 0.5pt solid #000;
      padding: 1.5pt 3pt;
      margin-bottom: 0;
      gap: 3pt;
      page-break-inside: avoid;
      page-break-after: avoid;
    }

    .pp-sec-qnum {
      font-weight: bold;
      font-size: 9pt;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .pp-sec-title {
      font-weight: bold;
      font-size: 9pt;
      flex: 2;
    }

    .pp-sec-instr {
      font-style: italic;
      font-size: 8pt;
      flex: 3;
      text-align: center;
    }

    .pp-sec-marks {
      font-weight: bold;
      font-size: 8pt;
      white-space: nowrap;
      flex-shrink: 0;
      text-align: right;
    }

    .pp-sec-note {
      background: #fffbe6;
      border: 0.5pt solid #e0c000;
      border-left: 2pt solid #e0c000;
      padding: 1pt 3pt;
      font-size: 7pt;
      font-style: italic;
      margin-bottom: 2pt;
    }

    /* ════════════ PAGE DIVIDER (Objective → Subjective) ════════════ */

    .pp-divider {
      border: 1px solid #000;
      text-align: center;
      padding: 2pt 0;
      font-size: 9pt;
      font-weight: bold;
      letter-spacing: 2pt;
      margin: 4pt 0 3pt;
      background: #ebebeb;
      page-break-before: always;
      page-break-after: avoid;
    }

    /* ════════════ MCQ — BUBBLE GRID ════════════ */

    .pp-bubbles {
      border: 0.5pt solid #000;
      padding: 2pt 3pt 2pt;
      margin-bottom: 2pt;
      display: flex;
      flex-wrap: wrap;
      gap: 2pt 6pt;
      page-break-inside: avoid;
    }

    .pp-bub-item {
      display: flex;
      align-items: center;
      gap: 1pt;
    }

    .pp-bub-num {
      font-size: 7pt;
      font-weight: bold;
      min-width: 11pt;
      text-align: right;
    }

    .pp-bub-opts {
      display: flex;
      gap: 1pt;
    }

    .pp-bub-opt {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5pt;
    }

    .pp-bub-letter {
      font-size: 8pt;
      font-weight: bold;
      line-height: 1;
    }

    .pp-bub-circle {
      display: block;
      width: 11pt;
      height: 11pt;
      border: 0.5pt solid #000;
      border-radius: 50%;
    }

    /* ════════════ MCQ — QUESTION TABLE ════════════ */

    .pp-mcq-table {
      width: 100%;
      border-collapse: collapse;
      border: 0.5pt solid #000;
      font-size: 8.5pt;
    }

    .pp-mcq-tr {
      border-bottom: 0.3pt solid #999;
      page-break-inside: avoid;
    }

    .pp-mcq-tr:last-child { border-bottom: none; }

    .pp-mcq-num {
      width: 12pt;
      vertical-align: top;
      padding: 1pt 1pt 1pt 2pt;
      font-weight: bold;
      font-size: 8pt;
      border-right: 0.3pt solid #999;
    }

    .pp-mcq-body {
      padding: 1pt 2pt 1pt 2pt;
    }

    .pp-mcq-qtext {
      display: block;
      line-height: 1.25;
      margin-bottom: 1pt;
    }

    .pp-mcq-opts {
      display: flex;
      gap: 4pt;
      margin-top: 1.5pt;
    }

    .pp-mcq-opt {
      flex: 1;
      font-size: 8pt;
      line-height: 1.2;
    }

    .pp-mcq-opt-lbl { font-weight: bold; }

    /* ════════════ SHORT QUESTIONS ════════════ */

    .pp-shorts { }

    .pp-short-row {
      display: flex;
      align-items: flex-start;
      padding: 1.5pt 3pt;
      border-bottom: 0.3pt solid #ccc;
      page-break-inside: avoid;
      min-height: 12pt;
      margin-bottom: 4pt;
    }

    .pp-short-row:last-child { border-bottom: none; }

    .pp-short-num {
      font-weight: bold;
      font-size: 8.5pt;
      min-width: 18pt;
      flex-shrink: 0;
    }

    .pp-short-text {
      flex: 1;
      font-size: 8.5pt;
      line-height: 1.2;
    }

    .pp-short-marks {
      font-size: 7pt;
      color: #333;
      margin-left: 3pt;
      flex-shrink: 0;
    }

    /* ════════════ LONG QUESTIONS ════════════ */

    .pp-longs { }

    .pp-long-item {
      padding: 2pt 3pt;
      border-bottom: 0.5pt solid #666;
      page-break-inside: avoid;
      margin-bottom: 4pt;
    }

    .pp-long-item:last-child { border-bottom: none; }

    .pp-long-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1pt;
    }

    .pp-long-qnum {
      font-weight: bold;
      font-size: 9pt;
      min-width: 22pt;
      flex-shrink: 0;
    }

    .pp-long-text {
      flex: 1;
      font-size: 8.5pt;
      line-height: 1.25;
    }

    .pp-long-marks {
      font-size: 7.5pt;
      font-weight: bold;
      margin-left: 3pt;
      flex-shrink: 0;
    }

    .pp-long-parts { padding-left: 20pt; }

    .pp-long-part {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1pt;
      page-break-inside: avoid;
    }

    .pp-long-part-lbl {
      font-weight: bold;
      font-size: 8.5pt;
      min-width: 15pt;
      flex-shrink: 0;
    }

    .pp-long-part-text {
      flex: 1;
      font-size: 8.5pt;
      line-height: 1.2;
    }

    .pp-long-part-marks {
      font-size: 7pt;
      color: #444;
      margin-left: 2pt;
      flex-shrink: 0;
    }

    /* ════════════ WRITING SECTIONS (English) ════════════ */

    .pp-writing-prompt {
      font-style: italic;
      font-size: 8.5pt;
      padding: 1pt 3pt;
      border: 0.5pt dashed #666;
      background: #fafafa;
      margin-bottom: 2pt;
    }

    .pp-lines {
      display: flex;
      flex-direction: column;
    }

    .pp-line {
      border-bottom: 0.5pt solid #bbb;
      height: 12pt;
    }

    /* ════════════ FOOTER WATERMARK ════════════ */

    .pp-footer {
      text-align: center;
      font-size: 6pt;
      color: #666;
      padding: 1pt 0;
      border-top: 0.25pt solid #ccc;
      margin-top: 3pt;
    }

    /* ════════════ MATH (KaTeX) ════════════ */

    .math-inline { display: inline; margin: 0 1pt; }
    .math-display { display: block; text-align: center; margin: 1pt 0; }

    .katex {
      font-size: 0.95em;
      line-height: 1.2;
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

    /* ════════════ OMR BUBBLE SHEET ════════════ */

    .pp-page-break { page-break-before: always; }

    .omr-sheet {
      padding: 15px;
      font-family: 'Arial', sans-serif;
    }

    .omr-header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #333;
      padding-bottom: 8px;
    }

    .omr-header h3 {
      font-size: 16px;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }

    .omr-header p {
      font-size: 9px;
      color: #666;
      margin: 0;
    }

    .omr-info {
      display: flex;
      gap: 15px;
      margin-bottom: 12px;
      font-size: 10px;
    }

    .omr-field {
      display: flex;
      align-items: center;
      gap: 4px .omr-field span { font-weight;
    }

   : bold; }

    .omr-line {
      width: 80px;
      border-bottom: 1px solid #333;
    }

    .omr-instructions {
      font-size: 9px;
      margin-bottom: 12px;
      padding: 6px;
      background: #f5f5f5;
      border-radius: 3px;
    }

    .omr-bubbles-container {
      border: 1px solid #333;
      padding: 8px;
    }

    .omr-row {
      display: flex;
      align-items: center;
      padding: 3px 0;
      border-bottom: 0.3pt solid #ddd;
    }

    .omr-range {
      width: 40px;
      font-size: 8px;
      font-weight: bold;
      color: #666;
    }

    .omr-q {
      display: flex;
      align-items: center;
      margin-right: 12px;
    }

    .omr-num {
      width: 18px;
      font-size: 8px;
      text-align: right;
      margin-right: 4px;
    }

    .omr-bubbles {
      display: flex;
      gap: 2px;
    }

    .omr-letter {
      width: 10px;
      font-size: 7px;
      text-align: center;
    }

    .omr-circle {
      width: 12px;
      height: 12px;
      border: 1px solid #333;
      border-radius: 50%;
      display: inline-block;
    }
  `;
}
