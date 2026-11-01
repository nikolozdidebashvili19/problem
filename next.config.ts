import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const nextConfigDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: nextConfigDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Report photos (T-012); delivered via Cloudinary transformations, not Vercel image optimization
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

// Locale is resolved per request from a cookie (Georgian by default), see src/shared/lib/i18n-request.ts
const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n-request.ts');

export default withNextIntl(nextConfig);
