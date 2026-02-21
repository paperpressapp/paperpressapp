# PaperPress - Development Status

## Architecture

```
┌─────────────────┐         ┌────────────────────┐
│   Android App   │  HTTP   │   Vercel Server    │
│   (Capacitor)   │ ──────▶ │   (Next.js API)    │
│                 │ ◀────── │   (Puppeteer)      │
└─────────────────┘   PDF   └────────────────────┘
```

## PDF Generation Strategy

### Primary: Server API (Puppeteer)
- **URL**: `https://paperpress.vercel.app/api/generate-pdf`
- **Method**: POST
- **Body**: `{ settings, mcqs, shorts, longs }`
- **Response**: PDF binary
- **Quality**: Best (HTML + KaTeX rendering)
- **Requires**: Internet connection

### Fallback: Offline (jsPDF)
- **Function**: `generatePDFOffline()`
- **Quality**: Good (basic formatting)
- **Requires**: No internet

## Tech Stack
- Next.js 16 with Turbopack
- Supabase for auth and database
- Capacitor for Android/iOS
- Tailwind CSS + shadcn/ui
- Puppeteer for server-side PDF (best quality)
- jsPDF for offline PDF fallback

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://wwunkrocoutiiyhmgrzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://paperpress.vercel.app
```

## Build Commands

### Development
```bash
npm run dev
```

### Build for Android APK
```bash
# 1. Move API folder (static export doesn't support API routes)
mv src/app/api src/api_backup

# 2. Update next.config.ts - add: output: 'export'

# 3. Build
npm run build

# 4. Restore API folder
mv src/api_backup src/app/api

# 5. Remove output: 'export' from next.config.ts

# 6. Sync with Capacitor
npx cap sync android

# 7. Open Android Studio
npx cap open android
```

### In Android Studio
1. Wait for Gradle sync
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. APK: `android/app/build/outputs/apk/release/app-release.apk`

## Key Files

### PDF System
- `src/app/api/generate-pdf/route.ts` - Server API endpoint
- `src/lib/pdf/download.ts` - Android download logic
- `src/lib/pdf/puppeteerPDF.ts` - Server-side PDF generation
- `src/lib/pdf/professionalPDF.ts` - Offline fallback

### Layout Components
- `src/components/layout/MainLayout.tsx` - Safe area handling
- `src/components/layout/BottomNavigation.tsx` - Nav with safe areas
- `src/app/globals.css` - GPU acceleration utilities

## PDF Location on Android
```
/Documents/PaperPress/9th_Physics_2024-01-15.pdf
```

## Premium Code
- Code: `PPBHK656`

## Common Issues

### "Failed to fetch" on Android
1. Check internet connection
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Ensure Vercel deployment is live

### PDF not opening
1. Check `file_paths.xml` has Documents path
2. FileProvider must include all paths

### Build errors
1. Always move `src/app/api` before building
2. Clean `.next` and `dist` folders if needed
