import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Wallet',
  description: 'Frictionless payments at live events',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Event Wallet',
  },
  other: {
    'theme-color': '#13a4ec',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#13a4ec',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
