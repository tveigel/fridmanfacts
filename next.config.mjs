/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      domains: ['firebasestorage.googleapis.com'],
      unoptimized: true,
    }
  };
  
  export default nextConfig;