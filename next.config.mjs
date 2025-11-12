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
}

export default withNextIntl(nextConfig);
