#!/bin/bash

# PaperPress Android Build Script
# This script prepares and builds the Next.js app for Android

set -e

echo "🚀 Starting PaperPress Android Build..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous builds
echo -e "${YELLOW}Step 1: Cleaning previous builds...${NC}"
rm -rf dist .next out 2>/dev/null || true
rm -rf android/app/src/main/assets/public 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned previous builds${NC}"

# Step 2: Backup API folder
echo -e "${YELLOW}Step 2: Backing up API folder...${NC}"
if [ -d "src/app/api" ]; then
    rm -rf src/api_backup 2>/dev/null || true
    cp -r src/app/api src/api_backup
    echo -e "${GREEN}✓ API folder backed up to src/api_backup${NC}"
else
    echo -e "${RED}✗ API folder not found!${NC}"
    exit 1
fi

# Step 3: Remove API folder for static export
echo -e "${YELLOW}Step 3: Removing API folder for static export...${NC}"
rm -rf src/app/api
echo -e "${GREEN}✓ API folder removed${NC}"

# Step 4: Update next.config.ts for static export
echo -e "${YELLOW}Step 4: Configuring Next.js for static export...${NC}"
cat > next.config.build.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
EOF

# Backup original config and use build config
mv next.config.ts next.config.dev.ts.bak
mv next.config.build.ts next.config.ts
echo -e "${GREEN}✓ Next.js configured for static export${NC}"

# Step 5: Build Next.js
echo -e "${YELLOW}Step 5: Building Next.js app...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed!${NC}"
    # Restore configs
    rm next.config.ts
    mv next.config.dev.ts.bak next.config.ts
    mv src/api_backup src/app/api
    exit 1
fi
echo -e "${GREEN}✓ Next.js build complete${NC}"

# Step 6: Restore original config
echo -e "${YELLOW}Step 6: Restoring original Next.js config...${NC}"
rm next.config.ts
mv next.config.dev.ts.bak next.config.ts
echo -e "${GREEN}✓ Original config restored${NC}"

# Step 7: Restore API folder
echo -e "${YELLOW}Step 7: Restoring API folder...${NC}"
mv src/api_backup src/app/api
echo -e "${GREEN}✓ API folder restored${NC}"

# Step 8: Sync with Capacitor
echo -e "${YELLOW}Step 8: Syncing with Capacitor...${NC}"
npx cap sync android
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Capacitor sync failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Capacitor sync complete${NC}"

# Step 9: Open Android Studio (optional)
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Build Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npx cap open android"
echo "2. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "3. APK location: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Or run: npx cap open android"
