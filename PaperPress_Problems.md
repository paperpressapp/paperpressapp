# PaperPress — Problems for AI (Give One at a Time)
### Ordered by Priority — Critical First

---

## TICKET 1 — PDF Quality on Vercel (Gotenberg Integration)
**Priority: 🔴 CRITICAL — Core product is broken without this**

### Problem
On Vercel, `puppeteer-core` silently fails because Webpack bundles native binaries incorrectly and free plan RAM (1024MB) is insufficient for Chromium. The catch block runs `jsPDF` instead, producing a 31KB ugly text-only PDF instead of the 311KB professional HTML-rendered PDF that works on dev.

### Solution
Replace Puppeteer with Gotenberg (external Chrome service on Railway free tier).

### Files to Change

**1. `src/app/api/generate-pdf/route.ts`**
- Remove: `import { generatePDF } from '@/lib/pdf/puppeteerPDF'`
- Add this function above the POST handler:
```typescript
async function generatePDFWithGotenberg(html: string): Promise<Buffer> {
  const gotenbergUrl = process.env.GOTENBERG_URL;
  if (!gotenbergUrl) throw new Error('GOTENBERG_URL not set');

  const formData = new FormData();
  formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html');

  const response = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(55000),
  });

  if (!response.ok) throw new Error(`Gotenberg error: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
```
- In the POST handler, replace `const pdfBuffer = await generatePDF(paperData)` with:
```typescript
const html = generateHTMLTemplate(paperData);
const pdfBuffer = await generatePDFWithGotenberg(html);
```

**2. `next.config.ts`** — Replace entirely:
```typescript
import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isCapacitorBuild && {
    output: 'export',
    images: { unoptimized: true },
  }),
  experimental: {
    outputFileTracingIncludes: {
      '/api/generate-pdf': ['./public/lib/katex/**/*'],
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
};

export default nextConfig;
```

**3. Run:**
```bash
npm uninstall puppeteer-core @sparticuz/chromium
```

### Environment Variables to Set on Vercel
```
GOTENBERG_URL = https://your-gotenberg-railway-url.up.railway.app
```

### Verify
After deploying, generate a paper and confirm PDF size is 250KB+ and looks identical to dev server output.

---

## TICKET 2 — Android APK PDF Distortion Fix
**Priority: 🔴 CRITICAL — APK PDF looks broken**

### Problem
The Android PDF uses `PDFPrinterPlugin.java` which renders HTML via WebView's PrintManager. The WebView renders at phone screen width (e.g. 400px) instead of A4 width (794px), causing all content to be stretched/distorted in the PDF.

### Solution
Force A4 viewport width in both the HTML template and the Java plugin.

### Files to Change

**1. `src/lib/pdf/patternTemplate.ts`**

Find the HTML return string and add viewport meta tag:
```typescript
return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794, initial-scale=1.0, maximum-scale=1.0">
  <title>...</title>
```

**2. `src/lib/pdf/patternCSS.ts`**

At the very top of the CSS string, add:
```css
html, body {
  width: 794px;
  max-width: 794px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
```

**3. `public/Plan/PDFPrinterPlugin.java`** (copy to android project after sync)

In `createWebView()`, add after `settings.setUseWideViewPort(true)`:
```java
settings.setLoadWithOverviewMode(false);
webView.setInitialScale(100);
// Force A4 viewport
webView.setVisibility(android.view.View.INVISIBLE);
webView.getLayoutParams().width = 794;
```

### Verify
Build APK, generate paper, open PDF — text should not be stretched or cut off, layout should match the web version exactly.

---

## TICKET 3 — KaTeX Math Broken Offline in Android APK
**Priority: 🔴 CRITICAL — Math formulas show as raw text offline**

### Problem
`modules.ts` returns `''` for KaTeX when `typeof window !== 'undefined'` (i.e., in any browser/WebView context). So the HTML sent to the Java plugin contains a CDN link instead of local KaTeX. If the phone is offline, math shows as raw `$\frac{mv^2}{r}$` text on printed papers.

### Solution
Change CDN fallback to relative path. The Java plugin sets base URL to `file:///android_asset/public/` so `lib/katex/katex.min.js` resolves to the bundled file correctly.

### Files to Change

**`src/lib/pdf/modules.ts`**

Find `getKaTeXCSSTag()` and replace:
```typescript
export function getKaTeXCSSTag(): string {
  const katexCSS = getKaTeXCSS();
  return katexCSS
    ? `<style>${katexCSS}</style>`
    : `<link rel="stylesheet" href="lib/katex/katex.min.css">`;
}
```

Find `generateKaTeXScript()` and replace the CDN fallback line:
```typescript
// CHANGE THIS:
: `<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>`;

// TO THIS:
: `<script src="lib/katex/katex.min.js"><\/script>`;
```

### Verify
Enable airplane mode on the phone. Generate a Physics paper with equations. Open the PDF — math should render as proper symbols, not raw LaTeX text.

---

## TICKET 4 — Wrong Total Marks in PDF Header
**Priority: 🔴 CRITICAL — Factual error on printed exam paper**

### Problem
`patternTemplate.ts` line 44: `const totalMarks = pattern.totalMarks` — this is a hardcoded Punjab Board pattern value (e.g., 60 for Matric Science). If a teacher selects only 5 MCQs + 3 Short Questions, the PDF header still says "Total Marks: 60" instead of the correct value. This is a factual error on a student's exam paper.

Also, `customMarks` set by the teacher is never passed from `htmlTemplate.ts` to `patternTemplate.ts` — so custom marks per question are silently ignored.

### Files to Change

**1. `src/lib/pdf/patternTemplate.ts`**

Add `customMarks` and `attemptRules` to the `PatternTemplateInput` interface:
```typescript
export interface PatternTemplateInput {
  // ... all existing fields ...
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

In `generatePatternHTML()`, replace:
```typescript
const totalMarks = pattern.totalMarks;
```
With:
```typescript
const mcqMark = input.customMarks?.mcq ?? 1;
const shortMark = input.customMarks?.short ?? 2;
const longMark = input.customMarks?.long ?? 5;
const totalMarks =
  (input.mcqs.length * mcqMark) +
  (input.shorts.length * shortMark) +
  (input.longs.length * longMark);
```

**2. `src/lib/pdf/htmlTemplate.ts`**

In `generateHTMLTemplate()`, add the missing fields to the input object:
```typescript
const input: PatternTemplateInput = {
  // ... existing fields ...
  customMarks: data.customMarks,
  attemptRules: data.attemptRules,
};
```

### Verify
Create a paper with 5 MCQs (1 mark each) + 3 Short (2 marks each) = 11 marks. Download PDF. Header must say "Total Marks: 11" not "60".

---

## TICKET 5 — Create Paper Page: User Arrives with 0 Questions, Gets Stuck
**Priority: 🔴 CRITICAL — New users don't know what to do**

### Problem
When user arrives at `/create-paper`, all question counts are 0 and Generate button is disabled. There is no guidance. First-time users stare at a disabled button and don't know whether to tap the question cards, use auto-fill, or expand paper settings first. The most common action (quick standard test) requires the most effort.

### Solution
Auto-fill with sensible defaults immediately when the page loads and no questions are selected yet.

### File to Change

**`src/app/(main)/create-paper/page.tsx`**

Find the `useEffect` that calls `setAvailableCounts(counts)` and add auto-fill right after it:

```typescript
useEffect(() => {
  const validate = () => {
    // ... existing validation code ...
    
    const counts = getAvailableQuestionCounts(selectedClass, selectedSubject, selectedChapters);
    setAvailableCounts(counts);

    // ADD THIS — auto-fill on first arrival if nothing selected
    const nothingSelected =
      selectedMcqIds.length === 0 &&
      selectedShortIds.length === 0 &&
      selectedLongIds.length === 0;

    if (nothingSelected && counts.mcqs + counts.shorts + counts.longs > 0) {
      const result = getRandomQuestions(
        selectedClass,
        selectedSubject,
        selectedChapters,
        Math.min(15, counts.mcqs),
        Math.min(8, counts.shorts),
        Math.min(3, counts.longs),
        'mixed'
      );
      setMcqs(result.mcqs.map(q => q.id));
      setShorts(result.shorts.map(q => q.id));
      setLongs(result.longs.map(q => q.id));
    }

    // ... rest of existing code ...
  };
  validate();
}, [selectedClass, selectedSubject, selectedChapters]);
```

### Verify
Pick any subject + chapters → arrive at Create Paper → question cards should show filled counts (e.g., MCQs: 15, Short: 8, Long: 3) and Generate button should be enabled immediately.

---

## TICKET 6 — Marks Inconsistency Across 3 Files
**Priority: 🟠 HIGH — PDF shows different marks than UI**

### Problem
Three different default mark values exist in three different places:
- `src/types/question.ts`: `QUESTION_MARKS = { mcq: 1, short: 2, long: 5 }`
- `src/stores/paperStore.ts`: `customMarks: { mcq: 1, short: 5, long: 10 }`
- `src/app/paper/PaperPreviewContent.tsx`: `customMarks: paper.customMarks || { mcq: 1, short: 5, long: 10 }`

The UI shows one marks value, the PDF calculates a different one.

### Solution
Create one single source of truth.

### Files to Change

**1. Create `src/constants/marks.ts`** (new file):
```typescript
export const DEFAULT_MARKS = {
  mcq: 1,
  short: 2,
  long: 5,
} as const;
```

**2. `src/stores/paperStore.ts`**
```typescript
import { DEFAULT_MARKS } from '@/constants/marks';
// Replace:
customMarks: { mcq: 1, short: 5, long: 10 }
// With:
customMarks: { ...DEFAULT_MARKS }
```

**3. `src/app/paper/PaperPreviewContent.tsx`**
```typescript
import { DEFAULT_MARKS } from '@/constants/marks';
// Replace:
customMarks: paper.customMarks || { mcq: 1, short: 5, long: 10 }
// With:
customMarks: paper.customMarks || { ...DEFAULT_MARKS }
```

**4. `src/app/(main)/my-papers/page.tsx`** in `handleDownload`, add missing `customMarks`:
```typescript
const settings = {
  // ... existing fields ...
  customMarks: paper.customMarks || { ...DEFAULT_MARKS },  // ← ADD THIS
};
```

### Verify
Create paper with default marks → check UI shows "2 marks" for short → download PDF → PDF must also show "[2]" next to short questions, not "[5]".

---

## TICKET 7 — "Coming Soon" Buttons Destroy User Trust
**Priority: 🟠 HIGH — Broken promises in the UI**

### Problem
Two buttons in the app show "coming soon" toasts when tapped:
- Share button in `my-papers/page.tsx`: `toast.info("Share feature coming soon!")`
- Filter button in `my-papers/page.tsx`: `toast.info("Filters coming soon!")`

These have been in the code through multiple fix cycles. A professional app never has placeholder buttons visible to users.

### Solution
Implement Share. Remove Filter button until it's ready.

### File to Change

**`src/app/(main)/my-papers/page.tsx`**

Replace `handleShare`:
```typescript
const handleShare = useCallback(async (paper: GeneratedPaper) => {
  const text = `📄 ${paper.title}\nClass: ${paper.classId} | Subject: ${paper.subject}\nMarks: ${paper.totalMarks} | Questions: ${paper.questionCount}\n\nCreated with PaperPress`;

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: paper.title,
        text,
        dialogTitle: 'Share Paper',
      });
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  } catch {
    // User cancelled
  }
}, []);
```

Add imports at top:
```typescript
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
```

For the Filter button — remove it entirely from the header. Do not replace with anything. Add it back only when filter functionality is built.

### Verify
Open My Papers → tap Share on any paper → native share sheet opens (on Android) or WhatsApp link opens (on web). No "coming soon" toast anywhere.

---

## TICKET 8 — `includeAnswerSheet` Hardcoded as True
**Priority: 🟠 HIGH — User setting is silently ignored**

### Problem
In `src/app/paper/PaperPreviewContent.tsx`, `getSettings()` always returns `includeAnswerSheet: true` regardless of what the teacher toggled. The setting is saved correctly but ignored when generating the PDF.

### File to Change

**`src/app/paper/PaperPreviewContent.tsx`**

In `getSettings()`, replace:
```typescript
includeAnswerSheet: true,
```
With:
```typescript
includeAnswerSheet: paper.includeAnswerSheet ?? true,
```

Also add `attemptRules` which is also missing:
```typescript
attemptRules: paper.settings?.attemptRules || undefined,
```

### Verify
Toggle off "Include Answer Sheet" → generate paper → download PDF → bubble sheet should NOT appear in the PDF.

---

## TICKET 9 — `selectAllChapters([])` Clears Chapters Instead of Selecting
**Priority: 🟠 HIGH — Navigation bug causes chapter selection to be wiped**

### Problem
In `src/components/layout/BottomNavigation.tsx`, `handleSelectSubject()` calls `selectAllChapters([])`. This passes an empty array to the store's `selectAllChapters` action which sets `selectedChapters = []`. When the FAB create button is used, the user arrives at chapter selection with nothing pre-selected — but worse, if they had previously selected chapters for this subject, those selections are wiped.

### File to Change

**`src/components/layout/BottomNavigation.tsx`**

Find `handleSelectSubject` and remove the `selectAllChapters([])` call:
```typescript
const handleSelectSubject = useCallback((subjectId: string) => {
  setSubject(subjectId as any);
  // REMOVE: selectAllChapters([]);  ← this was clearing selections
  setShowCreatePopup(false);
  setShowSubjectSelector(false);
  const classId = selectedClass || "9th";
  router.push(`/chapters/${classId}/${subjectId.toLowerCase()}`);
}, [selectedClass, setSubject, router]);
```

Also remove `selectAllChapters` from the destructure at the top of the component since it's no longer used there.

### Verify
Use FAB to create a paper → select Physics → arrive at chapters page → previous chapter selections for Physics should still be there (or empty if first time, but NOT wiped if returning).

---

## TICKET 10 — API Key Logic Inverted — PDF API Unprotected by Default
**Priority: 🟠 HIGH — Security issue**

### Problem
In `src/app/api/generate-pdf/route.ts`:
```typescript
if (validKey && apiKey !== validKey) {
```
When `PDF_API_KEY` environment variable is not set (default on fresh deployment), `validKey` is `undefined`. `undefined && ...` = `false`. The check is skipped. Anyone on the internet can call your PDF API for free and consume your Gotenberg quota.

### File to Change

**`src/app/api/generate-pdf/route.ts`**

Replace:
```typescript
if (validKey && apiKey !== validKey) {
```
With:
```typescript
if (!validKey || apiKey !== validKey) {
```

Do the same fix in `src/app/api/generate-docx/route.ts` if it has an API key check.

Set these in Vercel environment variables:
```
PDF_API_KEY = any-strong-random-string-you-choose
NEXT_PUBLIC_PDF_API_KEY = same-value-as-above
```

### Verify
Deploy without setting `PDF_API_KEY` → POST to `/api/generate-pdf` without the header → should get 401 Unauthorized. Set the env var → POST with correct header → should work.

---

## TICKET 11 — Create Paper Page UI Restructure
**Priority: 🟡 MEDIUM — Major UX improvement**

### Problem
The Create Paper page has 6 sections stacked vertically: premium banner, subject info card, paper information (collapsed), questions section, auto-fill section, generate button. This overwhelms users. The most important field (Institute Name) is hidden inside a collapsed section. Auto-Fill and Manual-Pick are two separate UI areas competing for attention.

### Solution
Restructure into 3 clear sections. Remove the separate Auto-Fill section — replace the question cards with inline +/- steppers so auto-fill IS the card.

### File to Change

**`src/app/(main)/create-paper/page.tsx`**

Replace the questions section and auto-fill section with this unified design:

```tsx
{/* Questions Section — unified auto-fill + manual pick */}
<div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-gray-900">Questions</h2>
    <span className="text-xs text-gray-400">{totalMarks} total marks</span>
  </div>

  <div className="space-y-3">
    {(["mcq", "short", "long"] as const).map((type) => {
      const config = QUESTION_TYPE_CONFIG[type];
      const Icon = config.icon;
      const selected = type === "mcq" ? selectedMcqIds : type === "short" ? selectedShortIds : selectedLongIds;
      const available = type === "mcq" ? availableCounts.mcqs : type === "short" ? availableCounts.shorts : availableCounts.longs;
      const count = selected.length;

      return (
        <div key={type} className={cn("rounded-xl border-2 p-3", config.bgColor, config.borderColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{config.label}</p>
                <p className="text-xs text-gray-400">{available} available</p>
              </div>
            </div>
            {/* Inline stepper — tap +/- to adjust count, tap label to open picker */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustCount(type, -1)}
                className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-gray-700 font-bold active:scale-95"
              >−</button>
              <button
                onClick={() => openQuestionPicker(type)}
                className={cn("w-10 text-center font-black text-lg", config.color)}
              >{count}</button>
              <button
                onClick={() => adjustCount(type, 1)}
                className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-gray-700 font-bold active:scale-95"
              >+</button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
```

Add `adjustCount` function:
```typescript
const adjustCount = useCallback((type: QuestionTypeKey, delta: number) => {
  if (!selectedClass || !selectedSubject) return;
  const allQ = type === "mcq" ? allMcqs : type === "short" ? allShorts : allLongs;
  const current = type === "mcq" ? selectedMcqIds : type === "short" ? selectedShortIds : selectedLongIds;
  const newCount = Math.max(0, Math.min(allQ.length, current.length + delta));
  
  if (newCount > current.length) {
    // Add random questions to reach new count
    const unselected = allQ.filter(q => !current.includes(q.id));
    const toAdd = unselected.slice(0, newCount - current.length).map(q => q.id);
    const setter = type === "mcq" ? setMcqs : type === "short" ? setShorts : setLongs;
    setter([...current, ...toAdd]);
  } else {
    const setter = type === "mcq" ? setMcqs : type === "short" ? setShorts : setLongs;
    setter(current.slice(0, newCount));
  }
}, [selectedClass, selectedSubject, allMcqs, allShorts, allLongs, selectedMcqIds, selectedShortIds, selectedLongIds, setMcqs, setShorts, setLongs]);
```

Move Paper Information fields (institute name, date, time) out of the collapsible and make them always visible at the top. Move logo/address/header into an "Advanced" collapsible section.

### Verify
Open Create Paper → see 3 question cards with counts already filled (from Ticket 5) and inline +/- buttons → tap + on MCQs → count increases by 1 → tap the count number → picker opens → Generate button always enabled if any count > 0.

---

## TICKET 12 — APK Build: `next.config.ts` Missing `output: 'export'`
**Priority: 🟡 MEDIUM — APK shows blank white screen**

### Problem
`capacitor.config.ts` sets `webDir: 'out'`. This requires Next.js to produce a static export in the `out/` directory. But `next.config.ts` has no `output: 'export'`. The `build:android` script passes `CAPACITOR_BUILD=1` but `next.config.ts` never reads it. Running `npm run build:android` creates no `out/` folder. The APK contains no web content and shows a blank white screen.

### Solution
Already included in the `next.config.ts` fix in Ticket 1. Confirm the file has:
```typescript
const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

const nextConfig: NextConfig = {
  ...(isCapacitorBuild && {
    output: 'export',
    images: { unoptimized: true },
  }),
  // ...
};
```

### Verify
Run `npm run build:android` → confirm `out/` directory is created with `index.html` inside → run `npx cap sync android` → build APK in Android Studio → app loads correctly (not blank screen).

---

## TICKET 13 — jsPDF Fallback Truncates Questions + Wrong Watermark
**Priority: 🟡 MEDIUM — Fallback PDF is still broken**

### Problem
Even after Gotenberg is set up (Ticket 1), the jsPDF fallback (used when Gotenberg is unreachable) still has two bugs:
1. Short questions cut at 75 chars: `cleanLatex(sq.questionText).substring(0, 75)`
2. Long questions cut at 70 chars: `cleanLatex(lq.questionText).substring(0, 70)`
3. Watermark says "PaperPress App by Hamza Khan" — developer credit in a commercial app

### File to Change

**`src/lib/pdf/puppeteerPDF.ts`**

Replace shorts forEach:
```typescript
paperData.shorts.forEach((sq, idx) => {
  if (yPos > 270) { doc.addPage(); yPos = margin; }
  const qText = `${idx + 1}. ${cleanLatex(sq.questionText)}`;
  const lines = doc.splitTextToSize(qText, pageWidth - margin * 2 - 12);
  if (yPos + (lines.length * 5) > 275) { doc.addPage(); yPos = margin; }
  doc.text(lines, margin, yPos);
  doc.setFontSize(7);
  doc.text(`[${QUESTION_MARKS.short}]`, pageWidth - margin - 5, yPos);
  doc.setFontSize(9);
  yPos += (lines.length * 5) + 1;
});
```

Replace longs forEach:
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

Replace watermark line:
```typescript
// FROM:
doc.text('PaperPress App by Hamza Khan. - Email: paperpressapp@gmail.com', ...)
// TO:
doc.text('PaperPress — paperpressapp@gmail.com', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
```

### Verify
Temporarily set `GOTENBERG_URL` to an invalid URL to force jsPDF fallback. Generate paper with a long question (100+ chars). Confirm full question text appears in PDF, not truncated.

---

## Quick Reference — Order to Give AI

| # | Ticket | Time | Impact |
|---|--------|------|--------|
| 1 | Gotenberg PDF fix | 30 min | 🔴 Fixes core product |
| 2 | Android PDF distortion | 20 min | 🔴 Fixes APK quality |
| 3 | KaTeX offline fix | 10 min | 🔴 Fixes math in APK |
| 4 | Wrong marks in PDF | 30 min | 🔴 Fixes factual error |
| 5 | Auto-fill on arrival | 15 min | 🔴 Fixes new user confusion |
| 6 | Marks inconsistency | 30 min | 🟠 Fixes data integrity |
| 7 | Coming soon buttons | 20 min | 🟠 Fixes trust issue |
| 8 | includeAnswerSheet ignored | 10 min | 🟠 Fixes ignored setting |
| 9 | selectAllChapters bug | 10 min | 🟠 Fixes navigation |
| 10 | API key security | 10 min | 🟠 Fixes security |
| 11 | Create Paper UI restructure | 2-3 hrs | 🟡 Major UX improvement |
| 12 | APK blank screen build | 5 min | 🟡 Fixes APK build |
| 13 | jsPDF fallback fixes | 20 min | 🟡 Fixes offline fallback |
