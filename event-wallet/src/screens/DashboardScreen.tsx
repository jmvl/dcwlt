import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
// CRITICAL: Lazy-load @solana/web3.js to avoid Buffer access during module evaluation
// import { Connection, PublicKey } from '@solana/web3.js';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TOKEN_ADDRESS, SOLANA_DEVNET_RPC } from '../config/constants';
import { topUpWallet, TopUpResponse, checkBackendHealth } from '../services/api';
import { Toast, ToastType } from '../components/Toast';

type DashboardScreenProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenProp>();
  const { walletAddress, logout } = useWeb3Auth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  const fetchBalance = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      // Lazy-load Solana SDK to avoid Buffer initialization issues
      const solanaWeb3 = await import('@solana/web3.js');
      const connection = new solanaWeb3.Connection(SOLANA_DEVNET_RPC, 'confirmed');

      if (TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS_HERE') {
        console.warn('Token address not configured. Update src/config/constants.ts');
        setBalance(0);
        if (showRefreshIndicator) {
          showToast('Token address not configured in constants.ts', 'warning');
        }
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const tokenMint = new solanaWeb3.PublicKey(TOKEN_ADDRESS);

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new solanaWeb3.PublicKey(walletAddress!),
        { mint: tokenMint }
      );

      if (tokenAccounts.value.length > 0) {
        const accountData = tokenAccounts.value[0].account.data.parsed;
        const balanceAmount = accountData.info.tokenAmount.amount;
        setBalance(parseFloat(balanceAmount) / 1e9);
      } else {
        setBalance(0);
      }

      if (showRefreshIndicator) {
        showToast('Balance refreshed successfully', 'success');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Provide specific error feedback
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        showToast('Network error. Check your connection.', 'error');
      } else if (errorMessage.includes('timeout')) {
        showToast('Request timed out. Try again.', 'error');
      } else {
        showToast('Failed to fetch balance', 'error');
      }

      // Still allow UI to function even if balance fetch fails
      setBalance(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSimulateTopUp = async () => {
    if (!walletAddress) {
      Alert.alert(
        'Wallet Error',
        'No wallet address found. Please log in again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login Again', onPress: () => logout() }
        ]
      );
      return;
    }

    if (TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS_HERE') {
      Alert.alert(
        '⚠️ Configuration Required',
        'The Event Token address has not been configured.\n\nTo use this feature, update src/config/constants.ts with your token address from the Solana Devnet deployment.',
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'Learn More',
            onPress: () => {
              Alert.alert(
                'How to Configure',
                '1. Run: spl-token create-token\n2. Copy the token address\n3. Paste it in src/config/constants.ts\n4. Rebuild the app',
                [{ text: 'Got it' }]
              );
            }
          }
        ]
      );
      return;
    }

    setIsToppingUp(true);
    showToast('Connecting to backend...', 'info');

    try {
      // First check if backend is healthy
      const health = await checkBackendHealth();

      if (!health) {
        Alert.alert(
          '⚠️ Backend Unavailable',
          'The backend service is not running or cannot be reached.\n\nPlease ensure the backend server is running on localhost:3000',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Retry',
              onPress: () => handleSimulateTopUp()
            }
          ]
        );
        setIsToppingUp(false);
        return;
      }

      // Check if bank wallet is configured
      if (!health.bankWalletConfigured) {
        Alert.alert(
          '⚠️ Bank Wallet Not Configured',
          'The backend bank wallet has not been set up.\n\nPlease run the blockchain setup scripts to create and fund the bank wallet.',
          [{ text: 'OK' }]
        );
        setIsToppingUp(false);
        return;
      }

      showToast('Processing top-up...', 'info');

      const result: TopUpResponse = await topUpWallet(walletAddress, 50);

      if (result.success) {
        showToast('Top-up successful!', 'success');

        Alert.alert(
          '✅ Top-Up Successful',
          `Successfully sent 50 Event Tokens to your wallet.\n\nTransaction: ${result.signature?.slice(0, 8)}...${result.signature?.slice(-8)}`,
          [
            {
              text: 'View on Explorer',
              onPress: () => {
                if (result.explorerUrl) {
                  console.log('Transaction URL:', result.explorerUrl);
                  // In a real app, you would open this in a browser
                  showToast('Explorer URL logged to console', 'info');
                }
              }
            },
            {
              text: 'Refresh Balance',
              onPress: () => fetchBalance(true)
            },
            { text: 'OK' }
          ]
        );
      } else {
        showToast('Top-up failed', 'error');

        // Provide specific error messages
        let errorMessage = result.error || 'Failed to transfer tokens.';

        if (errorMessage.includes('insufficient')) {
          errorMessage = 'The bank wallet has insufficient tokens. Please fund the bank wallet on Solana Devnet.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'The request timed out. The Solana network may be congested. Please try again.';
        }

        Alert.alert(
          '❌ Top-Up Failed',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Retry',
              onPress: () => handleSimulateTopUp()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Top-up error:', error);
      showToast('Connection error', 'error');

      Alert.alert(
        '⚠️ Connection Error',
        'Could not connect to the backend service.\n\nPlease ensure:\n• Backend server is running on port 3000\n• You\'re connected to the internet\n• Firewall is not blocking the connection',
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => handleSimulateTopUp()
          }
        ]
      );
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleScanToPay = () => {
    navigation.navigate('QRScanner' as never);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Event Tokens Balance</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} EVT</Text>
        )}
        <Text style={styles.balanceNote}>Devnet tokens - no real value</Text>
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <Text style={styles.addressText}>{walletAddress ? formatAddress(walletAddress) : 'Loading...'}</Text>
        {TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS_HERE' && (
          <Text style={styles.warningText}>⚠️ Token address not configured</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.topUpButton}
        onPress={handleSimulateTopUp}
        disabled={isToppingUp}
      >
        {isToppingUp ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <>
            <Text style={styles.topUpButtonText}>💰 Simulate Top Up</Text>
            <Text style={styles.topUpButtonSubtext}>Get 50 Event Tokens</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanToPay}>
        <Text style={styles.scanButtonText}>📷 Scan to Pay</Text>
        <Text style={styles.scanButtonSubtext}>Pay at merchant terminal</Text>
      </TouchableOpacity>

      {/* Toast notification for user feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHidden={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    color: '#9945FF',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#9945FF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  balanceNote: {
    color: '#fff',
    fontSize: 11,
    marginTop: 8,
    opacity: 0.7,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 11,
    color: '#FF6B6B',
    marginTop: 8,
  },
  topUpButton: {
    backgroundColor: '#14F195',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  topUpButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topUpButtonSubtext: {
    color: '#000',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  scanButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9945FF',
  },
  scanButtonText: {
    color: '#9945FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButtonSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
});
