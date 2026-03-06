---
title: Dashboard UX/UI Quick Reference
description: Rapid reference for key design gaps and fixes
feature: User Dashboard
last-updated: 2025-01-20
version: 1.0.0
related-files:
  - DESIGN_ASSESSMENT.md
dependencies:
  - Design reference screenshot
status: draft
---

# Dashboard UX/UI Quick Reference

## Critical Issues (Fix First)

### 1. Balance Text Size
**Current**: 36px (`text-4xl`)
**Should Be**: 56px (`text-[56px]`)
**Impact**: Balance doesn't command attention as hero element
**Fix**: Update BalanceCard.tsx line 39

### 2. Balance Card Padding
**Current**: 20px (`p-5`)
**Should Be**: 32px (`p-8`)
**Impact**: Card feels cramped, lacks premium feel
**Fix**: Update BalanceCard.tsx line 36

### 3. Color System
**Current**: Scattered ad-hoc colors
**Should Be**: Systematic CSS variables
**Impact**: Inconsistent appearance throughout
**Fix**: Define in globals.css:
```css
:root {
  --bg-primary: #0A1229;
  --bg-card: #0F192E;
  --primary: #00BCD4;
  --primary-dark: #0086A8;
  --text-primary: #FFFFFF;
  --text-secondary: #8E9ABB;
  --semantic-negative: #FF6B35;
}
```

### 4. Balance Card Gradient
**Current**: Depends on external PNG image
**Should Be**: Pure CSS gradient
**Impact**: Brittle, image-dependent
**Fix**: Replace with:
```css
background: linear-gradient(180deg, rgba(0, 188, 212, 0.4) 0%, rgba(10, 18, 41, 0.95) 100%);
```

## High Priority Issues

### 5. Transaction List Gap
**Current**: 12px (`gap-3`)
**Should Be**: 16px (`gap-4`)
**Fix**: TransactionList.tsx line 56

### 6. Action Buttons Container
**Current**: Unnecessary container with bg and border
**Should Be**: Just buttons with spacing
**Fix**: Remove container div, use `gap-12 py-6` on parent

### 7. Missing Shadow Elevation
**Current**: Only `shadow-lg` on balance card
**Should Be**: Systematic shadow system
**Fix**: Add to globals.css:
```css
.shadow-elevation-sm { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }
.shadow-elevation-md { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16); }
.shadow-elevation-lg { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.20); }
```

### 8. Transaction Amount Color
**Current**: Always white
**Should Be**: Green for positive, red-orange for negative
**Fix**: TransactionItem.tsx line 14
```tsx
const amountColor = amount >= 0 ? 'text-[#00BCD4]' : 'text-[#FF6B35]';
```

## Medium Priority Issues

### 9. Unnecessary Borders
**Current**: `border border-white/5` throughout
**Should Be**: No borders - use shadows and spacing
**Fix**: Remove all border classes

### 10. Transaction Category Color Coding
**Current**: All icons are orange
**Should Be**: Color-coded by category
**Fix**: Add helper function to TransactionItem.tsx

### 11. "See All" Link
**Current**: Just a span, not clickable
**Should Be**: Proper Link component
**Fix**: TransactionList.tsx line 53

### 12. Action Button Size
**Current**: 56px diameter
**Should Be**: 64px diameter
**Fix**: Update `.action-button-circle` in globals.css

## Low Priority (Nice to Have)

### 13. Notification Badge
- Add unread count badge to notification bell

### 14. Hover States
- Add hover scale effects to action buttons

### 15. Loading Polish
- Refine skeleton loading animation

## File-by-File Checklist

### globals.css
- [ ] Define color system CSS variables
- [ ] Add shadow elevation system
- [ ] Update `.action-button-circle` with gradient and larger size
- [ ] Remove any unnecessary styles

### BalanceCard.tsx
- [ ] Change balance text to `text-[56px]`
- [ ] Change label to `text-lg`
- [ ] Change padding from `p-5` to `p-8`
- [ ] Replace image gradient with pure CSS
- [ ] Add shadow elevation class
- [ ] Increase eye icon touch target to `h-12 min-w-[48px]`

### ActionButtons.tsx
- [ ] Remove container div with bg and border
- [ ] Add `gap-12 py-6` to parent div
- [ ] Add hover scale effect to buttons
- [ ] Update button size reference

### TransactionItem.tsx
- [ ] Add positive/negative amount color logic
- [ ] Add category color coding helper
- [ ] Add category icon mapping
- [ ] Remove `border-white/5`
- [ ] Add shadow elevation class
- [ ] Increase padding from `px-4` to `px-5`
- [ ] Increase height from `min-h-[80px]` to `min-h-[88px]`

### TransactionList.tsx
- [ ] Change gap from `gap-3` to `gap-4`
- [ ] Add `pt-4` to container
- [ ] Change "See All" span to Link component
- [ ] Update spacing classes

### DashboardHeader.tsx
- [ ] Add notification badge (optional)

### DashboardBottomNav.tsx
- [ ] Already excellent - no changes needed

## CSS Snippets for Quick Copy-Paste

### Color System (globals.css)
```css
:root {
  /* Backgrounds */
  --bg-primary: #0A1229;
  --bg-card: #0F192E;
  --bg-elevated: #141E33;

  /* Primary Colors */
  --primary: #00BCD4;
  --primary-dark: #0086A8;
  --primary-light: rgba(0, 188, 212, 0.15);
  --primary-glow: rgba(0, 188, 212, 0.3);

  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: #8E9ABB;
  --text-tertiary: #6B7D8F;

  /* Semantic Colors */
  --semantic-positive: #00BCD4;
  --semantic-negative: #FF6B35;
  --semantic-neutral: #8E9ABB;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.16);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.20);

  /* Gradients */
  --gradient-balance: linear-gradient(180deg, rgba(0, 188, 212, 0.4) 0%, rgba(10, 18, 41, 0.95) 100%);
  --gradient-button: linear-gradient(135deg, #00BCD4 0%, #0086A8 100%);
}
```

### Typography (Tailwind classes)
```tsx
// Balance (Hero)
"text-[56px] font-extrabold leading-none tracking-tight"

// Balance Label
"text-lg font-medium leading-normal text-white/80"

// Transaction Name
"text-lg font-bold leading-normal"

// Transaction Amount
"text-lg font-bold"

// Transaction Meta
"text-sm font-medium text-[#8E9ABB]"
```

### Spacing (Tailwind classes)
```tsx
// Balance Card
"p-8"           // 32px padding

// Sections
"py-6"          // 24px vertical padding
"gap-4"         // 16px gap between items

// Action Buttons
"gap-12"        // 48px gap between buttons

// Transactions
"gap-4"         // 16px gap between items
"px-5"          // 20px horizontal padding
```

### Component Updates

#### BalanceCard.tsx (lines 24-50)
```tsx
return (
  <div
    className="flex flex-col items-stretch justify-end rounded-2xl shadow-elevation-md relative overflow-hidden"
    style={{
      background: 'linear-gradient(180deg, rgba(0, 188, 212, 0.4) 0%, rgba(10, 18, 41, 0.95) 100%)',
      minHeight: '240px',
      padding: '32px'
    }}
  >
    {isLoading && (
      <div className="absolute inset-0 bg-[#0F192E] animate-pulse" />
    )}

    <div className="flex w-full items-end justify-between gap-6 relative z-10">
      <div className="flex max-w-[440px] flex-1 flex-col gap-2">
        <p className="text-white/80 text-lg font-medium leading-normal">
          Total Balance
        </p>
        <p className="text-white tracking-tight text-[56px] font-extrabold leading-none">
          {displayBalance} EVT
        </p>
      </div>
      <button
        onClick={() => setIsMasked(!isMasked)}
        className="flex min-w-[48px] h-12 cursor-pointer items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95"
        aria-label={isMasked ? 'Show balance' : 'Hide balance'}
      >
        {isMasked ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </button>
    </div>
  </div>
);
```

#### ActionButtons.tsx (lines 14-36)
```tsx
return (
  <div className="flex justify-center items-center gap-12 py-6">
    {/* Top Up Button */}
    <Link
      href="/topup"
      className="flex flex-col items-center gap-2 cursor-pointer group"
    >
      <div className="action-button-circle group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl">add</span>
      </div>
      <p className="text-white text-xs font-bold">Top Up</p>
    </Link>

    {/* Cash Out Button */}
    <button
      onClick={handleCashOut}
      className="flex flex-col items-center gap-2 cursor-pointer group"
    >
      <div className="action-button-circle group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
        <span className="material-symbols-outlined text-2xl">account_balance</span>
      </div>
      <p className="text-white text-xs font-bold">Cash Out</p>
    </button>
  </div>
);
```

#### TransactionItem.tsx (lines 12-45)
```tsx
// Add at top of component
const amountColor = amount >= 0 ? 'text-[#00BCD4]' : 'text-[#FF6B35]';
const amountPrefix = amount >= 0 ? '+' : '';

return (
  <div className="flex items-center gap-4 bg-[#0F192E] rounded-2xl px-5 min-h-[88px] shadow-elevation-sm">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center rounded-xl bg-[#141E33] shrink-0 size-12">
        <span className="material-symbols-outlined text-orange-400">
          shopping_bag
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-white text-lg font-bold leading-normal">{itemName}</p>
        <p className="text-[#8E9ABB] text-sm font-medium">{timeAgo}</p>
      </div>
    </div>

    <div className="shrink-0 text-right">
      <p className={`${amountColor} text-lg font-bold`}>
        {amountPrefix}{amount.toFixed(2)} EVT
      </p>
      {category && (
        <p className="text-[#6B7D8F] text-xs uppercase font-bold tracking-wider">
          {category}
        </p>
      )}
    </div>
  </div>
);
```

#### TransactionList.tsx (lines 48-66)
```tsx
return (
  <div className="px-4 pt-4 pb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white text-lg font-bold">Recent Activities</h3>
      <Link
        href="/history"
        className="text-[#00BCD4] text-xs font-bold hover:underline"
      >
        See All
      </Link>
    </div>

    <div className="flex flex-col gap-4">
      {transactions.map((tx) => (
        <TransactionItem
          key={tx._id}
          itemName={tx.itemName}
          timestamp={tx.timestamp}
          amount={tx.amount}
          category={tx.category}
        />
      ))}
    </div>
  </div>
);
```

---

**Last Updated**: 2025-01-20
**Total Issues**: 15 (5 Critical, 4 High, 4 Medium, 2 Low)
**Estimated Fix Time**: 20-30 hours total
