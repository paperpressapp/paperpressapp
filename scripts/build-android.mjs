/**
 * Android APK Build Script
 *
 * Strategy:
 * 1. Clear Next.js cache
 * 2. Build with CAPACITOR_BUILD=1 (output: 'export' → out/)
 * 3. Cap sync android
 *
 * The APK uses PDFPrinterPlugin (native WebView) for PDF — no API routes needed.
 * Web fallback calls Vercel live API (https://paperpressapp.vercel.app).
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const nextCache = join(root, '.next');
const outDir = join(root, 'out');

const run = (cmd, env = {}) => {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
};

// ── Step 1: Clear caches ──────────────────────────────────────
console.log('\n🧹 Clearing Next.js build cache...');
if (existsSync(nextCache)) rmSync(nextCache, { recursive: true, force: true });
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });

try {
    // ── Step 2: Static build ─────────────────────────────────────
    console.log('\n📦 Building Next.js (static export for Android)...');
    run('next build', { CAPACITOR_BUILD: '1' });

    if (!existsSync(join(outDir, 'index.html'))) {
        throw new Error('Build failed: out/index.html not found');
    }
    console.log('\n✅ Static build complete → out/');

    // ── Step 3: Cap sync ─────────────────────────────────────────
    console.log('\n🔄 Syncing with Capacitor Android...');
    run('npx cap sync android');

    console.log('\n🎉 Done! Ready for Android Studio.');
    console.log('   Open Android Studio: npx cap open android\n');

} catch (err) {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
}
