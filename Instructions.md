# PaperPress — Agent Instructions: PDF Verification & Bug Fixes
### Read Every Word. Work Sequentially. Never Skip a Step.

---

## BEFORE YOU START — UNDERSTAND THE ARCHITECTURE

The app generates PDFs through **4 different paths**. You must understand all 4 because some are broken:

```
USER TAPS "DOWNLOAD PDF"
         │
         ▼
 Is Android APK? (Capacitor.isNativePlatform())
         │
    YES ─┤─ NO ──────────────────────────────────────────────────────────────►
         │                                                                    │
         ▼                                                                    ▼
  PATH 1: PDFPrinterPlugin.java                                     PATH 4: Vercel Puppeteer API
  (Android WebView → PrintManager)                                  (Chrome renders HTML → PDF)
  generateHTMLTemplate() runs CLIENT SIDE                           generateHTMLTemplate() runs SERVER SIDE
  KaTeX CSS/JS loaded from ???                                       KaTeX CSS/JS inlined from /public/lib/katex/
  PDF saved to Documents/PaperPress/                                 PDF returned as binary to browser
  CURRENTLY BROKEN — see Issue #1, #2, #3                           Works correctly ✓
         │
    FAILS ↓
  PATH 2: Android Print Dialog (fallback)
  Same WebView, user taps "Save as PDF"
  Same KaTeX problem
         │
    FAILS ↓
  PATH 3: jsPDF (last resort)
  No HTML rendering — programmatic drawing
  Text truncated at 75 chars — see Issue #4
  Watermark has developer name — see Issue #5
  Different layout from PATH 1/4 — INCONSISTENT
```

**The core problem:** On Android APK, the PDF the user gets looks COMPLETELY DIFFERENT from what Puppeteer generates on Vercel. This is the main thing to fix.

---

## PART 1 — CRITICAL BUILD BLOCKER (Fix This First or Nothing Works)

### Issue #1 — next.config.ts Missing `output: 'export'` — APK Shows Blank Screen

**What is broken:**  
`capacitor.config.ts` has `webDir: 'out'`. This means Capacitor expects a static HTML export in the `out/` directory. However, `next.config.ts` has NO `output: 'export'` setting. When `npm run build:android` runs, it calls `next build` with `CAPACITOR_BUILD=1` environment variable — but `next.config.ts` never reads that variable. So Next.js does a normal server build, does NOT create `out/`, and the Capacitor sync has nothing to copy into the APK. **The APK loads a blank white screen.**

**File to edit:** `next.config.ts`

**Current code:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Next.js build - API routes work normally
  // For Capacitor, we'll use a custom build process
  reactStrictMode: true,
};

export default nextConfig;
```

**Replace with:**
```typescript
import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isCapacitorBuild && {
    output: 'export',
    // API routes don't work in static export — Android uses native PDF or live Vercel API
    // Images need unoptimized for static export
    images: {
      unoptimized: true,
    },
  }),
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
};

export default nextConfig;
```

**Verify:** After making this change, run `CAPACITOR_BUILD=1 next build` (or `npm run build:android`) and confirm the `out/` directory is created with `index.html` inside it.

---

## PART 2 — PDF QUALITY ON ANDROID (The Core Problem)

### Issue #2 — KaTeX Math Formulas Fail Offline in Android WebView

**What is broken:**  
The PDF generation on Android (PATH 1 & 2) works like this:

1. `download.ts` calls `generateHTMLTemplate(paperData)` — this runs **inside the browser/WebView context** (client side)
2. `patternTemplate.ts` calls `getKaTeXCSSTag()` and `generateKaTeXScript()` from `modules.ts`
3. `modules.ts` has this logic:
   ```typescript
   function getKaTeXJS(): string {
     if (typeof window !== 'undefined') return ''; // ← BROWSER: returns empty string!
     // ... reads from filesystem (server only)
   }
   ```
4. Since this runs in a browser context (`window` exists), `getKaTeXJS()` returns `''`
5. So `generateKaTeXScript()` outputs a **CDN link**: `<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>`
6. The Java plugin loads the HTML with base URL `file:///android_asset/public/`
7. If the device is **offline**, the CDN link fails → KaTeX never runs → **all math formulas show as raw LaTeX text like `$\frac{mv^2}{r}$` instead of rendered equations**

The KaTeX files exist at `public/lib/katex/katex.min.js` and `public/lib/katex/katex.min.css`. When synced to Android, they are at `file:///android_asset/public/lib/katex/katex.min.js`. This path works with the base URL — we just need to use it.

**File to edit:** `src/lib/pdf/modules.ts`

**Find the `generateKaTeXScript()` function (around line 546):**
```typescript
export function generateKaTeXScript(): string {
  const katexJS = getKaTeXJS();
  const katexJSTag = katexJS
    ? `<script>${katexJS}<\/script>`
    : `<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>`;
  // ...
}
```

**Replace the entire `generateKaTeXScript()` function with:**
```typescript
export function generateKaTeXScript(): string {
  // On server (Puppeteer on Vercel): inline the full KaTeX JS for maximum reliability
  // On client (Android WebView): use relative path that resolves via base URL file:///android_asset/public/
  // The Android Java plugin sets base URL to file:///android_asset/public/
  // so "lib/katex/katex.min.js" resolves to the bundled file — works offline
  const katexJS = getKaTeXJS(); // returns '' in browser, full JS on server
  
  const katexJSTag = katexJS
    ? `<script>${katexJS}<\/script>`
    : `<script src="lib/katex/katex.min.js" onerror="(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';document.head.appendChild(s);}())"><\/script>`;

  return `
    ${katexJSTag}
    <script>
      (function() {
        function renderMath() {
          if (typeof katex === 'undefined') {
            // CDN also failed — show plain text gracefully
            console.warn('[KaTeX] Not loaded, math will show as plain text');
            return;
          }
          var els = document.querySelectorAll('[data-katex]');
          els.forEach(function(el) {
            var latex = el.getAttribute('data-katex');
            if (!latex || latex.trim() === '') return;
            var isDisplay = el.classList.contains('math-display');
            try {
              katex.render(latex, el, {
                displayMode: isDisplay,
                throwOnError: false,
                output: 'html',
                strict: false,
                trust: true,
              });
            } catch(e) {
              el.innerHTML = '<span class="math-error">[Math: ' + latex + ']</span>';
            }
          });
          window.__katexRendered = true;
        }
        if (document.readyState === 'complete') { renderMath(); }
        else { window.addEventListener('load', renderMath); }
        // Also try after a short delay for slow WebViews
        setTimeout(renderMath, 500);
      })();
    <\/script>`;
}
```

**Find `getKaTeXCSSTag()` function (around line 586):**
```typescript
export function getKaTeXCSSTag(): string {
  const katexCSS = getKaTeXCSS();
  return katexCSS
    ? `<style>${katexCSS}</style>`
    : `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">`;
}
```

**Replace with:**
```typescript
export function getKaTeXCSSTag(): string {
  const katexCSS = getKaTeXCSS(); // returns '' in browser, full CSS on server
  return katexCSS
    ? `<style>${katexCSS}</style>`
    // Relative path works with Android base URL file:///android_asset/public/
    // CDN onerror fallback for environments without the local file
    : `<link rel="stylesheet" href="lib/katex/katex.min.css" onerror="this.onerror=null;this.href='https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'">`;
}
```

**Verify:** After fixing, generate a paper with a math question (e.g. Physics with a formula). On Android: go offline (enable airplane mode), download PDF — the math formula must render correctly, not show raw `$...$` text.

---

### Issue #3 — Total Marks in PDF Header is Wrong (Shows Pattern Max, Not Actual Marks)

**What is broken:**  
`patternTemplate.ts` line 44: `const totalMarks = pattern.totalMarks;`

The `pattern.totalMarks` is a hardcoded value from `patterns.ts` (e.g., 60 for Matric Science, 75 for Intermediate Physics). This is the MAXIMUM marks for a full Punjab Board exam paper.

But a teacher may select only 5 MCQs + 3 Short questions = 8 marks. The PDF header still shows "Total Marks: **60**" — which is completely wrong. This is a factual error on a printed exam paper.

Additionally, the section bar marks formulas (e.g. "Q2: SHORT QUESTIONS — Attempt any 5 (5 × 2 = 10)") are hardcoded from the pattern, not calculated from actual selected questions.

**Files to edit:** `src/lib/pdf/patternTemplate.ts` AND `src/lib/pdf/htmlTemplate.ts`

**Step 1 — Add `customMarks` and `attemptRules` to `PatternTemplateInput`:**

In `patternTemplate.ts`, find the `PatternTemplateInput` interface:
```typescript
export interface PatternTemplateInput {
  instituteName: string;
  // ... existing fields ...
  customHeader?: string;
  customSubHeader?: string;
}
```

Add these two fields:
```typescript
export interface PatternTemplateInput {
  instituteName: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  logoUrl?: string | null;
  showLogo?: boolean;
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
  // ADD THESE:
  customMarks?: {
    mcq?: number;
    short?: number;
    long?: number;
  };
  attemptRules?: {
    shortAttempt?: number;
    longAttempt?: number;
  };
}
```

**Step 2 — Calculate actual marks in `generatePatternHTML()`:**

Find the `generatePatternHTML()` function. After the pattern is resolved, replace:
```typescript
const totalMarks  = pattern.totalMarks;
```

With:
```typescript
// Calculate ACTUAL marks based on selected questions and custom marks per question
// Fall back to pattern.totalMarks only if no questions selected
const mcqMark = input.customMarks?.mcq ?? 1;
const shortMark = input.customMarks?.short ?? 2;
const longMark = input.customMarks?.long ?? 9;

const actualMarks =
  input.mcqs.length > 0 || input.shorts.length > 0 || input.longs.length > 0
    ? (input.mcqs.length * mcqMark) +
      (input.shorts.length * shortMark) +
      (input.longs.length * longMark)
    : pattern.totalMarks;

const totalMarks = actualMarks;
```

**Step 3 — Fix section bar marks formula to use actual counts:**

In `renderShorts()` function, the section bar shows `section.marksFormula` from the hardcoded pattern (e.g. "5 × 2 = 10"). This must be dynamic.

Find `renderShorts()`:
```typescript
function renderShorts(section: QuestionSection, questions: ShortQuestion[]): string {
  if (!questions.length) return '';
  // ...
  return `
  <div data-section="short-${section.qNumber}">
    ${renderSectionBar(section)}
    // ...
  `;
}
```

Replace with a version that overrides the section bar for actual question count:
```typescript
function renderShorts(
  section: QuestionSection,
  questions: ShortQuestion[],
  customMark?: number
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
  <div data-section="short-${section.qNumber}">
    ${renderSectionBar(dynamicSection)}
    <div class="pp-shorts">${rows}</div>
  </div>`;
}
```

Do the same for `renderLongs()` — make it accept `customMark` and compute dynamic formula:
```typescript
function renderLongs(
  section: QuestionSection,
  questions: LongQuestion[],
  startQNum: number,
  customMark?: number
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

  // ... rest of existing renderLongs body unchanged, just use dynamicSection in renderSectionBar ...
```

**Step 4 — Pass customMarks from generatePatternHTML() to render functions:**

In `generatePatternHTML()`, when building section HTML, pass `input.customMarks`:
```typescript
const sectionsHTML = pattern.sections.map(section => {
  switch (section.type) {
    case 'mcq':
      return renderMCQ(section, input.mcqs);
    case 'short': {
      const dist = shortDist.find(d => d.section.qNumber === section.qNumber);
      return renderShorts(section, dist?.questions || [], input.customMarks?.short);  // ← pass custom mark
    }
    case 'long': {
      const dist = longDist.find(d => d.section.qNumber === section.qNumber);
      return renderLongs(section, dist?.questions || [], section.qNumber, input.customMarks?.long);  // ← pass custom mark
    }
    // ...
  }
}).join('\n');
```

**Step 5 — Pass `customMarks` and `attemptRules` from `htmlTemplate.ts` to `patternTemplate.ts`:**

In `htmlTemplate.ts`, find `generateHTMLTemplate()`:
```typescript
export function generateHTMLTemplate(data: PaperData): string {
  const input: PatternTemplateInput = {
    instituteName:    data.instituteName,
    // ... existing fields ...
    instituteWebsite: data.instituteWebsite,
  };
  return generatePatternHTML(input);
}
```

Add the missing fields:
```typescript
export function generateHTMLTemplate(data: PaperData): string {
  const input: PatternTemplateInput = {
    instituteName:    data.instituteName,
    logoUrl:          data.logoUrl,
    showLogo:         data.showLogo,
    classId:          data.classId,
    subject:          data.subject,
    examType:         data.examType,
    date:             data.date,
    timeAllowed:      data.timeAllowed,
    mcqs:             data.mcqs,
    shorts:           data.shorts,
    longs:            data.longs,
    customHeader:     data.customHeader,
    customSubHeader:  data.customSubHeader,
    syllabus:         data.syllabus,
    instituteAddress: data.instituteAddress,
    instituteEmail:   data.instituteEmail,
    institutePhone:   data.institutePhone,
    instituteWebsite: data.instituteWebsite,
    customMarks:      data.customMarks,       // ← ADD THIS
    attemptRules:     data.attemptRules,      // ← ADD THIS
  };
  return generatePatternHTML(input);
}
```

**Verify:** Create a paper with 5 MCQs + 3 Short Questions. Set custom Short marks to 3. The PDF header must show "Total Marks: **14**" (5×1 + 3×3), NOT "60". The Short Questions section bar must show "Attempt any 3 (3 × 3 = 9)".

---

### Issue #4 — jsPDF Fallback (Last Resort) Still Truncates Questions

**What is broken:**  
In `puppeteerPDF.ts`, the `generatePDFWithJsPDF()` function (PATH 3, last resort fallback) still has:

- Line 212: `cleanLatex(sq.questionText).substring(0, 75)` — short questions cut at 75 chars
- Line 231: `cleanLatex(lq.questionText).substring(0, 70)` — long questions cut at 70 chars

A question like "A copper wire of length 2m and cross-sectional area 4×10⁻⁶ m² has a resistance of 0.042Ω. Calculate the resistivity" gets cut to "A copper wire of length 2m and cross-sectional area 4×1..." — factually incorrect on a printed exam.

**File to edit:** `src/lib/pdf/puppeteerPDF.ts`

**Find in `generatePDFWithJsPDF()` — the shorts section (around line 210):**
```typescript
paperData.shorts.forEach((sq, idx) => {
  if (yPos > 270) { doc.addPage(); yPos = margin; }
  doc.text(`${idx + 1}. ${cleanLatex(sq.questionText).substring(0, 75)}`, margin, yPos);
  doc.setFontSize(7);
  doc.text(`[${QUESTION_MARKS.short}]`, pageWidth - margin - 5, yPos);
  doc.setFontSize(9);
  yPos += 5;
});
```

**Replace with:**
```typescript
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
```

**Find the longs section (around line 229):**
```typescript
paperData.longs.forEach((lq, idx) => {
  if (yPos > 270) { doc.addPage(); yPos = margin; }
  doc.text(`Q${idx + 1}. ${cleanLatex(lq.questionText).substring(0, 70)}`, margin, yPos);
  doc.setFontSize(7);
  doc.text(`[${QUESTION_MARKS.long}]`, pageWidth - margin - 5, yPos);
  doc.setFontSize(9);
  yPos += 6;
});
```

**Replace with:**
```typescript
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
```

---

### Issue #5 — Developer Name in jsPDF Watermark

**What is broken:**  
In `puppeteerPDF.ts`, the `generatePDFWithJsPDF()` function adds a footer watermark at line 242:
```typescript
doc.text('PaperPress App by Hamza Khan. - Email: paperpressapp@gmail.com', ...);
```

This is a developer credit in a commercial app's fallback PDF. It should match the professional footer.

**File to edit:** `src/lib/pdf/puppeteerPDF.ts`

**Find line ~242:**
```typescript
doc.text('PaperPress App by Hamza Khan. - Email: paperpressapp@gmail.com', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
```

**Replace with:**
```typescript
doc.text('PaperPress — paperpressapp@gmail.com', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
```

---

### Issue #6 — `position: fixed` Footer Renders Wrong in Android WebView Print

**What is broken:**  
`patternCSS.ts` has:
```css
.pp-footer {
  position: fixed;
  bottom: 0;
  /* ... */
}
```

In **Puppeteer** (server-side), `position: fixed` repeats the element on every page — this is correct behavior, matching how Chrome renders it.

In **Android WebView PrintManager** (native path), `position: fixed` renders the footer only on the LAST page, overlapping the last line of content. On long papers (3+ pages), pages 1 and 2 have no footer at all.

**File to edit:** `src/lib/pdf/patternCSS.ts`

**Find the `.pp-footer` block:**
```css
.pp-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 6.5pt;
  color: #666;
  padding: 2pt 0;
  border-top: 0.25pt solid #ccc;
  background: #fff;
}
```

**Replace with:**
```css
.pp-footer {
  /* Use running footer via @page margin box for cross-environment consistency */
  display: block;
  text-align: center;
  font-size: 6.5pt;
  color: #666;
  padding: 2pt 0;
  border-top: 0.25pt solid #ccc;
  margin-top: 8pt;
}

/* Running footer for Puppeteer (Chrome) */
@page {
  @bottom-center {
    content: "PaperPress \2014 paperpressapp@gmail.com";
    font-size: 6.5pt;
    color: #666;
  }
}
```

Also add at the end of the `@media print` block:
```css
@media print {
  /* existing rules ... */
  
  /* Ensure footer element doesn't show in print — @page handles it */
  .pp-footer { display: none; }
}
```

**Note:** `@page @bottom-center` works in Puppeteer/Chrome. In Android WebView, it may not render — that's acceptable. The main content will not be obscured.

---

### Issue #7 — `isFirstLong = true` Hardcoded — Duplicate "SUBJECTIVE SECTION" Banner

**What is broken:**  
In `patternTemplate.ts`, `renderLongs()` has:
```typescript
const isFirstLong = true;  // ← hardcoded! Never false.
return `
  ${isFirstLong ? '<div class="pp-divider">SUBJECTIVE SECTION</div>' : ''}
  ...
```

The `.pp-divider` has `page-break-before: always`. If there are multiple long question sections (e.g. Intermediate Physics has Q5 and Q6 as separate long sections), EVERY long section gets a forced page break AND a "SUBJECTIVE SECTION" banner. This means:
- Unnecessary blank pages between long question sections
- Multiple "SUBJECTIVE SECTION" headings on the paper
- Extra pages wasted

**File to edit:** `src/lib/pdf/patternTemplate.ts`

**Find `renderLongs()` and add a parameter:**
```typescript
function renderLongs(
  section: QuestionSection,
  questions: LongQuestion[],
  startQNum: number,
  customMark?: number,     // already added in Issue #3
  isFirstLongSection: boolean = true   // ← ADD THIS PARAMETER
): string {
```

**Change the hardcoded line:**
```typescript
// REMOVE THIS:
const isFirstLong = true;

// The banner is already controlled by the parameter
```

**Update the return statement to use the parameter:**
```typescript
return `
  ${isFirstLongSection ? '<div class="pp-divider">SUBJECTIVE SECTION</div>' : ''}
  <div data-section="long">
    ${renderSectionBar(dynamicSection || section)}
    <div class="pp-longs">${items}</div>
  </div>`;
```

**In `generatePatternHTML()`, track whether it's the first long section:**
```typescript
let longSectionIndex = 0;

const sectionsHTML = pattern.sections.map(section => {
  switch (section.type) {
    // ...
    case 'long': {
      const dist = longDist.find(d => d.section.qNumber === section.qNumber);
      const isFirst = longSectionIndex === 0;
      longSectionIndex++;
      return renderLongs(section, dist?.questions || [], section.qNumber, input.customMarks?.long, isFirst);
    }
    // ...
  }
}).join('\n');
```

---

### Issue #8 — API Security: PDF API Unprotected When Env Var Not Set

**What is broken:**  
In `src/app/api/generate-pdf/route.ts`:
```typescript
if (validKey && apiKey !== validKey) {
```

When `PDF_API_KEY` environment variable is not set (which is the default on a fresh Vercel deployment), `validKey` is `undefined`. `undefined && ...` evaluates to `false`. The block is skipped. Anyone on the internet can POST to your API and consume your Puppeteer quota for free.

**File to edit:** `src/app/api/generate-pdf/route.ts`

**Find:**
```typescript
if (validKey && apiKey !== validKey) {
```

**Replace with:**
```typescript
if (!validKey || apiKey !== validKey) {
```

This means: if no env var is set, ALL requests are rejected until you configure the key. Set `PDF_API_KEY` in your Vercel environment variables dashboard, and set `NEXT_PUBLIC_PDF_API_KEY` to the same value so the app can send it.

**Also apply the same fix to** `src/app/api/generate-docx/route.ts` if it has an API key check. If it does NOT have any API key check, add one:

In `generate-docx/route.ts`, at the start of the POST handler, add:
```typescript
export async function POST(request: NextRequest) {
  // API key protection
  const apiKey = request.headers.get('x-api-key');
  const validKey = process.env.PDF_API_KEY; // reuse same key
  if (!validKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
```

---

## PART 3 — ANDROID SPECIFIC BUGS

### Issue #9 — Export Function Crashes on Android (Capacitor Namespace Bug)

**What is broken:**  
In `src/app/(main)/settings/page.tsx`, around line 170:
```typescript
const Capacitor = await import('@capacitor/core');
if (Capacitor.Capacitor.isNativePlatform()) {   // ← double namespace: Capacitor.Capacitor
```

The dynamic import `await import('@capacitor/core')` returns the module object, so `Capacitor` variable here is the MODULE, not the Capacitor object. Calling `.Capacitor.isNativePlatform()` accesses a property called "Capacitor" on the module, then tries to call a method on it. This throws `TypeError: Cannot read properties of undefined`. The export function crashes before writing any file.

**File to edit:** `src/app/(main)/settings/page.tsx`

**Find (around line 168-171):**
```typescript
const Capacitor = await import('@capacitor/core');
if (Capacitor.Capacitor.isNativePlatform()) {
```

**Replace with:**
```typescript
const { Capacitor } = await import('@capacitor/core');  // ← destructure correctly
if (Capacitor.isNativePlatform()) {                      // ← now correct
```

---

### Issue #10 — Premium Code Hash Array Contains Fake Placeholders — No Code Works

**What is broken:**  
`src/lib/premium/index.ts` has:
```typescript
const VALID_CODE_HASHES = [
  '1a2b3c4d',
  '5e6f7g8h',
  '9i0j1k2l',
  '3m4n5o6p',
];
```

These are placeholder values, not real hashes. The `simpleHash('PPBHK656' + 'paperpress2024secure')` = `'530dd60'` which is NOT in this array. **No premium code on earth activates premium right now.** The premium modal accepts the code but secretly does nothing — the user gets no feedback that it failed.

**File to edit:** `src/lib/premium/index.ts`

**Step 1 — Generate real hashes for your actual premium codes.**

Run this in any browser console or Node.js to get the hash for each real code:
```javascript
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Generate hash for each code you want to sell/distribute:
const salt = 'paperpress2024secure';
console.log(simpleHash('PPBHK656' + salt)); // → '530dd60'
console.log(simpleHash('YOURCODE2' + salt)); // → generate more
```

**Step 2 — Replace the fake array with real hashes:**
```typescript
const VALID_CODE_HASHES: string[] = [
  '530dd60',    // PPBHK656
  // Add hashes for all other valid codes here
  // Run: simpleHash('YOURCODE' + 'paperpress2024secure') to get each hash
];
```

**Step 3 — Fix the length check to allow codes shorter or longer than 8:**

Current code: `if (normalizedCode.length !== 8) return false;`

This rigidly rejects any code that isn't exactly 8 characters. Change to:
```typescript
if (normalizedCode.length < 6 || normalizedCode.length > 20) return false;
```

**Step 4 — Make the premium modal show proper error when code fails:**

In `src/components/premium/PremiumModal.tsx`, find where it handles validation result. Make sure the error path shows a clear UI message, not just a toast that disappears.

---

### Issue #11 — `selectAllChapters([])` in Bottom Navigation Clears Chapters Instead of Selecting

**What is broken:**  
In `src/components/layout/BottomNavigation.tsx`, `handleSelectSubject()` calls `selectAllChapters([])`. This is supposed to reset state when a new subject is picked, but `selectAllChapters` in the store simply sets `selectedChapters` to whatever array is passed. Passing `[]` sets selected chapters to empty — which is what happens when you tap the FAB to create a paper. The chapter selection page then starts completely empty, no chapters pre-selected.

**File to edit:** `src/components/layout/BottomNavigation.tsx`

**Find `handleSelectSubject` (around line 77):**
```typescript
const handleSelectSubject = useCallback((subjectId: string) => {
    setSubject(subjectId as any);
    selectAllChapters([]);
    setShowCreatePopup(false);
    setShowSubjectSelector(false);
    const classId = selectedClass || "9th";
    router.push(`/chapters/${classId}/${subjectId.toLowerCase()}`);
  }, [selectedClass, setSubject, selectAllChapters, router]);
```

**Replace with:**
```typescript
const handleSelectSubject = useCallback((subjectId: string) => {
    setSubject(subjectId as any);
    // Do NOT pre-clear chapters here — ChaptersClient.tsx manages chapter selection 
    // when the page loads with a new subject. Clearing here would wipe any
    // previously selected chapters for this same subject.
    setShowCreatePopup(false);
    setShowSubjectSelector(false);
    const classId = selectedClass || "9th";
    router.push(`/chapters/${classId}/${subjectId.toLowerCase()}`);
  }, [selectedClass, setSubject, router]);
```

Also remove `selectAllChapters` from the destructuring at the top of the component since it's no longer used there:
```typescript
// Find this line and remove selectAllChapters from it:
const { selectedClass, setClass, setSubject, selectAllChapters } = usePaperStore();
// Change to:
const { selectedClass, setClass, setSubject } = usePaperStore();
```

---

## PART 4 — LOGICAL ERRORS AND UX FLAWS

### Issue #12 — Android Email Share Still Uses `window.location.href` in ActionButtons.tsx

**What is broken:**  
`src/components/preview/ActionButtons.tsx` line ~100 has:
```typescript
window.location.href = `mailto:?subject=${subject}`;
```

On Android WebView, `window.location.href = 'mailto:...'` navigates the WebView to a mailto URL. In Capacitor, this doesn't open the mail app — it either does nothing or corrupts the WebView navigation. This component is apparently separate from `PaperPreviewContent.tsx` which was already fixed.

**File to edit:** `src/components/preview/ActionButtons.tsx`

**Find the email sharing handler. Replace `window.location.href = ...` with:**
```typescript
import { Capacitor } from '@capacitor/core';

// In the email handler:
const handleEmailShare = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: subject || 'Exam Paper',
        text: body || subject || '',
        dialogTitle: 'Share Paper via Email',
      });
    } catch {
      // User cancelled share sheet
    }
  } else {
    window.location.href = `mailto:?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
  }
};
```

---

### Issue #13 — Paper Preview Page: `attemptRules` Not Sent to PDF

**What is broken:**  
In `PaperPreviewContent.tsx`, `getSettings()` builds the settings object but does NOT include `attemptRules`:

```typescript
return {
  instituteName: paper.instituteName || "Institution",
  date: paper.date,
  // ... many fields ...
  customMarks: paper.customMarks || { mcq: 1, short: 5, long: 10 },
  // ← attemptRules is MISSING
};
```

The `GeneratedPaper` type has `attemptRules` — the data is saved. But it's never passed to the PDF, so the PDF always uses pattern defaults for attempt counts.

**File to edit:** `src/app/paper/PaperPreviewContent.tsx`

**Find `getSettings()` and add `attemptRules`:**
```typescript
const getSettings = useCallback(() => {
  if (!paper) return null;
  return {
    instituteName: paper.instituteName || "Institution",
    date: paper.date,
    timeAllowed: paper.timeAllowed,
    classId: paper.classId,
    subject: paper.subject,
    instituteLogo: paper.instituteLogo || null,
    customHeader: paper.customHeader || '',
    customSubHeader: paper.customSubHeader || '',
    showLogo: paper.showLogo && !!paper.instituteLogo,
    isPremium: isPremium,
    includeAnswerSheet: true,
    customMarks: paper.customMarks || { mcq: 1, short: 2, long: 9 },
    attemptRules: paper.settings?.attemptRules || undefined,   // ← ADD THIS
    syllabus: paper.syllabus || '',
    instituteAddress: paper.instituteAddress || '',
    instituteEmail: paper.instituteEmail || '',
    institutePhone: paper.institutePhone || '',
    instituteWebsite: paper.instituteWebsite || '',
  };
}, [paper, isPremium]);
```

---

### Issue #14 — `includeAnswerSheet: true` is Hardcoded in getSettings()

**What is broken:**  
`getSettings()` always sends `includeAnswerSheet: true`. This means EVERY paper re-download includes a bubble sheet regardless of whether the teacher toggled it off. The saved paper has this setting but it's ignored.

**File to edit:** `src/app/paper/PaperPreviewContent.tsx`

In `getSettings()`, change:
```typescript
includeAnswerSheet: true,
```
To:
```typescript
includeAnswerSheet: paper.includeAnswerSheet ?? true,
```

---

### Issue #15 — `htmlGenerator.ts` is Dead Code — Delete It

**What is broken:**  
`src/lib/pdf/htmlGenerator.ts` is 17KB of dead code. It's a complete duplicate HTML paper generator that is no longer used anywhere in the main app (only imported in a test file). It has its own `calculateMarks()` function that uses hardcoded multipliers. If someone imports it by mistake, it produces inconsistent output.

**Action:**

1. Delete the file: `src/lib/pdf/htmlGenerator.ts`

2. Fix the test file `src/lib/engine/pdf.test.ts`:
   ```typescript
   // REMOVE this import:
   import { generatePaperHTML, generatePDFFilename, PDFSettings } from '../pdf/htmlGenerator';
   
   // REPLACE with:
   import { generateHTMLTemplate, type PaperData } from '../pdf/htmlTemplate';
   ```
   Then update the test to use `generateHTMLTemplate` with a `PaperData` shaped object instead of `generatePaperHTML`.

---

### Issue #16 — `nativePDF.ts` and `printer.ts` are Orphaned Duplicate Files

**What is broken:**  
The files `src/lib/pdf/nativePDF.ts` and `src/lib/pdf/printer.ts` each define their own `PDFSettings` interface and `generateHTMLTemplate` wrappers. They are not imported by `download.ts` or any active code path. They define a different (incomplete) `PDFSettings` interface missing `customMarks`, `attemptRules`, `syllabus`, etc.

If someone accidentally imports these by mistake in a future change, papers will be generated with missing fields.

**Action:** Delete both files:
- `src/lib/pdf/nativePDF.ts`
- `src/lib/pdf/printer.ts`

---

### Issue #17 — `SUBJECTIVE SECTION` Divider Shows Even When There Are No Longs

**What is broken:**  
`renderLongs()` shows "SUBJECTIVE SECTION" divider when it renders long questions. But the "SUBJECTIVE SECTION" label should separate the Objective (MCQ) section from the Subjective (Short + Long) section. If a paper has short questions but no long questions, the subjective section has no divider at all. If it has long questions only (no shorts), it works. But if there are both shorts AND longs, the divider should appear before the FIRST subjective section (whether short or long), not always before longs.

**File to edit:** `src/lib/pdf/patternTemplate.ts`

Track which section is the first subjective section and put the divider there:

```typescript
export function generatePatternHTML(input: PatternTemplateInput): string {
  const pattern = resolvePaperPattern(input.classId, input.subject);
  // ... existing setup ...

  // Determine the first subjective section Q number
  const firstSubjectiveQNum = pattern.sections
    .filter(s => s.type === 'short' || s.type === 'long')
    .sort((a, b) => a.qNumber - b.qNumber)[0]?.qNumber ?? -1;

  let longSectionIndex = 0;

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
          isFirstSubjective   // ← pass this
        );
      }

      case 'long': {
        const dist = longDist.find(d => d.section.qNumber === section.qNumber);
        const isFirstSubjective = section.qNumber === firstSubjectiveQNum;
        const isFirstLong = longSectionIndex === 0;
        longSectionIndex++;
        // Only show divider if long comes BEFORE any short (or no shorts exist)
        return renderLongs(
          section,
          dist?.questions || [],
          section.qNumber,
          input.customMarks?.long,
          isFirstSubjective   // ← show divider only for first subjective section
        );
      }
    }
  }).join('\n');
```

Update `renderShorts()` and `renderLongs()` to accept and use `isFirstSubjective`:
```typescript
function renderShorts(
  section: QuestionSection,
  questions: ShortQuestion[],
  customMark?: number,
  isFirstSubjective: boolean = false   // ← new param
): string {
  if (!questions.length) return '';
  // ...
  return `
  ${isFirstSubjective ? '<div class="pp-divider">SUBJECTIVE SECTION</div>' : ''}
  <div data-section="short-${section.qNumber}">
    ${renderSectionBar(dynamicSection)}
    <div class="pp-shorts">${rows}</div>
  </div>`;
}
```

---

## PART 5 — VERIFICATION CHECKLIST

After completing all fixes, the agent **must verify every item below** by reading the code — not by assuming the fix worked.

### PDF Verification Checklist

Go through each item, read the relevant code, and report whether it passes or fails:

```
[ ] 1. next.config.ts reads CAPACITOR_BUILD=1 and sets output:'export'
        → Read next.config.ts and confirm the conditional logic is there

[ ] 2. modules.ts generateKaTeXScript() uses relative path "lib/katex/katex.min.js"
        for the script tag when running in browser context (typeof window !== 'undefined')
        → Read modules.ts and confirm the src is NOT a CDN link

[ ] 3. modules.ts getKaTeXCSSTag() uses relative path "lib/katex/katex.min.css"
        for the link tag when running in browser context
        → Read modules.ts and confirm

[ ] 4. patternTemplate.ts PatternTemplateInput has customMarks and attemptRules fields
        → Read the interface definition

[ ] 5. generatePatternHTML() calculates totalMarks from actual selected questions
        not from pattern.totalMarks
        → Read the totalMarks calculation in generatePatternHTML()

[ ] 6. renderShorts() and renderLongs() accept customMark parameter
        and compute dynamic marksFormula based on actual count and custom mark
        → Read both functions

[ ] 7. htmlTemplate.ts passes customMarks and attemptRules to patternTemplate
        → Read generateHTMLTemplate() and confirm both fields are in the input object

[ ] 8. puppeteerPDF.ts jsPDF fallback uses doc.splitTextToSize() for shorts and longs
        → Read the shorts.forEach and longs.forEach loops, confirm NO .substring() calls

[ ] 9. puppeteerPDF.ts watermark is "PaperPress — paperpressapp@gmail.com"
        NOT "by Hamza Khan"
        → Read the doc.text() watermark line

[ ] 10. patternCSS.ts pp-footer is NOT position:fixed
         → Read the .pp-footer CSS block

[ ] 11. renderLongs() accepts isFirstSubjective parameter
         isFirstLong hardcoded constant is REMOVED
         → Read renderLongs() function signature and body

[ ] 12. generate-pdf/route.ts API key check is "if (!validKey || apiKey !== validKey)"
         → Read the condition on line ~95

[ ] 13. generate-docx/route.ts also has API key protection
         → Read the route handler

[ ] 14. settings/page.tsx uses { Capacitor } destructuring, NOT Capacitor.Capacitor
         → Read line ~170 in the export handler

[ ] 15. premium/index.ts VALID_CODE_HASHES contains real hashes, NOT '1a2b3c4d' etc.
         → Read the array. If still placeholder, flag it for developer to fill in.

[ ] 16. BottomNavigation.tsx handleSelectSubject does NOT call selectAllChapters([])
         → Read the function

[ ] 17. ActionButtons.tsx email share uses Capacitor.isNativePlatform() check
         → Read the email handler

[ ] 18. PaperPreviewContent.tsx getSettings() includes attemptRules from paper
         → Read the return object

[ ] 19. PaperPreviewContent.tsx getSettings() uses paper.includeAnswerSheet
         NOT hardcoded true
         → Read the includeAnswerSheet line

[ ] 20. htmlGenerator.ts file is DELETED (or at minimum not imported by any non-test file)
         → Run: grep -r "htmlGenerator" src/ and confirm only pdf.test.ts imports it (if any)

[ ] 21. nativePDF.ts and printer.ts files are DELETED
         → Run: ls src/lib/pdf/ and confirm they are gone

[ ] 22. generatePatternHTML() tracks firstSubjectiveQNum and passes isFirstSubjective
         to both renderShorts() and renderLongs()
         → Read the sectionsHTML map in generatePatternHTML()
```

### Report Format
After checking all 22 items, output a table:

```
| # | Description | Status | Notes |
|---|-------------|--------|-------|
| 1 | next.config output:export | ✅ PASS | Reads CAPACITOR_BUILD env |
| 2 | KaTeX JS uses relative path | ❌ FAIL | Still shows CDN link |
...
```

If any item is ❌ FAIL, do NOT proceed — fix it first, then re-verify.

---

## IMPORTANT NOTES FOR THE AGENT

1. **Do not fabricate verification results.** Read the actual file content after each change. If you cannot verify a fix because the file is too large, read the specific lines around the change.

2. **The PDFPrinterPlugin.java is in `public/Plan/` — this is a reference only.** The actual Java file must be placed in the Android project at `android/app/src/main/java/com/paperpress/app/PDFPrinterPlugin.java`. Do NOT edit the file in `public/Plan/`. Just note that it exists as the reference and that the developer must copy it to the Android project when they run `npx cap sync android`.

3. **The build will fail until Issue #1 is fixed.** Do not attempt to test PDF generation on Android until `next.config.ts` is correct. The APK will be a blank screen without it.

4. **KaTeX files must be in `public/lib/katex/`.** Verify they exist: `ls public/lib/katex/`. If `katex.min.js` or `katex.min.css` are missing, the PDF will fail offline. They are currently present — do not delete them.

5. **The Java plugin `KATEX_RENDER_DELAY_MS = 2500`.** This means after the HTML loads in the hidden WebView, the plugin waits 2.5 seconds for KaTeX to render math before printing. If KaTeX fails (CDN link, no internet), the plugin prints after 2.5 seconds anyway — math formulas show as raw text. After Issue #2 is fixed, the local KaTeX will load instantly and math will always render correctly offline.

6. **Never modify `patterns.ts` hardcoded section definitions.** The issue is not in the patterns themselves — it's that the template ignores custom marks. Fix the template to compute dynamic marks. The patterns are the Punjab Board standard structure which must remain correct.

7. **Test order for verification:** (1) Check build produces `out/` dir → (2) Check HTML has `lib/katex/katex.min.js` not CDN → (3) Check marks in PDF header match actual questions selected → (4) Check section bars have correct dynamic formula → (5) Check jsPDF fallback shows full text.
