@echo off
REM PaperPress Android Build Script for Windows
REM This script prepares and builds the Next.js app for Android

echo ========================================
echo Starting PaperPress Android Build...
echo ========================================
echo.

REM Step 1: Clean previous builds
echo [Step 1/7] Cleaning previous builds...
if exist dist rmdir /s /q dist 2>nul
if exist .next rmdir /s /q .next 2>nul
if exist out rmdir /s /q out 2>nul
if exist android\app\src\main\assets\public rmdir /s /q android\app\src\main\assets\public 2>nul
echo Done.
echo.

REM Step 2: Backup API folder
echo [Step 2/7] Backing up API folder...
if exist src\app\api (
    if exist src\api_backup rmdir /s /q src\api_backup
    xcopy src\app\api src\api_backup\ /E /I /Q
    echo API folder backed up.
) else (
    echo ERROR: API folder not found!
    exit /b 1
)
echo.

REM Step 3: Remove API folder
echo [Step 3/7] Removing API folder for static export...
if exist src\app\api rmdir /s /q src\app\api
echo Done.
echo.

REM Step 4: Update next.config.ts for static export
echo [Step 4/7] Configuring Next.js for static export...
(
echo import type { NextConfig } from "next";
echo.
echo const nextConfig: NextConfig = {
echo   output: 'export',
echo   distDir: 'dist',
echo   images: {
echo     unoptimized: true,
echo   },
echo   trailingSlash: true,
echo   reactStrictMode: true,
echo };
echo.
echo export default nextConfig;
) > next.config.build.ts

REM Backup and replace
move /y next.config.ts next.config.dev.ts.bak >nul
move /y next.config.build.ts next.config.ts >nul
echo Done.
echo.

REM Step 5: Build Next.js
echo [Step 5/7] Building Next.js app...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    move /y next.config.dev.ts.bak next.config.ts >nul
    if exist src\api_backup move src\api_backup src\app\api
    exit /b 1
)
echo Build complete.
echo.

REM Step 6: Restore original config
echo [Step 6/7] Restoring original Next.js config...
move /y next.config.dev.ts.bak next.config.ts >nul
echo Done.
echo.

REM Step 7: Restore API folder
echo [Step 7/7] Restoring API folder...
move src\api_backup src\app\api
echo Done.
echo.

REM Step 8: Sync with Capacitor
echo Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    exit /b 1
)
echo Done.
echo.

echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npx cap open android
echo 2. In Android Studio: Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
echo 3. APK: android\app\build\outputs\apk\release\app-release.apk
echo.
echo Opening Android Studio...
call npx cap open android
