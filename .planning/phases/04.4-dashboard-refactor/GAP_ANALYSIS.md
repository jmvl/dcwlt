# User Dashboard UX Gap Analysis

**Analysis Date:** 2025-01-20
**Design Reference:** `.planning/research/uix-user-dashboard/code.html`
**Current Implementation:** `pwa/app/dashboard/`

## Executive Summary

The current implementation is **80% complete** in terms of structure and functionality, but has **significant visual gaps** in typography, icons, and detailed styling refinements. The core layout and component hierarchy match the reference design, but several critical visual elements are missing.

---

## 1. Global Typography & Theme Gaps

### Missing Custom Tailwind Configuration

**Reference Design (lines 10-30):**
```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#13a4ec",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
}
```

**Current State:**
- No custom Tailwind configuration file exists
- Using Tailwind v4 with inline theme in `globals.css`
- Missing `borderRadius` theme customization
- Primary color `#13a4ec` is used but not in theme config

**Impact:** Medium
- Inconsistent border radius values across components
- No centralized color/theme management
- Cannot use `bg-primary`, `text-primary` utility classes

---

### Font Family Application

**Reference Design (lines 36-38):**
```css
body {
  font-family: 'Manrope', sans-serif;
}
```

**Current State:**
- Manrope font is loaded in `layout.tsx` (line 10)
- Applied via `<body className={manrope.className}>`
- No fallback to sans-serif in globals.css

**Impact:** Low
- Font is correctly applied, but missing explicit fallback in CSS

---

### Body Height Constraint

**Reference Design (lines 37-38, 52-54):**
```css
body {
  min-height: max(884px, 100dvh);
}
```

**Current State:**
- Missing `min-height` constraint on body
- No minimum height ensures full viewport coverage

**Impact:** Low
- May cause layout issues on very short screens
- Affects overall container sizing

---

## 2. Component-Specific Gaps

### 2.1 Dashboard Header (`DashboardHeader.tsx`)

#### Missing Elements

1. **Avatar Background Image**
   - **Reference:** Uses Google profile image URL
   - **Current:** Solid color background with initials
   - **Gap:** Missing dynamic avatar image support

2. **Border on Avatar**
   - **Reference:** `border-2 border-primary/30`
   - **Current:** `border-2 border-primary/30`
   - **Status:** ✅ Match

3. **Spacing & Layout**
   - **Reference:** `p-4 pt-6`
   - **Current:** `p-4 pt-6`
   - **Status:** ✅ Match

4. **Typography**
   - **Reference:**
     - "Welcome back,": `text-[#9db0b9] text-xs font-medium`
     - Name: `text-white text-lg font-bold leading-tight tracking-[-0.015em]`
   - **Current:** Exact match
   - **Status:** ✅ Match

5. **Notification Button**
   - **Reference:** `bg-[#283339]`
   - **Current:** `bg-[#283339]`
   - **Status:** ✅ Match

**Overall Impact:** Low - Only missing actual user avatar image

---

### 2.2 Balance Card (`BalanceCard.tsx`)

#### Critical Missing Elements

1. **Background Image Path**
   - **Reference:** URL to hosted image (line 76)
   - **Current:** `/images/card-bg.png`
   - **Gap:** Local image may not exist or match reference design
   - **Hex Colors from Gradient:**
     - Top: `rgba(19, 164, 236, 0.4)` → `#13a4ec` at 40% opacity
     - Bottom: `rgba(16, 28, 34, 0.95)` → `#101c22` at 95% opacity

2. **Icon System**
   - **Reference:** Material Symbols Outlined with `<span class="material-symbols-outlined">visibility</span>`
   - **Current:** Lucide React icons (`<Eye />`, `<EyeOff />`)
   - **Gap:** Completely different icon system
   - **Impact:** High - Icons look different (outlined vs filled, different stroke widths)

3. **Button Styling**
   - **Reference:**
     - `bg-white/20 hover:bg-white/30`
     - `backdrop-blur-md`
     - Icon only: `<span class="material-symbols-outlined">visibility</span>`
   - **Current:** Same Tailwind classes
   - **Status:** ✅ Match

4. **Loading State**
   - **Reference:** Not shown
   - **Current:** Custom loading skeleton with `animate-pulse`
   - **Gap:** Enhancement beyond reference (positive)

5. **Typography**
   - **Reference:**
     - Label: `text-white/80 text-sm font-medium leading-normal`
     - Balance: `text-white tracking-tight text-4xl font-extrabold leading-tight`
   - **Current:** Exact match
   - **Status:** ✅ Match

**Overall Impact:** High - Icon system mismatch and background image

---

### 2.3 Action Buttons (`ActionButtons.tsx`)

#### Missing Elements

1. **Action Button Circle Styling**
   - **Reference (lines 40-49):**
     ```css
     .action-button-circle {
       width: 56px;
       height: 56px;
       display: flex;
       align-items: center;
       justify-content: center;
       border-radius: 9999px;
       background-color: rgba(19, 164, 236, 0.15);
       color: #13a4ec;
     }
     ```
   - **Current:** Defined in `globals.css` (lines 47-56)
   - **Status:** ✅ Match

2. **Icons**
   - **Reference:** Material Symbols Outlined
     - Top Up: `<span class="material-symbols-outlined font-bold">add</span>`
     - Cash Out: `<span class="material-symbols-outlined font-bold">account_balance</span>`
   - **Current:** Same icons used
   - **Status:** ✅ Match

3. **Typography**
   - **Reference:** `text-white text-xs font-bold`
   - **Current:** Exact match
   - **Status:** ✅ Match

4. **Container Styling**
   - **Reference:** `bg-[#1c2a31]/50 rounded-2xl p-6 border border-white/5`
   - **Current:** Exact match
   - **Status:** ✅ Match

5. **Spacing**
   - **Reference:** `gap-12` between buttons
   - **Current:** `gap-12`
   - **Status:** ✅ Match

**Overall Impact:** None - Fully matches reference

---

### 2.4 Transaction List (`TransactionList.tsx`)

#### Missing Elements

1. **Section Header Spacing**
   - **Reference:** `px-4 pb-2 pt-6`
   - **Current:** `p-4` with custom `mb-3`
   - **Gap:** Slight spacing difference
   - **Reference Padding:** Top: 24px (`pt-6`), Bottom: 8px (`pb-2`)
   - **Current Padding:** All sides: 16px (`p-4`)

2. **"See All" Button**
   - **Reference:** `text-primary text-sm font-bold`
   - **Current:** `text-[#13a4ec] text-xs font-bold` (note: `text-xs` not `text-sm`)
   - **Gap:** Font size mismatch
   - **Reference Size:** 14px (`text-sm`)
   - **Current Size:** 12px (`text-xs`)

3. **Section Title Typography**
   - **Reference:** `text-white text-lg font-bold leading-tight tracking-[-0.015em]`
   - **Current:** `text-white text-lg font-bold`
   - **Gap:** Missing `leading-tight tracking-[-0.015em]`

4. **Loading/Empty States**
   - **Reference:** Not shown (assumes data always present)
   - **Current:** Custom implementations
   - **Gap:** Enhancement beyond reference (positive)

**Overall Impact:** Low - Minor spacing and typography differences

---

### 2.5 Transaction Item (`TransactionItem.tsx`)

#### Missing Elements

1. **Icon Colors by Category**
   - **Reference:**
     - Starbucks: `text-orange-400`
     - Salary: `text-green-400`
     - Apple Store: `text-blue-400`
     - Utility Bill: `text-red-400`
   - **Current:** Always `text-orange-400` with `shopping_bag` icon
   - **Gap:** Missing dynamic icon/color system
   - **Impact:** Medium - Visual variety lost

2. **Amount Color Logic**
   - **Reference:**
     - Expense: `text-white`
     - Income: `text-primary`
   - **Current:** Always `text-white`
   - **Gap:** Missing income vs expense styling
   - **Impact:** Medium - Can't distinguish income from expenses

3. **Amount Sign**
   - **Reference:** Shows `-` or `+` prefix (e.g., `-5.50 EVT`, `+2,400.00 EVT`)
   - **Current:** No sign prefix, just number
   - **Gap:** Missing visual indicator of transaction type
   - **Impact:** Medium - Less clear transaction flow

4. **Category Label**
   - **Reference:** Always present with uppercase formatting
     - Example: `text-[#9db0b9] text-[10px] uppercase font-bold tracking-wider`
   - **Current:** Optional prop, may not display
   - **Gap:** Inconsistent category display
   - **Impact:** Low - Category is optional

5. **Container Styling**
   - **Reference:** `bg-[#1c2a31]/40 rounded-2xl px-4 min-h-[80px] py-2 justify-between border border-white/5`
   - **Current:** Exact match
   - **Status:** ✅ Match

6. **Icon Container**
   - **Reference:** `bg-[#283339]`
   - **Current:** `bg-[#283339]`
   - **Status:** ✅ Match

**Overall Impact:** Medium - Missing dynamic styling for transaction types

---

### 2.6 Bottom Navigation (`DashboardBottomNav.tsx`)

#### Missing Elements

1. **Positioning**
   - **Reference:** `absolute bottom-0 left-0 right-0`
   - **Current:** `fixed bottom-0 left-0 right-0`
   - **Gap:** Different positioning strategy
   - **Impact:** Low - Both work, but `fixed` is more robust

2. **Shadow**
   - **Reference:** `shadow-[0_-4px_10px_rgba(0,0,0,0.3)]`
   - **Current:** Missing
   - **Gap:** No elevation shadow
   - **Shadow Values:**
     - X: 0px
     - Y: -4px (upward)
     - Blur: 10px
     - Color: `rgba(0,0,0,0.3)` (30% opacity black)

3. **Safe Area Support**
   - **Reference:** Not shown
   - **Current:** `safe-area-inset-bottom` class applied
   - **Gap:** Enhancement beyond reference (positive)

4. **Active State Styling**
   - **Reference:** Home tab filled (`FILL 1`), others outline
   - **Current:** Dynamic based on pathname
   - **Status:** ✅ Match behavior

5. **Scan Button Container**
   - **Reference:** `bg-primary/20` outer ring
   - **Current:** `bg-primary/20`
   - **Status:** ✅ Match

6. **Scan Button**
   - **Reference:** `bg-primary text-white shadow-lg shadow-primary/40`
   - **Current:** `bg-primary text-white shadow-lg shadow-primary/40`
   - **Status:** ✅ Match

7. **Home Indicator**
   - **Reference:** `bg-white/20`
   - **Current:** `bg-white/20`
   - **Status:** ✅ Match

**Overall Impact:** Low - Only missing shadow

---

## 3. Material Symbols Outlined Integration

### Critical Gap: Icon System Mismatch

**Reference Design:**
- Uses Google's Material Symbols Outlined
- Loaded via: `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>`
- Applied via: `<span class="material-symbols-outlined">icon_name</span>`
- Font variation settings controlled via CSS

**Current Implementation:**
- Uses Lucide React icons
- Imported via: `import { Eye, EyeOff } from 'lucide-react';`
- Applied via: `<Eye className="w-5 h-5" />`

**Impact:** High
- Different visual style (stroke-based vs fill-based)
- Inconsistent sizing (Lucide uses width/height, Material uses font size)
- Missing FILL variant support for active states
- Some icons may not have direct equivalents

**Required Fix:**
1. Add Material Symbols Outlined to `layout.tsx`
2. Replace all Lucide icons with Material Symbols
3. Add font variation settings to `globals.css`:
   ```css
   .material-symbols-outlined {
     font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
   }
   ```

---

## 4. Color Scheme Reference

### Design Reference Colors

| Purpose | Hex Code | Usage |
|---------|----------|-------|
| Primary | `#13a4ec` | Buttons, links, accents, active states |
| Background Dark | `#101c22` | Main background, header |
| Background Container | `#1c2a31` | Card backgrounds (40-50% opacity) |
| Background Icon | `#283339` | Icon containers |
| Text Muted | `#9db0b9` | Secondary text, timestamps |
| Border White | `rgba(255,255,255,0.05)` | Subtle borders |
| Border Primary | `rgba(19, 164, 236, 0.3)` | Avatar border |

**Current Implementation Status:** ✅ All colors match

---

## 5. Typography Scale Reference

| Element | Size | Weight | Line Height | Tracking |
|---------|------|--------|-------------|----------|
| Header Name | `lg` (18px) | `bold` (700) | `leading-tight` (1.25) | `tracking-[-0.015em]` |
| Balance Amount | `4xl` (36px) | `extrabold` (800) | `leading-tight` (1.25) | `tracking-tight` (-0.025em) |
| Section Title | `lg` (18px) | `bold` (700) | `leading-tight` (1.25) | `tracking-[-0.015em]` |
| Transaction Name | `base` (16px) | `bold` (700) | `leading-normal` (1.5) | - |
| Transaction Amount | `base` (16px) | `bold` (700) | - | - |
| Transaction Time | `xs` (12px) | `medium` (500) | - | - |
| Transaction Category | `10px` | `bold` (700) | - | `tracking-wider` (0.05em) |
| Button Text | `xs` (12px) | `bold` (700) | - | - |
| Welcome Text | `xs` (12px) | `medium` (500) | - | - |
| See All Link | `sm` (14px) | `bold` (700) | - | - |

**Current Implementation Status:**
- ✅ Most typography matches
- ❌ Missing `tracking-[-0.015em]` on section titles
- ❌ "See All" uses `text-xs` instead of `text-sm`

---

## 6. Spacing & Layout Gaps

### Padding/Margin Values

| Element | Reference | Current | Status |
|---------|-----------|---------|--------|
| Header | `p-4 pt-6` | `p-4 pt-6` | ✅ Match |
| Balance Card | `p-5` (inner) | `p-5` | ✅ Match |
| Action Buttons Container | `p-6` | `p-6` | ✅ Match |
| Transaction List Container | `px-4 pb-2 pt-6` | `p-4` | ❌ Gap |
| Transaction Item | `px-4 py-2` | `px-4 py-2` | ✅ Match |
| Bottom Nav | `px-4 pt-3 pb-8` | `px-4 pt-3 pb-8` | ✅ Match |

---

## 7. Border Radius Values

| Element | Reference | Current | Status |
|---------|-----------|---------|--------|
| Avatar | `rounded-full` | `rounded-full` | ✅ Match |
| Balance Card | `rounded-2xl` (16px) | `rounded-2xl` | ✅ Match |
| Action Button Circle | `rounded-full` | `rounded-full` | ✅ Match |
| Action Button Container | `rounded-2xl` | `rounded-2xl` | ✅ Match |
| Transaction Item | `rounded-2xl` | `rounded-2xl` | ✅ Match |
| Icon Container | `rounded-xl` (12px) | `rounded-xl` | ✅ Match |
| Visibility Button | `rounded-xl` | `rounded-xl` | ✅ Match |
| Notification Button | `rounded-full` | `rounded-full` | ✅ Match |

**Note:** Custom border radius theme is not configured, but hardcoded values match reference.

---

## 8. Shadow Values

| Element | Reference | Current | Status |
|---------|-----------|---------|--------|
| Balance Card | `shadow-lg` | `shadow-lg` | ✅ Match |
| Bottom Nav | `shadow-[0_-4px_10px_rgba(0,0,0,0.3)]` | Missing | ❌ Missing |
| Scan Button | `shadow-lg shadow-primary/40` | `shadow-lg shadow-primary/40` | ✅ Match |

---

## 9. Interactive States

### Hover States

**Reference:**
- Visibility button: `hover:bg-white/30`
- Action buttons: `group-active:scale-95` (tap feedback)

**Current:**
- Visibility button: ✅ `hover:bg-white/30`
- Action buttons: ✅ `group-active:scale-95`

**Status:** ✅ Match

---

## 10. Accessibility & Responsive

### Viewport Meta

**Reference (line 4):**
```html
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
```

**Current:** Defined in `layout.tsx` viewport config
**Status:** ✅ Match

### Container Width

**Reference (line 58):**
```html
max-w-[480px] mx-auto
```

**Current:** `max-w-[480px] mx-auto`
**Status:** ✅ Match

### Safe Area Insets

**Reference:** Not shown
**Current:** Custom classes in `globals.css`
**Status:** ✅ Enhancement

---

## 11. Missing Visual Elements Summary

### High Priority Gaps

1. **Icon System** - Lucide vs Material Symbols Outlined
   - Affects: Balance card visibility toggle
   - Impact: High visual inconsistency

2. **Bottom Navigation Shadow** - Missing elevation
   - Affects: Depth perception of floating nav
   - Impact: Medium visual hierarchy issue

3. **Transaction Type Styling** - Missing income/expense differentiation
   - Affects: Amount color, sign prefix
   - Impact: Medium user experience issue

4. **Transaction Category Icons** - Missing dynamic icons
   - Affects: Visual variety in transaction list
   - Impact: Medium visual engagement

### Medium Priority Gaps

5. **Transaction List Header Spacing** - Inconsistent padding
   - Affects: Section rhythm
   - Impact: Low visual spacing issue

6. **"See All" Font Size** - `text-xs` vs `text-sm`
   - Affects: Link prominence
   - Impact: Low hierarchy issue

7. **Body Height Constraint** - Missing min-height
   - Affects: Full viewport coverage
   - Impact: Low layout issue

### Low Priority Gaps

8. **Avatar Image** - Solid color vs image
   - Affects: Personalization
   - Impact: Low visual enhancement

9. **Section Title Tracking** - Missing `tracking-[-0.015em]`
   - Affects: Typography refinement
   - Impact: Very low polish issue

---

## 12. Recommended Implementation Priority

### Phase 1: Critical Visual Consistency (Must Fix)
1. Replace Lucide icons with Material Symbols Outlined
2. Add bottom navigation shadow
3. Implement transaction type styling (income vs expense)

### Phase 2: Enhanced User Experience (Should Fix)
4. Add transaction category icon/color system
5. Fix "See All" font size
6. Correct transaction list header spacing

### Phase 3: Polish & Refinement (Nice to Have)
7. Add user avatar image support
8. Add section title letter-spacing
9. Add body min-height constraint

---

## 13. Exact Tailwind Classes Missing by File

### `DashboardHeader.tsx`
- No missing classes ✅

### `BalanceCard.tsx`
- Replace `<Eye />` and `<EyeOff />` with:
  ```html
  <span class="material-symbols-outlined">visibility</span>
  <span class="material-symbols-outlined">visibility_off</span>
  ```

### `ActionButtons.tsx`
- No missing classes ✅

### `TransactionList.tsx`
- Header container: Add `pt-6` to section wrapper
- "See All" button: Change `text-xs` to `text-sm`
- Section title: Add `leading-tight tracking-[-0.015em]`

### `TransactionItem.tsx`
- Implement income vs expense color logic:
  ```tsx
  const amountColor = isIncome ? 'text-primary' : 'text-white';
  ```
- Add sign prefix to amount:
  ```tsx
  {isIncome ? '+' : '-'}{amount.toFixed(2)} EVT
  ```
- Implement dynamic icon system based on category

### `DashboardBottomNav.tsx`
- Add shadow to nav element:
  ```tsx
  shadow-[0_-4px_10px_rgba(0,0,0,0.3)]
  ```

### `globals.css`
- Add Material Symbols font variation settings:
  ```css
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  ```
- Add body min-height:
  ```css
  body {
    min-height: max(884px, 100dvh);
  }
  ```

### `layout.tsx`
- Add Material Symbols Outlined font link:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  ```

---

## 14. Implementation Checklist

- [ ] Add Material Symbols Outlined to `layout.tsx`
- [ ] Add font variation settings to `globals.css`
- [ ] Replace BalanceCard icons with Material Symbols
- [ ] Add bottom navigation shadow
- [ ] Implement transaction type styling (income/expense)
- [ ] Implement transaction category icon/color mapping
- [ ] Fix TransactionList header spacing (`pt-6`)
- [ ] Fix "See All" font size (`text-sm`)
- [ ] Add section title tracking (`tracking-[-0.015em]`)
- [ ] Add body min-height constraint
- [ ] Consider adding user avatar image support

---

## 15. Conclusion

The current dashboard implementation is **structurally sound** and **functionally complete**, but requires **visual refinement** to match the reference design exactly. The most critical gaps are:

1. **Icon system consistency** (Lucide → Material Symbols)
2. **Transaction type differentiation** (income vs expense styling)
3. **Bottom navigation elevation** (missing shadow)

Once these three items are addressed, the implementation will be **95%+ visually identical** to the reference design. The remaining gaps are minor typography and spacing refinements that contribute to pixel-perfect polish but don't significantly impact user experience.
