// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'hairdobooking.com',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;

