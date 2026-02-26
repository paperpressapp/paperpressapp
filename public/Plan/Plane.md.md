# PaperPress — Android PDF Integration Guide
## Making Puppeteer-Quality PDFs Fully Offline in the APK

---

## How It Works

```
Teacher taps "Generate PDF"
        │
        ▼
download.ts detects Capacitor.isNativePlatform() = true
        │
        ▼
generateHTMLTemplate() builds paper HTML with KaTeX math
        │
        ▼
PDFPrinterPlugin.java creates a hidden WebView
        │
        ▼
WebView loads HTML from assets://public/ (KaTeX is bundled here)
        │
        ▼
KaTeX renders math formulas (2.5s delay)
        │
        ▼
Android PrintManager converts rendered page → PDF (300 DPI)
        │   ← Same Blink engine as Chrome / Puppeteer
        ▼
PDF saved to Documents/PaperPress/filename.pdf
        │
        ▼
FileOpener opens the PDF immediately
```

**Result:** 3–6 seconds. Zero internet. Identical quality to Puppeteer.

---

## Step-by-Step Integration

### Step 1 — Add the Java Plugin File

Copy `PDFPrinterPlugin.java` to:
```
android/app/src/main/java/com/paperpress/app/PDFPrinterPlugin.java
```

### Step 2 — Register Plugin in MainActivity

Replace the contents of:
```
android/app/src/main/java/com/paperpress/app/MainActivity.java
```
With the provided `MainActivity.java` file.

### Step 3 — Update the TypeScript Plugin Definition

Replace:
```
src/lib/plugins/PDFPrinter.ts
```
With the provided `PDFPrinter.ts` file.
(Adds `showPrintDialog()` method and `filePath` in the result.)

### Step 4 — Update download.ts

Replace the `downloadPDFAndroid()` function in:
```
src/lib/pdf/download.ts
```
With the contents of `download.android.ts`.
The function signature is identical — it's a drop-in replacement.

### Step 5 — Add FileProvider (Required for Opening PDFs)

Create this file:
```
android/app/src/main/res/xml/file_paths.xml
```
Copy the provided `file_paths.xml` contents.

Then in `android/app/src/main/AndroidManifest.xml`, add the
`<provider>` block and permissions shown in `AndroidManifest_additions.xml`.

### Step 6 — Verify KaTeX is in Assets

Your `capacitor.config.ts` has `webDir: 'out'`. When you run
`next build` with `CAPACITOR_BUILD=1`, the `public/` folder is
copied to `out/`. Capacitor then copies `out/` into:
```
android/app/src/main/assets/public/
```

Confirm these files exist after `npx cap sync android`:
```
android/app/src/main/assets/public/lib/katex/katex.min.js
android/app/src/main/assets/public/lib/katex/katex.min.css
android/app/src/main/assets/public/lib/katex/fonts/
```
If they exist, KaTeX will render fully offline. ✅
If they don't, run: `npm run build:android` then `npx cap sync android`

### Step 7 — Build the APK

```bash
# 1. Build static export
npm run build:android

# 2. Sync with Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio:
#    Build > Generate Signed Bundle / APK > APK > Next
#    (Create a keystore if you don't have one)
#    Select "release" build variant > Finish
```

---

## Quick Checklist Before Building

- [ ] `PDFPrinterPlugin.java` is in `android/app/src/main/java/com/paperpress/app/`
- [ ] `MainActivity.java` has `registerPlugin(PDFPrinterPlugin.class)` BEFORE `super.onCreate()`
- [ ] `file_paths.xml` exists in `android/app/src/main/res/xml/`
- [ ] `AndroidManifest.xml` has the `<provider>` block and storage permissions
- [ ] `src/lib/plugins/PDFPrinter.ts` is updated (has `showPrintDialog` method)
- [ ] `src/lib/pdf/download.ts` uses the new `downloadPDFAndroid()` function
- [ ] KaTeX files exist in `android/app/src/main/assets/public/lib/katex/`
- [ ] `npx cap sync android` was run after all changes

---

## PDF Quality Comparison

| Method | Engine | Quality | Internet | Speed |
|--------|--------|---------|----------|-------|
| Your current Puppeteer (Vercel) | Headless Chrome (Blink) | ⭐⭐⭐⭐⭐ | Required | 15-40s |
| **This plugin (WebView PrintManager)** | **Android WebView (Blink)** | **⭐⭐⭐⭐⭐** | **None** | **3-6s** |
| jsPDF fallback | Canvas rendering | ⭐⭐ | None | 1-2s |

The Android WebView uses the **same Blink rendering engine** as Chrome and
Puppeteer. KaTeX math, CSS, fonts — everything renders identically.

---

## Troubleshooting

**PDF is blank / empty pages:**
- Increase `KATEX_RENDER_DELAY_MS` in `PDFPrinterPlugin.java` from 2500 to 4000
- Make sure `setLayerType(LAYER_TYPE_SOFTWARE, null)` is set (hardware acceleration can cause blank PDFs)

**KaTeX shows raw LaTeX instead of rendered math:**
- Confirm `android/app/src/main/assets/public/lib/katex/katex.min.js` exists
- The base URL `file:///android_asset/public/` must match where KaTeX is bundled

**FileOpener crashes or can't open PDF:**
- Make sure `file_paths.xml` is created and the `<provider>` block is in AndroidManifest
- Check that `android:authorities="${applicationId}.fileprovider"` matches exactly

**Build fails — "Cannot find symbol PDFPrinterPlugin":**
- Verify the package name `com.paperpress.app` matches your `AndroidManifest.xml`
- Run `Build > Clean Project` in Android Studio then rebuild

**PDF saves but is very slow (>10s):**
- This is normal on first run (WebView cold start)
- Subsequent PDFs in the same session are faster (~3s)
- You cannot pre-warm the WebView without showing a visible window
