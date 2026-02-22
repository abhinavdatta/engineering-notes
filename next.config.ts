import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use 'export' for static hosting (GitHub Pages)
  output: "export",
  
  // For GitHub Pages, set this to your repo name
  // basePath: "/engineering-notes",
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
