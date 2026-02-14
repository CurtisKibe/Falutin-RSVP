/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io', 
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
      },
    ],
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api', 
      },
    ];
  },
};

export default nextConfig;