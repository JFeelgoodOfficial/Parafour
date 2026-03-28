import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Parafour — Precision LPG Dispensing Systems',
  description: 'Industrial-grade LPG dispensing systems engineered for reliability, safety, and operational excellence. P4-SFCP series — built for the demands of real-world fuel operations.',
  keywords: ['LPG dispenser', 'gas dispensing systems', 'industrial LPG', 'P4-SFCP', 'fuel station equipment', 'Parafour'],
  openGraph: {
    title: 'Parafour — Precision LPG Dispensing Systems',
    description: 'Engineering-grade dispensing systems for industrial fuel operations.',
    type: 'website',
    url: 'https://parafour.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parafour — Precision LPG Dispensing Systems',
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0E10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="noise-overlay">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
