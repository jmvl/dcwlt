# Task 16: Integrate Top-Up API with Mobile App

## Status: Code Complete, Needs Import Fix in DashboardScreen

### What Was Done ✅

Created `event-wallet/src/services/api.ts` with:
- `topUpWallet()` function - calls backend /api/topup endpoint
- `checkBackendHealth()` function - health check
- `getBackendStatus()` function - service status
- TypeScript interfaces for responses
- Error handling for network issues

### What Needs To Be Done 🔧

**Update DashboardScreen.tsx to use the API:**

1. **Add the import** (after line 8):
```typescript
import { topUpWallet } from '../services/api';
```

2. **Replace handleSimulateTopUp function** (lines 56-62):
```typescript
const handleSimulateTopUp = async () => {
  if (!walletAddress) {
    Alert.alert('Error', 'Wallet not connected');
    return;
  }

  // Show loading indicator
  Alert.alert(
    'Top-Up',
    'Transferring 50 Event Tokens from bank wallet...\n\nPlease wait.',
    [{ text: 'OK', onPress: () => {} }],
    { cancelable: true }
  );

  try {
    const result = await topUpWallet(walletAddress, 50);

    if (result.success) {
      Alert.alert(
        '✅ Top-Up Successful!',
        `Sent ${result.amount} Event Tokens!\n\nSignature: ${result.signature?.slice(0, 8)}...`,
        [
          {
            text: 'View on Explorer',
            onPress: () => {
              if (result.explorerUrl) {
                console.log('Explorer URL:', result.explorerUrl);
              }
            }
          },
          { text: 'OK', onPress: () => fetchBalance() }
        ]
      );
    } else {
      Alert.alert(
        '❌ Top-Up Failed',
        result.error || 'Unknown error occurred',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Top-up error:', error);
    Alert.alert(
      '❌ Top-Up Failed',
      error instanceof Error ? error.message : 'Unknown error',
      [{ text: 'OK' }]
    );
  }
};
```

### Complete Flow

1. User taps "Simulate Top Up" button
2. App checks wallet is connected
3. App calls `topUpWallet(walletAddress, 50)`
4. API service sends POST request to `http://localhost:3000/api/topup`
5. Backend creates and signs Solana transaction
6. Backend returns transaction signature
7. App shows success alert with signature
8. Balance refreshes automatically
9. User sees updated balance (e.g., 0 → 50 EVT)

### Testing

Once backend is running (see `backend/TASK_15_COMPLETION.md`):
1. Start mobile app
2. Login with Gmail
3. Tap "Simulate Top Up"
4. Should see success message
5. Balance should update from 0 to 50 EVT

### Blockers

- Backend must be running on localhost:3000
- Bank wallet must have tokens (see SETUP.md Tasks 1-4)
- Token address must be configured in constants.ts
- Mobile app must be able to reach localhost (may need to use actual IP for Android emulator)

### Files Modified This Task

1. `event-wallet/src/services/api.ts` - Created (97 lines)
2. `event-wallet/src/screens/DashboardScreen.tsx` - Needs manual update (add import + replace function)

### Next Task (Task 17)

Create merchant Express server with QR code generation and web UI.
