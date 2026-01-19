---
phase: 2-auth-wallet-core-ui
plan: 04
type: execute
wave: 3
depends_on: ["2-03"]
files_modified:
  - pwa/app/components/BalanceDisplay.tsx
  - pwa/app/dashboard/page.tsx
  - pwa/app/navigation (optional)
autonomous: true
must_haves:
  truths:
    - "Large balance displayed on dashboard (centered, prominent)"
    - "Balance updates in real-time via Convex subscription"
    - "Balance can be masked/toggled for privacy"
    - "Fiat equivalent shown alongside token amount"
    - "Loading state shown while fetching balance"
    - "Error state shown if balance unavailable"
    - "Last updated timestamp visible"
    - "Refresh button available for manual update"
  artifacts:
    - path: "pwa/app/components/BalanceDisplay.tsx"
      provides: "Real-time balance display with masking toggle"
      min_lines: 50
      contains: "useQuery.*getBalance"
    - path: "pwa/app/dashboard/page.tsx"
      provides: "Dashboard page with balance as primary element"
      min_lines: 20
      contains: "BalanceDisplay"
  key_links:
    - from: "pwa/app/components/BalanceDisplay.tsx"
      to: "pwa/convex/_generated/api.ts"
      via: "useQuery hook for real-time subscriptions"
      pattern: "useQuery.*api.wallets.getBalance"
    - from: "pwa/app/components/BalanceDisplay.tsx"
      to: "pwa/app/hooks/usePrivyAuth.ts"
      via: "get wallet address from auth"
      pattern: "usePrivyAuth.*walletAddress"
---

<objective>
Build real-time balance display component with masking, fiat conversion, and refresh capability.

Purpose: Create the primary dashboard UI element showing user's Event Token balance with automatic real-time updates via Convex subscriptions, fulfilling BAL-01 through BAL-08 requirements.

Output: Working dashboard with large, prominent balance that updates live from Convex.
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
@.planning/phases/2-auth-wallet-core-ui/2-03-SUMMARY.md
@pwa/app/components/LoginButton.tsx
@pwa/convex/wallets.ts
@pwa/app/page.tsx
</context>

<tasks>
<task type="auto">
  <name>Task 1: Create BalanceDisplay component</name>
  <files>pwa/app/components/BalanceDisplay.tsx</files>
  <action>Create client component "use client" with balance display:

```tsx
"use client"
import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated'
import { usePrivyAuth } from '../hooks/usePrivyAuth'
import { RefreshCw, Eye, EyeOff } from 'lucide-react' // or use SVG icons

export function BalanceDisplay() {
  const { ready, authenticated, user } = usePrivyAuth()
  const [isMasked, setIsMasked] = useState(true)

  // Get wallet address from Privy user
  const walletAddress = user?.wallets?.find(
    w => w.chainType === 'solana'
  )?.address

  // Real-time balance subscription
  const { data: balance, isLoading, error } = useQuery(
    api.wallets.getBalance,
    walletAddress ? { walletAddress } : "skip"
  )

  // Handle refresh (invalidate query)
  const handleRefresh = () => {
    // Query will auto-refresh from Convex subscription
  }

  // Toggle balance visibility
  const toggleMask = () => setIsMasked(!isMasked)

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
        <p className="mt-4 text-[#9db0b9]">Loading balance...</p>
      </div>
    )
  }

  // Error state
  if (error || !balance) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-[#9db0b9]">Unable to load balance</p>
        <button onClick={handleRefresh} className="mt-4 text-[#13a4ec]">
          Try Again
        </button>
      </div>
    )
  }

  // Not authenticated
  if (!authenticated) {
    return null
  }

  // Format balance
  const tokenBalance = balance.tokenBalance / 1e9 // Convert from lamports
  const fiatBalance = balance.fiatBalance || tokenBalance * 0.10 // Mock conversion
  const displayBalance = isMasked ? '••••••' : tokenBalance.toFixed(2)
  const displayFiat = isMasked ? '••••••' : `$${fiatBalance.toFixed(2)}`
  const lastUpdated = new Date(balance.updatedAt).toLocaleTimeString()

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      {/* Large Balance Display */}
      <div className="text-center">
        <div className="text-[#9db0b9] text-sm mb-2">Event Token Balance</div>
        <div className="text-7xl font-bold text-white mb-2">
          {displayBalance} <span className="text-4xl text-[#13a4ec]">EVT</span>
        </div>
        <div className="text-[#9db0b9] text-xl mb-4">{displayFiat}</div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={toggleMask}
            className="p-2 rounded-lg bg-[#1a2f38] hover:bg-[#243b47] transition-colors"
            aria-label={isMasked ? "Show balance" : "Hide balance"}
          >
            {isMasked ? <Eye className="w-5 h-5 text-[#9db0b9]" /> : <EyeOff className="w-5 h-5 text-[#9db0b9]" />}
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-[#1a2f38] hover:bg-[#243b47] transition-colors"
            aria-label="Refresh balance"
          >
            <RefreshCw className="w-5 h-5 text-[#9db0b9]" />
          </button>
        </div>

        {/* Last Updated */}
        <div className="text-[#9db0b9] text-xs mt-4">
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  )
}
```

Component includes:
- Loading spinner (AUTH-07)
- Error state (BAL-06)
- Mask/toggle (BAL-04)
- Fiat equivalent (BAL-03)
- Refresh button (BAL-08)
- Last updated timestamp (BAL-07)
- Large centered display (BAL-01)

Design uses Phase 1 colors: #101c22 (dark), #13a4ec (blue), #9db0b9 (gray)
</action>
  <verify>BalanceDisplay component has all required UI states and features</verify>
  <done>BalanceDisplay component created</done>
</task>

<task type="auto">
  <name>Task 2: Create dashboard page</name>
  <files>pwa/app/dashboard/page.tsx</files>
  <action>Create dashboard page with balance as primary element:

```tsx
import { BalanceDisplay } from '../../components/BalanceDisplay'
import { LoginButton } from '../../components/LoginButton'
import { usePrivyAuth } from '../../hooks/usePrivyAuth'

export default function DashboardPage() {
  const { authenticated } = usePrivyAuth()

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Event Wallet</h1>
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!authenticated ? (
          <div className="text-center">
            <p className="text-[#9db0b9] mb-4">Sign in to view your balance</p>
            <LoginButton />
          </div>
        ) : (
          <div className="w-full max-w-md">
            <BalanceDisplay />
          </div>
        )}
      </main>
    </div>
  )
}
```

Dashboard structure:
- Header with app name and login/logout button
- Main content area with balance display
- Authentication check (show login prompt if not authenticated)
- Responsive container (max-w-md for mobile-first)
</action>
  <verify>dashboard/page.tsx renders BalanceDisplay as main content</verify>
  <done>Dashboard page created</done>
</task>

<task type="auto">
  <name>Task 3: Update home page to link to dashboard</name>
  <files>pwa/app/page.tsx</files>
  <action>Add link to dashboard on home page:

Update home page to include a "View Dashboard" button after login:

```tsx
<Link href="/dashboard" className="block w-full text-center">
  <button className="w-full bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
    View Dashboard
  </button>
</Link>
```

Place this after the LoginButton component or replace existing content.

Import Link from next/link.
</action>
  <verify>page.tsx has Link to /dashboard</verify>
  <done>Home page links to dashboard</done>
</task>

<task type="auto">
  <name>Task 4: Add mock balance for testing</name>
  <files>pwa/convex/wallets.ts</files>
  <action>Add helper mutation to set mock balance for testing:

Add to convex/wallets.ts:

```typescript
export const setMockBalance = mutation({
  args: {
    walletAddress: v.string(),
    tokenBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    await ctx.db.patch(wallet._id, {
      tokenBalance: args.tokenBalance,
      fiatBalance: args.tokenBalance * 0.10, // Mock conversion
      updatedAt: Date.now(),
    });

    return await ctx.db.get(wallet._id);
  },
});
```

This can be called from browser console to test balance display before Phase 3 top-up flow is implemented.
</action>
  <verify>wallets.ts has setMockBalance mutation</verify>
  <done>Mock balance helper added</done>
</task>
</tasks>

<verification>
Before declaring plan complete:
- [ ] BalanceDisplay component has all 8 states (loading, error, masked, etc.)
- [ ] Dashboard page shows balance as primary element
- [ ] Real-time subscription active (useQuery with api.wallets.getBalance)
- [ ] Mask toggle works
- [ ] Refresh button visible
- [ ] Build passes without errors
</verification>

<success_criteria>
- All tasks completed
- Dashboard displays balance prominently
- Balance updates in real-time (subscribe to Convex query)
- All BAL-01 through BAL-08 requirements met
</success_criteria>

<output>
After completion, create `.planning/phases/2-auth-wallet-core-ui/2-04-SUMMARY.md` with:
- Accomplishments
- Files created/modified
- Decisions made
- Phase 2 completion status
</output>
