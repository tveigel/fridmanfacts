/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      domains: ['firebasestorage.googleapis.com'],
      unoptimized: true,
    },
    trailingSlash: true,
    experimental: {
      serverActions: true
    },
    // Add explicit configuration for production build
    distDir: '.next',
    generateBuildId: async () => 'build',
  };
  
  export default nextConfig;