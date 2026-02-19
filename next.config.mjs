import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Route project system: timesheet-list & projectstages pakai (project-system) layout. Yang lain tetap rewrite ke /projects/*
  async rewrites() {
    return [
      { source: '/project', destination: '/projects' },
      { source: '/time-tracker', destination: '/projects/time-tracker' },
      { source: '/accounting/bill/edit/:id', destination: '/accounting/bill/create/:id' },
    ];
  },
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
  // Webpack configuration for when using --webpack flag
  webpack: (config, { isServer }) => {
    // Only modify webpack config if needed
    // Next.js handles CSS extraction automatically
    return config;
  },
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
