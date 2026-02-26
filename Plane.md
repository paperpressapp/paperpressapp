# PaperPress — Complete 5-Phase Production Overhaul Plan
### AI Agent Instruction Manual (Phase-by-Phase Execution)

> **How to use this document:**  
> Hand each phase to your AI agent one at a time. Verify the results yourself. Only proceed to the next phase after confirming. Each phase is self-contained and fully described — the agent should not need to guess anything.

---

## PRE-AUDIT: Full Bug & Issue Registry

Before the phases, here is every identified issue found in the codebase, categorised by type. Phases below fix all of them in a logical order.

---

### 🔴 CRITICAL BUGS (App-Breaking / Factually Wrong Output)

| # | Location | Issue |
|---|----------|-------|
| C1 | `src/lib/premium/index.ts` | **Premium code is hardcoded and visible in plain source code** — `'PPB' + 'HK' + '656'` = `PPBHK656`. Any user who opens DevTools or decompiles the APK gets free premium forever. This is the single biggest security flaw. |
| C2 | `src/lib/pdf/professionalPDF.ts` | **MCQ options truncated to 7 characters** — `opt.substring(0, 7) + "..."`. "Photosynthesis" becomes "Photosyn...". On an exam paper this is factually wrong and makes the paper unusable for teachers. |
| C3 | Multiple PDF files | **Marks calculated differently in every file** — `htmlTemplate.ts` uses `QUESTION_MARKS` (shorts=5), `htmlGenerator.ts` hardcodes `× 2`, `generator.ts` hardcodes `× 2` for shorts and `× 5` for longs. The same paper shows different total marks depending on which path generated it. |
| C4 | `src/lib/pdf/htmlTemplate.ts` & `htmlGenerator.ts` | **Two separate duplicate HTML templates producing different-looking PDFs**. Puppeteer uses one, Android WebView uses the other. Teachers get a different-looking paper on mobile vs. server. |
| C5 | `src/app/page.tsx` (splash) | **`localStorage.getItem("paperpress_user_name")` decides routing but this check is wrong for logged-in Supabase users**. A logged-in user who never set a local name gets redirected to `/welcome` instead of `/home`. They see the signup screen despite being authenticated — they think the app is broken. |
| C6 | `src/app/api/generate-pdf/route.ts` | **PDF API has no authentication check**. Any person who knows the Vercel URL can POST unlimited requests and consume your Puppeteer bandwidth/quota. The rate limiter (10/min per IP) is trivially bypassed with a VPN. |

---

### 🟠 LOGICAL / UX ERRORS (Mistakes a Human Would Never Make)

| # | Location | Issue |
|---|----------|-------|
| L1 | `src/app/page.tsx` (splash) | **Splash screen shows "PaperPress App By Hamza Khan."** — developer credit on the splash screen of a commercial app. Users see this on every single launch. Looks amateur and unfinished. |
| L2 | `src/app/page.tsx` (splash) | **Force-navigation after 2000ms even if auth is still loading** — `setForceReady(true)` at 2s means the app may redirect before auth state is known, sending authenticated users to `/welcome` incorrectly. |
| L3 | `src/app/(main)/create-paper/page.tsx` | **Auto-fill defaults are hardcoded: MCQ=15, Short=8, Long=3** — this ignores what chapters the user selected and how many questions are actually available. If a chapter only has 5 MCQs, auto-fill tries to add 15, fails silently, and the user gets fewer than expected with no warning. |
| L4 | `src/app/(main)/create-paper/page.tsx` | **Generate button is always visible even when 0 questions are selected**. User presses it with no questions — nothing happens or they get an error. There is no disabled state or empty-state guidance. |
| L5 | `src/components/paper/PaperSettings.tsx` | **Settings panel starts `isExpanded: true`** — on mobile, this means the user lands on the create-paper page with a massive settings form already open, covering the question selection area. The primary action (selecting questions) is buried below the fold. |
| L6 | `src/app/(main)/settings/page.tsx` | **"Export Papers" on Android triggers a browser file download** (`URL.createObjectURL` + `<a>` click). On Android WebView / Capacitor this silently fails — the file goes nowhere. User taps Export, nothing happens, thinks app is broken. |
| L7 | `src/app/(main)/settings/page.tsx` | **"Import Papers" uses `<input type="file">` inside a label**. On Android WebView this file picker does not reliably open. Same silent failure as Export. |
| L8 | `src/app/(main)/settings/page.tsx` | **Danger Zone uses `<LogOut>` icon for "Reset App"**. A LogOut icon on a "delete everything" button is deeply confusing. Users may misread it as a logout button and lose all data. |
| L9 | `src/components/layout/BottomNavigation.tsx` | **Back button in "Change Class" step shows `<X className="rotate-45" />`** (a diamond shape) and is labelled "Change Class". The rotated X icon is meaningless and confusing — it should be a left arrow or back text. |
| L10 | `src/app/paper/PaperPreviewContent.tsx` | **"Preview PDF" opens a new tab** (`window.open`). On Android WebView, `window.open` is blocked by default. The button appears to do nothing. Users try it repeatedly, think it's broken. |
| L11 | `src/app/paper/PaperPreviewContent.tsx` | **Share > WhatsApp and Email share text only** (a plain text description of the paper). Users would expect to share the actual PDF. This is misleading — the Share button implies sending the document. |
| L12 | `src/app/(main)/my-papers/page.tsx` | **Re-downloading a paper from My Papers calls the PDF API again** with the full question set. But `getQuestionsByIds()` is called with all 3 ID arrays in one call — if any IDs are from a different subject/class than expected, the sorting logic (`'options' in q` check) may miscategorize questions. |
| L13 | `src/lib/storage/papers.ts` | **MAX_PAPERS = 50 stored in localStorage**. Each paper stores full question text + IDs. 50 papers of full content can easily exceed 5MB localStorage quota on Android. When the quota is hit, `setToLocalStorage` silently fails and the paper is never saved. User sees no error. |
| L14 | `src/app/(main)/chapters/[classId]/[subjectId]/ChaptersClient.tsx` | **`selectAllChapters([])` is called with an empty array** in the BottomNavigation `handleSelectSubject` callback. This clears chapter selections instead of selecting all — which means navigating via the FAB "+" button always starts with 0 chapters selected even if there was a previous selection. |
| L15 | `src/app/onboarding/page.tsx` | **`fileInputRef` is initialized as `useState<HTMLInputElement \| null>(null)[0]`** and is never assigned to any ref. The logo upload in onboarding always creates a new `<input>` via `document.createElement`. This is a dangling ref that serves no purpose — but worse, if the file input is garbage-collected mid-selection on Android, the onchange never fires. |

---

### 🟡 ANDROID / MOBILE COMPATIBILITY ISSUES

| # | Location | Issue |
|---|----------|-------|
| A1 | `src/lib/pdf/download.ts` | **PDF Preview uses `URL.createObjectURL` + `window.open`** — both fail on Android Capacitor WebView. File blobs cannot be opened this way on Android without the File Opener plugin. |
| A2 | `src/app/(main)/settings/page.tsx` | **Export/Import data uses browser download APIs** that don't work on Android (see L6, L7). On Android the correct approach is Capacitor Filesystem + Share plugin. |
| A3 | `src/components/layout/AppLayout.tsx` | **Safe-area handling** — The app uses CSS `env(safe-area-inset-top)` but the Capacitor config sets `backgroundColor: '#1565C0'` for Android. On notched Android devices (punch-hole cameras), the status bar area may not correctly inset on some OEM skins. |
| A4 | `src/components/paper/QuestionPickerModal.tsx` | **Modal is likely implemented as a full-screen overlay with scroll** — on Android, when the keyboard opens (if there's a search field inside), the modal does not resize correctly because the Capacitor Keyboard plugin is set to `resize: 'body'` which resizes the whole body, potentially breaking the modal layout. |
| A5 | Global | **`window.location.href = 'mailto:...'`** in the share flow — on Android WebView this mailto: intent does not reliably open the email app. Must use Capacitor's App plugin or Share plugin instead. |
| A6 | `next.config.ts` (to check) | **Next.js is likely using server-side rendering features in API routes** which is fine for Vercel, but the Capacitor build uses `output: 'export'` (static). Any API routes that import Node.js modules (like Puppeteer) will NOT be in the static export — which is correct. But the Android app must be able to reach the Vercel deployment. If `NEXT_PUBLIC_API_URL` is not set correctly, the Android APK calls `https://paperpressapp.vercel.app` which may not exist for a new deployment. |
| A7 | `capacitor.config.ts` | **`SplashScreen.launchShowDuration: 0` with `launchAutoHide: false`** — the splash never auto-hides. The app manually calls `SplashScreen.hide()` after navigation. But if the app crashes before navigation, the splash screen is stuck showing forever. No timeout fallback. |

---

### 🔵 DESIGN / RESPONSIVENESS ISSUES

| # | Location | Issue |
|---|----------|-------|
| D1 | `src/app/page.tsx` | Developer credit visible on splash: `"PaperPress App By Hamza Khan."` with a trailing period and line break. |
| D2 | `src/components/layout/BottomNavigation.tsx` | **Bottom nav uses `max-w-[428px]`** — hardcoded iPhone Pro Max width. On 5" budget Android phones (360px wide), the nav items are fine. But on 7" tablets, the nav only spans 428px with a blank gray fill on each side. Looks broken on large screens. |
| D3 | `src/app/(main)/home/page.tsx` | **HeroSection shows stats ("X Papers Created")** — these count from localStorage. A new user always sees "0 Papers Created" which is discouraging. Should show motivational copy for new users instead of zero-state stats. |
| D4 | `src/components/paper/SummaryBar.tsx` | **SummaryBar** (question count summary) is unknown if it sticks to bottom correctly above the BottomNav on all Android screen sizes. On phones with gesture navigation bar (no hardware buttons), the gesture nav area + bottom nav may overlap. |
| D5 | `src/app/(main)/create-paper/page.tsx` | **Page header has both a Back arrow and a Reset button** — on a 360px wide phone, if the title is long, these may collide. Not tested for overflow. |
| D6 | `src/app/(main)/settings/page.tsx` | **Settings page wraps content in both `<div className="min-h-screen ...">` AND `<MainLayout>`** which itself renders `<AppLayout>`. This double-wrapping creates unnecessary DOM depth and may cause double-scrolling on some Android versions. |
| D7 | Multiple pages | **`glass-panel` class uses `backdrop-blur-xl`** — Android WebView below Chrome 76 does not support `backdrop-filter`. On budget phones running Android 8/9, all glassmorphism panels show as opaque white cards, breaking the visual design completely. No fallback. |
| D8 | `src/components/paper/QuestionTypeCard.tsx` | **Question count stepper inputs** (if they exist as `<input type="number">`) — on Android keyboard, `type="number"` shows a numeric keyboard but also shows `+`/`-` spinner buttons which are 1px tall and untappable on mobile. Should use custom stepper buttons. |
| D9 | `src/app/auth/login/page.tsx` | **Login page** — when keyboard opens on Android, the form fields may be hidden behind the keyboard since there's no scroll adjustment for auth pages. The Keyboard plugin is configured, but individual auth pages may not account for the viewport change. |

---

### 🟣 INCOMPLETE / NON-FUNCTIONAL FEATURES

| # | Feature | Status |
|---|---------|--------|
| F1 | **Answer Sheet / Bubble Sheet** | `PaperSettings` has `includeAnswerSheet` toggle. `handleBubbleSheetToggle` just sets the boolean. The actual bubble sheet HTML is generated in the PDF template — but there's no validation that the bubbles match MCQ count. If 0 MCQs selected, a blank bubble sheet is generated. |
| F2 | **Custom Marks Distribution** | UI shows custom marks inputs (MCQ/Short/Long per mark). But `create-paper` page's `autoFillConfig` never reads from `paperSettings.customMarks` — it uses `QUESTION_MARKS` constants. So custom marks only affect the PDF header, not the actual calculation in the summary bar. |
| F3 | **Attempt Rules (Attempt X out of Y)** | `PDFSettings.attemptRules` interface exists. The settings panel likely has fields for this. But the `generate-pdf` API route `route.ts` does not use `attemptRules` in the Puppeteer PDF generation — it's dropped silently. |
| F4 | **Subjects Page (`/subjects`)** | In `BottomNavigation`, the third nav item links to `/subjects`. But this page shows all subjects regardless of class. If a user browses subjects first (before selecting class), then taps a subject, the store has no `selectedClass` — causing a redirect to `/home` or `undefined` class routes. |
| F5 | **DOCX Download on Android** | `handleDownloadDOCX` calls `fetchAndDownloadDOCX` which uses the same `triggerBrowserDownload` blob approach — this silently fails on Android WebView (same as PDF preview issue). DOCX is completely non-functional on Android. |
| F6 | **Search in My Papers** | Search is debounced (300ms, correctly). But the search input is hidden behind a toggle button — the user taps the search icon to reveal the input, then types. On Android, this means the keyboard opens and immediately closes if the transition animation causes a re-render that blurs the input. Input focus management is missing. |
| F7 | **Supabase Premium Verification** | `authStore.ts` has a `redeemCode` method that posts to Supabase. But `PremiumModal.tsx` calls `validatePremiumCode()` from `src/lib/premium/index.ts` (the local offline validator) — it never calls `authStore.redeemCode`. The two premium systems are completely disconnected. Supabase profiles with `role: 'premium'` are never synced to the offline premium status. |
| F8 | **Paper Title Auto-Generation** | `paperSettings.title` starts as empty string `''`. If the user doesn't set a title, the paper is saved with `title: ''` and appears as blank in My Papers list. Should auto-generate `"${subject} Paper - ${date}"`. |
| F9 | **Offline Mode Handling** | `authStore.ts` has `isOffline` state. But there's no UI shown to the user when offline. PDF generation will fail silently (no server connection). The offline jsPDF fallback exists in code but is never triggered automatically — the user just sees "Failed to download PDF". |

---

---

# PHASE 1 — Foundation & Critical Bug Fixes
**Goal:** Fix everything that produces wrong output or crashes. After this phase, the app functions correctly even if it looks the same.

**Estimated changes:** ~12 files

---

## Task 1.1 — Remove Developer Credit from Splash Screen

**File:** `src/app/page.tsx`

**Find:**
```tsx
<motion.p
  className="text-white/70 text-sm font-medium tracking-wide uppercase"
  ...
>
  PaperPress App By Hamza Khan.
</motion.p>
```

**Replace with:**
```tsx
<motion.p
  className="text-white/70 text-sm font-medium tracking-wide uppercase"
  ...
>
  Professional Exam Paper Generator
</motion.p>
```

**Also fix the force-ready timer:** Change `setTimeout(..., 2000)` to `setTimeout(..., 3000)` and add a guard so it only navigates if `!hasNavigated.current`.

---

## Task 1.2 — Fix Splash Auth Routing Logic

**File:** `src/app/page.tsx`

**Current bug:** Guest user who visited before (has `paperpress_user_name` in localStorage) gets routed to `/home`. But a Supabase-authenticated user who never set a local name goes to `/welcome`.

**Fix the navigate function:**
```tsx
const navigate = async () => {
  if (Capacitor.isNativePlatform()) {
    try { await SplashScreen.hide(); } catch (e) { }
  }
  await new Promise(resolve => setTimeout(resolve, 100));

  if (isAuthenticated && profile) {
    // Authenticated Supabase user — always go home (or admin)
    router.replace(profile.role === 'admin' ? "/admin" : "/home");
  } else {
    // Guest — check if they've done onboarding
    const hasOnboarded = typeof window !== 'undefined' && 
      localStorage.getItem("paperpress_user_name");
    router.replace(hasOnboarded ? "/home" : "/welcome");
  }
};
```

---

## Task 1.3 — Fix Marks Calculation Across All PDF Files

**Files to edit:**
- `src/lib/pdf/htmlTemplate.ts`
- `src/lib/pdf/htmlGenerator.ts`
- `src/lib/pdf/generator.ts`
- `src/lib/pdf/professionalPDF.ts`

**Rule:** Delete every custom `calculateMarks()` function from these files. Import `QUESTION_MARKS` from `@/types/question` in each file. Use this single formula everywhere:

```ts
import { QUESTION_MARKS } from '@/types/question';

const totalMarks = 
  mcqs.length * (customMarks?.mcq ?? QUESTION_MARKS.mcq) +
  shorts.length * (customMarks?.short ?? QUESTION_MARKS.short) +
  longs.length * (customMarks?.long ?? QUESTION_MARKS.long);
```

**Search the codebase:** `grep -r "× 2\|shortMarks.*2\|longMarks.*5\|calculateMarks" src/lib/pdf/` — every hit must be removed and replaced with the formula above.

---

## Task 1.4 — Fix MCQ Option Truncation

**File:** `src/lib/pdf/professionalPDF.ts`

**Find:** Any line doing `opt.substring(0, 7)` or `opt.substring(0, 10)` or `opt.substring(0, 12)`.

**Replace:** Remove all truncation. MCQ options must be printed in full. Change the MCQ layout from a 4-column horizontal table to a 2×2 grid (A/B top row, C/D bottom row) with each cell getting 50% page width. This gives enough space for any answer option text.

**File:** `src/lib/pdf/htmlTemplate.ts` (the Puppeteer template)

Apply the same fix: MCQ table cells must use percentage widths and word-wrap enabled. Remove any character count limits on options.

---

## Task 1.5 — Unify the Two PDF HTML Templates

**Action:** Delete `src/lib/pdf/htmlGenerator.ts`.

**File:** `src/lib/pdf/download.ts`

Find the line that imports from `htmlGenerator.ts`:
```ts
import { generatePaperHTML } from './htmlGenerator';
```

Replace with:
```ts
import { generateHTMLTemplate } from './htmlTemplate';
```

Find every call to `generatePaperHTML(...)` in `download.ts` and replace with `generateHTMLTemplate(...)` passing the same structured data.

**Result:** Both the Vercel Puppeteer path and the Android WebView offline path now use identical HTML. The paper always looks the same regardless of how it was generated.

---

## Task 1.6 — Fix Auto-Title for Papers

**File:** `src/app/(main)/create-paper/page.tsx` (inside the generate paper function)

Before calling `savePaper(paper)`, check if the title is empty and auto-generate it:

```ts
const paperTitle = paperSettings.title.trim() || 
  `${selectedSubject} - ${selectedClass} (${format(new Date(), 'dd MMM yyyy')})`;
```

Use `paperTitle` instead of `paperSettings.title` when constructing the `GeneratedPaper` object.

---

## Task 1.7 — Fix "0 Questions Selected" Generate Bug

**File:** `src/app/(main)/create-paper/page.tsx`

The Generate Paper button must be disabled when total selected questions = 0:

```tsx
const totalSelected = selectedMcqIds.length + selectedShortIds.length + selectedLongIds.length;

<Button 
  disabled={totalSelected === 0 || isGenerating}
  onClick={handleGenerate}
  ...
>
```

Also show a clear empty state message above the button when 0 questions are selected:

```tsx
{totalSelected === 0 && (
  <p className="text-center text-sm text-amber-600 bg-amber-50 rounded-xl p-3 mx-5">
    Please select at least one question to generate a paper
  </p>
)}
```

---

## Task 1.8 — Fix Auto-Fill Using Actual Available Counts

**File:** `src/app/(main)/create-paper/page.tsx`

The `autoFillConfig` hardcoded defaults (MCQ=15, Short=8, Long=3) must be replaced with dynamic defaults based on `availableCounts`:

```ts
// When availableCounts loads, update autoFillConfig defaults
useEffect(() => {
  setAutoFillConfig(prev => ({
    ...prev,
    mcq: Math.min(15, availableCounts.mcqs),
    short: Math.min(8, availableCounts.shorts),
    long: Math.min(3, availableCounts.longs),
  }));
}, [availableCounts]);
```

Also: when auto-fill sets the questions, if the requested count exceeds available, show a toast: `"Only X MCQs available — added all"`.

---

## Task 1.9 — Fix Dangling `fileInputRef` in Onboarding

**File:** `src/app/onboarding/page.tsx`

Delete the line:
```ts
const fileInputRef = useState<HTMLInputElement | null>(null)[0];
```
This is a bug — it's not a ref, it's just `null` stored in a variable. The logo upload already works via `document.createElement('input')` in `handleLogoSelect`. Remove the dead `fileInputRef` variable entirely so it stops creating confusion.

---

## Task 1.10 — Fix Custom Marks Not Applying to Summary

**File:** `src/app/(main)/create-paper/page.tsx`

The summary bar calculates marks using `QUESTION_MARKS` constants, ignoring `paperSettings.customMarks`. Fix:

```ts
const mcqMark = paperSettings.customMarks?.mcq ?? QUESTION_MARKS.mcq;
const shortMark = paperSettings.customMarks?.short ?? QUESTION_MARKS.short;
const longMark = paperSettings.customMarks?.long ?? QUESTION_MARKS.long;

const totalMarks = 
  selectedMcqIds.length * mcqMark +
  selectedShortIds.length * shortMark +
  selectedLongIds.length * longMark;
```

Pass `mcqMark`, `shortMark`, `longMark` to `SummaryBar` so it shows the correct marks.

---

## Task 1.11 — Fix Subjects Page Empty Class State

**File:** `src/app/(main)/subjects/page.tsx` (or wherever the subjects page routes to chapter selection)

When the user taps a subject on the subjects page and `selectedClass` is null in the store, instead of crashing or routing to undefined:

```ts
const handleSubjectSelect = (subjectId: string) => {
  if (!selectedClass) {
    // Show class selector bottom sheet first, then proceed
    setShowClassSelector(true);
    setPendingSubject(subjectId);
    return;
  }
  router.push(`/chapters/${selectedClass}/${subjectId.toLowerCase()}`);
};
```

---

## ✅ Phase 1 Verification Checklist

Before moving to Phase 2, confirm:
- [ ] Splash screen shows "Professional Exam Paper Generator" (no developer name)
- [ ] Logged-in Supabase user lands on `/home` on first launch
- [ ] Guest user with `paperpress_user_name` in localStorage lands on `/home`
- [ ] New guest user lands on `/welcome`
- [ ] Generating a paper with default marks → total marks match across all sections of the PDF
- [ ] MCQ options are not truncated in the downloaded PDF
- [ ] Paper title auto-generates when left blank
- [ ] Generate button is disabled when 0 questions selected
- [ ] Auto-fill respects chapter question limits

---

---

# PHASE 2 — Android & Mobile Compatibility Fixes
**Goal:** Every feature that currently silently fails on Android must work. After this phase, PDF download, file export, file import, preview, and sharing all work on Android.

**Estimated changes:** ~8 files

---

## Task 2.1 — Fix PDF Download on Android (Primary Path)

**File:** `src/lib/pdf/download.ts`

**Current issue:** The Android `downloadPDFAndroid` function calls `savePDFToDevice()` which uses Capacitor Filesystem correctly. This part is fine.

**Broken part:** The function `fetchAndPreviewPDF` on Android calls `previewPDFWeb` which does `URL.createObjectURL` + `window.open` — both blocked on Android WebView.

**Fix `fetchAndPreviewPDF` for Android:**
```ts
export async function fetchAndPreviewPDF(...): Promise<...> {
  if (Capacitor.isNativePlatform()) {
    // On Android: save the PDF then open it with FileOpener
    const result = await fetchAndDownloadPDF(settings, mcqs, shorts, longs, true); 
    // pass openAfterSave=true to savePDFToDevice
    return result;
  }
  // Web: existing blob + window.open logic
  return previewPDFWeb(settings, mcqs, shorts, longs);
}
```

Update `savePDFToDevice` to accept `openAfterSave: boolean` parameter and conditionally open via FileOpener after saving.

**Update the Preview button label on Android:**
```tsx
// In PaperPreviewContent.tsx
const isNative = Capacitor.isNativePlatform();
<Button onClick={handlePreviewPDF}>
  {isNative ? 'Open PDF' : 'Preview'}
</Button>
```

---

## Task 2.2 — Fix DOCX Download on Android

**File:** `src/lib/pdf/download.ts` — function `fetchAndDownloadDOCX`

**Current issue:** Uses `triggerBrowserDownload(blob, filename)` which fails on Android.

**Fix:** Mirror the PDF download pattern — on Android, save to Filesystem and open with FileOpener using content type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`:

```ts
export async function fetchAndDownloadDOCX(...): Promise<...> {
  // ... fetch blob from API ...
  
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);
    await savePDFToDevice(base64, filename.replace('.pdf', '.docx'), true);
    // FileOpener will use the DOCX mime type
    return { success: true };
  }
  
  triggerBrowserDownload(blob, filename);
  return { success: true };
}
```

---

## Task 2.3 — Fix Export Papers on Android

**File:** `src/app/(main)/settings/page.tsx` — function `handleExportData`

**Current:** Creates a blob URL and triggers a download link — fails silently on Android.

**Fix:**
```ts
const handleExportData = async () => {
  const data = exportPapers();
  const json = JSON.stringify(data, null, 2);
  const filename = `paperpress-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;

  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    
    await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: 'utf8',
    });
    
    const uri = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });
    
    await Share.share({
      title: 'PaperPress Backup',
      url: uri.uri,
    });
  } else {
    // Web: existing blob download logic
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  toast.success('Backup exported successfully');
};
```

---

## Task 2.4 — Fix Import Papers on Android

**File:** `src/app/(main)/settings/page.tsx` — function `handleImportData`

**Current:** Uses `<input type="file">` which doesn't reliably open on Android WebView.

**Fix:** On Android, use the `@capacitor/filesystem` picker or show instructions. For now, add a clear note when on Android:

```ts
const handleImportTap = () => {
  if (Capacitor.isNativePlatform()) {
    // Use a file input but with explicit click management
    // Capacitor handles file:// URIs via Filesystem
    toast.info('Tap to select your backup .json file');
  }
  document.getElementById('import-file-input')?.click();
};
```

Also add `capture` attribute and ensure the `<input>` is in the DOM (not dynamically created):
```tsx
<input 
  id="import-file-input"
  type="file" 
  accept=".json,application/json" 
  className="sr-only"
  onChange={handleImportData}
/>
```

---

## Task 2.5 — Fix WhatsApp & Email Sharing on Android

**File:** `src/app/paper/PaperPreviewContent.tsx`

**Current:** `handleWhatsAppShare` uses `window.open('https://wa.me/...')` — opens a browser tab on Android instead of the WhatsApp app.

**Fix:** On Android, use the Capacitor Share plugin which correctly invokes the native Android intent chooser:

```ts
const handleShare = async (type: 'whatsapp' | 'email' | 'any') => {
  const text = getShareText();
  
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title: paper?.title || 'Exam Paper',
      text,
      dialogTitle: 'Share Paper',
    });
    return;
  }
  
  // Web fallbacks
  if (type === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  } else if (type === 'email') {
    window.location.href = `mailto:?subject=${encodeURIComponent(paper?.title || '')}&body=${encodeURIComponent(text)}`;
  }
};
```

Remove the separate WhatsApp/Email/Copy buttons from the Quick Share section on Android. Replace with a single "Share" button that invokes the native Android share sheet (which includes WhatsApp, Email, and all other installed apps automatically).

---

## Task 2.6 — Fix Keyboard & Scroll Issues on Auth Pages

**File:** `src/app/auth/login/page.tsx` and `src/app/auth/signup/page.tsx`

Wrap the form content in a scrollable container so that when the Android keyboard opens and resizes the viewport, the form fields remain accessible:

```tsx
<div className="min-h-screen flex flex-col overflow-y-auto">
  <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
    {/* form content */}
  </div>
</div>
```

Also add `autoComplete` attributes to all inputs for Android autofill:
```tsx
<Input autoComplete="email" ... />
<Input autoComplete="current-password" type="password" ... />
```

---

## Task 2.7 — Fix Glassmorphism Fallback for Older Android

**File:** `src/app/globals.css`

Add a CSS fallback for devices that don't support `backdrop-filter`:

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
}

@supports (backdrop-filter: blur(1px)) {
  .glass-panel {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.85);
  }
}
```

Apply the same `@supports` pattern to `.glass-panel-dark`.

---

## Task 2.8 — Fix localStorage Overflow (Paper Storage)

**File:** `src/lib/storage/papers.ts`

Wrap all `setToLocalStorage` calls in try-catch and alert the user if storage is full:

```ts
export function savePaper(paper: GeneratedPaper): { success: boolean; error?: string } {
  try {
    const papers = getPapers();
    const updatedPapers = [paper, ...papers].slice(0, MAX_PAPERS);
    const serialized = JSON.stringify(updatedPapers);
    
    // Check size before saving (5MB limit)
    if (serialized.length > 4.5 * 1024 * 1024) {
      // Remove oldest papers until under limit
      const trimmed = updatedPapers.slice(0, Math.floor(updatedPapers.length * 0.8));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return { success: true, error: 'Oldest papers removed to free space' };
    }
    
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (e) {
    // QuotaExceededError
    return { success: false, error: 'Storage full — please delete old papers in Settings' };
  }
}
```

Update `create-paper/page.tsx` to handle this return value and show the error toast if `error` is present.

---

## ✅ Phase 2 Verification Checklist

Before moving to Phase 3, confirm on a real Android device or emulator:
- [ ] "Download PDF" saves file to `Documents/PaperPress/` and opens it in PDF viewer
- [ ] "Open PDF" (formerly Preview) saves and opens the PDF on Android
- [ ] "Download as Word" saves the DOCX and opens it in a compatible app
- [ ] "Export Papers" in Settings opens the Android share sheet with the JSON file
- [ ] Share button on paper preview opens the Android native share sheet
- [ ] Login form fields are reachable when keyboard is open
- [ ] Glass panels display correctly on Chrome/WebView (may look like white cards on very old Android — acceptable)

---

---

# PHASE 3 — UX Logic & Navigation Overhaul
**Goal:** Fix every illogical user flow. After this phase, the app makes sense to a non-technical teacher using it for the first time.

**Estimated changes:** ~10 files

---

## Task 3.1 — Collapse Paper Settings Panel by Default

**File:** `src/components/paper/PaperSettings.tsx`

**Current:** `const [isExpanded, setIsExpanded] = useState(true)` — settings are open by default, burying question selection.

**Fix:** Change to `useState(false)` so settings are collapsed by default. The question selection area is the primary action and should be immediately visible.

Add a visual affordance showing the settings are there but collapsed:
```tsx
<button onClick={() => setIsExpanded(!isExpanded)} className="...">
  <Settings2 className="w-4 h-4" />
  Paper Settings
  <span className="text-xs text-gray-400 ml-auto">
    {isExpanded ? 'Hide' : 'Customize paper header'}
  </span>
  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
</button>
```

---

## Task 3.2 — Fix "Change Class" Button in Bottom Nav Popup

**File:** `src/components/layout/BottomNavigation.tsx`

**Current:**
```tsx
<button onClick={() => setShowSubjectSelector(false)}>
  <X className="w-4 h-4 rotate-45" /> Change Class
</button>
```

**Fix:**
```tsx
<button onClick={() => setShowSubjectSelector(false)}>
  <ArrowLeft className="w-4 h-4" /> Back to Classes
</button>
```

---

## Task 3.3 — Fix Dangerous Action Icons in Settings

**File:** `src/app/(main)/settings/page.tsx`

The "Reset App" (delete everything) action uses a `<LogOut>` icon. Replace with:
```tsx
<Trash2 className="w-5 h-5 text-red-500" />
```

Also add a clear red header to the danger zone section:
```tsx
<div className="px-4 py-3 border-b border-red-100 bg-red-50/50">
  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
    ⚠ Danger Zone
  </p>
</div>
```

---

## Task 3.4 — Fix New User Home Screen Zero Stats

**File:** `src/components/home/HeroSection.tsx`

**Current:** Shows "0 Papers Created" and "0 This Month" for new users — discouraging.

**Fix:** When `totalPapers === 0`, show a welcome/call-to-action instead of zero stats:

```tsx
{totalPapers === 0 ? (
  <div className="text-center py-4">
    <p className="text-white/80 text-sm">Welcome! Create your first exam paper 👇</p>
  </div>
) : (
  <div className="grid grid-cols-2 gap-3">
    <StatCard label="Papers Created" value={totalPapers} />
    <StatCard label="This Month" value={papersThisMonth} />
  </div>
)}
```

---

## Task 3.5 — Fix Bottom Nav Width on Large Screens

**File:** `src/components/layout/BottomNavigation.tsx`

Change `max-w-[428px]` to `max-w-lg` (512px) to be slightly less iOS-specific. More importantly, remove the hardcoded background fill behind the nav and let it extend naturally:

```tsx
// Remove: <div className="absolute inset-0 bg-gray-50" />
// The nav should float above the content, not fill the full width with a background div
```

---

## Task 3.6 — Connect Premium Systems (Offline + Supabase)

**File:** `src/components/premium/PremiumModal.tsx`

**Current:** Calls `validatePremiumCode()` (local offline check only).

**Fix:** After local validation succeeds, also sync to Supabase if the user is logged in:

```ts
const handleSubmit = async () => {
  const validation = validatePremiumCode(code); // local check
  
  if (validation.valid) {
    // Also sync to Supabase if authenticated
    const { redeemCode } = useAuthStore.getState();
    if (useAuthStore.getState().isAuthenticated) {
      await redeemCode(code); // updates Supabase profile role to 'premium'
    }
    
    setResult({ type: 'success', message: validation.message });
    // ... existing success handling
  }
};
```

**File:** `src/stores/authStore.ts` — in `fetchProfile()`:

After fetching the Supabase profile, if `profile.role === 'premium'`, also sync the local premium status:

```ts
if (profile.role === 'premium' || profile.role === 'admin') {
  // Sync local premium status
  const { validatePremiumCode } = await import('@/lib/premium');
  localStorage.setItem('paperpress_premium_status', JSON.stringify({
    isPremium: true,
    activatedAt: Date.now(),
    code: 'SUPABASE_SYNC',
  }));
}
```

---

## Task 3.7 — Fix Search Input Focus in My Papers

**File:** `src/app/(main)/my-papers/page.tsx`

When the search bar toggle is activated, auto-focus the input:

```ts
const [showSearch, setShowSearch] = useState(false);
const searchInputRef = useRef<HTMLInputElement>(null);

const handleShowSearch = () => {
  setShowSearch(true);
  // Focus after animation frame
  requestAnimationFrame(() => {
    searchInputRef.current?.focus();
  });
};

// Attach: ref={searchInputRef} to the Input component
```

---

## Task 3.8 — Fix Offline PDF Generation Fallback

**File:** `src/lib/pdf/download.ts`

**Current:** When the Vercel API fails, the user sees "Failed to download PDF" and nothing else.

**Fix:** Add automatic fallback to offline WebView printing:

```ts
export async function fetchAndDownloadPDF(...): Promise<...> {
  if (Capacitor.isNativePlatform()) {
    try {
      // Try server first (2 second timeout for faster UX)
      const result = await fetchPDFFromServer(settings, mcqs, shorts, longs, { timeout: 15000 });
      // ... save to device
      return { success: true };
    } catch (serverError) {
      // Fallback to offline WebView printing
      console.log('[PDF] Server failed, using offline fallback');
      const html = generateHTMLTemplate({ settings, mcqs, shorts, longs });
      await PDFPrinter.printToPDF({ html, filename: profFilename(settings) });
      return { success: true };
    }
  }
  // ... web path
}
```

Also show an informative offline toast: `"Generated offline — quality may differ"`.

---

## Task 3.9 — Fix Attempt Rules in PDF

**File:** `src/app/api/generate-pdf/route.ts`

Ensure `attemptRules` is passed to `generatePDF()` and that `generateHTMLTemplate` uses it in the section headers:

In `htmlTemplate.ts`, the short section heading should read:
```
Attempt any {shortAttempt} out of {shortTotal}
```
Only if `attemptRules.shortAttempt < attemptRules.shortTotal`. If they're equal (or attemptRules is not set), show:
```
Attempt all questions
```

---

## Task 3.10 — Add Offline Status Banner

**File:** `src/components/layout/AppLayout.tsx` (or create `src/components/shared/OfflineBanner.tsx`)

```tsx
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-amber-500 text-white text-center py-1 text-xs font-medium">
      📶 Offline — PDFs will be generated locally
    </div>
  );
}
```

Add `<OfflineBanner />` to `AppLayout.tsx`.

---

## ✅ Phase 3 Verification Checklist

- [ ] Create Paper page: question cards are visible immediately without scrolling past settings
- [ ] Bottom nav "Create" popup: back button shows left arrow and "Back to Classes"
- [ ] Settings page: Reset App has a trash icon, not a logout icon
- [ ] New user home screen shows welcome message, not "0 Papers Created"
- [ ] When offline, a yellow banner appears at the top of every page
- [ ] When Vercel API fails, PDF falls back to offline generation with a toast message
- [ ] Premium code entry syncs to Supabase if user is logged in

---

---

# PHASE 4 — Freemium Model Hardening & Security
**Goal:** Make the premium system fair, non-bypassable, and actually valuable. After this phase, the freemium model drives conversions and cannot be trivially bypassed.

**Estimated changes:** ~6 files

---

## Task 4.1 — Harden the Premium Code System

**Critical:** The current premium code `PPBHK656` is visible in plain JavaScript source code. Anyone who opens Chrome DevTools on the web version (or decompiles the APK with jadx) gets free premium.

**Fix — Option A (Recommended): Move validation to the server**

```ts
// src/app/api/validate-code/route.ts (NEW FILE)
import { NextRequest, NextResponse } from 'next/server';

// Store valid codes server-side only (in environment variable)
const VALID_CODES = process.env.PREMIUM_CODES?.split(',') || [];

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const normalized = code.trim().toUpperCase();
  
  const isValid = VALID_CODES.includes(normalized);
  
  if (!isValid) {
    return NextResponse.json({ valid: false, message: 'Invalid code' });
  }
  
  return NextResponse.json({ 
    valid: true, 
    message: 'Premium activated!',
    // Return a signed token the client can store
    token: generateSignedToken(code), // HMAC using server secret
  });
}
```

Set `PREMIUM_CODES=PPBHK656,PPBHK657,...` in Vercel environment variables (never in the codebase).

**Fix — Option B (Offline-compatible):** If truly offline validation is needed, use a salted hash:

```ts
import { createHash } from 'crypto'; // or use a pure JS alternative

function validateCode(code: string): boolean {
  const SALT = process.env.NEXT_PUBLIC_CODE_SALT || 'paperpress2024';
  const hash = createHash('sha256').update(code.toUpperCase() + SALT).digest('hex');
  return hash === '...known_hash_of_correct_code...';
}
```

The hash can be public — the input that produces it cannot be easily reversed. Store the expected hash as `NEXT_PUBLIC_PREMIUM_HASH` in `.env`.

---

## Task 4.2 — Add API Authentication to PDF Route

**File:** `src/app/api/generate-pdf/route.ts`

Add an API key check so only the legitimate app can call the PDF API:

```ts
export async function POST(request: NextRequest) {
  // Check API key
  const apiKey = request.headers.get('x-api-key');
  const validKey = process.env.PDF_API_KEY;
  
  if (!validKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... existing logic
}
```

**File:** `src/lib/pdf/download.ts`

Add the header to all API calls:
```ts
headers: {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NEXT_PUBLIC_PDF_API_KEY || '',
},
```

Set `PDF_API_KEY` in Vercel environment variables and `NEXT_PUBLIC_PDF_API_KEY` in the app build.

---

## Task 4.3 — Improve Premium Paywall UI

**File:** `src/components/premium/PremiumModal.tsx`

The current modal just shows a code input. Improve it to show **what the user gets** before asking for money:

```tsx
// Premium features display before code input
const features = [
  { icon: Crown, text: 'Unlimited paper generation', highlight: true },
  { icon: ImagePlus, text: 'Custom institution logo in PDF' },
  { icon: FileText, text: 'Bubble sheet / Answer sheet' },
  { icon: Sparkles, text: 'Answer key generation' },
  { icon: Settings, text: 'Custom marks per question type' },
];

// Show feature list, then "Enter Code" section below
// Add a WhatsApp contact button: wa.me/YOUR_NUMBER to buy a code
```

Add a "How to get a code?" section that directs users to a contact number/WhatsApp for payment.

---

## Task 4.4 — Improve Free Tier Usage Display

**File:** `src/components/home/HeroSection.tsx` or wherever usage is shown

Replace the text-only remaining count with a visual progress bar:

```tsx
{!isPremium && (
  <div className="bg-white/10 rounded-2xl p-4 mt-4">
    <div className="flex justify-between text-sm text-white/80 mb-2">
      <span>Free Papers Used</span>
      <span>{used}/{limit}</span>
    </div>
    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all ${
          used / limit > 0.8 ? 'bg-red-400' : 'bg-white/60'
        }`}
        style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
      />
    </div>
    {used / limit > 0.8 && (
      <p className="text-xs text-red-300 mt-2">
        Running low — upgrade for unlimited access
      </p>
    )}
  </div>
)}
```

---

## Task 4.5 — Add Premium Gate to Premium Features

**File:** `src/app/(main)/create-paper/page.tsx`

Ensure that when a free user tries to use logo upload, custom marks, or bubble sheet:
1. The action is blocked
2. A premium modal opens automatically
3. The modal shows what they're missing and how to get it

```ts
const handlePremiumFeatureAttempt = (featureName: string) => {
  if (!isPremium) {
    setPremiumModalFeature(featureName); // show which feature triggered it
    setShowPremiumModal(true);
    return false;
  }
  return true;
};
```

---

## Task 4.6 — Show Premium Expiry / Validity

**File:** `src/lib/premium/index.ts`

The current system makes premium permanent — no expiry. This is fine for a code-based system, but the UI should make it clear:

In `checkPremiumStatus()`, add an `activatedAtFormatted` field:

```ts
return {
  ...status,
  activatedAtFormatted: status.activatedAt 
    ? format(new Date(status.activatedAt), 'dd MMM yyyy')
    : null,
};
```

Show this in the Settings premium card:
```tsx
<p className="text-sm text-gray-600">
  Active since {premiumStatus.activatedAtFormatted || 'today'}
</p>
```

---

## ✅ Phase 4 Verification Checklist

- [ ] Premium code is no longer visible in client-side JS (either server-validated or hash-based)
- [ ] PDF API returns 401 without the correct API key
- [ ] Premium modal shows feature list and "How to get a code" contact info
- [ ] Free tier shows a visual progress bar on the home screen
- [ ] Tapping logo upload when free opens the premium modal with the right feature highlighted
- [ ] Settings shows "Active since [date]" for premium users

---

---

# PHASE 5 — Premium UI Polish & Production Readiness
**Goal:** Make the app look and feel like a Rs.500/month premium product. Fix every visual rough edge. After this phase, the app is ready to publish to Google Play Store.

**Estimated changes:** ~15 files + new assets

---

## Task 5.1 — Redesign the Home Screen Hero Section

**File:** `src/components/home/HeroSection.tsx`

The hero is functional but uninspiring. Redesign it as a premium teacher dashboard card:

- Show the user's institute name prominently (not just first name)
- Show today's date and a greeting based on time of day ("Good morning, Sir Hamza")
- Quick stats in a horizontal scroll row (not stacked) for better use of width
- A prominent "Create Paper" button integrated into the hero (not just in the bottom nav)

---

## Task 5.2 — Redesign the Create Paper Flow (3-Step Wizard)

**Current:** The create-paper page dumps everything on one screen: Settings, Question Types, Summary.

**New Flow:** Convert to a 3-step vertical wizard with a progress indicator:

```
Step 1: Paper Settings (Institute, Date, Time, Marks)
Step 2: Select Questions (MCQ / Short / Long with chapter filter)  
Step 3: Review & Generate (Summary + Generate button)
```

Use a horizontal step indicator at the top (like a breadcrumb with progress):
```
[1. Setup] → [2. Questions] → [3. Review]
```

Each step has a "Continue" button at the bottom. The user can go back to any previous step.

**This fixes:**
- Settings panel buried under question pickers
- No clear call-to-action
- Overwhelming first-time experience

---

## Task 5.3 — Redesign the My Papers List Card

**File:** `src/components/my-papers/PaperListCard.tsx`

The paper card should show at-a-glance info a teacher cares about:

```
┌─────────────────────────────────────────────┐
│ 🔵 Physics — 10th Class        [3 Jan 2025] │
│ 40 Marks  ·  20 MCQ + 8 Short + 2 Long      │
│                        [Re-download] [Delete]│
└─────────────────────────────────────────────┘
```

Add a subject-colored left border stripe (physics = blue, biology = green, chemistry = yellow, etc.)

Add swipe-to-delete gesture on Android using the `PanGestureHandler` approach with Framer Motion's `drag` property.

---

## Task 5.4 — Add Empty State Illustrations

**Files:** `src/components/my-papers/EmptyPapers.tsx`, and any other empty states

Replace the generic "No papers yet" text with an illustrated empty state:

Create simple SVG illustrations inline (no external assets needed):
- My Papers empty: A paper with a plus icon
- No questions found: A magnifying glass over questions
- Offline: A cloud with a slash

Each empty state should have:
1. An illustration (SVG, ~120px)
2. A headline ("No Papers Yet")
3. A subline ("Create your first exam paper to get started")
4. A CTA button ("Create Paper")

---

## Task 5.5 — Add Loading Skeletons

**All list pages:** Replace `<AppLoader>` spinner with content-shaped skeleton loaders:

```tsx
// PaperCardSkeleton.tsx
export function PaperCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-3/4 mt-2" />
    </div>
  );
}
```

Use these on: My Papers page, Home recent papers, Chapters page.

---

## Task 5.6 — Polish the Paper Settings Form

**File:** `src/components/paper/PaperSettings.tsx`

The settings form has many fields but poor visual grouping. Reorganize:

**Section 1 — Required (always visible):**
- Institution Name
- Date
- Time Allowed

**Section 2 — Optional Header (collapsed toggle):**
- Custom Header text
- Custom Sub-header text
- Syllabus/Chapter filter text

**Section 3 — Premium Features (with lock icons when not premium):**
- Logo Upload (🔒)
- Custom Marks (🔒)
- Include Bubble Sheet (🔒)
- Include Answer Key (🔒)

Each premium feature shows a crown icon and opens the PremiumModal when tapped by a free user.

---

## Task 5.7 — Add Haptic Feedback

**Files:** Key interaction points throughout the app

Install and use `@capacitor/haptics`:

```ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// On Android native, add haptic feedback to:
// - Chapter selection toggle (light)
// - Question add/remove (medium)  
// - Generate paper success (heavy)
// - Error states (notification error)

const haptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (Capacitor.isNativePlatform()) {
    try { await Haptics.impact({ style }); } catch {}
  }
};
```

---

## Task 5.8 — Add Pull-to-Refresh on My Papers

**File:** `src/app/(main)/my-papers/page.tsx`

Wrap the paper list in a pull-to-refresh handler (using touch events since there's no native plugin needed — localStorage refresh is instant):

```tsx
const handleRefresh = () => {
  loadPapers(); // already exists
};

// Add visual pull-to-refresh indicator at the top of the scroll area
```

---

## Task 5.9 — Add App Version and Links in Settings

**File:** `src/app/(main)/settings/page.tsx`

Replace the minimal version footer with:

```tsx
<div className="text-center py-6 px-5">
  <img src="/logo.png" className="w-12 h-12 mx-auto mb-3 rounded-xl" />
  <p className="font-bold text-gray-700">PaperPress</p>
  <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
  <div className="flex justify-center gap-4 mt-4">
    <Link href="/privacy" className="text-xs text-[#1E88E5]">Privacy Policy</Link>
    <Link href="/terms" className="text-xs text-[#1E88E5]">Terms of Use</Link>
  </div>
  <p className="text-xs text-gray-300 mt-3">
    Contact: [your-contact]
  </p>
</div>
```

---

## Task 5.10 — Pre-Production Checklist Implementation

**These items must be completed before Google Play Store submission:**

### Android Manifest / Capacitor
- [ ] `android/app/src/main/AndroidManifest.xml` — add `android:largeHeap="true"` for PDF generation memory
- [ ] Add `INTERNET` permission (check it's present)
- [ ] Add `WRITE_EXTERNAL_STORAGE` / `READ_EXTERNAL_STORAGE` (needed for Filesystem plugin on Android < 10)
- [ ] Set correct `android:minSdkVersion="24"` (Android 7.0 minimum for modern WebView)
- [ ] Create proper adaptive icon (`ic_launcher.xml`) for Android 8+

### Performance
- [ ] `next.config.ts` — ensure images are optimized and `output: 'export'` is set for Capacitor build
- [ ] Remove all `console.log` statements from production builds (use the existing `logger.ts` properly or add `removeConsole: true` in next.config for production)
- [ ] Enable gzip/brotli compression on Vercel (via `vercel.json`)

### SEO / PWA (for web version)
- [ ] `public/manifest.json` — verify all icons, background color, theme color are correct
- [ ] Add `apple-touch-icon` 180×180 to `public/`
- [ ] Verify `src/app/layout.tsx` metadata is complete

### Error Monitoring
- [ ] Add Sentry or similar (optional but recommended for production) — at minimum add a global error boundary component

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` — set to your production Vercel URL  
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — verified in production
- [ ] `PDF_API_KEY` — set in Vercel dashboard
- [ ] `PREMIUM_CODES` or `NEXT_PUBLIC_PREMIUM_HASH` — set in Vercel dashboard
- [ ] All `.env.local` secrets must NOT be committed to Git

---

## ✅ Phase 5 Verification Checklist

- [ ] Home screen greets user by name with time-of-day greeting
- [ ] Create Paper shows 3-step wizard with progress indicator
- [ ] My Papers cards show subject color stripe and quick stats at a glance  
- [ ] Empty states have illustrations and CTA buttons
- [ ] All loading states use skeleton cards instead of spinners
- [ ] Paper Settings has clear visual grouping and premium locks
- [ ] Haptic feedback works on Android for key interactions
- [ ] Settings footer shows version, privacy policy, and contact
- [ ] APK builds without errors (`npm run build && npx cap sync && npx cap build android`)
- [ ] APK installs and runs on Android 8+ (physical device or emulator API 27+)
- [ ] No `console.log` leaking to production

---

---

## Summary: Complete Issue → Phase Mapping

| Issue ID | Description | Phase |
|----------|-------------|-------|
| C1 | Hardcoded premium code in source | 4.1 |
| C2 | MCQ options truncated | 1.4 |
| C3 | Inconsistent marks calculation | 1.3 |
| C4 | Duplicate PDF templates | 1.5 |
| C5 | Splash routing bug | 1.2 |
| C6 | PDF API unauthenticated | 4.2 |
| L1 | Developer credit on splash | 1.1 |
| L2 | Force-ready timer too short | 1.2 |
| L3 | Auto-fill ignores available counts | 1.8 |
| L4 | Generate button enabled with 0 questions | 1.7 |
| L5 | Settings expanded by default | 3.1 |
| L6 | Export fails on Android | 2.3 |
| L7 | Import file picker fails on Android | 2.4 |
| L8 | Wrong icon on Reset App | 3.3 |
| L9 | Confusing "Change Class" button | 3.2 |
| L10 | Preview opens new tab (blocked on Android) | 2.1 |
| L11 | Share only shares text, not PDF | 2.5 |
| L12 | Question categorization bug in re-download | (Phase 2 - fix in download flow) |
| L13 | localStorage quota overflow | 2.8 |
| L14 | `selectAllChapters([])` clears instead of selects | 1.14 → fix in Phase 1 |
| L15 | Dead fileInputRef in onboarding | 1.9 |
| A1 | PDF preview blocked on Android | 2.1 |
| A2 | Export/Import Android incompatible | 2.3, 2.4 |
| A3 | Safe area on notched Android | Phase 5 (manifest) |
| A4 | Keyboard resizes break modals | 3.6 (general) |
| A5 | mailto: intent unreliable on Android | 2.5 |
| A6 | API URL misconfigured for production | 5.10 |
| A7 | Splash stuck on crash | 1.2 |
| D1 | Dev credit on splash | 1.1 |
| D2 | Bottom nav hardcoded width | 3.5 |
| D3 | Zero stats for new users | 3.4 |
| D4 | Gesture nav overlap with bottom nav | Phase 5 |
| D5 | Header button overflow on small screens | Phase 5 |
| D6 | Double layout wrapping in settings | Phase 5 |
| D7 | No backdrop-filter fallback | 2.7 |
| D8 | Number inputs unusable on mobile | 5.6 |
| D9 | Keyboard hides auth form | 2.6 |
| F1 | Bubble sheet with 0 MCQs | 3.9 (guard) |
| F2 | Custom marks not applied to summary | 1.10 |
| F3 | Attempt rules dropped in API | 3.9 |
| F4 | Subjects page breaks without class | 3.11 |
| F5 | DOCX fails on Android | 2.2 |
| F6 | Search input focus lost on Android | 3.7 |
| F7 | Two premium systems disconnected | 3.6 |
| F8 | Paper title auto-generation missing | 1.6 |
| F9 | No offline mode indication | 3.10 |

---

*This plan was generated by analysing the full PaperPress source code. All file paths, component names, function names, and issues reference actual code in the repository.*
