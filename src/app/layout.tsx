import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SuppressPreloadWarnings } from '@/components/suppress-preload-warnings'
import { AuthProvider } from '@/contexts/auth-context'
import { AuthWrapper } from '@/components/auth-wrapper'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
      <body className={`font-sans antialiased`} suppressHydrationWarning>
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
