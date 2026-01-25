import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SuppressPreloadWarnings } from '@/components/suppress-preload-warnings'
import { AuthProvider } from '@/contexts/auth-context'
import { AuthWrapper } from '@/components/auth-wrapper'
import './globals.css'

// Load Inter font - optimized for ERP/dashboard applications
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  // Optimize for readability
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'ERP Development',
  description: 'Dashboard dengan dukungan multi-bahasa',
  generator: 'v0.app',
  other: {
    // Suppress preload warnings by optimizing resource hints
    'x-preload-optimization': 'true',
  },
}

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({children}: Props) {
  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} style={{ fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1', fontKerning: 'normal', fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
        <SuppressPreloadWarnings />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
