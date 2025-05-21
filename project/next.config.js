/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
  experimental: {
    // Remove any experimental options that might cause issues
  },
};

module.exports = nextConfig;