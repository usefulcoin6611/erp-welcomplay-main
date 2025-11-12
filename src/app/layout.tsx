import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Dashboard v0',
  description: 'Dashboard dengan dukungan multi-bahasa',
  generator: 'v0.app',
}

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({children}: Props) {
  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
