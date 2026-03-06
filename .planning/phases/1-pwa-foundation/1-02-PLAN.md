---
phase: 1-pwa-foundation
plan: 02
type: execute
wave: 1
depends_on: [1-01]
files_modified: [pwa/package.json, pwa/next.config.ts, pwa/app/sw.ts, pwa/next.config.ts]
autonomous: true

must_haves:
  truths:
    - "Service worker registers successfully"
    - "DevTools Application panel shows active SW"
    - "Static assets cached (verified in Cache Storage)"
    - "App loads offline after first visit"
  artifacts:
    - path: "pwa/package.json"
      provides: "Project dependencies"
      contains: "serwist"
    - path: "pwa/app/sw.ts"
      provides: "Service worker configuration"
      min_lines: 40
    - path: "pwa/app/layout.tsx"
      provides: "Root layout with SW registration"
      contains: "useRegisterSW"
  key_links:
    - from: "pwa/app/layout.tsx"
      to: "Service worker"
      via: "useRegisterSW hook"
---

<objective>
Configure Serwist service worker with caching strategies for offline capability.

Purpose: Enable PWA offline functionality by caching static assets and API responses. This is critical for venue environments with saturated networks.

Output: Service worker that caches static assets (cache-first) and sets up runtime caching strategy for API calls (network-first)
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/codebase/CONVENTIONS.md
@.planning/phases/1-pwa-foundation/1-CONTEXT.md

**Phase 1 Requirements (Service Worker):**
- PWA-07: Service worker caches static assets immediately for offline resilience
- OFF-01: Service worker caches all static assets
- OFF-02: Runtime caching for API responses
- OFF-03: Cache-first strategy for static assets
- OFF-04: Network-first strategy for API calls

**Tech Stack Decisions:**
- Serwist - Next.js 16 compatible service worker library (successor to workbox)
- @serwist/next - Next.js integration plugin
- Cache-first for static assets (JS, CSS, fonts)
- Network-first for API calls (fresh data critical for balances)

**Codebase Context:**
- Requires Next.js 16 project from Plan 1-01
- Service worker scope: /
- Cache name: `event-wallet-v1`

**Known Constraints:**
- Service worker only works in production (build mode)
- Development mode bypasses service worker for HMR
</context>

<tasks>
<task type="auto">
  <name>Task 1: Install Serwist dependencies</name>
  <files>pwa/package.json</files>
  <action>
1. Install Serwist packages:
   ```bash
   cd pwa
   npm install serwist @serwist/next
   ```

2. Remove @ducanh2912/next-pwa (replaced by Serwist):
   ```bash
   npm uninstall @ducanh2912/next-pwa
   ```

3. Verify serwist and @serwist/next are in package.json dependencies
  </action>
  <verify>grep -q "serwist" pwa/package.json; npm list serwist shows no errors</verify>
  <done>Serwist dependencies installed</done>
</task>

<task type="auto">
  <name>Task 2: Configure Next.js with Serwist plugin</name>
  <files>pwa/next.config.ts</files>
  <action>
Replace the contents of next.config.ts:
   ```typescript
   import type { NextConfig } from "next";
   import { withSerwistInit } from "@serwist/next";

   const nextConfig: NextConfig = {
     reactStrictMode: true,
   };

   export default withSerwistInit(nextConfig, {
     swSrc: "app/sw.ts",
     swDest: "public/sw.js",
   });
   ```

This configures Serwist to compile app/sw.ts to public/sw.js.
  </action>
  <verify>npm run build succeeds; public/sw.js is generated</verify>
  <done>Next.js configured with Serwist plugin</done>
</task>

<task type="auto">
  <name>Task 3: Create service worker configuration</name>
  <files>pwa/app/sw.ts</files>
  <action>
Create app/sw.ts with caching strategies:
   ```typescript
   import { defaultCache, defaultPrecache } from "@serwist/next/browser";
   import { PrecacheEntry, Serwist } from "serwist";

   declare global {
     interface WorkerGlobalScope {
       __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
     }
   }

   declare const self: ServiceWorkerGlobalScope;

   const serwist = new Serwist({
     precacheEntries: self.__SW_MANIFEST,
     skipWaiting: true,
     clientsClaim: true,
     navigationPreload: true,
     runtimeCaching: [
       {
         urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
         handler: "CacheFirst",
         options: {
           cacheName: "google-fonts",
           expiration: {
             maxEntries: 4,
             maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
           },
         },
       },
       {
         urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
         handler: "StaleWhileRevalidate",
         options: {
           cacheName: "static-font-assets",
           expiration: {
             maxEntries: 4,
             maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
           },
         },
       },
       {
         urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
         handler: "StaleWhileRevalidate",
         options: {
           cacheName: "static-image-assets",
           expiration: {
             maxEntries: 64,
             maxAgeSeconds: 24 * 60 * 60, // 24 hours
           },
         },
       },
       {
         urlPattern: /\/api\/.*$/i,
         handler: "NetworkFirst",
         options: {
           cacheName: "api-calls",
           networkTimeoutSeconds: 10,
           expiration: {
             maxEntries: 16,
             maxAgeSeconds: 60, // 1 minute - stale balance data
           },
           cacheableResponse: {
             statuses: [0, 200],
           },
         },
       },
       {
         urlPattern: /\.(?:js|css)$/i,
         handler: "StaleWhileRevalidate",
         options: {
           cacheName: "static-js-css-assets",
           expiration: {
             maxEntries: 32,
             maxAgeSeconds: 24 * 60 * 60, // 24 hours
           },
         },
       },
     ],
   });

   serwist.addEventListeners();
   ```

Covers requirements:
- PWA-07: Static assets cached immediately
- OFF-01: All static assets cached
- OFF-02: Runtime caching for API
- OFF-03: Cache-first for static (StaleWhileRevalidate is safer)
- OFF-04: Network-first for API
  </action>
  <verify>Build completes without TypeScript errors in sw.ts</verify>
  <done>Service worker configured with caching strategies</done>
</task>

<task type="auto">
  <name>Task 4: Add service worker registration to root layout</name>
  <files>pwa/app/layout.tsx</files>
  <action>
Modify app/layout.tsx to register service worker:
   ```tsx
   'use client';

   import type { Metadata } from 'next';
   import './globals.css';
   import { Manrope } from 'next/font/google';
   import { useRegisterSW } from '@serwist/next/registerSW';
   import { useEffect } from 'react';

   const manrope = Manrope({ subsets: ['latin'] });

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     useRegisterSW({
       onRegistered(registration) {
         console.log('✅ Service Worker registered:', registration);
       },
       onRegisterError(error) {
         console.error('❌ Service Worker registration error:', error);
       },
     });

     return (
       <html lang="en" className="dark">
         <body className={manrope.className}>{children}</body>
       </html>
     );
   }
   ```

Note: Adding 'use client' directive for SW registration hook.
  </action>
  <verify>npm run build; Chrome DevTools Application panel shows registered SW</verify>
  <done>Service worker registration added to root layout</done>
</task>

<task type="auto">
  <name>Task 5: Update root layout metadata</name>
  <files>pwa/app/layout.tsx</files>
  <action>
Since layout.tsx is now a client component, metadata must be handled separately.
Create app/head.tsx:
   ```tsx
   import type { Metadata } from 'next';

   export const metadata: Metadata = {
     title: 'Event Wallet',
     description: 'Frictionless payments at live events',
     manifest: '/manifest.json',
     themeColor: '#13a4ec',
     appleWebApp: {
       capable: true,
       statusBarStyle: 'black-translucent',
       title: 'Event Wallet',
     },
     viewport: {
       width: 'device-width',
       initialScale: 1,
       maximumScale: 1,
     },
   };

   export default function Head() {
     return <></>;
   }
   ```

Then update app/layout.tsx to import and use the head:
   ```tsx
   'use client';

   import './globals.css';
   import { Manrope } from 'next/font/google';
   import { useRegisterSW } from '@serwist/next/registerSW';
   import Head from './head';

   const manrope = Manrope({ subsets: ['latin'] });

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     useRegisterSW({
       onRegistered(registration) {
         console.log('✅ Service Worker registered:', registration);
       },
       onRegisterError(error) {
         console.error('❌ Service Worker registration error:', error);
       },
     });

     return (
       <html lang="en" className="dark">
         <head>
           <Head />
         </head>
         <body className={manrope.className}>{children}</body>
       </html>
     );
   }
   ```
  </action>
  <verify>npm run dev; page source has manifest link and theme-color meta</verify>
  <done>Metadata properly configured in Next.js 16 App Router</done>
</task>

<task type="auto">
  <name>Task 6: Verify offline capability</name>
  <files>pwa/</files>
  <action>
1. Build the production app: `npm run build`
2. Start production server: `npm run start`
3. Open http://localhost:3000 in Chrome
4. Open DevTools → Application → Service Workers
5. Verify "sw.js" is registered and active
6. Open DevTools → Application → Cache Storage
7. Verify caches exist: "workbox-precache-v2-...", "static-js-css-assets", etc.
8. Enable "Offline" mode in DevTools Network tab
9. Reload page
10. Verify app still loads (no "no internet" dinosaur)

This confirms PWA offline functionality works.
  </action>
  <verify>App loads successfully in offline mode with cached assets</verify>
  <done>Offline capability verified</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] npm run build completes successfully
- [ ] public/sw.js is generated after build
- [ ] Service worker registers in production mode
- [ ] DevTools shows active service worker
- [ ] Cache Storage contains cached assets
- [ ] App loads successfully in offline mode
- [ ] Console shows "Service Worker registered" message
</verification>

<success_criteria>
- Serwist configured and service worker compiles
- Service worker registers successfully in production
- Static assets cached (precache + runtime caching)
- API calls use network-first strategy
- Fonts and images cached with appropriate TTL
- App loads offline after first visit
</success_criteria>

<output>
After completion, create `.planning/phases/1-pwa-foundation/1-02-SUMMARY.md` with:
- Service worker configuration details (strategies used, cache names)
- Verification steps (how to test offline mode)
- Cache strategy summary table
- Next steps (proceed to Plan 1-03: PWA install prompt)
- Any deviations from plan
</output>
