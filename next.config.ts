import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
