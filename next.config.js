/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'res.cloudinary.com',
      'localhost'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  serverExternalPackages: ['mongoose'],
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable compression
  compress: true,
  // Cache build information between builds
  experimental: {
    // This enables long-term caching for the build output
    optimizeCss: true,
    // Optimize output bundling
    optimizePackageImports: ['lucide-react'],
  },
  // Configure output for better debugging
  output: 'standalone',
};

module.exports = nextConfig; 