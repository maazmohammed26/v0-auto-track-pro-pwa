import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'AutoTrackPro',
  description: 'Personal vehicle management — track fuel, service, and expenses for all your vehicles.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AutoTrackPro',
  },
}

export const viewport: Viewport = {
  themeColor: '#F5F4F0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: '999px',
              background: 'oklch(0.22 0.01 260)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 20px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
