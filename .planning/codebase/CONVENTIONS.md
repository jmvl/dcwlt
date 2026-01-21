# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**
- TypeScript/TSX: PascalCase for components (`DashboardScreen.tsx`, `Web3AuthContext.tsx`)
- TypeScript: camelCase for utilities/services (`api.ts`, `solana.ts`)
- Test files: Same name as source with `.test.ts` or `.test.js` suffix (`topup.test.ts`)
- Configuration: lowercase with dots (`tsconfig.json`, `.env`, `jest.config.js`)

**Functions:**
- camelCase for all functions (`fetchBalance`, `handleSimulateTopUp`, `deriveSolanaAddress`)
- Async functions use descriptive names with async prefix implied by `async` keyword
- Event handlers prefixed with `handle` (`handleSolanaPayURL`, `handleReset`)

**Variables:**
- camelCase for all variables (`walletAddress`, `isToppingUp`, `tokenMint`)
- Constants: UPPER_SNAKE_CASE for global constants (`TOKEN_ADDRESS`, `SOLANA_DEVNET_RPC`, `TOPUP_AMOUNT`)
- React state: Use `is` prefix for booleans (`isLoggedIn`, `isLoading`, `isRefreshing`)
- Component props: PascalCase interface names matching component (`ToastProps`, `Web3AuthContextType`)

**Types:**
- PascalCase for interfaces and types (`RootStackParamList`, `ToastType`, `TopUpResponse`)
- Union types use PascalCase (`'success' | 'error' | 'warning' | 'info'`)
- Generic parameters: Single letter uppercase (`T`, `K`, `V`) or descriptive (`TResponse`)

## Code Style

**Formatting:**
- No formal formatter detected (no Prettier/ESLint configs)
- Indentation: 2 spaces (inferred from codebase)
- Trailing commas: Used in multi-line arrays/objects
- Semicolons: Used consistently

**TypeScript Configuration:**
- `strict: true` enabled in all projects
- `esModuleInterop: true` for CommonJS interop
- `skipLibCheck: true` to skip type checking of declarations
- `forceConsistentCasingInFileNames: true` enforced
- Backend/merchant target: `ES2020`
- Mobile extends: `expo/tsconfig.base`

**Linting:**
- No ESLint configuration detected
- No enforced linting rules

## Import Organization

**Order:**
1. React and core framework imports
2. Third-party library imports (alphabetical by source)
3. Local imports (relative paths)
4. Type-only imports (where used)

**Pattern examples:**
```typescript
// From backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import fs from 'fs';
```

**Path Aliases:**
- No path aliases configured
- All imports use relative paths (`../contexts/Web3AuthContext`)
- Expo uses implicit module resolution

**React Native Critical Pattern - Lazy Loading:**
```typescript
// CRITICAL: Do NOT import Web3Auth or SolanaPrivateKeyProvider at the top level!
// This causes Buffer to be accessed before polyfills are ready.
// Instead, we lazy-load them when needed.

// BAD:
// import { Keypair } from '@solana/web3.js';

// GOOD:
const { Keypair } = await import('@solana/web3.js');
```

## Error Handling

**Patterns:**
- Try-catch blocks for all async operations
- Specific error type checking: `error instanceof Error`
- Error message extraction: `error.message || 'Unknown error'`
- Graceful degradation: UI continues functioning even on non-critical errors

**API Error Handling:**
```typescript
// From event-wallet/src/services/api.ts
try {
  const response = await fetch(`${API_BASE}/api/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || `HTTP ${response.status}: ${response.statusText}`,
    };
  }

  return data;
} catch (error) {
  console.error('Top-up API error:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Failed to connect to backend',
  };
}
```

**Express Error Handling:**
```typescript
// From backend/src/server.ts
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

**Validation Pattern:**
```typescript
// Input validation with early returns
if (!walletAddress) {
  return res.status(400).json({
    success: false,
    error: 'walletAddress is required'
  });
}

// Type validation
const topUpAmount = parseInt(amount);
if (isNaN(topUpAmount) || topUpAmount <= 0) {
  return res.status(400).json({
    success: false,
    error: 'Amount must be a positive number'
  });
}
```

## Logging

**Framework:** `console` (no structured logging library)

**Patterns:**
- **Info logs:** `console.log()` with emoji prefixes for visual scanning
- **Error logs:** `console.error()` for errors and failures
- **Development logs:** Conditional logging based on `__DEV__` in React Native

**Log Prefix Conventions:**
```typescript
// Success/completion
console.log('✅ Top-up successful:', signature);

// Errors
console.error('❌ Top-up error:', error);

// Warnings
console.warn('Token address not configured. Update src/config/constants.ts');

// Information with context
console.log('📝 Processing top-up:', topUpAmount, 'EVT to', walletAddress);
console.log('⏳ Waiting for confirmation...');

// Debug/state changes
console.log('Web3Auth login: State updated - isLoggedIn = true');
```

**Structured Logging in Tests:**
```typescript
// Test setup logging
console.log('Test Setup:');
console.log('  Bank Wallet:', bankWallet.publicKey.toBase58());
console.log('  Token Mint:', tokenMint.toBase58());
console.log('  Test Wallet:', testWallet.publicKey.toBase58());

// Test progress
console.log('\n[Test] Testing top-up to wallet with no ATA');
console.log('  Wallet:', freshWallet.publicKey.toBase58());
```

## Comments

**When to Comment:**
- CRITICAL/IMPORTANT warnings for breaking changes
- Implementation explanations for non-obvious code
- JSDoc for exported functions and complex interfaces
- TODO markers for incomplete functionality

**Comment Styles:**
```typescript
/**
 * JSDoc style for function documentation
 * Simulate Visa top-up by transferring Event Tokens from bank wallet
 * @param walletAddress - User's Solana wallet address
 * @param amount - Amount of tokens to transfer (default: 50)
 * @returns Promise with top-up result
 */
export async function topUpWallet(
  walletAddress: string,
  amount: number = 50
): Promise<TopUpResponse>

// Single-line for context
// CRITICAL: Lazy-load @solana/web3.js to avoid Buffer access during module evaluation

// Section organization
// Rate limiting configuration
// Disable rate limiting during tests
```

**JSDoc/TSDoc:**
- Used for exported functions in utility modules
- Used for complex interfaces
- Includes parameter types and return types
- Not used extensively in React components (props are self-documenting)

## Function Design

**Size:** No strict limits, but observed patterns:
- Utility functions: 10-50 lines
- Express route handlers: 50-150 lines
- React components: 100-400 lines (large due to styles and error handling)
- Test cases: 20-100 lines per test

**Parameters:**
- Prefer objects with named properties for 3+ parameters
- Use TypeScript interfaces for parameter objects
- Destructuring in function signatures for clarity

```typescript
// Good: Destructured parameters
export async function topUpWallet(
  walletAddress: string,
  amount: number = 50
): Promise<TopUpResponse>

// Good: Object parameters for complex data
function generateSolanaPayURL(recipient: string, amount: number, splToken: string): string
```

**Return Values:**
- Always type return values with TypeScript
- Use union types for error/success patterns
- API functions return response objects with `success: boolean`
- Async functions always return `Promise<T>`

```typescript
// API response pattern
export interface TopUpResponse {
  success: boolean;
  signature?: string;
  amount?: number;
  message?: string;
  explorerUrl?: string;
  error?: string;
}
```

## Module Design

**Exports:**
- Default exports: React components, main app instances
- Named exports: Utility functions, constants, types
- Re-exports: barrel files not used

**Backend Pattern:**
```typescript
// Export app for testing
export { app };

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
  });
}
```

**React Context Pattern:**
```typescript
// Export context and provider
export function Web3AuthProvider({ children }: { children: React.ReactNode }) { }
export function useWeb3Auth() {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within Web3AuthProvider');
  }
  return context;
}
```

**Barrel Files:**
- Not used in this codebase
- Each file imports explicitly from source location

## React-Specific Conventions

**Component Structure:**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Types/Interfaces
type DashboardScreenProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

// 3. Component function
export function DashboardScreen() {
  // 4. Hooks (useState, useEffect, useContext)
  const [balance, setBalance] = useState<number>(0);

  // 5. Callback functions
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  // 6. useEffect hooks
  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  // 7. Event handlers
  const handleSimulateTopUp = async () => { };

  // 8. Helper functions
  const formatAddress = (address: string) => { };

  // 9. Render return
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
}

// 10. Styles (last, after component)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});
```

**Hook Rules:**
- All hooks declared at top of component function
- Custom hooks use `use` prefix (`useWeb3Auth`, `useCameraDevice`)
- Callback hooks used for event handlers to prevent re-renders
- Effect hooks have proper dependencies arrays

**State Management:**
- Local component state with `useState`
- Context API for global state (`Web3AuthContext`)
- No Redux/Zustand detected
- AsyncStorage for persistence in React Native

## Environment Configuration

**Environment Variables:**
- `.env` files for each service
- `dotenv.config()` called at entry point
- Required vars validated at startup
- Fallback defaults provided where safe

```typescript
// Pattern: Parse with fallback
const RATE_LIMIT_TOPUP_MAX = parseInt(process.env.RATE_LIMIT_TOPUP_MAX || '10', 10);
const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Pattern: Validate required vars
if (!walletPath) {
  throw new Error('BANK_WALLET_PATH not set in .env');
}
```

**Test Environment:**
- `NODE_ENV=test` set in test setup
- Rate limiting disabled during tests
- Separate test configuration in Jest

## Async/Await Patterns

**Always use async/await:**
- Never use Promise chains (`.then().catch()`)
- Async functions marked with `async` keyword
- All awaited calls in try-catch blocks

```typescript
// Good: async/await with try-catch
const fetchBalance = async () => {
  try {
    const solanaWeb3 = await import('@solana/web3.js');
    const connection = new solanaWeb3.Connection(SOLANA_DEVNET_RPC, 'confirmed');
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(/* ... */);
    setBalance(parseFloat(balanceAmount) / 1e9);
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
};
```

## Security Patterns

**Input Validation:**
- All user inputs validated before processing
- Type checking with `parseInt()` and `isNaN()`
- Range validation (positive numbers, non-empty strings)

**Secrets Management:**
- No secrets in code
- `.env` files in `.gitignore`
- `.env.example` files show required variables
- Wallet keys loaded from files, not hardcoded

**Rate Limiting:**
- Strict rate limits on sensitive endpoints (10/minute for top-up)
- Lenient limits on health/status endpoints (60/minute)
- Rate limiting disabled during tests via `NODE_ENV=test`

**CORS:**
- Backend uses `cors()` middleware
- No CORS configuration visible (uses defaults)

---

*Convention analysis: 2026-01-16*
