import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid failing Vercel builds on ESLint rules during production builds.
  // Keep ESLint for local development via `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure Turbopack selects this folder as the workspace root
  // when the repository contains multiple lockfiles.
  turbopack: {
    root: ".",
  },
};

export default nextConfig;



