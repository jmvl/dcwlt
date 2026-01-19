---
phase: 2-auth-wallet-core-ui
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - pwa/package.json
  - pwa/app/layout.tsx
  - pwa/app/components/PrivyProvider.tsx
  - pwa/app/components/LoginButton.tsx
  - pwa/app/page.tsx
autonomous: true
must_haves:
  truths:
    - "User can see 'Continue with Google' button"
    - "User can see 'Sign in with Apple' button"
    - "Clicking login button triggers OAuth flow"
    - "After login, Solana wallet address is displayed"
    - "Loading state shown during wallet generation"
  artifacts:
    - path: "pwa/app/components/PrivyProvider.tsx"
      provides: "Privy authentication provider with Solana embedded wallet config"
      min_lines: 20
      contains: "PrivyProvider"
    - path: "pwa/app/components/LoginButton.tsx"
      provides: "Google and Apple OAuth login buttons"
      min_lines: 30
      contains: "usePrivy"
    - path: "pwa/app/layout.tsx"
      provides: "App wrapped with PrivyProvider"
      contains: "PrivyProvider"
  key_links:
    - from: "pwa/app/components/LoginButton.tsx"
      to: "PrivyProvider"
      via: "usePrivy hook (login method)"
      pattern: "usePrivy.*login"
    - from: "pwa/app/components/PrivyProvider.tsx"
      to: "app/layout.tsx"
      via: "import and wrap children"
      pattern: "PrivyProvider.*children"
---

<objective>
Implement Privy social authentication with embedded Solana wallet generation for Event Wallet PWA.

Purpose: Enable frictionless Gmail/Apple login that silently generates a Solana wallet address using Privy's embedded wallet infrastructure.

Output: Working OAuth login flow that displays Solana wallet address after authentication.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/1-pwa-foundation/1-01-SUMMARY.md
@.planning/phases/1-pwa-foundation/1-02-SUMMARY.md
@.planning/phases/1-pwa-foundation/1-03-SUMMARY.md
@pwa/app/layout.tsx
@pwa/app/page.tsx
@pwa/package.json
</context>

<tasks>
<task type="auto">
  <name>Task 1: Install Privy dependencies</name>
  <files>pwa/package.json</files>
  <action>Install @privy-io/react-auth for Next.js 16. Run:
```bash
cd pwa
npm install @privy-io/react-auth
```
This provides PrivyProvider and usePrivy hook for authentication.</action>
  <verify>package.json contains @privy-io/react-auth in dependencies</verify>
  <done>Privy React SDK installed</done>
</task>

<task type="auto">
  <name>Task 2: Create PrivyProvider component</name>
  <files>pwa/app/components/PrivyProvider.tsx</files>
  <action>Create client component "use client" with PrivyProvider wrapper:
- Import PrivyProvider from @privy-io/react-auth
- Get Privy app ID from environment variable NEXT_PUBLIC_PRIVY_APP_ID
- Configure embedded Solana wallet with createOnLogin: 'users-without-wallets'
- Set showWalletUIs: false (custom UI)
- Wrap children with provider

Add to .env.local: NEXT_PUBLIC_PRIVY_APP_ID=your-app-id

Component structure:
```tsx
"use client"
import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error('Missing NEXT_PUBLIC_PRIVY_APP_ID')
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        // Customize login appearance
        appearance: {
          theme: 'dark',
          accentColor: '#13a4ec',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
```
</action>
  <verify>Component exists with PrivyProvider wrapper and Solana config</verify>
  <done>PrivyAuthProvider component created</done>
</task>

<task type="auto">
  <name>Task 3: Create LoginButton component</name>
  <files>pwa/app/components/LoginButton.tsx</files>
  <action>Create client component with login buttons:
- "use client" directive
- Import usePrivy hook
- Get { ready, authenticated, login } from usePrivy()
- Show loading state if !ready
- Show user info if authenticated (wallet address from usePrivy().user.wallets)
- Show "Continue with Google" and "Sign in with Apple" buttons if !authenticated
- Style with design system colors (#13a4ec, #101c22)
- Use login('google') and login('apple') functions
- Display Solana wallet address when authenticated

Key patterns from Phase 1:
- Dark mode styling with className="dark"
- Design system colors: bg-[#101c22], text-[#13a4ec]

Component should handle three states:
1. Loading: Spinner while Privy initializes
2. Authenticated: Show wallet address (truncated: 7 Characters...7 Characters)
3. Unauthenticated: Show Google/Apple login buttons
</action>
  <verify>Component has login buttons and wallet address display</verify>
  <done>LoginButton component with OAuth and wallet display</done>
</task>

<task type="auto">
  <name>Task 4: Integrate PrivyProvider into app layout</name>
  <files>pwa/app/layout.tsx</files>
  <action>Import and wrap existing content with PrivyAuthProvider:
- Keep existing ServiceWorkerRegister
- Add PrivyAuthProvider wrapper around children
- Maintain existing metadata and viewport exports

Layout structure:
```tsx
import { PrivyAuthProvider } from './components/PrivyProvider'
import { ServiceWorkerRegister } from './components/ServiceWorkerRegister'
// ... existing imports

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={manrope.className}>
        <PrivyAuthProvider>
          <ServiceWorkerRegister />
          {children}
        </PrivyAuthProvider>
      </body>
    </html>
  )
}
```
</action>
  <verify>layout.tsx wraps children with PrivyAuthProvider</verify>
  <done>Privy auth provider integrated into app</done>
</task>

<task type="auto">
  <name>Task 5: Add LoginButton to home page</name>
  <files>pwa/app/page.tsx</files>
  <action>Import and render LoginButton component:
- Keep existing InstallPrompt
- Add LoginButton below InstallPrompt or replace home page content
- Center with flex layout
- Add "Event Wallet" heading if not present

Page should show:
- App branding
- InstallPrompt component (from Phase 1)
- LoginButton component (login OR wallet address)
</action>
  <verify>page.tsx imports and renders LoginButton</verify>
  <done>Login button integrated into home page</done>
</task>

<task type="auto">
  <name>Task 6: Create .env.local template</name>
  <files>pwa/.env.local.example</files>
  <action>Create .env.local.example with:
```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here
```
Add to .gitignore if not already present (though .env.local should already be ignored).</action>
  <verify>.env.local.example contains NEXT_PUBLIC_PRIVY_APP_ID</verify>
  <done>Environment variable template created</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] npm run build succeeds without TypeScript errors
- [ ] LoginButton component has three states (loading, authenticated, unauthenticated)
- [ ] PrivyAuthProvider has Solana embedded wallet config
- [ ] .env.local.example created
</verification>

<success_criteria>
- All tasks completed
- Build passes without errors
- Login UI renders on home page
- Wallet address placeholder visible when authenticated
</success_criteria>

<output>
After completion, create `.planning/phases/2-auth-wallet-core-ui/2-01-SUMMARY.md` with:
- Accomplishments
- Files created/modified
- Decisions made
- Next phase readiness
</output>
