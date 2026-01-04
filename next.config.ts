import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configure for Turbopack
  turbopack: {
    // Turbopack configuration here if needed
  },
};

export default nextConfig;
