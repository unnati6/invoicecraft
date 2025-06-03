
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
    domains: [ // <-- 'remotePatterns' को 'domains' से बदलें
      'placehold.co',
      'revynox.com',
      'zezgtccnyfohfwhzfzix.supabase.co', // <-- आपका Supabase डोमेन यहाँ जोड़ें
    ],
  },
};

export default nextConfig;
