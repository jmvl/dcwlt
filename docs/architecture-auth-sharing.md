# Authentication and Data Architecture

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Status:** Active Architecture Decision

## Overview

This document explains the shared authentication and data architecture for the DCWLT platform, supporting multiple user types (users, merchants, admins) through a single Privy application and Convex deployment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                               │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐           │
│  │  User App    │  │ Merchant App  │  │  Admin App   │           │
│  │  (/)         │  │ (/merchant/*) │  │  (/admin/*)  │           │
│  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼───────────────────┼───────────────────┘
          │                  │                   │
          └──────────────────┼───────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION LAYER                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              SINGLE PRIVY APP ID                                │ │
│  │        cmkh3fr2o056pl40cv2gaolid                               │ │
│  │                                                                │ │
│  │  • Google/Apple OAuth                                          │ │
│  │  • Embedded Solana Wallet Generation                           │ │
│  │  • Same login flow for all user types                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │           SINGLE CONVEX DEPLOYMENT                             │ │
│  │        cool-flamingo-776.convex.cloud                          │ │
│  │                                                                │ │
│  │  Database Schema (All Shared):                                │ │
│  │  ┌─────────────┐     ┌──────────────┐                        │ │
│  │  │   users     │◄───►│ transactions  │                        │ │
│  │  └─────────────┘     └──────────────┘                        │ │
│  │         ▲                    ▲                                │ │
│  │         │                    │                                │ │
│  │  ┌──────┴──────┐     ┌──────┴─────────┐                     │ │
│  │  │  merchants  │◄───►│ merchantEvents │                      │ │
│  │  └─────────────┘     └────────────────┘                     │ │
│  │         ▲                                                    │ │
│  │         │                                                    │ │
│  │  ┌──────┴─────────┐                                          │ │
│  │  │   inventory    │                                          │ │
│  │  └────────────────┘                                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## User Type Determination

User types are **NOT** determined by Privy app ID or authentication method. Instead, they are determined by **application logic** based on email address and database records:

| User Type | Determination Logic | Route Prefix | Database Check |
|-----------|-------------------|--------------|----------------|
| **User** | Default (everyone) | `/` | `users` table exists |
| **Merchant** | Email in `merchants` table | `/merchant/*` | `merchants.status = 'approved'` |
| **Admin** | Email domain `@dcwlt.com` | `/admin/*` | Domain check in components |

### Authentication Flow

1. **Login**: All users log in through the same Privy OAuth flow
2. **Wallet Creation**: Privy creates embedded Solana wallet for all users
3. **Routing**: After login, app checks user type and routes appropriately:
   - Merchant with `status='approved'` → `/merchant` dashboard
   - Email `@dcwlt.com` → `/admin` dashboard
   - Everyone else → `/` user dashboard
4. **Authorization**: Each route's auth provider validates access:
   - `MerchantAuthProvider`: Checks `merchants` table and status
   - Admin pages: Check email domain `@dcwlt.com`
   - User pages: No special requirements

## Why Single Privy App

### Benefits

1. **Unified Wallet Experience**
   - Same wallet address across all contexts
   - Merchants can also be users (buy tickets for other events)
   - No confusion about "which wallet am I using?"

2. **Cross-User-Type Functionality**
   - A merchant account holder can purchase from other merchants
   - Admins can test user flows without separate accounts
   - Seamless switching between contexts

3. **Simplified Management**
   - One Privy dashboard to monitor
   - Single set of API keys and configuration
   - Unified analytics and user insights

4. **Consistent Authentication**
   - Same OAuth providers for everyone
   - Consistent login experience
   - Easier testing and debugging

## Why Single Convex Deployment

### Data Relationships Require Unity

All data is interconnected and must remain in a single deployment:

```
users ──purchase from──► merchants
  │                         │
  └─────transactions────────┘
           │
           ▼
    merchantEvents
           │
           ▼
       inventory
```

**If Convex were split:**
- ❌ Users couldn't purchase from merchants (different databases)
- ❌ Merchants couldn't see sales transactions
- ❌ Admins couldn't manage the platform
- ❌ Events and inventory would be disconnected
- ❌ Wallet balances would be inconsistent

### Benefits of Single Convex

1. **Data Consistency**
   - Single source of truth
   - Real-time updates across all user types
   - ACID transactions for critical operations

2. **Simplified Backend**
   - One deployment to manage
   - Single set of functions and queries
   - Unified error handling and logging

3. **Cross-Context Queries**
   - Admin can query merchant data
   - Merchants can query their own transactions
   - Users can query their purchase history
   - All from the same database

## Potential Frontend App Splitting

While authentication and data remain unified, the **frontend codebase** could be split for deployment independence:

### Current State

```
pwa/ (Single Next.js App)
├── app/
│   ├── (user routes)
│   ├── merchant/ (merchant routes)
│   └── admin/ (admin routes)
└── All share:
    ├── Same Privy App ID
    ├── Same Convex deployment
    └── Same authentication utils
```

### Possible Future State

```
pwa-user/          pwa-merchant/       pwa-admin/
├── app/           ├── app/            ├── app/
└── connects to ───┴── connects to ────┴── connects to ──►
     SAME PRIVY          SAME CONVEX
     SAME WALLET         SAME DATA
```

**What changes with frontend split:**
- Separate Next.js deployments (independent scaling)
- Smaller bundle sizes per app
- Different deployment cadences
- App-specific optimizations

**What stays the same:**
- Single Privy App ID (`cmkh3fr2o056pl40cv2gaolid`)
- Single Convex Deployment (`cool-flamingo-776.convex.cloud`)
- Shared authentication utilities
- Unified database schema
- Same wallet addresses for all contexts

## Authentication Providers

Each user type has its own auth provider for validation:

### MerchantAuthProvider

**Location:** `app/components/MerchantAuthProvider.tsx`

**Validates:**
- User is authenticated via Privy
- Email exists in `merchants` table
- `merchant.status === 'approved'`

**Redirects:**
- Not authenticated → `/merchant/login`
- Account not found → Error screen with registration link
- Status pending → Error message
- Status rejected → Error message

### Admin Authentication

**Location:** Admin pages check `@dcwlt.com` domain

**Validates:**
- User is authenticated via Privy
- Email ends with `@dcwlt.com`

**Redirects:**
- Not authenticated → `/admin`
- Not @dcwlt.com → Home page

### User Authentication

**Location:** Standard Privy auth via `usePrivyAuth` hook

**Validates:**
- User is authenticated via Privy
- No additional checks required

**Redirects:**
- Not authenticated → Home page (login option available)

## Logout Behavior

**Current Implementation:**

| User Type | Logout Destination | Storage Cleared |
|-----------|-------------------|-----------------|
| User | `/` (home) | Privy + DCWLT session |
| Merchant | `/merchant/login` | Privy + DCWLT session |
| Admin | `/admin` | Privy + DCWLT session |

**Logout Method:**
- Hard refresh via `window.location.href` (not Next.js router)
- Clears all React state and component memory
- Clears Privy data from localStorage/sessionStorage
- Clears DCWLT session storage

## Important Considerations

### Merchants Are Users Too

A merchant account holder:
- Has a merchant record in the database
- Gets merchant dashboard access
- Can still access user features (buy from other merchants)
- Uses the same wallet for both contexts

### Email as Primary Identifier

Email address is the key identifier across all user types:
- Privy provides email after OAuth
- All database lookups use email
- Email domain determines admin access
- Email links merchant applications to accounts

### Wallet Consistency

Because we use a single Privy app:
- Each email gets exactly one Solana wallet
- Wallet address persists across user type contexts
- No wallet switching or confusion
- Consistent balance tracking

## Migration Notes

**If splitting frontend apps in the future:**

1. **Keep same Privy App ID** - Copy `NEXT_PUBLIC_PRIVY_APP_ID` to all apps
2. **Keep same Convex URL** - Copy `NEXT_PUBLIC_CONVEX_URL` to all apps
3. **Share authentication utilities** - Common logout, session management
4. **Test cross-app flows** - Ensure wallet works across all contexts
5. **Update CORS settings** - Add all frontend domains to Convex allowlist

**DO NOT:**
- ❌ Create separate Privy apps for each user type
- ❌ Split Convex deployments (breaks data relationships)
- ❌ Use different wallet addresses for different user types
- ❌ Implement separate authentication mechanisms

## Related Documentation

- [Convex Schema](../convex/schema.ts) - Database schema and relationships
- [Privy Configuration](../pwa/.env.local.example) - Environment variable template
- [Logout Utilities](../pwa/app/utils/logout.ts) - Shared logout logic
- [Merchant Auth Provider](../pwa/app/components/MerchantAuthProvider.tsx) - Merchant validation logic

## Decision Record

**Decision:** Use single Privy app and single Convex deployment for all user types
**Made:** 2026-01-19
**Reasoning:** Data integrity, unified wallet, simplified management, cross-user-type functionality
**Alternatives Considered:**
- Separate Privy apps (rejected: breaks wallet consistency)
- Separate Convex deployments (rejected: breaks data relationships)
- Separate authentication systems (rejected: unnecessary complexity)

**Status:** Active - confirmed as correct architecture approach
