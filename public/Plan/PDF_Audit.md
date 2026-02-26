PaperPress
PDF Generation — Fix Plan
The complete, focused sprint to make the core feature excellent

8 Bugs Fixed
Truncation · Math · Marks · Layout	5 Files Touched
No new architecture needed	~3 Day Sprint
Ordered by impact on user experience

0.  Understanding Your Two PDF Paths
Before fixing anything, understand the architecture. PaperPress has TWO completely separate PDF generation systems. Each has its own bugs and its own quality ceiling.

PATH A — Online (Vercel + Puppeteer)
Android APK
Capacitor · Native	→	Vercel API
/api/generate-pdf	→	Puppeteer
Chrome + KaTeX	→	PDF

This is the high-quality path. Chrome renders the HTML with KaTeX math, then prints to PDF. The output looks like a real printed paper. This runs on your Vercel server — the Android app calls it over HTTPS.

PATH B — Offline Fallback (Android + jsPDF)
Android (Offline)
No network	→	jsPDF / WebView
Local render	→	PDF (no math)

This runs entirely on the device with no internet. It uses either jsPDF (draws text directly) or the Android WebView PrintManager (renders HTML then prints natively). Currently, this path has serious quality problems.

The Core Decision You Need to Make:
The Android WebView path (PDFPrinter.printToPDF in download.ts) already renders the same HTML as Puppeteer — which means it CAN produce KaTeX math and look identical to the Vercel output, completely offline. But the code in professionalPDF.ts and generator.ts still uses jsPDF with text truncation.
The fix plan below makes Path A (Vercel) perfect first, then makes Path B use WebView HTML rendering (not jsPDF) so both outputs look identical.


1.  All Current PDF Bugs — Diagnosed
Here are every identified problem across all 6 PDF files, in order of user-visible impact.

BUG-01  MCQ Options Truncated to 7 Characters  [CRITICAL]
  📄 professionalPDF.ts
PROBLEM
• In professionalPDF.ts line ~164: const truncatedOpt = opt.length > 10 ? opt.substring(0, 7) + "..." : opt — options are cut to 7 characters.
• Same problem in puppeteerPDF.ts fallback (jsPDF path): options cut to 12 characters.
• Result: "Acceleration" → "Accel...", "Photosynthesis" → "Photosy..." — factually incorrect on printed exam papers.
• The root cause: the MCQ table has 4 fixed-width option columns (22mm each) that are too narrow for full text.
✔  FIXES
→ Switch the MCQ layout from a 6-column horizontal table to a vertical card layout.
→ Each question gets 2 rows: (1) the question text spanning full width, (2) a 2×2 grid of option cells below it.
→ This gives each option ~90mm of width — more than enough for any text.
→ Apply to BOTH professionalPDF.ts (jsPDF path) AND htmlTemplate.ts / htmlGenerator.ts (Puppeteer/WebView path).
💻 CODE: New MCQ row: Q# + question text (full width), then: [A] option | [B] option | [C] option | [D] option (50% each pair)

BUG-02  Marks Calculation Is Different in Every File  [CRITICAL]
  📄 htmlTemplate.ts
PROBLEM
• htmlTemplate.ts calculateMarks(): shorts × QUESTION_MARKS.short (which is 5 from types/question.ts)
• htmlGenerator.ts calculateMarks(): shorts.length × 2  (hardcoded 2, completely different)
• professionalPDF.ts: uses QUESTION_MARKS directly (short=5, long=10)
• generator.ts addHeader(): shortMarks = Math.min(8, shorts.length) × 2, longMarks = Math.min(3, longs.length) × 5
• Result: generating the same paper via Vercel vs Android shows DIFFERENT total marks in the PDF header. Teachers will notice.
✔  FIXES
→ QUESTION_MARKS in types/question.ts is already the canonical source: { mcq: 1, short: 5, long: 10 }
→ Delete calculateMarks() from both htmlTemplate.ts AND htmlGenerator.ts.
→ Import QUESTION_MARKS from "@/types/question" in every file that needs marks.
→ Single formula everywhere: total = mcqs.length × 1 + shorts.length × 5 + longs.length × 10
💻 CODE: grep -r "× 2" src/lib/pdf/ — every hit here is a wrong marks calculation that needs to be replaced

BUG-03  Short Questions Have No Numbering in PDF  [CRITICAL]
  📄 htmlTemplate.ts
PROBLEM
• In htmlTemplate.ts, shortItems are rendered as: "1. [question text] [2]" — the marks badge shows [2] not [5].
• In htmlGenerator.ts, the short question number starts at mcqCount + 1 (correct), but marks badge is also [2].
• In professionalPDF.ts: shorts ARE numbered correctly ("1. [text]") and show the right marks [5].
• Inconsistency between the two HTML templates means the Vercel PDF and the Android PDF look different.
✔  FIXES
→ In htmlTemplate.ts shortItems: change [2] mark badge to [${QUESTION_MARKS.short}].
→ In htmlGenerator.ts shortItems: change [2] to [${QUESTION_MARKS.short}].
→ Verify the question number in the short section: it should start at 1 (within the section), not at mcqCount+1.
→ Punjab Board format: short questions start at "1." within SECTION B, not continuing from MCQ numbering.

BUG-04  Two Duplicate HTML Template Files Generating Different Output  [HIGH]
  📄 htmlTemplate.ts
PROBLEM
• Both htmlTemplate.ts (504 lines) and htmlGenerator.ts (500+ lines) generate nearly identical HTML for the same purpose.
• They have different CSS: htmlTemplate uses font-size: 12pt body, htmlGenerator uses font-size: 11pt body.
• htmlTemplate uses @page margin: 10mm, htmlGenerator uses @page margin: 0.4in (10.16mm) — close but different.
• htmlTemplate renders the info table in a 3-column layout; htmlGenerator renders it in a 6-cell row layout.
• puppeteerPDF.ts uses htmlTemplate.ts. download.ts Android path uses htmlGenerator.ts. They produce different-looking papers.
✔  FIXES
→ Choose ONE template. Recommend keeping htmlTemplate.ts since it is used by Puppeteer (highest quality path).
→ Update download.ts Android path to use generateHTMLTemplate() from htmlTemplate.ts instead of generatePaperHTML() from htmlGenerator.ts.
→ Delete htmlGenerator.ts entirely after migrating the Android path.
→ The result: both Vercel and Android WebView render the exact same HTML → identical output.
💻 CODE: The unified template becomes the single source of truth for how every paper looks on every platform

BUG-05  Puppeteer Uses networkidle2 — Slow and Fragile  [HIGH]
  📄 puppeteerPDF.ts
PROBLEM
• page.setContent(html, { waitUntil: "networkidle2" }) waits for ALL network activity to stop — this includes waiting for KaTeX CDN to load.
• On Vercel cold starts, this means the PDF generation waits for external CDN calls, which can add 5–10 extra seconds.
• If the CDN is slow or has a hiccup, networkidle2 can time out causing the entire PDF generation to fail.
• There is also a hardcoded 500ms extra delay (await new Promise(r => setTimeout(r, 500))) that serves no purpose on modern systems.
✔  FIXES
→ Switch to waitUntil: "domcontentloaded" — this fires as soon as the DOM is parsed, much faster.
→ Instead of relying on CDN KaTeX, inline the KaTeX CSS and JS directly in the HTML template.
→ Move KaTeX to a local file in the project: copy katex.min.js and katex.min.css to public/lib/katex/ and reference them as absolute paths.
→ Since Puppeteer can load local files, this eliminates the CDN dependency entirely and speeds up generation by 3–8 seconds.
→ Remove the hardcoded 500ms delay.
💻 CODE: katex npm package is already in dependencies — import its dist files directly instead of using CDN

BUG-06  browser.close() Not in a finally Block — Memory Leak  [HIGH]
  📄 puppeteerPDF.ts
PROBLEM
• In generatePDFWithPuppeteer(), the browser.launch() is wrapped in try/finally which IS correct — browser.close() is in the finally block.
• HOWEVER: if page.setContent() throws (e.g. HTML parse error), the page is never closed separately.
• More critically: the jsPDF fallback generatePDFWithJsPDF() in puppeteerPDF.ts still truncates options to 12 characters — this is the fallback for when Puppeteer fails, so if Puppeteer fails in production, users get truncated output.
✔  FIXES
→ Wrap page.setContent and page.pdf in try/catch within the browser try block; close the page explicitly: await page.close() after pdf generation.
→ Fix the jsPDF fallback in puppeteerPDF.ts: apply the same vertical MCQ layout fix from BUG-01 to the fallback path.
→ Add a log when fallback is used: console.error("[PDF] Using jsPDF fallback — output quality reduced") so you can monitor how often Puppeteer fails in production.

BUG-07  Logo Format Hardcoded as PNG — JPEG/WebP Silently Fails  [HIGH]
  📄 professionalPDF.ts
PROBLEM
• In professionalPDF.ts: logo is added with pdf.addImage(logoData, "PNG", ...) — the second argument is hardcoded as "PNG".
• Same issue in generator.ts drawLogo(): pdf.addImage(logoBase64, "PNG", ...).
• The logo upload in PaperSettings accepts JPEG, PNG, JPG, and WebP.
• When a teacher uploads a JPEG logo, jsPDF silently renders a blank space (or throws a console error). The logo disappears from the PDF with no error shown to the user.
✔  FIXES
→ Detect the format from the base64 data URL prefix before calling addImage():
→ const fmt = logoBase64.startsWith("data:image/jpeg") || logoBase64.startsWith("data:image/jpg") ? "JPEG" : "PNG"
→ Pass fmt as the second argument to pdf.addImage().
→ Add a try/catch around the addImage() call: if it fails, log a warning and skip the logo rather than crashing the whole PDF.
→ Apply this fix to BOTH professionalPDF.ts and generator.ts.
💻 CODE: const fmt = /data:image\/(jpeg|jpg)/i.test(logoBase64) ? "JPEG" : "PNG"

BUG-08  Page Break Logic Wastes Half a Page (50% Rule)  [MEDIUM]
  📄 generator.ts
PROBLEM
• In generator.ts checkAndAddPage(): a new page is added if remaining space < 50% of page height.
• This means if there is 48% of a page left (116mm on A4), a new page is STILL added, wasting nearly half a page.
• Result: papers with a moderate number of short questions start the subjective section on a new page when there was plenty of room, making the paper unnecessarily 3–4 pages instead of 2.
✔  FIXES
→ Remove the 50% rule entirely from checkAndAddPage().
→ Only add a new page when: remainingSpace < requiredSpace (the actual space needed for the next element).
→ For the subjective section header, requiredSpace = ~35mm (section title + first question).
→ Test: a paper with 15 MCQs + 8 short questions should fit on 2 pages, not 3.


2.  Output Quality Problems
Beyond bugs, these are design/formatting issues that make the output look unprofessional even when it technically works.

Before vs After — What Users See Today vs What They Should See

Current State	After Fix
✗  MCQ option "Electromagnetic Induction" → "Electro..."	✓  Full option text in a 2×2 grid below the question
✗  Total marks shows 45 on preview, 40 on the actual PDF	✓  Same total marks everywhere, pulled from one source
✗  Short questions numbered with wrong marks badge [2]	✓  Short questions show [5] marks (correct per Punjab Board)
✗  Vercel PDF and Android PDF look visually different	✓  Both render the same HTML template, look identical
✗  KaTeX CDN fails → math shows as "[Formula]"	✓  KaTeX loaded locally, always works, renders in 0ms
✗  Logo uploaded as JPEG → blank space in PDF	✓  Logo auto-detected as JPEG/PNG, always renders
✗  3-page paper when 2 pages was achievable	✓  2-page paper with smart page break logic


3.  Execution Plan — Ordered Tasks
Do these tasks in this exact order. Each task is self-contained and can be committed and tested independently.

SPRINT 1  Marks & Numbering — 2 hours  ·  Zero visual changes, pure data correctness

TASK 1  Unify Marks Calculation — Single Source of Truth  ·  45 mins  ·  CRITICAL
📄 All PDF files
  1.  Open types/question.ts — verify QUESTION_MARKS = { mcq: 1, short: 5, long: 10 }. This is already correct.
  2.  In htmlTemplate.ts: delete the calculateMarks() function. Replace with: import { QUESTION_MARKS } from "@/types/question".
  3.  Replace all uses of calculateMarks() in htmlTemplate.ts with: mcqMarks = mcqs.length * QUESTION_MARKS.mcq, etc.
  4.  In htmlGenerator.ts: same — delete calculateMarks(), import QUESTION_MARKS, replace the hardcoded "× 2" formula.  — The "× 2" for short questions is WRONG — should be × 5
  5.  In generator.ts addHeader(): replace the custom marks formula with QUESTION_MARKS imports.
  6.  Verify: all 4 files now import the same constants and produce the same total for an identical paper.
📌 Run a quick sanity check: select 10 MCQ + 5 short + 3 long. Expected total = 10 + 25 + 30 = 65 marks in every output.

TASK 2  Fix Short Question Marks Badge and Numbering  ·  20 mins  ·  CRITICAL
📄 htmlTemplate.ts + htmlGenerator.ts
  1.  In htmlTemplate.ts shortItems template literal: change [2] to [${QUESTION_MARKS.short}].
  2.  In htmlGenerator.ts shortItems: same — change [2] to [${QUESTION_MARKS.short}].
  3.  Verify long question marks badge is also [${QUESTION_MARKS.long}] (should be [5] in htmlGenerator which uses 5, but long questions should be 10).  — htmlGenerator has shortMarks × 2 and longMarks × 5 — both are wrong per QUESTION_MARKS
  4.  After fixing Task 1, this becomes a find-and-replace: all mark badges should read the imported constant.


SPRINT 2  Fix MCQ Layout — 3 hours  ·  Biggest user-visible improvement

TASK 3  Redesign MCQ Table to Vertical Layout (HTML Template)  ·  2 hours  ·  CRITICAL
📄 htmlTemplate.ts + htmlGenerator.ts
  1.  In htmlTemplate.ts, change the CSS: remove the fixed .mcq-col-option { width: 10% } rule.
  2.  Redesign the mcqRows template string for a 2-row-per-question layout:  — Row 1: Q# + full question text spanning all columns. Row 2: A | B | C | D each at 25% width
  3.  New HTML structure per MCQ:
<tr><td class="mcq-no">{idx+1}</td><td class="mcq-q" colspan="4">{questionText}</td></tr>
<tr><td class="mcq-opt">A: {optA}</td><td class="mcq-opt">B: {optB}</td><td class="mcq-opt">C: {optC}</td><td class="mcq-opt">D: {optD}</td></tr>
  4.  Update .mcq-opt CSS: width: 25%, text-align: left, padding: 3pt 5pt, border: 0.4pt solid #000, font-size: 10pt.
  5.  Update .mcq-no: width: 20pt, text-align: center, vertical-align: top, font-weight: bold.
  6.  Remove the <thead> with Q.No / Question / A / B / C / D headers since the new layout is self-explanatory.
  7.  Apply the same change to htmlGenerator.ts so both templates are in sync.
  8.  Test with a Physics MCQ that has a long option like "The rate of change of velocity with respect to time".
📌 This is the single highest-impact fix — it transforms unreadable truncated text into a clean, professional layout

TASK 4  Fix MCQ Layout in jsPDF Fallback Paths  ·  90 mins  ·  CRITICAL
📄 professionalPDF.ts + generator.ts
  1.  In professionalPDF.ts: replace the 6-column horizontal MCQ table with a 2-row-per-question layout.
  2.  New column widths for jsPDF: [8, CONTENT_WIDTH] for row 1 (Q# + question). For row 2: 4 equal cells of (CONTENT_WIDTH / 4) each.
  3.  Remove all truncation: delete the truncatedQ and truncatedOpt substring calls entirely.
  4.  Use doc.splitTextToSize() for question text to wrap it across multiple lines if needed, and increase row height dynamically.
  5.  In generator.ts addMCQSection(): same redesign — remove the 6-column table, implement 2-row layout.
  6.  Remove truncateText(cleanLatex(opts[3]), 7) — this is the line that caps options at 7 characters.
  7.  Set minimum row height for the options row to 8mm and question row to dynamic based on text wrap count.
  8.  Test: a paper with 10 MCQs should still fit nicely on one page (2 rows per question = 20 rows ≈ 160mm, well within A4).


SPRINT 3  Unify Templates — 2 hours  ·  One template to rule them all

TASK 5  Migrate Android Path to Use htmlTemplate.ts (Delete htmlGenerator.ts)  ·  45 mins  ·  HIGH
📄 download.ts + htmlGenerator.ts
  1.  Open download.ts — find the import: import { generatePaperHTML, generatePDFFilename } from "./htmlGenerator".
  2.  Replace with: import { generateHTMLTemplate, type PaperData } from "./htmlTemplate".
  3.  Update the downloadPDFAndroid() call: replace generatePaperHTML(config, mcqs, shorts, longs) with generateHTMLTemplate(paperData).
  4.  Map the settings object to match the PaperData interface that generateHTMLTemplate expects (instituteName, logoUrl, date, etc.).
  5.  Test on Android: generate a paper via WebView — it should now look identical to the Vercel Puppeteer output.
  6.  After confirming the Android path works with the new template, delete htmlGenerator.ts.
  7.  Run TypeScript build (npx tsc --noEmit) to confirm no import errors.
📌 After this task: both Vercel Puppeteer AND Android WebView use the same template → identical papers on every platform

TASK 6  Inline KaTeX to Eliminate CDN Dependency  ·  60 mins  ·  HIGH
📄 htmlTemplate.ts + puppeteerPDF.ts
  1.  The katex package is already installed in node_modules. Find the dist files: node_modules/katex/dist/katex.min.js and katex.min.css.
  2.  Create a build script or copy the files to public/lib/katex/ so they are served by Next.js.
  3.  In htmlTemplate.ts: replace the CDN links with the local paths:  — Replace cdn.jsdelivr.net URLs with /lib/katex/katex.min.css and /lib/katex/katex.min.js
  4.  For Puppeteer: since it runs server-side, read the katex files directly with fs.readFileSync() and inject them as inline <style> and <script> tags in the HTML string.  — This completely eliminates the external network call from Puppeteer
  5.  In puppeteerPDF.ts: change waitUntil from "networkidle2" to "domcontentloaded" — no more waiting for CDN.
  6.  Remove the 500ms setTimeout delay.
  7.  For Android WebView: the local /lib/katex paths will be served from the Capacitor web assets — should work automatically.
  8.  Measure: time the PDF generation before and after. Expected improvement: 3–8 seconds faster cold starts on Vercel.


SPRINT 4  Polish & Reliability — 2 hours  ·  Logo fix, page breaks, watermark

TASK 7  Fix Logo Format Auto-Detection  ·  20 mins  ·  HIGH
📄 professionalPDF.ts + generator.ts
  1.  In professionalPDF.ts find: pdf.addImage(... "PNG" ...).
  2.  Before the addImage call, add: const imgFmt = /data:image\/(jpeg|jpg)/i.test(logoBase64) ? "JPEG" : "PNG"
  3.  Change the addImage call to use imgFmt instead of the hardcoded "PNG".
  4.  Wrap the entire logo block in try/catch: if addImage throws, log "Logo render failed — skipping" and continue.
  5.  Apply the same fix to generator.ts drawLogo() function.
  6.  Test: upload a JPEG logo, generate a paper. The logo should appear in the PDF.

TASK 8  Fix Page Break Logic in generator.ts  ·  30 mins  ·  MEDIUM
📄 generator.ts
  1.  Find checkAndAddPage() in generator.ts.
  2.  Remove the "50% rule" condition: delete the line checking if remainingSpace < pageHeight * 0.5.
  3.  Keep only: if (remainingSpace < requiredSpace) { pdf.addPage(); return MARGIN_TOP; }
  4.  In addShortQuestions(): update the requiredSpace to 35 (mm) — enough for section header + first question.
  5.  Test: generate a paper with 15 MCQs + 8 short questions. It should fit on 2 pages.

TASK 9  Watermark Consistency + Exam Type in Header  ·  30 mins  ·  MEDIUM
📄 htmlTemplate.ts + professionalPDF.ts
  1.  The watermark text in htmlTemplate.ts says "PaperPress App by Hamza Khan. - Email: paperpressapp@gmail.com".
  2.  The watermark in htmlGenerator.ts says "PaperPress App by Hamza Khan - Phone: 03007172656."
  3.  Decide on ONE consistent watermark text and apply it to ALL templates and jsPDF generators.
  4.  Add the examType field to the paper header. Currently it is stored in PaperSettings but not shown in the htmlTemplate.ts output. Add it between the subject line and the Time/Marks/Date row.
  5.  In professionalPDF.ts: examType is already rendered (as customSubHeader or examType). Verify it shows in the output.


4.  The Unified PDF Architecture After All Fixes
After completing all 9 tasks, both PDF paths will converge on the same template, the same marks logic, and the same MCQ layout.

	Vercel (Online)	Android (Offline/Online)
HTML Template	✓ htmlTemplate.ts	✓ htmlTemplate.ts (same)
KaTeX Math	✓ Inlined — always works	✓ Inlined — always works
MCQ Layout	✓ 2-row vertical, full text	✓ 2-row vertical, full text
Total Marks	✓ QUESTION_MARKS constants	✓ QUESTION_MARKS constants
Short Q Marks	✓ [5] per question	✓ [5] per question
Logo Format	✓ Auto JPEG/PNG detect	✓ Auto JPEG/PNG detect
Generation Speed	✓ ~10–15s (no CDN wait)	✓ ~2–4s (local WebView)


PDF Generation Fix Plan  ·  9 tasks  ·  ~3 working days  ·  Zero architecture changes required
Focus on this sprint first. Every other improvement in the app is secondary to getting the core output right.