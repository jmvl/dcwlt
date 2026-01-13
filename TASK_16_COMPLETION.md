# Task 16 Completion Guide

## Status: API Service Created ✅ | Dashboard Update Pending ⏳

### What Was Done ✅

1. Created `event-wallet/src/services/api.ts` - Complete API service with:
   - `topUpWallet()` - Calls backend /api/topup endpoint
   - `checkBackendHealth()` - Health check endpoint
   - `getBackendStatus()` - Service status endpoint
   - TypeScript interfaces for type safety
   - Error handling and logging

2. Created `event-wallet/TASK_16_API_INTEGRATION.patch` - Patch to update DashboardScreen

3. Committed API service to git

### Manual Steps Required 🔧

**Step 1: Apply the patch to DashboardScreen**

```bash
cd /Users/jm/Codebase/dcwlt/event-wallet
patch -p0 < TASK_16_API_INTEGRATION.patch
```

**Step 2: Or manually update DashboardScreen.tsx**

Add import (after line 8):
```typescript
import { topUpWallet } from '../services/api';
```

Replace `handleSimulateTopUp` function (lines 56-62) with:
```typescript
const handleSimulateTopUp = async () => {
  if (!walletAddress) {
    Alert.alert('Error', 'Wallet not connected');
    return;
  }

  try {
    // Show loading state
    Alert.alert('Top-Up', 'Transferring 50 Event Tokens from bank wallet...');

    const result = await topUpWallet(walletAddress, 50);

    if (result.success) {
      Alert.alert(
        '✅ Top-Up Successful!',
        `Sent ${result.amount} Event Tokens\n\nSignature: ${result.signature?.slice(0, 8)}...`,
        [
          { text: 'View on Explorer', onPress: () => result.explorerUrl && console.log('Open:', result.explorerUrl) },
          { text: 'OK', onPress: () => {
            // Refresh balance after 3 seconds to allow transaction to confirm
            setTimeout(() => fetchBalance(), 3000);
          }}
        ]
      );
    } else {
      Alert.alert('❌ Top-Up Failed', result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Top-up error:', error);
    Alert.alert('❌ Top-Up Failed', error instanceof Error ? error.message : 'Unknown error');
  }
};
```

**Step 3: Commit the changes**

```bash
git add src/screens/DashboardScreen.tsx
git commit -m "feat: integrate backend top-up API with Dashboard"
```

### How It Works

1. User taps "Simulate Top Up" button
2. DashboardScreen calls `topUpWallet(walletAddress, 50)`
3. API service makes POST request to `http://localhost:3000/api/topup`
4. Backend loads bank wallet and creates token transfer
5. Backend signs and sends transaction to Solana Devnet
6. Returns transaction signature to app
7. App shows success alert and refreshes balance after 3 seconds

### Testing

**Prerequisites:**
- Backend server must be running on port 3000
- Bank wallet must be configured in backend/.env
- Token address must be set in backend/.env

**Test the flow:**
1. Start backend: `cd backend && npm run dev`
2. Run app on Android device/emulator
3. Login and tap "Simulate Top Up"
4. Should see success alert with transaction signature
5. Balance should update after ~3 seconds

### Files Modified This Task

| File | Action | Description |
|------|--------|-------------|
| src/services/api.ts | Created | API service for backend integration |
| TASK_16_API_INTEGRATION.patch | Created | Patch for DashboardScreen update |
| src/screens/DashboardScreen.tsx | Pending | Needs patch application or manual edit |

### Next Task (Task 17)

After Task 16 is complete, Task 17 will create the merchant QR generator web page.

### Integration Complete ✅

Once Task 16 is finished:
- Mobile app can call backend for top-ups
- Backend transfers tokens from bank wallet
- Balance updates automatically after top-up
- Transaction visible on Solana explorer

This completes the **Top-Up Flow**: User → Mobile App → Backend → Solana Devnet → Balance Update
