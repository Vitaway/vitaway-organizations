import type { NextConfig } from "next";
import { resolveApiBaseUrl } from "./lib/api-base";

const nextConfig: NextConfig = {
  async rewrites() {
    const upstream = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
    return [
      {
        source: "/api/care/:path*",
        destination: `${upstream}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ehr.vitaway.org',
        pathname: '/logo.png',
      },
    ],
  },
};

export default nextConfig;
