'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Create a dummy Convex client for SSR
// This allows useMutation/useQuery to not throw during build
const getConvexClient = () => {
  if (typeof window !== 'undefined') {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      return new ConvexReactClient(convexUrl);
    }
  }
  // Return a minimal client for SSR
  return new ConvexReactClient('https://dummy.convex.cloud');
};

const convex = getConvexClient();

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
