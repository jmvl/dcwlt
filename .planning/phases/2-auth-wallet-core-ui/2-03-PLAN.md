---
phase: 2-auth-wallet-core-ui
plan: 03
type: execute
wave: 2
depends_on: ["2-01", "2-02"]
files_modified:
  - pwa/app/components/PrivyProvider.tsx
  - pwa/app/components/ConvexProvider.tsx
  - pwa/app/layout.tsx
  - pwa/convex/users.ts
autonomous: true
must_haves:
  truths:
    - "Privy authentication triggers user creation in Convex"
    - "User record created on first login"
    - "Wallet record initialized with zero balance"
    - "User data accessible from frontend via Convex"
  artifacts:
    - path: "pwa/app/components/ConvexProvider.tsx"
      provides: "Convex client provider for React"
      min_lines: 20
      contains: "ConvexProvider"
    - path: "pwa/convex/users.ts"
      provides: "User creation with Privy wallet address"
      contains: "getOrCreateUser"
  key_links:
    - from: "pwa/app/components/PrivyProvider.tsx"
      to: "pwa/app/components/ConvexProvider.tsx"
      via: "nested provider pattern"
      pattern: "PrivyProvider.*ConvexProvider"
    - from: "pwa/app/components/ConvexProvider.tsx"
      to: "pwa/convex/_generated/api.ts"
      via: "Clerk/Privy integration with Convex"
      pattern: "ConvexProviderWithPrivy"
---

<objective>
Integrate Privy authentication with Convex backend to create user records on login.

Purpose: Bridge the authentication layer (Privy) with the data layer (Convex) so that when a user logs in with Google/Apple, their wallet address is automatically stored in the Convex database with an initial zero-balance wallet record.

Output: Working auth flow where login triggers user creation and wallet initialization.
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
@.planning/phases/2-auth-wallet-core-ui/2-01-SUMMARY.md
@.planning/phases/2-auth-wallet-core-ui/2-02-SUMMARY.md
@pwa/app/components/PrivyProvider.tsx
@pwa/convex/users.ts
@pwa/convex/schema.ts
</context>

<tasks>
<task type="auto">
  <name>Task 1: Create ConvexProvider component</name>
  <files>pwa/app/components/ConvexProvider.tsx</files>
  <action>Create client component "use client" with ConvexProvider:

```tsx
"use client"
import { ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  )
}
```

This provides useQuery and useMutation hooks to child components for accessing Convex backend.
</action>
  <verify>ConvexClientProvider component created with ConvexReactClient</verify>
  <done>Convex provider component created</done>
</task>

<task type="auto">
  <name>Task 2: Add Convex user creation mutation with Privy</name>
  <files>pwa/convex/users.ts</files>
  <action>Add Privy-specific helper mutation to users.ts:

Add this mutation to convex/users.ts:

```typescript
import { mutation } from "./_generated/server";

// Create user from Privy authentication (called after login)
export const createFromPrivy = mutation({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      walletAddress: args.walletAddress,
      oauthProvider: "privy",
      createdAt: now,
      lastActiveAt: now,
    });

    // Initialize wallet with zero balance
    await ctx.db.insert("wallets", {
      userId,
      walletAddress: args.walletAddress,
      tokenBalance: 0,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});
```

This is called after Privy login succeeds to create the user record.
</action>
  <verify>users.ts has createFromPrivy mutation</verify>
  <done>User creation mutation for Privy auth</done>
</task>

<task type="auto">
  <name>Task 3: Create auth callback hook</name>
  <files>pwa/app/hooks/usePrivyAuth.ts</files>
  <action>Create custom hook to bridge Privy auth with Convex:

```typescript
"use client"
import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated'

export function usePrivyAuth() {
  const { ready, authenticated, user } = usePrivy()
  const createUser = useMutation(api.users.createFromPrivy)

  useEffect(() => {
    // When user authenticates with Privy, create Convex record
    if (ready && authenticated && user) {
      const solanaWallet = user.linkedAccounts.find(
        account => account.type === 'wallet' && account.chainType === 'solana'
      )

      if (solanaWallet && 'address' in solanaWallet) {
        createUser({
          walletAddress: solanaWallet.address as string,
        })
      }
    }
  }, [ready, authenticated, user, createUser])

  return { ready, authenticated, user }
}
```

This hook:
- Listens to Privy auth state
- Extracts Solana wallet address from Privy user
- Calls Convex mutation to create user record
- Returns auth state for UI components
</action>
  <verify>usePrivyAuth.ts hook exists with useEffect for user creation</verify>
  <done>Auth bridge hook created</done>
</task>

<task type="auto">
  <name>Task 4: Update LoginButton to use auth hook</name>
  <files>pwa/app/components/LoginButton.tsx</files>
  <action>Modify LoginButton to use usePrivyAuth hook:

Replace the existing usePrivy() call with usePrivyAuth():

```tsx
import { usePrivyAuth } from '../hooks/usePrivyAuth'

export function LoginButton() {
  const { ready, authenticated, user } = usePrivyAuth()
  // ... rest of component
```

This ensures that when user authenticates, the Convex user record is automatically created.

Display the wallet address from user.wallets[0].address (Solana embedded wallet).
</action>
  <verify>LoginButton imports and uses usePrivyAuth hook</verify>
  <done>LoginButton integrated with Convex user creation</done>
</task>

<task type="auto">
  <name>Task 5: Integrate ConvexProvider into app layout</name>
  <files>pwa/app/layout.tsx</files>
  <action>Wrap app with ConvexClientProvider inside PrivyProvider:

```tsx
import { PrivyAuthProvider } from './components/PrivyProvider'
import { ConvexClientProvider } from './components/ConvexProvider'
// ... existing imports

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={manrope.className}>
        <PrivyAuthProvider>
          <ConvexClientProvider>
            <ServiceWorkerRegister />
            {children}
          </ConvexClientProvider>
        </PrivyAuthProvider>
      </body>
    </html>
  )
}
```

Provider nesting order: PrivyProvider (outer) → ConvexProvider (inner) → children
</action>
  <verify>layout.tsx has nested PrivyAuthProvider and ConvexClientProvider</verify>
  <done>Convex provider integrated into app</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] ConvexClientProvider wraps app with ConvexProvider
- [ ] usePrivyAuth hook creates user on login
- [ ] LoginButton uses usePrivyAuth instead of usePrivy
- [ ] User record created in Convex when Privy login succeeds
</verification>

<success_criteria>
- All tasks completed
- Login triggers user creation in Convex
- Wallet record initialized with zero balance
- No errors in browser console
</success_criteria>

<output>
After completion, create `.planning/phases/2-auth-wallet-core-ui/2-03-SUMMARY.md` with:
- Accomplishments
- Files created/modified
- Decisions made
- Next phase readiness
</output>
