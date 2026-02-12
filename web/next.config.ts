/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io', // Allow Sanity images
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Allow Unsplash images
      },
    ],
  },
};

export default nextConfig;