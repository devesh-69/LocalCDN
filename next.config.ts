import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase size limit for image uploads
    },
  },
};

export default nextConfig;
