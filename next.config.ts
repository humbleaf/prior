import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
