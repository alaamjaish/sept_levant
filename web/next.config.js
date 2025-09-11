/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // ✅ disables ESLint blocking the build
    },
  };
  
  module.exports = nextConfig;
  