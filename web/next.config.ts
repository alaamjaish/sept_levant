import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid failing Vercel builds on ESLint rules during production builds.
  // Keep ESLint for local development via `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;



