---
phase: 1-pwa-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [pwa/package.json, pwa/next.config.ts, pwa/app/layout.tsx, pwa/app/manifest.ts, pwa/app/icon.tsx, pwa/public/app-icon.png]
autonomous: true

must_haves:
  truths:
    - "Next.js 16 app runs in development mode"
    - "TypeScript compiles without errors"
    - "PWA manifest validates (no browser errors)"
    - "Dev server responds on localhost:3000"
  artifacts:
    - path: "pwa/package.json"
      provides: "Project dependencies and scripts"
      contains: "\"next\": \"^16\""
    - path: "pwa/next.config.ts"
      provides: "Next.js configuration with PWA plugin"
      contains: "withPWA"
    - path: "pwa/app/manifest.ts"
      provides: "PWA manifest configuration"
      min_lines: 20
    - path: "pwa/public/app-icon.png"
      provides: "PWA icon (512x512 minimum)"
      exists: true
  key_links:
    - from: "pwa/app/layout.tsx"
      to: "PWA manifest"
      via: "metadata manifest export"
---

<objective>
Create Next.js 16 project with PWA manifest as the foundation for the Event Wallet PWA.

Purpose: Establish the base project structure with PWA capabilities. This is the foundation layer - without it, no other PWA features can work.

Output: Working Next.js 16 app with TypeScript, PWA manifest, and base icon set running on localhost:3000
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/DESIGN.md
@.planning/codebase/CONVENTIONS.md
@.planning/codebase/STACK.md
@.planning/phases/1-pwa-foundation/1-CONTEXT.md

**Phase 1 Requirements (PWA Installation):**
- PWA-01 through PWA-09: PWA manifest, icons, install prompts, iOS fallback
- This plan covers: PWA-04 (manifest), PWA-05 (icons), PWA-06 (theme color)

**Tech Stack Decisions:**
- Next.js 16+ (App Router) - Chosen for PWA support and developer velocity
- TypeScript - For type safety throughout
- Tailwind CSS - For styling (Shadcn/UI dependency)
- Serwist - For service worker/PWA functionality (Plan 1-02)
- @ducanh2912/next-pwa - PWA manifest generation

**Design System:**
- Dark mode default: `--background-dark: #101c22`, `--primary: #13a4ec`
- Font: Manrope (Google Fonts)
- Material Symbols Outlined icons

**Codebase Context:**
- Existing React Native POC (event-wallet/) is REFERENCE ONLY - not modified
- This is a NEW PWA project in `pwa/` directory
- Follow established naming: PascalCase components, camelCase utilities
</context>

<tasks>
<task type="auto">
  <name>Task 1: Create Next.js 16 project with App Router</name>
  <files>pwa/package.json, pwa/tsconfig.json, pwa/next.config.ts, pwa/.gitignore</files>
  <action>
Create pwa/ directory and initialize Next.js 16 project:
1. Run: `mkdir -p pwa && cd pwa`
2. Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --yes`
3. This creates: package.json (Next.js 16), tsconfig.json, next.config.ts, .gitignore, app/ directory structure
4. Verify package.json has Next.js ^16.x
5. Create .env.local with empty file for future environment variables
6. Add .gitignore entry: .env.local
  </action>
  <verify>cd pwa && npm run dev starts server on localhost:3000; curl localhost:3000 returns 200</verify>
  <done>Next.js 16 project created, dev server runs, TypeScript compiles</done>
</task>

<task type="auto">
  <name>Task 2: Install and configure PWA plugin</name>
  <files>pwa/package.json, pwa/next.config.ts</files>
  <action>
1. Install @ducanh2912/next-pwa:
   ```bash
   cd pwa
   npm install @ducanh2912/next-pwa
   ```

2. Create next.config.ts with PWA configuration:
   ```typescript
   import withPWA from "@ducanh2912/next-pwa";

   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
   };

   export default withPWA({
     dest: "public",
     disable: process.env.NODE_ENV === "development",
     register: true,
   })(nextConfig);
   ```

3. Verify the plugin is in package.json dependencies
  </action>
  <verify>npm run build succeeds; manifest.json generated in public/ after build</verify>
  <done>PWA plugin installed and configured</done>
</task>

<task type="auto">
  <name>Task 3: Create PWA manifest configuration</name>
  <files>pwa/app/manifest.ts</files>
  <action>
Create app/manifest.ts with PWA metadata:
   ```typescript
   import { MetadataRoute } from 'next';

   export default function manifest(): MetadataRoute.Manifest {
     return {
       name: 'Event Wallet',
       short_name: 'EventWallet',
       description: 'Frictionless payments at live events',
       start_url: '/',
       display: 'standalone',
       background_color: '#101c22',
       theme_color: '#13a4ec',
       orientation: 'portrait',
       icons: [
         {
           src: '/app-icon-192.png',
           sizes: '192x192',
           type: 'image/png',
           purpose: 'any maskable',
         },
         {
           src: '/app-icon-512.png',
           sizes: '512x512',
           type: 'image/png',
           purpose: 'any maskable',
         },
       ],
     };
   }
   ```

This covers requirements PWA-04 (manifest display mode) and PWA-06 (theme color).
  </action>
  <verify>npm run build; check public/manifest.json matches configuration</verify>
  <done>PWA manifest configured with dark theme colors</done>
</task>

<task type="auto">
  <name>Task 4: Generate PWA icons in required sizes</name>
  <files>pwa/public/app-icon-192.png, pwa/public/app-icon-512.png</files>
  <action>
Create placeholder icons using a simple script:
1. Create a temporary icon generation script:
   ```bash
   # Using ImageMagick or similar, create gradient blue square icons
   # For MVP: Create simple blue square PNGs manually or with tool
   ```

2. For MVP, create minimal viable icons:
   - 192x192px PNG: Blue gradient (#13a4ec to #0d7db3) with "E" logo
   - 512x512px PNG: Same design, larger size
   - Save to pwa/public/app-icon-192.png and pwa/public/app-icon-512.png

3. Alternatively, use a favicon generator service with the Event Wallet branding

This covers requirement PWA-05 (icons in required sizes).
  </action>
  <verify>ls -la pwa/public/app-icon-*.png shows both files; files are valid PNGs</verify>
  <done>PWA icons created in required sizes</done>
</task>

<task type="auto">
  <name>Task 5: Configure root layout with PWA metadata</name>
  <files>pwa/app/layout.tsx</files>
  <action>
Modify app/layout.tsx to include PWA metadata:
   ```tsx
   import type { Metadata } from 'next';
   import './globals.css';
   import { Manrope } from 'next/font/google';

   const manrope = Manrope({ subsets: ['latin'] });

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
   ```

This configures the dark mode default (design system requirement) and iOS PWA support.
  </action>
  <verify>npm run dev; inspect page source for manifest link and theme-color meta</verify>
  <done>Root layout configured with PWA metadata and dark theme</done>
</task>

<task type="auto">
  <name>Task 6: Create minimal home page</name>
  <files>pwa/app/page.tsx</files>
  <action>
Modify app/page.tsx:
   ```tsx
   export default function HomePage() {
     return (
       <main className="min-h-screen flex items-center justify-center bg-[#101c22]">
         <div className="text-center">
           <h1 className="text-4xl font-bold text-white">Event Wallet</h1>
           <p className="mt-4 text-lg text-[#9db0b9]">Frictionless payments at live events</p>
         </div>
       </main>
     );
   }
   ```

Uses design system colors (dark background, secondary text color).
  </action>
  <verify>npm run dev; visit localhost:3000; see centered "Event Wallet" heading with dark background</verify>
  <done>Home page renders with design system styles</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] npm run dev starts server on localhost:3000
- [ ] TypeScript compiles without errors (npm run type-check)
- [ ] npm run build completes successfully
- [ ] Home page renders at localhost:3000 with dark background
- [ ] PWA manifest is accessible at /manifest.json
- [ ] Icons exist in public/ directory
- [ ] Page source includes manifest link and theme-color meta tag
</verification>

<success_criteria>
- Next.js 16 project created in pwa/ directory
- TypeScript and Tailwind CSS configured
- PWA manifest configured with standalone display mode
- Icons created in required sizes (192px, 512px)
- Dark theme configured (#101c22 background, #13a4ec primary)
- Home page renders with "Event Wallet" branding
- Dev server runs without errors
</success_criteria>

<output>
After completion, create `.planning/phases/1-pwa-foundation/1-01-SUMMARY.md` with:
- What was created (project structure, PWA manifest, icons)
- Commands to run the project (npm run dev, npm run build)
- PWA manifest URL (http://localhost:3000/manifest.json)
- Next steps (proceed to Plan 1-02: Serwist service worker)
- Any deviations from plan (e.g., icon generation method)
</output>
