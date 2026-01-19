'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

let convexClient: ConvexReactClient | null = null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexClient) {
    // Only create client in browser with valid URL
    if (typeof window !== 'undefined') {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      console.log('[ConvexClientProvider] NEXT_PUBLIC_CONVEX_URL:', convexUrl);
      if (convexUrl && convexUrl !== 'https://dummy.convex.cloud') {
        convexClient = new ConvexReactClient(convexUrl);
        console.log('[ConvexClientProvider] Created client with URL:', convexUrl);
      } else {
        console.log('[ConvexClientProvider] Using dummy client');
        convexClient = new ConvexReactClient('https://dummy.convex.cloud');
      }
    } else {
      convexClient = new ConvexReactClient('https://dummy.convex.cloud');
    }
  }

  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  );
}
