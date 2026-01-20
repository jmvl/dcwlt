import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Manrope } from 'next/font/google';
import { PrivyAuthProvider } from './components/PrivyProvider';
import { ConvexClientProvider } from './components/ConvexProvider';
import { QueryProvider } from './components/QueryProvider';
import ServiceWorkerRegister from './components/ServiceWorkerRegister';
import { Toaster } from 'sonner';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Wallet',
  description: 'Frictionless payments at live events',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
  },
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={manrope.className}>
        <PrivyAuthProvider>
          <ConvexClientProvider>
            <QueryProvider>
              <ServiceWorkerRegister />
              {children}
              <Toaster
                position="top-center"
                duration={5000}
                toastOptions={{
                  style: {
                    background: '#1a2f38',
                    border: '1px solid #13a4ec',
                    color: '#fff',
                  },
                }}
              />
            </QueryProvider>
          </ConvexClientProvider>
        </PrivyAuthProvider>
      </body>
    </html>
  );
}
