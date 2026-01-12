import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['next-devtools-mcp', 'lucide-react', 'next-intl'],
  },
  // Configure Turbopack (Next.js 16 default)
  turbopack: {},
  // Enable development mode features for MCP
  env: {
    MCP_ENABLED: 'true',
  },
  // Optimize resource loading to reduce preload warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

export default withNextIntl(nextConfig);
