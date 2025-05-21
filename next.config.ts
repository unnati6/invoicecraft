
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Allow any path for placehold.co
      },
      {
        protocol: 'https',
        hostname: 'revynox.com',
        port: '',
        pathname: '/**', // Allow any path for revynox.com
      },
    ],
  },
};

export default nextConfig;
