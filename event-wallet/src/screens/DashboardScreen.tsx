import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWeb3Auth } from '../contexts/Web3AuthContext';
import { Connection, PublicKey } from '@solana/web3.js';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TOKEN_ADDRESS, SOLANA_DEVNET_RPC } from '../config/constants';
import { topUpWallet, TopUpResponse } from '../services/api';

type DashboardScreenProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenProp>();
  const { walletAddress, logout } = useWeb3Auth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  const fetchBalance = async () => {
    try {
      const connection = new Connection(SOLANA_DEVNET_RPC);

      if (TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS_HERE') {
        console.warn('Token address not configured. Update src/config/constants.ts');
        setBalance(0);
        setIsLoading(false);
        return;
      }

      const tokenMint = new PublicKey(TOKEN_ADDRESS);

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(walletAddress!),
        { mint: tokenMint }
      );

      if (tokenAccounts.value.length > 0) {
        const accountData = tokenAccounts.value[0].account.data.parsed;
        const balanceAmount = accountData.info.tokenAmount.amount;
        setBalance(parseFloat(balanceAmount) / 1e9);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTopUp = async () => {
    if (!walletAddress) {
      Alert.alert('Error', 'Wallet not available. Please login again.');
      return;
    }

    if (TOKEN_ADDRESS === 'YOUR_TOKEN_ADDRESS_HERE') {
      Alert.alert(
        'Configuration Required',
        'Token address not configured. Please update src/config/constants.ts with your token address.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsToppingUp(true);

    try {
      const result: TopUpResponse = await topUpWallet(walletAddress, 50);

      if (result.success) {
        Alert.alert(
          'Top-Up Successful!',
          `Sent 50 Event Tokens to your wallet.\n\nSignature: ${result.signature?.slice(0, 8)}...`,
          [
            { text: 'View Transaction', onPress: () => {
                if (result.explorerUrl) {
                  console.log('Transaction:', result.explorerUrl);
                }
              }},
            { text: 'OK', onPress: () => fetchBalance() }
          ]
        );
      } else {
        Alert.alert(
          'Top-Up Failed',
          result.error || 'Failed to transfer tokens. Please check backend connection.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Top-Up Error',
        'Failed to connect to backend. Ensure backend is running on localhost:3000',
        [{ text: 'OK' }]
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
