# Design System: High-Frequency Event Wallet PWA

**Source of Truth:** `docs/plans/code.html` (HTML/CSS reference implementation)

## Design Tokens

### Colors

```css
/* Primary */
--primary: #13a4ec              /* Action buttons, links, accents */

/* Backgrounds */
--background-dark: #101c22     /* Main background */
--card-dark: #1c2a31           /* Cards, action bar, bottom nav */
--notification-bg: #283339     /* Notification button background */

/* Text */
--text-primary: #ffffff        /* Headings, primary text */
--text-secondary: #9db0b9      /* Captions, timestamps */
```

### Typography

```css
/* Font Family */
font-family: 'Manrope', sans-serif;

/* Hierarchy */
H2: 18px bold (1.125rem)       /* User name, section headers */
Body: 14px (0.875rem)           /* Transaction names, amounts */
Caption: 10-12px (0.625-0.75rem) /* Timestamps, categories */
```

### Border Radius

```css
sm:  0.25rem   /* 4px */
md:  0.5rem    /* 8px */
lg:  0.75rem   /* 12px - cards, buttons */
xl:  1rem      /* 16px */
full: 9999px   /* circles */
```

### Spacing Scale (Tailwind)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 0.5rem | Tight gaps |
| sm | 0.75rem | Component padding |
| md | 1rem | Standard spacing |
| lg | 1.5rem | Section spacing |

## Component Structure

### Layout
```
┌─────────────────────────────┐
│ TopAppBar (greeting + notif) │
├─────────────────────────────┤
│ BalanceCard (gradient)       │
├─────────────────────────────┤
│ ActionBar (3 buttons)        │
├─────────────────────────────┤
│ TransactionList (scroll)     │
├─────────────────────────────┤
│ BottomNavigation (3 tabs)    │
└─────────────────────────────┘
```

### Components

| Component | Description | Key Features |
|-----------|-------------|--------------|
| **TopAppBar** | Header with user info | Avatar, greeting, notification bell |
| **BalanceCard** | Primary balance display | Gradient (#13a4ec), visibility toggle, masked card number |
| **ActionBar** | Quick action buttons | Top Up, Send, Request (horizontal) |
| **TransactionList** | Activity feed | Icon, merchant, amount, timestamp, category |
| **BottomNavigation** | Main navigation | Home, Scan (prominent center), History |

## Interaction States

```css
/* Buttons */
default: bg-primary/20 text-primary
hover: bg-primary/30
active: scale-95

/* Navigation Tabs */
active: text-primary, FILL 1 (filled icon)
inactive: text-[#9db0b9], FILL 0 (outline icon)
```

## Icons

**Library:** Material Symbols Outlined (Google)

Key icons used:
- `notifications` - TopAppBar
- `visibility` - Balance toggle
- `add_circle` - Top Up
- `send` - Send
- `call_received` - Request
- `home` - Home tab
- `qr_code_scanner` - Scan button (prominent)
- `history` - History tab
- `coffee`, `account_balance_wallet`, `shopping_bag`, `electric_bolt` - Transaction categories

## Responsive Behavior

- **Mobile-first**: Designed for 320px-480px width
- **Max-width container**: 480px centered on larger screens
- **Safe areas**: pt-6 for status bar, pb-8 for bottom navigation

## Theme

**Default:** Dark mode (`class="dark"` on `<html>`)

Colors listed above are dark theme values. Light theme uses lighter variants but MVP is dark-first.

## Implementation Notes

### Tech Stack
- **Styling**: Tailwind CSS (CDN for mockup, npm for production)
- **Icons**: Material Symbols Outlined
- **Fonts**: Google Fonts (Manrope)

### Key Patterns
1. **Gradient backgrounds**: `linear-gradient(135deg, #13a4ec 0%, #0d7db3 100%)`
2. **Decorative overlays**: Blurred circles for depth
3. **Subtle borders**: `border-white/5` for separation
4. **Backdrop blur**: `backdrop-blur-md` for overlay elements

---

**Reference Implementation:** `docs/plans/code.html`

*Design system extracted: 2026-01-16*
