import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // REMOVED: output: 'export' - Now using server mode for API routes
  trailingSlash: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
