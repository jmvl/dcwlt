---
phase: 1-pwa-foundation
plan: 03
type: execute
wave: 1
depends_on: [1-01, 1-02]
files_modified: [pwa/app/components/InstallPrompt.tsx, pwa/app/page.tsx, pwa/app/components/IOSInstallInstructions.tsx]
autonomous: true

must_haves:
  truths:
    - "Install button appears on 2nd visit (not first)"
    - "Clicking install triggers native prompt (Chrome/Edge)"
    - "iOS users see fallback instructions"
    - "After install, app launches in standalone mode"
  artifacts:
    - path: "pwa/app/components/InstallPrompt.tsx"
      provides: "PWA install prompt component"
      min_lines: 50
    - path: "pwa/app/components/IOSInstallInstructions.tsx"
      provides: "iOS fallback instructions"
      min_lines: 30
    - path: "pwa/app/page.tsx"
      provides: "Home page with install prompt"
      contains: "InstallPrompt"
  key_links:
    - from: "pwa/app/components/InstallPrompt.tsx"
      to: "beforeinstallprompt event"
      via: "window.addEventListener"
---

<objective>
Implement PWA install prompt with beforeinstallprompt event and iOS fallback.

Purpose: Enable users to install the PWA via browser's native install prompt (Chrome/Edge) or via manual instructions (iOS Safari). This is critical for the stadium QR code use case.

Output: Install prompt that appears on 2nd visit, triggers native install dialog on supported browsers, shows iOS instructions on Safari
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
@.planning/phases/1-pwa-foundation/1-CONTEXT.md

**Phase 1 Requirements (Install Prompt):**
- PWA-01: QR code contains PWA URL with install prompt query parameter
- PWA-02: beforeinstallprompt event listener captures install capability
- PWA-03: Custom install button triggers native install dialog
- PWA-08: Install prompt shown on 2nd page visit (not aggressive)
- PWA-09: Fallback to "Add to Home Screen" instructions for iOS Safari

**Tech Stack Decisions:**
- React hooks for state management
- localStorage for visit tracking
- beforeinstallprompt event (Chrome/Edge only)
- User agent detection for iOS (Safari doesn't support beforeinstallprompt)

**Design System:**
- Primary color: #13a4ec
- Card dark: #1c2a31
- Border radius: lg (0.75rem / 12px)
- Material Symbols: "download" or "install_mobile" icon

**Codebase Context:**
- Requires Next.js 16 + Serwist from Plans 1-01 and 1-02
- Install button should be non-intrusive (bottom banner or inline)
- iOS instructions should be clear and visual

**Known Constraints:**
- iOS Safari doesn't support beforeinstallprompt (must use manual instructions)
- beforeinstallprompt only fires once per page session (must save event)
- Prompt must be user-triggered (can't auto-show)
</context>

<tasks>
<task type="auto">
  <name>Task 1: Create install prompt hook</name>
  <files>pwa/app/hooks/useInstallPrompt.ts</files>
  <action>
Create app/hooks/useInstallPrompt.ts:
   ```typescript
   'use client';

   import { useEffect, useState } from 'react';

   interface BeforeInstallPromptEvent extends Event {
     prompt: () => Promise<void>;
     userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
   }

   export function useInstallPrompt() {
     const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
     const [isIOS, setIsIOS] = useState(false);
     const [showPrompt, setShowPrompt] = useState(false);

     useEffect(() => {
       // Check if iOS
       const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                           !(window as any).MSStream;
       setIsIOS(isIOSDevice);

       // Track visit count for showing prompt on 2nd visit
       const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
       localStorage.setItem('visitCount', String(visitCount + 1));

       // Show prompt on 2nd visit (not aggressive)
       if (visitCount >= 1) {
         setShowPrompt(true);
       }

       // Listen for beforeinstallprompt (Chrome/Edge)
       const handleBeforeInstallPrompt = (e: Event) => {
         e.preventDefault();
         setDeferredPrompt(e as BeforeInstallPromptEvent);
       };

       window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

       return () => {
         window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
       };
     }, []);

     const promptInstall = async () => {
       if (!deferredPrompt) {
         return;
       }

       deferredPrompt.prompt();
       const { outcome } = await deferredPrompt.userChoice;

       if (outcome === 'accepted') {
         setShowPrompt(false);
       }

       setDeferredPrompt(null);
     };

     const dismissPrompt = () => {
       setShowPrompt(false);
       localStorage.setItem('installPromptDismissed', 'true');
     };

     return {
       canInstall: !!deferredPrompt,
       isIOS,
       showPrompt,
       promptInstall,
       dismissPrompt,
     };
   }
   ```

Covers requirements PWA-02 (beforeinstallprompt) and PWA-08 (2nd visit).
  </action>
  <verify>File compiles without TypeScript errors</verify>
  <done>Install prompt hook created</done>
</task>

<task type="auto">
  <name>Task 2: Create InstallPrompt component</name>
  <files>pwa/app/components/InstallPrompt.tsx</files>
  <action>
Create app/components/InstallPrompt.tsx:
   ```tsx
   'use client';

   import { useInstallPrompt } from '../hooks/useInstallPrompt';

   export function InstallPrompt() {
     const { canInstall, isIOS, showPrompt, promptInstall, dismissPrompt } = useInstallPrompt();

     if (!showPrompt) {
       return null;
     }

     if (isIOS) {
       // iOS users get different component
       return <IOSInstallInstructions onDismiss={dismissPrompt} />;
     }

     return (
       <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1c2a31] border border-white/10 rounded-lg p-4 shadow-lg z-50">
         <div className="flex items-start gap-3">
           <div className="flex-1">
             <h3 className="text-white font-semibold mb-1">Install Event Wallet</h3>
             <p className="text-[#9db0b9] text-sm">
               Install the app for the best experience at live events.
             </p>
           </div>
           <button
             onClick={dismissPrompt}
             className="text-[#9db0b9] hover:text-white transition-colors"
             aria-label="Dismiss"
           >
             ✕
           </button>
         </div>
         {canInstall && (
           <button
             onClick={promptInstall}
             className="mt-3 w-full bg-[#13a4ec] hover:bg-[#0d7db3] text-white font-medium py-2 px-4 rounded-lg transition-colors"
           >
             Install App
           </button>
         )}
       </div>
     );
   }

   function IOSInstallInstructions({ onDismiss }: { onDismiss: () => void }) {
     return (
       <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1c2a31] border border-white/10 rounded-lg p-4 shadow-lg z-50">
         <div className="flex items-start gap-3">
           <div className="flex-1">
             <h3 className="text-white font-semibold mb-1">Install Event Wallet</h3>
             <p className="text-[#9db0b9] text-sm mb-3">
               Tap the Share button and select "Add to Home Screen".
             </p>
             <div className="flex items-center gap-2 text-sm text-[#9db0b9]">
               <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
               </svg>
               <span>Open in Safari</span>
             </div>
           </div>
           <button
             onClick={onDismiss}
             className="text-[#9db0b9] hover:text-white transition-colors"
             aria-label="Dismiss"
           >
             ✕
           </button>
         </div>
       </div>
     );
   }
   ```

Uses design system colors and Material Symbols. Covers PWA-03 (custom button) and PWA-09 (iOS fallback).
  </action>
  <verify>File compiles without TypeScript errors</verify>
  <done>InstallPrompt component created</done>
</task>

<task type="auto">
  <name>Task 3: Add install prompt to home page</name>
  <files>pwa/app/page.tsx</files>
  <action>
Modify app/page.tsx to include the install prompt:
   ```tsx
   import { InstallPrompt } from './components/InstallPrompt';

   export default function HomePage() {
     return (
       <>
         <main className="min-h-screen flex items-center justify-center bg-[#101c22]">
           <div className="text-center">
             <h1 className="text-4xl font-bold text-white">Event Wallet</h1>
             <p className="mt-4 text-lg text-[#9db0b9]">
               Frictionless payments at live events
             </p>
           </div>
         </main>
         <InstallPrompt />
       </>
     );
   }
   ```
  </action>
  <verify>npm run dev; install prompt appears on 2nd page reload</verify>
  <done>Install prompt added to home page</done>
</task>

<task type="auto">
  <name>Task 4: Create QR code for app URL</name>
  <files>pwa/public/qr-code.png, docs/qr-code-install.md</files>
  <action>
Create a QR code pointing to the PWA URL:
1. Use any QR code generator service or library:
   - URL: `https://your-domain.com` (or localhost:3000 for testing)
   - Size: 512x512px (for stadium flyers/seat backs)

2. Save generated QR code to pwa/public/qr-code.png

3. Create docs/qr-code-install.md with instructions:
   ```markdown
   # PWA Installation QR Code

   The QR code in `pwa/public/qr-code.png` links to the Event Wallet PWA.

   ## Usage

   - Print on stadium seat backs
   - Include on event flyers
   - Display at venue entrance

   ## User Flow

   1. User scans QR code with phone camera
   2. Opens in default browser (Chrome/Safari)
   3. Sees "Install Event Wallet" prompt (on 2nd visit or via manual trigger)
   4. Installs PWA to home screen
   5. Opens app in standalone mode (no browser UI)

   ## Testing

   For local testing, generate QR code with:
   - URL: `http://localhost:3000` (must be on same network)
   - Use: `qrcode "http://192.168.x.x:3000" > qr-code.png`
   ```

Covers PWA-01 (QR code with PWA URL).
  </action>
  <verify>ls -la pwa/public/qr-code.png exists and is valid image</verify>
  <done>QR code created for PWA URL</done>
</task>

<task type="auto">
  <name>Task 5: Test install flow</name>
  <files>pwa/</files>
  <action>
1. Build for production: `npm run build`
2. Start production server: `npm run start`
3. Open Chrome/Edge at http://localhost:3000
4. Refresh page (2nd visit) - install banner should appear
5. Click "Install App" - native install dialog should appear
6. Install the app
7. Launch app from home screen/apps
8. Verify: No browser UI, runs in standalone mode
9. Test on iOS Safari:
   - Open http://localhost:3000 in Safari
   - Should see iOS-specific instructions
   - Follow instructions to add to home screen
   - Launch from home screen
   - Verify: No browser UI (Safari fullscreen)

This validates the complete install flow.
  </action>
  <verify>App installs successfully and launches in standalone mode on both Chrome/Edge and iOS Safari</verify>
  <done>Install flow tested and verified</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] Install prompt appears on 2nd visit (not first)
- [ ] Chrome/Edge shows "Install App" button
- [ ] Clicking install triggers native install dialog
- [ ] iOS Safari shows manual instructions with Share button hint
- [ ] QR code exists and links to PWA URL
- [ ] App launches in standalone mode after install
- [ ] No browser UI visible in standalone mode
</verification>

<success_criteria>
- beforeinstallprompt event captured and stored
- Custom install button triggers native prompt
- iOS fallback instructions display correctly
- Install prompt shown on 2nd visit (not aggressive)
- QR code available for printing on stadium materials
- App installs and launches in standalone mode
</success_criteria>

<output>
After completion, create `.planning/phases/1-pwa-foundation/1-03-SUMMARY.md` with:
- Install behavior summary (Chrome vs iOS)
- QR code location and usage instructions
- Testing results (which browsers tested)
- Next steps (Phase 1 complete, proceed to Phase 2: Auth + Wallet)
- Any deviations from plan
</output>
